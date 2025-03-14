import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

type ThemeStyle = "default" | "solo" | "competitive" | "hardcore";

interface ThemePreferences {
  goonStyle: ThemeStyle;
  timePreference: string;
  intensityLevel: string;
  socialMode: string;
}

interface ThemeContextType {
  preferences: ThemePreferences;
  updatePreferences: (prefs: Partial<ThemePreferences>) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<ThemePreferences>({
    goonStyle: "default",
    timePreference: "",
    intensityLevel: "",
    socialMode: "",
  });

  // Use React Query to manage preferences data
  const { data } = useQuery({
    queryKey: ["/api/user/preferences"],
    onSuccess: (data) => {
      if (data) {
        setPreferences(prev => ({ ...prev, ...data }));
      }
    },
  });

  const updatePreferences = (prefs: Partial<ThemePreferences>) => {
    setPreferences(prev => ({ ...prev, ...prefs }));
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