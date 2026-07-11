'use client';

let audioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
    return audioCtx;
};

/**
 * Play a very subtle pop / click sound using the Web Audio API.
 * No external audio files needed — generated procedurally.
 * Volume is intentionally low so it's a gentle notification.
 */
export const playCompletionPop = () => {
    try {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        const now = ctx.currentTime;

        // ── Short sine-wave pop ──
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);          // A5
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.05); // slide down

        gain.gain.setValueAtTime(0.08, now);             // very quiet
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.08);

        // ── Subtle noise click on top ──
        const bufferSize = ctx.sampleRate * 0.02; // 20ms of noise
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.015, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
        noise.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.start(now);
    } catch {
        // Silently fail — audio is non-critical
    }
};
