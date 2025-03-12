import session from "express-session";
import createMemoryStore from "memorystore";
import { LEVEL_THRESHOLDS } from "../shared/schema.js";

const MemoryStore = createMemoryStore(session);

export class MemStorage {
  constructor() {
    this.users = new Map();
    this.achievements = new Map();
    this.currentId = 1;
    this.achievementId = 1;
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
    };
    this.users.set(id, user);
    return user;
  }

  calculateLevel(xpPoints) {
    let level = 1;
    let nextLevelXP = LEVEL_THRESHOLDS[1].xp;
    let currentLevelXP = 0;

    // Find current level and XP thresholds
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
    return Array.from(this.users.values())
      .filter(user => user.showOnLeaderboard)
      .sort((a, b) => b.currentStreak - a.currentStreak);
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
}

export const storage = new MemStorage();