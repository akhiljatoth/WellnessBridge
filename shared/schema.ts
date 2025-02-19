import { pgTable, text, serial, integer, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("employee"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const socialMediaPosts = pgTable("social_media_posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  platform: text("platform").notNull(), // e.g., "twitter", "facebook"
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  sentimentScore: integer("sentiment_score").notNull(), // -100 to 100
  distressLevel: integer("distress_level").notNull(), // 0 to 10
  metadata: json("metadata"), // Additional platform-specific data
  isUrgent: integer("is_urgent").notNull().default(0),
});

export const insertSocialMediaPostSchema = createInsertSchema(socialMediaPosts).pick({
  userId: true,
  content: true,
  platform: true,
  sentimentScore: true,
  distressLevel: true,
  metadata: true,
  isUrgent: true,
});

export type InsertSocialMediaPost = z.infer<typeof insertSocialMediaPostSchema>;
export type SocialMediaPost = typeof socialMediaPosts.$inferSelect;

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  isBot: integer("is_bot").notNull(),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  userId: true,
  content: true,
  isBot: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export const moods = pgTable("moods", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  score: integer("score").notNull(),
  note: text("note"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertMoodSchema = createInsertSchema(moods).pick({
  userId: true,
  score: true,
  note: true,
});

export type InsertMood = z.infer<typeof insertMoodSchema>;
export type Mood = typeof moods.$inferSelect;