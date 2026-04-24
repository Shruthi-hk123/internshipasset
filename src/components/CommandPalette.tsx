import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Package, Users, History, Settings, Shield, Zap, ArrowRight, Command } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommandPaletteProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  setActiveTab: (tab: string) => void;
}

export default function CommandPalette({ open, setOpen, setActiveTab }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands = [
    { id: 'dashboard', label: 'Go to Dashboard', icon: Zap, category: 'Navigation', shortcut: 'G D' },
    { id: 'assets', label: 'View Asset Registry', icon: Package, category: 'Navigation', shortcut: 'G A' },
    { id: 'employees', label: 'Manage Employees', icon: Users, category: 'Navigation', shortcut: 'G E' },
    { id: 'reports', label: 'Financial Reports', icon: History, category: 'Navigation', shortcut: 'G R' },
    { id: 'security', label: 'Security Audit', icon: Shield, category: 'System', shortcut: 'S A' },
    { id: 'settings', label: 'System Settings', icon: Settings, category: 'System', shortcut: 'S S' },
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.label.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => (i + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => (i - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSelect(filteredCommands[selectedIndex]);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, selectedIndex, filteredCommands]);

  const handleSelect = (cmd: any) => {
    if (!cmd) return;
    if (cmd.category === 'Navigation') {
      setActiveTab(cmd.id);
    }
    setOpen(false);
    setQuery('');
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-[#141414]/40 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#141414]/10 overflow-hidden"
          >
            <div className="flex items-center px-4 py-4 border-b border-[#141414]/5">
              <Search className="w-5 h-5 text-[#141414]/40 mr-3" />
              <input
                autoFocus
                placeholder="Type a command or search..."
                className="flex-1 bg-transparent border-none outline-none text-lg text-[#141414] placeholder:text-[#141414]/30"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="flex items-center gap-1.5 px-2 py-1 bg-[#141414]/5 rounded-lg border border-[#141414]/10">
                <Command className="w-3 h-3 text-[#141414]/40" />
                <span className="text-[10px] font-mono font-bold text-[#141414]/40">K</span>
              </div>
            </div>

            <div className="max-h-[400px] overflow-auto p-2">
              {filteredCommands.length > 0 ? (
                <div className="space-y-1">
                  {filteredCommands.map((cmd, idx) => (
                    <button
                      key={cmd.id}
                      onClick={() => handleSelect(cmd)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all group",
                        idx === selectedIndex ? "bg-[#141414] text-white" : "hover:bg-[#141414]/5 text-[#141414]"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "p-2 rounded-lg transition-colors",
                          idx === selectedIndex ? "bg-white/10" : "bg-[#141414]/5"
                        )}>
                          <cmd.icon className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold">{cmd.label}</p>
                          <p className={cn(
                            "text-[10px] uppercase tracking-widest opacity-50",
                            idx === selectedIndex ? "text-white" : "text-[#141414]"
                          )}>{cmd.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "text-[10px] font-mono px-2 py-0.5 rounded border transition-colors",
                          idx === selectedIndex ? "border-white/20 text-white/60" : "border-[#141414]/10 text-[#141414]/40"
                        )}>
                          {cmd.shortcut}
                        </span>
                        <ArrowRight className={cn(
                          "w-4 h-4 transition-transform",
                          idx === selectedIndex ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"
                        )} />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-sm text-[#141414]/40 font-mono italic">No commands found for "{query}"</p>
                </div>
              )}
            </div>

            <div className="px-4 py-3 bg-[#141414]/[0.02] border-t border-[#141414]/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 bg-white border border-[#141414]/10 rounded text-[10px] font-mono">↑↓</kbd>
                  <span className="text-[10px] text-[#141414]/40 uppercase tracking-widest">Navigate</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 bg-white border border-[#141414]/10 rounded text-[10px] font-mono">↵</kbd>
                  <span className="text-[10px] text-[#141414]/40 uppercase tracking-widest">Select</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 bg-white border border-[#141414]/10 rounded text-[10px] font-mono">ESC</kbd>
                <span className="text-[10px] text-[#141414]/40 uppercase tracking-widest">Close</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
