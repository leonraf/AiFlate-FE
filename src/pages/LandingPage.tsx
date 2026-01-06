import { useState, useEffect } from 'react';
import { ArrowRight, Bot, Shield, Phone, MessageSquare, Zap, Clock, Globe, Cpu, Sparkles, CheckCircle2, ShoppingBag, Calendar, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen overflow-x-hidden bg-[#030712] text-white selection:bg-blue-500/30">
            {/* Dynamic Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px] animate-pulse delay-1000" />
            </div>

            {/* Navbar */}
            <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#030712]/80 backdrop-blur-xl transition-all duration-300">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3 font-bold text-2xl tracking-tight">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-blue-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
                            <div className="relative bg-gradient-to-tr from-blue-500 to-indigo-500 p-2 rounded-xl border border-white/10">
                                <Bot size={24} className="text-white" />
                            </div>
                        </div>
                        <span>Aiflate<span className="text-blue-500">.</span></span>
                    </div>

                    {/* Mobile-hidden Tagline in Header */}
                    <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-900/10 border border-blue-500/20 text-blue-300 text-xs font-medium backdrop-blur-md">
                        <Sparkles size={12} className="text-blue-400" />
                        <span>Il futuro dell'assistenza clienti è qui</span>
                    </div>

                    <Link
                        to="/demo"
                        className="group relative px-6 py-2.5 rounded-full font-medium transition-all"
                    >
                        <span className="absolute inset-0 w-full h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 opacity-20 group-hover:opacity-100 blur transition-opacity duration-300" />
                        <span className="relative flex items-center gap-2 bg-black/50 backdrop-blur-md border border-white/10 rounded-full px-6 py-2.5 group-hover:border-white/20 transition-colors">
                            Area Demo <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative z-10 pt-32 pb-20 lg:pt-48 lg:pb-32">
                <div className="container mx-auto px-6 text-center">


                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-10 leading-tight"
                    >
                        Il tuo business, <br />
                        <span className="relative inline-block">
                            <span className="absolute -inset-1 rounded-lg bg-gradient-to-r from-blue-600/20 to-indigo-600/20 blur-xl" />
                            <span className="relative bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 drop-shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                                Superpotenziato.
                            </span>
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-14 leading-relaxed font-light"
                    >
                        Auto-pilota per le tue conversazioni. <strong className="text-slate-200 font-medium">Chat</strong>, <strong className="text-slate-200 font-medium">Voce</strong> e <strong className="text-slate-200 font-medium">Automazione</strong> in un'unica piattaforma neurale che non dorme mai.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-6"
                    >
                        <Link
                            to="/demo"
                            className="relative group w-full sm:w-auto px-10 py-5 rounded-full font-bold text-lg overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                            <span className="relative flex items-center justify-center gap-3">
                                Inizia la Demo <Zap size={20} className="fill-white" />
                            </span>
                        </Link>
                        <a href="#examples" className="group px-10 py-5 rounded-full font-bold text-lg border border-white/10 hover:bg-white/5 transition-all flex items-center gap-2 text-slate-300 hover:text-white">
                            Vedi Esempi <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </a>
                    </motion.div>
                </div>
            </section>

            {/* --- LIVE DEMOS SECTION (Chat & Voice) --- */}
            <section id="examples" className="py-16 relative z-10">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">In azione, in tempo reale.</h2>
                        <p className="text-slate-400 max-w-xl mx-auto text-lg">Guarda come Aiflate gestisce scenari complessi senza intervento umano.</p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">

                        {/* 1. CHAT AUTOMATION DEMO */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000" />
                            <div className="relative h-[600px] bg-[#0b0f19] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
                                {/* Fake Browser Header */}
                                <div className="px-6 py-4 bg-[#030712] border-b border-white/5 flex items-center justify-between">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                                    </div>
                                    <div className="text-xs font-mono text-slate-500">app.clinica-veterinaria.it</div>
                                    <div className="w-4" />
                                </div>

                                <div className="flex-1 p-6 flex flex-col">
                                    <ChatSimulation />
                                </div>
                            </div>
                        </div>

                        {/* 2. VOICE & BACKEND DEMO */}
                        <div className="flex flex-col gap-8">
                            <VoiceCallSimulation />
                            <DashboardSimulation />
                        </div>

                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="relative z-10 py-32 bg-[#020617]/50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-24">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Tecnologia oltre i confini</h2>
                        <p className="text-slate-400 max-w-xl mx-auto text-lg">
                            Abbiamo ridefinito lo standard dell'assistenza automatizzata.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FeatureCard
                            icon={<Cpu className="text-cyan-400" size={32} />}
                            title="Neural Processing"
                            description="Il nostro motore neurale elabora le intenzioni del cliente in 200ms, più veloce del pensiero umano."
                            color="cyan"
                        />
                        <FeatureCard
                            icon={<MessageSquare className="text-violet-400" size={32} />}
                            title="Omnichannel Sync"
                            description="La memoria conversazionale è unificata tra telefono, WhatsApp e Web. Non perde mai il filo."
                            color="violet"
                        />
                        <FeatureCard
                            icon={<Shield className="text-emerald-400" size={32} />}
                            title="GDPR Fortress"
                            description="Dati criptati e residenti al 100% in EU. Privacy by design per te e i tuoi clienti."
                            color="emerald"
                        />
                        <FeatureCard
                            icon={<Bot className="text-pink-400" size={32} />}
                            title="Human-Like Voice"
                            description="Sintesi vocale indistinguibile dall'umano, con pause, respiri ed emozioni contestuali."
                            color="pink"
                        />
                        <FeatureCard
                            icon={<Clock className="text-amber-400" size={32} />}
                            title="Always On"
                            description="Nessuna pausa caffè. Aiflate gestisce picchi di traffico illimitati, 24 ore su 24."
                            color="amber"
                        />
                        <FeatureCard
                            icon={<Globe className="text-blue-400" size={32} />}
                            title="Local Intelligence"
                            description="Addestrato specificamente su dialetti, modi di dire e contesto culturale italiano."
                            color="blue"
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 py-12 border-t border-white/5 bg-[#020617]">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2 font-bold text-xl">
                        <div className="bg-blue-600/20 p-1.5 rounded-lg border border-blue-500/30">
                            <Bot size={20} className="text-blue-400" />
                        </div>
                        <span>Aiflate</span>
                    </div>
                    <div className="text-sm text-slate-500">
                        © 2026 Aiflate Intelligence Systems. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}

// --- SUB-COMPONENTS FOR ANIMATIONS ---

function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: string }) {
    const gradients = {
        cyan: "hover:shadow-cyan-500/20 hover:border-cyan-500/30",
        violet: "hover:shadow-violet-500/20 hover:border-violet-500/30",
        emerald: "hover:shadow-emerald-500/20 hover:border-emerald-500/30",
        pink: "hover:shadow-pink-500/20 hover:border-pink-500/30",
        amber: "hover:shadow-amber-500/20 hover:border-amber-500/30",
        blue: "hover:shadow-blue-500/20 hover:border-blue-500/30",
    };

    return (
        <div className={`p-8 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-500 group cursor-default backdrop-blur-sm shadow-2xl shadow-transparent h-full flex flex-col ${gradients[color as keyof typeof gradients]}`}>
            <div className="mb-6 p-4 bg-white/5 rounded-2xl inline-flex group-hover:scale-110 transition-transform duration-300 border border-white/10 w-fit">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-3 tracking-wide">{title}</h3>
            <p className="text-slate-400 leading-relaxed group-hover:text-slate-200 transition-colors">
                {description}
            </p>
        </div>
    );
}

const CHAT_SCENARIO = [
    { role: 'ai', text: "Benvenuto alla Clinica Veterinaria. Come posso aiutarla?" },
    { role: 'user', text: "Vorrei prenotare una visita per il mio cane, Rex." },
    { role: 'ai', text: "Certamente. Rex ha qualche sintomo particolare?" },
    { role: 'user', text: "Zoppica un po' dalla zampa posteriore sinistra." },
    { role: 'ai', text: "Capisco. Ho uno slot libero domani alle 10:30 con il Dr. Valli. Confermo?" },
    { role: 'user', text: "Sì, perfetto." },
    { role: 'ai', text: "Prenotato! Le ho inviato i dettagli su WhatsApp." }
];

function ChatSimulation() {
    const [messages, setMessages] = useState<{ role: string, text: string }[]>([]);
    const [typing, setTyping] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (currentIndex >= CHAT_SCENARIO.length) {
            const timeout = setTimeout(() => {
                setMessages([]);
                setCurrentIndex(0);
            }, 5000); // Reset after 5s
            return () => clearTimeout(timeout);
        }

        const currentMsg = CHAT_SCENARIO[currentIndex];

        // Typing delay simulation
        if (currentMsg.role === 'user') {
            // User types relatively fast
            setTimeout(() => {
                setMessages(prev => [...prev, currentMsg]);
                setCurrentIndex(prev => prev + 1);
            }, 1500);
        } else {
            // AI thinks briefly then responds instantly (or types super fast)
            setTyping(true);
            setTimeout(() => {
                setTyping(false);
                setMessages(prev => [...prev, currentMsg]);
                setCurrentIndex(prev => prev + 1);
            }, 1000);
        }

    }, [currentIndex]);

    return (
        <div className="flex flex-col h-full font-sans">
            <div className="flex-1 space-y-4 overflow-hidden">
                <AnimatePresence>
                    {messages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={cn(
                                "max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm",
                                msg.role === 'user'
                                    ? "bg-white/10 text-white ml-auto rounded-tr-sm border border-white/5"
                                    : "bg-gradient-to-br from-blue-600 to-indigo-700 text-white mr-auto rounded-tl-sm shadow-blue-900/20"
                            )}
                        >
                            {msg.text}
                        </motion.div>
                    ))}
                </AnimatePresence>
                {typing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-blue-600/10 border border-blue-500/20 text-blue-400 mr-auto rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 w-fit">
                        <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce delay-75" />
                        <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce delay-150" />
                    </motion.div>
                )}
            </div>

            {/* Input Simulation */}
            <div className="mt-6 pt-4 border-t border-white/5">
                <div className="h-12 bg-white/5 rounded-full border border-white/5 flex items-center px-4">
                    <div className="w-full h-2 bg-white/10 rounded-full animate-pulse max-w-[200px]" />
                    <div className="ml-auto p-2 bg-blue-600 rounded-full">
                        <ArrowRight size={14} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function VoiceCallSimulation() {
    return (
        <div className="relative group h-[280px]">
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000" />
            <div className="relative h-full bg-[#0b0f19] border border-white/10 rounded-3xl overflow-hidden shadow-2xl p-8 flex flex-col items-center justify-center">

                <div className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-green-400 tracking-widest uppercase">Live Call</span>
                </div>

                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500 to-indigo-600 p-0.5 mb-6 relative">
                    <div className="absolute inset-0 bg-pink-500 blur-xl opacity-40 animate-pulse" />
                    <div className="w-full h-full bg-black rounded-full flex items-center justify-center relative z-10">
                        <Phone size={32} className="text-white" />
                    </div>
                    {/* Ringing waves */}
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`absolute inset-0 border border-pink-500/30 rounded-full animate-[ping_3s_infinite] delay-[${i * 0.5}s]`} />
                    ))}
                </div>

                <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold text-white">Chiamata in arrivo...</h3>
                    <p className="text-slate-400 text-sm">Analisi vocale real-time in corso</p>
                </div>

                <div className="mt-6 flex items-center gap-1 h-8">
                    {[...Array(12)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="w-1 bg-gradient-to-t from-pink-500 to-purple-500 rounded-full"
                            animate={{ height: ["20%", "80%", "40%"] }}
                            transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

function DashboardSimulation() {
    return (
        <div className="relative group h-[280px]">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000" />
            <div className="relative h-full bg-[#0b0f19] border border-white/10 rounded-3xl overflow-hidden shadow-2xl p-6 flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                    <Activity size={18} className="text-emerald-400" />
                    <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">Aiflate Backend Sync</span>
                </div>

                <div className="space-y-3">
                    <DashboardItem
                        icon={<Calendar size={16} className="text-blue-400" />}
                        title="Nuovo Appuntamento"
                        desc="Rex (Cane) - Dr. Valli - Domani 10:30"
                        time="Adesso"
                    />
                    <DashboardItem
                        icon={<ShoppingBag size={16} className="text-purple-400" />}
                        title="Ordine Confermato"
                        desc="Croccantini Premium x2 - Spedizione 24h"
                        time="2m fa"
                    />
                    <DashboardItem
                        icon={<CheckCircle2 size={16} className="text-emerald-400" />}
                        title="Follow-up Inviato"
                        desc="WhatsApp inviato al cliente +39 333..."
                        time="5m fa"
                    />
                </div>
            </div>
        </div>
    )
}

function DashboardItem({ icon, title, desc, time }: any) {
    return (
        <div className="flex items-start gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
            <div className="mt-1 p-2 bg-black/40 rounded-lg border border-white/5">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <h4 className="font-bold text-sm text-slate-200 truncate">{title}</h4>
                    <span className="text-[10px] text-slate-500 font-mono bg-white/5 px-1.5 py-0.5 rounded">{time}</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{desc}</p>
            </div>
        </div>
    )
}
