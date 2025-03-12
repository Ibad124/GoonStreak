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
    this.leaderboardHistory = new Map(); // Store weekly leaderboard history
    this.currentId = 1;
    this.achievementId = 1;
    this.challengeId = 1;
    this.challengeProgressId = 1;
    this.lastLeaderboardReset = new Date();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
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
      showOnLeaderboard: true, // Added to control leaderboard visibility
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
    // Check if we need to reset the leaderboard (weekly)
    await this.checkLeaderboardReset();

    return Array.from(this.users.values())
      .filter(user => user.showOnLeaderboard)
      .sort((a, b) => {
        // Sort by currentStreak first, then by XP points
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
      // Store current leaderboard in history
      const currentLeaderboard = Array.from(this.users.values())
        .filter(user => user.showOnLeaderboard)
        .sort((a, b) => b.currentStreak - a.currentStreak)
        .slice(0, 3); // Store top 3

      // Award XP bonuses to top 3
      for (let i = 0; i < currentLeaderboard.length; i++) {
        const user = currentLeaderboard[i];
        const bonusXP = i === 0 ? 100 : i === 1 ? 50 : 25;

        // Award XP and achievement
        await this.updateUserXP(user.id, bonusXP);
        await this.addAchievement(
          user.id,
          "LEADERBOARD_TOP_3",
          `Ranked #${i + 1} on the weekly leaderboard!`
        );
      }

      // Store this week's results
      this.leaderboardHistory.set(this.lastLeaderboardReset.toISOString(), {
        topUsers: currentLeaderboard.map(user => ({
          username: user.username,
          streak: user.currentStreak,
          xpPoints: user.xpPoints,
        })),
        resetDate: this.lastLeaderboardReset,
      });

      // Update reset timestamp
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
}

export const storage = new MemStorage();