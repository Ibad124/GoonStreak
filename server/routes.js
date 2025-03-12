import { createServer } from "http";
import { setupAuth } from "./auth.js";
import { storage } from "./storage.js";
import { XP_REWARDS, CHALLENGE_TYPES } from "../shared/schema.js";

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
    const { nextLevelXP, currentLevelXP } = storage.calculateLevel(req.user.xpPoints);
    const activeChallenges = await storage.getAllActiveChallenges();

    console.log('Active challenges:', activeChallenges);

    // Get progress for each active challenge
    const challengesWithProgress = await Promise.all(
      activeChallenges.map(async (challenge) => {
        const progress = await storage.getUserChallengeProgress(req.user.id, challenge.id);
        console.log(`Challenge ${challenge.id} progress:`, progress);
        return {
          ...challenge,
          progress: progress || {
            currentProgress: 0,
            completed: false,
          },
        };
      })
    );

    console.log('Challenges with progress:', challengesWithProgress);

    res.json({
      user: req.user,
      achievements,
      nextLevelXP,
      currentLevelXP,
      challenges: challengesWithProgress,
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
      xpToAward += 10;
    } else if (lastDate.getDate() !== today.getDate()) {
      currentStreak += 1;
      if (currentStreak % 3 === 0) {
        xpToAward += XP_REWARDS.STREAK_MILESTONE;
      }
    }

    // Award bonus XP for multiple sessions in a day
    if (todaySessions < 5) {
      xpToAward += todaySessions * 5;
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

    // Check and update challenges
    const completedChallenges = await storage.checkAndUpdateChallenges(user.id);

    // Award XP for completed challenges
    for (const completion of completedChallenges) {
      await storage.updateUserXP(user.id, completion.challenge.xpReward);
    }

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

    // Get updated challenge progress
    const activeChallenges = await storage.getAllActiveChallenges();
    const challengesWithProgress = await Promise.all(
      activeChallenges.map(async (challenge) => {
        const progress = await storage.getUserChallengeProgress(user.id, challenge.id);
        return {
          ...challenge,
          progress: progress || {
            currentProgress: 0,
            completed: false,
          },
        };
      })
    );

    res.json({
      user: xpResult.user,
      leveledUp: xpResult.leveledUp,
      nextLevelXP: xpResult.nextLevelXP,
      currentLevelXP: xpResult.currentLevelXP,
      xpGained: xpToAward,
      newAchievements,
      completedChallenges,
      challenges: challengesWithProgress,
    });
  });

  // Get leaderboard
  app.get("/api/leaderboard", requireAuth, async (_req, res) => {
    const leaderboard = await storage.getLeaderboard();
    res.json(leaderboard);
  });

  // Update user privacy settings
  app.patch("/api/privacy", requireAuth, async (req, res) => {
    const { isAnonymous, showOnLeaderboard, stealthMode, stealthNotifications } = req.body;
    const updatedUser = await storage.updateUser(req.user.id, {
      isAnonymous,
      showOnLeaderboard,
      stealthMode,
      stealthNotifications,
    });
    res.json(updatedUser);
  });

  // Initialize some default challenges
  const initializeDefaultChallenges = async () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);

    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(23, 59, 59, 999);

    console.log('Creating default challenges...');

    try {
      // Clear existing challenges
      const existingChallenges = await storage.getAllActiveChallenges();
      if (existingChallenges.length === 0) {
        // Daily Challenge
        const dailyChallenge = await storage.createChallenge({
          title: "Daily Dedication",
          description: "Maintain a streak for 24 hours",
          type: CHALLENGE_TYPES.DAILY,
          requirement: 1,
          xpReward: XP_REWARDS.CHALLENGE_COMPLETED,
          startDate: now,
          endDate: tomorrow,
          isActive: true,
        });

        // Weekly Challenge
        const weeklyChallenge = await storage.createChallenge({
          title: "Week Warrior",
          description: "Complete 7 sessions this week",
          type: CHALLENGE_TYPES.WEEKLY,
          requirement: 7,
          xpReward: XP_REWARDS.CHALLENGE_COMPLETED * 2,
          startDate: now,
          endDate: nextWeek,
          isActive: true,
        });

        // Special Challenge
        const specialChallenge = await storage.createChallenge({
          title: "Dedication Master",
          description: "Complete 3 sessions today",
          type: CHALLENGE_TYPES.DAILY,
          requirement: 3,
          xpReward: XP_REWARDS.CHALLENGE_COMPLETED * 1.5,
          startDate: now,
          endDate: tomorrow,
          isActive: true,
        });

        console.log('Created challenges:', { 
          dailyChallenge, 
          weeklyChallenge,
          specialChallenge 
        });
      }
    } catch (error) {
      console.error('Error creating challenges:', error);
    }
  };

  // Initialize challenges immediately when routes are registered
  await initializeDefaultChallenges();

  const httpServer = createServer(app);
  return httpServer;
}