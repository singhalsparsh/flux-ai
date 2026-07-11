'use client';
import { LOCAL_MODELS, LocalModelDefinition, getTierLabel } from '@repo/shared/config';
import { Badge, Button, Dialog, DialogContent, DialogFooter, Input } from '@repo/ui';
import { IconCpu, IconDeviceLaptop, IconPlayerStop, IconRobot, IconTrash } from '@tabler/icons-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocalAIStore } from '../../store/local-ai.store';
import { useLocalLLM } from '../../hooks/use-local-llm';

function DeviceCheckDialog({
    open,
    onOpenChange,
    model,
    onConfirm,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    model: LocalModelDefinition | null;
    onConfirm: () => void;
}) {
    const [holdProgress, setHoldProgress] = useState(0);
    const holdInterval = useRef<ReturnType<typeof setInterval> | null>(null);
    const holdStarted = useRef(false);

    const startHold = useCallback(() => {
        if (holdStarted.current) return;
        holdStarted.current = true;
        setHoldProgress(0);
        holdInterval.current = setInterval(() => {
            setHoldProgress(prev => {
                const next = prev + 5;
                if (next >= 100) {
                    clearInterval(holdInterval.current!);
                    holdInterval.current = null;
                    holdStarted.current = false;
                    setHoldProgress(0);
                    onConfirm();
                    onOpenChange(false);
                    return 100;
                }
                return next;
            });
        }, 100);
    }, [onConfirm, onOpenChange]);

    const cancelHold = useCallback(() => {
        if (holdInterval.current) {
            clearInterval(holdInterval.current);
            holdInterval.current = null;
        }
        holdStarted.current = false;
        setHoldProgress(0);
    }, []);

    useEffect(() => {
        if (!open) {
            cancelHold();
        }
    }, [open, cancelHold]);

    if (!model) return null;

    const ramMb = model.ramRequired;
    const ramGb = (ramMb / 1024).toFixed(1);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent ariaTitle="Device Check" className="!max-w-md max-sm:!max-w-[92vw]">
                <div className="flex flex-col gap-4 max-sm:gap-3">
                    <h3 className="text-lg font-bold max-sm:text-base">Device Compatibility Check</h3>

                    <div className="bg-secondary rounded-lg p-3">
                        <div className="mb-2 flex items-center gap-2">
                            <IconRobot size={18} strokeWidth={2} />
                            <span className="font-medium">{model.name}</span>
                        </div>
                        <p className="text-muted-foreground text-sm">{model.description}</p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground flex items-center gap-1">
                                <IconCpu size={14} /> RAM Required
                            </span>
                            <span className="font-medium">{ramGb} GB</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground flex items-center gap-1">
                                <IconDeviceLaptop size={14} /> Context Length
                            </span>
                            <span className="font-medium">
                                {(model.ctxLength / 1024).toFixed(0)}K tokens
                            </span>
                        </div>
                    </div>

                    <div className="bg-warning/10 border-warning/20 text-warning rounded-lg border p-3 text-xs">
                        {ramMb > 8192
                            ? '⚠️ This model requires significant RAM. It may run slowly or fail on devices with less than recommended memory.'
                            : ramMb > 4096
                              ? 'ℹ️ This model needs moderate RAM. Should work on most modern devices.'
                              : '✅ This model is lightweight and should run on most devices.'}
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <p className="text-muted-foreground text-xs">
                            {holdProgress > 0
                                ? 'Keep holding...'
                                : 'Click and hold to start downloading'}
                        </p>
                        <button
                            onMouseDown={startHold}
                            onMouseUp={cancelHold}
                            onMouseLeave={cancelHold}
                            onTouchStart={startHold}
                            onTouchEnd={cancelHold}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 relative h-12 w-full cursor-pointer overflow-hidden rounded-full text-sm font-medium transition-colors"
                        >
                            <div
                                className="bg-primary-foreground/20 absolute left-0 top-0 h-full transition-all"
                                style={{ width: `${holdProgress}%` }}
                            />
                            <span className="relative z-10">
                                {holdProgress > 0
                                    ? `Hold... ${holdProgress}%`
                                    : 'Click & Hold to Install'}
                            </span>
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function TierSection({
    tier,
    models,
    onLoadModel,
}: {
    tier: string;
    models: LocalModelDefinition[];
    onLoadModel: (model: LocalModelDefinition) => void;
}) {
    const downloadedModels = useLocalAIStore(state => state.downloadedModels);
    const selectedModelId = useLocalAIStore(state => state.selectedModelId);
    const loadedModelId = useLocalAIStore(state => state.loadedModelId);
    const isModelLoaded = useLocalAIStore(state => state.isModelLoaded);
    const isLoading = useLocalAIStore(state => state.isLoading);

    if (models.length === 0) return null;

    return (
        <div className="mb-4">
            <h4 className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wider">
                {getTierLabel(tier as any)}
            </h4>
            <div className="flex flex-col gap-2">
                {models.map(model => {
                    const isDownloaded = downloadedModels.includes(model.id);
                    const isSelected = selectedModelId === model.id;
                    const isCurrentlyLoaded = loadedModelId === model.id && isModelLoaded;
                    // Allow re-loading if downloaded but not currently loaded
                    const canReload = isDownloaded && !isCurrentlyLoaded;
                    const isThisModelLoading = isLoading && (selectedModelId === model.id || loadedModelId === model.id);
                    const buttonLabel = isCurrentlyLoaded ? 'Loaded' : isThisModelLoading ? 'Loading...' : canReload ? 'Load' : isDownloaded ? 'Downloaded' : 'Load';
                    const buttonDisabled = isCurrentlyLoaded || isThisModelLoading;
                    return (
                        <div
                            key={model.id}
                            className={`border-border bg-secondary hover:bg-tertiary flex flex-col gap-2 rounded-lg border p-3 transition-colors ${
                                isSelected ? 'ring-brand ring-1' : ''
                            }`}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex min-w-0 flex-1 flex-col">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold">{model.name}</span>
                                        <Badge variant="outline" className="text-[10px]">
                                            {model.quantization || 'q4f16_1'}
                                        </Badge>
                                    </div>
                                    <span className="text-muted-foreground mt-0.5 text-xs">
                                        {model.description}
                                    </span>
                                    <span className="text-brand/80 mt-0.5 text-[10px]">
                                        🎯 {model.useCase}
                                    </span>
                                    <div className="mt-1 flex items-center gap-3 text-[10px] text-muted-foreground">
                                        <span>💾 {Math.round(model.ramRequired / 1024)} GB RAM</span>
                                        <span>📏 {(model.ctxLength / 1024).toFixed(0)}K ctx</span>
                                    </div>
                                </div>
                                <Button
                                    size="xs"
                                    variant={isCurrentlyLoaded ? 'secondary' : 'default'}
                                    disabled={buttonDisabled}
                                    className={
                                        isCurrentlyLoaded
                                            ? 'text-muted-foreground/50 cursor-not-allowed opacity-50'
                                            : ''
                                    }
                                    onClick={() => onLoadModel(model)}
                                >
                                    {buttonLabel}
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export function LocalAISettings() {
    const { loadModel, unloadModel, isLoading, isLoaded, error, progress, selectedModelId } =
        useLocalLLM();
    const store = useLocalAIStore();
    const [deviceCheckModel, setDeviceCheckModel] = useState<LocalModelDefinition | null>(null);

    const handleLoadModel = async (model: LocalModelDefinition) => {
        store.setSelectedModelId(model.id);
        try {
            await loadModel(model.id);
            store.addDownloadedModel(model.id);
        } catch (err) {
            // Error is handled by the store
        }
    };

    const handleDeviceCheckConfirm = () => {
        if (deviceCheckModel) {
            handleLoadModel(deviceCheckModel);
            setDeviceCheckModel(null);
        }
    };

    // Group by tier
    const tiers = ['small', 'medium', 'large', 'ultra'] as const;
    const groupedModels = tiers.map(tier => ({
        tier,
        models: LOCAL_MODELS.filter(m => m.tier === tier),
    }));

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col">
                <h2 className="flex items-center gap-1 text-base font-semibold">
                    Local AI Models
                </h2>
                <p className="text-muted-foreground text-xs">
                    Download and run AI models directly in your browser using WebGPU. No server
                    required — everything runs locally on your machine.
                </p>
            </div>

            {/* Loading / Loaded state */}
            {isLoading && (
                <div className="bg-secondary rounded-lg p-3">
                    <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium">Loading model...</span>
                        <span className="text-sm">{Math.round(progress)}%</span>
                    </div>
                    <div className="bg-secondary h-2 w-full overflow-hidden rounded-full">
                        <div className="bg-brand h-full rounded-full transition-all" style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} />
                    </div>
                    <p className="text-muted-foreground mt-1 text-xs">
                        Downloading and initializing model. This may take a few minutes.
                    </p>
                </div>
            )}

            {isLoaded && (
                <div className="bg-brand/10 border-brand/20 rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-green-600">
                                ✅ Model loaded: {store.loadedModelId || selectedModelId}
                            </span>
                            <span className="text-muted-foreground text-xs">
                                Ready to generate responses locally.
                            </span>
                        </div>
                        <Button
                            size="xs"
                            variant="destructive"
                            onClick={() => unloadModel()}
                        >
                            <IconPlayerStop size={12} strokeWidth={2} />
                            Unload
                        </Button>
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-destructive/10 border-destructive/20 rounded-lg border p-3">
                    <p className="text-destructive text-sm font-medium">{error}</p>
                </div>
            )}

            {/* Model list grouped by tier */}
            <div className="no-scrollbar max-h-[400px] overflow-y-auto max-sm:max-h-[50vh]">
                {groupedModels.map(group => (
                    <TierSection
                        key={group.tier}
                        tier={group.tier}
                        models={group.models}
                        onLoadModel={model => setDeviceCheckModel(model)}
                    />
                ))}
            </div>

            <DeviceCheckDialog
                open={deviceCheckModel !== null}
                onOpenChange={open => {
                    if (!open) setDeviceCheckModel(null);
                }}
                model={deviceCheckModel}
                onConfirm={handleDeviceCheckConfirm}
            />
        </div>
    );
}
