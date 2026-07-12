/** @type {import('next').NextConfig} */

// Check if building for Cloudflare Pages
const isCloudflare = process.env.DEPLOY_TARGET === 'cloudflare' || process.env.CF_PAGES === '1';

const nextConfig = {
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
                '@vercel/functions': require.resolve('./lib/cloudflare/vercel-compat.ts'),
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
        // Disable server components that use Node.js APIs
        // The API routes will run as Pages Functions
    } : {}),
};

// Cloudflare: wrap with @cloudflare/next-on-pages
let config = nextConfig;
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
