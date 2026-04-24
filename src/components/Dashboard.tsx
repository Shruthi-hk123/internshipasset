import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Users, AlertTriangle, CheckCircle2, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Asset } from '@/types';

const data = [
  { name: 'Laptops', count: 450 },
  { name: 'Mobiles', count: 300 },
  { name: 'Desktops', count: 120 },
  { name: 'Peripherals', count: 280 },
  { name: 'Furniture', count: 150 },
];

const statusData = [
  { name: 'Available', value: 400, color: '#00FF00' },
  { name: 'Assigned', value: 850, color: '#141414' },
  { name: 'Maintenance', value: 50, color: '#FF6321' },
];

interface DashboardProps {
  assets: Asset[];
  role: 'admin' | 'employee';
  onNavigateAssets: (preset?: { status?: string }) => void;
  onNavigateEmployees: () => void;
}

export default function Dashboard({ assets, role, onNavigateAssets, onNavigateEmployees }: DashboardProps) {
  const totalAssets = assets.length;
  const assignedAssets = assets.filter((asset) => asset.status === 'Assigned').length;
  const maintenanceAssets = assets.filter((asset) => asset.status === 'Maintenance').length;

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Assets" 
          value={String(totalAssets)} 
          icon={Package} 
          description="Total company property"
          trend="Click for details"
          onClick={() => onNavigateAssets()}
        />
        <StatCard 
          title="Active Assignments" 
          value={String(assignedAssets)} 
          icon={CheckCircle2} 
          description="Items with employees"
          trend="View assigned"
          onClick={() => onNavigateAssets({ status: 'Assigned' })}
        />
        {role === 'admin' ? (
          <StatCard 
            title="Total Employees" 
            value="1,000" 
            icon={Users} 
            description="Workforce size"
            trend="View directory"
            onClick={onNavigateEmployees}
          />
        ) : null}
        <StatCard 
          title="Maintenance Required" 
          value={String(maintenanceAssets)} 
          icon={AlertTriangle} 
          description="Items needing repair"
          trend="View maintenance"
          variant="warning"
          onClick={() => onNavigateAssets({ status: 'Maintenance' })}
        />
        <StatCard 
          title="Predictive Alerts" 
          value="05" 
          icon={TrendingDown} 
          description="AI-predicted failures"
          trend="Preventative"
          variant="info"
          onClick={() => onNavigateAssets({ status: 'Maintenance' })}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Distribution */}
        <Card className="border-[#141414]/10 shadow-sm bg-white dark:bg-gray-900 dark:border-white/10">
          <CardHeader className="border-b border-[#141414]/5 dark:border-white/10">
            <CardTitle className="text-sm font-mono uppercase tracking-widest opacity-50 italic dark:text-white/70">Asset Distribution</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#14141410" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#14141460' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#14141460' }} />
                  <Tooltip 
                    cursor={{ fill: '#14141405' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #14141410', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  />
                  <Bar dataKey="count" fill="#141414" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Breakdown */}
        <Card className="border-[#141414]/10 shadow-sm bg-white dark:bg-gray-900 dark:border-white/10">
          <CardHeader className="border-b border-[#141414]/5 dark:border-white/10">
            <CardTitle className="text-sm font-mono uppercase tracking-widest opacity-50 italic dark:text-white/70">Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 flex items-center justify-center">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4 min-w-[150px]">
              {statusData.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <div>
                    <p className="text-xs font-medium">{item.name}</p>
                    <p className="text-[10px] text-[#141414]/40 dark:text-white/50">{item.value} units</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, description, trend, variant = 'default', onClick }: any) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'warning': return "bg-[#FF6321]/10 text-[#FF6321]";
      case 'info': return "bg-blue-500/10 text-blue-500";
      default: return "bg-[#141414]/5 text-[#141414] dark:bg-white/10 dark:text-white";
    }
  };

  const getTrendStyles = () => {
    switch (variant) {
      case 'warning': return "bg-[#FF6321]/10 text-[#FF6321]";
      case 'info': return "bg-blue-500/10 text-blue-500";
      default: return "bg-[#00FF00]/10 text-[#00FF00]";
    }
  };

  return (
    <Card
      className={cn(
        "border-[#141414]/10 shadow-sm bg-white dark:bg-gray-900 dark:border-white/10 overflow-hidden group hover:border-[#141414]/30 dark:hover:border-white/20 transition-all duration-300 hover:scale-[1.01] hover:shadow-md",
        onClick ? 'cursor-pointer' : 'cursor-default'
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest opacity-50 italic mb-1 dark:text-white/70">{title}</p>
            <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
          </div>
          <div className={cn("p-2 rounded-lg", getVariantStyles())}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-[#141414]/40 dark:text-white/50">{description}</p>
          <p className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", getTrendStyles())}>
            {trend}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
