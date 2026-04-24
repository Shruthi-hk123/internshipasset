import React, { useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Filter, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Employee } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface EmployeeListProps {
  employees: Employee[];
  canAddEmployees: boolean;
  onAddEmployee: (payload: { name: string; email: string; role: string }) => Promise<void>;
}

export default function EmployeeList({ employees, canAddEmployees, onAddEmployee }: EmployeeListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [newEmployee, setNewEmployee] = useState({ name: '', email: '', role: '' });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-[#00FF00]/10 text-[#00FF00] border-[#00FF00]/20';
      case 'On Leave': return 'bg-[#FF6321]/10 text-[#FF6321] border-[#FF6321]/20';
      case 'Terminated': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const filteredEmployees = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return employees;
    return employees.filter((employee) =>
      employee.fullName.toLowerCase().includes(search) || employee.email.toLowerCase().includes(search)
    );
  }, [employees, searchTerm]);

  const handleAddEmployee = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    if (!newEmployee.name.trim() || !newEmployee.email.trim() || !newEmployee.role.trim()) {
      setFormError('Name, email and role are required.');
      return;
    }
    try {
      setIsSaving(true);
      await onAddEmployee({
        name: newEmployee.name.trim(),
        email: newEmployee.email.trim(),
        role: newEmployee.role.trim(),
      });
      setIsAddDialogOpen(false);
      setNewEmployee({ name: '', email: '', role: '' });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to add employee.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#141414]/40 dark:text-white/50" />
          <Input 
            placeholder="Search employees by name or email..." 
            className="pl-10 border-[#141414]/10 focus:ring-[#00FF00] focus:border-[#00FF00] dark:border-white/10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-[#141414]/10 gap-2 dark:border-white/10">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <Button variant="outline" className="border-[#141414]/10 gap-2 dark:border-white/10">
            <Search className="w-4 h-4" />
            Bulk Import
          </Button>
          {canAddEmployees ? (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger render={<Button className="bg-[#141414] text-white hover:bg-[#141414]/90 gap-2" />}>
                <Plus className="w-4 h-4" />
                Add Employee
              </DialogTrigger>
              <DialogContent className="max-w-lg border-[#141414]/10 dark:border-white/10">
                <DialogHeader>
                  <DialogTitle>Add Employee</DialogTitle>
                </DialogHeader>
                <form className="space-y-3" onSubmit={handleAddEmployee}>
                  <div className="space-y-1">
                    <Label htmlFor="employeeName">Name</Label>
                    <Input id="employeeName" value={newEmployee.name} onChange={(event) => setNewEmployee((prev) => ({ ...prev, name: event.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="employeeEmail">Email</Label>
                    <Input id="employeeEmail" value={newEmployee.email} onChange={(event) => setNewEmployee((prev) => ({ ...prev, email: event.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="employeeRole">Role</Label>
                    <Input id="employeeRole" value={newEmployee.role} onChange={(event) => setNewEmployee((prev) => ({ ...prev, role: event.target.value }))} />
                  </div>
                  {formError ? <p className="text-sm text-red-500">{formError}</p> : null}
                  <Button type="submit" className="w-full bg-[#141414] text-white hover:bg-[#141414]/90" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Employee'}
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
              <TableHead className="text-[10px] uppercase tracking-widest font-bold text-[#141414]/40 dark:text-white/50 py-4">Employee ID</TableHead>
              <TableHead className="text-[10px] uppercase tracking-widest font-bold text-[#141414]/40 dark:text-white/50 py-4">Name</TableHead>
              <TableHead className="text-[10px] uppercase tracking-widest font-bold text-[#141414]/40 dark:text-white/50 py-4">Role</TableHead>
              <TableHead className="text-[10px] uppercase tracking-widest font-bold text-[#141414]/40 dark:text-white/50 py-4">Status</TableHead>
              <TableHead className="text-[10px] uppercase tracking-widest font-bold text-[#141414]/40 py-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.map((employee) => (
              <TableRow key={employee.id} className="border-b border-[#141414]/5 hover:bg-[#141414]/[0.02] transition-colors dark:border-white/10 dark:hover:bg-white/5">
                <TableCell className="font-mono text-xs font-bold">{employee.employeeId}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#141414] text-white flex items-center justify-center text-xs font-bold dark:bg-gray-700">
                      {employee.fullName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{employee.fullName}</span>
                      <span className="text-[10px] text-[#141414]/40 dark:text-white/50 flex items-center gap-1">
                        <Mail className="w-2 h-2" /> {employee.email}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-medium">{employee.role}</span>
                </TableCell>
                <TableCell>
                  <Badge className={cn("font-medium text-[10px] uppercase tracking-wider border", getStatusColor(employee.status))}>
                    {employee.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="text-xs font-medium text-[#141414]/60 hover:text-[#141414] dark:text-white/70 dark:hover:text-white">
                    View Profile
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-sm text-muted-foreground">
                  No employees matched your search.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
