import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export type ThemeStyle = "default" | "competitive" | "hardcore" | "solo";
export type ThemeAppearance = "light" | "dark" | "system";

export interface ThemePreferences {
  goonStyle: ThemeStyle;
  appearance: ThemeAppearance;
  showOnLeaderboard: boolean;
  stealthMode: boolean;
  achievementAlerts: boolean;
  friendActivityAlerts: boolean;
  defaultSessionDuration: number;
}

const DEFAULT_PREFERENCES: ThemePreferences = {
  goonStyle: "default",
  appearance: "dark", // Set dark as default
  showOnLeaderboard: true,
  stealthMode: false,
  achievementAlerts: true,
  friendActivityAlerts: true,
  defaultSessionDuration: 30,
};

interface ThemeContextType {
  preferences: ThemePreferences;
  updatePreferences: (prefs: Partial<ThemePreferences>) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<ThemePreferences>(DEFAULT_PREFERENCES);

  // Fetch initial preferences
  useQuery<ThemePreferences>({
    queryKey: ["/api/user/preferences"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/user/preferences");
      if (!res.ok) throw new Error("Failed to load preferences");
      return res.json();
    },
    onSuccess: (data) => {
      setPreferences(prev => ({ ...prev, ...data }));
      // Apply dark mode class
      document.documentElement.classList.toggle("dark", data.appearance === "dark");
    },
    onError: () => {
      toast({
        title: "Error Loading Preferences",
        description: "Using default settings.",
        variant: "destructive",
      });
    }
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (newPrefs: Partial<ThemePreferences>) => {
      const updatedPrefs = { ...preferences, ...newPrefs };
      const res = await apiRequest("POST", "/api/user/preferences", updatedPrefs);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to save preferences");
      }
      return res.json() as Promise<ThemePreferences>;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/user/preferences"], data);
      setPreferences(data);
      // Update dark mode when appearance changes
      document.documentElement.classList.toggle("dark", data.appearance === "dark");
      toast({
        title: "Preferences Updated",
        description: "Your settings have been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Saving Preferences",
        description: error.message || "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updatePreferences = async (prefs: Partial<ThemePreferences>) => {
    await updatePreferencesMutation.mutateAsync(prefs);
  };

  return (
    <ThemeContext.Provider value={{ preferences, updatePreferences }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}