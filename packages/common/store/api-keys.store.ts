'use client';
import { ChatMode } from '@repo/shared/config';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const PROVIDER_IDS = {
    MISTRAL: 'mistral',
} as const;

export type ProviderId = (typeof PROVIDER_IDS)[keyof typeof PROVIDER_IDS];

export const PROVIDER_INFO: Record<string, { name: string; url: string }> = {
    [PROVIDER_IDS.MISTRAL]: { name: 'Mistral AI', url: 'https://console.mistral.ai/api-keys' },
};

// Map ChatMode to its required provider
export const CHAT_MODE_PROVIDER: Record<ChatMode, string> = {
    [ChatMode.Deep]: PROVIDER_IDS.MISTRAL,
    [ChatMode.Pro]: PROVIDER_IDS.MISTRAL,
    [ChatMode.MISTRAL_SMALL]: PROVIDER_IDS.MISTRAL,
    [ChatMode.MISTRAL_LARGE]: PROVIDER_IDS.MISTRAL,
    [ChatMode.CODESTRAL]: PROVIDER_IDS.MISTRAL,
    [ChatMode.LOCAL]: '',
};

type ApiKeysState = {
    keys: Record<string, string[]>;
    setKeys: (provider: string, keys: string[]) => void;
    addKey: (provider: string, key: string) => void;
    removeKey: (provider: string, index: number) => void;
    hasApiKeyForChatMode: (chatMode: ChatMode) => boolean;
    getKeys: (provider: string) => string[];
    getAllKeys: () => Record<string, string[]>;
    getFirstKey: (provider: string) => string | undefined;
};

export const useApiKeysStore = create<ApiKeysState>()(
    persist(
        (set, get) => ({
            keys: {},

            setKeys: (provider, keys) =>
                set(state => ({
                    keys: { ...state.keys, [provider]: keys },
                })),

            addKey: (provider, key) =>
                set(state => {
                    const existing = state.keys[provider] || [];
                    if (!existing.includes(key)) {
                        return { keys: { ...state.keys, [provider]: [...existing, key] } };
                    }
                    return state;
                }),

            removeKey: (provider, index) =>
                set(state => {
                    const existing = state.keys[provider] || [];
                    const newKeys = existing.filter((_, i) => i !== index);
                    const newState = { ...state.keys };
                    if (newKeys.length === 0) {
                        delete newState[provider];
                    } else {
                        newState[provider] = newKeys;
                    }
                    return { keys: newState };
                }),

            hasApiKeyForChatMode: (chatMode) => {
                const provider = CHAT_MODE_PROVIDER[chatMode];
                if (!provider) return false;
                const keys = get().keys[provider];
                return !!keys && keys.length > 0 && keys[0].trim().length > 0;
            },

            getKeys: (provider) => {
                return get().keys[provider] || [];
            },

            getAllKeys: () => {
                return get().keys;
            },

            getFirstKey: (provider) => {
                const keys = get().keys[provider];
                if (keys && keys.length > 0) return keys[0];
                return undefined;
            },
        }),
        {
            name: 'api-keys-storage',
            partialize: (state) => ({
                keys: state.keys,
            }),
        }
    )
);
