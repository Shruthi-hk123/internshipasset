import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  QrCode, 
  History, 
  Settings, 
  Wrench, 
  Calendar, 
  User, 
  ShieldCheck, 
  TrendingDown, 
  PlusCircle,
  MapPin,
  Activity,
  AlertCircle,
  BrainCircuit,
  ArrowUpRight,
  Box,
  Hash,
  DollarSign,
  Loader2,
  Clock,
  Timer,
  PauseCircle,
  PlayCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Asset } from '@/types';
import { toast } from 'sonner';
import { geminiService } from '@/services/geminiService';

interface AssetDetailProps {
  asset: Asset;
}

export default function AssetDetail({ asset }: AssetDetailProps) {
  const [isLogging, setIsLogging] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    cost: '',
    performedBy: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [aiInsights, setAiInsights] = useState<{ riskScore: number, recommendation: string } | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [usageSeconds, setUsageSeconds] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(asset.status === 'Assigned');

  useEffect(() => {
    let interval: any;
    if (isTimerActive) {
      interval = setInterval(() => {
        setUsageSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getUsageStatus = () => {
    if (usageSeconds > 28800) return { label: 'Over-utilized', color: 'text-red-500', icon: AlertCircle };
    if (usageSeconds === 0 && asset.status === 'Assigned') return { label: 'Under-utilized', color: 'text-yellow-500', icon: AlertCircle };
    return { label: 'Optimal', color: 'text-[#00FF00]', icon: ShieldCheck };
  };

  const usageStatus = getUsageStatus();

  useEffect(() => {
    const fetchAiInsights = async () => {
      setIsAiLoading(true);
      try {
        const result = await geminiService.predictMaintenance(asset, []);
        setAiInsights({
          riskScore: result.riskScore,
          recommendation: result.recommendation
        });
      } catch (error) {
        console.error('Failed to fetch AI insights:', error);
      } finally {
        setIsAiLoading(false);
      }
    };

    fetchAiInsights();
  }, [asset]);

  const timeline = [
    { date: '2023-01-15', event: 'Procurement', user: 'Admin', type: 'system' },
    { date: '2023-01-16', event: 'Assigned to Michael Chen', user: 'Sarah Jenkins', type: 'assignment' },
    { date: '2023-06-12', event: 'Maintenance: Screen Replacement', user: 'IT Support', type: 'maintenance' },
    { date: '2024-02-01', event: 'Returned to Inventory', user: 'Michael Chen', type: 'return' },
    { date: '2024-02-05', event: 'Assigned to Elena Rodriguez', user: 'Sarah Jenkins', type: 'assignment' },
  ];

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.description || formData.description.length < 5) newErrors.description = 'Description must be at least 5 characters';
    if (!formData.cost || isNaN(Number(formData.cost)) || Number(formData.cost) < 0) newErrors.cost = 'Valid cost is required';
    if (!formData.performedBy) newErrors.performedBy = 'Technician name is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      toast.success('Maintenance log recorded successfully', {
        description: `${formData.description} - $${formData.cost}`
      });
      setIsLogging(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        description: '',
        cost: '',
        performedBy: ''
      });
    } else {
      toast.error('Please fix the errors in the form');
    }
  };

  return (
    <div className="space-y-8 max-h-[85vh] overflow-auto p-1 no-scrollbar">
      {/* Header with Priority and Trust Score */}
      <div className="flex items-center justify-between bg-[#141414] text-white p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00FF00]/5 blur-[100px] rounded-full -mr-48 -mt-48" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <Badge className={cn(
              "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border-none",
              asset.status === 'Available' ? "bg-[#00FF00] text-[#141414]" : "bg-[#FF6321] text-white"
            )}>
              {asset.status}
            </Badge>
            <Badge variant="outline" className={cn(
              "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border-white/20 text-white/60",
              asset.priority === 'Critical' && "border-red-500 text-red-500"
            )}>
              {asset.priority || 'Medium'} Priority
            </Badge>
          </div>
          <h2 className="text-4xl font-bold tracking-tight">{asset.name}</h2>
          <p className="text-sm text-white/40 font-mono mt-2 flex items-center gap-2">
            <Hash className="w-3 h-3" /> {asset.assetTag} 
            <span className="opacity-20">|</span> 
            <Settings className="w-3 h-3" /> {asset.serialNumber}
          </p>
        </div>
        <div className="text-right relative z-10">
          <p className="text-[10px] uppercase tracking-widest text-white/40 mb-2 font-mono">Asset Health Score</p>
          <div className="flex items-center gap-4">
            <div className="w-40 h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '92%' }}
                className="h-full bg-[#00FF00]" 
              />
            </div>
            <span className="text-3xl font-bold text-[#00FF00] font-mono">92</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details & Location */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <DetailItem icon={Box} label="Category" value={asset.category} />
            <DetailItem icon={Settings} label="Model" value={asset.model} />
            <DetailItem icon={Calendar} label="Purchased" value={asset.purchaseDate} />
            <DetailItem icon={User} label="Current Holder" value={asset.currentHolderId || 'Unassigned'} />
          </div>

          {/* Real-time Location Tracking */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-[#141414]/10 shadow-none bg-white overflow-hidden">
              <CardHeader className="border-b border-[#141414]/5 flex flex-row items-center justify-between py-4">
                <CardTitle className="text-[10px] font-mono uppercase tracking-widest opacity-50 italic flex items-center gap-2">
                  <Timer className="w-3 h-3" />
                  Active Usage Timer
                </CardTitle>
                <Badge variant="outline" className={cn("text-[9px] font-mono", isTimerActive ? "text-[#00FF00] border-[#00FF00]/20" : "text-red-500 border-red-500/20")}>
                  {isTimerActive ? 'TRACKING' : 'PAUSED'}
                </Badge>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="text-4xl font-mono font-bold tracking-tighter text-[#141414]">
                    {formatTime(usageSeconds)}
                  </div>
                  <div className="flex items-center gap-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsTimerActive(!isTimerActive)}
                      className="h-8 text-[9px] uppercase tracking-widest gap-2"
                    >
                      {isTimerActive ? <><PauseCircle className="w-3 h-3" /> Pause</> : <><PlayCircle className="w-3 h-3" /> Resume</>}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setUsageSeconds(0)}
                      className="h-8 text-[9px] uppercase tracking-widest text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#141414]/10 shadow-none bg-white overflow-hidden">
              <CardHeader className="border-b border-[#141414]/5 py-4">
                <CardTitle className="text-[10px] font-mono uppercase tracking-widest opacity-50 italic flex items-center gap-2">
                  <Activity className="w-3 h-3" />
                  Usage Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-widest text-[#141414]/40">Current Status</span>
                    <div className={cn("flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest", usageStatus.color)}>
                      <usageStatus.icon className="w-3 h-3" />
                      {usageStatus.label}
                    </div>
                  </div>
                  <div className="p-3 bg-[#141414]/[0.02] rounded-xl border border-[#141414]/5">
                    <p className="text-[10px] leading-relaxed text-[#141414]/60 italic">
                      {usageSeconds > 28800 
                        ? "Warning: Asset has exceeded standard 8-hour usage threshold. Potential heat stress detected."
                        : usageSeconds === 0 && asset.status === 'Assigned'
                        ? "Alert: Asset is assigned but shows zero active usage. Consider reallocation."
                        : "Usage patterns are within normal operational parameters for this asset category."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Real-time Location Tracking */}
          <Card className="border-[#141414]/10 shadow-none bg-white overflow-hidden">
            <CardHeader className="border-b border-[#141414]/5 flex flex-row items-center justify-between py-4">
              <CardTitle className="text-[10px] font-mono uppercase tracking-widest opacity-50 italic flex items-center gap-2">
                <MapPin className="w-3 h-3" />
                Real-time Location Tracking
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-[#00FF00] font-bold animate-pulse">● LIVE</span>
                <span className="text-[9px] font-mono text-[#141414]/40">Last updated: 2m ago</span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="aspect-[21/9] bg-[#141414]/5 relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-20 grayscale bg-[url('https://picsum.photos/seed/map-asset/1200/600')] bg-cover" />
                <div className="relative z-10 flex flex-col items-center">
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-12 h-12 bg-[#141414] text-white rounded-full flex items-center justify-center shadow-2xl border-4 border-white"
                  >
                    <MapPin className="w-6 h-6" />
                  </motion.div>
                  <div className="mt-3 px-4 py-1.5 bg-white rounded-xl shadow-2xl border border-[#141414]/10">
                    <p className="text-xs font-bold text-[#141414]">Main HQ • Floor 4 • Zone B</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Log */}
          <Card className="border-[#141414]/10 shadow-none bg-white overflow-hidden">
            <CardHeader className="border-b border-[#141414]/5 flex flex-row items-center justify-between py-4">
              <CardTitle className="text-[10px] font-mono uppercase tracking-widest opacity-50 italic flex items-center gap-2">
                <Wrench className="w-3 h-3" />
                Maintenance History & Logs
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsLogging(!isLogging)}
                className="h-8 text-[10px] uppercase tracking-widest gap-2 hover:bg-[#141414]/5"
              >
                {isLogging ? 'Cancel' : <><PlusCircle className="w-3 h-3" /> Log Entry</>}
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {isLogging && (
                <div className="p-6 bg-[#141414]/[0.02] border-b border-[#141414]/5">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase tracking-widest opacity-50">Service Date</Label>
                        <Input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="h-9 border-[#141414]/10" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase tracking-widest opacity-50">Cost ($)</Label>
                        <Input type="number" placeholder="0.00" value={formData.cost} onChange={(e) => setFormData({...formData, cost: e.target.value})} className="h-9 border-[#141414]/10" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase tracking-widest opacity-50">Performed By</Label>
                      <Input placeholder="Technician Name" value={formData.performedBy} onChange={(e) => setFormData({...formData, performedBy: e.target.value})} className="h-9 border-[#141414]/10" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase tracking-widest opacity-50">Description</Label>
                      <Input placeholder="Details of service..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="h-9 border-[#141414]/10" />
                    </div>
                    <Button type="submit" className="w-full bg-[#141414] text-white hover:bg-[#141414]/90 text-[10px] uppercase tracking-widest h-9">Save Record</Button>
                  </form>
                </div>
              )}
              <div className="divide-y divide-[#141414]/5">
                {timeline.filter(t => t.type === 'maintenance').map((item, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between hover:bg-[#141414]/[0.01] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-[#FF6321]/10 rounded-lg flex items-center justify-center">
                        <Wrench className="w-4 h-4 text-[#FF6321]" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#141414]">{item.event}</p>
                        <p className="text-xs text-[#141414]/40">Performed by: <span className="font-medium text-[#141414]">{item.user}</span></p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-[#141414]/40">{item.date}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Financials & AI Insights */}
        <div className="space-y-8">
          {/* AI Predictive Insights */}
          <Card className="bg-[#141414] text-white border-none shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FF00]/10 blur-3xl rounded-full -mr-16 -mt-16" />
            <CardHeader className="border-b border-white/10 py-4">
              <CardTitle className="text-[10px] font-mono uppercase tracking-widest text-[#00FF00] flex items-center gap-2">
                <BrainCircuit className="w-4 h-4" />
                AI Predictive Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {isAiLoading ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin text-[#00FF00]" />
                  <p className="text-[10px] font-mono uppercase tracking-widest text-white/40">Analyzing asset telemetry...</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-widest text-white/40">Maintenance Risk</span>
                      <span className={cn(
                        "text-[10px] font-bold",
                        (aiInsights?.riskScore || 0) > 70 ? "text-[#FF6321]" : "text-[#00FF00]"
                      )}>
                        {aiInsights?.riskScore ? `${aiInsights.riskScore}%` : 'CALCULATING...'}
                      </span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${aiInsights?.riskScore || 0}%` }}
                        className={cn(
                          "h-full",
                          (aiInsights?.riskScore || 0) > 70 ? "bg-[#FF6321]" : "bg-[#00FF00]"
                        )}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-widest text-white/40">AI Recommendation</span>
                      <span className="text-[10px] font-bold text-[#00FF00]">ACTIVE</span>
                    </div>
                    <p className="text-xs leading-relaxed text-white/80 italic">
                      "{aiInsights?.recommendation || 'Gathering system data to provide optimization strategies...'}"
                    </p>
                  </div>
                  <Button className="w-full bg-[#00FF00] text-[#141414] hover:bg-[#00FF00]/90 text-[10px] font-bold uppercase tracking-widest h-9">
                    Execute AI Strategy
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Financial Tracking */}
          <Card className="border-[#141414]/10 shadow-none bg-white">
            <CardHeader className="border-b border-[#141414]/5 py-4">
              <CardTitle className="text-[10px] font-mono uppercase tracking-widest opacity-50 italic flex items-center gap-2">
                <DollarSign className="w-3 h-3" />
                Financial Lifecycle
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <p className="text-[10px] uppercase tracking-widest text-[#141414]/40">Purchase Price</p>
                  <p className="text-lg font-bold">${asset.cost.toLocaleString()}</p>
                </div>
                <div className="flex justify-between items-end">
                  <p className="text-[10px] uppercase tracking-widest text-[#141414]/40">Current Value</p>
                  <p className="text-lg font-bold text-[#00FF00]">${(asset.cost * 0.82).toLocaleString()}</p>
                </div>
                <div className="pt-4 border-t border-[#141414]/5">
                  <div className="flex justify-between text-[10px] font-mono mb-2">
                    <span>Depreciation Rate</span>
                    <span>18% / Year</span>
                  </div>
                  <div className="h-1.5 bg-[#141414]/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#141414]/20 w-[18%]" />
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full text-[10px] uppercase tracking-widest gap-2 h-9 border-[#141414]/10">
                <TrendingDown className="w-3 h-3" />
                Full Financial Report
              </Button>
            </CardContent>
          </Card>

          {/* QR Asset Tag */}
          <Card className="border-[#141414]/10 shadow-none bg-white">
            <CardContent className="p-6 flex flex-col items-center">
              <div className="w-32 h-32 bg-[#141414] rounded-xl p-3 flex items-center justify-center relative group">
                <QrCode className="w-full h-full text-white" />
                <div className="absolute inset-0 bg-[#00FF00]/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                  <Button size="sm" className="bg-[#141414] text-white text-[10px] uppercase tracking-widest">Print Tag</Button>
                </div>
              </div>
              <p className="text-[10px] font-mono text-[#141414]/40 mt-4 uppercase tracking-widest">Scan for Mobile Access</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon: Icon, label, value }: any) {
  return (
    <div className="p-5 bg-white border border-[#141414]/10 rounded-2xl hover:border-[#141414]/30 transition-all group">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-3.5 h-3.5 text-[#141414]/40 group-hover:text-[#141414] transition-colors" />
        <span className="text-[10px] font-mono uppercase tracking-widest opacity-50 italic">{label}</span>
      </div>
      <p className="text-sm font-bold truncate text-[#141414]">{value}</p>
    </div>
  );
}
