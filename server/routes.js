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

    const challengesWithProgress = await Promise.all(
      activeChallenges.map(async (challenge) => {
        const progress = await storage.getUserChallengeProgress(req.user.id, challenge.id);
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
      user: req.user,
      achievements,
      nextLevelXP,
      currentLevelXP,
      challenges: challengesWithProgress,
    });
  });

  app.post("/api/session", requireAuth, async (req, res) => {
    const user = req.user;
    const today = new Date();
    const { duration, intensity, mood } = req.body;
    const lastDate = user.lastSessionDate ? new Date(user.lastSessionDate) : null;

    let currentStreak = user.currentStreak;
    let todaySessions = user.todaySessions;
    let xpToAward = XP_REWARDS.SESSION_COMPLETE;

    // Update streak and XP
    if (!lastDate || lastDate.getDate() !== today.getDate()) {
      todaySessions = 0;
    }

    if (!lastDate ||
        (today.getTime() - lastDate.getTime()) > 24 * 60 * 60 * 1000) {
      currentStreak = 1;
      xpToAward += XP_REWARDS.STREAK_MILESTONE;
    } else if (lastDate.getDate() !== today.getDate()) {
      currentStreak += 1;
      if (currentStreak % 3 === 0) {
        xpToAward += XP_REWARDS.STREAK_MILESTONE;
      }
    }

    // Award bonus XP based on duration and intensity
    if (duration > 60) xpToAward += 15;
    if (intensity === 'high') xpToAward += 10;

    if (todaySessions < 5) {
      xpToAward += todaySessions * 5;
    }

    const sessionLog = await storage.logSession(user.id, {
      timestamp: today,
      duration,
      intensity,
      mood,
    });

    const updatedUser = await storage.updateUser(user.id, {
      lastSessionDate: today,
      currentStreak,
      longestStreak: Math.max(currentStreak, user.longestStreak),
      totalSessions: user.totalSessions + 1,
      todaySessions: todaySessions + 1,
    });

    // Calculate XP updates
    const xpResult = await storage.updateUserXP(user.id, xpToAward);

    // Check for completed challenges
    const completedChallenges = await storage.checkAndUpdateChallenges(user.id);

    // Award XP for completed challenges
    let challengeXP = 0;
    for (const completion of completedChallenges) {
      challengeXP += completion.challenge.xpReward;
      await storage.updateUserXP(user.id, completion.challenge.xpReward);
    }

    const newAchievements = [];

    // Award achievements based on streak milestones
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

    // Get updated challenges
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

    // Get final XP calculations
    const finalUser = await storage.getUser(user.id);
    const { nextLevelXP, currentLevelXP } = storage.calculateLevel(finalUser.xpPoints);

    res.json({
      user: finalUser,
      leveledUp: xpResult.leveledUp,
      nextLevelXP,
      currentLevelXP,
      xpGained: xpToAward + challengeXP + (newAchievements.length * XP_REWARDS.ACHIEVEMENT_EARNED),
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

  // New Friend System Routes

  // Get user's friend list
  app.get("/api/friends", requireAuth, async (req, res) => {
    const friends = await storage.getUserFriends(req.user.id);

    // Get full user data for each friend
    const friendsWithData = await Promise.all(
      friends.map(async (friend) => {
        const userData = await storage.getUser(friend.friendId);
        return {
          ...friend,
          username: userData.username,
          isOnline: userData.isOnline,
          lastActive: userData.lastActive,
          status: userData.status,
          currentStreak: userData.currentStreak,
          level: userData.level,
          title: userData.title,
        };
      })
    );

    res.json(friendsWithData);
  });

  // Get pending friend requests
  app.get("/api/friends/requests", requireAuth, async (req, res) => {
    const requests = await storage.getFriendRequests(req.user.id);

    // Get user data for each request
    const requestsWithData = await Promise.all(
      requests.map(async (request) => {
        const otherUserId = request.senderId === req.user.id ? request.receiverId : request.senderId;
        const otherUser = await storage.getUser(otherUserId);
        return {
          ...request,
          otherUser: {
            id: otherUser.id,
            username: otherUser.username,
            level: otherUser.level,
            title: otherUser.title,
          },
        };
      })
    );

    res.json(requestsWithData);
  });

  // Send a friend request
  app.post("/api/friends/request", requireAuth, async (req, res) => {
    const { receiverId } = req.body;

    // Check if users are already friends
    const existingFriendship = await storage.getFriendship(req.user.id, receiverId);
    if (existingFriendship) {
      return res.status(400).json({ error: "Already friends with this user" });
    }

    // Check if there's a pending request
    const existingRequests = await storage.getFriendRequests(req.user.id);
    const alreadyRequested = existingRequests.some(
      request =>
        (request.senderId === req.user.id && request.receiverId === receiverId) ||
        (request.senderId === receiverId && request.receiverId === req.user.id)
    );

    if (alreadyRequested) {
      return res.status(400).json({ error: "Friend request already exists" });
    }

    const request = await storage.sendFriendRequest(req.user.id, receiverId);
    res.status(201).json(request);
  });

  // Respond to a friend request
  app.post("/api/friends/request/:id/respond", requireAuth, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'accepted' or 'rejected'

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const request = await storage.respondToFriendRequest(parseInt(id), status);
    res.json(request);
  });

  // Update user status
  app.patch("/api/friends/status", requireAuth, async (req, res) => {
    const { status } = req.body;
    const updatedUser = await storage.updateUserStatus(req.user.id, status);
    res.json(updatedUser);
  });

  // Add to the routes section
  app.get("/api/leaderboard/reset-time", requireAuth, async (req, res) => {
    const timeUntilReset = storage.getTimeUntilReset();
    res.json({ timeUntilReset });
  });

  // Add to the routes section
  app.get("/api/leaderboard/history", requireAuth, async (req, res) => {
    const history = Array.from(storage.leaderboardHistory.values())
      .sort((a, b) => new Date(b.resetDate) - new Date(a.resetDate));
    res.json(history);
  });


  // Add to the routes section
  app.get("/api/insights", requireAuth, async (req, res) => {
    const insights = await storage.getUserInsights(req.user.id);
    res.json(insights);
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

    try {
      const existingChallenges = await storage.getAllActiveChallenges();
      if (existingChallenges.length === 0) {
        await storage.createChallenge({
          title: "Daily Dedication",
          description: "Maintain a streak for 24 hours",
          type: CHALLENGE_TYPES.DAILY,
          requirement: 1,
          xpReward: XP_REWARDS.CHALLENGE_COMPLETED,
          startDate: now,
          endDate: tomorrow,
          isActive: true,
        });

        await storage.createChallenge({
          title: "Week Warrior",
          description: "Complete 7 sessions this week",
          type: CHALLENGE_TYPES.WEEKLY,
          requirement: 7,
          xpReward: XP_REWARDS.CHALLENGE_COMPLETED * 2,
          startDate: now,
          endDate: nextWeek,
          isActive: true,
        });

        await storage.createChallenge({
          title: "Dedication Master",
          description: "Complete 3 sessions today",
          type: CHALLENGE_TYPES.DAILY,
          requirement: 3,
          xpReward: XP_REWARDS.CHALLENGE_COMPLETED * 1.5,
          startDate: now,
          endDate: tomorrow,
          isActive: true,
        });
      }
    } catch (error) {
      console.error('Error creating challenges:', error);
    }
  };

  await initializeDefaultChallenges();

  const httpServer = createServer(app);
  return httpServer;
}