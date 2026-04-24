import { useState } from 'react';
import { AuthUser } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface SettingsPageProps {
  user: AuthUser;
  theme: 'light' | 'dark';
  onSaveProfile: (payload: {
    name: string;
    email: string;
    preferredTheme: 'light' | 'dark';
    notificationsEnabled: boolean;
  }) => Promise<void>;
  onChangePassword: (payload: { currentPassword: string; newPassword: string }) => Promise<void>;
}

export default function SettingsPage({ user, theme, onSaveProfile, onChangePassword }: SettingsPageProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [preferredTheme, setPreferredTheme] = useState<'light' | 'dark'>(theme);
  const [notificationsEnabled, setNotificationsEnabled] = useState(user.notificationsEnabled);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label>Name</Label>
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Email</Label>
            <Input value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Theme Preference</Label>
            <select
              className="w-full h-8 rounded-lg border border-input bg-background px-2.5 py-1 text-sm"
              value={preferredTheme}
              onChange={(event) => setPreferredTheme(event.target.value as 'light' | 'dark')}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <label className="text-sm flex items-center gap-2">
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(event) => setNotificationsEnabled(event.target.checked)}
            />
            Enable notifications
          </label>
          <Button
            onClick={() =>
              void onSaveProfile({
                name,
                email,
                preferredTheme,
                notificationsEnabled,
              })
            }
          >
            Save Profile
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label>Current Password</Label>
            <Input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>New Password</Label>
            <Input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
          </div>
          <Button
            onClick={() =>
              void onChangePassword({
                currentPassword,
                newPassword,
              })
            }
          >
            Update Password
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
