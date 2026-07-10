import { createOpenAI } from '@ai-sdk/openai';
import { LanguageModelV1 } from '@ai-sdk/provider';
import { LanguageModelV1Middleware, wrapLanguageModel } from 'ai';
import { ModelEnum, models } from './models';

export const Providers = {
  MISTRAL: 'mistral',
} as const;

export type ProviderEnumType = (typeof Providers)[keyof typeof Providers];

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
    if (provider === Providers.MISTRAL && process.env.MISTRAL_API_KEY) {
      return process.env.MISTRAL_API_KEY;
    }
  }

  // For browser environments
  if (typeof window !== 'undefined' && window.AI_API_KEYS) {
    return window.AI_API_KEYS[provider] || '';
  }

  return '';
};

// Multi-key fallback: get the next available key for a provider
// This cycles through multiple keys if one fails
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

export const getProviderInstance = (provider: ProviderEnumType) => {
  const apiKey = getApiKey(provider);
  return createOpenAI({
    baseURL: 'https://api.mistral.ai/v1',
    apiKey,
  });
};

export const getLanguageModel = (m: ModelEnum, middleware?: LanguageModelV1Middleware) => {
  const model = models.find(model => model.id === m);
  const instance = getProviderInstance('mistral');
  const selectedModel = instance(model?.id || 'mistral-small-latest');
  if(middleware) {
    return wrapLanguageModel({model: selectedModel, middleware }) as LanguageModelV1;
  }
  return selectedModel as LanguageModelV1;
};
