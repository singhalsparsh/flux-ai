import { useUser } from '@clerk/nextjs';
import { useApiKeysStore, useAppStore, useChatStore, useDailyTokenStore } from '@repo/common/store';
import { ChatMode } from '@repo/shared/config';
import { cn } from '@repo/ui';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function MessagesRemainingBadge() {
    const { user } = useUser();
    const chatMode = useChatStore(state => state.chatMode);
    const hasApiKeys = useApiKeysStore(state => state.hasApiKeyForChatMode(chatMode));
    const creditLimit = useChatStore(state => state.creditLimit);
    const setIsSettingsOpen = useAppStore(state => state.setIsSettingsOpen);
    const setSettingTab = useAppStore(state => state.setSettingTab);

    // ── Daily token limit indicator for unregistered users on Local AI ──
    const [dailyRemaining, setDailyRemaining] = useState<number | null>(null);

    useEffect(() => {
        if (!user && chatMode === ChatMode.LOCAL) {
            const store = useDailyTokenStore.getState();
            store.refresh();
            setDailyRemaining(store.getRemaining());
            // Poll every 5s so the UI stays fresh
            const interval = setInterval(() => {
                const remaining = useDailyTokenStore.getState().getRemaining();
                setDailyRemaining(remaining);
            }, 5000);
            return () => clearInterval(interval);
        } else {
            setDailyRemaining(null);
        }
    }, [user, chatMode]);

    if (dailyRemaining !== null) {
        // Show daily token limit badge for unregistered users on Local AI
        if (dailyRemaining <= 0) return null; // handled by error block in agent

        const pct = Math.round((dailyRemaining / 5_000_000) * 100);
        return (
            <div className="relative flex w-full items-center justify-center px-3">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="border-border bg-tertiary/70 -mt-2 flex h-9 w-full flex-row items-center gap-2 rounded-b-xl border-x border-b px-3 pt-1 font-medium"
                >
                    <div className="text-muted-foreground/60 flex w-full items-center justify-between text-[11px]">
                        <span>
                            Daily Local AI tokens:{' '}
                            <span className={cn(
                                'font-semibold',
                                pct < 10 ? 'text-destructive' : pct < 25 ? 'text-yellow-500' : ''
                            )}>
                                {dailyRemaining.toLocaleString()}
                            </span>
                            {' '}remaining
                        </span>
                        <span className="text-muted-foreground/40">
                            {pct}%
                        </span>
                    </div>
                </motion.div>
            </div>
        );
    }

    // ── Credit-limit badge (existing) for server-side credits ──
    // Hide badge when user is logged in (unlimited usage) or has API keys
    if (
        !creditLimit.isFetched ||
        user ||
        (creditLimit?.remaining && creditLimit?.remaining > 5) ||
        hasApiKeys
    ) {
        return null;
    }

    return (
        <div className="relative flex w-full items-center justify-center px-3">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="border-border bg-tertiary/70 -mt-2 flex h-10  w-full flex-row items-center gap-2 rounded-b-xl border-x border-b px-3 pt-2 font-medium"
            >
                <div className="text-muted-foreground/50 text-xs">
                    {creditLimit.remaining === 0
                        ? 'You have no credits left today.'
                        : `You have ${creditLimit.remaining} credits left today.`}{' '}
                    For continuous use,
                    <span
                        className="inline-flex shrink-0 cursor-pointer flex-row items-center gap-1 pl-1 font-medium "
                        onClick={() => {
                            setIsSettingsOpen(true);
                            setSettingTab('api-keys');
                        }}
                    >
                        <span className="text-muted-foreground inline-flex flex-row items-center gap-1 px-1 underline underline-offset-2">
                            Add your own API key
                        </span>
                    </span>
                </div>
            </motion.div>
        </div>
    );
}
