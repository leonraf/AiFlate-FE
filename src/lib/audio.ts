export function encodeWAV(samples: Float32Array, sampleRate: number): Blob {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    /* RIFF identifier */
    writeString(view, 0, 'RIFF');
    /* RIFF chunk length */
    view.setUint32(4, 36 + samples.length * 2, true);
    /* RIFF type */
    writeString(view, 8, 'WAVE');
    /* format chunk identifier */
    writeString(view, 12, 'fmt ');
    /* format chunk length */
    view.setUint32(16, 16, true);
    /* sample format (raw) */
    view.setUint16(20, 1, true);
    /* channel count */
    view.setUint16(22, 1, true);
    /* sample rate */
    view.setUint32(24, sampleRate, true);
    /* byte rate (sample rate * block align) */
    view.setUint32(28, sampleRate * 2, true);
    /* block align (channel count * bytes per sample) */
    view.setUint16(32, 2, true);
    /* bits per sample */
    view.setUint16(34, 16, true);
    /* data chunk identifier */
    writeString(view, 36, 'data');
    /* data chunk length */
    view.setUint32(40, samples.length * 2, true);

    floatTo16BitPCM(view, 44, samples);

    return new Blob([view], { type: 'audio/wav' });
}

function floatTo16BitPCM(output: DataView, offset: number, input: Float32Array) {
    for (let i = 0; i < input.length; i++, offset += 2) {
        let s = Math.max(-1, Math.min(1, input[i]));
        s = s < 0 ? s * 0x8000 : s * 0x7FFF;
        output.setInt16(offset, s, true);
    }
}

function writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

export const normalizeAudio = (samples: Float32Array): Float32Array => {
    if (samples.length === 0) return samples;

    // 1. DYNAMIC COMPRESSION / SOFT LIMITING (Tanh)
    // Instead of linear scaling (which is ruined by one click), we use "Tape Saturation" style limiting.
    // We boost EVERYTHING, and "squash" the loud peaks.

    const PRE_GAIN = 5.0; // Boost signal 5x BEFORE limiting (makes quiet stuff loud)
    const normalized = new Float32Array(samples.length);

    for (let i = 0; i < samples.length; i++) {
        // Apply pre-gain then Tanh soft-clipper
        // tanh(x) approaches +/- 1.0 smoothly.
        // tanh(0.1) ~ 0.1 (Linear for quiet)
        // tanh(5.0) ~ 0.999 (Limited for loud)
        normalized[i] = Math.tanh(samples[i] * PRE_GAIN);
    }

    return normalized;
};
