var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express from "express";
import session from "express-session";
import passport from "passport";
import path from "path";
import { fileURLToPath } from "url";
import { WebSocketServer } from "ws";
import { createServer } from "http";

// server/routes/auth.ts
import { Router } from "express";

// server/services/authService.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// server/db.ts
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  books: () => books,
  booksRelations: () => booksRelations,
  reviews: () => reviews,
  reviewsRelations: () => reviewsRelations,
  userBooks: () => userBooks,
  userBooksRelations: () => userBooksRelations,
  userMemberships: () => userMemberships,
  users: () => users,
  usersRelations: () => usersRelations
});
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
var users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  createdAt: integer("created_at"),
  updatedAt: integer("updated_at")
});
var books = sqliteTable("books", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  author: text("author").notNull(),
  isbn: text("isbn").unique(),
  description: text("description"),
  coverImage: text("cover_image"),
  publishedDate: integer("published_date"),
  genre: text("genre"),
  pageCount: integer("page_count"),
  rating: integer("rating"),
  createdAt: integer("created_at"),
  updatedAt: integer("updated_at")
});
var userBooks = sqliteTable("user_books", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).notNull(),
  bookId: text("book_id").notNull(),
  // Google Books ID (string)
  title: text("title"),
  author: text("author"),
  coverImage: text("cover_image"),
  isbn: text("isbn"),
  status: text("status").notNull().default("want_to_read"),
  // want_to_read, reading, completed
  rating: integer("rating"),
  notes: text("notes"),
  createdAt: integer("created_at"),
  updatedAt: integer("updated_at")
});
var reviews = sqliteTable("reviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).notNull(),
  bookId: integer("book_id").references(() => books.id).notNull(),
  rating: integer("rating").notNull(),
  review: text("review"),
  createdAt: integer("created_at"),
  updatedAt: integer("updated_at")
});
var userMemberships = sqliteTable("user_memberships", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).notNull(),
  service: text("service").notNull(),
  // audible, kindle, library, etc.
  membershipType: text("membership_type").notNull(),
  // plus, premium, basic, etc.
  price: text("price"),
  // monthly cost
  status: text("status").notNull().default("active"),
  // active, cancelled, expired
  startDate: integer("start_date"),
  endDate: integer("end_date"),
  notes: text("notes"),
  createdAt: integer("created_at"),
  updatedAt: integer("updated_at")
});
var usersRelations = relations(users, ({ many }) => ({
  userBooks: many(userBooks),
  reviews: many(reviews),
  memberships: many(userMemberships)
}));
var booksRelations = relations(books, ({ many }) => ({
  userBooks: many(userBooks),
  reviews: many(reviews)
}));
var userBooksRelations = relations(userBooks, ({ one }) => ({
  user: one(users, {
    fields: [userBooks.userId],
    references: [users.id]
  }),
  book: one(books, {
    fields: [userBooks.bookId],
    references: [books.id]
  })
}));
var reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id]
  }),
  book: one(books, {
    fields: [reviews.bookId],
    references: [books.id]
  })
}));

// server/db.ts
var sqlite = new Database("./data/book_finder.db");
var db = drizzle(sqlite, { schema: schema_exports });

