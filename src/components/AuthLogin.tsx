import { FormEvent, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { UserRole } from '@/types';
import { Package } from 'lucide-react';

interface AuthLoginProps {
  role: UserRole;
  onRoleChange: (role: UserRole) => void;
  onSubmit: (payload: { email: string; password: string; role: UserRole }) => Promise<void>;
  onSignup: (payload: { name: string; email: string; password: string; role: UserRole }) => Promise<void>;
  isLoading: boolean;
}

export default function AuthLogin({ role, onRoleChange, onSubmit, onSignup, isLoading }: AuthLoginProps) {
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const title = useMemo(() => {
    const roleLabel = role === 'admin' ? 'Admin' : 'Employee';
    return isSignupMode ? `${roleLabel} Signup` : `${roleLabel} Login`;
  }, [isSignupMode, role]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Email is required.');
      return;
    }
    if (!password.trim()) {
      setError('Password is required.');
      return;
    }

    try {
      if (isSignupMode) {
        if (!name.trim()) {
          setError('Name is required.');
          return;
        }
        if (password.length < 8) {
          setError('Password must be at least 8 characters.');
          return;
        }
        await onSignup({ name: name.trim(), email: email.trim(), password, role });
      } else {
        await onSubmit({ email: email.trim(), password, role });
      }
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Failed to login.';
      setError(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border border-[#141414]/10 p-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-[#00FF00]" />
            AssetFlow
          </h1>
          <p className="text-xs text-muted-foreground mt-1">{title}</p>
        </div>

        <div className="mb-4 flex gap-2">
          <Button
            type="button"
            variant={role === 'admin' ? 'default' : 'outline'}
            className={role === 'admin' ? 'bg-[#141414] text-white hover:bg-[#141414]/90' : ''}
            onClick={() => onRoleChange('admin')}
          >
            Admin
          </Button>
          <Button type="button" variant={role === 'employee' ? 'default' : 'outline'} onClick={() => onRoleChange('employee')}>
            Employee
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignupMode ? (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(event) => setName(event.target.value)} />
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          <p className="text-[11px] text-muted-foreground">
            Demo admin: `admin@assetflow.local` / `admin123` | employee: `employee@assetflow.local` / `employee123`
          </p>
          <Button type="submit" disabled={isLoading} className="w-full bg-[#141414] text-white hover:bg-[#141414]/90">
            {isLoading ? 'Please wait...' : isSignupMode ? 'Create account' : 'Sign in'}
          </Button>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setIsSignupMode((prev) => !prev);
            }}
            className="w-full text-xs text-muted-foreground hover:text-foreground"
          >
            {isSignupMode ? 'Already have an account? Sign in' : 'Need an account? Create one'}
          </button>
        </form>
      </Card>
    </div>
  );
}
