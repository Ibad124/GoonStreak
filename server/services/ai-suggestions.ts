import OpenAI from "openai";
import { storage } from "../storage";
import type { User, AiSuggestion, InsertAiSuggestion } from "@shared/schema";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface UserContext {
  currentStreak: number;
  longestStreak: number;
  totalSessions: number;
  level: number;
  recentActivities: any[];
  achievements: any[];
}

export class AiSuggestionService {
  private async getUserContext(userId: number): Promise<UserContext> {
    const user = await storage.getUser(userId);
    if (!user) throw new Error("User not found");

    const achievements = await storage.getUserAchievements(userId);
    const recentActivities = []; // TODO: Implement activity fetching

    return {
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      totalSessions: user.totalSessions,
      level: user.level,
      recentActivities,
      achievements,
    };
  }

  private generatePrompt(context: UserContext): string {
    return `Generate a personalized growth suggestion for a user with the following context:
- Current streak: ${context.currentStreak} days
- Longest streak: ${context.longestStreak} days
- Total sessions: ${context.totalSessions}
- Level: ${context.level}
- Recent achievements: ${context.achievements.map(a => a.description).join(", ")}

Based on this data, provide a specific, actionable suggestion to help improve their consistency and growth.
The suggestion should be motivating and tailored to their current progress level.

Format the response as a direct message to the user, focusing on one key action they can take.`;
  }

  async generateSuggestion(userId: number): Promise<AiSuggestion> {
    const context = await this.getUserContext(userId);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a personal growth coach specializing in habit formation and consistency. Your suggestions should be specific, actionable, and encouraging.",
        },
        {
          role: "user",
          content: this.generatePrompt(context),
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const suggestion: InsertAiSuggestion = {
      userId,
      content: completion.choices[0].message.content || "Unable to generate suggestion",
      category: "habit",
      context: JSON.stringify(context),
      model: "gpt-4",
    };

    return storage.createAiSuggestion(suggestion);
  }

  async rateSuggestion(suggestionId: number, rating: number): Promise<AiSuggestion> {
    return storage.updateAiSuggestion(suggestionId, { rating });
  }

  async getUserSuggestions(userId: number): Promise<AiSuggestion[]> {
    return storage.getUserAiSuggestions(userId);
  }
}

export const aiSuggestionService = new AiSuggestionService();
