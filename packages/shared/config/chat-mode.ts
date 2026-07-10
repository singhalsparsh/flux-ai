export enum ChatMode {
    Pro = 'pro',
    Deep = 'deep',
    MISTRAL_SMALL = 'mistral-small',
    MISTRAL_LARGE = 'mistral-large',
    CODESTRAL = 'codestral',
    LOCAL = 'local',
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
    [ChatMode.Deep]: {
        webSearch: false,
        imageUpload: false,
        retry: false,
        isAuthRequired: true,
    },
    [ChatMode.Pro]: {
        webSearch: false,
        imageUpload: false,
        retry: false,
        isAuthRequired: true,
    },
    [ChatMode.MISTRAL_SMALL]: {
        webSearch: true,
        imageUpload: true,
        retry: true,
        isNew: true,
        isAuthRequired: true,
    },
    [ChatMode.MISTRAL_LARGE]: {
        webSearch: true,
        imageUpload: true,
        retry: true,
        isNew: true,
        isAuthRequired: true,
    },
    [ChatMode.CODESTRAL]: {
        webSearch: false,
        imageUpload: false,
        retry: true,
        isNew: true,
        isAuthRequired: true,
    },
    [ChatMode.LOCAL]: {
        webSearch: false,
        imageUpload: false,
        retry: true,
    },
};

export const CHAT_MODE_CREDIT_COSTS = {
    [ChatMode.Deep]: 10,
    [ChatMode.Pro]: 5,
    [ChatMode.MISTRAL_SMALL]: 2,
    [ChatMode.MISTRAL_LARGE]: 4,
    [ChatMode.CODESTRAL]: 3,
    [ChatMode.LOCAL]: 0,
};

export const getChatModeName = (mode: ChatMode) => {
    switch (mode) {
        case ChatMode.Deep:
            return 'Deep Research';
        case ChatMode.Pro:
            return 'Pro Search';
        case ChatMode.MISTRAL_SMALL:
            return 'Mistral Small';
        case ChatMode.MISTRAL_LARGE:
            return 'Mistral Large';
        case ChatMode.CODESTRAL:
            return 'Codestral';
        case ChatMode.LOCAL:
            return 'Local AI';
    }
};
