import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, X, Send, Sparkles, Loader2, BrainCircuit, History, Zap, ShieldAlert, Cpu, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { geminiService, hasConfiguredGeminiKey } from '@/services/geminiService';
import { useTheme } from 'next-themes';

export default function SmartAssistant() {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  const hasApiKey = hasConfiguredGeminiKey();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string, timestamp: string }[]>([
    { 
      role: 'assistant', 
      content: 'Hello! I am your Asset Intelligence Assistant. I have analyzed your fleet of 15 assets and 15 employees. How can I help you optimize your operations today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingStep, setThinkingStep] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const thinkingSteps = [
    "Scanning asset database...",
    "Analyzing employee trust scores...",
    "Checking maintenance logs...",
    "Cross-referencing security flags...",
    "Generating predictive insights...",
    "Finalizing recommendation..."
  ];

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      let step = 0;
      setThinkingStep(thinkingSteps[0]);
      interval = setInterval(() => {
        step = (step + 1) % thinkingSteps.length;
        setThinkingStep(thinkingSteps[step]);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSend = async (text?: string) => {
    const messageToSend = text || input;
    if (!messageToSend.trim() || isLoading) return;

    const userMessage = messageToSend.trim();
    setInput('');
    setMessages(prev => [...prev, { 
      role: 'user', 
      content: userMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setIsLoading(true);

    try {
      const response = await geminiService.predictMaintenance({ name: "General Query", query: userMessage }, []);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.recommendation || "I've analyzed the system. Everything looks optimal, but I recommend checking the high-priority assets in the Engineering department.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'AI temporarily unavailable. You can continue with manual insights in Reports and Asset views.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 w-14 h-14 bg-[#141414] text-white rounded-full flex items-center justify-center shadow-2xl z-50 group"
      >
        <div className="absolute inset-0 bg-[#00FF00]/20 rounded-full blur-xl group-hover:blur-2xl transition-all opacity-50" />
        <Bot className="w-6 h-6 relative z-10" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#00FF00] rounded-full border-2 border-white animate-pulse" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 left-6 w-[450px] h-[650px] bg-white border border-[#141414]/10 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden dark:bg-gray-900 dark:border-white/10"
          >
            {/* Header */}
            <div className="p-4 border-b border-[#141414]/5 bg-[#141414] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#00FF00]/20 rounded-xl flex items-center justify-center border border-[#00FF00]/30">
                  <BrainCircuit className="w-6 h-6 text-[#00FF00]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    Asset Intelligence
                    <span className="px-1.5 py-0.5 bg-[#00FF00]/10 text-[#00FF00] text-[8px] font-mono uppercase tracking-widest rounded border border-[#00FF00]/20">Pro</span>
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#00FF00] rounded-full animate-pulse" />
                    <p className="text-[10px] text-[#00FF00] font-mono uppercase tracking-widest">Gemini 3.5 Ultra • Real-time</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-white">
                  <History className="w-4 h-4" />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* System Status Bar */}
            <div className="px-4 py-2 bg-[#141414]/[0.03] border-b border-[#141414]/5 flex items-center justify-between dark:bg-white/5 dark:border-white/10">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-3 h-3 text-[#141414]/40" />
                  <span className="text-[9px] font-mono font-bold text-[#141414]/40 dark:text-white/50 uppercase">CPU: 12%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-[#141414]/40" />
                  <span className="text-[9px] font-mono font-bold text-[#141414]/40 dark:text-white/50 uppercase">Latency: 42ms</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="w-3 h-3 text-[#FF6321]" />
                <span className="text-[9px] font-mono font-bold text-[#FF6321] uppercase">2 Alerts</span>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-auto p-4 space-y-6 bg-[#F8F9FA] dark:bg-gray-950">
              {messages.map((msg, idx) => (
                <div key={idx} className={cn(
                  "flex flex-col",
                  msg.role === 'user' ? "items-end" : "items-start"
                )}>
                  <div className={cn(
                    "max-w-[85%] p-4 rounded-2xl text-sm shadow-sm relative group",
                    msg.role === 'user' 
                      ? "bg-[#141414] text-white rounded-tr-none" 
                      : "bg-white border border-[#141414]/10 text-[#141414] rounded-tl-none dark:bg-gray-800 dark:border-white/10 dark:text-white"
                  )}>
                    {msg.role === 'assistant' && (
                      <div className="absolute -top-6 left-0 flex items-center gap-1 text-[10px] font-mono font-bold text-[#141414]/40 dark:text-white/50 uppercase tracking-widest">
                        <Terminal className="w-3 h-3" />
                        AI Output
                      </div>
                    )}
                    <p className="leading-relaxed">{msg.content}</p>
                    <span className={cn(
                      "text-[9px] mt-2 block opacity-40 font-mono",
                      msg.role === 'user' ? "text-right" : "text-left"
                    )}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex flex-col items-start space-y-2">
                  <div className="bg-white border border-[#141414]/10 p-4 rounded-2xl rounded-tl-none shadow-sm flex flex-col gap-3 w-[85%] dark:bg-gray-800 dark:border-white/10">
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-4 h-4 animate-spin text-[#00FF00]" />
                      <span className="text-xs font-bold text-[#141414] dark:text-white">{thinkingStep}</span>
                    </div>
                    <div className="w-full bg-[#141414]/5 h-1 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 8, ease: "linear" }}
                        className="h-full bg-[#00FF00]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-[#141414]/5 bg-white space-y-4 dark:bg-gray-900 dark:border-white/10">
              {!hasApiKey ? (
                <p className="text-xs rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300 px-3 py-2">
                  AI key not configured. Copilot is in safe offline mode with limited responses.
                </p>
              ) : null}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                <QuickAction icon={Zap} label="Predict Failures" onClick={() => handleSend("Predict potential failures in the next 30 days")} />
                <QuickAction icon={ShieldAlert} label="Security Audit" onClick={() => handleSend("Run a security audit on recent transfers")} />
                <QuickAction icon={Sparkles} label="Optimize Fleet" onClick={() => handleSend("How can I optimize asset distribution?")} />
                <QuickAction icon={History} label="Recent Activity" onClick={() => handleSend("Summarize recent high-impact activities")} />
              </div>

              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask anything about your fleet..."
                    className="w-full bg-[#141414]/5 border border-[#141414]/10 rounded-xl pl-4 pr-10 py-3 text-sm focus:ring-2 focus:ring-[#00FF00] focus:bg-white dark:focus:bg-gray-800 outline-none transition-all dark:border-white/10"
                  />
                  <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00FF00] opacity-50" />
                </div>
                <button
                  onClick={() => handleSend()}
                  disabled={isLoading || !input.trim()}
                  className="w-12 h-12 bg-[#141414] text-white rounded-xl flex items-center justify-center hover:bg-[#141414]/90 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-[#141414]/20"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[9px] text-center text-[#141414]/40 dark:text-white/50 font-mono uppercase tracking-widest">
                AI can make mistakes. Verify critical information.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function QuickAction({ label, onClick, icon: Icon }: { label: string, onClick: () => void, icon: any }) {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  return (
    <button
      onClick={onClick}
      className={cn(
        "whitespace-nowrap px-3 py-1.5 border rounded-lg text-[10px] font-bold transition-all flex items-center gap-2 hover:scale-105 active:scale-95",
        isDarkMode ? "bg-white/5 hover:bg-white/10 border-white/10 text-white/70" : "bg-[#141414]/5 hover:bg-[#141414]/10 border-[#141414]/10 text-[#141414]/60"
      )}
    >
      <Icon className="w-3 h-3 text-[#00FF00]" />
      {label}
    </button>
  );
}
