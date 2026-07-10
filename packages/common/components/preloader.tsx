'use client';
import { useEffect } from 'react';

/**
 * Preloader component that preloads critical resources when the app first mounts.
 * This runs once and caches key chunks for faster subsequent navigation.
 */
export const Preloader = () => {
    useEffect(() => {
        // Preload critical routes
        const routesToPreload = ['/chat'];

        routesToPreload.forEach(route => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = route;
            link.as = 'document';
            document.head.appendChild(link);
        });

        // Preload common icon sprites (if using icon libraries)
        const preloadLinks = [
            // Framework and runtime will handle code splitting
        ];

        // Attempt to warm up the local AI engine if it was previously loaded
        const preloadLocalAI = async () => {
            try {
                const stored = localStorage.getItem('local-ai-storage');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (parsed?.state?.isModelLoaded) {
                        // The engine will be re-initialized on demand
                        console.log('[Preloader] Local AI engine was previously loaded, ready for fast init');
                    }
                }
            } catch {
                // Silently fail
            }
        };

        // Preload after a short delay to not compete with initial render
        const timeout = setTimeout(() => {
            preloadLocalAI();
        }, 5000);

        return () => clearTimeout(timeout);
    }, []);

    return null;
};