// server/services/authService.ts
import { eq } from "drizzle-orm";
var JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
var AuthService = class {
  async registerUser(userData) {
    const existingUser = await db.select().from(users).where(eq(users.email, userData.email));
    if (existingUser.length > 0) {
      throw new Error("User with this email already exists");
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
    const now = Date.now();
    const newUser = await db.insert(users).values({
      email: userData.email,
      password: hashedPassword,
      name: userData.name,
      createdAt: now,
      updatedAt: now
    }).returning();
    return {
      id: newUser[0].id,
      email: newUser[0].email,
      name: newUser[0].name,
      createdAt: newUser[0].createdAt || now
    };
  }
  async loginUser(loginData) {
    const user = await db.select().from(users).where(eq(users.email, loginData.email));
    if (user.length === 0) {
      throw new Error("Invalid email or password");
    }
    const foundUser = user[0];
    const isValidPassword = await bcrypt.compare(loginData.password, foundUser.password);
    if (!isValidPassword) {
      throw new Error("Invalid email or password");
    }
    const token = jwt.sign(
      { userId: foundUser.id, email: foundUser.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    return {
      user: {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        createdAt: foundUser.createdAt || 0
      },
      token
    };
  }
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await db.select().from(users).where(eq(users.id, decoded.userId));
      if (user.length === 0) {
        throw new Error("User not found");
      }
      const foundUser = user[0];
      return {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        createdAt: foundUser.createdAt || 0
      };
    } catch (error) {
      throw new Error("Invalid token");
    }
  }
  async getUserById(userId) {
    const user = await db.select().from(users).where(eq(users.id, userId));
    if (user.length === 0) {
      return null;
    }
    const foundUser = user[0];
    return {
      id: foundUser.id,
      email: foundUser.email,
      name: foundUser.name,
      createdAt: foundUser.createdAt || 0
    };
  }
};

// server/routes/auth.ts
var router = Router();
var authService = new AuthService();
var authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }
  try {
    const user = await authService.verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid token" });
  }
};
router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Email, password, and name are required" });
    }
    const user = await authService.registerUser({ email, password, name });
    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const result = await authService.loginUser({ email, password });
    res.json({ message: "Login successful", ...result });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await authService.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.post("/logout", (req, res) => {
  res.json({ message: "Logout successful" });
});
var auth_default = router;

// server/routes/books.ts
import { Router as Router2 } from "express";

