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

  // Fetch user preferences
  const { data: preferencesData } = useQuery({
    queryKey: ["/api/user/preferences"],
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 60, // Keep in cache for 1 hour
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (newPrefs: Partial<ThemePreferences>) => {
      const res = await apiRequest("POST", "/api/user/preferences", newPrefs);
      if (!res.ok) {
        throw new Error("Failed to update preferences");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/user/preferences"], data);
      setPreferences(prev => ({ ...prev, ...data }));
      toast({
        title: "Preferences Updated",
        description: "Your theme preferences have been saved.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Saving Preferences",
        description: error.message,
        variant: "destructive",
      });
      throw error; // Re-throw to be caught by the caller
    },
  });

  // Update local state when data changes
  useEffect(() => {
    if (preferencesData) {
      setPreferences(prev => ({ ...prev, ...preferencesData }));
    }
  }, [preferencesData]);

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