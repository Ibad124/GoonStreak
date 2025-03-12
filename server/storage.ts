import { users, type User, type InsertUser, achievements, type Achievement } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User>;
  getLeaderboard(): Promise<User[]>;
  addAchievement(userId: number, type: string, description: string): Promise<Achievement>;
  getUserAchievements(userId: number): Promise<Achievement[]>;
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private achievements: Map<number, Achievement[]>;
  private currentId: number;
  private achievementId: number;
  readonly sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.achievements = new Map();
    this.currentId = 1;
    this.achievementId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
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
    };
    this.users.set(id, user);
    return user;
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
      .sort((a, b) => b.currentStreak - a.currentStreak);
  }

  async addAchievement(userId: number, type: string, description: string): Promise<Achievement> {
    const achievement: Achievement = {
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

  async getUserAchievements(userId: number): Promise<Achievement[]> {
    return this.achievements.get(userId) || [];
  }
}

export const storage = new MemStorage();
