import session from "express-session";
import createMemoryStore from "memorystore";

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
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id, data) {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
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
