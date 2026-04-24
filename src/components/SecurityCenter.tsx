import React from 'react';
import { Shield, AlertTriangle, CheckCircle2, UserCheck, Lock, Fingerprint, FileText, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

export default function SecurityCenter() {
  const securityMetrics = [
    { label: 'System Integrity', value: '98.4%', status: 'Optimal', icon: Shield, color: 'text-[#00FF00]' },
    { label: 'Active Threats', value: '0', status: 'Clear', icon: AlertTriangle, color: 'text-[#141414]/40' },
    { label: 'Encrypted Assets', value: '1,240', status: '100%', icon: Lock, color: 'text-[#00FF00]' },
    { label: 'Verified Users', value: '458', status: '99.2%', icon: UserCheck, color: 'text-[#00FF00]' },
  ];

  const suspiciousActivities = [
    { id: '1', user: 'John Doe', action: 'Bulk Export Attempt', asset: 'All Assets', severity: 'High', time: '2h ago' },
    { id: '2', user: 'Jane Smith', action: 'Unauthorized Transfer', asset: 'MacBook Pro (AST-042)', severity: 'Critical', time: '5h ago' },
    { id: '3', user: 'System', action: 'Multiple Failed Logins', asset: 'Admin Console', severity: 'Medium', time: '1d ago' },
  ];

  return (
    <div className="space-y-8">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {securityMetrics.map((metric, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-[#141414]/10 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-[#141414]/5 rounded-xl">
                <metric.icon className={cn("w-5 h-5", metric.color)} />
              </div>
              <span className="text-[10px] font-mono font-bold text-[#141414]/40 uppercase tracking-widest">{metric.status}</span>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-[#141414]/40 mb-1">{metric.label}</p>
            <h3 className="text-2xl font-bold text-[#141414]">{metric.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Suspicious Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#141414]/10 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#141414]/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Suspicious Activity Detection</h3>
                <p className="text-xs text-[#141414]/40">AI-powered behavior analysis</p>
              </div>
            </div>
            <button className="text-[10px] font-mono font-bold text-[#141414]/40 hover:text-[#141414] uppercase tracking-widest transition-colors">
              View All Alerts
            </button>
          </div>
          <div className="divide-y divide-[#141414]/5">
            {suspiciousActivities.map((activity) => (
              <div key={activity.id} className="p-6 flex items-center justify-between hover:bg-[#141414]/[0.01] transition-colors">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    activity.severity === 'Critical' ? "bg-red-500 animate-pulse" : 
                    activity.severity === 'High' ? "bg-[#FF6321]" : "bg-yellow-500"
                  )} />
                  <div>
                    <p className="text-sm font-bold text-[#141414]">{activity.action}</p>
                    <p className="text-xs text-[#141414]/40">
                      <span className="font-medium text-[#141414]/60">{activity.user}</span> • {activity.asset}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={cn(
                    "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest mb-1 inline-block",
                    activity.severity === 'Critical' ? "bg-red-500/10 text-red-500" : 
                    activity.severity === 'High' ? "bg-[#FF6321]/10 text-[#FF6321]" : "bg-yellow-500/10 text-yellow-500"
                  )}>
                    {activity.severity}
                  </span>
                  <p className="text-[10px] font-mono text-[#141414]/30">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Score Leaderboard */}
        <div className="bg-[#141414] text-white rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FF00]/10 blur-3xl rounded-full -mr-16 -mt-16" />
          
          <div className="flex items-center gap-3 mb-8 relative z-10">
            <div className="w-10 h-10 bg-[#00FF00]/20 rounded-xl flex items-center justify-center">
              <Fingerprint className="w-5 h-5 text-[#00FF00]" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Trust Score System</h3>
              <p className="text-[10px] text-[#00FF00] font-mono uppercase tracking-widest">Behavior Analysis</p>
            </div>
          </div>

          <div className="space-y-6 relative z-10">
            <TrustItem name="Engineering Dept" score={98} trend="up" />
            <TrustItem name="Sales Operations" score={84} trend="down" />
            <TrustItem name="Product Design" score={92} trend="up" />
            <TrustItem name="Executive Team" score={99} trend="up" />
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-white/60">Global Trust Average</p>
              <p className="text-lg font-bold text-[#00FF00]">94.2</p>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-[#00FF00] w-[94.2%]" />
            </div>
          </div>
        </div>
      </div>

      {/* Digital Agreements Section */}
      <div className="bg-white rounded-2xl border border-[#141414]/10 shadow-sm p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#141414] text-white rounded-2xl flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Digital Asset Agreements</h3>
              <p className="text-sm text-[#141414]/40">Blockchain-verified ownership records</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-[#141414] text-white rounded-xl text-sm font-bold hover:bg-[#141414]/90 transition-colors flex items-center gap-2">
            Generate New Template
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AgreementCard title="Standard Issue" count={1240} status="Active" />
          <AgreementCard title="High-Value Asset" count={42} status="Strict" />
          <AgreementCard title="Temporary Borrow" count={15} status="Expiring" />
        </div>
      </div>
    </div>
  );
}

function TrustItem({ name, score, trend }: { name: string, score: number, trend: 'up' | 'down' }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-bold">{name}</p>
        <div className="flex items-center gap-1 mt-1">
          <div className={cn(
            "w-1.5 h-1.5 rounded-full",
            score > 90 ? "bg-[#00FF00]" : score > 80 ? "bg-yellow-500" : "bg-red-500"
          )} />
          <span className="text-[10px] text-white/40 uppercase tracking-widest">Verified</span>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-mono font-bold">{score}</p>
        <p className={cn(
          "text-[9px] font-bold uppercase",
          trend === 'up' ? "text-[#00FF00]" : "text-red-500"
        )}>{trend === 'up' ? '↑ Increasing' : '↓ Decreasing'}</p>
      </div>
    </div>
  );
}

function AgreementCard({ title, count, status }: { title: string, count: number, status: string }) {
  return (
    <div className="p-6 bg-[#141414]/[0.02] rounded-2xl border border-[#141414]/5 hover:border-[#141414]/20 transition-all group">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-mono font-bold text-[#141414]/40 uppercase tracking-widest">{status}</span>
        <div className="w-8 h-8 rounded-lg bg-white border border-[#141414]/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowUpRight className="w-4 h-4 text-[#141414]" />
        </div>
      </div>
      <h4 className="text-sm font-bold mb-1">{title}</h4>
      <p className="text-2xl font-bold text-[#141414]">{count}</p>
      <p className="text-[10px] text-[#141414]/40 uppercase tracking-widest mt-1">Signed Agreements</p>
    </div>
  );
}
