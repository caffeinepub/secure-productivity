import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

export default function UiPreferencesPanel() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          UI Preferences
        </CardTitle>
        <CardDescription>Customize your application appearance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <Label htmlFor="dark-mode" className="cursor-pointer">
            Dark Mode
          </Label>
          <Switch
            id="dark-mode"
            checked={isDark}
            onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
          />
        </div>
      </CardContent>
    </Card>
  );
}
