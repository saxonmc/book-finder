import { Router, Request, Response } from 'express';
import { db } from '../db';
import { userBooks } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';

const router = Router();

// Middleware to verify JWT token (simplified)
const authenticateToken = async (req: Request, res: Response, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // For now, just pass through - we'll implement proper JWT verification later
  (req as any).user = { id: 1 }; // Placeholder
  next();
};

// Add book to user library
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { bookId, title, author, coverImage, isbn, status, rating, notes } = req.body;
    const userId = (req as any).user.id;

    if (!bookId || !status) {
      return res.status(400).json({ error: 'Book ID and status are required' });
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
      updatedAt: now,
    }).returning();

    res.status(201).json({ 
      message: 'Book added to library',
      userBook: newUserBook[0]
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's library
router.get('/library', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    
    const userBooksData = await db
      .select()
      .from(userBooks)
      .where(eq(userBooks.userId, userId));

    // Transform the data to match the frontend expectations
    const libraryBooks = userBooksData.map(userBook => ({
      id: userBook.id,
      bookId: userBook.bookId,
      title: userBook.title || 'Unknown Title',
      author: userBook.author || 'Unknown Author',
      coverImage: userBook.coverImage,
      isbn: userBook.isbn,
      status: userBook.status,
      addedAt: userBook.createdAt
    }));

    res.json({ books: libraryBooks });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Check if book is in user's library
router.get('/status/:bookId', authenticateToken, async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = (req as any).user.id;
    
    const userBook = await db
      .select()
      .from(userBooks)
      .where(and(
        eq(userBooks.userId, userId),
        eq(userBooks.bookId, bookId)
      ))
      .limit(1);

    res.json({ 
      inLibrary: userBook.length > 0,
      status: userBook[0]?.status || null
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update book status
router.put('/update/:bookId', authenticateToken, async (req, res) => {
  try {
    const { bookId } = req.params;
    const { status, rating, notes } = req.body;
    const userId = (req as any).user.id;

    const now = Date.now();
    
    const updatedUserBook = await db.update(userBooks)
      .set({
        status: status || undefined,
        rating: rating || null,
        notes: notes || null,
        updatedAt: now,
      })
      .where(and(
        eq(userBooks.userId, userId),
        eq(userBooks.bookId, bookId)
      ))
      .returning();

    if (updatedUserBook.length === 0) {
      return res.status(404).json({ error: 'Book not found in library' });
    }

    res.json({ 
      message: 'Book status updated',
      userBook: updatedUserBook[0]
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Remove book from library
router.delete('/remove/:bookId', authenticateToken, async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = (req as any).user.id;

    const result = await db.delete(userBooks)
      .where(and(
        eq(userBooks.userId, userId),
        eq(userBooks.bookId, bookId)
      ));

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Book not found in library' });
    }

    res.json({ message: 'Book removed from library' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router; 