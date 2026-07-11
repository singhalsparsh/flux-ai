'use client';
import { useMcpToolsStore } from '@repo/common/store';
import { Alert, AlertDescription, DialogFooter } from '@repo/ui';
import { Button } from '@repo/ui/src/components/button';
import { IconBolt, IconBoltFilled, IconCpu, IconDatabase, IconFileTypePdf, IconKey, IconSettings2, IconSun, IconTrash } from '@tabler/icons-react';

import { Badge, cn, Dialog, DialogContent, Input } from '@repo/ui';

import { useChatEditor } from '@repo/common/hooks';
import { useTheme } from 'next-themes';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import { PROVIDER_IDS, PROVIDER_INFO, useApiKeysStore } from '../store/api-keys.store';
import { SETTING_TABS, useAppStore } from '../store/app.store';
import { useChatStore, useLocalAIStore } from '../store';
import { ChatEditor } from './chat-input';
import { LocalAISettings } from './local-ai/local-ai-settings';
import { BYOKIcon, ToolIcon } from './icons';
import { ExportReportButton } from './export-report';

export const SettingsModal = () => {
    const isSettingOpen = useAppStore(state => state.isSettingsOpen);
    const setIsSettingOpen = useAppStore(state => state.setIsSettingsOpen);
    const settingTab = useAppStore(state => state.settingTab);
    const setSettingTab = useAppStore(state => state.setSettingTab);

    const settingMenu = [
        {
            icon: <IconSettings2 size={16} strokeWidth={2} className="text-muted-foreground" />,
            title: 'Customize',
            key: SETTING_TABS.PERSONALIZATION,
            component: <PersonalizationSettings />,
        },
        {
            icon: <IconSun size={16} strokeWidth={2} className="text-muted-foreground" />,
            title: 'Theme',
            key: SETTING_TABS.THEME,
            component: <ThemeSettings />,
        },
        {
            icon: <IconBolt size={16} strokeWidth={2} className="text-muted-foreground" />,
            title: 'Usage',
            key: SETTING_TABS.CREDITS,
            component: <CreditsSettings />,
        },
        {
            icon: <IconKey size={16} strokeWidth={2} className="text-muted-foreground" />,
            title: 'API Keys',
            key: SETTING_TABS.API_KEYS,
            component: <ApiKeySettings />,
        },
        {
            icon: <IconCpu size={16} strokeWidth={2} className="text-muted-foreground" />,
            title: 'Local AI',
            key: SETTING_TABS.LOCAL_AI,
            component: <LocalAISettings />,
        },
        {
            icon: <IconDatabase size={16} strokeWidth={2} className="text-muted-foreground" />,
            title: 'Storage',
            key: SETTING_TABS.STORAGE,
            component: <StorageSettings />,
        },
        {
            icon: <IconFileTypePdf size={16} strokeWidth={2} className="text-muted-foreground" />,
            title: 'Export',
            key: SETTING_TABS.EXPORT,
            component: <ExportSettings />,
        },
    ];

    return (
        <Dialog open={isSettingOpen} onOpenChange={() => setIsSettingOpen(false)}>
            <DialogContent
                ariaTitle="Settings"
                className="glass-ultra h-full max-h-[600px] !max-w-[760px] overflow-x-hidden rounded-xl p-0 max-sm:!max-w-[96vw] max-sm:!max-h-[85dvh] max-sm:rounded-lg"
            >
                <div className="no-scrollbar relative max-w-full overflow-y-auto overflow-x-hidden">
                    <h3 className="border-border mx-5 border-b py-4 text-lg font-bold">Settings</h3>
                    <div className="flex flex-row gap-6 p-4 max-sm:flex-col max-sm:gap-3 max-sm:p-3">
                        <div className="flex w-[160px] shrink-0 flex-col gap-1 max-sm:w-full max-sm:flex-row max-sm:overflow-x-auto max-sm:pb-1">
                            {settingMenu.map(setting => (
                                <Button
                                    key={setting.key}
                                    rounded="full"
                                    className="justify-start max-sm:shrink-0 max-sm:text-xs"
                                    variant={settingTab === setting.key ? 'secondary' : 'ghost'}
                                    onClick={() => setSettingTab(setting.key)}
                                >
                                    {setting.icon}
                                    {setting.title}
                                </Button>
                            ))}
                        </div>
                        <div className="flex flex-1 flex-col overflow-hidden px-4 max-sm:px-2">
                            {settingMenu.find(setting => setting.key === settingTab)?.component}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export const MCPSettings = () => {
    const [isAddToolDialogOpen, setIsAddToolDialogOpen] = useState(false);
    const { mcpConfig, addMcpConfig, removeMcpConfig, updateSelectedMCP, selectedMCP } =
        useMcpToolsStore();

    return (
        <div className="flex w-full flex-col gap-6 overflow-x-hidden">
            <div className="flex flex-col">
                <h2 className="flex items-center gap-1 text-base font-medium">MCP Tools</h2>
                <p className="text-muted-foreground text-xs">
                    Connect your MCP tools. This will only work with your own API keys.
                </p>
            </div>
            <div className="flex flex-col gap-2">
                <p className="text-muted-foreground text-xs font-medium">
                    Connected Tools{' '}
                    <Badge
                        variant="secondary"
                        className="text-brand inline-flex items-center gap-1 rounded-full bg-transparent"
                    >
                        <span className="bg-brand inline-block size-2 rounded-full"></span>
                        {mcpConfig && Object.keys(mcpConfig).length} Connected
                    </Badge>
                </p>
                {mcpConfig &&
                    Object.keys(mcpConfig).length > 0 &&
                    Object.keys(mcpConfig).map(key => (
                        <div
                            key={key}
                            className="bg-secondary divide-border border-border flex h-12 w-full flex-1 flex-row items-center gap-2 divide-x-2 rounded-lg border px-2.5 py-2"
                        >
                            <div className="flex w-full flex-row items-center gap-2">
                                <ToolIcon /> <Badge>{key}</Badge>
                                <p className="text-muted-foreground line-clamp-1 flex-1 text-sm">
                                    {mcpConfig[key]}
                                </p>
                                <Button
                                    size="xs"
                                    variant="ghost"
                                    tooltip="Delete Tool"
                                    onClick={() => {
                                        removeMcpConfig(key);
                                    }}
                                >
                                    <IconTrash
                                        size={14}
                                        strokeWidth={2}
                                        className="text-muted-foreground"
                                    />
                                </Button>
                            </div>
                        </div>
                    ))}

                <Button
                    size="sm"
                    rounded="full"
                    className="mt-2 self-start"
                    onClick={() => setIsAddToolDialogOpen(true)}
                >
                    Add Tool
                </Button>
            </div>

            <div className="mt-6 border-t border-dashed pt-6">
                <p className="text-muted-foreground text-xs">Learn more about MCP:</p>
                <div className="mt-2 flex flex-col gap-2 text-sm">
                    <a
                        href="https://mcp.composio.dev"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary inline-flex items-center hover:underline"
                    >
                        Browse Composio MCP Directory →
                    </a>
                    <a
                        href="https://www.anthropic.com/news/model-context-protocol"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary inline-flex items-center hover:underline"
                    >
                        Read MCP Documentation →
                    </a>
                </div>
            </div>

            <AddToolDialog
                isOpen={isAddToolDialogOpen}
                onOpenChange={setIsAddToolDialogOpen}
                onAddTool={addMcpConfig}
            />
        </div>
    );
};

type AddToolDialogProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onAddTool: (tool: Record<string, string>) => void;
};

const AddToolDialog = ({ isOpen, onOpenChange, onAddTool }: AddToolDialogProps) => {
    const [mcpToolName, setMcpToolName] = useState('');
    const [mcpToolUrl, setMcpToolUrl] = useState('');
    const [error, setError] = useState('');
    const { mcpConfig } = useMcpToolsStore();

    const handleAddTool = () => {
        // Validate inputs
        if (!mcpToolName.trim()) {
            setError('Tool name is required');
            return;
        }

        if (!mcpToolUrl.trim()) {
            setError('Tool URL is required');
            return;
        }

        // Check for duplicate names
        if (mcpConfig && mcpConfig[mcpToolName]) {
            setError('A tool with this name already exists');
            return;
        }

        // Clear error if any
        setError('');

        // Add the tool
        onAddTool({
            [mcpToolName]: mcpToolUrl,
        });

        // Reset form and close dialog
        setMcpToolName('');
        setMcpToolUrl('');
        onOpenChange(false);
    };

    // Reset error when dialog opens/closes
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setError('');
            setMcpToolName('');
            setMcpToolUrl('');
        }
        onOpenChange(open);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent ariaTitle="Add MCP Tool" className="!max-w-md">
                <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-bold">Add New MCP Tool</h3>

                    {error && <p className="text-destructive text-sm font-medium">{error}</p>}

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Tool Name</label>
                        <Input
                            placeholder="Tool Name"
                            value={mcpToolName}
                            onChange={e => {
                                const key = e.target.value?.trim().toLowerCase().replace(/ /g, '-');
                                setMcpToolName(key);
                                // Clear error when user types
                                if (error) setError('');
                            }}
                        />
                        <p className="text-muted-foreground text-xs">
                            Will be automatically converted to lowercase with hyphens
                        </p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Tool Server URL</label>
                        <Input
                            placeholder="https://your-mcp-server.com"
                            value={mcpToolUrl}
                            onChange={e => {
                                setMcpToolUrl(e.target.value);
                                // Clear error when user types
                                if (error) setError('');
                            }}
                        />
                        <p className="text-muted-foreground text-xs">
                            Example: https://your-mcp-server.com
                        </p>
                    </div>
                </div>
                <DialogFooter className="border-border mt-4 border-t pt-4">
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="bordered"
                            rounded={'full'}
                            onClick={() => handleOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleAddTool} rounded="full">
                            Add Tool
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export const ApiKeySettings = () => {
    const apiKeys = useApiKeysStore(state => state.keys);
    const setKeys = useApiKeysStore(state => state.setKeys);
    const addKey = useApiKeysStore(state => state.addKey);
    const removeKey = useApiKeysStore(state => state.removeKey);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingProvider, setEditingProvider] = useState<string | null>(null);
    const [newKeyValue, setNewKeyValue] = useState('');

    const providerList = Object.entries(PROVIDER_INFO).filter(([id]) => {
        if (!searchTerm) return true;
        const info = PROVIDER_INFO[id];
        return info.name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const getMaskedKey = (key: string) => {
        if (!key) return '';
        return '•'.repeat(24) + key.slice(-4);
    };

    const handleAddKey = (provider: string) => {
        if (newKeyValue.trim()) {
            addKey(provider, newKeyValue.trim());
            setNewKeyValue('');
            setEditingProvider(null);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col">
                <h2 className="flex items-center gap-1 text-base font-semibold">
                    API Keys <BYOKIcon />
                </h2>
                <p className="text-muted-foreground text-xs">
                    By default, your API Key is stored locally on your browser and never sent anywhere else.
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                    Add multiple keys per provider for automatic fallback if one fails.
                </p>
            </div>

            <Input
                placeholder="Search providers..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="mb-2"
            />

            <div className="no-scrollbar flex max-h-[400px] flex-col gap-2 overflow-y-auto max-sm:max-h-[40vh]">
                {providerList.map(([id, info]) => {
                    const keys = apiKeys[id] || [];
                    return (
                        <div key={id} className="bg-secondary/50 rounded-lg border p-3">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">{info.name}</span>
                                    {keys.length > 0 && (
                                        <span className="bg-brand/10 text-brand rounded-full px-2 py-0.5 text-[10px] font-medium">
                                            {keys.length} key{keys.length > 1 ? 's' : ''}
                                        </span>
                                    )}
                                </div>
                                <a
                                    href={info.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-brand text-xs underline-offset-2 hover:underline"
                                >
                                    Get key
                                </a>
                            </div>

                            {/* Show existing keys */}
                            {keys.length > 0 && (
                                <div className="mt-2 flex flex-col gap-1">
                                    {keys.map((key, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <div className="flex flex-1 items-center gap-2 rounded-md border bg-white px-2 py-1 text-xs font-mono">
                                                {getMaskedKey(key)}
                                            </div>
                                            <Button
                                                size="icon-xs"
                                                variant="ghost"
                                                tooltip="Remove key"
                                                onClick={() => removeKey(id, idx)}
                                            >
                                                <IconTrash size={12} strokeWidth={2} />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add key input */}
                            {editingProvider === id ? (
                                <div className="mt-2 flex items-center gap-2">
                                    <Input
                                        value={newKeyValue}
                                        placeholder={`Enter ${info.name} API key`}
                                        onChange={e => setNewKeyValue(e.target.value)}
                                        className="flex-1"
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') handleAddKey(id);
                                            if (e.key === 'Escape') {
                                                setEditingProvider(null);
                                                setNewKeyValue('');
                                            }
                                        }}
                                    />
                                    <Button size="sm" variant="default" onClick={() => handleAddKey(id)}>
                                        Add
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                            setEditingProvider(null);
                                            setNewKeyValue('');
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    size="xs"
                                    variant="ghost"
                                    className="mt-2"
                                    onClick={() => setEditingProvider(id)}
                                >
                                    + Add API Key
                                </Button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export const CreditsSettings = () => {
    const remainingCredits = useChatStore(state => state.creditLimit.remaining);
    const maxLimit = useChatStore(state => state.creditLimit.maxLimit);
    const resetDate = useChatStore(state => state.creditLimit.reset);
    const isAuthenticated = useChatStore(state => state.creditLimit.isAuthenticated);

    const info = [
        {
            title: 'Plan',
            value: (
                <Badge variant="secondary" className="bg-brand/10 text-brand rounded-full">
                    <span className="text-xs font-medium">
                        {isAuthenticated ? 'UNLIMITED' : 'FREE'}
                    </span>
                </Badge>
            ),
        },
        {
            title: 'Usage',
            value: isAuthenticated ? (
                <span className="text-brand text-sm font-medium">∞ Unlimited</span>
            ) : (
                <div className="flex h-7 flex-row items-center gap-1 rounded-full py-1">
                    <IconBoltFilled size={14} strokeWidth={2} className="text-brand" />
                    <span className="text-brand text-sm font-medium">{remainingCredits ?? 0}</span>
                    <span className="text-brand text-sm opacity-50">/</span>
                    <span className="text-brand text-sm opacity-50">{maxLimit ?? 0}</span>
                </div>
            ),
        },
        ...(resetDate
            ? [
                  {
                      title: 'Next reset',
                      value: moment(resetDate).fromNow(),
                  },
              ]
            : []),
    ];

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col items-start gap-2">
                <h2 className="flex items-center gap-1 text-base font-medium">Usage</h2>
                <Alert variant="info" className="w-full">
                    <AlertDescription className="text-muted-foreground/70 text-sm leading-tight">
                        {isAuthenticated
                            ? 'You have unlimited usage. Add your own API keys in the API Keys section to use your own quota.'
                            : 'You\'ll receive free credits everyday. Once credits are used, you can use your own API keys to continue.'}
                    </AlertDescription>
                </Alert>

                <div className="divide-border flex w-full flex-col gap-1 divide-y">
                    {info.map(item => (
                        <div key={item.title} className="flex flex-row justify-between gap-1 py-4">
                            <span className="text-muted-foreground text-sm">{item.title}</span>
                            <span className="text-sm font-medium">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const MAX_CHAR_LIMIT = 6000;

export const PersonalizationSettings = () => {
    const customInstructions = useChatStore(state => state.customInstructions);
    const setCustomInstructions = useChatStore(state => state.setCustomInstructions);
    const { editor } = useChatEditor({
        charLimit: MAX_CHAR_LIMIT,
        defaultContent: customInstructions,
        placeholder: 'Enter your custom instructions',
        enableEnter: true,
        onUpdate(props) {
            setCustomInstructions(props.editor.getText());
        },
    });
    return (
        <div className="flex flex-col gap-1 pb-3">
            <h3 className="text-base font-semibold">Customize your AI Response</h3>
            <p className="text-muted-foreground text-sm">
                These instructions will be added to the beginning of every message.
            </p>
            <div className=" shadow-subtle-sm border-border mt-2 rounded-lg border p-3">
                <ChatEditor editor={editor} />
            </div>
        </div>
    );
};

const ACCENT_COLORS = [
    { name: 'Ocean', value: '#0ea5e9', variable: '199 95% 56%' },   // brand
    { name: 'Emerald', value: '#10b981', variable: '160 85% 45%' },
    { name: 'Violet', value: '#8b5cf6', variable: '260 85% 60%' },
    { name: 'Rose', value: '#f43f5e', variable: '348 90% 58%' },
    { name: 'Amber', value: '#f59e0b', variable: '38 95% 50%' },
    { name: 'Cyan', value: '#06b6d4', variable: '188 95% 48%' },
    { name: 'Lime', value: '#84cc16', variable: '80 85% 45%' },
    { name: 'Pink', value: '#ec4899', variable: '330 85% 60%' },
];

export const ThemeSettings = () => {
    const { theme, setTheme } = useTheme();

    const handleAccentChange = (accent: string, variable: string) => {
        // Store the accent hue values for the brand/accent CSS variables
        localStorage.setItem('accent-color-css', variable);
        // Apply to :root via document.documentElement style
        const root = document.documentElement;
        const [h, s, l] = variable.split(' ').map(v => parseFloat(v));
        root.style.setProperty('--brand', `${h} ${s}% ${l}%`);
        root.style.setProperty('--brand-foreground', `${h} 90% 96%`);
        // Also update accent to a slightly different variant
        root.style.setProperty('--accent', `${h} 85% ${Math.min(l + 10, 80)}%`);
        root.style.setProperty('--accent-foreground', `${h} 90% 96%`);
        // Persist the accent name for reference
        localStorage.setItem('fluxai-accent', accent);
    };

    // Restore accent on mount
    useEffect(() => {
        const savedAccent = localStorage.getItem('accent-color-css');
        if (savedAccent) {
            const root = document.documentElement;
            const [h, s, l] = savedAccent.split(' ').map(v => parseFloat(v));
            if (!isNaN(h)) {
                root.style.setProperty('--brand', `${h} ${s}% ${l}%`);
                root.style.setProperty('--brand-foreground', `${h} 90% 96%`);
                root.style.setProperty('--accent', `${h} 85% ${Math.min(l + 10, 80)}%`);
                root.style.setProperty('--accent-foreground', `${h} 90% 96%`);
            }
        }
    }, []);

    return (
        <div className="flex flex-col gap-6 pb-3">
            <div className="flex flex-col">
                <h3 className="text-base font-semibold">Theme</h3>
                <p className="text-muted-foreground text-sm">
                    Switch between dark and light mode, or choose an accent color.
                </p>
            </div>

            {/* Dark / Light Toggle */}
            <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">Mode</span>
                <div className="flex flex-row gap-2">
                    {[
                        { key: 'light', label: 'Light', icon: '☀️' },
                        { key: 'dark', label: 'Dark', icon: '🌙' },
                        { key: 'system', label: 'System', icon: '💻' },
                    ].map(option => (
                        <button
                            key={option.key}
                            onClick={() => setTheme(option.key)}
                            className={cn(
                                'flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all max-sm:px-2 max-sm:py-2 max-sm:text-xs',
                                theme === option.key
                                    ? 'border-brand bg-brand/10 text-brand shadow-subtle-xs'
                                    : 'border-border bg-background/50 text-muted-foreground hover:bg-tertiary'
                            )}
                        >
                            <span>{option.icon}</span>
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Accent Color Picker */}
            <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">Accent Color</span>
                <div className="flex flex-row flex-wrap gap-2 max-sm:gap-1.5">
                    {ACCENT_COLORS.map(color => {
                        const isActive = (localStorage.getItem('fluxai-accent') || 'Ocean') === color.name;
                        return (
                            <button
                                key={color.name}
                                onClick={() => handleAccentChange(color.value, color.variable)}
                                className={cn(
                                    'flex h-10 w-10 items-center justify-center rounded-full transition-all max-sm:h-8 max-sm:w-8',
                                    isActive && 'ring-2 ring-offset-2 ring-offset-background'
                                )}
                                style={{ backgroundColor: color.value }}
                                title={color.name}
                            >
                                {isActive && (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                )}
                            </button>
                        );
                    })}
                </div>
                <p className="text-muted-foreground text-xs">
                    Accent color applies to buttons, links, and highlights throughout the UI.
                </p>
            </div>
        </div>
    );
};

export const StorageSettings = () => {
    const clearAllThreads = useChatStore(state => state.clearAllThreads);
    const clearDownloadedModels = useLocalAIStore(state => state.clearDownloadedModels);
    const [storageUsage, setStorageUsage] = useState({ used: 0, quota: 0 });
    const [isClearing, setIsClearing] = useState(false);

    const estimateStorage = useCallback(async () => {
        try {
            if (navigator.storage?.estimate) {
                const est = await navigator.storage.estimate();
                setStorageUsage({
                    used: est.usage || 0,
                    quota: est.quota || 0,
                });
            }
        } catch {
            // Storage API not available
        }
    }, []);

    useEffect(() => {
        estimateStorage();
    }, [estimateStorage]);

    const clearModelCache = useCallback(async () => {
        setIsClearing(true);
        try {
            // Clear IndexedDB databases used by web-llm
            const dbs = await indexedDB.databases?.();
            if (dbs) {
                for (const db of dbs) {
                    if (db.name?.includes('webllm') || db.name?.includes('mlc') || db.name?.includes('llm')) {
                        indexedDB.deleteDatabase(db.name);
                    }
                }
            } else {
                // Fallback: delete known databases
                indexedDB.deleteDatabase('webllm');
                indexedDB.deleteDatabase('mlc');
                indexedDB.deleteDatabase('webllm_cache');
            }

            // Clear any cached model blobs
            if ('caches' in window) {
                try {
                    const cacheKeys = await caches.keys();
                    for (const key of cacheKeys) {
                        if (key.includes('webllm') || key.includes('mlc') || key.includes('llm')) {
                            await caches.delete(key);
                        }
                    }
                } catch { /* ignore */ }
            }

            clearDownloadedModels();
            // Wait a tick for databases to be deleted, then re-estimate
            await new Promise(r => setTimeout(r, 500));
            await estimateStorage();
        } catch {
            console.error('Failed to clear model cache');
        } finally {
            setIsClearing(false);
        }
    }, [clearDownloadedModels, estimateStorage]);

    const handleFactoryReset = async () => {
        if (confirm('This will clear all data including chat history, API keys, and settings. Are you sure?')) {
            clearAllThreads();
            clearDownloadedModels();

            // Clear IndexedDB databases
            try {
                const dbs = await indexedDB.databases?.();
                if (dbs) {
                    for (const db of dbs) {
                        if (db.name) {
                            indexedDB.deleteDatabase(db.name);
                        }
                    }
                }
            } catch {
                // Fallback: delete known databases
                indexedDB.deleteDatabase('ThreadDatabase');
                indexedDB.deleteDatabase('webllm');
                indexedDB.deleteDatabase('mlc');
            }

            // Clear all cached storage
            if (navigator.storage?.estimate) {
                try {
                    // Request persistent storage cleanup
                    const est = await navigator.storage.estimate();
                    if (est.usage && est.usage > 0) {
                        await navigator.storage?.persist?.();
                    }
                } catch { /* ignore */ }
            }

            localStorage.clear();
            // Re-estimate after clear
            await estimateStorage();
            window.location.reload();
        }
    };

    const usedMB = (storageUsage.used / 1024 / 1024).toFixed(1);
    const quotaMB = (storageUsage.quota / 1024 / 1024).toFixed(1);
    const usagePercent = storageUsage.quota > 0 ? (storageUsage.used / storageUsage.quota) * 100 : 0;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col">
                <h2 className="flex items-center gap-1 text-base font-medium">Storage</h2>
                <p className="text-muted-foreground text-xs">
                    Manage browser storage used by the app.
                </p>
            </div>

            {/* Browser Storage Usage */}
            {storageUsage.quota > 0 && (
                <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium">Browser Storage</span>
                    <div className="bg-secondary h-2 w-full overflow-hidden rounded-full">
                        <div
                            className="bg-brand h-full rounded-full transition-all"
                            style={{ width: `${Math.min(100, usagePercent)}%` }}
                        />
                    </div>
                    <span className="text-muted-foreground text-xs">
                        {usedMB} MB / {quotaMB} MB used
                    </span>
                </div>
            )}

            <div className="flex flex-col gap-2">
                <Button
                    variant="bordered"
                    size="sm"
                    rounded="full"
                    className="justify-start"
                    onClick={() => {
                        clearAllThreads();
                        // Re-estimate after a moment for IndexedDB cleanup
                        setTimeout(() => estimateStorage(), 500);
                    }}
                >
                    <IconTrash size={14} strokeWidth={2} />
                    Clear Chat History
                </Button>
                <Button
                    variant="bordered"
                    size="sm"
                    rounded="full"
                    className="justify-start"
                    onClick={clearModelCache}
                    disabled={isClearing}
                >
                    <IconTrash size={14} strokeWidth={2} />
                    {isClearing ? 'Clearing...' : 'Clear Model Cache'}
                </Button>
                <Button
                    variant="destructive"
                    size="sm"
                    rounded="full"
                    className="justify-start"
                    onClick={handleFactoryReset}
                >
                    <IconTrash size={14} strokeWidth={2} />
                    Factory Reset
                </Button>
            </div>
        </div>
    );
};

export const ExportSettings = () => {
    const threads = useChatStore(state => state.threads);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col">
                <h2 className="flex items-center gap-1 text-base font-medium">Export Report</h2>
                <p className="text-muted-foreground text-xs">
                    Generate a full PDF report of all your conversations.
                </p>
            </div>

            <div className="bg-secondary/30 rounded-xl border p-5">
                <div className="flex flex-col gap-3">
                    <h3 className="text-sm font-semibold">Full Conversation Report</h3>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                        Exports the last 50 threads as a print-ready PDF document including:
                    </p>
                    <ul className="text-muted-foreground flex flex-col gap-1.5 text-xs">
                        <li className="flex items-start gap-2">
                            <span className="text-brand mt-0.5">✦</span>
                            Executive summary with total chats, messages, tokens &amp; time
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-brand mt-0.5">✦</span>
                            Full chat history — every prompt and AI response
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-brand mt-0.5">✦</span>
                            Model used per conversation
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-brand mt-0.5">✦</span>
                            Token counts and elapsed time per thread
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-brand mt-0.5">✦</span>
                            Clickable table of contents / index
                        </li>
                    </ul>

                    <div className="border-border mt-2 border-t pt-4">
                        <ExportReportButton />
                    </div>

                    {threads.length === 0 && (
                        <p className="text-muted-foreground mt-2 text-xs">
                            No conversations to export yet. Start chatting to generate data.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
