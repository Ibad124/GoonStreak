export type ThemeStyle = "default" | "solo" | "competitive" | "hardcore";

export interface ThemePreferences {
  goonStyle: ThemeStyle;
  timePreference: string;
  intensityLevel: string;
  socialMode: string;
}
