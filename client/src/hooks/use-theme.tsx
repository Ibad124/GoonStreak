import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export type ThemeStyle = "default" | "solo" | "competitive" | "hardcore";

export interface ThemePreferences {
  goonStyle: ThemeStyle;
  timePreference: string;
  intensityLevel: string;
  socialMode: string;
}

interface ThemeContextType {
  preferences: ThemePreferences;
  updatePreferences: (prefs: Partial<ThemePreferences>) => Promise<void>;
}

const DEFAULT_PREFERENCES: ThemePreferences = {
  goonStyle: "default",
  timePreference: "",
  intensityLevel: "",
  socialMode: "",
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<ThemePreferences>(DEFAULT_PREFERENCES);

  const { data: preferencesData } = useQuery<ThemePreferences>({
    queryKey: ["/api/user/preferences"],
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 60, // Keep in cache for 1 hour
    retry: 3,
    onSuccess: (data) => {
      if (data) {
        setPreferences(prev => ({ ...prev, ...data }));
      }
    },
    onError: () => {
      toast({
        title: "Error Loading Preferences",
        description: "Your preferences could not be loaded. Using default settings.",
        variant: "destructive",
      });
    }
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (newPrefs: Partial<ThemePreferences>) => {
      try {
        const res = await apiRequest("POST", "/api/user/preferences", newPrefs);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to save preferences");
        }

        // Ensure we have all required fields with proper types
        const updatedPrefs: ThemePreferences = {
          ...preferences,
          ...data,
          goonStyle: data.goonStyle || preferences.goonStyle,
          timePreference: data.timePreference || preferences.timePreference,
          intensityLevel: data.intensityLevel || preferences.intensityLevel,
          socialMode: data.socialMode || preferences.socialMode,
        };

        return updatedPrefs;
      } catch (error) {
        console.error("Preference update error:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/user/preferences"], data);
      setPreferences(data);
      toast({
        title: "Preferences Updated",
        description: "Your theme preferences have been saved.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      console.error("Failed to update preferences:", error);
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