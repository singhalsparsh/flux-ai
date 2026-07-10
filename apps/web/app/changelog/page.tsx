import { Footer, MarkdownContent } from '@repo/common/components';
import { changelogMdx } from '@repo/shared/config';

export default function ChangelogPage() {
    return (
        <div className="mx-auto flex max-w-screen-md flex-col gap-16 px-4 py-8">
            <MarkdownContent content={changelogMdx} />
            <Footer />
        </div>
    );
}
