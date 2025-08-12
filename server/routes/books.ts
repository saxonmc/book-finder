import { Router } from 'express';
import { BookService } from '../services/bookService.js';

// Simple authentication middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // For now, just check if token exists (in a real app, you'd verify the JWT)
  // This is a simplified version - you should use proper JWT verification
  next();
};

const router = Router();
const bookService = new BookService();

// Search books
router.get('/search', async (req, res) => {
  try {
    const { 
      q, 
      maxResults = '20', 
      orderBy = 'relevance',
      genre,
      yearFrom,
      yearTo,
      pageCountMin,
      pageCountMax,
      language,
      rating,
      printType = 'all'
    } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }
    
    const filters = {
      maxResults: parseInt(maxResults as string),
      orderBy: orderBy as string,
      genre: genre as string,
      yearFrom: yearFrom ? parseInt(yearFrom as string) : undefined,
      yearTo: yearTo ? parseInt(yearTo as string) : undefined,
      pageCountMin: pageCountMin ? parseInt(pageCountMin as string) : undefined,
      pageCountMax: pageCountMax ? parseInt(pageCountMax as string) : undefined,
      language: language as string,
      rating: rating ? parseFloat(rating as string) : undefined,
      printType: printType as string
    };
    
    const books = await bookService.searchBooks(q, filters);
    res.json({ books, total: books.length });
  } catch (error) {
    console.error('Error in book search:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get top selling books
router.get('/top-selling', async (req, res) => {
  try {
    const { limit = '6' } = req.query;
    
    const books = await bookService.getTopSellingBooks(parseInt(limit as string));
    res.json({ books });
  } catch (error) {
    console.error('Error fetching top selling books:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get personal recommendations
router.get('/recommendations', authenticateToken, async (req, res) => {
  try {
    const { limit = '6' } = req.query;
    
    // For now, we'll use a placeholder user ID
    // In a real app, you'd extract the user ID from the JWT token
    const userId = 1; // Placeholder
    
    const books = await bookService.getPersonalRecommendations(userId, parseInt(limit as string));
    res.json({ books });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get book by ID (must be last to avoid conflicts with specific routes)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Book ID is required' });
    }
    
    const book = await bookService.getBookById(id);
    
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    res.json({ book });
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 