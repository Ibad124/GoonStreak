import session from "express-session";
import createMemoryStore from "memorystore";
import { LEVEL_THRESHOLDS, CHALLENGE_TYPES } from "../shared/schema.js";

const MemoryStore = createMemoryStore(session);

export class MemStorage {
  constructor() {
    this.users = new Map();
    this.achievements = new Map();
    this.challenges = new Map();
    this.challengeProgress = new Map();
    this.leaderboardHistory = new Map();
    this.currentId = 1;
    this.achievementId = 1;
    this.challengeId = 1;
    this.challengeProgressId = 1;
    this.sessionLogId = 1;
    this.lastLeaderboardReset = new Date();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    this.sessionLogs = new Map();
    this.friendRequests = new Map();
    this.friendships = new Map();
    this.friendRequestId = 1;
    this.friendshipId = 1;

    // Add test users
    this.createUser({
      username: "GoonMaster",
      password: "test123",
      isAnonymous: false,
      showOnLeaderboard: true,
      currentStreak: 15,
      longestStreak: 20,
      totalSessions: 45,
      xpPoints: 450,
      level: 4,
      title: "Master Stroker"
    });

    this.createUser({
      username: "StrokeKing",
      password: "test123",
      isAnonymous: false,
      showOnLeaderboard: true,
      currentStreak: 12,
      longestStreak: 18,
      totalSessions: 38,
      xpPoints: 380,
      level: 3,
      title: "Goon Expert"
    });

    this.createUser({
      username: "EdgeLord",
      password: "test123",
      isAnonymous: false,
      showOnLeaderboard: true,
      currentStreak: 10,
      longestStreak: 15,
      totalSessions: 30,
      xpPoints: 300,
      level: 3,
      title: "Goon Expert"
    });

    // Add test achievements
    this.achievements.set(1, {
      id: 1,
      userId: 1,
      type: "STREAK_MASTER",
      description: "Maintained a 15-day streak!",
      earnedAt: new Date()
    });

    this.achievements.set(2, {
      id: 2,
      userId: 1,
      type: "XP_MILESTONE",
      description: "Reached 450 XP points!",
      earnedAt: new Date()
    });

    this.achievements.set(3, {
      id: 3,
      userId: 2,
      type: "SESSION_MASTER",
      description: "Completed 30 sessions!",
      earnedAt: new Date()
    });

    // Add test session logs for insights
    const now = new Date();
    for (let i = 0; i < 50; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - Math.floor(Math.random() * 7));
      date.setHours(Math.floor(Math.random() * 24));

      this.sessionLogs.set(this.sessionLogId++, {
        id: this.sessionLogId,
        userId: 1,
        timestamp: date,
        dayOfWeek: date.getDay(),
        hourOfDay: date.getHours()
      });
    }

