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
  // 🍼 Newbie Levels (0-999 XP)
  1: { points: 0, title: "Baby Batter Beginner", emoji: "🍼" },
  2: { points: 100, title: "The Curious Clicker", emoji: "🍼" },
  3: { points: 250, title: "The Sock Explorer", emoji: "🍼" },
  4: { points: 500, title: "Palm Pilot Trainee", emoji: "🍼" },
  5: { points: 999, title: "Tissue Recruit", emoji: "🍼" },

  // 💦 Amateur Levels (1,000 - 4,999 XP)
  6: { points: 1000, title: "Grip Gladiator", emoji: "💦" },
  7: { points: 2500, title: "Lotion Apprentice", emoji: "💦" },
  8: { points: 3000, title: "Forearm Forge", emoji: "💦" },
  9: { points: 4000, title: "Sticky Strategist", emoji: "💦" },
  10: { points: 4999, title: "Goon Cadet", emoji: "💦" },

  // 🔥 Intermediate Levels (5,000 - 14,999 XP)
  11: { points: 5000, title: "The Fap Technician", emoji: "🔥" },
  12: { points: 7500, title: "Doomscroll Diddler", emoji: "🔥" },
  13: { points: 10000, title: "Edge Engineer", emoji: "🔥" },
  14: { points: 12500, title: "Wrist Wizard", emoji: "🔥" },
  15: { points: 14999, title: "Climax Connoisseur", emoji: "🔥" },

  // 🚀 Advanced Levels (15,000 - 49,999 XP)
  16: { points: 15000, title: "The Goo Alchemist", emoji: "🚀" },
  17: { points: 20000, title: "Stroke Samurai", emoji: "🚀" },
  18: { points: 30000, title: "Goon General", emoji: "🚀" },
  19: { points: 40000, title: "Nut Professor", emoji: "🚀" },
  20: { points: 49999, title: "The Chrono-Nutter", emoji: "🚀" },

  // 👑 Elite Levels (50,000 - 99,999 XP)
  21: { points: 50000, title: "Gooniverse Traveler", emoji: "👑" },
  22: { points: 60000, title: "Fapstronaut", emoji: "👑" },
  23: { points: 75000, title: "The Grip Reaper", emoji: "👑" },
  24: { points: 90000, title: "Master Baiter", emoji: "👑" },
  25: { points: 99999, title: "Eternal Edge Lord", emoji: "👑" },

  // 🌀 Legendary Levels (100,000+ XP)
  26: { points: 100000, title: "The Goonfather", emoji: "🌀" },
  27: { points: 150000, title: "Dopamine Demigod", emoji: "🌀" },
  28: { points: 250000, title: "Grand Goo-Master", emoji: "🌀" },
  29: { points: 500000, title: "The Cosmic Coomer", emoji: "🌀" },
  30: { points: 1000000, title: "Ascended Goon Deity", emoji: "🌀" },
} as const;

// XP Rewards Configuration
export const XP_REWARDS = {
  SESSION_COMPLETE: 15,
  STREAK_MILESTONE: 30,
  ACHIEVEMENT_EARNED: 25,
  CHALLENGE_COMPLETED: 50,
  ROOM_HOST: 10,
  ROOM_PARTICIPATION: 5,
};

// Character Styles Configuration
export const CHARACTER_STYLES = {
  solo: "default",
  competitive: "friendly",
  hardcore: "intense"
} as const;

// New tables for real-time features
export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  hostId: integer("host_id").notNull(),
  isPrivate: boolean("is_private").notNull().default(true),
  password: text("password"),
  maxParticipants: integer("max_participants").notNull().default(10),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  endedAt: timestamp("ended_at"),
  settings: text("settings").notNull(), // JSON string of room settings
});

export const roomParticipants = pgTable("room_participants", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull(),
  userId: integer("user_id").notNull(),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
  leftAt: timestamp("left_at"),
  role: text("role").notNull().default("participant"), // host, participant
  status: text("status").notNull().default("active"), // active, away, busy
});

export const roomMessages = pgTable("room_messages", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // text, emoji, gif, reaction, system
  content: text("content").notNull(),
  sentAt: timestamp("sent_at").notNull().defaultNow(),
});

// Schemas for WebSocket messages
export const roomEventSchema = z.object({
  type: z.enum([
    "JOIN_ROOM",
    "LEAVE_ROOM",
    "SEND_MESSAGE",
    "REACTION",
    "TIMER_START",
    "TIMER_STOP",
    "TIMER_SYNC",
    "STATUS_UPDATE",
  ]),
  roomId: z.number(),
  payload: z.any(),
  timestamp: z.date(),
});

// Extended schemas for room creation and management
export const createRoomSchema = createInsertSchema(rooms).extend({
  password: z.string().optional(),
  settings: z.object({
    allowVoice: z.boolean().default(false),
    allowReactions: z.boolean().default(true),
    timerDuration: z.number().optional(),
    isAnonymous: z.boolean().default(false),
    allowGifs: z.boolean().default(true),
  }),
});

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

// New table for AI suggestions
export const aiSuggestions = pgTable("ai_suggestions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(), // e.g., 'habit', 'motivation', 'productivity'
  createdAt: timestamp("created_at").notNull().defaultNow(),
  context: text("context").notNull(), // JSON string of data used to generate suggestion
  model: text("model").notNull(), // The AI model used
  rating: integer("rating"), // User rating of suggestion effectiveness
});

// Table for tracking user interaction with suggestions
export const suggestionInteractions = pgTable("suggestion_interactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  suggestionId: integer("suggestion_id").notNull(),
  interactionType: text("interaction_type").notNull(), // 'view', 'implement', 'dismiss'
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  feedback: text("feedback"), // Optional user feedback
});

// Table for tracking growth metrics
export const growthMetrics = pgTable("growth_metrics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  metricType: text("metric_type").notNull(), // e.g., 'focus_duration', 'consistency_score'
  value: integer("value").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  note: text("note"),
});

// New insert schemas
export const insertAiSuggestionSchema = createInsertSchema(aiSuggestions).omit({
  id: true,
  createdAt: true,
});

export const insertSuggestionInteractionSchema = createInsertSchema(suggestionInteractions).omit({
  id: true,
  timestamp: true,
});

export const insertGrowthMetricSchema = createInsertSchema(growthMetrics).omit({
  id: true,
  timestamp: true,
});

// Schemas and types
export const insertUserSchema = createInsertSchema(users);
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type CharacterStyle = keyof typeof CHARACTER_STYLES;
export type Room = typeof rooms.$inferSelect;
export type RoomParticipant = typeof roomParticipants.$inferSelect;
export type RoomMessage = typeof roomMessages.$inferSelect;
export type RoomEvent = z.infer<typeof roomEventSchema>;
export type CreateRoom = z.infer<typeof createRoomSchema>;

// Add new types
export type AiSuggestion = typeof aiSuggestions.$inferSelect;
export type InsertAiSuggestion = z.infer<typeof insertAiSuggestionSchema>;
export type SuggestionInteraction = typeof suggestionInteractions.$inferSelect;
export type InsertSuggestionInteraction = z.infer<typeof insertSuggestionInteractionSchema>;
export type GrowthMetric = typeof growthMetrics.$inferSelect;
export type InsertGrowthMetric = z.infer<typeof insertGrowthMetricSchema>;