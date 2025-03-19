import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertBookSchema, 
  insertReadingProgressSchema,
  insertBookmarkSchema,
  ReadingProgress
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Books API routes
  app.get("/api/books", async (req, res) => {
    try {
      const category = req.query.category as string;
      const search = req.query.search as string;

      let books;
      if (category) {
        books = await storage.getBooksByCategory(category);
      } else if (search) {
        books = await storage.searchBooks(search);
      } else {
        books = await storage.getAllBooks();
      }
      
      res.json(books);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch books" });
    }
  });

  app.get("/api/books/:id", async (req, res) => {
    try {
      const bookId = parseInt(req.params.id);
      const book = await storage.getBook(bookId);
      
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      res.json(book);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch book" });
    }
  });

  app.post("/api/books", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const bookData = insertBookSchema.parse(req.body);
      const book = await storage.createBook(bookData);
      res.status(201).json(book);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create book" });
    }
  });

  // Reading Progress API routes
  app.get("/api/reading-progress", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const userId = req.user!.id;
      const progressList = await storage.getReadingProgressByUserId(userId);
      res.json(progressList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reading progress" });
    }
  });

  app.get("/api/reading-progress/:bookId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const userId = req.user!.id;
      const bookId = parseInt(req.params.bookId);
      
      const progress = await storage.getReadingProgress(userId, bookId);
      
      if (!progress) {
        // If no progress exists, create a new one with default values
        const book = await storage.getBook(bookId);
        
        if (!book) {
          return res.status(404).json({ message: "Book not found" });
        }
        
        const newProgress = await storage.createReadingProgress({
          userId,
          bookId,
          currentPage: 1,
          totalPages: book.pages || 100,
          progress: 0,
          lastReadAt: new Date(),
          completed: false,
          annotations: {}
        });
        
        return res.json(newProgress);
      }
      
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reading progress" });
    }
  });

  app.post("/api/reading-progress", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const userId = req.user!.id;
      const progressData = insertReadingProgressSchema.parse({
        ...req.body,
        userId
      });
      
      // Check if progress already exists
      const existingProgress = await storage.getReadingProgress(userId, progressData.bookId);
      
      let progress: ReadingProgress;
      if (existingProgress) {
        progress = await storage.updateReadingProgress(existingProgress.id, progressData);
      } else {
        progress = await storage.createReadingProgress(progressData);
      }
      
      res.status(201).json(progress);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to update reading progress" });

  // User Profile routes
  app.get("/api/profile", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const user = await storage.getUser(req.user!.id);
      const safeUser = { ...user };
      delete safeUser.password;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.put("/api/profile", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const userId = req.user!.id;
      const updatedUser = await storage.updateUser(userId, req.body);
      const safeUser = { ...updatedUser };
      delete safeUser.password;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

    }
  });

  // Bookmarks API routes
  app.get("/api/bookmarks", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const userId = req.user!.id;
      const bookmarks = await storage.getBookmarksByUserId(userId);
      res.json(bookmarks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookmarks" });
    }
  });

  app.post("/api/bookmarks", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const userId = req.user!.id;
      const bookmarkData = insertBookmarkSchema.parse({
        ...req.body,
        userId
      });
      
      // Check if bookmark already exists
      const existingBookmark = await storage.getBookmark(userId, bookmarkData.bookId);
      
      if (existingBookmark) {
        return res.status(400).json({ message: "Bookmark already exists" });
      }
      
      const bookmark = await storage.createBookmark(bookmarkData);
      res.status(201).json(bookmark);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create bookmark" });
    }
  });

  app.delete("/api/bookmarks/:bookId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const userId = req.user!.id;
      const bookId = parseInt(req.params.bookId);
      
      await storage.deleteBookmark(userId, bookId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete bookmark" });
    }
  });

  // Categories API routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Recommendations API route
  app.get("/api/recommendations", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const userId = req.user!.id;
      const recommendations = await storage.getRecommendedBooks(userId);
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
