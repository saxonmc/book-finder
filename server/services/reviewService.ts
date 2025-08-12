import { db } from '../db'
import { reviews, reviewVotes, users } from '../../shared/schema'
import { eq, and, desc, count, avg, sql } from 'drizzle-orm'

export interface CreateReviewData {
  userId: number
  bookId: string
  rating: number
  review?: string
}

export interface ReviewWithUser {
  id: number
  userId: number
  bookId: string
  rating: number
  review?: string | null
  helpfulVotes: number | null
  createdAt: number | null
  user: {
    id: number
    name: string
  }
  userVote?: number // Current user's vote (1 for helpful, 0 for not helpful, undefined for no vote)
}

export interface BookRatingStats {
  averageRating: number
  totalReviews: number
  ratingDistribution: {
    [key: number]: number // 1-5 stars and their counts
  }
}

export class ReviewService {
  async createReview(data: CreateReviewData) {
    const now = Date.now()
    
    const [newReview] = await db.insert(reviews).values({
      userId: data.userId,
      bookId: data.bookId,
      rating: data.rating,
      review: data.review || null,
      helpfulVotes: 0,
      createdAt: now,
      updatedAt: now,
    }).returning()

    return newReview
  }

  async updateReview(reviewId: number, userId: number, data: { rating?: number; review?: string }) {
    const now = Date.now()
    
    const [updatedReview] = await db.update(reviews)
      .set({
        rating: data.rating || undefined,
        review: data.review || null,
        updatedAt: now,
      })
      .where(and(
        eq(reviews.id, reviewId),
        eq(reviews.userId, userId)
      ))
      .returning()

    return updatedReview
  }

  async deleteReview(reviewId: number, userId: number) {
    // Delete associated votes first
    await db.delete(reviewVotes)
      .where(eq(reviewVotes.reviewId, reviewId))

    // Delete the review
    const result = await db.delete(reviews)
      .where(and(
        eq(reviews.id, reviewId),
        eq(reviews.userId, userId)
      ))

    return result
  }

  async getBookReviews(bookId: string, currentUserId?: number, limit: number = 10, offset: number = 0) {
    // Get reviews with user information
    const reviewsData = await db
      .select({
        id: reviews.id,
        userId: reviews.userId,
        bookId: reviews.bookId,
        rating: reviews.rating,
        review: reviews.review,
        helpfulVotes: reviews.helpfulVotes,
        createdAt: reviews.createdAt,
        user: {
          id: users.id,
          name: users.name,
        }
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.bookId, bookId))
      .orderBy(desc(reviews.helpfulVotes), desc(reviews.createdAt))
      .limit(limit)
      .offset(offset)

    // If user is logged in, get their votes for these reviews
    if (currentUserId) {
      const reviewIds = reviewsData.map(r => r.id)
      const userVotes = await db
        .select({
          reviewId: reviewVotes.reviewId,
          isHelpful: reviewVotes.isHelpful,
        })
        .from(reviewVotes)
        .where(and(
          eq(reviewVotes.userId, currentUserId),
          sql`${reviewVotes.reviewId} IN (${reviewIds.join(',')})`
        ))

      const votesMap = new Map(userVotes.map(v => [v.reviewId, v.isHelpful]))

      return reviewsData.map(review => ({
        ...review,
        userVote: votesMap.get(review.id)
      }))
    }

    return reviewsData
  }

  async getUserReview(bookId: string, userId: number): Promise<ReviewWithUser | null> {
    const [review] = await db
      .select({
        id: reviews.id,
        userId: reviews.userId,
        bookId: reviews.bookId,
        rating: reviews.rating,
        review: reviews.review,
        helpfulVotes: reviews.helpfulVotes,
        createdAt: reviews.createdAt,
        user: {
          id: users.id,
          name: users.name,
        }
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.id))
      .where(and(
        eq(reviews.bookId, bookId),
        eq(reviews.userId, userId)
      ))
      .limit(1)

    return review || null
  }

  async getBookRatingStats(bookId: string): Promise<BookRatingStats> {
    // Get average rating and total count
    const [stats] = await db
      .select({
        averageRating: avg(reviews.rating),
        totalReviews: count(reviews.id),
      })
      .from(reviews)
      .where(eq(reviews.bookId, bookId))

    // Get rating distribution
    const ratingDistribution = await db
      .select({
        rating: reviews.rating,
        count: count(reviews.id),
      })
      .from(reviews)
      .where(eq(reviews.bookId, bookId))
      .groupBy(reviews.rating)

    const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    ratingDistribution.forEach(item => {
      distribution[item.rating as number] = item.count as number
    })

    return {
      averageRating: stats.averageRating || 0,
      totalReviews: stats.totalReviews || 0,
      ratingDistribution: distribution,
    }
  }

  async voteOnReview(reviewId: number, userId: number, isHelpful: boolean) {
    const now = Date.now()
    
    // Check if user already voted
    const existingVote = await db
      .select()
      .from(reviewVotes)
      .where(and(
        eq(reviewVotes.reviewId, reviewId),
        eq(reviewVotes.userId, userId)
      ))
      .limit(1)

    if (existingVote.length > 0) {
      // Update existing vote
      await db.update(reviewVotes)
        .set({
          isHelpful: isHelpful ? 1 : 0,
          createdAt: now,
        })
        .where(and(
          eq(reviewVotes.reviewId, reviewId),
          eq(reviewVotes.userId, userId)
        ))
    } else {
      // Create new vote
      await db.insert(reviewVotes).values({
        reviewId,
        userId,
        isHelpful: isHelpful ? 1 : 0,
        createdAt: now,
      })
    }

    // Update helpful votes count on the review
    const helpfulVotes = await db
      .select({ count: count() })
      .from(reviewVotes)
      .where(and(
        eq(reviewVotes.reviewId, reviewId),
        eq(reviewVotes.isHelpful, 1)
      ))

    await db.update(reviews)
      .set({ helpfulVotes: Number(helpfulVotes[0].count) })
      .where(eq(reviews.id, reviewId))

    return { success: true }
  }

  async removeVote(reviewId: number, userId: number) {
    // Remove the vote
    await db.delete(reviewVotes)
      .where(and(
        eq(reviewVotes.reviewId, reviewId),
        eq(reviewVotes.userId, userId)
      ))

    // Update helpful votes count
    const helpfulVotes = await db
      .select({ count: count() })
      .from(reviewVotes)
      .where(and(
        eq(reviewVotes.reviewId, reviewId),
        eq(reviewVotes.isHelpful, 1)
      ))

    await db.update(reviews)
      .set({ helpfulVotes: Number(helpfulVotes[0].count) })
      .where(eq(reviews.id, reviewId))

    return { success: true }
  }
} 