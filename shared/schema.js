import { pgTable, text, serial, integer, boolean, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  showOnLeaderboard: boolean("show_on_leaderboard").notNull().default(true),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastSessionDate: date("last_session_date"),
  totalSessions: integer("total_sessions").notNull().default(0),
  todaySessions: integer("today_sessions").notNull().default(0),
  xpPoints: integer("xp_points").notNull().default(0),
  level: integer("level").notNull().default(1),
  title: text("title").notNull().default("Goon Apprentice"),
  stealthMode: boolean("stealth_mode").notNull().default(false),
  stealthNotifications: boolean("stealth_notifications").notNull().default(false),
  // New social-related fields
  status: text("status").default(""),
  lastActive: timestamp("last_active"),
  isOnline: boolean("is_online").default(false),
});

// New table for friend requests
export const friendRequests = pgTable("friend_requests", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull(),
  receiverId: integer("receiver_id").notNull(),
  status: text("status").notNull().default("pending"), // pending, accepted, rejected
  sentAt: timestamp("sent_at").notNull(),
  respondedAt: timestamp("responded_at"),
});

// New table for confirmed friendships
export const friendships = pgTable("friendships", {
  id: serial("id").primaryKey(),
  user1Id: integer("user1_id").notNull(),
  user2Id: integer("user2_id").notNull(),
  createdAt: timestamp("created_at").notNull(),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(),
  earnedAt: date("earned_at").notNull(),
  description: text("description").notNull(),
});

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(),
  requirement: integer("requirement").notNull(),
  xpReward: integer("xp_reward").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const challengeProgress = pgTable("challenge_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  challengeId: integer("challenge_id").notNull(),
  currentProgress: integer("current_progress").notNull().default(0),
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
});

export const sessionLogs = pgTable("session_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 for Sunday-Saturday
  hourOfDay: integer("hour_of_day").notNull(), // 0-23
});

// New insert schemas for friend-related tables
export const insertFriendRequestSchema = createInsertSchema(friendRequests).omit({
  id: true,
  status: true,
  respondedAt: true,
});

export const insertFriendshipSchema = createInsertSchema(friendships).omit({
  id: true,
});

// Update user schema to include new fields
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isAnonymous: true,
  showOnLeaderboard: true,
  status: true,
});

export const insertChallengeSchema = createInsertSchema(challenges);
export const insertChallengeProgressSchema = createInsertSchema(challengeProgress);

export const LEVEL_THRESHOLDS = {
  1: { xp: 0, title: "Goon Apprentice" },
  2: { xp: 50, title: "Goon Enthusiast" },
  3: { xp: 150, title: "Goon Expert" },
  4: { xp: 300, title: "Master Stroker" },
  5: { xp: 500, title: "Legendary Gooner" },
};

export const XP_REWARDS = {
  SESSION_COMPLETE: 15,
  STREAK_MILESTONE: 30,
  ACHIEVEMENT_EARNED: 25,
  CHALLENGE_COMPLETED: 50,
};

export const DAYS_OF_WEEK = [
  "Sunday", "Monday", "Tuesday", "Wednesday",
  "Thursday", "Friday", "Saturday"
];