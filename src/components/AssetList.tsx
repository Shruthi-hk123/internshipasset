import React, { useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Filter, UserPlus, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Asset, AssetFilters } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AssetDetail from './AssetDetail';
import { ASSET_CATEGORIES, ASSET_STATUSES } from '@/constants';
import { Label } from '@/components/ui/label';

interface AssetListProps {
  assets: Asset[];
  filters: AssetFilters;
  onFiltersChange: (filters: AssetFilters) => void;
  canAddAssets: boolean;
  onAddAsset: (payload: { name: string; assetTag: string; category: string; status: Asset['status']; holder: string }) => Promise<void>;
}

export default function AssetList({ assets, filters, onFiltersChange, canAddAssets, onAddAsset }: AssetListProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [newAsset, setNewAsset] = useState({
    name: '',
    assetTag: '',
    category: ASSET_CATEGORIES[0],
    status: ASSET_STATUSES[0],
    holder: '',
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-[#00FF00]/10 text-[#00FF00] border-[#00FF00]/20';
      case 'Assigned': return 'bg-[#141414]/5 text-[#141414] border-[#141414]/10';
      case 'Maintenance': return 'bg-[#FF6321]/10 text-[#FF6321] border-[#FF6321]/20';
      case 'Broken': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const search = filters.search.trim().toLowerCase();
      const searchPass =
        !search ||
        asset.assetTag.toLowerCase().includes(search) ||
        asset.name.toLowerCase().includes(search) ||
        asset.serialNumber.toLowerCase().includes(search);
      const categoryPass = !filters.category || asset.category === filters.category;
      const statusPass = !filters.status || asset.status === filters.status;
      const holderPass = !filters.holder || (asset.currentHolderId ?? '').toLowerCase().includes(filters.holder.toLowerCase());
      return searchPass && categoryPass && statusPass && holderPass;
    });
  }, [assets, filters]);

  const handleAddAsset = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!newAsset.name.trim() || !newAsset.assetTag.trim() || !newAsset.category.trim() || !newAsset.status.trim()) {
      setFormError('Asset Name, Asset Tag, Category and Status are required.');
      return;
    }

    try {
      setIsSaving(true);
      await onAddAsset({
        name: newAsset.name.trim(),
        assetTag: newAsset.assetTag.trim(),
        category: newAsset.category.trim(),
        status: newAsset.status,
        holder: newAsset.holder.trim(),
      });
      setIsAddDialogOpen(false);
      setNewAsset({
        name: '',
        assetTag: '',
        category: ASSET_CATEGORIES[0],
        status: ASSET_STATUSES[0],
        holder: '',
      });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to add asset.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#141414]/40 dark:text-white/50" />
          <Input 
            placeholder="Search assets by tag, name, or serial..." 
            className="pl-10 border-[#141414]/10 focus:ring-[#00FF00] focus:border-[#00FF00] dark:border-white/10"
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-[#141414]/10 gap-2 pointer-events-none dark:border-white/10">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <select
            className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm"
            value={filters.category}
            onChange={(event) => onFiltersChange({ ...filters, category: event.target.value })}
          >
            <option value="">All Categories</option>
            {ASSET_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select
            className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm"
            value={filters.status}
            onChange={(event) => onFiltersChange({ ...filters, status: event.target.value })}
          >
            <option value="">All Status</option>
            {ASSET_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <Input
            placeholder="Holder"
            className="w-32"
            value={filters.holder}
            onChange={(event) => onFiltersChange({ ...filters, holder: event.target.value })}
          />
          {canAddAssets ? (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger render={<Button className="bg-[#141414] text-white hover:bg-[#141414]/90 gap-2" />}>
                <Plus className="w-4 h-4" />
                Add Asset
              </DialogTrigger>
              <DialogContent className="max-w-lg border-[#141414]/10">
                <DialogHeader>
                  <DialogTitle>Add New Asset</DialogTitle>
                </DialogHeader>
                <form className="space-y-3" onSubmit={handleAddAsset}>
                  <div className="space-y-1">
                    <Label htmlFor="assetName">Asset Name</Label>
                    <Input
                      id="assetName"
                      value={newAsset.name}
                      onChange={(event) => setNewAsset((prev) => ({ ...prev, name: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="assetTag">Asset Tag</Label>
                    <Input
                      id="assetTag"
                      value={newAsset.assetTag}
                      onChange={(event) => setNewAsset((prev) => ({ ...prev, assetTag: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="assetCategory">Category</Label>
                    <select
                      id="assetCategory"
                      className="w-full h-8 rounded-lg border border-input bg-background px-2.5 py-1 text-sm"
                      value={newAsset.category}
                      onChange={(event) => setNewAsset((prev) => ({ ...prev, category: event.target.value }))}
                    >
                      {ASSET_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="assetStatus">Status</Label>
                    <select
                      id="assetStatus"
                      className="w-full h-8 rounded-lg border border-input bg-background px-2.5 py-1 text-sm"
                      value={newAsset.status}
                      onChange={(event) => setNewAsset((prev) => ({ ...prev, status: event.target.value as Asset['status'] }))}
                    >
                      {ASSET_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="assetHolder">Holder</Label>
                    <Input
                      id="assetHolder"
                      placeholder="Optional holder id"
                      value={newAsset.holder}
                      onChange={(event) => setNewAsset((prev) => ({ ...prev, holder: event.target.value }))}
                    />
                  </div>
                  {formError ? <p className="text-sm text-red-500">{formError}</p> : null}
                  <Button type="submit" className="w-full bg-[#141414] text-white hover:bg-[#141414]/90" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Asset'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          ) : null}
        </div>
      </div>

      <div className="bg-white border border-[#141414]/10 rounded-xl overflow-hidden shadow-sm dark:bg-gray-900 dark:border-white/10">
        <Table>
          <TableHeader className="bg-[#141414]/5 dark:bg-white/5">
            <TableRow className="hover:bg-transparent border-b border-[#141414]/10 dark:border-white/10">
              <TableHead className="text-[10px] uppercase tracking-widest font-bold text-[#141414]/40 dark:text-white/50 py-4">Asset Tag</TableHead>
              <TableHead className="text-[10px] uppercase tracking-widest font-bold text-[#141414]/40 dark:text-white/50 py-4">Name</TableHead>
              <TableHead className="text-[10px] uppercase tracking-widest font-bold text-[#141414]/40 dark:text-white/50 py-4">Category</TableHead>
              <TableHead className="text-[10px] uppercase tracking-widest font-bold text-[#141414]/40 dark:text-white/50 py-4">Status</TableHead>
              <TableHead className="text-[10px] uppercase tracking-widest font-bold text-[#141414]/40 dark:text-white/50 py-4">Holder</TableHead>
              <TableHead className="text-[10px] uppercase tracking-widest font-bold text-[#141414]/40 dark:text-white/50 py-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAssets.map((asset) => (
              <TableRow key={asset.id} className="border-b border-[#141414]/5 hover:bg-[#141414]/[0.02] transition-colors dark:border-white/10 dark:hover:bg-white/5">
                <TableCell className="font-mono text-xs font-bold">{asset.assetTag}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{asset.name}</span>
                    <span className="text-[10px] text-[#141414]/40 dark:text-white/50">{asset.model}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-normal text-[10px] uppercase tracking-wider border-[#141414]/10 dark:border-white/20">
                    {asset.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={cn("font-medium text-[10px] uppercase tracking-wider border", getStatusColor(asset.status))}>
                    {asset.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {asset.currentHolderId ? (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#141414]/5 flex items-center justify-center text-[10px] font-bold">
                        {asset.currentHolderId.slice(-2)}
                      </div>
                      <span className="text-xs font-medium">{asset.currentHolderId}</span>
                    </div>
                  ) : (
                    <Button variant="ghost" size="sm" className="text-[10px] uppercase tracking-widest text-[#141414]/40 dark:text-white/50 hover:text-[#00FF00] gap-1">
                      <UserPlus className="w-3 h-3" />
                      Assign
                    </Button>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Dialog>
                    <DialogTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 text-[#141414]/40 dark:text-white/50 hover:text-[#141414] dark:hover:text-white" />}>
                      <Eye className="w-4 h-4" />
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl border-[#141414]/10">
                      <DialogHeader>
                        <DialogTitle className="text-sm font-mono uppercase tracking-widest opacity-50 italic">Asset Intelligence File</DialogTitle>
                      </DialogHeader>
                      <AssetDetail asset={asset} />
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
