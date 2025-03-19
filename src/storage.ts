import { 
  User, InsertUser, 
  Book, InsertBook, 
  ReadingProgress, InsertReadingProgress,
  Bookmark, InsertBookmark,
  Category, InsertCategory
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Define all the operations we need to support
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Book operations
  getAllBooks(): Promise<Book[]>;
  getBook(id: number): Promise<Book | undefined>;
  getBooksByCategory(category: string): Promise<Book[]>;
  searchBooks(query: string): Promise<Book[]>;
  createBook(book: InsertBook): Promise<Book>;
  
  // Reading progress operations
  getReadingProgressByUserId(userId: number): Promise<ReadingProgress[]>;
  getReadingProgress(userId: number, bookId: number): Promise<ReadingProgress | undefined>;
  createReadingProgress(progress: InsertReadingProgress): Promise<ReadingProgress>;
  updateReadingProgress(id: number, progress: Partial<InsertReadingProgress>): Promise<ReadingProgress>;
  
  // Bookmark operations
  getBookmarksByUserId(userId: number): Promise<(Bookmark & { book: Book })[]>;
  getBookmark(userId: number, bookId: number): Promise<Bookmark | undefined>;
  createBookmark(bookmark: InsertBookmark): Promise<Bookmark>;
  deleteBookmark(userId: number, bookId: number): Promise<void>;
  
  // Category operations
  getAllCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Recommendation operations
  getRecommendedBooks(userId: number): Promise<Book[]>;
  
  // Session store
  sessionStore: session.SessionStore;
}

