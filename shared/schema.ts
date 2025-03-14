
import { pgTable, text, serial, integer, boolean, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table definition
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  showOnLeaderboard: boolean("show_on_leaderboard").notNull().default(true),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastSessionDate: text("last_session_date"),
  totalSessions: integer("total_sessions").notNull().default(0),
  todaySessions: integer("today_sessions").notNull().default(0),
  xpPoints: integer("xp_points").notNull().default(0),
  level: integer("level").notNull().default(1),
  currentBadge: text("current_badge").notNull().default("Novice"),
  streakMultiplier: integer("streak_multiplier").notNull().default(1),
  lastStreakReset: text("last_streak_reset"),
  socialMode: text("social_mode").notNull().default("solo"),
});

// Friend system tables
export const friendRequests = pgTable("friend_requests", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull(),
  receiverId: integer("receiver_id").notNull(),
  status: text("status").notNull().default("pending"),
  sentAt: timestamp("sent_at").notNull(),
  respondedAt: timestamp("responded_at"),
});

export const friendships = pgTable("friendships", {
  id: serial("id").primaryKey(),
  user1Id: integer("user1_id").notNull(),
  user2Id: integer("user2_id").notNull(),
  createdAt: timestamp("created_at").notNull(),
});

// Achievements table definition
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(),
  earnedAt: text("earned_at").notNull(),
  description: text("description").notNull(),
  xpAwarded: integer("xp_awarded").notNull().default(0),
});

// Level System Configuration
export const LEVEL_THRESHOLDS = {
  1: { points: 0, title: "Novice Streaker" },
  2: { points: 100, title: "Apprentice Streaker" },
  3: { points: 300, title: "Intermediate Streaker" },
  4: { points: 600, title: "Advanced Streaker" },
  5: { points: 1000, title: "Expert Streaker" },
  6: { points: 2000, title: "Master Streaker" },
  7: { points: 5000, title: "Grandmaster Streaker" },
  8: { points: 10000, title: "Legendary Streaker" }
};

// XP Rewards Configuration
export const XP_REWARDS = {
  SESSION_COMPLETE: 15,
  STREAK_MILESTONE: 30,
  ACHIEVEMENT_EARNED: 25,
  CHALLENGE_COMPLETED: 50,
};

// Character Styles Configuration
export const CHARACTER_STYLES = {
  solo: "default",
  competitive: "friendly",
  hardcore: "intense"
} as const;

// Schemas and types
export const insertUserSchema = createInsertSchema(users);
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type CharacterStyle = keyof typeof CHARACTER_STYLES;

// Streak Configuration
export const STREAK_CONFIG = {
  GRACE_PERIOD_HOURS: 24,
  MULTIPLIER_MILESTONES: {
    3: 1.2,  // 20% bonus after 3 days
    7: 1.5,  // 50% bonus after 7 days
    14: 1.8, // 80% bonus after 14 days
    30: 2.0, // 100% bonus after 30 days
    60: 2.5, // 150% bonus after 60 days
  },
  MILESTONE_ACHIEVEMENTS: {
    3: "Bronze Streak",
    7: "Silver Streak",
    14: "Gold Streak", 
    30: "Diamond Streak",
    60: "Legendary Streak",
  }
} as const;
