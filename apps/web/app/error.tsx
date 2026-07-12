'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                textAlign: 'center',
                gap: '1rem',
                padding: '2rem',
            }}
        >
            <h1
                style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                }}
            >
                Something went wrong
            </h1>
            <p
                style={{
                    color: '#666',
                    maxWidth: '400px',
                }}
            >
                An unexpected error occurred. Please try again.
            </p>
            <button
                onClick={() => reset()}
                style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#0070f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                }}
            >
                Try again
            </button>
        </div>
    );
}
