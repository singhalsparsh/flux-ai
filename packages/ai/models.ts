import { ChatMode } from '@repo/shared/config';
import { CoreMessage } from 'ai';
import { ProviderEnumType } from './providers';

export enum ModelEnum {
    // Mistral
    Mistral_Small = 'mistral-small-latest',
    Mistral_Large = 'mistral-large-latest',
    Codestral = 'codestral-latest',
    // OpenAI
    GPT_4o_Mini = 'gpt-4o-mini',
    GPT_4o = 'gpt-4o',
    O4_Mini = 'o4-mini',
    // Anthropic
    Claude_3_5_Sonnet = 'claude-3-5-sonnet-20241022',
    Claude_3_7_Sonnet = 'claude-3-7-sonnet-20250219',
    // Google
    Gemini_2_Flash = 'gemini-2.0-flash',
    // DeepSeek
    Deepseek_R1 = 'deepseek-reasoner',
    Deepseek_V3 = 'deepseek-chat',
    // Together
    Llama_4_Scout = 'meta-llama/Llama-4-Scout-17B-16E-Instruct',
    // NVIDIA
    Llama_3_1_NVIDIA = 'nvidia/llama-3.1-nemotron-ultra-253b-v1',
}

export type Model = {
    id: ModelEnum;
    name: string;
    provider: ProviderEnumType;
    maxTokens: number;
    contextWindow: number;
};

export const models: Model[] = [
    // ── Mistral ──────────────────────────────────────────────
    {
        id: ModelEnum.Mistral_Small,
        name: 'Mistral Small',
        provider: 'mistral',
        maxTokens: 32768,
        contextWindow: 32768,
    },
    {
        id: ModelEnum.Mistral_Large,
        name: 'Mistral Large',
        provider: 'mistral',
        maxTokens: 131072,
        contextWindow: 131072,
    },
    {
        id: ModelEnum.Codestral,
        name: 'Codestral',
        provider: 'mistral',
        maxTokens: 32768,
        contextWindow: 32768,
    },
    // ── OpenAI ───────────────────────────────────────────────
    {
        id: ModelEnum.GPT_4o_Mini,
        name: 'GPT-4o Mini',
        provider: 'openai',
        maxTokens: 16384,
        contextWindow: 128000,
    },
    {
        id: ModelEnum.GPT_4o,
        name: 'GPT-4o',
        provider: 'openai',
        maxTokens: 16384,
        contextWindow: 128000,
    },
    {
        id: ModelEnum.O4_Mini,
        name: 'o4-mini',
        provider: 'openai',
        maxTokens: 100000,
        contextWindow: 200000,
    },
    // ── Anthropic ────────────────────────────────────────────
    {
        id: ModelEnum.Claude_3_5_Sonnet,
        name: 'Claude 3.5 Sonnet',
        provider: 'anthropic',
        maxTokens: 8192,
        contextWindow: 200000,
    },
    {
        id: ModelEnum.Claude_3_7_Sonnet,
        name: 'Claude 3.7 Sonnet',
        provider: 'anthropic',
        maxTokens: 8192,
        contextWindow: 200000,
    },
    // ── Google Gemini ────────────────────────────────────────
    {
        id: ModelEnum.Gemini_2_Flash,
        name: 'Gemini 2.0 Flash',
        provider: 'gemini',
        maxTokens: 8192,
        contextWindow: 1048576,
    },
    // ── DeepSeek ─────────────────────────────────────────────
    {
        id: ModelEnum.Deepseek_R1,
        name: 'DeepSeek R1',
        provider: 'deepseek',
        maxTokens: 8192,
        contextWindow: 65536,
    },
    {
        id: ModelEnum.Deepseek_V3,
        name: 'DeepSeek V3',
        provider: 'deepseek',
        maxTokens: 8192,
        contextWindow: 65536,
    },
    // ── Together ─────────────────────────────────────────────
    {
        id: ModelEnum.Llama_4_Scout,
        name: 'Llama 4 Scout',
        provider: 'together',
        maxTokens: 16384,
        contextWindow: 131072,
    },
];

