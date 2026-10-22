import { ChatMode, ChatModeConfig } from '@repo/shared/config';
import { useChatStore } from '@repo/common/store';
import { Button, Tooltip } from '@repo/ui';
import { IconAlertTriangle, IconPaperclip } from '@tabler/icons-react';
import { FC, useState } from 'react';

export type TImageUpload = {
    id: string;
    label: string;
    tooltip: string;
    showIcon: boolean;
    handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export const ImageUpload: FC<TImageUpload> = ({
    id,
    label,
    tooltip,
    showIcon,
    handleImageUpload,
}) => {
    const chatMode = useChatStore(state => state.chatMode);
    const [showWarning, setShowWarning] = useState(false);
    const isLocalMode = chatMode === ChatMode.LOCAL;

    const handleFileSelect = () => {
        if (isLocalMode) {
            setShowWarning(true);
            // Still allow upload, but warn
            setTimeout(() => setShowWarning(false), 3000);
        }
        document.getElementById(id)?.click();
    };

    if (!ChatModeConfig[chatMode]?.imageUpload) {
        return null;
    }

    return (
        <>
            <input type="file" id={id} className="hidden" onChange={handleImageUpload} />
            <div className="relative">
                <Tooltip content={tooltip}>
                    {showIcon ? (
                        <Button variant="ghost" size="icon-sm" onClick={handleFileSelect}>
                            <IconPaperclip size={16} strokeWidth={2} />
                        </Button>
                    ) : (
                        <Button variant="bordered" onClick={handleFileSelect}>
                            {label}
                        </Button>
                    )}
                </Tooltip>
                {showWarning && isLocalMode && (
                    <div className="absolute bottom-full left-1/2 z-50 mb-2 w-48 -translate-x-1/2 rounded-lg border border-amber-200 bg-amber-50 p-2 text-[10px] text-amber-700 shadow-lg">
                        <div className="flex items-center gap-1 font-medium">
                            <IconAlertTriangle size={12} /> Warning
                        </div>
                        <p className="mt-0.5">Local model may not support image input. Image will be sent as text description.</p>
                        <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-amber-200" />
                    </div>
                )}
            </div>
        </>
    );
};
