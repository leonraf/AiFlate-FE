
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { encodeWAV } from '../lib/audio';
import { Mic, Square, Activity } from 'lucide-react';

export default function TestAudioPage() {
    const [isListening, setIsListening] = useState(false); // UI State: "Waiting for voice"
    const [isRecording, setIsRecording] = useState(false); // UI State: "Saving to buffer"
    const [status, setStatus] = useState("In attesa...");
    const [capturedAudioUrl, setCapturedAudioUrl] = useState<string | null>(null);
    const [audioVolume, setAudioVolume] = useState(0);
    const [isMicReady, setIsMicReady] = useState(false);

    // Hardware
    const streamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRefs = useRef<AnalyserNode | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

    // Buffers
    const mainBufferRef = useRef<Float32Array[]>([]);
    const ringBufferRef = useRef<Float32Array[]>([]); // Pre-roll buffer
    const RING_BUFFER_SIZE = 30; // ~1.2s at 4096/44kHz.

    // Logic Flags
    const isSpeechActiveRef = useRef(false); // True if VAD triggered
    const isListeningRef = useRef(false); // True if user pressed "Start"

    // VAD Refs
    const silenceStartRef = useRef<number | null>(null);
    const speechStartTimeRef = useRef<number | null>(null);
    const animationFrameRef = useRef<number>();

    // 1. HOT MIC SETUP (With Vocal Chain)
    useEffect(() => {
        const initMicrophone = async () => {
            try {
                setStatus("Attivazione Vocal Chain (Anti-Boom)...");
                const constraints = {
                    audio: {
                        autoGainControl: false,
                        echoCancellation: false,
                        noiseSuppression: false,
                        channelCount: 1,
                        sampleRate: 48000,
                        googAutoGainControl: false,
                        googNoiseSuppression: false,
                        googHighpassFilter: false,
                        mozAutoGainControl: false,
                        mozNoiseSuppression: false,
                    }
                } as MediaStreamConstraints["audio"];

                const stream = await navigator.mediaDevices.getUserMedia({ audio: constraints });
                streamRef.current = stream;

                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                audioContextRef.current = audioContext;
                const source = audioContext.createMediaStreamSource(stream);

                // --- VOCAL CHAIN OPTIMIZATION (ANTI-BOOM / CLARITY) ---

                // 1. High Pass Filter (150Hz) - Aggressive Cut for Boomy/Plosive starts
                const hpf = audioContext.createBiquadFilter();
                hpf.type = 'highpass';
                hpf.frequency.value = 150;

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

                // 5. Compression (Dynamic Control)
                const compressor = audioContext.createDynamicsCompressor();
                compressor.threshold.value = -24;
                compressor.knee.value = 30;
                compressor.ratio.value = 12;
                compressor.attack.value = 0.003;
                compressor.release.value = 0.25;

                // 6. Adaptive Gain
                const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                const GAIN_VALUE = isMobile ? 2.5 : 4.0;

                const gainNode = audioContext.createGain();
                gainNode.gain.value = GAIN_VALUE;

                // CONNECT THE CHAIN
                source.connect(hpf);
                hpf.connect(lowShelf);
                lowShelf.connect(presence);
                presence.connect(highShelf);
                highShelf.connect(compressor);
                compressor.connect(gainNode);

                // The output of GainNode is our "Processed Audio"
                const processedOutput = gainNode;

                // -----------------------------

                const analyser = audioContext.createAnalyser();
                analyser.fftSize = 512;
                analyserRefs.current = analyser;
                processedOutput.connect(analyser); // Visualize processed audio

                const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
                scriptProcessorRef.current = scriptProcessor;
                processedOutput.connect(scriptProcessor); // Record processed audio
                scriptProcessor.connect(audioContext.destination);

                // HOT PROCESSING LOOP
                scriptProcessor.onaudioprocess = (e) => {
                    const inputData = e.inputBuffer.getChannelData(0);
                    const chunk = new Float32Array(inputData);

                    if (isListeningRef.current) {
                        ringBufferRef.current.push(chunk);
                        if (ringBufferRef.current.length > RING_BUFFER_SIZE) {
                            ringBufferRef.current.shift();
                        }
                        if (isSpeechActiveRef.current) {
                            mainBufferRef.current.push(chunk);
                        }
                    }
                };

                setIsMicReady(true);
                setStatus(`Mic Ottimizzato (${isMobile ? 'Mobile Mode' : 'Desktop Mode'})`);
                detectSilence();

            } catch (err) {
                console.error(err);
                setStatus("Errore Mic");
                alert("Errore accesso microfono.");
            }
        };
        initMicrophone();
        return () => {
            if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
            if (audioContextRef.current) audioContextRef.current.close();
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, []);


    // 2. START LISTENING (User Click)
    const toggleListening = async () => {
        if (isListening) {
            stopAndReset();
        } else {
            if (audioContextRef.current?.state === 'suspended') await audioContextRef.current.resume();

            setCapturedAudioUrl(null);
            mainBufferRef.current = [];
            ringBufferRef.current = [];
            isSpeechActiveRef.current = false;
            isListeningRef.current = true;
            setIsListening(true);
            setStatus("In ascolto... (Parla quando vuoi)");
        }
    };

    const stopAndReset = () => {
        isListeningRef.current = false;
        const wasRecording = isSpeechActiveRef.current;
        isSpeechActiveRef.current = false;

        setIsListening(false);
        setIsRecording(false);

        if (wasRecording) finalizeAudio();
        else setStatus("Nessuna voce catturata.");
    };

    const finalizeAudio = () => {
        if (mainBufferRef.current.length === 0) {
            setStatus("Nessuna voce rilevata.");
            return;
        }

        setStatus("Elaborazione...");
        const totalLength = mainBufferRef.current.reduce((acc, c) => acc + c.length, 0);
        const merged = new Float32Array(totalLength);
        let offset = 0;
        for (const c of mainBufferRef.current) {
            merged.set(c, offset);
            offset += c.length;
        }

        const wav = encodeWAV(merged, audioContextRef.current?.sampleRate || 48000);
        setCapturedAudioUrl(URL.createObjectURL(wav));
        setStatus("Registrazione Completata.");
    };

    // 3. VAD LOOP
    const detectSilence = () => {
        if (!analyserRefs.current) return;

        const bufferLen = analyserRefs.current.frequencyBinCount;
        const data = new Uint8Array(bufferLen);
        analyserRefs.current.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < bufferLen; i++) sum += data[i];
        const avg = sum / bufferLen;
        setAudioVolume(avg);

        if (isListeningRef.current) {
            // Adaptive Thresholds
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            const START_THRESHOLD = isMobile ? 20 : 25;
            const STOP_THRESHOLD = 10;
            const SILENCE_LIMIT = 1500;

            if (!isSpeechActiveRef.current) {
                // WAITING FOR SPEECH
                if (avg > START_THRESHOLD) {
                    isSpeechActiveRef.current = true;
                    setIsRecording(true);
                    speechStartTimeRef.current = Date.now();
                    silenceStartRef.current = null;
                    setStatus("Sto registrando...");
                    mainBufferRef.current = [...ringBufferRef.current];
                }
            } else {
                // RECORDING
                if (avg < STOP_THRESHOLD) { // Silence Threshold
                    if (!silenceStartRef.current) silenceStartRef.current = Date.now();
                    else if (Date.now() - silenceStartRef.current > SILENCE_LIMIT) {
                        stopAndReset();
                    }
                } else {
                    silenceStartRef.current = null;
                }
            }
        }

        animationFrameRef.current = requestAnimationFrame(detectSilence);
    };

    return (
        <div className="min-h-screen bg-black text-white p-8 font-sans flex flex-col items-center justify-center">
            <header className="fixed top-0 left-0 w-full p-6 flex justify-between items-center z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
                <Link to="/" className="text-2xl font-bold tracking-tighter hover:text-cyan-400">AIFlate</Link>
                <Link to="/demo" className="text-sm font-medium text-gray-400 hover:text-white">Demo</Link>
            </header>

            <main className="w-full max-w-md space-y-8 mt-20">
                <div className="glass-panel p-8 rounded-3xl border border-white/10 text-center space-y-8 bg-white/5 backdrop-blur-md">
                    <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
                        <Activity className={isRecording ? "text-red-500 animate-pulse" : "text-blue-500"} />
                        Test Audio VAD
                    </h1>

                    <div className="relative h-32 flex items-center justify-center">
                        <motion.div
                            animate={{
                                scale: (isListening || isRecording) ? 1 + (audioVolume / 40) : 1,
                                borderColor: isRecording ? 'rgba(239, 68, 68, 0.5)' : isListening ? 'rgba(59, 130, 246, 0.5)' : 'rgba(255,255,255,0.1)',
                                backgroundColor: isRecording ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0,0,0,0.2)'
                            }}
                            className="w-24 h-24 rounded-full border-2 flex items-center justify-center transition-colors"
                        >
                            <Mic size={32} className={isRecording ? "text-red-400" : isListening ? "text-blue-400" : "text-gray-600"} />
                        </motion.div>
                    </div>

                    <div className="space-y-1">
                        <p className="text-xl font-medium text-cyan-200">{status}</p>
                        <p className="text-xs text-gray-500">Vol: {audioVolume.toFixed(0)}</p>
                    </div>

                    <button
                        onClick={toggleListening}
                        disabled={!isMicReady}
                        className={cn(
                            "w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2",
                            isListening
                                ? "bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30"
                                : "bg-cyan-600 text-white hover:bg-cyan-500 shadow-lg shadow-cyan-500/20"
                        )}
                    >
                        {isListening ? <Square size={20} /> : <Mic size={20} />}
                        {isListening ? "Ferma Test" : "Avvia Ascolto (VAD)"}
                    </button>

                    {capturedAudioUrl && (
                        <div className="bg-black/40 p-4 rounded-xl border border-white/10 space-y-3 animate-in fade-in">
                            <p className="text-xs text-green-400 font-mono">✅ Audio Super-Dry (Anti-Boom Active)</p>
                            <audio controls src={capturedAudioUrl} className="w-full h-8" />
                            <a href={capturedAudioUrl} download="test_vad_dry.wav" className="text-xs text-cyan-400 hover:text-cyan-300 underline">Scarica WAV</a>
                        </div>
                    )}
                </div>

                <div className="text-center text-[10px] text-gray-600 space-y-1">
                    <p>Chain: HPF(150Hz), LowShelf(200Hz,-5dB), Presence(+5dB)</p>
                </div>
            </main>
        </div>
    );
}