    // Add more test session logs with varied times
    const users = [1, 2, 3]; // Test user IDs
    for (let userId of users) {
      for (let i = 0; i < 50; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - Math.floor(Math.random() * 14)); // Last 2 weeks
        date.setHours(Math.floor(Math.random() * 24));

        this.sessionLogs.set(this.sessionLogId++, {
          id: this.sessionLogId,
          userId,
          timestamp: date,
          dayOfWeek: date.getDay(),
          hourOfDay: date.getHours(),
          duration: Math.floor(Math.random() * 120) + 30, // 30-150 minutes
          intensity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
          mood: ['relaxed', 'energetic', 'focused'][Math.floor(Math.random() * 3)],
        });
      }
    }

    // Initialize default challenges
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);

    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(23, 59, 59, 999);

    this.createChallenge({
      title: "Daily Dedication",
      description: "Complete 3 sessions today",
      type: "DAILY",
      requirement: 3,
      xpReward: 50,
      startDate: now,
      endDate: tomorrow,
      isActive: true,
    });

    this.createChallenge({
      title: "Week Warrior",
      description: "Maintain a 7-day streak",
      type: "WEEKLY",
      requirement: 7,
      xpReward: 100,
      startDate: now,
      endDate: nextWeek,
      isActive: true,
    });

    this.createChallenge({
      title: "Intensity Master",
      description: "Complete 5 high-intensity sessions",
      type: "WEEKLY",
      requirement: 5,
      xpReward: 75,
      startDate: now,
      endDate: nextWeek,
      isActive: true,
    });
  }

  async getUser(id) {
    return this.users.get(id);
  }

  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser) {
    const id = this.currentId++;
    const user = {
      ...insertUser,
      id,
      currentStreak: 0,
      longestStreak: 0,
      lastSessionDate: null,
      totalSessions: 0,
      todaySessions: 0,
      xpPoints: 0,
      level: 1,
      title: LEVEL_THRESHOLDS[1].title,
      stealthMode: false,
      stealthNotifications: false,
      showOnLeaderboard: true,
    };
    this.users.set(id, user);
    return user;
  }

  calculateLevel(xpPoints) {
    let level = 1;
    let nextLevelXP = LEVEL_THRESHOLDS[1].xp;
    let currentLevelXP = 0;

    for (const [lvl, data] of Object.entries(LEVEL_THRESHOLDS)) {
      if (xpPoints >= data.xp) {
        level = parseInt(lvl);
        currentLevelXP = data.xp;
        nextLevelXP = LEVEL_THRESHOLDS[parseInt(lvl) + 1]?.xp || data.xp;
      } else {
        break;
      }
    }

    return {
      level,
      title: LEVEL_THRESHOLDS[level].title,
      nextLevelXP,
      currentLevelXP
    };
  }

  async updateUserXP(userId, xpToAdd) {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    const oldLevel = user.level;
    const newXP = user.xpPoints + xpToAdd;
    const { level, title, nextLevelXP, currentLevelXP } = this.calculateLevel(newXP);

    console.log('Storage updateUserXP:', {
      userId,
      oldXP: user.xpPoints,
      xpToAdd,
      newXP,
      oldLevel,
      newLevel: level
    });

    const updatedUser = await this.updateUser(userId, {
      xpPoints: newXP,
      level,
      title,
    });

    return {
      user: updatedUser,
      leveledUp: level > oldLevel,
      nextLevelXP,
      currentLevelXP
    };
  }

  async updateUser(id, data) {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");

    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);

    if ('xpPoints' in data) {
      console.log('Storage updateUser:', {
        userId: id,
        newXP: updatedUser.xpPoints,
        newLevel: updatedUser.level
      });
    }

    return updatedUser;
  }

  async getLeaderboard() {
    await this.checkLeaderboardReset();

    return Array.from(this.users.values())
      .filter(user => user.showOnLeaderboard)
      .sort((a, b) => {
        if (b.currentStreak !== a.currentStreak) {
          return b.currentStreak - a.currentStreak;
        }
        return b.xpPoints - a.xpPoints;
      });
  }

  async checkLeaderboardReset() {
    const now = new Date();
    const weekInMillis = 7 * 24 * 60 * 60 * 1000;

    if (now - this.lastLeaderboardReset >= weekInMillis) {
      const currentLeaderboard = Array.from(this.users.values())
        .filter(user => user.showOnLeaderboard)
        .sort((a, b) => b.currentStreak - a.currentStreak)
        .slice(0, 3);

      for (let i = 0; i < currentLeaderboard.length; i++) {
        const user = currentLeaderboard[i];
        const bonusXP = i === 0 ? 100 : i === 1 ? 50 : 25;

        await this.updateUserXP(user.id, bonusXP);
        await this.addAchievement(
          user.id,
          "LEADERBOARD_TOP_3",
          `Ranked #${i + 1} on the weekly leaderboard!`
        );
      }

      this.leaderboardHistory.set(this.lastLeaderboardReset.toISOString(), {
        topUsers: currentLeaderboard.map(user => ({
          username: user.username,
          streak: user.currentStreak,
          xpPoints: user.xpPoints,
        })),
        resetDate: this.lastLeaderboardReset,
      });

      this.lastLeaderboardReset = now;
    }
  }

  getTimeUntilReset() {
    const now = new Date();
    const weekInMillis = 7 * 24 * 60 * 60 * 1000;
    const nextReset = new Date(this.lastLeaderboardReset.getTime() + weekInMillis);
    return nextReset - now;
  }

  async addAchievement(userId, type, description) {
    const achievement = {
      id: this.achievementId++,
      userId,
      type,
      description,
      earnedAt: new Date(),
    };

    const userAchievements = this.achievements.get(userId) || [];
    userAchievements.push(achievement);
    this.achievements.set(userId, userAchievements);

    return achievement;
  }

  async getUserAchievements(userId) {
    return this.achievements.get(userId) || [];
  }

  async createChallenge(challengeData) {
    const id = this.challengeId++;
    const challenge = {
      ...challengeData,
      id,
      isActive: true,
    };
    this.challenges.set(id, challenge);
    return challenge;
  }

  async getActiveChallenge() {
    return Array.from(this.challenges.values()).find(
      (challenge) => challenge.isActive &&
        new Date(challenge.startDate) <= new Date() &&
        new Date(challenge.endDate) >= new Date()
    );
  }

  async getAllActiveChallenges() {
    const now = new Date();
    const challenges = Array.from(this.challenges.values());

    console.log('Getting active challenges, total challenges:', challenges.length);

    const activeOnes = challenges.filter(challenge => {
      const startDate = new Date(challenge.startDate);
      const endDate = new Date(challenge.endDate);
      const isActive = challenge.isActive &&
                      startDate <= now &&
                      endDate >= now;

      console.log('Challenge:', {
        id: challenge.id,
        title: challenge.title,
        startDate,
        endDate,
        isActive
      });

      return isActive;
    });

    console.log('Active challenges found:', activeOnes.length);
    return activeOnes;
  }

  async getUserChallengeProgress(userId, challengeId) {
    return Array.from(this.challengeProgress.values()).find(
      (progress) => progress.userId === userId && progress.challengeId === challengeId
    );
  }

  async createOrUpdateChallengeProgress(userId, challengeId, progress) {
    let existingProgress = await this.getUserChallengeProgress(userId, challengeId);

    if (!existingProgress) {
      existingProgress = {
        id: this.challengeProgressId++,
        userId,
        challengeId,
        currentProgress: 0,
        completed: false,
        completedAt: null,
      };
    }

    const updatedProgress = {
      ...existingProgress,
      ...progress,
    };

    this.challengeProgress.set(updatedProgress.id, updatedProgress);
    return updatedProgress;
  }

  async checkAndUpdateChallenges(userId) {
    const activeChallenges = await this.getAllActiveChallenges();
    const newCompletions = [];

    for (const challenge of activeChallenges) {
      const progress = await this.getUserChallengeProgress(userId, challenge.id);
      if (!progress?.completed) {
        const user = await this.getUser(userId);
        let currentProgress = 0;

        switch (challenge.type) {
          case CHALLENGE_TYPES.DAILY:
            currentProgress = user.currentStreak;
            break;
          case CHALLENGE_TYPES.WEEKLY:
            currentProgress = user.totalSessions;
            break;
        }

        if (currentProgress >= challenge.requirement) {
          const updatedProgress = await this.createOrUpdateChallengeProgress(userId, challenge.id, {
            currentProgress,
            completed: true,
            completedAt: new Date(),
          });
          newCompletions.push({ challenge, progress: updatedProgress });
        } else {
          await this.createOrUpdateChallengeProgress(userId, challenge.id, {
            currentProgress,
          });
        }
      }
    }

    return newCompletions;
  }

  async logSession(userId, timestamp) {
    const sessionLog = {
      id: this.sessionLogId++,
      userId,
      timestamp,
      dayOfWeek: timestamp.getDay(),
      hourOfDay: timestamp.getHours(),
    };

    this.sessionLogs.set(sessionLog.id, sessionLog);
    return sessionLog;
  }

  async getUserInsights(userId) {
    const userSessions = Array.from(this.sessionLogs.values())
      .filter(log => log.userId === userId);

    const heatmap = Array(7).fill(null).map(() => Array(24).fill(0));

    const hourCounts = Array(24).fill(0);
    const dayCounts = Array(7).fill(0);

    userSessions.forEach(session => {
      heatmap[session.dayOfWeek][session.hourOfDay]++;
      hourCounts[session.hourOfDay]++;
      dayCounts[session.dayOfWeek]++;
    });

    const mostActiveHour = hourCounts.indexOf(Math.max(...hourCounts));
    const mostActiveDay = dayCounts.indexOf(Math.max(...dayCounts));

    return {
      heatmap,
      trends: {
        mostActiveHour,
        mostActiveHourSessions: hourCounts[mostActiveHour],
        mostActiveDay,
        mostActiveDaySessions: dayCounts[mostActiveDay],
      }
    };
  }

  // New friend-related methods
  async sendFriendRequest(senderId, receiverId) {
    const id = this.friendRequestId++;
    const request = {
      id,
      senderId,
      receiverId,
      status: "pending",
      sentAt: new Date(),
      respondedAt: null,
    };
    this.friendRequests.set(id, request);
    return request;
  }

  async getFriendRequests(userId) {
    return Array.from(this.friendRequests.values()).filter(
      (request) =>
        (request.receiverId === userId || request.senderId === userId) &&
        request.status === "pending"
    );
  }

  async getPendingReceivedRequests(userId) {
    return Array.from(this.friendRequests.values()).filter(
      (request) =>
        request.receiverId === userId && request.status === "pending"
    );
  }

  async respondToFriendRequest(requestId, status) {
    const request = this.friendRequests.get(requestId);
    if (!request) throw new Error("Friend request not found");

    const updatedRequest = {
      ...request,
      status,
      respondedAt: new Date(),
    };
    this.friendRequests.set(requestId, updatedRequest);

    if (status === "accepted") {
      await this.createFriendship(request.senderId, request.receiverId);
    }

    return updatedRequest;
  }

  async createFriendship(user1Id, user2Id) {
    const id = this.friendshipId++;
    const friendship = {
      id,
      user1Id,
      user2Id,
      createdAt: new Date(),
    };
    this.friendships.set(id, friendship);
    return friendship;
  }

  async getUserFriends(userId) {
    return Array.from(this.friendships.values()).filter(
      (friendship) =>
        friendship.user1Id === userId || friendship.user2Id === userId
    ).map(friendship => ({
      friendshipId: friendship.id,
      friendId: friendship.user1Id === userId ? friendship.user2Id : friendship.user1Id,
      createdAt: friendship.createdAt
    }));
  }

  async getFriendship(user1Id, user2Id) {
    return Array.from(this.friendships.values()).find(
      (friendship) =>
        (friendship.user1Id === user1Id && friendship.user2Id === user2Id) ||
        (friendship.user1Id === user2Id && friendship.user2Id === user1Id)
    );
  }

  async updateUserStatus(userId, status) {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    const updatedUser = {
      ...user,
      status,
      lastActive: new Date(),
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async setUserOnlineStatus(userId, isOnline) {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    const updatedUser = {
      ...user,
      isOnline,
      lastActive: new Date(),
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
}

export const storage = new MemStorage();