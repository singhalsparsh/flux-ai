'use client';
import {
    CommandSearch,
    IntroDialog,
    Preloader,
    SettingsModal,
    Sidebar,
} from '@repo/common/components';
import { useRootContext } from '@repo/common/context';
import { AgentProvider } from '@repo/common/hooks';
import { useAppStore } from '@repo/common/store';
import { plausible } from '@repo/shared/utils';
import { Badge, Button, Flex, Toaster } from '@repo/ui';
import { IconMenu2, IconX } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { FC, useEffect } from 'react';
import { useStickToBottom } from 'use-stick-to-bottom';
import { Drawer } from 'vaul';

export type TRootLayout = {
    children: React.ReactNode;
};

export const RootLayout: FC<TRootLayout> = ({ children }) => {
    const { isSidebarOpen, isMobileSidebarOpen, setIsMobileSidebarOpen } = useRootContext();
    const setIsSettingOpen = useAppStore(state => state.setIsSettingsOpen);

    const containerClass =
        'glass-strong relative flex flex-1 flex-row h-[calc(99dvh)] border border-border rounded-sm w-full overflow-hidden shadow-sm';

    useEffect(() => {
        plausible.trackPageview();
    }, []);

    return (
        <div className="bg-tertiary flex h-[100dvh] w-full flex-row overflow-hidden">
            <Flex className="hidden lg:flex">
                <AnimatePresence>{isSidebarOpen && <Sidebar />}</AnimatePresence>
            </Flex>

            <Drawer.Root
                open={isMobileSidebarOpen}
                direction="left"
                shouldScaleBackground
                onOpenChange={setIsMobileSidebarOpen}
            >
                <Drawer.Portal>
                    <Drawer.Overlay className="fixed inset-0 z-30 backdrop-blur-sm" />
                    <Drawer.Content className="fixed bottom-0 left-0 top-0 z-[50] !h-full !max-w-[260px]">
                        <Drawer.Title className="sr-only">Navigation Menu</Drawer.Title>
                        <Flex className="relative h-full pr-2">
                            <Sidebar forceOpen />
                        </Flex>
                    </Drawer.Content>
                </Drawer.Portal>
            </Drawer.Root>

            {/* Main Content */}
            <Flex className="flex-1 overflow-hidden">
                <motion.div className="flex w-full py-1 pr-1">
                    <AgentProvider>
                        <div className={containerClass}>
                            <div className="relative flex h-full w-0 flex-1 flex-row">
                                <div className="flex w-full flex-col gap-2 overflow-y-auto">
                                    {/* Auth Button Header */}

                                    {children}
                                </div>
                            </div>
                            <SideDrawer />
                            <IntroDialog />
                        </div>
                    </AgentProvider>
                </motion.div>
                <SettingsModal />
                <CommandSearch />
            </Flex>

            {/* Mobile sidebar toggle — top-left corner, hidden when sidebar is open, hidden on desktop */}
            <AnimatePresence>
                {!isMobileSidebarOpen && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ delay: 0.3, duration: 0.2 }}
                        onClick={() => setIsMobileSidebarOpen(true)}
                        className="glass-ultra fixed left-4 top-4 z-[60] flex items-center justify-center rounded-full p-3 shadow-xl lg:hidden"
                        aria-label="Open navigation menu"
                    >
                        <IconMenu2 size={22} strokeWidth={2} className="text-foreground" />
                    </motion.button>
                )}
            </AnimatePresence>

            <Toaster />
            <Preloader />
        </div>
    );
};

export const SideDrawer = () => {
    const pathname = usePathname();
    const sideDrawer = useAppStore(state => state.sideDrawer);
    const dismissSideDrawer = useAppStore(state => state.dismissSideDrawer);
    const { scrollRef, contentRef } = useStickToBottom({
        stiffness: 1,
        damping: 0,
    });
    const isThreadPage = pathname.startsWith('/chat/');

    return (
        <AnimatePresence>
            {sideDrawer.open && isThreadPage && (
                <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 40 }}
                    transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                        exit: { duration: 0.2 },
                    }}
                    className="flex min-h-[99dvh] w-[500px] shrink-0 flex-col overflow-hidden py-1.5 pl-0.5 pr-1.5"
                >
                    <div className="bg-background border-border shadow-subtle-xs flex h-full w-full flex-col overflow-hidden rounded-lg">
                        <div className="border-border flex flex-row items-center justify-between gap-2 border-b py-1.5 pl-4 pr-2">
                            <div className="text-sm font-medium">
                                {typeof sideDrawer.title === 'function'
                                    ? sideDrawer.title()
                                    : sideDrawer.title}
                            </div>
                            {sideDrawer.badge && (
                                <Badge variant="default">{sideDrawer.badge}</Badge>
                            )}
                            <div className="flex-1" />
                            <Button
                                variant="secondary"
                                size="icon-xs"
                                onClick={() => dismissSideDrawer()}
                                tooltip="Close"
                            >
                                <IconX size={14} strokeWidth={2} />
                            </Button>
                        </div>
                        <div
                            className="no-scrollbar flex flex-1 flex-col gap-2 overflow-y-auto p-2"
                            ref={scrollRef}
                        >
                            <div ref={contentRef} className="w-full">
                                {sideDrawer.renderContent()}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
