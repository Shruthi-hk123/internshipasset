import React from 'react';
import { Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  navItems: Array<{ id: string; label: string; icon: React.ComponentType<{ className?: string }> }>;
  isDarkMode: boolean;
}

export default function Layout({
  children,
  activeTab,
  setActiveTab,
  navItems,
  isDarkMode,
}: LayoutProps) {
  return (
    <div className={cn('flex h-screen font-sans relative overflow-hidden transition-colors duration-300 bg-white text-[#141414] dark:bg-gray-900 dark:text-white')}>
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
           style={{ backgroundImage: 'radial-gradient(#141414 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-br from-transparent via-[#141414]/[0.01] to-[#141414]/[0.02]" />

      {/* Sidebar */}
      <aside className={cn('w-64 text-white flex flex-col relative z-10 shadow-2xl transition-colors duration-300 bg-[#1f2937] dark:bg-black')}>
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-[#00FF00]" />
            AssetFlow
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1">Industrial Asset Management</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group hover:scale-[1.02] active:scale-[0.98]",
                activeTab === item.id 
                  ? "bg-[#00FF00] text-[#141414] font-medium shadow-[0_0_20px_rgba(0,255,0,0.2)]" 
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className={cn("w-5 h-5", activeTab === item.id ? "text-[#141414]" : "text-white/40 group-hover:text-white")} />
              {item.label}
            </button>
          ))}
        </nav>

      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        <header className={cn('h-16 border-b flex items-center px-8 bg-white border-[#141414]/10 dark:bg-gray-900 dark:border-white/10')}>
          <h2 className="text-lg font-medium capitalize">{activeTab}</h2>
        </header>

        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
