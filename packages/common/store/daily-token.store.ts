'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const DAILY_TOKEN_LIMIT = 5_000_000;

/** Rough token estimation: chars / 4 */
export const estimateTokens = (text: string): number => Math.ceil(text.length / 4);

type DailyTokenState = {
    date: string; // YYYY-MM-DD
    tokensConsumed: number;
};

type DailyTokenActions = {
    /** Try to consume `amount` tokens. Returns false if it would exceed the daily limit. */
    tryConsume: (amount: number) => boolean;
    /** Tokens remaining for today. */
    getRemaining: () => number;
    /** Reset counter to today (used when loading from persist). */
    refresh: () => void;
};

const getToday = (): string => new Date().toISOString().split('T')[0];

export const useDailyTokenStore = create<DailyTokenState & DailyTokenActions>()(
    persist(
        (set, get) => ({
            date: getToday(),
            tokensConsumed: 0,

            tryConsume: (amount: number) => {
                const state = get();
                const today = getToday();
                const startOfDay = state.date === today ? state.tokensConsumed : 0;
                const newTotal = startOfDay + amount;
                if (newTotal > DAILY_TOKEN_LIMIT) return false;
                set({ date: today, tokensConsumed: newTotal });
                return true;
            },

            getRemaining: () => {
                const state = get();
                const today = getToday();
                if (state.date !== today) return DAILY_TOKEN_LIMIT;
                return Math.max(0, DAILY_TOKEN_LIMIT - state.tokensConsumed);
            },

            refresh: () => {
                const state = get();
                const today = getToday();
                if (state.date !== today) {
                    set({ date: today, tokensConsumed: 0 });
                }
            },
        }),
        {
            name: 'daily-token-store',
        }
    )
);
