'use client';
import { useChatStore } from '@repo/common/store';
import { Thread, ThreadItem } from '@repo/shared/types';
import { Button } from '@repo/ui';
import { IconFileTypePdf, IconLoader2 } from '@tabler/icons-react';
import { useCallback, useState } from 'react';

export const ExportReportButton = () => {
    const threads = useChatStore(state => state.threads);
    const getAllThreadItems = useChatStore(state => state.getThreadItems);
    const [isExporting, setIsExporting] = useState(false);

    const generateReport = useCallback(async () => {
        setIsExporting(true);
        try {
            // Sort threads by date
            const sortedThreads = [...threads].sort(
                (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
            );

            // Collect all thread items
            const allItems: { thread: Thread; items: ThreadItem[] }[] = [];
            for (const thread of sortedThreads.slice(0, 50)) {
                try {
                    const items = await getAllThreadItems(thread.id);
                    allItems.push({ thread, items: items || [] });
                } catch {
                    allItems.push({ thread, items: [] });
                }
            }

            // Total stats
            let totalMessages = 0;
            let totalTokens = 0;
            let totalTime = 0;
            for (const { items } of allItems) {
                for (const item of items) {
                    if (item.answer?.text) totalMessages++;
                    totalTokens += Math.ceil((item.answer?.text?.length || 0) / 4);
                    totalTime += item.updatedAt?.getTime() - item.createdAt?.getTime();
                }
            }

            // Generate HTML
            const now = new Date().toLocaleString();
            const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>FluxAI — Full Report</title>
<style>
    @page { margin: 2cm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
        font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
        color: #1a1a2e;
        line-height: 1.7;
        padding: 40px;
        max-width: 900px;
        margin: 0 auto;
        background: #fafafa;
    }
    .cover {
        text-align: center;
        padding: 80px 40px;
        margin-bottom: 40px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 16px;
    }
    .cover h1 { font-size: 3em; margin-bottom: 10px; letter-spacing: -0.02em; }
    .cover p { opacity: 0.9; font-size: 1.1em; }
    .cover .date { margin-top: 20px; font-size: 0.9em; opacity: 0.7; }
    .toc { margin-bottom: 40px; }
    .toc h2 { font-size: 1.5em; margin-bottom: 15px; color: #667eea; }
    .toc ol { padding-left: 20px; }
    .toc li { margin-bottom: 6px; }
    .toc a { color: #764ba2; text-decoration: none; }
    .toc a:hover { text-decoration: underline; }
    .stats {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
        margin-bottom: 40px;
    }
    .stat-card {
        background: white;
        border-radius: 12px;
        padding: 20px;
        text-align: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        border: 1px solid #eaeaea;
    }
    .stat-card .number {
        font-size: 2em;
        font-weight: 700;
        background: linear-gradient(135deg, #667eea, #764ba2);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
    .stat-card .label { font-size: 0.8em; color: #888; margin-top: 4px; }
    .thread-section {
        margin-bottom: 30px;
        background: white;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        border: 1px solid #eaeaea;
        page-break-inside: avoid;
    }
    .thread-title {
        font-size: 1.2em;
        font-weight: 600;
        margin-bottom: 8px;
        color: #333;
    }
    .thread-meta {
        font-size: 0.85em;
        color: #999;
        margin-bottom: 15px;
        padding-bottom: 10px;
        border-bottom: 1px solid #eee;
    }
    .message {
        margin-bottom: 15px;
        padding: 12px 16px;
        border-radius: 10px;
    }
    .message.user {
        background: #f0f0ff;
        border-left: 3px solid #667eea;
    }
    .message.assistant {
        background: #f9f9f9;
        border-left: 3px solid #764ba2;
    }
    .message .role {
        font-size: 0.8em;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 6px;
        opacity: 0.6;
    }
    .message pre {
        background: #f5f5f5;
        padding: 12px;
        border-radius: 8px;
        overflow-x: auto;
        font-size: 0.9em;
        margin: 8px 0;
    }
    .message code {
        background: #f0f0f0;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 0.9em;
    }
    .footer {
        text-align: center;
        padding: 40px 0;
        color: #aaa;
        font-size: 0.85em;
    }
    .footer .brand {
        font-size: 1.2em;
        font-weight: 700;
        color: #667eea;
        margin-bottom: 5px;
    }
    @media print {
        body { background: white; padding: 0; }
        .cover { border-radius: 0; }
        .thread-section { break-inside: avoid; }
    }
</style>
</head>
<body>

<div class="cover">
    <h1>FluxAI</h1>
    <p>Full Conversation Report</p>
    <div class="date">Generated on ${now}</div>
</div>

<div class="toc">
    <h2>📑 Index</h2>
    <ol>
        <li><a href="#summary">Executive Summary</a></li>
        ${allItems.map((_, i) => `<li><a href="#thread-${i}">Chat #${i + 1}: ${(allItems[i]?.thread?.title || 'Untitled').replace(/</g, '&lt;')}</a></li>`).join('')}
    </ol>
</div>

<div id="summary">
    <h2 style="font-size:1.5em; margin-bottom:16px; color:#667eea;">📊 Executive Summary</h2>
    <div class="stats">
        <div class="stat-card">
            <div class="number">${sortedThreads.length}</div>
            <div class="label">Total Chats</div>
        </div>
        <div class="stat-card">
            <div class="number">${totalMessages}</div>
            <div class="label">Messages</div>
        </div>
        <div class="stat-card">
            <div class="number">${(totalTokens / 1000).toFixed(1)}K</div>
            <div class="label">Tokens Used</div>
        </div>
        <div class="stat-card">
            <div class="number">${(totalTime / 60000).toFixed(0)}m</div>
            <div class="label">Total Time</div>
        </div>
    </div>
</div>

${allItems.map(({ thread, items }, idx) => {
    const itemCount = items?.length || 0;
    const threadTokens = items?.reduce((sum, item) => sum + Math.ceil((item.answer?.text?.length || 0) / 4), 0) || 0;
    const threadTime = items?.reduce((sum, item) => sum + (item.updatedAt?.getTime() - item.createdAt?.getTime()), 0) || 0;
    return `
<div class="thread-section" id="thread-${idx}">
    <div class="thread-title">💬 ${(thread.title || 'Untitled').replace(/</g, '&lt;')}</div>
    <div class="thread-meta">
        Created: ${new Date(thread.createdAt).toLocaleString()} ·
        ${itemCount} messages ·
        ${(threadTokens / 1000).toFixed(1)}K tokens ·
        ${(threadTime / 60000).toFixed(0)}m elapsed
    </div>
    ${(items || []).map(item => {
        if (item.query) {
            return `<div class="message user"><div class="role">You</div>${item.query.replace(/</g, '&lt;').replace(/\n/g, '<br>')}</div>`;
        }
        return '';
    }).join('')}
    ${(items || []).map(item => {
        if (item.answer?.text) {
            return `<div class="message assistant"><div class="role">FluxAI · ${item.mode || 'AI'}</div>${item.answer.text.replace(/</g, '&lt;').replace(/\n/g, '<br>')}</div>`;
        }
        return '';
    }).join('')}
</div>`;
}).join('')}

<div class="footer">
    <div class="brand">✦ FluxAI</div>
    <p>AI-Powered Research &amp; Agentic Workflows</p>
    <p style="margin-top:10px; font-size:0.8em;">Report generated on ${now} · All data processed locally</p>
</div>

</body>
</html>`;

            // Create a blob and open print dialog
            const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const printWindow = window.open(url, '_blank');
            if (printWindow) {
                printWindow.onload = () => {
                    printWindow.focus();
                    setTimeout(() => {
                        printWindow.print();
                    }, 500);
                };
            }
        } catch (err) {
            console.error('Failed to generate report:', err);
        } finally {
            setIsExporting(false);
        }
    }, [threads, getAllThreadItems]);

    return (
        <Button
            variant="bordered"
            size="sm"
            rounded="full"
            className="justify-start"
            onClick={generateReport}
            disabled={isExporting}
        >
            {isExporting ? (
                <IconLoader2 size={14} strokeWidth={2} className="animate-spin" />
            ) : (
                <IconFileTypePdf size={14} strokeWidth={2} />
            )}
            {isExporting ? 'Generating...' : 'Export Full Report (PDF)'}
        </Button>
    );
};
