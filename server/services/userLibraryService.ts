import { db } from '../db'
import { userBooks, books } from '../../shared/schema'
import { eq, and } from 'drizzle-orm'

export interface AddBookToLibrary {
  userId: number
  bookId: number
  status: 'want_to_read' | 'reading' | 'completed'
  rating?: number
  notes?: string
}

export interface UpdateBookStatus {
  userId: number
  bookId: number
  status?: 'want_to_read' | 'reading' | 'completed'
  rating?: number
  notes?: string
}

export interface UserBook {
  id: number
  userId: number
  bookId: number
  status: string
  rating?: number
  notes?: string
  createdAt: number
  updatedAt: number
  book?: {
    title: string
    author: string
    coverImage?: string
    description?: string
  }
}

export class UserLibraryService {
  async addBookToLibrary(data: AddBookToLibrary): Promise<UserBook> {
    const now = Date.now()
    
    const newUserBook = await db.insert(userBooks).values({
      userId: data.userId,
      bookId: data.bookId,
      status: data.status,
      rating: data.rating,
      notes: data.notes,
      createdAt: now,
      updatedAt: now,
    }).returning()

    return {
      id: newUserBook[0].id,
      userId: newUserBook[0].userId,
      bookId: newUserBook[0].bookId,
      status: newUserBook[0].status,
      rating: newUserBook[0].rating || undefined,
      notes: newUserBook[0].notes || undefined,
      createdAt: newUserBook[0].createdAt || now,
      updatedAt: newUserBook[0].updatedAt || now,
    }
  }

  async updateBookStatus(data: UpdateBookStatus): Promise<UserBook | null> {
    const now = Date.now()
    
    const updatedUserBook = await db.update(userBooks)
      .set({
        status: data.status,
        rating: data.rating,
        notes: data.notes,
        updatedAt: now,
      })
      .where(and(
        eq(userBooks.userId, data.userId),
        eq(userBooks.bookId, data.bookId)
      ))
      .returning()

    if (updatedUserBook.length === 0) {
      return null
    }

    return {
      id: updatedUserBook[0].id,
      userId: updatedUserBook[0].userId,
      bookId: updatedUserBook[0].bookId,
      status: updatedUserBook[0].status,
      rating: updatedUserBook[0].rating,
      notes: updatedUserBook[0].notes,
      createdAt: updatedUserBook[0].createdAt || 0,
      updatedAt: updatedUserBook[0].updatedAt || now,
    }
  }

  async getUserLibrary(userId: number): Promise<UserBook[]> {
    const userBooksData = await db
      .select({
        id: userBooks.id,
        userId: userBooks.userId,
        bookId: userBooks.bookId,
        status: userBooks.status,
        rating: userBooks.rating,
        notes: userBooks.notes,
        createdAt: userBooks.createdAt,
        updatedAt: userBooks.updatedAt,
        bookTitle: books.title,
        bookAuthor: books.author,
        bookCoverImage: books.coverImage,
        bookDescription: books.description,
      })
      .from(userBooks)
      .leftJoin(books, eq(userBooks.bookId, books.id))
      .where(eq(userBooks.userId, userId))

    return userBooksData.map(item => ({
      id: item.id,
      userId: item.userId,
      bookId: item.bookId,
      status: item.status,
      rating: item.rating,
      notes: item.notes,
      createdAt: item.createdAt || 0,
      updatedAt: item.updatedAt || 0,
      book: {
        title: item.bookTitle || 'Unknown Book',
        author: item.bookAuthor || 'Unknown Author',
        coverImage: item.bookCoverImage || undefined,
        description: item.bookDescription || undefined,
      }
    }))
  }

  async removeBookFromLibrary(userId: number, bookId: string): Promise<boolean> {
    const result = await db.delete(userBooks)
      .where(and(
        eq(userBooks.userId, userId),
        eq(userBooks.bookId, bookId)
      ))

    return result.changes > 0
  }

  async getBookStatus(userId: number, bookId: string): Promise<UserBook | null> {
    const userBook = await db
      .select()
      .from(userBooks)
      .where(and(
        eq(userBooks.userId, userId),
        eq(userBooks.bookId, bookId)
      ))

    if (userBook.length === 0) {
      return null
    }

    return {
      id: userBook[0].id,
      userId: userBook[0].userId,
      bookId: userBook[0].bookId,
      status: userBook[0].status,
      rating: userBook[0].rating,
      notes: userBook[0].notes,
      createdAt: userBook[0].createdAt || 0,
      updatedAt: userBook[0].updatedAt || 0,
    }
  }
} 