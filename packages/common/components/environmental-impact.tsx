'use client';
import { cn } from '@repo/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';

// Rough estimates based on AI model inference
// Per 1000 tokens:
const TOKEN_IMPACT = {
    electricity: 0.003, // kWh per token
    water: 0.0015,      // Liters per token (cooling)
    carbon: 0.0002,     // g CO2 per token
};

// Cost per kWh (USD, varies by region)
const ELECTRICITY_COST_PER_KWH = 0.12;

export type ImpactData = {
    tokensUsed: number;
    elapsedMs: number;
};

function AnimatedNumber({ value, suffix, decimals = 3 }: { value: number; suffix: string; decimals?: number }) {
    const [display, setDisplay] = useState(0);
    const rafRef = useRef<number | null>(null);
    const startTime = useRef<number>(0);

    useEffect(() => {
        if (value === 0) { setDisplay(0); return; }
        startTime.current = performance.now();
        const duration = 1200; // total animation duration
        const from = 0;

        const animate = (now: number) => {
            const elapsed = now - startTime.current;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = from + (value - from) * eased;
            setDisplay(current);
            if (progress < 1) {
                rafRef.current = requestAnimationFrame(animate);
            }
        };

        rafRef.current = requestAnimationFrame(animate);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [value]);

    return (
        <span>
            {display.toFixed(decimals)}{suffix}
        </span>
    );
}

function ImpactDot({ color, label, children }: { color: string; label: string; children: React.ReactNode }) {
    return (
        <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-1.5"
        >
            <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 10 }}
                className={cn('inline-block size-2.5 rounded-full', color)}
            />
            <span className="tabular-nums">{children}</span>
        </motion.span>
    );
}

export const EnvironmentalImpact = ({ tokensUsed, elapsedMs }: ImpactData) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (tokensUsed > 0) {
            setShow(true);
        }
    }, [tokensUsed]);

    if (!show || tokensUsed < 10) return null;

    const electricity = tokensUsed * TOKEN_IMPACT.electricity;
    const water = tokensUsed * TOKEN_IMPACT.water;
    const cost = electricity * ELECTRICITY_COST_PER_KWH;
    const elapsed = (elapsedMs / 1000).toFixed(1);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="glass-card flex flex-row items-center gap-3 rounded-xl px-4 py-2"
            >
                <motion.div
                    className="flex flex-row items-center gap-4 text-[10px] text-muted-foreground/60"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        visible: {
                            transition: { staggerChildren: 0.15 },
                        },
                    }}
                >
                    <ImpactDot color="bg-yellow-400" label="Energy">
                        ⚡ <AnimatedNumber value={electricity} suffix=" Wh" /> <span className="text-muted-foreground/40">energy</span>
                    </ImpactDot>
                    <ImpactDot color="bg-blue-400" label="Water">
                        💧 <AnimatedNumber value={water} suffix=" L" /> <span className="text-muted-foreground/40">water</span>
                    </ImpactDot>
                    <ImpactDot color="bg-green-400" label="Cost">
                        💰 ~$<AnimatedNumber value={cost} suffix="" decimals={5} /> <span className="text-muted-foreground/40">server cost</span>
                    </ImpactDot>
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="flex items-center gap-1 text-muted-foreground/40"
                    >
                        ⏱ <AnimatedNumber value={parseFloat(elapsed)} suffix="s" decimals={1} /> <span className="text-muted-foreground/40">elapsed</span>
                    </motion.span>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
