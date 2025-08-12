import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'

// Users table
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  createdAt: integer('created_at'),
  updatedAt: integer('updated_at'),
})

// Books table
export const books = sqliteTable('books', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  author: text('author').notNull(),
  isbn: text('isbn').unique(),
  description: text('description'),
  coverImage: text('cover_image'),
  publishedDate: integer('published_date'),
  genre: text('genre'),
  pageCount: integer('page_count'),
  rating: integer('rating'),
  createdAt: integer('created_at'),
  updatedAt: integer('updated_at'),
})

// User books (for personal library)
export const userBooks = sqliteTable('user_books', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id).notNull(),
  bookId: text('book_id').notNull(), // Google Books ID (string)
  title: text('title'),
  author: text('author'),
  coverImage: text('cover_image'),
  isbn: text('isbn'),
  status: text('status').notNull().default('want_to_read'), // want_to_read, reading, completed
  rating: integer('rating'),
  notes: text('notes'),
  createdAt: integer('created_at'),
  updatedAt: integer('updated_at'),
})

// Reviews table (updated for Google Books)
export const reviews = sqliteTable('reviews', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id).notNull(),
  bookId: text('book_id').notNull(), // Google Books ID (string)
  rating: integer('rating').notNull(), // 1-5 stars
  review: text('review'), // Optional written review
  helpfulVotes: integer('helpful_votes').default(0), // Number of helpful votes
  createdAt: integer('created_at'),
  updatedAt: integer('updated_at'),
})

// Review helpful votes (to track who voted)
export const reviewVotes = sqliteTable('review_votes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  reviewId: integer('review_id').references(() => reviews.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  isHelpful: integer('is_helpful').notNull(), // 1 for helpful, 0 for not helpful
  createdAt: integer('created_at'),
})

// User memberships table
export const userMemberships = sqliteTable('user_memberships', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id).notNull(),
  service: text('service').notNull(), // audible, kindle, library, etc.
  membershipType: text('membership_type').notNull(), // plus, premium, basic, etc.
  price: text('price'), // monthly cost
  status: text('status').notNull().default('active'), // active, cancelled, expired
  startDate: integer('start_date'),
  endDate: integer('end_date'),
  notes: text('notes'),
  createdAt: integer('created_at'),
  updatedAt: integer('updated_at'),
})

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  userBooks: many(userBooks),
  reviews: many(reviews),
  memberships: many(userMemberships),
  reviewVotes: many(reviewVotes),
}))

export const booksRelations = relations(books, ({ many }) => ({
  userBooks: many(userBooks),
  reviews: many(reviews),
}))

export const userBooksRelations = relations(userBooks, ({ one }) => ({
  user: one(users, {
    fields: [userBooks.userId],
    references: [users.id],
  }),
}))

export const reviewsRelations = relations(reviews, ({ one, many }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  votes: many(reviewVotes),
}))

export const reviewVotesRelations = relations(reviewVotes, ({ one }) => ({
  review: one(reviews, {
    fields: [reviewVotes.reviewId],
    references: [reviews.id],
  }),
  user: one(users, {
    fields: [reviewVotes.userId],
    references: [users.id],
  }),
}))

export const userMembershipsRelations = relations(userMemberships, ({ one }) => ({
  user: one(users, {
    fields: [userMemberships.userId],
    references: [users.id],
  }),
})) 