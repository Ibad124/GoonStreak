import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

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

  useEffect(() => {
    // Load preferences from API on mount
    fetch("/api/user/preferences")
      .then(res => res.json())
      .then(data => {
        setPreferences(data);
      })
      .catch(console.error);
  }, []);

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
