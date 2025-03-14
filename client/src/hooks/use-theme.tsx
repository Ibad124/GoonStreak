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

  // Fetch preferences query with better error handling
  const { data: preferencesData } = useQuery<ThemePreferences>({
    queryKey: ["/api/user/preferences"],
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 60, // Keep in cache for 1 hour
    retry: 3,
    onError: () => {
      toast({
        title: "Error Loading Preferences",
        description: "Your preferences could not be loaded. Using default settings.",
        variant: "destructive",
      });
    }
  });

  // Update preferences mutation with improved error handling
  const updatePreferencesMutation = useMutation({
    mutationFn: async (newPrefs: Partial<ThemePreferences>) => {
      const res = await apiRequest("POST", "/api/user/preferences", newPrefs);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to save preferences");
      }
      return data as ThemePreferences;
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
    },
  });

  // Update local state when data changes with validation
  useEffect(() => {
    if (preferencesData) {
      // Validate the data structure before updating state
      const isValid = preferencesData.goonStyle && 
                     typeof preferencesData.timePreference === 'string' && 
                     typeof preferencesData.intensityLevel === 'string' && 
                     typeof preferencesData.socialMode === 'string';

      if (isValid) {
        setPreferences(prev => ({ ...prev, ...preferencesData }));
      } else {
        console.warn("Received invalid preferences data:", preferencesData);
        toast({
          title: "Warning",
          description: "Some preferences were invalid. Using default settings.",
          variant: "destructive",
        });
      }
    }
  }, [preferencesData, toast]);

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