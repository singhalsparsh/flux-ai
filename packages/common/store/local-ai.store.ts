'use client';
import { LocalModelDefinition, LOCAL_MODELS } from '@repo/shared/config';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface StreamingState {
    isStreaming: boolean;
    currentText: string;
    error: string | null;
}

type LocalAIState = {
    isModelLoaded: boolean;
    isGenerating: boolean;
    isLoading: boolean;
    error: string | null;
    selectedModelId: string | null;
    estimatedRam: number;
    loadedModelId: string | null;
    downloadedModels: string[];
    streaming: StreamingState;
};

type LocalAIActions = {
    setIsModelLoaded: (loaded: boolean) => void;
    setIsGenerating: (generating: boolean) => void;
    setIsLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setSelectedModelId: (id: string | null) => void;
    setEstimatedRam: (ram: number) => void;
    setLoadedModelId: (id: string | null) => void;
    addDownloadedModel: (id: string) => void;
    removeDownloadedModel: (id: string) => void;
    clearDownloadedModels: () => void;
    setStreaming: (state: Partial<StreamingState>) => void;
    resetStreaming: () => void;
    getSelectedModel: () => LocalModelDefinition | undefined;
    getAvailableModels: () => LocalModelDefinition[];
};

export const useLocalAIStore = create<LocalAIState & LocalAIActions>()(
    persist(
        immer((set, get) => ({
            isModelLoaded: false,
            isGenerating: false,
            isLoading: false,
            error: null,
            selectedModelId: null,
            estimatedRam: 0,
            loadedModelId: null,
            downloadedModels: [],
            streaming: {
                isStreaming: false,
                currentText: '',
                error: null,
            },

            setIsModelLoaded: (loaded) =>
                set({ isModelLoaded: loaded }),

            setIsGenerating: (generating) =>
                set({ isGenerating: generating }),

            setIsLoading: (loading) =>
                set({ isLoading: loading }),

            setError: (error) =>
                set({ error }),

            setSelectedModelId: (id) =>
                set({ selectedModelId: id }),

            setEstimatedRam: (ram) =>
                set({ estimatedRam: ram }),

            setLoadedModelId: (id) =>
                set({ loadedModelId: id }),

            addDownloadedModel: (id) =>
                set((state) => {
                    if (!state.downloadedModels.includes(id)) {
                        state.downloadedModels.push(id);
                    }
                }),

            removeDownloadedModel: (id) =>
                set((state) => {
                    state.downloadedModels = state.downloadedModels.filter((m) => m !== id);
                }),

            clearDownloadedModels: () =>
                set({ downloadedModels: [] }),

            setStreaming: (partial) =>
                set((state) => {
                    Object.assign(state.streaming, partial);
                }),

            resetStreaming: () =>
                set({
                    streaming: { isStreaming: false, currentText: '', error: null },
                }),

            getSelectedModel: () => {
                const id = get().selectedModelId;
                if (!id) return undefined;
                return LOCAL_MODELS.find((m) => m.id === id);
            },

            getAvailableModels: () => {
                const ram = get().estimatedRam;
                if (!ram) return LOCAL_MODELS;
                return LOCAL_MODELS.filter((m) => m.ramRequired <= ram);
            },
        })),
        {
            name: 'local-ai-store',
            partialize: (state) => ({
                selectedModelId: state.selectedModelId,
                downloadedModels: state.downloadedModels,
                estimatedRam: state.estimatedRam,
                loadedModelId: state.loadedModelId,
                isModelLoaded: state.isModelLoaded,
            }),
        }
    )
);
