'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { RootLayout } from '@repo/common/components';
import { ReactQueryProvider, RootProvider } from '@repo/common/context';
import { TooltipProvider } from '@repo/ui';
import { ThemeProvider } from 'next-themes';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ClerkProvider
            appearance={{
                layout: {
                    socialButtonsPlacement: 'bottom',
                    socialButtonsVariant: 'iconButton',
                },
                variables: {
                    colorPrimary: '#000000',
                },
                elements: {
                    footer: 'hidden',
                    footerAction: 'hidden',
                    footerActionText: 'hidden',
                    footerActionLink: 'hidden',
                    card: '[&_.cl-internal-wkkub3]:hidden',
                },
            }}
        >
            <RootProvider>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    <TooltipProvider>
                        <ReactQueryProvider>
                            <RootLayout>{children}</RootLayout>
                        </ReactQueryProvider>
                    </TooltipProvider>
                </ThemeProvider>
            </RootProvider>
        </ClerkProvider>
    );
}
