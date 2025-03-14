import { users, type User, type InsertUser, achievements, type Achievement, LEVEL_THRESHOLDS, XP_REWARDS } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import type { ThemePreferences } from "@/types/theme";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User>;
  getUserPreferences(userId: number): Promise<ThemePreferences | undefined>;
  saveUserPreferences(userId: number, preferences: ThemePreferences): Promise<ThemePreferences>;
  getLeaderboard(): Promise<User[]>;
  addAchievement(userId: number, type: string, description: string, xpAwarded: number): Promise<Achievement>;
  getUserAchievements(userId: number): Promise<Achievement[]>;
  updateUserXP(userId: number, xpToAdd: number): Promise<{ user: User; leveledUp: boolean; nextLevelXP: number; currentLevelXP: number }>;
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private achievements: Map<number, Achievement[]>;
  private preferences: Map<number, ThemePreferences>;
  private currentId: number;
  private achievementId: number;
  readonly sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.achievements = new Map();
    this.preferences = new Map();
    this.currentId = 1;
    this.achievementId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUserPreferences(userId: number): Promise<ThemePreferences | undefined> {
    return this.preferences.get(userId);
  }

  async saveUserPreferences(userId: number, preferences: ThemePreferences): Promise<ThemePreferences> {
    this.preferences.set(userId, preferences);
    return preferences;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = {
      ...insertUser,
      id,
      currentStreak: 0,
      longestStreak: 0,
      lastSessionDate: null,
      totalSessions: 0,
      todaySessions: 0,
      xpPoints: 0,
      level: 1,
      currentBadge: LEVEL_THRESHOLDS[1].title,
    };
    this.users.set(id, user);
    return user;
  }

  calculateLevel(xpPoints: number) {
    let level = 1;
    let nextLevelXP = LEVEL_THRESHOLDS[1].points;
    let currentLevelXP = 0;

    for (const [lvl, data] of Object.entries(LEVEL_THRESHOLDS)) {
      if (xpPoints >= data.points) {
        level = parseInt(lvl);
        currentLevelXP = data.points;
        nextLevelXP = LEVEL_THRESHOLDS[level + 1]?.points || data.points;
      } else {
        break;
      }
    }

    return {
      level,
      badge: LEVEL_THRESHOLDS[level].title,
      nextLevelXP,
      currentLevelXP
    };
  }

  async updateUserXP(userId: number, xpToAdd: number) {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    const oldLevel = user.level;
    const newXP = user.xpPoints + xpToAdd;
    const { level, badge, nextLevelXP, currentLevelXP } = this.calculateLevel(newXP);

    const updatedUser = await this.updateUser(userId, {
      xpPoints: newXP,
      level,
      currentBadge: badge,
    });

    return {
      user: updatedUser,
      leveledUp: level > oldLevel,
      nextLevelXP,
      currentLevelXP
    };
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");

    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getLeaderboard(): Promise<User[]> {
    return Array.from(this.users.values())
      .filter(user => user.showOnLeaderboard)
      .sort((a, b) => {
        if (b.xpPoints !== a.xpPoints) {
          return b.xpPoints - a.xpPoints;
        }
        return b.currentStreak - a.currentStreak;
      });
  }

  async addAchievement(userId: number, type: string, description: string, xpAwarded: number = XP_REWARDS.ACHIEVEMENT_EARNED): Promise<Achievement> {
    const achievement: Achievement = {
      id: this.achievementId++,
      userId,
      type,
      description,
      earnedAt: new Date().toISOString(),
      xpAwarded,
    };

    const userAchievements = this.achievements.get(userId) || [];
    userAchievements.push(achievement);
    this.achievements.set(userId, userAchievements);

    // Award XP for the achievement
    await this.updateUserXP(userId, xpAwarded);

    return achievement;
  }

  async getUserAchievements(userId: number): Promise<Achievement[]> {
    return this.achievements.get(userId) || [];
  }
}

export const storage = new MemStorage();