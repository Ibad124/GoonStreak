import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { XP_REWARDS } from "@shared/schema";

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

    let currentStreak = user.currentStreak;
    let todaySessions = user.todaySessions;
    let xpToAward = XP_REWARDS.SESSION_COMPLETE;

    // Reset today's sessions if it's a new day
    if (!lastDate || lastDate.getDate() !== today.getDate()) {
      todaySessions = 0;
    }

    // Check if streak should continue or reset
    if (!lastDate || 
        (today.getTime() - lastDate.getTime()) > 24 * 60 * 60 * 1000) {
      currentStreak = 1;
    } else if (lastDate.getDate() !== today.getDate()) {
      currentStreak += 1;

      // Award bonus XP for streak milestones
      if (currentStreak % 7 === 0) {
        xpToAward += XP_REWARDS.STREAK_MILESTONE;
        await storage.addAchievement(
          user.id,
          "STREAK_MILESTONE",
          `Maintained a ${currentStreak}-day streak!`,
          XP_REWARDS.STREAK_MILESTONE
        );
      }
    }

    // Update user stats
    const updatedUser = await storage.updateUser(user.id, {
      lastSessionDate: today.toISOString(),
      currentStreak,
      longestStreak: Math.max(currentStreak, user.longestStreak),
      totalSessions: user.totalSessions + 1,
      todaySessions: todaySessions + 1,
    });

    // Award XP for the session
    const { leveledUp, nextLevelXP, currentLevelXP } = await storage.updateUserXP(user.id, xpToAward);

    // Check for session-based achievements
    const newAchievements = [];
    if (currentStreak === 3) {
      const achievement = await storage.addAchievement(
        user.id,
        "STREAK_3",
        "Achieved a 3-day streak!"
      );
      newAchievements.push(achievement);
    }

    if (updatedUser.totalSessions === 10) {
      const achievement = await storage.addAchievement(
        user.id,
        "SESSIONS_10",
        "Logged 10 total sessions!"
      );
      newAchievements.push(achievement);
    }

    res.json({
      user: updatedUser,
      leveledUp,
      nextLevelXP,
      currentLevelXP,
      newAchievements,
      xpAwarded: xpToAward
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