// Free open-source books data for initial population
const openLibraryBooks: InsertBook[] = [
  // Science Fiction & Fantasy
  {
    title: "Dune",
    author: "Frank Herbert",
    description: "A science fiction masterpiece about politics, religion and power on a desert planet.",
    coverUrl: "https://www.gutenberg.org/cache/epub/64319/pg64319.cover.medium.jpg",
    fileUrl: "/books/dune.epub",
    fileType: "epub",
    pages: 412,
    publishedYear: 1965,
    language: "English",
    category: ["Science Fiction", "Fantasy"],
    rating: 5
  },
  {
    title: "The Time Machine",
    author: "H.G. Wells",
    description: "The story of an inventor who builds a machine that can transport him through time.",
    coverUrl: "https://www.gutenberg.org/cache/epub/35/pg35.cover.medium.jpg",
    fileUrl: "https://www.gutenberg.org/ebooks/35.epub.images",
    fileType: "epub",
    pages: 118,
    publishedYear: 1895,
    language: "English",
    category: ["Science Fiction", "Classic"],
    rating: 4
  },
  // Mystery & Thriller
  {
    title: "The Adventures of Sherlock Holmes",
    author: "Arthur Conan Doyle",
    description: "A collection of twelve short stories featuring Sherlock Holmes.",
    coverUrl: "https://www.gutenberg.org/cache/epub/1661/pg1661.cover.medium.jpg",
    fileUrl: "https://www.gutenberg.org/ebooks/1661.epub.images",
    fileType: "epub",
    pages: 307,
    publishedYear: 1892,
    language: "English",
    category: ["Mystery", "Classic"],
    rating: 5
  },
  // Philosophy & Self-Help
  {
    title: "Meditations",
    author: "Marcus Aurelius",
    description: "Personal writings of the Roman Emperor Marcus Aurelius on Stoic philosophy.",
    coverUrl: "https://www.gutenberg.org/cache/epub/2680/pg2680.cover.medium.jpg",
    fileUrl: "https://www.gutenberg.org/ebooks/2680.epub.images",
    fileType: "epub",
    pages: 112,
    publishedYear: 180,
    language: "English",
    category: ["Philosophy", "Self-Help"],
    rating: 5
  },
  // Poetry
  {
    title: "Leaves of Grass",
    author: "Walt Whitman",
    description: "A collection of poetry that celebrates nature, humanity and the American experience.",
    coverUrl: "https://www.gutenberg.org/cache/epub/1322/pg1322.cover.medium.jpg",
    fileUrl: "https://www.gutenberg.org/ebooks/1322.epub.images",
    fileType: "epub",
    pages: 384,
    publishedYear: 1855,
    language: "English",
    category: ["Poetry", "Classic"],
    rating: 4
  },
  // Trending Books
  {
    title: "Project Hail Mary",
    author: "Andy Weir",
    description: "A lone astronaut must save humanity from extinction in this thrilling science fiction adventure.",
    coverUrl: "https://covers.openlibrary.org/b/id/10437206-L.jpg",
    fileUrl: "/books/project-hail-mary.pdf",
    fileType: "pdf",
    pages: 496,
    publishedYear: 2021,
    language: "English",
    category: ["Science Fiction", "Trending"],
    rating: 5
  },
  {
    title: "The Midnight Library",
    author: "Matt Haig",
    description: "Between life and death there is a library that contains infinite possibilities.",
    coverUrl: "https://covers.openlibrary.org/b/id/10388872-L.jpg",
    fileUrl: "/books/midnight-library.pdf",
    fileType: "pdf",
    pages: 304,
    publishedYear: 2020,
    language: "English",
    category: ["Fiction", "Fantasy", "Trending"],
    rating: 4
  },
  // Classic Literature
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    description: "Pride and Prejudice is a romantic novel by Jane Austen, published in 1813. The story follows the main character Elizabeth Bennet as she deals with issues of manners, upbringing, morality, education, and marriage in the society of the landed gentry of early 19th-century England.",
    coverUrl: "https://www.gutenberg.org/cache/epub/1342/pg1342.cover.medium.jpg",
    fileUrl: "https://www.gutenberg.org/files/1342/1342-pdf.pdf",
    fileType: "pdf",
    pages: 279,
    publishedYear: 1813,
    language: "English",
    category: ["Classic", "Romance"],
    rating: 4
  },
  {
    title: "Frankenstein",
    author: "Mary Shelley",
    description: "Frankenstein; or, The Modern Prometheus is a novel written by English author Mary Shelley that tells the story of Victor Frankenstein, a young scientist who creates a hideous sapient creature in an unorthodox scientific experiment.",
    coverUrl: "https://www.gutenberg.org/cache/epub/84/pg84.cover.medium.jpg",
    fileUrl: "https://www.gutenberg.org/files/84/84-pdf.pdf",
    fileType: "pdf",
    pages: 223,
    publishedYear: 1818,
    language: "English",
    category: ["Gothic", "Science Fiction"],
    rating: 4
  },
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    description: "The Great Gatsby is a 1925 novel by American writer F. Scott Fitzgerald. Set in the Jazz Age on Long Island, the novel depicts narrator Nick Carraway's interactions with mysterious millionaire Jay Gatsby and Gatsby's obsession to reunite with his former lover, Daisy Buchanan.",
    coverUrl: "https://www.gutenberg.org/cache/epub/64317/pg64317.cover.medium.jpg",
    fileUrl: "https://www.gutenberg.org/files/64317/64317-pdf.pdf",
    fileType: "pdf",
    pages: 193,
    publishedYear: 1925,
    language: "English",
    category: ["Classic", "Literary Fiction"],
    rating: 5
  },
  {
    title: "Moby Dick",
    author: "Herman Melville",
    description: "Moby-Dick; or, The Whale is an 1851 novel by American writer Herman Melville. The book is the sailor Ishmael's narrative of the obsessive quest of Ahab, captain of the whaling ship Pequod, for revenge on Moby Dick, the giant white sperm whale that on the ship's previous voyage bit off Ahab's leg at the knee.",
    coverUrl: "https://www.gutenberg.org/cache/epub/2701/pg2701.cover.medium.jpg",
    fileUrl: "https://www.gutenberg.org/files/2701/2701-pdf.pdf",
    fileType: "pdf",
    pages: 635,
    publishedYear: 1851,
    language: "English",
    category: ["Classic", "Adventure"],
    rating: 4
  },
  {
    title: "War and Peace",
    author: "Leo Tolstoy",
    description: "War and Peace is a novel by the Russian author Leo Tolstoy, first published serially, then published in its entirety in 1869. It is regarded as one of Tolstoy's finest literary achievements and remains a classic of world literature.",
    coverUrl: "https://www.gutenberg.org/cache/epub/2600/pg2600.cover.medium.jpg",
    fileUrl: "https://www.gutenberg.org/files/2600/2600-h/2600-h.htm",
    fileType: "epub",
    pages: 1225,
    publishedYear: 1869,
    language: "English",
    category: ["Classic", "Historical Fiction"],
    rating: 5
  },
  {
    title: "Jane Eyre",
    author: "Charlotte Brontë",
    description: "Jane Eyre is a novel by English writer Charlotte Brontë, published under the pen name \"Currer Bell\", on 16 October 1847. Jane Eyre follows the experiences of its eponymous heroine, including her growth to adulthood and her love for Mr. Rochester, the brooding master of Thornfield Hall.",
    coverUrl: "https://www.gutenberg.org/cache/epub/1260/pg1260.cover.medium.jpg",
    fileUrl: "https://www.gutenberg.org/files/1260/1260-h/1260-h.htm",
    fileType: "epub",
    pages: 426,
    publishedYear: 1847,
    language: "English",
    category: ["Classic", "Gothic", "Romance"],
    rating: 4
  },
  {
    title: "The Odyssey",
    author: "Homer",
    description: "The Odyssey is one of two major ancient Greek epic poems attributed to Homer. It is, in part, a sequel to the Iliad, the other Homeric epic. The Odyssey is a fundamental work in the modern Western canon, being the oldest extant piece of Western literature, second to the Iliad.",
    coverUrl: "https://www.gutenberg.org/cache/epub/1727/pg1727.cover.medium.jpg",
    fileUrl: "https://www.gutenberg.org/files/1727/1727-h/1727-h.htm",
    fileType: "epub",
    pages: 324,
    publishedYear: -800,
    language: "English",
    category: ["Classic", "Epic Poetry"],
    rating: 5
  },
  {
    title: "Dracula",
    author: "Bram Stoker",
    description: "Dracula is an 1897 Gothic horror novel by Irish author Bram Stoker. It introduced the character of Count Dracula and established many conventions of subsequent vampire fantasy.",
    coverUrl: "https://www.gutenberg.org/cache/epub/345/pg345.cover.medium.jpg",
    fileUrl: "https://www.gutenberg.org/files/345/345-h/345-h.htm",
    fileType: "epub",
    pages: 418,
    publishedYear: 1897,
    language: "English",
    category: ["Classic", "Gothic", "Horror"],
    rating: 4
  },
  {
    title: "The Picture of Dorian Gray",
    author: "Oscar Wilde",
    description: "The Picture of Dorian Gray is a Gothic and philosophical novel by Oscar Wilde, first published complete in the July 1890 issue of Lippincott's Monthly Magazine.",
    coverUrl: "https://www.gutenberg.org/cache/epub/174/pg174.cover.medium.jpg",
    fileUrl: "https://www.gutenberg.org/files/174/174-h/174-h.htm",
    fileType: "epub",
    pages: 272,
    publishedYear: 1890,
    language: "English",
    category: ["Classic", "Gothic", "Philosophical"],
    rating: 4
  },
  {
    title: "A Tale of Two Cities",
    author: "Charles Dickens",
    description: "A Tale of Two Cities is an 1859 historical novel by Charles Dickens, set in London and Paris before and during the French Revolution.",
    coverUrl: "https://www.gutenberg.org/cache/epub/98/pg98.cover.medium.jpg",
    fileUrl: "https://www.gutenberg.org/files/98/98-h/98-h.htm",
    fileType: "epub",
    pages: 341,
    publishedYear: 1859,
    language: "English",
    category: ["Classic", "Historical Fiction"],
    rating: 4
  },
  {
    title: "The Art of War",
    author: "Sun Tzu",
    description: "The Art of War is an ancient Chinese military treatise dating from the Late Spring and Autumn Period. The work, which is attributed to the ancient Chinese military strategist Sun Tzu, is composed of 13 chapters.",
    coverUrl: "https://www.gutenberg.org/cache/epub/132/pg132.cover.medium.jpg",
    fileUrl: "https://www.gutenberg.org/files/132/132-h/132-h.htm",
    fileType: "epub",
    pages: 62,
    publishedYear: -500,
    language: "English",
    category: ["Philosophy", "Strategy"],
    rating: 5
  },
  {
    title: "Don Quixote",
    author: "Miguel de Cervantes",
    description: "Don Quixote is a Spanish novel by Miguel de Cervantes. Published in two parts, in 1605 and 1615, Don Quixote is the most influential work of literature from the Spanish Golden Age and the entire Spanish literary canon.",
    coverUrl: "https://www.gutenberg.org/cache/epub/996/pg996.cover.medium.jpg",
    fileUrl: "https://www.gutenberg.org/files/996/996-h/996-h.htm",
    fileType: "epub",
    pages: 863,
    publishedYear: 1605,
    language: "English",
    category: ["Classic", "Satire"],
    rating: 4
  }
];

