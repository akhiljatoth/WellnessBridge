import { User, InsertUser, Message, InsertMessage, Mood, InsertMood } from "@shared/schema";
import type { Store } from "express-session";

export interface IStorage {
  sessionStore: Store;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByUserId(userId: number): Promise<Message[]>;
  createMood(mood: InsertMood): Promise<Mood>;
  getMoodsByUserId(userId: number): Promise<Mood[]>;
}
