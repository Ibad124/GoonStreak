import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { XP_REWARDS, STREAK_CONFIG } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Protected route middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    next();
  };

  // Get user stats and achievements
  app.get("/api/stats", requireAuth, async (req, res) => {
    const user = req.user!;
    const achievements = await storage.getUserAchievements(user.id);
    const { nextLevelXP, currentLevelXP } = storage.calculateLevel(user.xpPoints);

    res.json({
      user,
      achievements,
      nextLevelXP,
      currentLevelXP
    });
  });

  // Log a new session
  app.post("/api/session", requireAuth, async (req, res) => {
    const user = req.user!;
    const today = new Date();
    const lastDate = user.lastSessionDate ? new Date(user.lastSessionDate) : null;
    const lastReset = user.lastStreakReset ? new Date(user.lastStreakReset) : null;

    let currentStreak = user.currentStreak;
    let todaySessions = user.todaySessions;
    let streakMultiplier = user.streakMultiplier || 1;
    let xpToAward = XP_REWARDS.SESSION_COMPLETE;

    // Reset today's sessions if it's a new day
    if (!lastDate || lastDate.getDate() !== today.getDate()) {
      todaySessions = 0;
    }

    // Check if streak should continue, use grace period, or reset
    const hoursSinceLastSession = lastDate 
      ? (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60)
      : 0;

    if (!lastDate || hoursSinceLastSession > STREAK_CONFIG.GRACE_PERIOD_HOURS) {
      // Reset streak if beyond grace period
      currentStreak = 1;
      streakMultiplier = 1;

      // Store reset date for potential recovery
      await storage.updateUser(user.id, {
        lastStreakReset: today.toISOString()
      });
    } else if (lastDate.getDate() !== today.getDate()) {
      // Increment streak for new day within grace period
      currentStreak += 1;

      // Check for streak multiplier milestones
      Object.entries(STREAK_CONFIG.MULTIPLIER_MILESTONES).forEach(([days, multiplier]) => {
        if (currentStreak === parseInt(days)) {
          streakMultiplier = multiplier;
          storage.addAchievement(
            user.id,
            "STREAK_MILESTONE",
            `${STREAK_CONFIG.MILESTONE_ACHIEVEMENTS[days]} - ${days} day streak!`,
            XP_REWARDS.STREAK_MILESTONE
          );
        }
      });

      // Apply streak multiplier to XP
      xpToAward = Math.round(xpToAward * streakMultiplier);
    }

    // Update user stats
    const updatedUser = await storage.updateUser(user.id, {
      lastSessionDate: today.toISOString(),
      currentStreak,
      streakMultiplier,
      longestStreak: Math.max(currentStreak, user.longestStreak),
      totalSessions: user.totalSessions + 1,
      todaySessions: todaySessions + 1,
    });

    // Award XP for the session
    const { leveledUp, nextLevelXP, currentLevelXP } = await storage.updateUserXP(user.id, xpToAward);

    // Check for session-based achievements
    const newAchievements = [];

    // First milestone achievements
    if (currentStreak === 3) {
      const achievement = await storage.addAchievement(
        user.id,
        "STREAK_3",
        "Bronze Warrior - Achieved your first 3-day streak!",
        XP_REWARDS.ACHIEVEMENT_EARNED
      );
      newAchievements.push(achievement);
    }

    // Session milestones
    if (updatedUser.totalSessions === 10) {
      const achievement = await storage.addAchievement(
        user.id,
        "SESSIONS_10",
        "Dedicated Practitioner - Completed 10 sessions!",
        XP_REWARDS.ACHIEVEMENT_EARNED
      );
      newAchievements.push(achievement);
    }

    res.json({
      user: updatedUser,
      leveledUp,
      nextLevelXP,
      currentLevelXP,
      newAchievements,
      xpAwarded: xpToAward,
      multiplierApplied: streakMultiplier > 1 ? streakMultiplier : undefined
    });
  });

  // Get leaderboard
  app.get("/api/leaderboard", requireAuth, async (_req, res) => {
    const leaderboard = await storage.getLeaderboard();
    res.json(leaderboard);
  });

  // Update user privacy settings
  app.patch("/api/privacy", requireAuth, async (req, res) => {
    const { isAnonymous, showOnLeaderboard } = req.body;
    const updatedUser = await storage.updateUser(req.user!.id, {
      isAnonymous,
      showOnLeaderboard,
    });
    res.json(updatedUser);
  });

  const httpServer = createServer(app);
  return httpServer;
}