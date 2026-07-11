'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocalAIStore } from '../store/local-ai.store';

// Module-level singleton: all hook instances share the same engine.
// This is critical — without it, the settings page loads the model into one engine
// instance while the chat area has a different instance that never gets loaded.
let globalEngine: any = null;
let globalLoadPromise: Promise<any> | null = null;

// Type for WebGPU adapter — not globally available in all TS configs
interface WebGPUAdapterResult {
    adapter: any;
    info: { vendor: string; architecture: string; description: string; device: string } | null;
}

/**
 * Attempt to request a WebGPU adapter with the given power preference.
 * Returns the adapter if successful, or null if that preference is unavailable.
 */
async function requestAdapterWithFallback(): Promise<WebGPUAdapterResult | null> {
    const gpu = (navigator as any).gpu;
    if (!gpu) return null;

    try {
        // Step 1: Try high-performance (dedicated GPU) first
        const adapter = await gpu.requestAdapter({ powerPreference: 'high-performance' });
        if (!adapter) {
            // Fallback: try low-power (integrated GPU)
            const fallback = await gpu.requestAdapter({ powerPreference: 'low-power' });
            if (!fallback) return null;
            let info: any = null;
            try { info = fallback.info; } catch { /* info not supported */ }
            return { adapter: fallback, info };
        }

        // Get adapter info to identify the GPU
        let info: any = null;
        try { info = adapter.info; } catch { /* info not supported */ }

        // On some browsers, high-performance still returns the iGPU.
        // We log the GPU name to help with debugging.
        const adapterName = info?.description || info?.vendor || 'unknown GPU';
        console.info('[LocalAI] Adapter requested (high-performance):', adapterName);

        return { adapter, info };
    } catch (err) {
        console.warn('[LocalAI] Error requesting GPU adapter:', err);
        // Final fallback: try without powerPreference
        try {
            const fallback = await gpu.requestAdapter();
            if (!fallback) return null;
            let info: any = null;
            try { info = fallback.info; } catch { /* info not supported */ }
            return { adapter: fallback, info };
        } catch {
            return null;
        }
    }
}