// server/services/bookService.ts
var BookService = class {
  baseUrl = "https://www.googleapis.com/books/v1";
  async searchBooks(query, filters = {}) {
    try {
      const params = new URLSearchParams({
        q: query,
        maxResults: (filters.maxResults || 20).toString(),
        ...filters.orderBy && { orderBy: filters.orderBy },
        ...filters.printType && filters.printType !== "all" && { printType: filters.printType },
        ...filters.language && { langRestrict: filters.language.toLowerCase() }
      });
      if (filters.genre) {
        params.set("q", `${query} subject:${filters.genre}`);
      }
      if (filters.yearFrom || filters.yearTo) {
        let yearQuery = "";
        if (filters.yearFrom && filters.yearTo) {
          yearQuery = `after:${filters.yearFrom} before:${filters.yearTo}`;
        } else if (filters.yearFrom) {
          yearQuery = `after:${filters.yearFrom}`;
        } else if (filters.yearTo) {
          yearQuery = `before:${filters.yearTo}`;
        }
        params.set("q", `${params.get("q")} ${yearQuery}`);
      }
      const response = await fetch(`${this.baseUrl}/volumes?${params}`);
      if (!response.ok) {
        console.warn(`Google Books API returned ${response.status} for query: ${query}`);
        return [];
      }
      const data = await response.json();
      if (!data.items) {
        return [];
      }
      let books2 = data.items.map(this.mapGoogleBookToBook);
      if (filters.pageCountMin || filters.pageCountMax) {
        books2 = books2.filter((book) => {
          if (!book.pageCount) return false;
          if (filters.pageCountMin && book.pageCount < filters.pageCountMin) return false;
          if (filters.pageCountMax && book.pageCount > filters.pageCountMax) return false;
          return true;
        });
      }
      if (filters.rating) {
        books2 = books2.filter((book) => book.rating && book.rating >= filters.rating);
      }
      return books2;
    } catch (error) {
      console.error("Error searching books:", error);
      return [];
    }
  }
  async getBookById(id) {
    try {
      const response = await fetch(`${this.baseUrl}/volumes/${id}`);
      if (!response.ok) {
        console.warn(`Google Books API returned ${response.status} for book ID: ${id}`);
        return null;
      }
      const data = await response.json();
      return this.mapGoogleBookToBook(data);
    } catch (error) {
      console.error("Error fetching book:", error);
      return null;
    }
  }
  async getTopSellingBooks(limit = 6) {
    try {
      const popularQueries = [
        "bestseller fiction",
        "new york times bestseller",
        "popular books 2024"
      ];
      const allBooks = [];
      for (const query of popularQueries) {
        try {
          const response = await fetch(
            `${this.baseUrl}/volumes?q=${encodeURIComponent(query)}&maxResults=${Math.ceil(limit / 2)}&orderBy=relevance`
          );
          if (response.ok) {
            const data = await response.json();
            if (data.items) {
              allBooks.push(...data.items.map(this.mapGoogleBookToBook));
            }
          }
        } catch (queryError) {
          console.warn(`Failed to fetch query "${query}":`, queryError);
          continue;
        }
      }
      const uniqueBooks = allBooks.filter(
        (book, index, self) => index === self.findIndex((b) => b.id === book.id)
      );
      if (uniqueBooks.length > 0) {
        return uniqueBooks.slice(0, limit);
      }
      console.log("Using fallback data for top selling books");
      return this.getMockTopSellingBooks(limit);
    } catch (error) {
      console.error("Error fetching top selling books:", error);
      return this.getMockTopSellingBooks(limit);
    }
  }
  async getPersonalRecommendations(userId, limit = 6) {
    try {
      const response = await fetch(
        `${this.baseUrl}/volumes?q=subject:fiction&maxResults=${limit}&orderBy=relevance`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.items) {
          return data.items.map(this.mapGoogleBookToBook);
        }
      }
      console.log("Using fallback data for personal recommendations");
      return this.getMockPersonalRecommendations(limit);
    } catch (error) {
      console.error("Error fetching personal recommendations:", error);
      return this.getMockPersonalRecommendations(limit);
    }
  }
  getMockTopSellingBooks(limit) {
    const mockBooks = [
      {
        id: "mock-1",
        title: "The Midnight Library",
        author: "Matt Haig",
        description: "Between life and death there is a library, and within that library, the shelves go on forever.",
        coverImage: "https://books.google.com/books/content?id=QxJ-DwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        publishedDate: "2020-08-13",
        pageCount: 288,
        genre: "Fiction",
        rating: 4.2,
        isbn: "9780525559474"
      },
      {
        id: "mock-2",
        title: "Project Hail Mary",
        author: "Andy Weir",
        description: "Ryland Grace is the sole survivor on a desperate, last-chance mission\u2014and if he fails, humanity and the Earth itself will perish.",
        coverImage: "https://books.google.com/books/content?id=QxJ-DwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        publishedDate: "2021-05-04",
        pageCount: 496,
        genre: "Science Fiction",
        rating: 4.5,
        isbn: "9780593135204"
      },
      {
        id: "mock-3",
        title: "Klara and the Sun",
        author: "Kazuo Ishiguro",
        description: "From the bestselling author of Never Let Me Go and The Remains of the Day, a stunning new novel.",
        coverImage: "https://books.google.com/books/content?id=QxJ-DwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        publishedDate: "2021-03-02",
        pageCount: 320,
        genre: "Fiction",
        rating: 4.1,
        isbn: "9780593318171"
      },
      {
        id: "mock-4",
        title: "The Four Winds",
        author: "Kristin Hannah",
        description: "From the number-one bestselling author of The Nightingale and The Great Alone comes a powerful American epic about love and heroism.",
        coverImage: "https://books.google.com/books/content?id=QxJ-DwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        publishedDate: "2021-02-02",
        pageCount: 464,
        genre: "Historical Fiction",
        rating: 4.3,
        isbn: "9780312577230"
      },
      {
        id: "mock-5",
        title: "The Sanatorium",
        author: "Sarah Pearse",
        description: "A chilling debut in which a detective must uncover the dark history of a luxury hotel in the Alps if she has any hopes of solving the murder.",
        coverImage: "https://books.google.com/books/content?id=QxJ-DwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        publishedDate: "2021-02-02",
        pageCount: 400,
        genre: "Thriller",
        rating: 3.8,
        isbn: "9780593296677"
      },
      {
        id: "mock-6",
        title: "The Push",
        author: "Ashley Audrain",
        description: "A tense, page-turning psychological drama about the making and breaking of a family.",
        coverImage: "https://books.google.com/books/content?id=QxJ-DwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        publishedDate: "2021-01-05",
        pageCount: 320,
        genre: "Psychological Thriller",
        rating: 4,
        isbn: "9780593081907"
      }
    ];
    return mockBooks.slice(0, limit);
  }
  getMockPersonalRecommendations(limit) {
    const mockBooks = [
      {
        id: "rec-1",
        title: "The Seven Husbands of Evelyn Hugo",
        author: "Taylor Jenkins Reid",
        description: "Aging and reclusive Hollywood movie icon Evelyn Hugo is finally ready to tell the truth about her glamorous and scandalous life.",
        coverImage: "https://books.google.com/books/content?id=QxJ-DwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        publishedDate: "2017-06-13",
        pageCount: 400,
        genre: "Historical Fiction",
        rating: 4.4,
        isbn: "9781501161933"
      },
      {
        id: "rec-2",
        title: "Verity",
        author: "Colleen Hoover",
        description: "A struggling writer discovers a manuscript that changes her life forever.",
        coverImage: "https://books.google.com/books/content?id=QxJ-DwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        publishedDate: "2021-10-05",
        pageCount: 336,
        genre: "Thriller",
        rating: 4.3,
        isbn: "9781538724736"
      },
      {
        id: "rec-3",
        title: "Tomorrow, and Tomorrow, and Tomorrow",
        author: "Gabrielle Zevin",
        description: "A modern love story about two friends finding their way through life.",
        coverImage: "https://books.google.com/books/content?id=QxJ-DwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        publishedDate: "2022-07-05",
        pageCount: 416,
        genre: "Literary Fiction",
        rating: 4.2,
        isbn: "9780593321201"
      },
      {
        id: "rec-4",
        title: "Lessons in Chemistry",
        author: "Bonnie Garmus",
        description: "A scientist in the 1960s becomes a cooking show host and challenges the status quo.",
        coverImage: "https://books.google.com/books/content?id=QxJ-DwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        publishedDate: "2022-04-05",
        pageCount: 400,
        genre: "Historical Fiction",
        rating: 4.3,
        isbn: "9780385547345"
      },
      {
        id: "rec-5",
        title: "The Silent Patient",
        author: "Alex Michaelides",
        description: "A woman shoots her husband and then never speaks again.",
        coverImage: "https://books.google.com/books/content?id=QxJ-DwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        publishedDate: "2019-02-05",
        pageCount: 352,
        genre: "Psychological Thriller",
        rating: 4.1,
        isbn: "9781250301697"
      },
      {
        id: "rec-6",
        title: "The Invisible Life of Addie LaRue",
        author: "V.E. Schwab",
        description: "A young woman makes a Faustian bargain to live forever and is cursed to be forgotten by everyone she meets.",
        coverImage: "https://books.google.com/books/content?id=QxJ-DwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
        publishedDate: "2020-10-06",
        pageCount: 448,
        genre: "Fantasy",
        rating: 4.2,
        isbn: "9780765387561"
      }
    ];
    return mockBooks.slice(0, limit);
  }
  mapGoogleBookToBook(googleBook) {
    const isbn = googleBook.volumeInfo.industryIdentifiers?.find(
      (id) => id.type === "ISBN_13" || id.type === "ISBN_10"
    )?.identifier;
    return {
      id: googleBook.id,
      title: googleBook.volumeInfo.title,
      author: googleBook.volumeInfo.authors?.join(", ") || "Unknown Author",
      description: googleBook.volumeInfo.description,
      coverImage: googleBook.volumeInfo.imageLinks?.thumbnail,
      publishedDate: googleBook.volumeInfo.publishedDate,
      pageCount: googleBook.volumeInfo.pageCount,
      genre: googleBook.volumeInfo.categories?.[0],
      rating: googleBook.volumeInfo.averageRating,
      isbn
    };
  }
};

