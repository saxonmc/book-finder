import { Router } from 'express'
import { ReviewService } from '../services/reviewService.js'

// Simple authentication middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  // For now, just check if token exists (in a real app, you'd verify the JWT)
  // This is a simplified version - you should use proper JWT verification
  next()
}

const router = Router()
const reviewService = new ReviewService()

// Get reviews for a book
router.get('/book/:bookId', async (req, res) => {
  try {
    const { bookId } = req.params
    const { limit = '10', offset = '0' } = req.query
    const currentUserId = (req as any).user?.id // Will be undefined for guests

    const reviews = await reviewService.getBookReviews(
      bookId,
      currentUserId,
      parseInt(limit as string),
      parseInt(offset as string)
    )

    res.json({ reviews })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get rating stats for a book
router.get('/book/:bookId/stats', async (req, res) => {
  try {
    const { bookId } = req.params

    const stats = await reviewService.getBookRatingStats(bookId)

    res.json(stats)
  } catch (error) {
    console.error('Error fetching rating stats:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get user's review for a book
router.get('/book/:bookId/user', authenticateToken, async (req, res) => {
  try {
    const { bookId } = req.params
    const userId = (req as any).user.id

    const review = await reviewService.getUserReview(bookId, userId)

    res.json({ review })
  } catch (error) {
    console.error('Error fetching user review:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create a review
router.post('/book/:bookId', authenticateToken, async (req, res) => {
  try {
    const { bookId } = req.params
    const { rating, review } = req.body
    const userId = (req as any).user.id

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' })
    }

    const newReview = await reviewService.createReview({
      userId,
      bookId,
      rating: parseInt(rating),
      review
    })

    res.status(201).json({ review: newReview })
  } catch (error) {
    console.error('Error creating review:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update a review
router.put('/:reviewId', authenticateToken, async (req, res) => {
  try {
    const { reviewId } = req.params
    const { rating, review } = req.body
    const userId = (req as any).user.id

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' })
    }

    const updatedReview = await reviewService.updateReview(parseInt(reviewId), userId, {
      rating: rating ? parseInt(rating) : undefined,
      review
    })

    if (!updatedReview) {
      return res.status(404).json({ error: 'Review not found or not authorized' })
    }

    res.json({ review: updatedReview })
  } catch (error) {
    console.error('Error updating review:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Delete a review
router.delete('/:reviewId', authenticateToken, async (req, res) => {
  try {
    const { reviewId } = req.params
    const userId = (req as any).user.id

    const result = await reviewService.deleteReview(parseInt(reviewId), userId)

    if (!result) {
      return res.status(404).json({ error: 'Review not found or not authorized' })
    }

    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting review:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Vote on a review (helpful/not helpful)
router.post('/:reviewId/vote', authenticateToken, async (req, res) => {
  try {
    const { reviewId } = req.params
    const { isHelpful } = req.body
    const userId = (req as any).user.id

    if (typeof isHelpful !== 'boolean') {
      return res.status(400).json({ error: 'isHelpful must be a boolean' })
    }

    const result = await reviewService.voteOnReview(reviewId, userId, isHelpful)

    res.json(result)
  } catch (error) {
    console.error('Error voting on review:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Remove vote on a review
router.delete('/:reviewId/vote', authenticateToken, async (req, res) => {
  try {
    const { reviewId } = req.params
    const userId = (req as any).user.id

    const result = await reviewService.removeVote(reviewId, userId)

    res.json(result)
  } catch (error) {
    console.error('Error removing vote:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router 