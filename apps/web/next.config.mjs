import { fileURLToPath } from 'url';

/** @type {import('next').NextConfig} */

// Detect deployment target
const isCloudflare = process.env.DEPLOY_TARGET === 'cloudflare' || process.env.CF_PAGES === '1';
const isNetlify = process.env.NETLIFY === 'true' || process.env.NETLIFY_NEXT_PLUGIN_ENABLED === 'true';

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Suppress pre-existing TS errors and ESLint warnings at build time
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    transpilePackages: ['next-mdx-remote'],
    images: {
        remotePatterns: [
            { hostname: 'www.google.com' },
            { hostname: 'img.clerk.com' },
            { hostname: 'zyqdiwxgffuy8ymd.public.blob.vercel-storage.com' },
        ],
    },

    experimental: {
        externalDir: true,
        serverComponentsExternalPackages: [
            'posthog-node',
            'axios',
            'follow-redirects',
            'debug',
            'supports-color',
            // Cloudflare: mark Node.js-only packages as external
            ...(isCloudflare ? ['langchain', '@langchain/core', '@langchain/community', '@vercel/kv', 'jsdom'] : []),
            // Netlify: mark packages that need Node.js polyfills
            ...(isNetlify ? ['langchain', '@langchain/core', '@langchain/community', 'jsdom'] : []),
        ],
    },
    webpack: (config, options) => {
        if (!options.isServer) {
            config.resolve.fallback = { fs: false, module: false, path: false };
        }
        // Experimental features
        config.experiments = {
            ...config.experiments,
            topLevelAwait: true,
            layers: true,
        };

        // Cloudflare: alias Vercel packages to compat layer
        if (isCloudflare) {
            config.resolve.alias = {
                ...config.resolve.alias,
                '@vercel/functions': fileURLToPath(new URL('./lib/cloudflare/vercel-compat.ts', import.meta.url)),
            };
        }

        // Netlify: alias Vercel packages to Netlify compat layer
        if (isNetlify) {
            config.resolve.alias = {
                ...config.resolve.alias,
                '@vercel/functions': fileURLToPath(new URL('./lib/netlify/vercel-compat.ts', import.meta.url)),
            };
        }

        return config;
    },
    async redirects() {
        return [{ source: '/', destination: '/chat', permanent: true }];
    },

    // Cloudflare: output configuration for next-on-pages
    ...(isCloudflare ? {
        output: 'export',
    } : {}),

    // Netlify: let the Netlify Next.js plugin handle output
    // No need to set output: 'standalone' or 'export' — Netlify handles it
};

// Cloudflare: wrap with @cloudflare/next-on-pages
if (isCloudflare) {
    try {
        // Dynamic import only when building for Cloudflare
        const { setupDevPlatform } = await import('@cloudflare/next-on-pages');
        if (process.env.NODE_ENV === 'development') {
            await setupDevPlatform();
        }
    } catch (e) {
        // Package not installed, skip
    }
}

export default nextConfig;
