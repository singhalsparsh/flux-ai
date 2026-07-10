'use client';
import { cn } from '@repo/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

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
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-row items-center gap-3 px-4 py-2"
            >
                <div className="flex flex-row items-center gap-4 text-[10px] text-muted-foreground/60">
                    <span className="flex items-center gap-1">
                        <span className="inline-block size-2 rounded-full bg-yellow-400" />
                        {electricity.toFixed(3)} Wh
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="inline-block size-2 rounded-full bg-blue-400" />
                        {water.toFixed(3)}L water
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="inline-block size-2 rounded-full bg-green-400" />
                        ~${cost.toFixed(5)}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground/40">
                        ⏱ {elapsed}s
                    </span>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
