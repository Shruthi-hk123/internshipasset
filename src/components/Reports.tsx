import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Download, FileText, TrendingDown, DollarSign, PieChart as PieIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Asset } from '@/types';
import jsPDF from 'jspdf';

const deptCostData = [
  { name: 'Engineering', cost: 125000 },
  { name: 'HR', cost: 15000 },
  { name: 'Marketing', cost: 45000 },
  { name: 'Sales', cost: 32000 },
  { name: 'Finance', cost: 28000 },
  { name: 'Operations', cost: 85000 },
];

const depreciationData = [
  { month: 'Jan', value: 500000 },
  { month: 'Feb', value: 485000 },
  { month: 'Mar', value: 470000 },
  { month: 'Apr', value: 455000 },
  { month: 'May', value: 440000 },
  { month: 'Jun', value: 425000 },
];

interface ReportsProps {
  filteredAssets: Asset[];
}

export default function Reports({ filteredAssets }: ReportsProps) {
  const handleExportCsv = () => {
    const rows = filteredAssets.map((asset) =>
      [asset.assetTag, asset.name, asset.category, asset.status, asset.currentHolderId ?? '', asset.purchaseDate].join(',')
    );
    const csv = ['Asset Tag,Name,Category,Status,Holder,Purchase Date', ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'asset-report.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleGeneratePdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text('Asset Report', 14, 16);
    doc.setFontSize(10);
    doc.text(`Total filtered assets: ${filteredAssets.length}`, 14, 24);

    let y = 34;
    filteredAssets.slice(0, 30).forEach((asset, index) => {
      doc.text(
        `${index + 1}. ${asset.assetTag} | ${asset.name} | ${asset.category} | ${asset.status} | ${asset.currentHolderId ?? 'Unassigned'}`,
        14,
        y
      );
      y += 6;
    });
    doc.save('asset-report.pdf');
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Financial & Operational Reports</h3>
          <p className="text-sm text-[#141414]/40">Comprehensive analytics for asset lifecycle and budgeting.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 border-[#141414]/10" onClick={handleExportCsv}>
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button className="bg-[#141414] text-white gap-2" onClick={handleGeneratePdf}>
            <FileText className="w-4 h-4" />
            Generate PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Departmental Costs */}
        <Card className="lg:col-span-2 border-[#141414]/10 shadow-none bg-white">
          <CardHeader className="border-b border-[#141414]/5">
            <CardTitle className="text-sm font-mono uppercase tracking-widest opacity-50 italic flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Departmental Asset Value
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptCostData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#14141410" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#14141460' }} width={100} />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Total Value']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #14141410' }}
                  />
                  <Bar dataKey="cost" fill="#00FF00" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-6">
          <ReportStatCard 
            title="Total Asset Value" 
            value="$542,300" 
            icon={DollarSign}
            trend="-2.4% depreciation"
          />
          <ReportStatCard 
            title="Avg. Asset Age" 
            value="1.8 Years" 
            icon={TrendingDown}
            trend="Replacement due in 1.2y"
          />
          <ReportStatCard 
            title="Maintenance ROI" 
            value="94.2%" 
            icon={PieIcon}
            trend="+5% vs last year"
          />
        </div>
      </div>

      {/* Depreciation Forecast */}
      <Card className="border-[#141414]/10 shadow-none bg-white">
        <CardHeader className="border-b border-[#141414]/5">
          <CardTitle className="text-sm font-mono uppercase tracking-widest opacity-50 italic flex items-center gap-2">
            <TrendingDown className="w-4 h-4" />
            6-Month Depreciation Forecast (Straight-Line)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={depreciationData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#14141410" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#14141460' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#14141460' }} />
                <Tooltip 
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Net Book Value']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #14141410' }}
                />
                <Line type="monotone" dataKey="value" stroke="#141414" strokeWidth={2} dot={{ r: 4, fill: '#141414' }} activeDot={{ r: 6, fill: '#00FF00' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ReportStatCard({ title, value, icon: Icon, trend }: any) {
  return (
    <Card className="border-[#141414]/10 shadow-none bg-white group hover:border-[#141414]/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-md cursor-default">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#141414]/5 text-[#141414]">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest opacity-50 italic">{title}</p>
            <h4 className="text-xl font-bold">{value}</h4>
            <p className="text-[10px] font-medium text-[#141414]/40 mt-1">{trend}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
