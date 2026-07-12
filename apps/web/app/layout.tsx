import { cn } from '@repo/ui';
import { GeistMono } from 'geist/font/mono';
import type { Viewport } from 'next';
import { Metadata } from 'next';
import { Bricolage_Grotesque } from 'next/font/google';
import localFont from 'next/font/local';

const bricolage = Bricolage_Grotesque({
    subsets: ['latin'],
    variable: '--font-bricolage',
});

import './globals.css';

export const dynamic = 'force-dynamic';

import { Providers } from './providers';

export const metadata: Metadata = {
    title: 'FluxAI - Go Deeper with AI-Powered Research & Agentic Workflows',
    description:
        'Experience deep, AI-powered research with agentic workflows and a wide variety of models for advanced productivity.',
    keywords: 'AI chat, LLM, language models, privacy, minimal UI, fluxai, chatgpt',
    authors: [{ name: 'FluxAI', url: 'https://flux.sparshlike.eu.org' }],
    creator: 'FluxAI',
    publisher: 'FluxAI',
    openGraph: {
        title: 'FluxAI - Go Deeper with AI-Powered Research & Agentic Workflows',
        siteName: 'FluxAI',
        description:
            'Experience deep, AI-powered research with agentic workflows and a wide variety of models for advanced productivity.',
        url: 'https://flux.sparshlike.eu.org',
        type: 'website',
        locale: 'en_US',
        images: [
            {
                url: 'https://flux.sparshlike.eu.org/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'FluxAI Preview',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'FluxAI - Go Deeper with AI-Powered Research & Agentic Workflows',
        site: 'flux.sparshlike.eu.org',
        creator: '@fluxai',
        description:
            'Experience deep, AI-powered research with agentic workflows and a wide variety of models for advanced productivity.',
        images: ['https://flux.sparshlike.eu.org/twitter-image.jpg'],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    alternates: {
        canonical: 'https://flux.sparshlike.eu.org',
    },
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

const inter = localFont({
    src: './InterVariable.woff2',
    variable: '--font-inter',
});

const clash = localFont({
    src: './ClashGrotesk-Variable.woff2',
    variable: '--font-clash',
});

export default function ParentLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={cn(GeistMono.variable, inter.variable, clash.variable, bricolage.variable)}
            suppressHydrationWarning
        >
            <head>
                <link rel="icon" href="/favicon.ico" sizes="any" />

                {/* <script
                    crossOrigin="anonymous"
                    src="//unpkg.com/react-scan/dist/auto.global.js"
                ></script> */}
            </head>
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
