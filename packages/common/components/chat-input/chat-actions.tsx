'use client';
import { useUser } from '@clerk/nextjs';
import { DotSpinner } from '@repo/common/components';
import { useApiKeysStore, useChatStore, useLocalAIStore } from '@repo/common/store';
import { CHAT_MODE_CREDIT_COSTS, ChatMode, ChatModeConfig } from '@repo/shared/config';
import {
    Button,
    cn,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
    Kbd,
} from '@repo/ui';
import {
    IconArrowUp,
    IconAtom,
    IconBrandOpenai,
    IconChevronDown,
    IconCpu,
    IconNorthStar,
    IconPaperclip,
    IconPlayerStopFilled,
    IconWorld,
} from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { BYOKIcon, NewIcon } from '../icons';
import { useLocalLLM } from '../../hooks/use-local-llm';

export const chatOptions = [
    {
        label: 'Deep Research',
        description: 'In depth research on complex topic',
        value: ChatMode.Deep,
        icon: <IconAtom size={16} className="text-muted-foreground" strokeWidth={2} />,
        creditCost: CHAT_MODE_CREDIT_COSTS[ChatMode.Deep],
    },
    {
        label: 'Pro Search',
        description: 'Pro search with web search',
        value: ChatMode.Pro,
        icon: <IconNorthStar size={16} className="text-muted-foreground" strokeWidth={2} />,
        creditCost: CHAT_MODE_CREDIT_COSTS[ChatMode.Pro],
    },
];

// Smart API-based models (Mistral always available via server)
export const smartModelOptions = [
    { label: 'Mistral Large', value: ChatMode.MISTRAL_LARGE, creditCost: CHAT_MODE_CREDIT_COSTS[ChatMode.MISTRAL_LARGE] },
    { label: 'Mistral Small', value: ChatMode.MISTRAL_SMALL, creditCost: CHAT_MODE_CREDIT_COSTS[ChatMode.MISTRAL_SMALL] },
    { label: 'Codestral', value: ChatMode.CODESTRAL, creditCost: CHAT_MODE_CREDIT_COSTS[ChatMode.CODESTRAL] },
];

// BYOK models — require user's own API key
export const byokModelOptions = [
    { label: 'GPT-4o Mini', value: ChatMode.GPT4o_MINI, provider: 'openai' },
    { label: 'GPT-4o', value: ChatMode.GPT4o, provider: 'openai' },
    { label: 'o4-mini', value: ChatMode.O4_MINI, provider: 'openai' },
    { label: 'Claude 3.5 Sonnet', value: ChatMode.CLAUDE_SONNET_35, provider: 'anthropic' },
    { label: 'Claude 3.7 Sonnet', value: ChatMode.CLAUDE_SONNET_37, provider: 'anthropic' },
    { label: 'Gemini 2.0 Flash', value: ChatMode.GEMINI_FLASH, provider: 'gemini' },
    { label: 'DeepSeek R1', value: ChatMode.DEEPSEEK_R1, provider: 'deepseek' },
    { label: 'DeepSeek V3', value: ChatMode.DEEPSEEK_V3, provider: 'deepseek' },
    { label: 'Llama 4 Scout', value: ChatMode.LLAMA4_SCOUT, provider: 'together' },
];

// Local AI — dynamic label based on loaded model
export const getLocalModelOption = (loadedModelId: string | null) => ({
    label: loadedModelId ? `Local — ${loadedModelId.split('-')[0]}...` : 'Local AI',
    description: loadedModelId
        ? `Using ${loadedModelId}`
        : 'Run models locally in your browser using WebGPU',
    value: ChatMode.LOCAL,
    icon: <IconCpu size={16} className="text-muted-foreground" strokeWidth={2} />,
    creditCost: CHAT_MODE_CREDIT_COSTS[ChatMode.LOCAL],
});

export const AttachmentButton = () => {
    return (
        <Button
            size="icon"
            tooltip="Attachment (coming soon)"
            variant="ghost"
            className="gap-2"
            rounded="full"
            disabled
        >
            <IconPaperclip size={18} strokeWidth={2} className="text-muted-foreground" />
        </Button>
    );
};

