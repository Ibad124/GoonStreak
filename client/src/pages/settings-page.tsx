import { useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Paintbrush, Moon, Sun, Bell, Eye, Shield, Timer, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function SettingsPage() {
  const { preferences, updatePreferences } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(preferences.appearance === "dark");

  const handleThemeChange = (checked: boolean) => {
    setIsDarkMode(checked);
    updatePreferences({ appearance: checked ? "dark" : "light" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground dark">
      <header className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-lg z-50 border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold ml-4">Settings</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-24 pb-8 space-y-6">
        <Card className="bg-card text-card-foreground p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Paintbrush className="h-5 w-5" />
            Appearance
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark themes
                </p>
              </div>
              <Switch 
                checked={isDarkMode}
                onCheckedChange={handleThemeChange}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Style Preference</Label>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred visual style
                </p>
              </div>
              <Select
                value={preferences.goonStyle}
                onValueChange={(value: any) => updatePreferences({ goonStyle: value })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="competitive">Competitive</SelectItem>
                  <SelectItem value="hardcore">Hardcore</SelectItem>
                  <SelectItem value="solo">Solo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        <Card className="bg-card text-card-foreground p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Achievement Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when you earn achievements
                </p>
              </div>
              <Switch 
                checked={preferences.achievementAlerts}
                onCheckedChange={(checked) => updatePreferences({ achievementAlerts: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Friend Activity</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified about friend milestones
                </p>
              </div>
              <Switch 
                checked={preferences.friendActivityAlerts}
                onCheckedChange={(checked) => updatePreferences({ friendActivityAlerts: checked })}
              />
            </div>
          </div>
        </Card>

        <Card className="bg-card text-card-foreground p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Show on Leaderboard</Label>
                <p className="text-sm text-muted-foreground">
                  Allow others to see your progress
                </p>
              </div>
              <Switch 
                checked={preferences.showOnLeaderboard}
                onCheckedChange={(checked) => updatePreferences({ showOnLeaderboard: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Stealth Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Hide your online status
                </p>
              </div>
              <Switch 
                checked={preferences.stealthMode}
                onCheckedChange={(checked) => updatePreferences({ stealthMode: checked })}
              />
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}