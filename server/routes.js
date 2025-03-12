import { createServer } from "http";
import { setupAuth } from "./auth.js";
import { storage } from "./storage.js";
import { XP_REWARDS } from "../shared/schema.js";

export async function registerRoutes(app) {
  setupAuth(app);

  // Protected route middleware
  const requireAuth = (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    next();
  };

  // Get user stats and achievements
  app.get("/api/stats", requireAuth, async (req, res) => {
    const achievements = await storage.getUserAchievements(req.user.id);
    res.json({
      user: req.user,
      achievements
    });
  });

  // Log a new session
  app.post("/api/session", requireAuth, async (req, res) => {
    const user = req.user;
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
      // Award XP for streak milestones
      if (currentStreak % 3 === 0) {
        xpToAward += XP_REWARDS.STREAK_MILESTONE;
      }
    }

    const updatedUser = await storage.updateUser(user.id, {
      lastSessionDate: today,
      currentStreak,
      longestStreak: Math.max(currentStreak, user.longestStreak),
      totalSessions: user.totalSessions + 1,
      todaySessions: todaySessions + 1,
    });

    // Award XP and check for level up
    const xpResult = await storage.updateUserXP(user.id, xpToAward);

    // Check and award achievements
    const newAchievements = [];

    if (currentStreak === 3) {
      const achievement = await storage.addAchievement(
        user.id,
        "STREAK_3",
        "Achieved a 3-day streak!"
      );
      newAchievements.push(achievement);
      await storage.updateUserXP(user.id, XP_REWARDS.ACHIEVEMENT_EARNED);
    }

    if (updatedUser.totalSessions === 10) {
      const achievement = await storage.addAchievement(
        user.id,
        "SESSIONS_10",
        "Logged 10 total sessions!"
      );
      newAchievements.push(achievement);
      await storage.updateUserXP(user.id, XP_REWARDS.ACHIEVEMENT_EARNED);
    }

    res.json({
      user: xpResult.user,
      leveledUp: xpResult.leveledUp,
      nextLevelXP: xpResult.nextLevelXP,
      newAchievements,
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
    const updatedUser = await storage.updateUser(req.user.id, {
      isAnonymous,
      showOnLeaderboard,
    });
    res.json(updatedUser);
  });

  const httpServer = createServer(app);
  return httpServer;
}