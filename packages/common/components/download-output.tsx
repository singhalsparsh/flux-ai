'use client';
import { Button, cn } from '@repo/ui';
import {
    IconBrandWindows,
    IconDownload,
    IconFileTypeDocx,
    IconFileTypePdf,
    IconPhoto,
    IconTxt,
} from '@tabler/icons-react';
import { useState } from 'react';

type DownloadFormat = 'txt' | 'docx' | 'pdf' | 'png';

type DownloadOutputProps = {
    content: string;
    title?: string;
    className?: string;
};

export const DownloadOutput = ({ content, title = 'output', className }: DownloadOutputProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const downloadAsTxt = () => {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        setIsOpen(false);
    };

    const downloadAsDocx = async () => {
        // Simple HTML-to-DOCX approach: wrap in minimal HTML
        const htmlContent = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>${title}</title></head>
<body>${content.replace(/\n/g, '<br>')}</body>
</html>`;
        const blob = new Blob([htmlContent], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title}.docx`;
        a.click();
        URL.revokeObjectURL(url);
        setIsOpen(false);
    };

    const downloadAsPdf = () => {
        // Use browser print to PDF
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                <head><title>${title}</title>
                <style>
                    body { font-family: system-ui, sans-serif; padding: 2rem; line-height: 1.6; }
                    pre { white-space: pre-wrap; }
                </style>
                </head>
                <body><pre>${content}</pre></body>
                </html>
            `);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
        }
        setIsOpen(false);
    };

    const downloadAsPng = async () => {
        // Create a canvas from the content
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const lines = content.split('\n');
        const lineHeight = 20;
        const padding = 20;
        const maxWidth = 800;
        canvas.width = maxWidth;
        canvas.height = Math.max(200, lines.length * lineHeight + padding * 2);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#000000';
        ctx.font = '14px system-ui, sans-serif';

        lines.forEach((line, i) => {
            ctx.fillText(line.slice(0, 100), padding, padding + (i + 1) * lineHeight);
        });

        const link = document.createElement('a');
        link.download = `${title}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        setIsOpen(false);
    };

    const downloadOptions: { label: string; format: DownloadFormat; icon: React.ReactNode; action: () => void }[] = [
        { label: 'Text (.txt)', format: 'txt', icon: <IconTxt size={14} />, action: downloadAsTxt },
        { label: 'Document (.docx)', format: 'docx', icon: <IconFileTypeDocx size={14} />, action: downloadAsDocx },
        { label: 'PDF (.pdf)', format: 'pdf', icon: <IconFileTypePdf size={14} />, action: downloadAsPdf },
        { label: 'Image (.png)', format: 'png', icon: <IconPhoto size={14} />, action: downloadAsPng },
    ];

    if (!content) return null;

    return (
        <div className={cn('relative', className)}>
            <Button
                size="icon-xs"
                variant="ghost"
                tooltip="Download output"
                onClick={() => setIsOpen(!isOpen)}
            >
                <IconDownload size={14} strokeWidth={2} />
            </Button>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="bg-background border-border shadow-subtle-sm absolute right-0 top-full z-20 mt-1 flex min-w-[140px] flex-col gap-0.5 rounded-lg border p-1">
                        {downloadOptions.map(opt => (
                            <button
                                key={opt.format}
                                onClick={opt.action}
                                className="hover:bg-secondary flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs transition-colors"
                            >
                                {opt.icon}
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
