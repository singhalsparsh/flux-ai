'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocalAIStore } from '../store/local-ai.store';

// Module-level singleton: all hook instances share the same engine.
// This is critical — without it, the settings page loads the model into one engine
// instance while the chat area has a different instance that never gets loaded.
let globalEngine: any = null;
let globalLoadPromise: Promise<any> | null = null;

export function useLocalLLM() {
    const store = useLocalAIStore();
    const engineRef = useRef<any>(null);
    const [progress, setProgress] = useState(0);

    // Sync globalEngine → ref on each render
    engineRef.current = globalEngine;

    const getEngine = useCallback(() => globalEngine, []);

    const loadModel = useCallback(
        async (modelId: string) => {
            const { isLoading, setIsLoading, setError, setIsModelLoaded, setLoadedModelId } = store;

            if (isLoading) return;
            setIsLoading(true);
            setError(null);

            // If this model is already loaded globally, skip
            if (globalEngine && store.loadedModelId === modelId) {
                setIsLoading(false);
                setIsModelLoaded(true);
                return;
            }

            try {
                // Dynamically import web-llm
                const { CreateMLCEngine } = await import('@mlc-ai/web-llm');

                // Check WebGPU availability
                const adapter = await (navigator as any).gpu?.requestAdapter();
                if (!adapter) {
                    throw new Error(
                        'WebGPU is not supported on this device. Local AI requires a browser with WebGPU support (Chrome 113+, Edge 113+).'
                    );
                }

                globalLoadPromise = CreateMLCEngine(modelId, {
                    initProgressCallback: (report: any) => {
                        const pct = typeof report === 'number' ? report : report?.progress ?? 0;
                        setProgress(pct * 100);
                    },
                });

                const engine = await globalLoadPromise;
                globalEngine = engine;
                engineRef.current = engine;
                setLoadedModelId(modelId);
                setIsModelLoaded(true);
                setProgress(100);
            } catch (err: any) {
                const msg = err?.message || 'Failed to load model';
                setError(msg);
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
        store.setError(null);
        setProgress(0);
    }, [store]);

    const generate = useCallback(
        async (messages: { role: string; content: string }[]) => {
            const engine = globalEngine;
            if (!engine) {
                throw new Error('Model not loaded. Please load a model first.');
            }

            store.setIsGenerating(true);
            store.resetStreaming();

            try {
                const chunks: string[] = [];
                const asyncGenerator = await engine.chat.completions.create({
                    messages,
                    stream: true,
                });

                for await (const chunk of asyncGenerator) {
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
                store.setStreaming({ error: msg, isStreaming: false });
                throw err;
            } finally {
                store.setIsGenerating(false);
            }
        },
        [store]
    );

    // Cleanup on unmount — unused since engine is global
    useEffect(() => {
        return () => {
            // Don't unload engine on unmount — it's shared globally
        };
    }, []);

    return {
        engine: engineRef.current,
        getEngine,
        loadModel,
        unloadModel,
        generate,
        progress,
        isLoaded: store.isModelLoaded,
        isLoading: store.isLoading,
        isGenerating: store.isGenerating,
        error: store.error,
        selectedModelId: store.selectedModelId,
        streaming: store.streaming,
    };
}