export const getModelFromChatMode = (mode?: string): ModelEnum => {
    switch (mode) {
        case ChatMode.MISTRAL_SMALL:
            return ModelEnum.Mistral_Small;
        case ChatMode.MISTRAL_LARGE:
            return ModelEnum.Mistral_Large;
        case ChatMode.CODESTRAL:
            return ModelEnum.Codestral;
        case ChatMode.GPT4o_MINI:
            return ModelEnum.GPT_4o_Mini;
        case ChatMode.GPT4o:
            return ModelEnum.GPT_4o;
        case ChatMode.O4_MINI:
            return ModelEnum.O4_Mini;
        case ChatMode.CLAUDE_SONNET_35:
            return ModelEnum.Claude_3_5_Sonnet;
        case ChatMode.CLAUDE_SONNET_37:
            return ModelEnum.Claude_3_7_Sonnet;
        case ChatMode.GEMINI_FLASH:
            return ModelEnum.Gemini_2_Flash;
        case ChatMode.DEEPSEEK_R1:
            return ModelEnum.Deepseek_R1;
        case ChatMode.DEEPSEEK_V3:
            return ModelEnum.Deepseek_V3;
        case ChatMode.LLAMA4_SCOUT:
            return ModelEnum.Llama_4_Scout;
        case ChatMode.Deep:
        case ChatMode.Pro:
        default:
            return ModelEnum.Mistral_Large;
    }
};

export const getChatModeMaxTokens = (mode: ChatMode) => {
    switch (mode) {
        case ChatMode.MISTRAL_LARGE:
            return 131072;
        case ChatMode.MISTRAL_SMALL:
        case ChatMode.CODESTRAL:
        case ChatMode.Deep:
        case ChatMode.Pro:
        default:
            return 32768;
    }
};

export const estimateTokensByWordCount = (text: string): number => {
    const words = text?.trim().split(/\s+/);
    const estimatedTokens = Math.ceil(words.length * 1.35);
    return estimatedTokens;
};

export const estimateTokensForMessages = (messages: CoreMessage[]): number => {
    let totalTokens = 0;
    for (const message of messages) {
        if (typeof message.content === 'string') {
            totalTokens += estimateTokensByWordCount(message.content);
        } else if (Array.isArray(message.content)) {
            for (const part of message.content) {
                if (part.type === 'text') {
                    totalTokens += estimateTokensByWordCount(part.text);
                }
            }
        }
    }
    return totalTokens;
};

export const trimMessageHistoryEstimated = (messages: CoreMessage[], chatMode: ChatMode) => {
    const maxTokens = getChatModeMaxTokens(chatMode);
    let trimmedMessages = [...messages];

    if (trimmedMessages.length <= 1) {
        const tokenCount = estimateTokensForMessages(trimmedMessages);
        return { trimmedMessages, tokenCount };
    }

    const latestMessage = trimmedMessages.pop()!;

    const messageSizes = trimmedMessages.map(msg => {
        const tokens =
            typeof msg.content === 'string'
                ? estimateTokensByWordCount(msg.content)
                : Array.isArray(msg.content)
                    ? msg.content.reduce(
                        (sum, part) =>
                            part.type === 'text' ? sum + estimateTokensByWordCount(part.text) : sum,
                        0
                    )
                    : 0;
        return { message: msg, tokens };
    });

    let totalTokens = messageSizes.reduce((sum, item) => sum + item.tokens, 0);
    const latestMessageTokens =
        typeof latestMessage.content === 'string'
            ? estimateTokensByWordCount(latestMessage.content)
            : Array.isArray(latestMessage.content)
                ? latestMessage.content.reduce(
                    (sum, part) =>
                        part.type === 'text' ? sum + estimateTokensByWordCount(part.text) : sum,
                    0
                )
                : 0;

    totalTokens += latestMessageTokens;

    while (totalTokens > maxTokens && messageSizes.length > 0) {
        const removed = messageSizes.shift();
        if (removed) {
            totalTokens -= removed.tokens;
        }
    }

    trimmedMessages = messageSizes.map(item => item.message);
    trimmedMessages.push(latestMessage);

    return { trimmedMessages, tokenCount: totalTokens };
};
