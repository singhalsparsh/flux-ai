export type LocalModelTier = 'small' | 'medium' | 'large' | 'ultra';

export type LocalModelDefinition = {
    id: string;
    name: string;
    description: string;
    tier: LocalModelTier;
    ramRequired: number;
    ramRecommended: number;
    useCase: string;
    ctxLength: number;
    quantization?: string;
    modelUrl?: string;
};

export const LOCAL_MODELS: LocalModelDefinition[] = [
    {
        id: 'qwen2-0.5b-instruct-q4f16_1-MLC',
        name: 'Qwen2.5-0.5B',
        description: 'Fastest option, minimal RAM. Best for quick Q&A on low-end devices.',
        tier: 'small',
        ramRequired: 1024,
        ramRecommended: 2048,
        useCase: 'Simple Q&A, basic chat, text classification',
        ctxLength: 32768,
        quantization: 'q4f16_1',
    },
    {
        id: 'qwen2-1.5b-instruct-q4f16_1-MLC',
        name: 'Qwen2.5-1.5B',
        description: 'Lightweight model for basic conversations with decent quality.',
        tier: 'small',
        ramRequired: 1536,
        ramRecommended: 3072,
        useCase: 'Light chat, summarization, translation',
        ctxLength: 32768,
        quantization: 'q4f16_1',
    },
    {
        id: 'Phi-3-mini-4k-instruct-q4f16_1-MLC',
        name: 'Phi-3 Mini',
        description: 'Microsoft\'s efficient 3.8B model, strong reasoning for its size.',
        tier: 'small',
        ramRequired: 2048,
        ramRecommended: 4096,
        useCase: 'Code generation, reasoning tasks, chatbots',
        ctxLength: 4096,
        quantization: 'q4f16_1',
    },
    {
        id: 'gemma-2-2b-it-q4f16_1-MLC',
        name: 'Gemma 2 2B',
        description: 'Google\'s lightweight model with strong results for its size.',
        tier: 'small',
        ramRequired: 1536,
        ramRecommended: 3072,
        useCase: 'Creative writing, chat, instruction following',
        ctxLength: 8192,
        quantization: 'q4f16_1',
    },
    {
        id: 'Qwen2-1.5B-Instruct-q4f16_1-MLC',
        name: 'Qwen2 1.5B',
        description: 'Balanced model for general purpose chat.',
        tier: 'small',
        ramRequired: 1536,
        ramRecommended: 3072,
        useCase: 'General chat, Q&A, creative tasks',
        ctxLength: 32768,
        quantization: 'q4f16_1',
    },
    {
        id: 'stablelm-2-zephyr-1_6b-q4f16_1-MLC',
        name: 'StableLM 2 1.6B',
        description: 'Stability AI\'s efficient conversational model.',
        tier: 'small',
        ramRequired: 1536,
        ramRecommended: 3072,
        useCase: 'Conversational AI, story generation',
        ctxLength: 4096,
        quantization: 'q4f16_1',
    },
    {
        id: 'qwen2-7b-instruct-q4f16_1-MLC',
        name: 'Qwen2.5-7B',
        description: 'Mid-size model balancing speed and quality. Good daily driver.',
        tier: 'medium',
        ramRequired: 4096,
        ramRecommended: 6144,
        useCase: 'Complex reasoning, coding, content generation',
        ctxLength: 32768,
        quantization: 'q4f16_1',
    },
    {
        id: 'Phi-3-medium-4k-instruct-q4f16_1-MLC',
        name: 'Phi-3 Medium',
        description: 'Microsoft\'s 14B model, strong reasoning for its size.',
        tier: 'medium',
        ramRequired: 6144,
        ramRecommended: 8192,
        useCase: 'Advanced reasoning, code generation, analysis',
        ctxLength: 4096,
        quantization: 'q4f16_1',
    },
    {
        id: 'gemma-2-9b-it-q4f16_1-MLC',
        name: 'Gemma 2 9B',
        description: 'Google\'s powerful mid-size model with excellent performance.',
        tier: 'medium',
        ramRequired: 5120,
        ramRecommended: 8192,
        useCase: 'Technical tasks, analysis, creative writing',
        ctxLength: 8192,
        quantization: 'q4f16_1',
    },
    {
        id: 'Mistral-7B-Instruct-v0.3-q4f16_1-MLC',
        name: 'Mistral 7B v0.3',
        description: 'Mistral\'s popular 7B model with great general capabilities.',
        tier: 'medium',
        ramRequired: 4096,
        ramRecommended: 6144,
        useCase: 'General chat, coding, multilingual tasks',
        ctxLength: 32768,
        quantization: 'q4f16_1',
    },
    {
        id: 'Hermes-2-Pro-Mistral-7B-q4f16_1-MLC',
        name: 'Hermes 2 Pro Mistral 7B',
        description: 'Fine-tuned Mistral with enhanced function calling.',
        tier: 'medium',
        ramRequired: 4096,
        ramRecommended: 6144,
        useCase: 'Function calling, structured output, roleplaying',
        ctxLength: 32768,
        quantization: 'q4f16_1',
    },
    {
        id: 'Qwen2-7B-Instruct-q4f16_1-MLC',
        name: 'Qwen2 7B',
        description: 'Alibaba\'s capable 7B model for diverse tasks.',
        tier: 'medium',
        ramRequired: 4096,
        ramRecommended: 6144,
        useCase: 'General AI, content creation, analysis',
        ctxLength: 32768,
        quantization: 'q4f16_1',
    },
    {
        id: 'Llama-3.1-8B-Instruct-q4f16_1-MLC',
        name: 'Llama 3.1 8B',
        description: 'Meta\'s latest 8B model with strong instruction following.',
        tier: 'medium',
        ramRequired: 5120,
        ramRecommended: 8192,
        useCase: 'Instruction following, chat, code generation',
        ctxLength: 131072,
        quantization: 'q4f16_1',
    },
    {
        id: 'gemma-2-27b-it-q4f16_1-MLC',
        name: 'Gemma 2 27B',
        description: 'Google\'s large model delivering near-top-tier results.',
        tier: 'large',
        ramRequired: 12288,
        ramRecommended: 16384,
        useCase: 'Complex problem solving, long-form content, analysis',
        ctxLength: 8192,
        quantization: 'q4f16_1',
    },
    {
        id: 'Qwen2.5-14B-Instruct-q4f16_1-MLC',
        name: 'Qwen2.5-14B',
        description: 'High-quality model for demanding tasks. Needs decent GPU.',
        tier: 'large',
        ramRequired: 10240,
        ramRecommended: 14336,
        useCase: 'Advanced coding, mathematical reasoning, analysis',
        ctxLength: 32768,
        quantization: 'q4f16_1',
    },
    {
        id: 'Llama-3.1-70B-Instruct-q4f16_1-MLC',
        name: 'Llama 3.1 70B',
        description: 'Heavyweight model for the most demanding tasks.',
        tier: 'ultra',
        ramRequired: 32768,
        ramRecommended: 49152,
        useCase: 'Expert-level reasoning, research analysis, complex coding',
        ctxLength: 131072,
        quantization: 'q4f16_1',
    },
    {
        id: 'Qwen2.5-32B-Instruct-q4f16_1-MLC',
        name: 'Qwen2.5-32B',
        description: 'Ultra-large model for expert-level tasks. Requires high-end hardware.',
        tier: 'ultra',
        ramRequired: 24576,
        ramRecommended: 32768,
        useCase: 'Expert reasoning, research, complex analysis',
        ctxLength: 32768,
        quantization: 'q4f16_1',
    },
];

export function getModelsByTier(tier: LocalModelTier): LocalModelDefinition[] {
    return LOCAL_MODELS.filter(m => m.tier === tier);
}

export function getModelById(id: string): LocalModelDefinition | undefined {
    return LOCAL_MODELS.find(m => m.id === id);
}

export function getSuitableModels(ramMb: number): LocalModelDefinition[] {
    return LOCAL_MODELS.filter(m => m.ramRequired <= ramMb);
}

export function getTierLabel(tier: LocalModelTier): string {
    switch (tier) {
        case 'small':
            return '🪶 Light — works on most devices';
        case 'medium':
            return '⚖️ Balanced — decent quality, moderate RAM';
        case 'large':
            return '💪 Powerful — needs a good GPU';
        case 'ultra':
            return '🚀 Ultra — high-end hardware required';
    }
}
