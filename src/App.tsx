import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from 'next-themes';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import AssetList from './components/AssetList';
import EmployeeList from './components/EmployeeList';
import Reports from './components/Reports';
import SecurityCenter from './components/SecurityCenter';
import AuditLogs from './components/AuditLogs';
import SmartAssistant from './components/SmartAssistant';
import CommandPalette from './components/CommandPalette';
import NotificationCenter from './components/NotificationCenter';
import { Toaster } from './components/ui/sonner';
import AuthLogin from './components/AuthLogin';
import { Package, LayoutDashboard, Users, FileBarChart, ShieldCheck, History } from 'lucide-react';
import { Asset, AssetFilters, AuthUser, Employee, UserRole } from './types';
import { changePassword, createAsset, createEmployee, getAssets, getCurrentUser, getEmployees, login, logout, signup, updateProfile } from './services/api';
import { toast } from 'sonner';
import SettingsPage from './components/SettingsPage';
import FloatingUserActions from './components/FloatingUserActions';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [loginRole, setLoginRole] = useState<UserRole>('admin');
  const [assetFilters, setAssetFilters] = useState<AssetFilters>({
    search: '',
    category: '',
    status: '',
    holder: '',
  });
  const { resolvedTheme, theme, setTheme } = useTheme();
  const isDarkMode = (resolvedTheme ?? theme) === 'dark';

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCommandPaletteOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const fetchAssets = useCallback(async (authToken: string) => {
    const data = await getAssets(authToken);
    setAssets(data.assets);
  }, []);

  const fetchEmployees = useCallback(async (authToken: string) => {
    const data = await getEmployees(authToken);
    setEmployees(data.employees);
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      const savedToken = localStorage.getItem('assetflow-token');
      if (!savedToken) {
        setIsAuthLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser(savedToken);
        setToken(savedToken);
        setUser(currentUser.user);
        setTheme(currentUser.user.preferredTheme);
        await fetchAssets(savedToken);
        await fetchEmployees(savedToken);
      } catch {
        localStorage.removeItem('assetflow-token');
      } finally {
        setIsAuthLoading(false);
      }
    };

    void bootstrap();
  }, [fetchAssets, fetchEmployees, setTheme]);

  const navItems = useMemo(
    () =>
      user?.role === 'admin'
        ? [
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'assets', label: 'Assets', icon: Package },
            { id: 'employees', label: 'Employees', icon: Users },
            { id: 'reports', label: 'Reports', icon: FileBarChart },
            { id: 'security', label: 'Security', icon: ShieldCheck },
            { id: 'audit', label: 'Audit Logs', icon: History },
          ]
        : [
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'assets', label: 'Assets', icon: Package },
            { id: 'reports', label: 'Reports', icon: FileBarChart },
          ],
    [user?.role]
  );

  useEffect(() => {
    if (user?.role === 'employee' && ['employees', 'security', 'audit'].includes(activeTab)) {
      setActiveTab('dashboard');
    }
  }, [activeTab, user?.role]);

  const handleLogin = async (payload: { email: string; password: string; role: UserRole }) => {
    setIsLoginLoading(true);
    try {
      const response = await login(payload);
      localStorage.setItem('assetflow-token', response.token);
      setToken(response.token);
      setUser(response.user);
      setTheme(response.user.preferredTheme);
      setActiveTab('dashboard');
      await fetchAssets(response.token);
      await fetchEmployees(response.token);
      toast.success(`Welcome back, ${response.user.name}`);
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleSignup = async (payload: { name: string; email: string; password: string; role: UserRole }) => {
    setIsLoginLoading(true);
    try {
      const response = await signup(payload);
      localStorage.setItem('assetflow-token', response.token);
      setToken(response.token);
      setUser(response.user);
      setTheme(response.user.preferredTheme);
      setActiveTab('dashboard');
      await fetchAssets(response.token);
      await fetchEmployees(response.token);
      toast.success('Account created successfully.');
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    if (token) {
      try {
        await logout(token);
      } catch {
        // Ignore logout transport errors and clear local state anyway.
      }
    }
    localStorage.removeItem('assetflow-token');
    setToken(null);
    setUser(null);
    setAssets([]);
    setEmployees([]);
    setIsCommandPaletteOpen(false);
    toast.success('Logged out successfully');
  };

  const handleAddAsset = async (payload: {
    name: string;
    assetTag: string;
    category: string;
    status: Asset['status'];
    holder: string;
  }) => {
    if (!token) throw new Error('Missing auth token.');
    const response = await createAsset(token, payload);
    setAssets((previous) => [response.asset, ...previous]);
    toast.success('Asset added successfully.');
  };

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const search = assetFilters.search.trim().toLowerCase();
      const searchPass =
        !search ||
        asset.assetTag.toLowerCase().includes(search) ||
        asset.name.toLowerCase().includes(search) ||
        asset.serialNumber.toLowerCase().includes(search);
      const categoryPass = !assetFilters.category || asset.category === assetFilters.category;
      const statusPass = !assetFilters.status || asset.status === assetFilters.status;
      const holderPass =
        !assetFilters.holder ||
        (asset.currentHolderId ?? '').toLowerCase().includes(assetFilters.holder.toLowerCase());
      return searchPass && categoryPass && statusPass && holderPass;
    });
  }, [assetFilters, assets]);

  const handleOpenAssetDetails = (preset?: { status?: string }) => {
    setActiveTab('assets');
    if (preset?.status) {
      setAssetFilters((prev) => ({ ...prev, status: preset.status ?? '' }));
    }
  };

  const handleSaveProfile = async (payload: {
    name: string;
    email: string;
    preferredTheme: 'light' | 'dark';
    notificationsEnabled: boolean;
  }) => {
    if (!token) throw new Error('Missing auth token.');
    const response = await updateProfile(token, payload);
    setUser(response.user);
    setTheme(payload.preferredTheme);
    toast.success('Profile updated.');
  };

  const handleAddEmployee = async (payload: { name: string; email: string; role: string }) => {
    if (!token) throw new Error('Missing auth token.');
    const response = await createEmployee(token, payload);
    setEmployees((previous) => [response.employee, ...previous]);
    toast.success('Employee added successfully.');
  };

  const handleChangePassword = async (payload: { currentPassword: string; newPassword: string }) => {
    if (!token) throw new Error('Missing auth token.');
    await changePassword(token, payload);
    toast.success('Password updated.');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            assets={assets}
            role={user!.role}
            onNavigateAssets={handleOpenAssetDetails}
            onNavigateEmployees={() => setActiveTab('employees')}
          />
        );
      case 'assets':
        return (
          <AssetList
            assets={assets}
            filters={assetFilters}
            onFiltersChange={setAssetFilters}
            canAddAssets={user?.role === 'admin'}
            onAddAsset={handleAddAsset}
          />
        );
      case 'employees':
        return (
          <EmployeeList
            employees={employees}
            canAddEmployees={user?.role === 'admin'}
            onAddEmployee={handleAddEmployee}
          />
        );
      case 'reports':
        return <Reports filteredAssets={filteredAssets} />;
      case 'security':
        return <SecurityCenter />;
      case 'audit':
        return <AuditLogs />;
      case 'settings':
        return (
          <SettingsPage
            user={user!}
            theme={(resolvedTheme === 'dark' ? 'dark' : 'light')}
            onSaveProfile={handleSaveProfile}
            onChangePassword={handleChangePassword}
          />
        );
      default:
        return (
          <Dashboard
            assets={assets}
            role={user!.role}
            onNavigateAssets={handleOpenAssetDetails}
            onNavigateEmployees={() => setActiveTab('employees')}
          />
        );
    }
  };

  if (isAuthLoading) {
    return <div className="min-h-screen bg-background text-foreground flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return (
      <>
        <AuthLogin
          role={loginRole}
          onRoleChange={setLoginRole}
          onSubmit={handleLogin}
          onSignup={handleSignup}
          isLoading={isLoginLoading}
        />
        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <>
      <Layout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        navItems={navItems}
        isDarkMode={isDarkMode}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </Layout>
      <SmartAssistant />
      <FloatingUserActions
        user={user}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setTheme(isDarkMode ? 'light' : 'dark')}
        onLogout={() => void handleLogout()}
        onOpenSettings={() => setActiveTab('settings')}
      />
      <CommandPalette 
        open={isCommandPaletteOpen} 
        setOpen={setIsCommandPaletteOpen} 
        setActiveTab={setActiveTab} 
      />
      <NotificationCenter />
      <Toaster position="top-right" />
    </>
  );
}
