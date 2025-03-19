import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  preferences: json("preferences").default({}),
  readingGoal: integer("reading_goal"),
  favoriteCategories: text("favorite_categories").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users)
  .pick({
    username: true,
    email: true,
    password: true,
    firstName: true,
    lastName: true,
  })
  .extend({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(12, "Password must be at most 12 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginData = z.infer<typeof loginSchema>;

export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  description: text("description"),
  coverUrl: text("cover_url"),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type").notNull(), // 'pdf' or 'epub'
  pages: integer("pages"),
  publishedYear: integer("published_year"),
  language: text("language"),
  category: text("category").array(),
  rating: integer("rating"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBookSchema = createInsertSchema(books).pick({
  title: true,
  author: true,
  description: true,
  coverUrl: true,
  fileUrl: true,
  fileType: true,
  pages: true,
  publishedYear: true,
  language: true,
  category: true,
  rating: true,
});

export type InsertBook = z.infer<typeof insertBookSchema>;
export type Book = typeof books.$inferSelect;

export const readingProgress = pgTable("reading_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  bookId: integer("book_id").notNull(),
  currentPage: integer("current_page").default(1),
  totalPages: integer("total_pages").notNull(),
  progress: integer("progress").default(0), // 0-100%
  lastReadAt: timestamp("last_read_at").defaultNow(),
  completed: boolean("completed").default(false),
  annotations: json("annotations").default({}).notNull(),
});

export const insertReadingProgressSchema = createInsertSchema(readingProgress).pick({
  userId: true,
  bookId: true,
  currentPage: true,
  totalPages: true,
  progress: true,
  lastReadAt: true,
  completed: true,
  annotations: true,
});

export type InsertReadingProgress = z.infer<typeof insertReadingProgressSchema>;
export type ReadingProgress = typeof readingProgress.$inferSelect;

export const bookmarks = pgTable("bookmarks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  bookId: integer("book_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBookmarkSchema = createInsertSchema(bookmarks).pick({
  userId: true,
  bookId: true,
});

export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;
export type Bookmark = typeof bookmarks.$inferSelect;

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  imageUrl: text("image_url"),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  imageUrl: true,
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;