export const ChatModeButton = () => {
    const chatMode = useChatStore(state => state.chatMode);
    const setChatMode = useChatStore(state => state.setChatMode);
    const [isChatModeOpen, setIsChatModeOpen] = useState(false);
    const hasApiKeyForChatMode = useApiKeysStore(state => state.hasApiKeyForChatMode);
    const isChatPage = usePathname().startsWith('/chat');

    const isSmartMode = smartModelOptions.some(o => o.value === chatMode);
    const isByokMode = byokModelOptions.some(o => o.value === chatMode);
    const displayLabel = isSmartMode ? 'SMART' : isByokMode ? 'BYOK' : 'Local';

    return (
        <DropdownMenu open={isChatModeOpen} onOpenChange={setIsChatModeOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant={'glass'} size="xs">
                    {!isSmartMode && <IconAtom size={14} className="text-muted-foreground" strokeWidth={2} />}
                    <span className="text-xs font-semibold">{displayLabel}</span>
                    <IconChevronDown size={14} strokeWidth={2} />
                </Button>
            </DropdownMenuTrigger>
            <ChatModeOptions chatMode={chatMode} setChatMode={setChatMode} />
        </DropdownMenu>
    );
};

export const WebSearchButton = () => {
    const useWebSearch = useChatStore(state => state.useWebSearch);
    const setUseWebSearch = useChatStore(state => state.setUseWebSearch);
    const chatMode = useChatStore(state => state.chatMode);
    const hasApiKeyForChatMode = useApiKeysStore(state => state.hasApiKeyForChatMode);

    if (!ChatModeConfig[chatMode]?.webSearch && !hasApiKeyForChatMode(chatMode)) return null;

    return (
        <Button
            size={useWebSearch ? 'sm' : 'icon-sm'}
            tooltip="Web Search"
            variant={useWebSearch ? 'default' : 'glass'}
            className={cn('gap-2', useWebSearch && 'bg-blue-500/10 text-blue-500')}
            onClick={() => setUseWebSearch(!useWebSearch)}
        >
            <IconWorld
                size={16}
                strokeWidth={2}
                className={cn(useWebSearch ? '!text-blue-500' : 'text-muted-foreground')}
            />
            {useWebSearch && <p className="text-xs">Web</p>}
        </Button>
    );
};

export const NewLineIndicator = () => {
    const editor = useChatStore(state => state.editor);
    const hasTextInput = !!editor?.getText();

    if (!hasTextInput) return null;

    return (
        <p className="flex flex-row items-center gap-1 text-xs text-gray-500">
            use <Kbd>Shift</Kbd> <Kbd>Enter</Kbd> for new line
        </p>
    );
};

export const GeneratingStatus = () => {
    return (
        <div className="text-muted-foreground flex flex-row items-center gap-1 px-2 text-xs">
            <DotSpinner /> Generating...
        </div>
    );
};

export const ChatModeLocalOption = ({
    localOption,
    localAIStore,
    setChatMode,
}: {
    localOption: ReturnType<typeof getLocalModelOption>;
    localAIStore: { loadedModelId: string | null; selectedModelId: string | null; isModelLoaded: boolean; isLoading: boolean };
    setChatMode: (mode: ChatMode) => void;
}) => {
    const { loadModel } = useLocalLLM();
    const localModelName = localAIStore.loadedModelId
        ? localAIStore.loadedModelId.split('-')[0] + '...'
        : null;

    return (
        <DropdownMenuGroup>
            <DropdownMenuLabel className="text-brand mt-1 text-xs font-semibold uppercase tracking-wider">
                📍 {localModelName ? `Local — ${localModelName}` : 'Local'}
            </DropdownMenuLabel>
            <DropdownMenuItem
                onSelect={() => {
                    setChatMode(localOption.value);
                    // Start loading the model on-demand so it's ready by the time user sends a message
                    const modelId = localAIStore.loadedModelId || localAIStore.selectedModelId;
                    if (modelId && !localAIStore.isModelLoaded) {
                        loadModel(modelId).catch(err => {
                            console.warn('Failed to pre-load local model:', err);
                        });
                    } else if (!modelId) {
                        toast.error('No local model configured. Open Settings → Local AI to download a model.');
                    }
                }}
                className="h-auto"
            >
                <div className="flex w-full flex-row items-start gap-1.5 px-1.5 py-1.5">
                    <div className="flex flex-col gap-0 pt-1">{localOption.icon}</div>
                    <div className="flex flex-col gap-0">
                        {<p className="m-0 text-sm font-medium">{localOption.label}</p>}
                        {localOption.description && (
                            <p className="text-muted-foreground text-xs font-light">
                                {localOption.description}
                            </p>
                        )}
                    </div>
                    <div className="flex-1" />
                    {localAIStore.isLoading && (
                        <span className="text-brand text-[10px] font-medium animate-pulse">Loading...</span>
                    )}
                    {!localAIStore.isLoading && localAIStore.isModelLoaded && (
                        <span className="text-green-600 text-[10px] font-medium">Loaded</span>
                    )}
                    {ChatModeConfig[localOption.value]?.isNew && <NewIcon />}
                </div>
            </DropdownMenuItem>
        </DropdownMenuGroup>
    );
};

export const ChatModeOptions = ({
    chatMode,
    setChatMode,
    isRetry = false,
}: {
    chatMode: ChatMode;
    setChatMode: (chatMode: ChatMode) => void;
    isRetry?: boolean;
}) => {
    const { isSignedIn } = useUser();
    const hasApiKeyForChatMode = useApiKeysStore(state => state.hasApiKeyForChatMode);
    const isChatPage = usePathname().startsWith('/chat');
    const { push } = useRouter();

    const localAIStore = useLocalAIStore();
    const localOption = getLocalModelOption(localAIStore.loadedModelId);

    return (
        <DropdownMenuContent
            align="start"
            side="bottom"
            className="no-scrollbar max-h-[400px] w-[300px] overflow-y-auto"
        >
            <DropdownMenuGroup>
                <DropdownMenuLabel className="text-brand text-xs font-semibold uppercase tracking-wider">
                    ⚡ SMART
                </DropdownMenuLabel>
                {smartModelOptions.map(option => (
                    <DropdownMenuItem
                        key={option.label}
                        onSelect={() => {
                            if (ChatModeConfig[option.value]?.isAuthRequired && !isSignedIn) {
                                push('/sign-in');
                                return;
                            }
                            setChatMode(option.value);
                        }}
                        className="h-auto"
                    >
                        <div className="flex w-full flex-row items-center gap-2.5 px-1.5 py-1.5">
                            <div className="flex flex-col gap-0">
                                {<p className="text-sm font-medium">{option.label}</p>}
                            </div>
                            <div className="flex-1" />
                            {ChatModeConfig[option.value]?.isNew && <NewIcon />}
                            {hasApiKeyForChatMode(option.value) && <BYOKIcon />}
                        </div>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuGroup>

            {isChatPage && (
                <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-brand mt-1 text-xs font-semibold uppercase tracking-wider">
                        🔑 BYOK
                    </DropdownMenuLabel>
                    {byokModelOptions.map(option => (
                        <DropdownMenuItem
                            key={option.label}
                            onSelect={() => {
                                setChatMode(option.value);
                            }}
                            className="h-auto"
                        >
                            <div className="flex w-full flex-row items-center gap-2.5 px-1.5 py-1.5">
                                <div className="flex flex-col gap-0">
                                    {<p className="text-sm font-medium">{option.label}</p>}
                                </div>
                                <div className="flex-1" />
                                <span className="text-[10px] text-muted-foreground/60">{option.provider}</span>
                                {hasApiKeyForChatMode(option.value) && <BYOKIcon />}
                            </div>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuGroup>
            )}

            {isChatPage && (
                <ChatModeLocalOption
                    localOption={localOption}
                    localAIStore={localAIStore}
                    setChatMode={setChatMode}
                />
            )}
        </DropdownMenuContent>
    );
};

export const SendStopButton = ({
    isGenerating,
    isChatPage,
    stopGeneration,
    hasTextInput,
    sendMessage,
}: {
    isGenerating: boolean;
    isChatPage: boolean;
    stopGeneration: () => void;
    hasTextInput: boolean;
    sendMessage: () => void;
}) => {
    return (
        <div className="flex flex-row items-center gap-2">
            <AnimatePresence mode="wait" initial={false}>
                {isGenerating && !isChatPage ? (
                    <motion.div
                        key="stop-button"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Button
                            size="icon-sm"
                            variant="default"
                            onClick={stopGeneration}
                            tooltip="Stop Generation"
                        >
                            <IconPlayerStopFilled size={14} strokeWidth={2} />
                        </Button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="send-button"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Button
                            size="icon-sm"
                            tooltip="Send Message"
                            variant={hasTextInput ? 'default' : 'secondary'}
                            disabled={!hasTextInput || isGenerating}
                            onClick={() => {
                                sendMessage();
                            }}
                        >
                            <IconArrowUp size={16} strokeWidth={2} />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
