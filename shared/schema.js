import { pgTable, text, serial, integer, boolean, date } from "drizzle-orm/pg-core";
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
  // Add XP system fields
  xpPoints: integer("xp_points").notNull().default(0),
  level: integer("level").notNull().default(1),
  title: text("title").notNull().default("Goon Apprentice"),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(),
  earnedAt: date("earned_at").notNull(),
  description: text("description").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isAnonymous: true,
  showOnLeaderboard: true,
});

// Level configuration
export const LEVEL_THRESHOLDS = {
  1: { xp: 0, title: "Goon Apprentice" },
  2: { xp: 100, title: "Goon Enthusiast" },
  3: { xp: 250, title: "Goon Expert" },
  4: { xp: 500, title: "Master Stroker" },
  5: { xp: 1000, title: "Legendary Gooner" },
};

// XP rewards configuration
export const XP_REWARDS = {
  SESSION_COMPLETE: 10,
  STREAK_MILESTONE: 50,
  ACHIEVEMENT_EARNED: 25,
};