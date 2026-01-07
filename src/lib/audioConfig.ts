export const isMobileDevice = () => {
    if (typeof navigator === 'undefined') return false;
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

export const getAudioConstraints = () => {
    const isMobile = isMobileDevice();
    // Mobile: Enable DSP (Echo/Noise Cancellation) to handle noisy environments.
    // Desktop: Disable DSP (High Fidelity) for best quality.
    return {
        audio: {
            autoGainControl: isMobile,
            echoCancellation: isMobile,
            noiseSuppression: isMobile,
            channelCount: 1,
            sampleRate: 48000,
            // If desktop, force raw audio
            ...(isMobile ? {} : {
                googAutoGainControl: false,
                googNoiseSuppression: false,
                googHighpassFilter: false,
                mozAutoGainControl: false,
                mozNoiseSuppression: false,
            })
        }
    } as MediaStreamConstraints;
};

export const getAudioGain = () => {
    // Mobile (DSP On): 1.0x (Unity Gain - Rely 100% on Hardware AGC to avoid amplifying background TV)
    // Desktop (Raw): 1.5x
    return isMobileDevice() ? 1.0 : 1.5;
};

export const getVADThresholds = () => {
    const isMobile = isMobileDevice();
    return {
        start: isMobile ? 45 : 25, // Aggressive threshold (45) for mobile to block TV/Background
        stop: isMobile ? 20 : 10,
        minSpeechDuration: isMobile ? 200 : 50, // Require 200ms of sustained speech to trigger (Anti-Spike)
        silenceLimit: 1500
    };
};

export const createAudioProcessor = (audioContext: AudioContext) => {
    // 1. High Pass Filter (80Hz) - Remove sub-bass rumble but keep voice body
    const hpf = audioContext.createBiquadFilter();
    hpf.type = 'highpass';
    hpf.frequency.value = 80;

    // 2. Low Shelf (200Hz, -5dB) - Thin out the "mud" / Proximity Effect
    const lowShelf = audioContext.createBiquadFilter();
    lowShelf.type = 'lowshelf';
    lowShelf.frequency.value = 200;
    lowShelf.gain.value = -5.0;

    // 3. Presence Boost (3.5kHz) - Intelligibility
    const presence = audioContext.createBiquadFilter();
    presence.type = 'peaking';
    presence.frequency.value = 3500;
    presence.Q.value = 0.8;
    presence.gain.value = 5.0;

    // 4. High Shelf (10kHz) - Air
    const highShelf = audioContext.createBiquadFilter();
    highShelf.type = 'highshelf';
    highShelf.frequency.value = 10000;
    highShelf.gain.value = 3.0;

    // 5. Compressor (OFF / BYPASS - Fix for Pumping/Dropouts)
    // We set ratio to 1.0 to effectively disable it, just acting as a passthrough.
    const compressor = audioContext.createDynamicsCompressor();
    compressor.threshold.value = -50;
    compressor.knee.value = 40;
    compressor.ratio.value = 1; // 1:1 = No compression
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;

    // 6. Adaptive Gain
    const GAIN_VALUE = getAudioGain();
    const gainNode = audioContext.createGain();
    gainNode.gain.value = GAIN_VALUE;

    // CONNECT THE CHAIN
    // input(hpf) -> lowShelf -> presence -> highShelf -> compressor -> output(gainNode)
    hpf.connect(lowShelf);
    lowShelf.connect(presence);
    presence.connect(highShelf);
    highShelf.connect(compressor);
    compressor.connect(gainNode);

    return {
        input: hpf,
        output: gainNode,
        gainNode: gainNode // Return gainNode specifically if needed for refs
    };
};
