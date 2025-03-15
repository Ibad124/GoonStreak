import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { LEVEL_THRESHOLDS } from "@shared/schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateLevel(xpPoints: number) {
  let currentLevel = 1;
  let currentThreshold = LEVEL_THRESHOLDS[1];

  // Find the current level based on XP points
  for (const [level, threshold] of Object.entries(LEVEL_THRESHOLDS)) {
    if (xpPoints >= threshold.points) {
      currentLevel = parseInt(level);
      currentThreshold = threshold;
    } else {
      break;
    }
  }

  const nextLevel = currentLevel + 1;
  const nextThreshold = LEVEL_THRESHOLDS[nextLevel as keyof typeof LEVEL_THRESHOLDS];

  return {
    currentLevel,
    currentTitle: currentThreshold.title,
    currentEmoji: currentThreshold.emoji,
    currentXP: currentThreshold.points,
    nextLevelXP: nextThreshold ? nextThreshold.points : currentThreshold.points,
    progress: xpPoints - currentThreshold.points,
    total: nextThreshold ? nextThreshold.points - currentThreshold.points : 0,
  };
}

// Get the tier name based on level
export function getLevelTier(level: number): string {
  if (level <= 5) return "Newbie";
  if (level <= 10) return "Amateur";
  if (level <= 15) return "Intermediate";
  if (level <= 20) return "Advanced";
  if (level <= 25) return "Elite";
  return "Legendary";
}

// Get the tier color scheme based on level
export function getLevelTierColors(level: number): {
  background: string;
  text: string;
  accent: string;
} {
  if (level <= 5) return {
    background: "from-blue-500/10 to-blue-600/10",
    text: "text-blue-500",
    accent: "bg-blue-500"
  };
  if (level <= 10) return {
    background: "from-indigo-500/10 to-indigo-600/10",
    text: "text-indigo-500",
    accent: "bg-indigo-500"
  };
  if (level <= 15) return {
    background: "from-purple-500/10 to-purple-600/10",
    text: "text-purple-500",
    accent: "bg-purple-500"
  };
  if (level <= 20) return {
    background: "from-pink-500/10 to-pink-600/10",
    text: "text-pink-500",
    accent: "bg-pink-500"
  };
  if (level <= 25) return {
    background: "from-amber-500/10 to-amber-600/10",
    text: "text-amber-500",
    accent: "bg-amber-500"
  };
  return {
    background: "from-emerald-500/10 to-emerald-600/10",
    text: "text-emerald-500",
    accent: "bg-emerald-500"
  };
}