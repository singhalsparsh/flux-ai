export enum ChatMode {
    // Mistral (default, always available)
    MISTRAL_SMALL = 'mistral-small',
    MISTRAL_LARGE = 'mistral-large',
    CODESTRAL = 'codestral',
    // Workflows (use Mistral by default)
    Pro = 'pro',
    Deep = 'deep',
    // Local
    LOCAL = 'local',
    // BYOK models (require user API key)
    GPT4o_MINI = 'gpt4o-mini',
    GPT4o = 'gpt4o',
    O4_MINI = 'o4-mini',
    CLAUDE_SONNET_35 = 'claude-sonnet-35',
    CLAUDE_SONNET_37 = 'claude-sonnet-37',
    GEMINI_FLASH = 'gemini-flash',
    DEEPSEEK_R1 = 'deepseek-r1',
    DEEPSEEK_V3 = 'deepseek-v3',
    LLAMA4_SCOUT = 'llama4-scout',
}

export const ChatModeConfig: Record<
    ChatMode,
    {
        webSearch: boolean;
        imageUpload: boolean;
        retry: boolean;
        isNew?: boolean;
        isAuthRequired?: boolean;
    }
> = {
    // ── Workflows ─────────────────────────────────────────
    [ChatMode.Deep]: { webSearch: false, imageUpload: false, retry: false, isAuthRequired: true },
    [ChatMode.Pro]: { webSearch: false, imageUpload: false, retry: false, isAuthRequired: true },
    // ── Mistral ───────────────────────────────────────────
    [ChatMode.MISTRAL_SMALL]: { webSearch: true, imageUpload: true, retry: true, isNew: true, isAuthRequired: true },
    [ChatMode.MISTRAL_LARGE]: { webSearch: true, imageUpload: true, retry: true, isNew: true, isAuthRequired: true },
    [ChatMode.CODESTRAL]: { webSearch: false, imageUpload: false, retry: true, isNew: true, isAuthRequired: true },
    // ── Local ─────────────────────────────────────────────
    [ChatMode.LOCAL]: { webSearch: false, imageUpload: true, retry: true },
    // ── BYOK models (no auth required - user provides key) ─
    [ChatMode.GPT4o_MINI]: { webSearch: true, imageUpload: true, retry: true, isNew: true },
    [ChatMode.GPT4o]: { webSearch: true, imageUpload: true, retry: true, isNew: true },
    [ChatMode.O4_MINI]: { webSearch: true, imageUpload: true, retry: true, isNew: true },
    [ChatMode.CLAUDE_SONNET_35]: { webSearch: true, imageUpload: true, retry: true, isNew: true },
    [ChatMode.CLAUDE_SONNET_37]: { webSearch: true, imageUpload: true, retry: true, isNew: true },
    [ChatMode.GEMINI_FLASH]: { webSearch: true, imageUpload: true, retry: true, isNew: true },
    [ChatMode.DEEPSEEK_R1]: { webSearch: true, imageUpload: true, retry: true, isNew: true },
    [ChatMode.DEEPSEEK_V3]: { webSearch: true, imageUpload: true, retry: true, isNew: true },
    [ChatMode.LLAMA4_SCOUT]: { webSearch: true, imageUpload: true, retry: true, isNew: true },
};

export const CHAT_MODE_CREDIT_COSTS = {
    [ChatMode.Deep]: 10,
    [ChatMode.Pro]: 5,
    [ChatMode.MISTRAL_SMALL]: 2,
    [ChatMode.MISTRAL_LARGE]: 4,
    [ChatMode.CODESTRAL]: 3,
    [ChatMode.LOCAL]: 0,
    // BYOK models cost 0 credits since user uses their own key
    [ChatMode.GPT4o_MINI]: 0,
    [ChatMode.GPT4o]: 0,
    [ChatMode.O4_MINI]: 0,
    [ChatMode.CLAUDE_SONNET_35]: 0,
    [ChatMode.CLAUDE_SONNET_37]: 0,
    [ChatMode.GEMINI_FLASH]: 0,
    [ChatMode.DEEPSEEK_R1]: 0,
    [ChatMode.DEEPSEEK_V3]: 0,
    [ChatMode.LLAMA4_SCOUT]: 0,
};

export const getChatModeName = (mode: ChatMode) => {
    switch (mode) {
        case ChatMode.Deep: return 'Deep Research';
        case ChatMode.Pro: return 'Pro Search';
        case ChatMode.MISTRAL_SMALL: return 'Mistral Small';
        case ChatMode.MISTRAL_LARGE: return 'Mistral Large';
        case ChatMode.CODESTRAL: return 'Codestral';
        case ChatMode.LOCAL: return 'Local AI';
        case ChatMode.GPT4o_MINI: return 'GPT-4o Mini';
        case ChatMode.GPT4o: return 'GPT-4o';
        case ChatMode.O4_MINI: return 'o4-mini';
        case ChatMode.CLAUDE_SONNET_35: return 'Claude 3.5 Sonnet';
        case ChatMode.CLAUDE_SONNET_37: return 'Claude 3.7 Sonnet';
        case ChatMode.GEMINI_FLASH: return 'Gemini 2.0 Flash';
        case ChatMode.DEEPSEEK_R1: return 'DeepSeek R1';
        case ChatMode.DEEPSEEK_V3: return 'DeepSeek V3';
        case ChatMode.LLAMA4_SCOUT: return 'Llama 4 Scout';
    }
};
