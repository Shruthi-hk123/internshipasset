import React, { useState } from 'react';
import { Search, Filter, Download, History, User, Package, Shield, Zap, ArrowRight, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AuditLog } from '@/types';

const mockAuditLogs: AuditLog[] = [
  { id: '1', companyId: 'c1', userId: 'u1', action: 'Asset Assigned', entityType: 'Asset', entityId: 'AST-001', details: 'MacBook Pro assigned to John Doe', timestamp: new Date().toISOString() },
  { id: '2', companyId: 'c1', userId: 'u1', action: 'Security Flag', entityType: 'Security', entityId: 'SEC-452', details: 'Suspicious login attempt from unknown IP', timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: '3', companyId: 'c1', userId: 'u1', action: 'Maintenance Logged', entityType: 'Maintenance', entityId: 'MNT-882', details: 'Battery replacement completed for AST-042', timestamp: new Date(Date.now() - 7200000).toISOString() },
  { id: '4', companyId: 'c1', userId: 'u1', action: 'P2P Transfer', entityType: 'Asset', entityId: 'AST-102', details: 'iPad Pro transferred from Jane to Mike', timestamp: new Date(Date.now() - 86400000).toISOString() },
  { id: '5', companyId: 'c1', userId: 'u1', action: 'Agreement Signed', entityType: 'Legal', entityId: 'AGR-991', details: 'Digital asset agreement signed by Robert Wilson', timestamp: new Date(Date.now() - 172800000).toISOString() },
];

export default function AuditLogs() {
  const [query, setQuery] = useState('');

  const getIcon = (type: string) => {
    switch (type) {
      case 'Asset': return <Package className="w-4 h-4 text-blue-500" />;
      case 'Security': return <Shield className="w-4 h-4 text-red-500" />;
      case 'Maintenance': return <Zap className="w-4 h-4 text-[#FF6321]" />;
      case 'Legal': return <History className="w-4 h-4 text-[#00FF00]" />;
      default: return <User className="w-4 h-4 text-[#141414]/40" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#141414]">System Audit Logs</h2>
          <p className="text-sm text-[#141414]/40">Immutable record of all system activities</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-[#141414]/10 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#141414]/5 transition-colors">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button className="px-4 py-2 bg-[#141414] text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#141414]/90 transition-colors">
            <Filter className="w-4 h-4" />
            Advanced Filter
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#141414]/10 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#141414]/5 bg-[#141414]/[0.02] flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#141414]/40" />
            <input
              type="text"
              placeholder="Search by action, user, or entity ID..."
              className="w-full bg-white border border-[#141414]/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-[#00FF00] outline-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-[#141414]/40 uppercase tracking-widest">Real-time Feed</span>
            <div className="w-2 h-2 bg-[#00FF00] rounded-full animate-pulse" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#141414]/[0.02] border-b border-[#141414]/5">
                <th className="px-6 py-4 text-[10px] font-mono font-bold text-[#141414]/40 uppercase tracking-widest">Timestamp</th>
                <th className="px-6 py-4 text-[10px] font-mono font-bold text-[#141414]/40 uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-[10px] font-mono font-bold text-[#141414]/40 uppercase tracking-widest">Action</th>
                <th className="px-6 py-4 text-[10px] font-mono font-bold text-[#141414]/40 uppercase tracking-widest">Entity ID</th>
                <th className="px-6 py-4 text-[10px] font-mono font-bold text-[#141414]/40 uppercase tracking-widest">Details</th>
                <th className="px-6 py-4 text-[10px] font-mono font-bold text-[#141414]/40 uppercase tracking-widest"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141414]/5">
              {mockAuditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#141414]/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <p className="text-xs font-mono font-bold text-[#141414]">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </p>
                    <p className="text-[10px] font-mono text-[#141414]/40">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-[#141414]/5 rounded-lg">
                        {getIcon(log.entityType)}
                      </div>
                      <span className="text-xs font-bold text-[#141414]/60">{log.entityType}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-[#141414]">{log.action}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-mono font-bold px-2 py-1 bg-[#141414]/5 rounded-lg border border-[#141414]/10">
                      {log.entityId}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-[#141414]/60 max-w-xs truncate">{log.details}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-[#141414]/5 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                      <ExternalLink className="w-4 h-4 text-[#141414]/40" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-[#141414]/5 bg-[#141414]/[0.02] flex items-center justify-between">
          <p className="text-[10px] font-mono text-[#141414]/40 uppercase tracking-widest">Showing 5 of 12,450 logs</p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 bg-white border border-[#141414]/10 rounded-lg text-[10px] font-bold disabled:opacity-50">Previous</button>
            <button className="px-3 py-1 bg-white border border-[#141414]/10 rounded-lg text-[10px] font-bold">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