// server/routes/books.ts
var authenticateToken2 = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }
  next();
};
var router2 = Router2();
var bookService = new BookService();
router2.get("/search", async (req, res) => {
  try {
    const {
      q,
      maxResults = "20",
      orderBy = "relevance",
      genre,
      yearFrom,
      yearTo,
      pageCountMin,
      pageCountMax,
      language,
      rating,
      printType = "all"
    } = req.query;
    if (!q || typeof q !== "string") {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }
    const filters = {
      maxResults: parseInt(maxResults),
      orderBy,
      genre,
      yearFrom: yearFrom ? parseInt(yearFrom) : void 0,
      yearTo: yearTo ? parseInt(yearTo) : void 0,
      pageCountMin: pageCountMin ? parseInt(pageCountMin) : void 0,
      pageCountMax: pageCountMax ? parseInt(pageCountMax) : void 0,
      language,
      rating: rating ? parseFloat(rating) : void 0,
      printType
    };
    const books2 = await bookService.searchBooks(q, filters);
    res.json({ books: books2, total: books2.length });
  } catch (error) {
    console.error("Error in book search:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.get("/top-selling", async (req, res) => {
  try {
    const { limit = "6" } = req.query;
    const books2 = await bookService.getTopSellingBooks(parseInt(limit));
    res.json({ books: books2 });
  } catch (error) {
    console.error("Error fetching top selling books:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.get("/recommendations", authenticateToken2, async (req, res) => {
  try {
    const { limit = "6" } = req.query;
    const userId = 1;
    const books2 = await bookService.getPersonalRecommendations(userId, parseInt(limit));
    res.json({ books: books2 });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Book ID is required" });
    }
    const book = await bookService.getBookById(id);
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }
    res.json({ book });
  } catch (error) {
    console.error("Error fetching book:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
var books_default = router2;

// server/routes/userLibrary.ts
import { Router as Router3 } from "express";
import { eq as eq2, and } from "drizzle-orm";
var router3 = Router3();
var authenticateToken3 = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }
  req.user = { id: 1 };
  next();
};
router3.post("/add", authenticateToken3, async (req, res) => {
  try {
    const { bookId, title, author, coverImage, isbn, status, rating, notes } = req.body;
    const userId = req.user.id;
    if (!bookId || !status) {
      return res.status(400).json({ error: "Book ID and status are required" });
    }
    const now = Date.now();
    const newUserBook = await db.insert(userBooks).values({
      userId,
      bookId: bookId.toString(),
      title: title || null,
      author: author || null,
      coverImage: coverImage || null,
      isbn: isbn || null,
      status,
      rating: rating || null,
      notes: notes || null,
      createdAt: now,
      updatedAt: now
    }).returning();
    res.status(201).json({
      message: "Book added to library",
      userBook: newUserBook[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router3.get("/library", authenticateToken3, async (req, res) => {
  try {
    const userId = req.user.id;
    const userBooksData = await db.select().from(userBooks).where(eq2(userBooks.userId, userId));
    const libraryBooks = userBooksData.map((userBook) => ({
      id: userBook.id,
      bookId: userBook.bookId,
      title: userBook.title || "Unknown Title",
      author: userBook.author || "Unknown Author",
      coverImage: userBook.coverImage,
      isbn: userBook.isbn,
      status: userBook.status,
      addedAt: userBook.createdAt
    }));
    res.json({ books: libraryBooks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router3.get("/status/:bookId", authenticateToken3, async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user.id;
    const userBook = await db.select().from(userBooks).where(and(
      eq2(userBooks.userId, userId),
      eq2(userBooks.bookId, bookId)
    )).limit(1);
    res.json({
      inLibrary: userBook.length > 0,
      status: userBook[0]?.status || null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router3.put("/update/:bookId", authenticateToken3, async (req, res) => {
  try {
    const { bookId } = req.params;
    const { status, rating, notes } = req.body;
    const userId = req.user.id;
    const now = Date.now();
    const updatedUserBook = await db.update(userBooks).set({
      status: status || void 0,
      rating: rating || null,
      notes: notes || null,
      updatedAt: now
    }).where(and(
      eq2(userBooks.userId, userId),
      eq2(userBooks.bookId, bookId)
    )).returning();
    if (updatedUserBook.length === 0) {
      return res.status(404).json({ error: "Book not found in library" });
    }
    res.json({
      message: "Book status updated",
      userBook: updatedUserBook[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router3.delete("/remove/:bookId", authenticateToken3, async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user.id;
    const result = await db.delete(userBooks).where(and(
      eq2(userBooks.userId, userId),
      eq2(userBooks.bookId, bookId)
    ));
    if (result.changes === 0) {
      return res.status(404).json({ error: "Book not found in library" });
    }
    res.json({ message: "Book removed from library" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
var userLibrary_default = router3;

// server/routes/memberships.ts
import { Router as Router4 } from "express";

// server/services/membershipService.ts
import { eq as eq3, and as and2 } from "drizzle-orm";
var MembershipService = class {
  async addMembership(data) {
    const now = Date.now();
    const newMembership = await db.insert(userMemberships).values({
      userId: data.userId,
      service: data.service,
      membershipType: data.membershipType,
      price: data.price || null,
      status: data.status || "active",
      startDate: data.startDate || now,
      endDate: data.endDate || null,
      notes: data.notes || null,
      createdAt: now,
      updatedAt: now
    }).returning();
    return {
      id: newMembership[0].id,
      userId: newMembership[0].userId,
      service: newMembership[0].service,
      membershipType: newMembership[0].membershipType,
      price: newMembership[0].price || void 0,
      status: newMembership[0].status,
      startDate: newMembership[0].startDate || void 0,
      endDate: newMembership[0].endDate || void 0,
      notes: newMembership[0].notes || void 0,
      createdAt: newMembership[0].createdAt || now,
      updatedAt: newMembership[0].updatedAt || now
    };
  }
  async updateMembership(membershipId, userId, data) {
    const now = Date.now();
    const updatedMembership = await db.update(userMemberships).set({
      membershipType: data.membershipType || void 0,
      price: data.price || null,
      status: data.status || void 0,
      startDate: data.startDate || void 0,
      endDate: data.endDate || null,
      notes: data.notes || null,
      updatedAt: now
    }).where(and2(
      eq3(userMemberships.id, membershipId),
      eq3(userMemberships.userId, userId)
    )).returning();
    if (updatedMembership.length === 0) {
      return null;
    }
    return {
      id: updatedMembership[0].id,
      userId: updatedMembership[0].userId,
      service: updatedMembership[0].service,
      membershipType: updatedMembership[0].membershipType,
      price: updatedMembership[0].price || void 0,
      status: updatedMembership[0].status,
      startDate: updatedMembership[0].startDate || void 0,
      endDate: updatedMembership[0].endDate || void 0,
      notes: updatedMembership[0].notes || void 0,
      createdAt: updatedMembership[0].createdAt || 0,
      updatedAt: updatedMembership[0].updatedAt || now
    };
  }
  async getUserMemberships(userId) {
    const memberships = await db.select().from(userMemberships).where(eq3(userMemberships.userId, userId));
    return memberships.map((membership) => ({
      id: membership.id,
      userId: membership.userId,
      service: membership.service,
      membershipType: membership.membershipType,
      price: membership.price || void 0,
      status: membership.status,
      startDate: membership.startDate || void 0,
      endDate: membership.endDate || void 0,
      notes: membership.notes || void 0,
      createdAt: membership.createdAt || 0,
      updatedAt: membership.updatedAt || 0
    }));
  }
  async removeMembership(membershipId, userId) {
    const result = await db.delete(userMemberships).where(and2(
      eq3(userMemberships.id, membershipId),
      eq3(userMemberships.userId, userId)
    ));
    return result.changes > 0;
  }
  async getMembershipById(membershipId, userId) {
    const membership = await db.select().from(userMemberships).where(and2(
      eq3(userMemberships.id, membershipId),
      eq3(userMemberships.userId, userId)
    ));
    if (membership.length === 0) {
      return null;
    }
    return {
      id: membership[0].id,
      userId: membership[0].userId,
      service: membership[0].service,
      membershipType: membership[0].membershipType,
      price: membership[0].price || void 0,
      status: membership[0].status,
      startDate: membership[0].startDate || void 0,
      endDate: membership[0].endDate || void 0,
      notes: membership[0].notes || void 0,
      createdAt: membership[0].createdAt || 0,
      updatedAt: membership[0].updatedAt || 0
    };
  }
};

// server/routes/memberships.ts
var router4 = Router4();
var membershipService = new MembershipService();
var authenticateToken4 = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }
  req.user = { id: 1 };
  next();
};
router4.post("/add", authenticateToken4, async (req, res) => {
  try {
    const { service, membershipType, price, status, startDate, endDate, notes } = req.body;
    const userId = req.user.id;
    if (!service || !membershipType) {
      return res.status(400).json({ error: "Service and membership type are required" });
    }
    const membership = await membershipService.addMembership({
      userId,
      service,
      membershipType,
      price,
      status,
      startDate: startDate ? parseInt(startDate) : void 0,
      endDate: endDate ? parseInt(endDate) : void 0,
      notes
    });
    res.status(201).json({
      message: "Membership added successfully",
      membership
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router4.get("/list", authenticateToken4, async (req, res) => {
  try {
    const userId = req.user.id;
    const memberships = await membershipService.getUserMemberships(userId);
    res.json({ memberships });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router4.put("/update/:id", authenticateToken4, async (req, res) => {
  try {
    const { id } = req.params;
    const { membershipType, price, status, startDate, endDate, notes } = req.body;
    const userId = req.user.id;
    const membership = await membershipService.updateMembership(parseInt(id), userId, {
      membershipType,
      price,
      status,
      startDate: startDate ? parseInt(startDate) : void 0,
      endDate: endDate ? parseInt(endDate) : void 0,
      notes
    });
    if (!membership) {
      return res.status(404).json({ error: "Membership not found" });
    }
    res.json({
      message: "Membership updated successfully",
      membership
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router4.delete("/remove/:id", authenticateToken4, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const success = await membershipService.removeMembership(parseInt(id), userId);
    if (!success) {
      return res.status(404).json({ error: "Membership not found" });
    }
    res.json({ message: "Membership removed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router4.get("/:id", authenticateToken4, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const membership = await membershipService.getMembershipById(parseInt(id), userId);
    if (!membership) {
      return res.status(404).json({ error: "Membership not found" });
    }
    res.json({ membership });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
var memberships_default = router4;

// server/index.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var server = createServer(app);
var wss = new WebSocketServer({ server });
app.use(express.json());
app.use(express.static(path.join(__dirname, "../dist/public")));
app.use(session({
  secret: process.env.SESSION_SECRET || "your-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1e3
    // 24 hours
  }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use("/api/auth", auth_default);
app.use("/api/books", books_default);
app.use("/api/user-library", userLibrary_default);
app.use("/api/memberships", memberships_default);
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/public/index.html"));
});
wss.on("connection", (ws) => {
  console.log("New WebSocket connection");
  ws.on("message", (message) => {
    console.log("Received:", message);
  });
  ws.on("close", () => {
    console.log("Client disconnected");
  });
});
var PORT = process.env.PORT || 3e3;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
