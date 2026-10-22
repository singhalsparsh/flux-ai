import Link from 'next/link';

export const Footer = () => {
    const links = [
        {
            href: '/changelog',
            label: 'Changelog',
        },
        {
            href: '/feedback',
            label: 'Feedback',
        },
        {
            href: '/terms',
            label: 'Terms',
        },
        {
            href: '/privacy',
            label: 'Privacy',
        },
    ];
    return (
        <div className="glass-card mx-auto flex w-fit flex-row items-center justify-center gap-4 rounded-full px-5 py-2">
            <span className="text-muted-foreground text-xs opacity-50">FluxAI</span>
            {links.map(link => (
                <Link
                    key={link.href}
                    href={link.href}
                    className="text-muted-foreground text-xs opacity-50 hover:opacity-100"
                >
                    {link.label}
                </Link>
            ))}
        </div>
    );
};
