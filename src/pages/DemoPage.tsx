import { useState, useRef, useEffect } from 'react';
import { Send, Mic, Bot, User, Lock, ArrowLeft, Loader2, Volume2, Globe, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { encodeWAV } from '../lib/audio';

// CREDENZIALI DEMO
const DEMO_USER = "aiflate_demo";
const DEMO_PASS = "Axjdslr$%uin52!37dkfu!";
const N8N_CHAT_URL = "https://primary-production-2282.up.railway.app/webhook/chat";
const N8N_VOICE_URL = "https://primary-production-2282.up.railway.app/webhook/voicechat";



type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    audioUrl?: string; // For playing back audio responses
};

export default function DemoPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    if (!isLoggedIn) {
        return <LoginForm onLogin={() => setIsLoggedIn(true)} />;
    }

    return <ChatInterface />;
}

function LoginForm({ onLogin }: { onLogin: () => void }) {
    const [user, setUser] = useState("");
    const [pass, setPass] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            const isValidMain = user === DEMO_USER && pass === DEMO_PASS;
            const isValidSimple = user === "demo" && pass === "test";

            if (isValidMain || isValidSimple) {
                onLogin();
            } else {
                setError("Credenziali non valide. Riprova.");
                setLoading(false);
            }
        }, 800);
    };

    return (
        <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-[#030712] to-[#030712]" />

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="glass-panel p-8 rounded-3xl border border-white/10">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <Lock className="text-blue-400" /> Secure Login
                        </h2>
                        <Link to="/" className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"><ArrowLeft size={20} /></Link>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-blue-300 uppercase tracking-wider ml-1">Utente</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
                                <input
                                    type="text"
                                    value={user}
                                    onChange={(e) => setUser(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-black/30 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 text-white placeholder-slate-600 transition-all font-medium"
                                    placeholder="Nome utente"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-blue-300 uppercase tracking-wider ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
                                <input
                                    type="password"
                                    value={pass}
                                    onChange={(e) => setPass(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-black/30 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 text-white placeholder-slate-600 transition-all font-medium"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-500/20 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> {error}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/20 hover:shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 mt-4 flex justify-center items-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : "Accedi al sistema"}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 mx-4">
                        <div className="flex justify-center items-center gap-2 text-xs text-slate-500 font-mono">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            System Status: Operational
                        </div>
                    </div>
                </div>
                <div className="mt-6 text-center text-xs text-slate-600 font-mono">
                    ID: {DEMO_USER} | KEY: ••••••••••••
                </div>
            </motion.div>
        </div>
    );
}

function ChatInterface() {
    const [mode, setMode] = useState<'text' | 'voice'>('text');
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'assistant', content: "Buongiorno, sono Valentina dell'assistenza clienti di Aiflate Veterinary Care. Come posso aiutarvi?" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isAiSpeaking, setIsAiSpeaking] = useState(false);
    const [isSpeechDetected, setIsSpeechDetected] = useState(false); // UI Feedback for VAD
    const [audioVolume, setAudioVolume] = useState(0);
    const [isConnecting, setIsConnecting] = useState(false); // Animation State

    const scrollRef = useRef<HTMLDivElement>(null);


    // Streaming Refs
    const [, setSessionId] = useState<string | null>(null);
    const sessionIdRef = useRef<string | null>(null); // Ref for stale closure access
    const wsRef = useRef<WebSocket | null>(null);
    const mainAudioContextRef = useRef<AudioContext | null>(null); // Shared Context
    const nextStartTimeRef = useRef<number>(0);
    const isAiSpeakingRef = useRef<boolean>(false);
    const audioResidueRef = useRef<Uint8Array | null>(null);
    const isFirstChunkRef = useRef<boolean>(true);

    // Jitter Buffer Refs
    const playbackQueueRef = useRef<AudioBuffer[]>([]);
    const hasStartedPlayingRef = useRef<boolean>(false);
    const JITTER_BUFFER_THRESHOLD = 15; // 15 chunks (~450ms) - Increased stability



    // ... existing refs

    // ... existing useEffect

    const scheduleAudioChunk = async (base64Data: string) => {
        const ctx = mainAudioContextRef.current;
        if (!ctx) return;

        try {
            // 1. Decode Base64
            const binaryString = window.atob(base64Data);
            const len = binaryString.length;
            const incomingBytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                incomingBytes[i] = binaryString.charCodeAt(i);
            }

            // 2. Handle Residue / Stitched Buffer
            let bytes = incomingBytes;
            if (audioResidueRef.current && audioResidueRef.current.length > 0) {
                const merged = new Uint8Array(audioResidueRef.current.length + incomingBytes.length);
                merged.set(audioResidueRef.current);
                merged.set(incomingBytes, audioResidueRef.current.length);
                bytes = merged;
                audioResidueRef.current = null;
            }

            // 3. Strip WAV Header on First Chunk (if present)
            let dataOffset = 0;
            if (isFirstChunkRef.current) {
                // Check for "RIFF" (0x52 0x49 0x46 0x46) at start
                if (bytes.length >= 4 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
                    console.log("Stripping WAV header from stream...");
                    dataOffset = 44; // Standard WAV header is 44 bytes
                }
                isFirstChunkRef.current = false;
            }

            // 4. Handle Misalignment (Odd bytes)
            const totalLen = bytes.length - dataOffset;
            const remainder = totalLen % 2;
            if (remainder !== 0) {
                // Save last byte for next chunk
                const residueByte = bytes[bytes.length - 1];
                audioResidueRef.current = new Uint8Array([residueByte]);
            }
            const sampleByteLength = totalLen - remainder;
            if (sampleByteLength <= 0) return;

            // Create Int16 View
            const int16Data = new Int16Array(
                bytes.buffer,
                bytes.byteOffset + dataOffset,
                sampleByteLength / 2
            );

            const float32Data = new Float32Array(int16Data.length);
            for (let i = 0; i < int16Data.length; i++) {
                // S16LE scaling
                float32Data[i] = int16Data[i] / 32768.0;
            }

            // 5. Create AudioBuffer (S16LE @ 44.1kHz)
            const audioBuffer = ctx.createBuffer(1, float32Data.length, 44100);
            audioBuffer.copyToChannel(float32Data, 0);

            // 6. Buffer Logic instead of immediate play
            playbackQueueRef.current.push(audioBuffer);

            if (!hasStartedPlayingRef.current) {
                // We are buffering. Check threshold.
                if (playbackQueueRef.current.length >= JITTER_BUFFER_THRESHOLD) {
                    console.log(`[Audio] Jitter buffer filled (${playbackQueueRef.current.length} chunks). Starting playback.`);
                    hasStartedPlayingRef.current = true;

                    // Set initial start time with 150ms SAFETY CUSHION
                    nextStartTimeRef.current = ctx.currentTime + 0.15;

                    flushPlaybackQueue();
                }
            } else {
                // Already playing, just flush immediately
                flushPlaybackQueue();
            }

        } catch (e) {
            console.error("PCM Decode/Play Error:", e);
        }
    };

    const flushPlaybackQueue = () => {
        const ctx = mainAudioContextRef.current;
        if (!ctx) return;

        while (playbackQueueRef.current.length > 0) {
            const buf = playbackQueueRef.current.shift();
            if (!buf) continue;

            const source = ctx.createBufferSource();
            source.buffer = buf;
            source.connect(ctx.destination);

            const currentTime = ctx.currentTime;

            // Scheduling Logic:
            let startAt = nextStartTimeRef.current;

            // If we fell behind (underrun), catch up IMMEDIATELY (no gap)
            if (startAt < currentTime) {
                startAt = currentTime;
            }

            source.start(startAt);

            // Advance next start time
            nextStartTimeRef.current = startAt + buf.duration;
        }
    };

    // Voice Refs
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    // audioContextRef removed - using mainAudioContextRef
    const analyserRef = useRef<AnalyserNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null); // To reference the gain node if needed

    // Logic Gates
    const isMicInitialized = useRef(false); // Has hardware been initialized?
    const isMicActiveRef = useRef(false); // Is hardware currently on?
    const isRecordingRef = useRef(false); // VAD Decision: "Speech is happening"

    // Buffers
    const mainBufferRef = useRef<Float32Array[]>([]);
    const ringBufferRef = useRef<Float32Array[]>([]); // Pre-roll buffer (1.2s)
    const RING_BUFFER_SIZE = 30; // ~1.2s at 44.1kHz with 4096 buffer size

    // VAD Timers
    const silenceStartRef = useRef<number | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const hasPlayedWelcomeRef = useRef(false);

    // We need a ref for mode to access it inside the audio.onended callback safely
    const modeRef = useRef<'text' | 'voice'>('text');
    const messagesRef = useRef<Message[]>(messages); // Ref to hold latest messages for async callbacks

    useEffect(() => {
        // Connect to WebSocket on mount
        const connectWS = () => {
            const ws = new WebSocket('wss://cartesia-stream-production.up.railway.app');
            wsRef.current = ws;

            ws.onopen = () => console.log('Connected to Cartesia Stream WS');

            ws.onmessage = async (event) => {
                try {
                    const msg = JSON.parse(event.data);

                    if (msg.type === 'session_start') {
                        console.log('Session ID:', msg.sessionId);
                        setSessionId(msg.sessionId);
                        sessionIdRef.current = msg.sessionId;
                    }
                    else if (msg.type === 'tts_start') {
                        setIsAiSpeaking(true);
                        isAiSpeakingRef.current = true;

                        // Reset stream state
                        isFirstChunkRef.current = true;
                        audioResidueRef.current = null;

                        // Reset Jitter Buffer
                        // Reset Jitter Buffer
                        playbackQueueRef.current = [];
                        hasStartedPlayingRef.current = false;
                        nextStartTimeRef.current = mainAudioContextRef.current?.currentTime || 0;

                        // Initialize context if needed
                        if (!mainAudioContextRef.current) {
                            mainAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
                        }
                        // Reset scheduler time to now (or slightly future)
                        if (mainAudioContextRef.current.state === 'suspended') {
                            await mainAudioContextRef.current.resume();
                        }
                        nextStartTimeRef.current = mainAudioContextRef.current.currentTime + 0.1; // small buffer
                    }
                    else if (msg.type === 'audio_chunk') {
                        await scheduleAudioChunk(msg.data);
                    }
                    else if (msg.type === 'tts_end') {
                        // We wait for the last chunk to finish playing based on timing
                        const ctx = mainAudioContextRef.current;
                        if (ctx) {
                            const remainingTime = nextStartTimeRef.current - ctx.currentTime;
                            setTimeout(() => {
                                setIsAiSpeaking(false);
                                isAiSpeakingRef.current = false;

                                // Handle potential continuous flow restart here if NOT endConversation
                                // We don't need to explicitly "startRecording" because VAD is always scanning
                                // as long as isAiSpeaking is false.
                            }, Math.max(0, remainingTime * 1000));
                        } else {
                            setIsAiSpeaking(false);
                        }
                    }
                } catch (e) {
                    console.error("WS Message Error:", e);
                }
            };

            ws.onerror = (e) => console.error("WS Error:", e);
            ws.onclose = () => console.log("WS Closed");
        };

        connectWS();

        return () => {
            wsRef.current?.close();
            // Do NOT close mainAudioContextRef here loosely, or handle carefully
            // Actually, we should probably let the component unmount cleanup handle it later?
            // But this useEffect is on [] (mount), so it runs on unmount.
            // Yes, close it.
            if (mainAudioContextRef.current) mainAudioContextRef.current.close();
        };
    }, []);



    // --- 2. SWITCH TO VOICE MODE (INIT HOT MIC) ---
    // --- 2. SWITCH TO VOICE MODE (INIT HOT MIC WITH ANIMATION) ---
    useEffect(() => {
        modeRef.current = mode;
        if (mode === 'voice') {
            const shouldPlayWelcome = messages.length <= 1 && !hasPlayedWelcomeRef.current;

            if (shouldPlayWelcome) {
                // 1. Start Animation & Init Mic (Silent Scatto)
                setIsConnecting(true);

                // CRITICAL: Block VAD immediately during animation & welcome audio
                setIsAiSpeaking(true);
                isAiSpeakingRef.current = true;
                hasPlayedWelcomeRef.current = true;

                // Init Mic immediately (the change in OS audio mode happens now, masked by animation)
                if (!isMicInitialized.current) initHotMic();

                // 2. Wait 2 seconds (User sees animation)
                setTimeout(() => {
                    setIsConnecting(false);

                    // 3. Play Welcome Audio (Clean, because mic is already active)
                    const welcomeAudio = new Audio('/benvenuto.wav');

                    // isAiSpeakingRef is already true, so VAD is blocked.

                    welcomeAudio.onended = () => {
                        setIsAiSpeaking(false);
                        isAiSpeakingRef.current = false;
                        console.log("Welcome Audio Finished - VAD Unblocked");
                    };

                    welcomeAudio.play().catch(e => {
                        console.error("Auto-play blocked:", e);
                        setIsAiSpeaking(false);
                        isAiSpeakingRef.current = false;
                    });

                }, 2000);

            } else {
                // Normal entry (already passed welcome)
                if (!isMicInitialized.current) {
                    initHotMic();
                }
            }
        } else {
            // In text mode...
            setIsRecording(false);
            isRecordingRef.current = false;
        }
    }, [mode]);

    useEffect(() => {
        messagesRef.current = messages; // Keep ref synced
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendText = async () => {
        if (!input.trim()) return;

        // Optimistic update
        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setInput("");
        setIsLoading(true);

        try {
            // Prepare payload with full history
            const payloadMessages = updatedMessages.map(({ role, content }) => ({ role, content }));

            const response = await fetch(N8N_CHAT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: payloadMessages })
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();
            console.log("N8N Response Data:", data); // Debugging

            let incomingMessages: any[] = [];

            // Determine the structure of the response
            if (data.messages && Array.isArray(data.messages)) {
                // Case 1: { messages: [...] }
                incomingMessages = data.messages;
            } else if (Array.isArray(data) && data.length > 0 && data[0].messages && Array.isArray(data[0].messages)) {
                // Case 2: [{ messages: [...] }] (N8N default item list)
                incomingMessages = data[0].messages;
            } else if (Array.isArray(data) && data.length > 0 && data[0].role && data[0].content) {
                // Case 3: [ { role, content }, ... ] (Direct array of messages)
                incomingMessages = data;
            } else if (data.role && data.content) {
                // Case 4: { role, content } (Single message object)
                incomingMessages = [data];
            }

            if (incomingMessages.length > 0) {
                const newMessages: Message[] = incomingMessages.map((msg: any, index: number) => {
                    let content = msg.content;

                    // Recursive JSON unwrap: If content is a doubly-encoded JSON string, parse it
                    if (typeof content === 'string' && content.trim().startsWith('{')) {
                        try {
                            const parsed = JSON.parse(content);
                            // If the parsed object has 'content', we assume it was a stringified message
                            if (parsed.content) {
                                content = parsed.content;
                            } else if (parsed.message) {
                                content = parsed.message;
                            }
                        } catch (e) {
                            console.warn("Failed to parse potential JSON content", e);
                        }
                    }

                    return {
                        id: `n8n-${Date.now()}-${index}`,
                        role: msg.role || 'assistant',
                        content: typeof content === 'string' ? content : JSON.stringify(content)
                    };
                });

                // Heuristic: Decide whether to REPLACE history or APPEND to it.
                // If N8N returns the full history, it should start with the Welcome message (role assistant).
                // If it returns just the new reply, it will be a single message (or short list) without the welcome.

                const seemsLikeFullHistory =
                    newMessages.length >= updatedMessages.length ||
                    (newMessages.length > 0 && newMessages[0].content.includes("Valentina") && newMessages[0].role === 'assistant');

                if (seemsLikeFullHistory) {
                    setMessages(newMessages);
                } else {
                    // Start from updatedMessages (which includes optimistic user msg) and append new ones
                    setMessages([...updatedMessages, ...newMessages]);
                }
            } else {
                // Fallback for single generic text response
                const responseData = Array.isArray(data) ? data[0] : data;

                const aiContent =
                    responseData?.output ||
                    responseData?.text ||
                    responseData?.message ||
                    responseData?.choices?.[0]?.message?.content ||
                    (typeof responseData === 'string' ? responseData : "Siamo spiacenti, formato di risposta non riconosciuto.");

                // If it looks like we just printed the JSON because we missed the field, let's format it slightly better or fallback to a generic error only if truly empty.
                const finalContent = aiContent || "Risposta ricevuta da N8N (formato imprevisto).";

                setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: finalContent }]);
            }

        } catch (error) {
            console.error("N8N Error:", error);
            // Remove the optimistic user message if failed? Or just show error?
            // Keeping previous error handling behavior but maybe adding a visual error message
            const aiResponse = "Errore di comunicazione con il server.";
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: aiResponse }]);
        } finally {
            setIsLoading(false);
        }
    };

    const initHotMic = async () => {
        try {
            console.log("Initializing Hot Mic Chain...");

            // UNIVERSAL HIGH-FIDELITY CONSTRAINTS
            const constraints = {
                audio: {
                    autoGainControl: false, echoCancellation: false, noiseSuppression: false,
                    channelCount: 1, sampleRate: 48000,
                    googAutoGainControl: false, googNoiseSuppression: false, googHighpassFilter: false,
                    mozAutoGainControl: false, mozNoiseSuppression: false,
                }
            } as MediaStreamConstraints;

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;

            // USE SHARED CONTEXT
            if (!mainAudioContextRef.current) {
                mainAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            const audioContext = mainAudioContextRef.current;
            if (audioContext.state === 'suspended') await audioContext.resume();

            const source = audioContext.createMediaStreamSource(stream);

            // --- STUDIO VOCAL CHAIN (ANTI-BOOM) ---
            // 1. HPF 150Hz (Cut rumble/plosives)
            const hpf = audioContext.createBiquadFilter();
            hpf.type = 'highpass'; hpf.frequency.value = 150;

            // 2. Low Shelf 200Hz -5dB (Thin out mud/proximity)
            const lowShelf = audioContext.createBiquadFilter();
            lowShelf.type = 'lowshelf'; lowShelf.frequency.value = 200; lowShelf.gain.value = -5.0;

            // 3. Presence 3.5kHz +5dB (Clarity)
            const presence = audioContext.createBiquadFilter();
            presence.type = 'peaking'; presence.frequency.value = 3500; presence.Q.value = 0.8; presence.gain.value = 5.0;

            // 4. High Shelf 10kHz +3dB (Air)
            const highShelf = audioContext.createBiquadFilter();
            highShelf.type = 'highshelf'; highShelf.frequency.value = 10000; highShelf.gain.value = 3.0;

            // 5. Compressor (Control dynamics)
            const compressor = audioContext.createDynamicsCompressor();
            compressor.threshold.value = -24; compressor.knee.value = 30; compressor.ratio.value = 12;
            compressor.attack.value = 0.003; compressor.release.value = 0.25;

            // 6. Adaptive Gain (4.0x for Desktop, 2.5x for Mobile)
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            const GAIN_VALUE = isMobile ? 2.5 : 4.0;

            const gainNode = audioContext.createGain();
            gainNode.gain.value = GAIN_VALUE;
            gainNodeRef.current = gainNode;

            console.log(`Audio Config: Mobile=${isMobile}, Gain=${GAIN_VALUE}`);

            // CHAIN CONNECTION
            source.connect(hpf);
            hpf.connect(lowShelf);
            lowShelf.connect(presence);
            presence.connect(highShelf);
            highShelf.connect(compressor);
            compressor.connect(gainNode);

            const processedOutput = gainNode;

            // --- FAN-OUT GRAPH ---

            // Branch A: Analyser (Visuals)
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 512;
            analyserRef.current = analyser;
            processedOutput.connect(analyser); // Connect processed audio to analyser so we see the gain/EQ effect

            // Branch B: ScriptProcessor (Recording)
            const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;
            processedOutput.connect(scriptProcessor);
            scriptProcessor.connect(audioContext.destination);

            // PROCESS LOOP (Always On)
            scriptProcessor.onaudioprocess = (e) => {
                // If not in voice mode, we still fill ring buffer? No, let's effectively mute.
                if (modeRef.current !== 'voice') return;

                // If AI is speaking, we hard-gate (ignore input)
                if (isAiSpeakingRef.current) return;

                const inputData = e.inputBuffer.getChannelData(0);
                const chunk = new Float32Array(inputData);

                // 1. Always Push to Ring Buffer (Pre-roll)
                ringBufferRef.current.push(chunk);
                if (ringBufferRef.current.length > RING_BUFFER_SIZE) {
                    ringBufferRef.current.shift();
                }

                // 2. If VAD decided "Recording", Push to Main Buffer
                if (isRecordingRef.current) {
                    mainBufferRef.current.push(chunk);
                }
            };

            isMicInitialized.current = true;
            isMicActiveRef.current = true;
            detectSilenceLoop();

        } catch (err) {
            console.error("Mic Init Error:", err);
            alert("Errore accesso microfono.");
        }
    };

    // --- VAD LOOP ---
    const detectSilenceLoop = () => {
        if (!analyserRef.current || !isMicActiveRef.current) return;

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
        const avg = sum / bufferLength;
        setAudioVolume(avg); // Update UI Volume

        // Logic only if in Voice Mode and AI not speaking
        if (modeRef.current === 'voice' && !isAiSpeakingRef.current) {

            // Adaptive Thresholds
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

            // Mobile: Lower gain (2.5x) but closer mic -> Threshold 20
            // Desktop: Higher gain (4.0x) but distant mic -> Threshold 25
            const START_THRESHOLD = isMobile ? 20 : 25;
            const STOP_THRESHOLD = 10;
            const SILENCE_LIMIT = 1500;

            if (!isRecordingRef.current) {
                // WAITING STATE
                if (avg > START_THRESHOLD) {
                    // START RECORDING
                    console.log("VAD: Speech Start");
                    isRecordingRef.current = true;
                    setIsRecording(true);
                    setIsSpeechDetected(true); // UI Feedback
                    silenceStartRef.current = null;

                    // Flush Pre-roll
                    mainBufferRef.current = [...ringBufferRef.current];
                }
            } else {
                // RECORDING STATE
                if (avg < STOP_THRESHOLD) {
                    // Potential Silence
                    if (!silenceStartRef.current) {
                        silenceStartRef.current = Date.now();
                    } else if (Date.now() - silenceStartRef.current > SILENCE_LIMIT) {
                        // STOP RECORDING
                        console.log("VAD: Speech Stop");
                        stopAndSend();
                    }
                } else {
                    silenceStartRef.current = null;
                }
            }
        }

        animationFrameRef.current = requestAnimationFrame(detectSilenceLoop);
    };

    const stopAndSend = async () => {
        isRecordingRef.current = false;
        setIsRecording(false);
        setIsSpeechDetected(false); // Reset UI

        const buffer = mainBufferRef.current;
        mainBufferRef.current = []; // Clear main buffer

        if (buffer.length === 0) return;

        // Flatten and Send
        if (mainAudioContextRef.current) {
            const totalLength = buffer.reduce((acc, c) => acc + c.length, 0);
            const merged = new Float32Array(totalLength);
            let offset = 0;
            for (const c of buffer) { merged.set(c, offset); offset += c.length; }

            // No normalizeAudio needed because Gain Node 4x is already applied in graph
            // and we want dynamics.

            const wavBlob = encodeWAV(merged, mainAudioContextRef.current.sampleRate);
            await sendAudioToN8N(wavBlob);
        }
    };

    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (mainAudioContextRef.current) {
                mainAudioContextRef.current.close();
            }
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    // Helper for smooth playback
    const playAudioResponse = async (url: string) => {
        try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

            const source = audioCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioCtx.destination);
            source.start(0);

            return new Promise<void>((resolve) => {
                source.onended = () => {
                    resolve();
                    audioCtx.close();
                };
            });
        } catch (e) {
            console.error("Audio Playback Error", e);
        }
    };


    const sendAudioToN8N = async (audioBlob: Blob) => {
        setIsLoading(true);

        const tempId = Date.now().toString();
        const userMsg: Message = { id: tempId, role: 'user', content: 'Elaborazione audio...', audioUrl: 'blob' };
        setMessages(prev => [...prev, userMsg]);

        try {
            const formData = new FormData();
            formData.append('file', audioBlob, 'recording.wav');

            // Prepare payload with full history
            // Use Ref to ensure we have the absolute latest messages, escaping any stale closures
            const historyPayload = messagesRef.current.map(({ role, content }) => ({ role, content }));

            // UPDATE: N8N didn't auto-parse "deep" brackets. 
            // Turning back to standard JSON string in body. User will Parse JSON in N8N.
            formData.append('messages', JSON.stringify(historyPayload));

            // Add Session ID from WebSocket (Use Ref to avoid stale closure)
            if (sessionIdRef.current) {
                formData.append('sessionId', sessionIdRef.current);
            }

            const response = await fetch(N8N_VOICE_URL, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();
            console.log("N8N Voice Response:", data);

            // Structure: [{ success: true, data: { transcription, message_text, audio_base64, ... } }]
            const resultData = Array.isArray(data) ? data[0]?.data : data?.data;

            if (!resultData) {
                throw new Error("Invalid N8N voice response format");
            }

            const { message_text, transcription, endConversation } = resultData;

            // UPDATE USER MESSAGE WITH TRANSCRIPTION
            setMessages(prev => prev.map(msg =>
                msg.id === tempId
                    ? { ...msg, content: transcription || "Messaggio vocale" }
                    : msg
            ));

            // Just add the text prompt. The Audio will come via WS.
            const aiMsg: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content: message_text || 'Risposta Vocale (Streaming)',
                // No audioUrl, or we can use a dummy one if UI needs it for visualizer
            };
            setMessages(prev => [...prev, aiMsg]);

            // NOTE: We do NOT play audio here anymore. The WS handles 'tts_start' -> 'audio_chunk' -> events.
            // But we do handle flow control (endConversation logic)

            if (endConversation) {
                // If ends, we switch to text mode. 
                // We should technically wait for audio to finish?
                // But the WS 'tts_end' handler handles the resume logic.
                // We'll set a flag or just force switch.
                // Optimally we wait.

                // Let's set mode to text immediately to prevent *sending* more audio,
                // but we let the current audio finish playing.
                setMode('text');
            }
            // If NOT endConversation, the WS 'tts_end' event will trigger startRecording()
            // because mode is still 'voice'.

        } catch (error) {
            console.error("Error sending voice:", error);
            const errMsg: Message = { id: Date.now().toString(), role: 'assistant', content: 'Errore durante la comunicazione con N8N.' };
            setMessages(prev => [...prev, errMsg]);
            setIsAiSpeaking(false);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="flex flex-col h-screen bg-[#0b0f19] text-white overflow-hidden">
            {/* Header */}
            <header className="px-6 py-4 flex justify-between items-center bg-[#030712]/80 backdrop-blur-md border-b border-white/5 z-20">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5">
                            <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                                <Bot size={20} className="text-blue-400" />
                            </div>
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#030712] rounded-full animate-pulse" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg tracking-tight">Clinica Veterinaria Neural</h1>
                        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium font-mono">
                            <Globe size={12} />
                            <span>EU-WEST-1 CONNECTED</span>
                        </div>
                    </div>
                </div>
                <Link to="/" className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white border border-white/5 hover:border-white/20 rounded-lg transition-all uppercase tracking-wider">Disconnetti</Link>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 relative z-0" ref={scrollRef}>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

                {messages.map(msg => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={cn(
                            "flex gap-4 max-w-3xl relative z-10",
                            msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                        )}
                    >
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg",
                            msg.role === 'user' ? "bg-slate-800 text-slate-200" : "bg-gradient-to-br from-blue-600 to-indigo-600 text-white"
                        )}>
                            {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                        </div>
                        <div className={cn(
                            "rounded-2xl px-6 py-4 shadow-xl backdrop-blur-sm border flex flex-col gap-3",
                            msg.role === 'user' ? "bg-white/10 border-white/5 text-white" : "bg-blue-600/10 border-blue-500/20 text-blue-50"
                        )}>
                            {msg.audioUrl && (
                                <div className="flex items-center gap-3 mb-1">
                                    {msg.role === 'assistant' ? (
                                        <>
                                            <button onClick={() => playAudioResponse(msg.audioUrl!)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                                                <Volume2 className="animate-pulse" size={18} />
                                            </button>
                                            <div className="h-6 flex items-center gap-0.5">
                                                {[...Array(8)].map((_, i) => (
                                                    <div key={i} className="w-0.5 bg-current opacity-50 rounded-full animate-[pulse_1s_infinite]" style={{ height: Math.random() * 16 + 8 + 'px', animationDelay: i * 0.1 + 's' }} />
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wider font-bold">
                                            <Mic size={12} /> Audio Sent
                                        </div>
                                    )}
                                </div>
                            )}
                            <p className="leading-relaxed text-[15px] whitespace-pre-wrap">{msg.content}</p>
                        </div>
                    </motion.div>
                ))}

                {/* AI Speaking Indicator */}
                {isAiSpeaking && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 max-w-3xl">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 animate-pulse">
                            <Volume2 size={18} className="text-white" />
                        </div>
                        <div className="bg-blue-600/5 border border-blue-500/10 rounded-2xl px-6 py-4 flex items-center gap-2">
                            <div className="flex gap-1 h-3 items-end">
                                <span className="w-1 bg-blue-400 animate-[bounce_0.5s_infinite] h-full"></span>
                                <span className="w-1 bg-blue-400 animate-[bounce_0.5s_infinite_0.1s] h-full"></span>
                                <span className="w-1 bg-blue-400 animate-[bounce_0.5s_infinite_0.2s] h-full"></span>
                            </div>
                            <span className="text-xs font-mono text-blue-400">AUDIO OUTPUT ACTIVE...</span>
                        </div>
                    </motion.div>
                )}

                {isLoading && !isAiSpeaking && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 max-w-3xl">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0">
                            <Loader2 size={18} className="text-white animate-spin" />
                        </div>
                        <div className="bg-blue-600/5 border border-blue-500/10 rounded-2xl px-6 py-4 flex items-center gap-2">
                            <span className="text-xs font-mono text-blue-400">ANALYZING INPUT...</span>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-[#030712] border-t border-white/5 relative z-20">
                <div className="max-w-4xl mx-auto">
                    {/* Mode Switcher */}
                    <div className="flex justify-center mb-6">
                        <div className="bg-white/5 p-1.5 rounded-full flex gap-1 border border-white/10 backdrop-blur-md">
                            <button
                                onClick={() => setMode('text')}
                                className={cn("px-6 py-2 rounded-full text-sm font-bold transition-all", mode === 'text' ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-white")}
                            >
                                CHAT
                            </button>
                            <button
                                onClick={() => setMode('voice')}
                                className={cn("px-6 py-2 rounded-full text-sm font-bold transition-all", mode === 'voice' ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg" : "text-slate-400 hover:text-white")}
                            >
                                CALL
                            </button>
                        </div>
                    </div>

                    {mode === 'text' ? (
                        <div className="flex gap-3 relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
                                placeholder="Digita comando o richiesta..."
                                className="flex-1 bg-white/5 border border-white/10 hover:border-white/20 text-white rounded-2xl px-6 py-4 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-medium placeholder-slate-600"
                            />
                            <button
                                onClick={handleSendText}
                                disabled={!input.trim() || isLoading}
                                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:grayscale text-white p-4 rounded-2xl transition-all shadow-lg hover:shadow-indigo-500/20 active:scale-95"
                            >
                                <Send size={24} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-6 gap-6 relative">
                            {/* STATUS TEXT */}
                            <p className="text-slate-400 font-mono text-xs tracking-widest uppercase">
                                {isConnecting ? <span className="text-emerald-400 animate-pulse">Connessione in corso...</span> :
                                    isAiSpeaking ? <span className="text-blue-400 animate-pulse">● Valentina sta parlando...</span> :
                                        isRecording ? (
                                            isSpeechDetected ?
                                                <span className="text-emerald-400 animate-pulse font-bold">● Voce Rilevata...</span> :
                                                <span className="text-amber-400 animate-pulse">● In attesa di voce...</span>
                                        ) :
                                            ""}
                            </p>

                            {/* MAIN BUTTON (NON-CLICKABLE AS PER REQUEST) */}
                            <button
                                disabled={true} // Visual only
                                className={cn(
                                    "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 relative group cursor-default",
                                    isConnecting ? "bg-emerald-500/20" :
                                        isRecording ? "bg-red-500/20" : isAiSpeaking ? "bg-slate-600/20" : "bg-blue-600/20"
                                )}
                            >
                                <div className={cn("absolute inset-0 rounded-full border-2 opacity-50 scale-110",
                                    isConnecting ? "border-emerald-500 animate-[ping_1.5s_infinite]" :
                                        isRecording ? "border-red-500 animate-[ping_1.5s_infinite]" :
                                            isAiSpeaking ? "border-slate-500" : "border-blue-500"
                                )} />

                                {/* Visualizer Ring based on volume (only active when user is recording/speaking) */}
                                {isRecording && !isAiSpeaking && !isConnecting && (
                                    <div
                                        className="absolute inset-0 rounded-full border-[3px] border-red-400 opacity-80"
                                        style={{ transform: `scale(${1 + audioVolume / 50})`, transition: 'transform 0.1s ease-out' }}
                                    />
                                )}

                                <div className={cn("w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all",
                                    isConnecting ? "bg-emerald-500 shadow-emerald-500/40" :
                                        isRecording ? "bg-red-500 shadow-red-500/40 scale-90" :
                                            isAiSpeaking ? "bg-slate-600 shadow-slate-600/40" : "bg-blue-500 shadow-blue-500/40"
                                )}>
                                    {isConnecting ? (
                                        <motion.div
                                            animate={{
                                                rotate: [-5, 5, -5, 5, 0],
                                            }}
                                            transition={{
                                                duration: 0.5,
                                                repeat: Infinity,
                                                repeatType: "loop",
                                                ease: "linear"
                                            }}
                                        >
                                            <Phone className="text-white fill-white" size={32} />
                                        </motion.div>
                                    ) :
                                        isRecording ? <Mic className="text-white" size={32} /> :
                                            isAiSpeaking ? <Volume2 className="text-white animate-pulse" size={32} /> :
                                                <Mic className="text-white" size={32} />}
                                </div>
                            </button>

                            <p className="text-slate-500 font-bold text-sm tracking-widest uppercase">
                                PARLA CON VALENTINA
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
