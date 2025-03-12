import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Protected route middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    next();
  };

  // Get user stats and achievements
  app.get("/api/stats", requireAuth, async (req, res) => {
    const achievements = await storage.getUserAchievements(req.user!.id);
    res.json({
      user: req.user,
      achievements
    });
  });

  // Log a new session
  app.post("/api/session", requireAuth, async (req, res) => {
    const user = req.user!;
    const today = new Date();
    const lastDate = user.lastSessionDate ? new Date(user.lastSessionDate) : null;
    
    let currentStreak = user.currentStreak;
    let todaySessions = user.todaySessions;

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
    }

    const updatedUser = await storage.updateUser(user.id, {
      lastSessionDate: today,
      currentStreak,
      longestStreak: Math.max(currentStreak, user.longestStreak),
      totalSessions: user.totalSessions + 1,
      todaySessions: todaySessions + 1,
    });

    // Check and award achievements
    if (currentStreak === 3) {
      await storage.addAchievement(
        user.id,
        "STREAK_3",
        "Achieved a 3-day streak!"
      );
    }

    if (updatedUser.totalSessions === 10) {
      await storage.addAchievement(
        user.id,
        "SESSIONS_10",
        "Logged 10 total sessions!"
      );
    }

    res.json(updatedUser);
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
