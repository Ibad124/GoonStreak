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

// Level configuration - made more achievable
export const LEVEL_THRESHOLDS = {
  1: { xp: 0, title: "Goon Apprentice" },
  2: { xp: 50, title: "Goon Enthusiast" },
  3: { xp: 150, title: "Goon Expert" },
  4: { xp: 300, title: "Master Stroker" },
  5: { xp: 500, title: "Legendary Gooner" },
};

// XP rewards configuration - increased rewards
export const XP_REWARDS = {
  SESSION_COMPLETE: 15,  // Increased base XP
  STREAK_MILESTONE: 30,  // Bonus for hitting streak milestones
  ACHIEVEMENT_EARNED: 25,
};