export function useLocalLLM() {
    const store = useLocalAIStore();
    const engineRef = useRef<any>(null);
    const abortRef = useRef<AbortController | null>(null);

    // Sync globalEngine → ref on each render
    engineRef.current = globalEngine;

    const getEngine = useCallback(() => globalEngine, []);

    const loadModel = useCallback(
        async (modelId: string) => {
            const { isLoading, setIsLoading, setError, setIsModelLoaded, setLoadedModelId, setDownloadProgress } = store;

            if (isLoading) {
                if (globalLoadPromise) {
                    await globalLoadPromise;
                    engineRef.current = globalEngine;
                }
                return;
            }

            // If this model is already loaded globally, skip
            if (globalEngine && store.loadedModelId === modelId) {
                setIsModelLoaded(true);
                setDownloadProgress(100);
                return;
            }

            setIsLoading(true);
            setError(null);
            setDownloadProgress(0);

            try {
                // Assign globalLoadPromise IMMEDIATELY by wrapping slow ops in an async IIFE.
                // This eliminates a race: before this fix, there was a window between
                // setIsLoading(true) and globalLoadPromise = ... where a concurrent caller
                // would see isLoading=true, globalLoadPromise=null, and return early
                // without actually waiting for the load to finish.
                globalLoadPromise = (async () => {
                    const { CreateMLCEngine } = await import('@mlc-ai/web-llm');

                    // Check WebGPU availability — prefer dedicated GPU with fallback
                    const adapterResult = await requestAdapterWithFallback();
                    if (!adapterResult) {
                        throw new Error(
                            'WebGPU is not supported on this device. Local AI requires a browser with WebGPU support (Chrome 113+, Edge 113+).'
                        );
                    }

                    const { adapter, info } = adapterResult;

                    // Log GPU info for diagnostics
                    if (info) {
                        console.info('[LocalAI] GPU info:', {
                            vendor: info.vendor,
                            architecture: info.architecture,
                            description: info.description,
                            device: info.device,
                        });
                    }

                    // Check adapter features — some adapters advertise WebGPU but lack required features
                    const adapterFeatures = adapter.features as Set<string> | undefined;
                    if (!adapterFeatures) {
                        console.warn('[LocalAI] Adapter features API not available');
                    }

                    // Log adapter limits for debugging resource issues
                    const limits = adapter.limits;
                    if (limits) {
                        console.info('[LocalAI] Adapter limits:', {
                            maxBufferSize: limits.maxBufferSize,
                            maxStorageBufferBindingSize: limits.maxStorageBufferBindingSize,
                            maxComputeWorkgroupStorageSize: limits.maxComputeWorkgroupStorageSize,
                        });
                    }

                    // Estimate available memory via adapter limits
                    const maxBufferSize = limits?.maxBufferSize || 0;
                    // WebGPU doesn't expose VRAM directly, but maxBufferSize gives a clue
                    if (maxBufferSize > 0 && maxBufferSize < 256 * 1024 * 1024) {
                        console.warn('[LocalAI] Very small maxBufferSize — model may fail to load:', maxBufferSize);
                    }

                    return CreateMLCEngine(modelId, {
                        initProgressCallback: (report: any) => {
                            const pct = typeof report === 'number' ? report : report?.progress ?? 0;
                            store.setDownloadProgress(pct * 100);

                            // Log specific milestones for debugging
                            const milestonePct = Math.round(pct * 100);
                            if (milestonePct === 10 || milestonePct === 25 || milestonePct === 50 || milestonePct === 75 || milestonePct === 90) {
                                const text = typeof report === 'string' ? report : report?.text || '';
                                console.info(`[LocalAI] Load progress: ${milestonePct}% — ${text}`);
                            }
                        },
                    });
                })();

                const engine = await globalLoadPromise;
                globalEngine = engine;
                engineRef.current = engine;
                setLoadedModelId(modelId);
                setIsModelLoaded(true);
                setDownloadProgress(100);
                console.info('[LocalAI] Model loaded successfully:', modelId);
            } catch (err: any) {
                const msg = err?.message || 'Failed to load model';

                // Provide more helpful error messages based on the error
                let userMsg = msg;
                if (msg.includes('memory') || msg.includes('alloc') || msg.includes('VRAM') || msg.includes('out of memory')) {
                    userMsg = `Not enough GPU memory to load this model. Try a smaller model like Qwen2 0.5B or Qwen2.5-1.5B. ${msg}`;
                } else if (msg.includes('WebGPU') && msg.includes('not supported')) {
                    userMsg = msg; // Keep the original WebGPU unsupported message
                } else if (msg.includes('NetworkError') || msg.includes('fetch') || msg.includes('404')) {
                    userMsg = `Failed to download model weights. Check your internet connection and try again. Error: ${msg}`;
                } else if (msg.includes('Wasm') || msg.includes('wasm') || msg.includes('compile')) {
                    userMsg = `WebGPU shader compilation failed. Your GPU may not be fully compatible. Error: ${msg}`;
                } else if (msg.includes('device') || msg.includes('GPU')) {
                    userMsg = `GPU error: ${msg}. Try updating your graphics drivers or using a different browser.`;
                }

                console.error('[LocalAI] Model load failed:', err);
                setError(userMsg);
                globalEngine = null;
                engineRef.current = null;
                globalLoadPromise = null;
            } finally {
                setIsLoading(false);
                globalLoadPromise = null;
            }
        },
        [store]
    );

    const unloadModel = useCallback(() => {
        globalEngine = null;
        engineRef.current = null;
        store.setIsModelLoaded(false);
        store.setLoadedModelId(null);
        // Don't remove from downloadedModels — keep cache marker so user can
        // reload without re-downloading (WebLLM keeps the weights in IndexedDB).
        store.setError(null);
        store.setDownloadProgress(0);
        store.setIsLoading(false);
        store.setIsGenerating(false);
        store.resetStreaming();
    }, [store]);

    const generate = useCallback(
        async (messages: { role: string; content: string }[]) => {
            const engine = globalEngine;
            if (!engine) {
                throw new Error('Model not loaded. Please load a model first.');
            }

            abortRef.current = new AbortController();
            store.setIsGenerating(true);
            store.resetStreaming();

            try {
                const chunks: string[] = [];
                const asyncGenerator = await engine.chat.completions.create({
                    messages,
                    stream: true,
                });

                for await (const chunk of asyncGenerator) {
                    // Check if aborted
                    if (abortRef.current?.signal.aborted) {
                        store.setStreaming({ currentText: chunks.join(''), isStreaming: false });
                        return chunks.join('');
                    }

                    const delta = chunk.choices?.[0]?.delta?.content;
                    if (delta) {
                        chunks.push(delta);
                        store.setStreaming({ currentText: chunks.join('') });
                    }
                }

                const fullText = chunks.join('');
                store.setStreaming({ currentText: fullText, isStreaming: false });
                return fullText;
            } catch (err: any) {
                const msg = err?.message || 'Generation failed';
                console.error('[LocalAI] Generation failed:', err);
                store.setStreaming({ error: msg, isStreaming: false });
                throw err;
            } finally {
                store.setIsGenerating(false);
                abortRef.current = null;
            }
        },
        [store]
    );

    const abort = useCallback(() => {
        if (abortRef.current) {
            abortRef.current.abort();
            abortRef.current = null;
        }
        store.setIsGenerating(false);
    }, [store]);

    // Cleanup on unmount — unused since engine is global
    useEffect(() => {
        return () => {
            // Don't unload engine on unmount — it's shared globally
        };
    }, []);

    // Auto-load the previously used model on page refresh so the user doesn't
    // have to manually re-load it. This runs once on mount when:
    //   1. loadedModelId is persisted from a prior session
    //   2. globalEngine is null (module-level var doesn't survive refresh)
    const autoLoadAttempted = useRef(false);
    useEffect(() => {
        if (autoLoadAttempted.current) return;
        if (store.loadedModelId && !globalEngine) {
            autoLoadAttempted.current = true;
            // Reset runtime flags first so the UI shows "loading" state
            store.setIsModelLoaded(false);
            store.setIsLoading(false);
            store.setDownloadProgress(0);
            // Auto-load the model. If it's cached in IndexedDB (previously
            // downloaded), WebLLM will initialize from cache without re-download.
            loadModel(store.loadedModelId);
        }
    }, [store, loadModel]);

    return {
        engine: engineRef.current,
        getEngine,
        loadModel,
        unloadModel,
        generate,
        abort,
        progress: store.downloadProgress,
        isLoaded: store.isModelLoaded,
        isLoading: store.isLoading,
        isGenerating: store.isGenerating,
        error: store.error,
        selectedModelId: store.selectedModelId,
        streaming: store.streaming,
    };
}
