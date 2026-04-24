import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, Info, AlertTriangle, Shield, CheckCircle2, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Notification } from '@/types';

const mockNotifications: Notification[] = [
  { id: '1', companyId: 'c1', userId: 'u1', title: 'Maintenance Alert', message: 'MacBook Pro (AST-001) is due for routine service in 3 days.', type: 'Warning', read: false, createdAt: new Date().toISOString() },
  { id: '2', companyId: 'c1', userId: 'u1', title: 'Security Audit', message: 'Suspicious transfer pattern detected in Engineering department.', type: 'Alert', read: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: '3', companyId: 'c1', userId: 'u1', title: 'New Asset Added', message: '50 new Dell Latitude units have been added to the registry.', type: 'Success', read: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: '4', companyId: 'c1', userId: 'u1', title: 'System Update', message: 'AssetFlow Enterprise v4.2 is now live with AI predictive features.', type: 'Info', read: true, createdAt: new Date(Date.now() - 172800000).toISOString() },
];

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'Warning': return <AlertTriangle className="w-4 h-4 text-[#FF6321]" />;
      case 'Alert': return <Shield className="w-4 h-4 text-red-500" />;
      case 'Success': return <CheckCircle2 className="w-4 h-4 text-[#00FF00]" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="fixed top-4 right-20 z-40">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 bg-white border border-[#141414]/10 rounded-xl hover:bg-[#141414]/5 transition-colors group"
      >
        <Bell className="w-5 h-5 text-[#141414]/60 group-hover:text-[#141414]" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-[-1]" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-12 right-0 w-[380px] bg-white border border-[#141414]/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-[#141414]/5 flex items-center justify-between bg-[#141414]/[0.02]">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold">Notifications</h3>
                  <span className="px-1.5 py-0.5 bg-[#141414] text-white text-[10px] font-bold rounded">
                    {unreadCount} NEW
                  </span>
                </div>
                <button 
                  onClick={markAllAsRead}
                  className="text-[10px] font-mono uppercase tracking-widest text-[#141414]/40 hover:text-[#141414] transition-colors"
                >
                  Mark all as read
                </button>
              </div>

              <div className="max-h-[450px] overflow-auto">
                {notifications.length > 0 ? (
                  <div className="divide-y divide-[#141414]/5">
                    {notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={cn(
                          "p-4 flex gap-4 transition-colors group relative",
                          !n.read ? "bg-[#00FF00]/[0.02]" : "hover:bg-[#141414]/[0.01]"
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                          n.type === 'Warning' ? "bg-[#FF6321]/10" : 
                          n.type === 'Alert' ? "bg-red-500/10" : 
                          n.type === 'Success' ? "bg-[#00FF00]/10" : "bg-blue-500/10"
                        )}>
                          {getIcon(n.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-xs font-bold truncate pr-6">{n.title}</h4>
                            <span className="text-[9px] font-mono text-[#141414]/30 uppercase">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#141414]/60 leading-relaxed">
                            {n.message}
                          </p>
                        </div>
                        <button 
                          onClick={() => removeNotification(n.id)}
                          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-1 hover:bg-[#141414]/5 rounded transition-all"
                        >
                          <X className="w-3 h-3 text-[#141414]/40" />
                        </button>
                        {!n.read && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00FF00]" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <Bell className="w-8 h-8 text-[#141414]/10 mx-auto mb-3" />
                    <p className="text-xs text-[#141414]/40 font-mono italic">No notifications yet</p>
                  </div>
                )}
              </div>

              <div className="p-3 border-t border-[#141414]/5 bg-[#141414]/[0.02] text-center">
                <button className="text-[10px] font-mono uppercase tracking-widest text-[#141414]/40 hover:text-[#141414] transition-colors">
                  View all activity logs
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
