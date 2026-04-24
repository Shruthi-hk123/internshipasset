import { AuthUser } from '@/types';
import { Button } from '@/components/ui/button';
import { LogOut, Moon, Settings, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingUserActionsProps {
  user: AuthUser;
  isDarkMode: boolean;
  onLogout: () => void;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
}

export default function FloatingUserActions({
  isDarkMode,
  onLogout,
  onToggleTheme,
  onOpenSettings,
}: FloatingUserActionsProps) {
  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
      <Button variant="outline" onClick={onOpenSettings} className={cn('bg-background/90 backdrop-blur gap-2', isDarkMode ? 'border-white/20' : '')}>
        <Settings className="w-4 h-4" />
        Settings
      </Button>
      <Button className="bg-[#141414] text-white hover:bg-[#141414]/90" onClick={onLogout}>
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>
      <Button variant="outline" onClick={onToggleTheme} className="bg-background/90 backdrop-blur">
        {isDarkMode ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
      </Button>
    </div>
  );
}
