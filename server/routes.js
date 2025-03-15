import { createServer } from "http";
import { setupAuth } from "./auth.js";
import { storage } from "./storage.js";
import { aiSuggestionService } from "./services/ai-suggestions.js";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
      challenges: challengesWithProgress,
    });
  });

  // Log activity helper function
  const logActivity = async (userId, type, description) => {
    return storage.createActivity({
      userId,
      type,
      description,
      timestamp: new Date(),
    });
  };

  app.post("/api/session", requireAuth, async (req, res) => {
    const user = req.user;
    const today = new Date();
    const { duration, intensity, mood } = req.body;
    const lastDate = user.lastSessionDate ? new Date(user.lastSessionDate) : null;

    let currentStreak = user.currentStreak;
    let todaySessions = user.todaySessions;

    // Update streak
    if (!lastDate || lastDate.getDate() !== today.getDate()) {
      todaySessions = 0;
    }

    if (!lastDate ||
        (today.getTime() - lastDate.getTime()) > 24 * 60 * 60 * 1000) {
      currentStreak = 1;
      // Log streak reset
      await logActivity(user.id, "STREAK", "started a new streak");
    } else if (lastDate.getDate() !== today.getDate()) {
      currentStreak += 1;
      // Log streak increase
      await logActivity(user.id, "STREAK", `reached a ${currentStreak}-day streak! 🔥`);
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

    // Check for completed challenges
    const completedChallenges = await storage.checkAndUpdateChallenges(user.id);
    const newAchievements = [];

    // Award achievements based on streak milestones
    if (currentStreak === 3) {
      const achievement = await storage.addAchievement(
        user.id,
        "STREAK_3",
        "Achieved a 3-day streak!"
      );
      newAchievements.push(achievement);
      await logActivity(user.id, "ACHIEVEMENT", "earned the 3-Day Streak achievement! 🏆");
    }

    if (updatedUser.totalSessions === 10) {
      const achievement = await storage.addAchievement(
        user.id,
        "SESSIONS_10",
        "Logged 10 total sessions!"
      );
      newAchievements.push(achievement);
      await logActivity(user.id, "ACHIEVEMENT", "earned the Session Master achievement! 🎯");
    }

    // Log completed challenges
    for (const completion of completedChallenges) {
      await logActivity(
        user.id,
        "CHALLENGE",
        `completed the "${completion.challenge.title}" challenge! 🎉`
      );
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

    res.json({
      user: updatedUser,
      newAchievements,
      completedChallenges,
      challenges: challengesWithProgress,
    });
  });

  // Get friend activities
  app.get("/api/friends/activity", requireAuth, async (req, res) => {
    console.log("Fetching friend activities for user:", req.user.id);

    const friends = await storage.getUserFriends(req.user.id);
    console.log("Found friends:", friends);

    const friendIds = friends.map(f => f.friendId);
    console.log("Friend IDs:", friendIds);

    const activities = await storage.getFriendActivities(friendIds);
    console.log("Raw activities:", activities);

    // Get user data for each activity
    const activitiesWithUserData = await Promise.all(
      activities.map(async (activity) => {
        const user = await storage.getUser(activity.userId);
        return {
          ...activity,
          username: user.username,
        };
      })
    );

    console.log("Enriched activities with user data:", activitiesWithUserData);
    res.json(activitiesWithUserData);
  });

  // Get leaderboard
  app.get("/api/leaderboard", requireAuth, async (_req, res) => {
    const leaderboard = await storage.getLeaderboard();
    res.json(leaderboard);
  });

  // Friend System Routes
  app.get("/api/friends", requireAuth, async (req, res) => {
    const friends = await storage.getUserFriends(req.user.id);
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
        };
      })
    );
    res.json(friendsWithData);
  });

  // Add the new active friends endpoint after the existing friends endpoint
  app.get("/api/friends/active", requireAuth, async (req, res) => {
    try {
      const friends = await storage.getUserFriends(req.user.id);
      const activeFriendsWithData = await Promise.all(
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
            title: userData.title
          };
        })
      );

      // Filter only online friends and those active in the last 15 minutes
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
      const activeFriends = activeFriendsWithData.filter(friend =>
        friend.isOnline || (friend.lastActive && new Date(friend.lastActive) > fifteenMinutesAgo)
      );

      res.json(activeFriends);
    } catch (error) {
      console.error("Error fetching active friends:", error);
      res.status(500).json({ error: "Failed to fetch active friends" });
    }
  });

  // Get pending friend requests
  app.get("/api/friends/requests", requireAuth, async (req, res) => {
    const requests = await storage.getFriendRequests(req.user.id);
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
    const existingFriendship = await storage.getFriendship(req.user.id, receiverId);
    if (existingFriendship) {
      return res.status(400).json({ error: "Already friends with this user" });
    }
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
          type: "DAILY",
          requirement: 1,
          startDate: now,
          endDate: tomorrow,
          isActive: true,
        });

        await storage.createChallenge({
          title: "Week Warrior",
          description: "Complete 7 sessions this week",
          type: "WEEKLY",
          requirement: 7,
          startDate: now,
          endDate: nextWeek,
          isActive: true,
        });
      }
    } catch (error) {
      console.error('Error creating challenges:', error);
    }
  };

  await initializeDefaultChallenges();

  // AI Suggestion Routes
  app.get("/api/suggestions", requireAuth, async (req, res) => {
    try {
      const suggestions = await aiSuggestionService.getUserSuggestions(req.user.id);
      res.json(suggestions);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      res.status(500).json({ error: "Failed to fetch suggestions" });
    }
  });

  app.post("/api/suggestions/generate", requireAuth, async (req, res) => {
    try {
      const suggestion = await aiSuggestionService.generateSuggestion(req.user.id);
      res.json(suggestion);
    } catch (error) {
      console.error("Error generating suggestion:", error);
      res.status(500).json({ error: "Failed to generate suggestion" });
    }
  });

  app.post("/api/suggestions/:id/rate", requireAuth, async (req, res) => {
    try {
      const { rating } = req.body;
      if (typeof rating !== "number" || rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Invalid rating" });
      }

      const suggestion = await aiSuggestionService.rateSuggestion(
        parseInt(req.params.id),
        rating
      );
      res.json(suggestion);
    } catch (error) {
      console.error("Error rating suggestion:", error);
      res.status(500).json({ error: "Failed to rate suggestion" });
    }
  });

  // Sex AI Chat Route
  app.post("/api/chat/sex-ai", requireAuth, async (req, res) => {
    try {
      const { message } = req.body;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a knowledgeable and respectful advisor for intimate topics and relationships. Provide accurate, helpful, and mature guidance while maintaining appropriate boundaries.",
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 150,
      });

      res.json({
        message: completion.choices[0].message.content,
      });
    } catch (error) {
      console.error("Error in sex AI chat:", error);
      res.status(500).json({ error: "Failed to generate response" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}