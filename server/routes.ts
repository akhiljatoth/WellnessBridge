import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertMessageSchema, insertMoodSchema, insertSocialMediaPostSchema } from "@shared/schema";
import { analyzeMoodPatterns } from "./ai-analysis";

// Mock sentiment analysis function (to be replaced with actual AI model)
function analyzeSentiment(text: string): { score: number; distressLevel: number; isUrgent: number } {
  const words = text.toLowerCase().split(' ');
  const negativeWords = ['sad', 'depressed', 'anxious', 'worried', 'stress', 'help', 'suicide', 'die'];

  let negativeCount = 0;
  words.forEach(word => {
    if (negativeWords.includes(word)) negativeCount++;
  });

  const score = Math.max(-100, Math.min(100, (1 - (negativeCount / words.length)) * 200 - 100));
  const distressLevel = Math.min(10, negativeCount * 2);
  const isUrgent = distressLevel >= 8 ? 1 : 0;

  return { score, distressLevel, isUrgent };
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Existing routes
  app.post("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const data = insertMessageSchema.parse({
      ...req.body,
      userId: req.user.id,
    });

    const message = await storage.createMessage(data);

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

  // New social media monitoring routes
  app.post("/api/social-media-posts", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const { content, platform, metadata } = req.body;
    const analysis = analyzeSentiment(content);

    const data = insertSocialMediaPostSchema.parse({
      userId: req.user.id,
      content,
      platform,
      metadata,
      sentimentScore: analysis.score,
      distressLevel: analysis.distressLevel,
      isUrgent: analysis.isUrgent,
    });

    const post = await storage.createSocialMediaPost(data);
    res.json(post);
  });

  app.get("/api/social-media-posts", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const posts = await storage.getSocialMediaPostsByUserId(req.user.id);
    res.json(posts);
  });

  app.get("/api/social-media-posts/urgent", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const posts = await storage.getUrgentSocialMediaPosts(req.user.id);
    res.json(posts);
  });

  app.get("/api/moods/analysis", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const moods = await storage.getMoodsByUserId(req.user.id);
      if (moods.length === 0) {
        return res.status(400).json({ message: "No mood data available for analysis" });
      }

      const analysis = await analyzeMoodPatterns(moods);
      res.json({ analysis });
    } catch (error) {
      console.error('Error generating mood analysis:', error);
      res.status(500).json({ message: "Failed to generate mood analysis" });
    }
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