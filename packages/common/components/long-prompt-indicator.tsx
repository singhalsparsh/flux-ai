'use client';
import { Button, cn } from '@repo/ui';
import { IconFileText } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Threshold for "long" prompts
export const LONG_PROMPT_THRESHOLD = 500;

export const LongPromptIndicator = ({ text, onClear }: { text: string; onClear?: () => void }) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        setShow(text.length > LONG_PROMPT_THRESHOLD);
    }, [text]);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 5 }}
                    transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 25,
                    }}
                    className={cn(
                        'bg-brand/10 border-brand/20 text-brand mx-2 flex flex-row items-center gap-2 rounded-lg border px-3 py-1.5'
                    )}
                >
                    <IconFileText size={16} strokeWidth={2} />
                    <span className="text-xs font-medium">
                        Long prompt ({text.length} chars) — saved as file
                    </span>
                    {onClear && (
                        <button
                            onClick={onClear}
                            className="ml-auto text-xs opacity-60 hover:opacity-100"
                        >
                            ✕
                        </button>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};
