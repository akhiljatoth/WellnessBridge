import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertMessageSchema, insertMoodSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.post("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const data = insertMessageSchema.parse({
      ...req.body,
      userId: req.user.id,
    });
    
    const message = await storage.createMessage(data);
    
    // Mock bot response
    if (!data.isBot) {
      const botResponse = await storage.createMessage({
        userId: req.user.id,
        content: getMockBotResponse(data.content),
        isBot: 1,
      });
    }
    
    res.json(message);
  });

  app.get("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const messages = await storage.getMessagesByUserId(req.user.id);
    res.json(messages);
  });

  app.post("/api/moods", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const data = insertMoodSchema.parse({
      ...req.body,
      userId: req.user.id,
    });
    
    const mood = await storage.createMood(data);
    res.json(mood);
  });

  app.get("/api/moods", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const moods = await storage.getMoodsByUserId(req.user.id);
    res.json(moods);
  });

  const httpServer = createServer(app);
  return httpServer;
}

function getMockBotResponse(message: string): string {
  const responses = [
    "I understand how you're feeling. Would you like to talk more about that?",
    "That sounds challenging. How can I help support you?",
    "Thank you for sharing. What coping strategies have worked for you in the past?",
    "I'm here to listen. Would you like to explore this further?",
    "Your feelings are valid. How can we work through this together?"
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}
