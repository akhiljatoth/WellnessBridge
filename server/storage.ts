import { IStorage } from "./types";
import { User, InsertUser, Message, InsertMessage, Mood, InsertMood } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private messages: Map<number, Message>;
  private moods: Map<number, Mood>;
  sessionStore: session.Store;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.messages = new Map();
    this.moods = new Map();
    this.currentId = 1;
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
    const user: User = { ...insertUser, id, role: "employee" };
    this.users.set(id, user);
    return user;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentId++;
    const message: Message = {
      ...insertMessage,
      id,
      timestamp: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }

  async getMessagesByUserId(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (message) => message.userId === userId,
    ).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async createMood(insertMood: InsertMood): Promise<Mood> {
    const id = this.currentId++;
    const mood: Mood = {
      ...insertMood,
      id,
      timestamp: new Date(),
    };
    this.moods.set(id, mood);
    return mood;
  }

  async getMoodsByUserId(userId: number): Promise<Mood[]> {
    return Array.from(this.moods.values()).filter(
      (mood) => mood.userId === userId,
    ).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
}

export const storage = new MemStorage();
