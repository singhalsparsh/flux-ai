import { createOpenAI, OpenAIProvider } from '@ai-sdk/openai';
import { LanguageModelV2 } from '@ai-sdk/provider';
import { LanguageModelV1Middleware, wrapLanguageModel } from 'ai';
import { ModelEnum, models } from './models';

export const Providers = {
    MISTRAL: 'mistral',
    OPENAI: 'openai',
    ANTHROPIC: 'anthropic',
    GEMINI: 'gemini',
    TOGETHER: 'together',
    FIREWORKS: 'fireworks',
    NVIDIA: 'nvidia',
    DEEPSEEK: 'deepseek',
} as const;

export type ProviderEnumType = (typeof Providers)[keyof typeof Providers];

// Base URLs for OpenAI-compatible providers
const PROVIDER_BASE_URLS: Record<string, string> = {
    [Providers.MISTRAL]: 'https://api.mistral.ai/v1',
    [Providers.OPENAI]: 'https://api.openai.com/v1',
    [Providers.NVIDIA]: 'https://integrate.api.nvidia.com/v1',
    [Providers.DEEPSEEK]: 'https://api.deepseek.com/v1',
    [Providers.TOGETHER]: 'https://api.together.xyz/v1',
    [Providers.FIREWORKS]: 'https://api.fireworks.ai/inference/v1',
};

// Define a global type for API keys with multi-key support
declare global {
    interface Window {
        AI_API_KEYS?: {
            [key: string]: string;
        };
        AI_API_KEYS_ARRAY?: {
            [key: string]: string[];
        };
        SERPER_API_KEY?: string;
        JINA_API_KEY?: string;
        NEXT_PUBLIC_APP_URL?: string;
    }
}

// Helper function to get API key from env or global
const getApiKey = (provider: ProviderEnumType): string => {
    // For server environments
    if (typeof process !== 'undefined' && process.env) {
        const envVar = `${provider.toUpperCase()}_API_KEY`;
        if (process.env[envVar]) {
            return process.env[envVar] as string;
        }
    }

    // For browser environments - check window keys
    if (typeof window !== 'undefined' && window.AI_API_KEYS) {
        return window.AI_API_KEYS[provider] || '';
    }

    // For web worker environments - check globalThis
    if (typeof globalThis !== 'undefined' && (globalThis as any).AI_API_KEYS) {
        return (globalThis as any).AI_API_KEYS[provider] || '';
    }

    return '';
};

// Multi-key fallback: cycles through multiple keys if one fails
let keyIndexMap: Record<string, number> = {};

export const getNextApiKey = (provider: ProviderEnumType): string => {
    // First try env vars
    const envKey = getApiKey(provider);
    if (envKey) return envKey;

    // Then try multi-key arrays from the store
    if (typeof window !== 'undefined' && window.AI_API_KEYS_ARRAY) {
        const keys = window.AI_API_KEYS_ARRAY[provider];
        if (keys && keys.length > 0) {
            const idx = (keyIndexMap[provider] || 0) % keys.length;
            keyIndexMap[provider] = (keyIndexMap[provider] || 0) + 1;
            return keys[idx] || '';
        }
    }

    return envKey;
};

export const resetKeyIndex = (provider: ProviderEnumType) => {
    keyIndexMap[provider] = 0;
};

// Create the appropriate provider instance based on provider type
const createProviderForType = (provider: ProviderEnumType): OpenAIProvider => {
    const apiKey = getApiKey(provider);

    switch (provider) {
        case Providers.ANTHROPIC: {
            // Anthropic uses its own SDK
            return createOpenAI({ baseURL: 'https://api.anthropic.com/v1', apiKey }) as any;
        }
        case Providers.GEMINI: {
            // Gemini uses its own SDK
            return createOpenAI({ baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/', apiKey }) as any;
        }
        case Providers.NVIDIA:
        case Providers.DEEPSEEK:
        case Providers.TOGETHER:
        case Providers.FIREWORKS:
        case Providers.MISTRAL:
        case Providers.OPENAI:
        default: {
            const baseURL = PROVIDER_BASE_URLS[provider];
            if (baseURL) {
                return createOpenAI({ baseURL, apiKey });
            }
            return createOpenAI({ apiKey });
        }
    }
};

export const getProviderInstance = (provider: ProviderEnumType) => {
    return createProviderForType(provider);
};

export const getLanguageModel = (m: ModelEnum, middleware?: LanguageModelV1Middleware) => {
    const model = models.find(model => model.id === m);
    if (!model) return null;

    const instance = getProviderInstance(model.provider);
    const selectedModel = instance(model?.id || 'mistral-small-latest');

    if (middleware) {
        return wrapLanguageModel({ model: selectedModel, middleware }) as unknown as LanguageModelV2;
    }
    return selectedModel as unknown as LanguageModelV2;
};