// Categories data
const sampleCategories: InsertCategory[] = [
  {
    name: "Science Fiction",
    imageUrl: "https://images.unsplash.com/photo-1501862700950-18382cd41497?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
  },
  {
    name: "Classic",
    imageUrl: "https://images.unsplash.com/photo-1528459199957-0ff28496a7f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
  },
  {
    name: "Romance",
    imageUrl: "https://images.unsplash.com/photo-1474552226712-ac0f0961a954?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
  },
  {
    name: "Philosophy",
    imageUrl: "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
  },
  {
    name: "History",
    imageUrl: "https://images.unsplash.com/photo-1461360228754-6e81c478b882?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
  },
  {
    name: "Gothic",
    imageUrl: "https://images.unsplash.com/photo-1631455779068-7daa0514e6c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
  }
];

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private books: Map<number, Book>;
  private readingProgress: Map<number, ReadingProgress>;
  private bookmarks: Map<number, Bookmark>;
  private categories: Map<number, Category>;
  
  private userIdCounter: number;
  private bookIdCounter: number;
  private progressIdCounter: number;
  private bookmarkIdCounter: number;
  private categoryIdCounter: number;
  
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.books = new Map();
    this.readingProgress = new Map();
    this.bookmarks = new Map();
    this.categories = new Map();
    
    this.userIdCounter = 1;
    this.bookIdCounter = 1;
    this.progressIdCounter = 1;
    this.bookmarkIdCounter = 1;
    this.categoryIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 1 day
    });
    
    // Initialize with sample data
    this.initSampleData();
  }

  private async initSampleData() {
    // Add sample books
    for (const bookData of openLibraryBooks) {
      await this.createBook(bookData);
    }
    
    // Add sample categories
    for (const categoryData of sampleCategories) {
      await this.createCategory(categoryData);
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email && user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = {
      id,
      ...userData,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  // Book operations
  async getAllBooks(): Promise<Book[]> {
    return Array.from(this.books.values());
  }

  async getBook(id: number): Promise<Book | undefined> {
    return this.books.get(id);
  }

  async getBooksByCategory(category: string): Promise<Book[]> {
    return Array.from(this.books.values()).filter(book => 
      book.category && book.category.some(cat => 
        cat.toLowerCase() === category.toLowerCase()
      )
    );
  }

  async searchBooks(query: string): Promise<Book[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.books.values()).filter(book => 
      book.title.toLowerCase().includes(lowerQuery) || 
      book.author.toLowerCase().includes(lowerQuery) ||
      (book.description && book.description.toLowerCase().includes(lowerQuery))
    );
  }

  async createBook(bookData: InsertBook): Promise<Book> {
    const id = this.bookIdCounter++;
    const book: Book = {
      id,
      ...bookData,
      createdAt: new Date()
    };
    this.books.set(id, book);
    return book;
  }

  // Reading progress operations
  async getReadingProgressByUserId(userId: number): Promise<ReadingProgress[]> {
    return Array.from(this.readingProgress.values()).filter(
      progress => progress.userId === userId
    );
  }

  async getReadingProgress(userId: number, bookId: number): Promise<ReadingProgress | undefined> {
    return Array.from(this.readingProgress.values()).find(
      progress => progress.userId === userId && progress.bookId === bookId
    );
  }

  async createReadingProgress(progressData: InsertReadingProgress): Promise<ReadingProgress> {
    const id = this.progressIdCounter++;
    const progress: ReadingProgress = {
      id,
      ...progressData,
    };
    this.readingProgress.set(id, progress);
    return progress;
  }

  async updateReadingProgress(id: number, progressData: Partial<InsertReadingProgress>): Promise<ReadingProgress> {
    const existingProgress = this.readingProgress.get(id);
    if (!existingProgress) {
      throw new Error("Reading progress not found");
    }
    
    const updatedProgress: ReadingProgress = {
      ...existingProgress,
      ...progressData,
      lastReadAt: new Date()
    };
    
    this.readingProgress.set(id, updatedProgress);
    return updatedProgress;
  }

  // Bookmark operations
  async getBookmarksByUserId(userId: number): Promise<(Bookmark & { book: Book })[]> {
    const bookmarks = Array.from(this.bookmarks.values()).filter(
      bookmark => bookmark.userId === userId
    );
    
    return bookmarks.map(bookmark => {
      const book = this.books.get(bookmark.bookId);
      if (!book) {
        throw new Error(`Book with id ${bookmark.bookId} not found`);
      }
      return { ...bookmark, book };
    });
  }

  async getBookmark(userId: number, bookId: number): Promise<Bookmark | undefined> {
    return Array.from(this.bookmarks.values()).find(
      bookmark => bookmark.userId === userId && bookmark.bookId === bookId
    );
  }

  async createBookmark(bookmarkData: InsertBookmark): Promise<Bookmark> {
    const id = this.bookmarkIdCounter++;
    const bookmark: Bookmark = {
      id,
      ...bookmarkData,
      createdAt: new Date()
    };
    this.bookmarks.set(id, bookmark);
    return bookmark;
  }

  async deleteBookmark(userId: number, bookId: number): Promise<void> {
    const bookmark = await this.getBookmark(userId, bookId);
    if (bookmark) {
      this.bookmarks.delete(bookmark.id);
    }
  }

  // Category operations
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    const category: Category = {
      id,
      ...categoryData
    };
    this.categories.set(id, category);
    return category;
  }

  // Recommendation operations
  async getRecommendedBooks(userId: number): Promise<Book[]> {
    // Get user's reading progress and bookmarks
    const userProgress = await this.getReadingProgressByUserId(userId);
    const userBookmarks = await this.getBookmarksByUserId(userId);
    
    // Combine books from progress and bookmarks to analyze preferences
    const interactedBooks = new Set([
      ...userProgress.map(p => p.bookId),
      ...userBookmarks.map(b => b.bookId)
    ]);
    
    if (interactedBooks.size === 0) {
      // If no interaction history, return trending books
      const allBooks = Array.from(this.books.values());
      const trendingBooks = allBooks.filter(book => book.rating >= 4);
      return this.getRandomBooks(trendingBooks, 5);
    }
    
    // Get categories from books the user has read
    const readCategories = new Map<string, number>();
    
    for (const progress of userProgress) {
      const book = this.books.get(progress.bookId);
      if (book && book.category) {
        for (const category of book.category) {
          const count = readCategories.get(category) || 0;
          readCategories.set(category, count + 1);
        }
      }
    }
    
    // Sort categories by frequency
    const sortedCategories = Array.from(readCategories.entries())
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);
    
    // Get books from the most read categories that the user hasn't read yet
    const readBookIds = new Set(userProgress.map(progress => progress.bookId));
    let recommendedBooks: Book[] = [];
    
    for (const category of sortedCategories) {
      const books = await this.getBooksByCategory(category);
      const unreadBooks = books.filter(book => !readBookIds.has(book.id));
      
      if (unreadBooks.length > 0) {
        recommendedBooks = recommendedBooks.concat(unreadBooks);
      }
      
      if (recommendedBooks.length >= 5) {
        break;
      }
    }
    
    // If we still don't have enough recommendations, add random books
    if (recommendedBooks.length < 5) {
      const allBooks = Array.from(this.books.values());
      const unreadBooks = allBooks.filter(book => !readBookIds.has(book.id));
      
      const additionalBooks = this.getRandomBooks(
        unreadBooks,
        5 - recommendedBooks.length
      );
      
      recommendedBooks = recommendedBooks.concat(additionalBooks);
    }
    
    return recommendedBooks;
  }

  private getRandomBooks(books: Book[], count: number): Book[] {
    const shuffled = [...books].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
}

export const storage = new MemStorage();
