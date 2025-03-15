import { useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Paintbrush, Moon, Sun, Bell, Eye, Shield, Timer, Sparkles, Heart } from "lucide-react";

export default function SettingsPage() {
  const { preferences, updatePreferences } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(preferences.appearance === "dark");

  const handleThemeChange = (checked: boolean) => {
    setIsDarkMode(checked);
    updatePreferences({ appearance: checked ? "dark" : "light" });
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Settings</h1>
        <div className="text-sm text-muted-foreground">
          Customize your experience
        </div>
      </div>

      <div className="space-y-6">
        {/* Theme Settings */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Paintbrush className="h-5 w-5" />
            Appearance
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark themes
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4" />
                <Switch
                  checked={isDarkMode}
                  onCheckedChange={handleThemeChange}
                />
                <Moon className="h-4 w-4" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
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

        {/* Privacy Settings */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Show on Leaderboard</Label>
                <p className="text-sm text-muted-foreground">
                  Allow others to see your progress
                </p>
              </div>
              <Switch
                checked={preferences.showOnLeaderboard}
                onCheckedChange={(checked) =>
                  updatePreferences({ showOnLeaderboard: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Stealth Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Hide your online status from others
                </p>
              </div>
              <Switch
                checked={preferences.stealthMode}
                onCheckedChange={(checked) =>
                  updatePreferences({ stealthMode: checked })
                }
              />
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Achievement Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when you earn achievements
                </p>
              </div>
              <Switch
                checked={preferences.achievementAlerts}
                onCheckedChange={(checked) =>
                  updatePreferences({ achievementAlerts: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Friend Activity</Label>
                <p className="text-sm text-muted-foreground">
                  Notifications about friend milestones
                </p>
              </div>
              <Switch
                checked={preferences.friendActivityAlerts}
                onCheckedChange={(checked) =>
                  updatePreferences({ friendActivityAlerts: checked })
                }
              />
            </div>
          </div>
        </Card>

        {/* Session Settings */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Session Preferences
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Default Session Duration</Label>
                <p className="text-sm text-muted-foreground">
                  Set your preferred session length
                </p>
              </div>
              <Select
                value={preferences.defaultSessionDuration?.toString()}
                onValueChange={(value) =>
                  updatePreferences({ defaultSessionDuration: parseInt(value) })
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}