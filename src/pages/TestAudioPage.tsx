
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { encodeWAV } from '../lib/audio';
import { getAudioConstraints, getVADThresholds, createAudioProcessor } from '../lib/audioConfig';
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
                // CHANGED: Use centralized config
                const constraints = getAudioConstraints();

                // We don't need isMobile for status anymore if we want to be generic, 
                // but let's keep it if we want to show the mode. 
                // Or just:
                setStatus(`Attivazione Mic...`);

                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                streamRef.current = stream;

                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                audioContextRef.current = audioContext;
                const source = audioContext.createMediaStreamSource(stream);

                // --- VOCAL CHAIN OPTIMIZATION (CENTRALIZED) ---
                const processor = createAudioProcessor(audioContext);

                // CONNECT THE CHAIN
                source.connect(processor.input);

                // The output of GainNode is our "Processed Audio"
                const processedOutput = processor.output;

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
                setStatus(`Mic Ottimizzato (Ready)`);
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

            // Adaptive Thresholds (Centralized)
            const { start: START_THRESHOLD, stop: STOP_THRESHOLD, silenceLimit: SILENCE_LIMIT } = getVADThresholds();

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
