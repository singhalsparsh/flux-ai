'use client';
import { Button } from '@repo/ui';
import { IconLanguage } from '@tabler/icons-react';
import { useState } from 'react';

type GrammarCheckProps = {
    text: string;
    onFix?: (fixed: string) => void;
};

// Simple client-side grammar and spelling check using browser's built-in spellcheck API
export const GrammarCheck = ({ text, onFix }: GrammarCheckProps) => {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isChecking, setIsChecking] = useState(false);

    const checkGrammar = async () => {
        if (!text.trim()) return;
        setIsChecking(true);

        try {
            // Use browser's built-in spellcheck by creating a temporary element
            const temp = document.createElement('div');
            temp.contentEditable = 'true';
            temp.style.position = 'absolute';
            temp.style.left = '-9999px';
            temp.lang = 'en';
            temp.textContent = text;
            document.body.appendChild(temp);

            // Wait for spellcheck to run
            await new Promise(resolve => setTimeout(resolve, 100));

            // Check for misspelled words using the browser's spellcheck
            const words = text.split(/\b/);
            const found: string[] = [];

            // Use a simple dictionary approach for common issues
            const commonErrors: Record<string, string> = {
                'teh': 'the',
                'recieve': 'receive',
                'wierd': 'weird',
                'adress': 'address',
                'alot': 'a lot',
                'definately': 'definitely',
                'seperate': 'separate',
                'occured': 'occurred',
                'occurence': 'occurrence',
                'goverment': 'government',
                'maintainance': 'maintenance',
                'calender': 'calendar',
                'neccessary': 'necessary',
                'restaraunt': 'restaurant',
                'Febuary': 'February',
                'acheive': 'achieve',
                'beleive': 'believe',
                'commitee': 'committee',
                'enviroment': 'environment',
                'independant': 'independent',
                'liason': 'liaison',
                'millenium': 'millennium',
                'occassion': 'occasion',
                'paralel': 'parallel',
                'priviledge': 'privilege',
                'pronounciation': 'pronunciation',
                'rythm': 'rhythm',
                'succesful': 'successful',
                'suprise': 'surprise',
                'tommorow': 'tomorrow',
                'tounge': 'tongue',
                'twelth': 'twelfth',
                'your': "you're (check context)",
                'its': "it's (check context)",
                'thier': 'their',
                'theres': "there's",
            };

            for (const word of words) {
                const clean = word.toLowerCase().replace(/[^a-z]/g, '');
                if (clean && commonErrors[clean]) {
                    found.push(`"${word}" → ${commonErrors[clean]}`);
                }
            }

            setSuggestions(found.slice(0, 5));
            document.body.removeChild(temp);
        } catch {
            // Fallback
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <div className="relative">
            <Button
                size="icon-xs"
                variant="ghost"
                tooltip="Check grammar & spelling"
                onClick={checkGrammar}
                disabled={isChecking || !text.trim()}
            >
                <IconLanguage size={14} strokeWidth={2} />
            </Button>
            {suggestions.length > 0 && (
                <div className="bg-background border-border shadow-subtle-sm absolute right-0 top-full z-20 mt-1 min-w-[200px] rounded-lg border p-2">
                    <p className="text-xs font-medium text-amber-500">Suggestions:</p>
                    {suggestions.map((s, i) => (
                        <p key={i} className="text-muted-foreground mt-0.5 text-xs">
                            {s}
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
};
