import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const session = await auth();
    const userId = session?.userId;

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { feedback } = await request.json();

    // Feedback is stored client-side; no database needed on Vercel free tier.
    // In production, consider forwarding to an external logging service.
    console.log('[FEEDBACK]', { userId, feedback });

    return NextResponse.json({ message: 'Feedback received' }, { status: 200 });
}
