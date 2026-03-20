"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, Sparkles, User, Minimize2, MoreVertical, Paperclip, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/api";

interface Message {
    id: string;
    text: string;
    sender: "bot" | "user";
    timestamp: Date;
}

export function ChatWidget() {
    const pathname = usePathname() || "";
    const { isAuthenticated, user } = useAuthStore();
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Dynamic Greeting based on time
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 17) return "Good afternoon";
        return "Good evening";
    };

    useEffect(() => {
        if (isAuthenticated && user) {
            const userName = user?.first_name || user?.display_name || 'User';
            const roleLabel = user?.role?.name || 'Authorized User';
            
            // SIGNIFICANTLY RENDER NEW GREETING to prove it is dynamic and fresh
            // This ensures each portal (Platform, HRMS, etc.) feels unique
            setMessages([
                {
                    id: `greet-${user.id}-${Date.now()}`, 
                    text: `${getGreeting()}, ${userName}! As our ${roleLabel}, I've initialized your personalized assistance for this workspace. How can I facilitate your tasks today?`,
                    sender: "bot",
                    timestamp: new Date()
                }
            ]);
        } else if (!isAuthenticated) {
            setMessages([]);
        }
    }, [isAuthenticated, user?.id, user?.display_name, user?.role?.name]); // Added role name as dependency

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    // Hide on login pages or if not authenticated
    const isLoginPage = pathname.toLowerCase().includes('login');
    if (!isAuthenticated || isLoginPage) return null;

    // Determine Role-Based Questions
    const getStarterQuestions = () => {
        const common = [
            "Quick navigation guide",
            "Update my profile",
            "System notifications",
            "Contact support"
        ];

        const level = user?.role?.level || 0;
        const roleName = user?.role?.name || "";

        if (level >= 5) { // Product Admin
            return ["Platform analytics", "Manage companies", "System health logs", ...common];
        } else if (level === 4) { // Company Admin
            return ["Staff reports", "Department overview", "Billing & limits", ...common];
        } else if (roleName.includes('STUDENT')) {
            return ["My course progress", "Upcoming exams", "Join live class", ...common];
        } else if (roleName.includes('TUTOR') || roleName.includes('TEACHER')) {
            return ["Batch schedule", "Attendance marking", "Upload materials", ...common];
        }

        return common;
    };

    const handleSend = async (overrideMessage?: string | React.MouseEvent) => {
        // If overrideMessage is a string (from starter questions), use it.
        // Otherwise use the value from 'message' state.
        const textToSend = typeof overrideMessage === "string" ? overrideMessage : message;
        
        if (!textToSend || !textToSend.trim()) return;

        const newUserMessage: Message = {
            id: Date.now().toString(),
            text: textToSend,
            sender: "user",
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newUserMessage]);
        setMessage("");
        setIsTyping(true);

        try {
            // Use our centralized 'api' instance instead of raw fetch
            // This handles the dynamic URL (Local/IP/Vercel) automatically
            const response = await api.post("/chat", {
                message: textToSend,
                context: {
                    portal: pathname,
                    role: user?.role?.name,
                    userName: user?.display_name,
                    level: user?.role?.level
                }
            });

            const data = response.data;
            
            const botResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: data.response || "I'm having a technical glitch. Please try again or check settings.",
                sender: "bot",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botResponse]);
        } catch (error) {
            console.error("Chat Connection Error:", error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: "I couldn't connect to the AI engine. Please make sure the backend is running and the OpenRouter API key is set.",
                sender: "bot",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const starterQuestions = getStarterQuestions();

    return (
        <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-[9999] flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.9, transformOrigin: "bottom right" }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.9 }}
                        className="mb-4 w-[400px] h-[600px] max-h-[85vh] max-w-[90vw] bg-white/95 backdrop-blur-2xl rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/40 overflow-hidden flex flex-col sm:mb-6"
                    >
                        {/* Header - Premium Gradient */}
                        <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950 p-6 flex items-center justify-between text-white relative">
                            <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none" />
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center border border-white/20 shadow-inner">
                                        <Bot className="h-7 w-7 text-white" />
                                    </div>
                                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg tracking-tight flex items-center gap-2">
                                        Durkkas OS AI
                                        <Sparkles className="h-4 w-4 text-blue-300" />
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <p className="text-xs text-slate-300 font-medium tracking-wide uppercase">Multi-Module Intelligent Assist</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-9 w-9 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl">
                                    <Minimize2 className="h-5 w-5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl">
                                    <MoreVertical className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div 
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#fcfdfe]"
                        >
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, x: msg.sender === "user" ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={cn(
                                        "flex gap-4",
                                        msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                                    )}
                                >
                                    <div className={cn(
                                        "w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1",
                                        msg.sender === "user" 
                                            ? "bg-slate-900 text-white shadow-lg" 
                                            : "bg-white border border-slate-100 text-indigo-600 shadow-sm"
                                    )}>
                                        {msg.sender === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                                    </div>
                                    <div className={cn(
                                        "max-w-[80%] p-4 rounded-3xl text-sm leading-relaxed shadow-sm",
                                        msg.sender === "user"
                                            ? "bg-indigo-600 text-white rounded-tr-none"
                                            : "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
                                    )}>
                                        {msg.text}
                                        <span className={cn(
                                            "text-[10px] mt-2 block opacity-60 font-medium",
                                            msg.sender === "user" ? "text-indigo-100 text-right" : "text-slate-400"
                                        )}>
                                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}

                            {isTyping && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                                    <div className="w-9 h-9 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-indigo-600 shadow-sm">
                                        <Bot className="h-5 w-5" />
                                    </div>
                                    <div className="bg-white border border-slate-100 rounded-3xl rounded-tl-none p-4 shadow-sm flex gap-2 items-center">
                                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                    </div>
                                </motion.div>
                            )}

                            {messages.length === 1 && !isTyping && (
                                <div className="mt-8 px-2">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="h-[1px] flex-1 bg-slate-100" />
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Suggested Actions</p>
                                        <div className="h-[1px] flex-1 bg-slate-100" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {starterQuestions.map((q) => (
                                            <motion.button
                                                key={q}
                                                whileHover={{ scale: 1.02, backgroundColor: "#f8faff" }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => {
                                                    handleSend(q);
                                                }}
                                                className="px-4 py-3 text-left text-[11px] font-semibold text-slate-600 bg-white border border-slate-100 rounded-2xl transition-all shadow-sm hover:border-indigo-200 hover:text-indigo-600"
                                            >
                                                {q}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area - Modern Glass */}
                        <div className="p-6 bg-white border-t border-slate-50">
                            <div className="flex items-center gap-3 mb-4">
                                <Button variant="secondary" size="sm" className="h-8 px-3 rounded-full text-[10px] font-bold bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 border-none">
                                    <Smile className="h-3.5 w-3.5 mr-1.5" /> Emojis
                                </Button>
                                <Button variant="secondary" size="sm" className="h-8 px-3 rounded-full text-[10px] font-bold bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 border-none">
                                    <Paperclip className="h-3.5 w-3.5 mr-1.5" /> Attach
                                </Button>
                            </div>
                            <div className="relative">
                                <Input
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyUp={(e) => e.key === "Enter" && handleSend()}
                                    placeholder="Type your request here..."
                                    className="pr-14 py-7 rounded-[24px] border-slate-100 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-[6px] focus:ring-indigo-500/5 transition-all placeholder:text-slate-400 text-sm font-medium"
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleSend}
                                        disabled={!message.trim()}
                                        className={cn(
                                            "w-11 h-11 flex items-center justify-center rounded-2xl transition-all",
                                            message.trim() 
                                                ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20" 
                                                : "bg-slate-200 text-slate-400 pointer-events-none"
                                        )}
                                    >
                                        <Send className="h-5 w-5" />
                                    </motion.button>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center justify-center gap-2">
                                <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Powered by Durkkas AI Engine</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Toggle Button - Rebranded */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-16 h-16 flex items-center justify-center rounded-2xl shadow-2xl z-50 transition-all duration-300",
                    isOpen 
                        ? "bg-slate-900 text-white rotate-90" 
                        : "bg-slate-900 text-white"
                )}
            >
                {isOpen ? (
                    <X className="h-7 w-7" />
                ) : (
                    <div className="relative">
                        <MessageCircle className="h-7 w-7" />
                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-blue-500 border-2 border-slate-900 rounded-full animate-ping" />
                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-blue-500 border-2 border-slate-900 rounded-full" />
                    </div>
                )}
            </motion.button>
        </div>
    );
}
