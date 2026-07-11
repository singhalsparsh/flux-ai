'use client';
import { Button, cn } from '@repo/ui';
import { IconLanguage, IconLoader2, IconX } from '@tabler/icons-react';
import { useCallback, useRef, useState } from 'react';

type GrammarSuggestion = {
    message: string;
    replacements: string[];
    offset: number;
    length: number;
    rule: { issueType: string; category: string };
};

type GrammarCheckProps = {
    text: string;
    onFix?: (fixed: string) => void;
};

// Local dictionary fallback — common English misspellings
const COMMON_ERRORS: Record<string, string> = {
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
    'thier': 'their',
    'theres': "there's",
    'dissapear': 'disappear',
    'apparant': 'apparent',
    'occassionally': 'occasionally',
    'accomodate': 'accommodate',
    'embarass': 'embarrass',
    'harass': 'harass',
    'miniscule': 'minuscule',
    'misspel': 'misspell',
    'neigbour': 'neighbour',
    'noticable': 'noticeable',
    'posession': 'possession',
    'publically': 'publicly',
    'recomend': 'recommend',
    'refered': 'referred',
    'refering': 'referring',
    'relevent': 'relevant',
    'repetion': 'repetition',
    'resistence': 'resistance',
    'responsability': 'responsibility',
    'ritain': 'retain',
};

export const GrammarCheck = ({ text, onFix }: GrammarCheckProps) => {
    const [suggestions, setSuggestions] = useState<GrammarSuggestion[]>([]);
    const [localSuggestions, setLocalSuggestions] = useState<string[]>([]);
    const [isChecking, setIsChecking] = useState(false);
    const [showPanel, setShowPanel] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    const checkGrammar = useCallback(async () => {
        if (!text.trim()) return;
        setIsChecking(true);
        setShowPanel(true);
        setSuggestions([]);
        setLocalSuggestions([]);

        try {
            // 1. Try LanguageTool public API (no key required)
            const apiResults = await fetchGrammarAPI(text);

            // 2. Add local dictionary matches for words the API might miss
            const localMatches = findLocalErrors(text);

            setSuggestions(apiResults);
            setLocalSuggestions(localMatches);
        } catch {
            // Fallback: local dictionary only
            setLocalSuggestions(findLocalErrors(text));
        } finally {
            setIsChecking(false);
        }
    }, [text]);

    const findLocalErrors = (input: string): string[] => {
        const words = input.split(/\b/);
        const found: string[] = [];
        const seen = new Set<string>();

        for (const word of words) {
            const clean = word.toLowerCase().replace(/[^a-z']/g, '');
            if (clean && COMMON_ERRORS[clean] && !seen.has(clean)) {
                seen.add(clean);
                found.push(`"${word}" → ${COMMON_ERRORS[clean]}`);
            }
        }

        return found.slice(0, 8);
    };

    const fetchGrammarAPI = async (input: string): Promise<GrammarSuggestion[]> => {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 8000);

            const res = await fetch('https://api.languagetool.org/v2/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    text: input,
                    language: 'en-US',
                    enabledOnly: 'false',
                    level: 'picky',
                }),
                signal: controller.signal,
            });

            clearTimeout(timeout);

            if (!res.ok) throw new Error(`API responded with ${res.status}`);

            const data = await res.json();

            // Filter to the most relevant issues (skip whitespace/punctuation only)
            return (data.matches || [])
                .filter(
                    (m: any) =>
                        m.replacements?.length > 0 &&
                        m.rule?.issueType !== 'misspelling' &&
                        m.message?.length > 0
                )
                .slice(0, 10)
                .map((m: any) => ({
                    message: m.message,
                    replacements: m.replacements.slice(0, 3).map((r: any) => r.value),
                    offset: m.offset,
                    length: m.length,
                    rule: {
                        issueType: m.rule?.issueType || 'unknown',
                        category: m.rule?.category?.name || 'General',
                    },
                }));
        } catch {
            // Return empty array — local dictionary will be used as fallback
            return [];
        }
    };

    const applyFix = (replacement: string) => {
        if (!onFix) return;
        // Apply the first replacement suggestion to the full text
        let result = text;
        for (const s of [...suggestions].reverse()) {
            if (s.replacements.length > 0) {
                const before = result.slice(0, s.offset);
                const after = result.slice(s.offset + s.length);
                result = before + replacement + after;
            }
        }
        onFix(result);
        setShowPanel(false);
    };

    const totalIssues = suggestions.length + localSuggestions.length;

    return (
        <div className="relative" ref={panelRef}>
            <Button
                size="icon-sm"
                variant={totalIssues > 0 ? 'secondary' : 'ghost-bordered'}
                tooltip={totalIssues > 0 ? `${totalIssues} issues found` : 'Check grammar & spelling'}
                onClick={() => {
                    if (showPanel) {
                        setShowPanel(false);
                    } else {
                        checkGrammar();
                    }
                }}
                disabled={isChecking || !text.trim()}
                className={cn(
                    totalIssues > 0 && 'text-amber-500'
                )}
            >
                {isChecking ? (
                    <IconLoader2 size={14} strokeWidth={2} className="animate-spin" />
                ) : (
                    <IconLanguage size={14} strokeWidth={2} />
                )}
            </Button>

            {showPanel && (
                <>
                    <div
                        className="fixed inset-0 z-30"
                        onClick={() => setShowPanel(false)}
                    />
                    <div className="bg-background border-border shadow-subtle-sm absolute right-0 top-full z-40 mt-1 min-w-[280px] max-w-[360px] rounded-xl border p-3">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-xs font-semibold">
                                {isChecking
                                    ? 'Checking...'
                                    : totalIssues > 0
                                      ? `Found ${totalIssues} issue${totalIssues > 1 ? 's' : ''}`
                                      : 'No issues found ✨'}
                            </p>
                            <button
                                onClick={() => setShowPanel(false)}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <IconX size={12} strokeWidth={2} />
                            </button>
                        </div>

                        {!isChecking && suggestions.length === 0 && localSuggestions.length === 0 && (
                            <p className="text-muted-foreground text-xs">
                                Your text looks good! No grammar or spelling issues detected.
                            </p>
                        )}

                        {suggestions.length > 0 && (
                            <div className="mb-2">
                                <p className="text-muted-foreground mb-1 text-[10px] font-medium uppercase tracking-wider">
                                    Grammar
                                </p>
                                {suggestions.slice(0, 5).map((s, i) => (
                                    <div
                                        key={i}
                                        className="border-border hover:bg-secondary mb-1 rounded-lg border p-2 transition-colors"
                                    >
                                        <p className="text-xs leading-relaxed">{s.message}</p>
                                        {s.replacements.length > 0 && (
                                            <div className="mt-1 flex flex-wrap gap-1">
                                                {s.replacements.slice(0, 3).map((rep, j) => (
                                                    <button
                                                        key={j}
                                                        onClick={() => applyFix(rep)}
                                                        className="bg-brand/10 text-brand hover:bg-brand/20 rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors"
                                                    >
                                                        {rep}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        <p className="text-muted-foreground/50 mt-0.5 text-[9px]">
                                            {s.rule.category}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {localSuggestions.length > 0 && (
                            <div>
                                <p className="text-muted-foreground mb-1 text-[10px] font-medium uppercase tracking-wider">
                                    Spelling
                                </p>
                                {localSuggestions.map((s, i) => (
                                    <p key={i} className="text-muted-foreground text-xs leading-relaxed">
                                        {s}
                                    </p>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};
