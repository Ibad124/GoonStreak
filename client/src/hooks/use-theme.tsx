import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ThemeStyle, ThemePreferences } from "@/types/theme";

const DEFAULT_PREFERENCES: ThemePreferences = {
  goonStyle: "default",
  timePreference: "",
  intensityLevel: "",
  socialMode: "",
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
  useQuery({
    queryKey: ["/api/user/preferences"],
    retry: 3,
    onSuccess: (data: ThemePreferences | undefined) => {
      if (data) {
        setPreferences(prev => ({ ...prev, ...data }));
      }
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
      try {
        // Combine existing preferences with new ones
        const updatedPrefs = {
          ...preferences,
          ...newPrefs,
        };

        const res = await apiRequest("POST", "/api/user/preferences", updatedPrefs);
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message || "Failed to save preferences");
        }
        const data = await res.json();
        return data as ThemePreferences;
      } catch (error) {
        console.error("Failed to update preferences:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/user/preferences"], data);
      setPreferences(data);
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