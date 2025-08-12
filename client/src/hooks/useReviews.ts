import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface Review {
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
  userVote?: number
}

interface RatingStats {
  averageRating: number
  totalReviews: number
  ratingDistribution: {
    [key: number]: number
  }
}

// Get reviews for a book
export const useBookReviews = (bookId: string, limit: number = 10, offset: number = 0) => {
  return useQuery<{ reviews: Review[] }>({
    queryKey: ['reviews', bookId, limit, offset],
    queryFn: async () => {
      const token = localStorage.getItem('token')
      const headers: Record<string, string> = {}
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`/api/reviews/book/${bookId}?limit=${limit}&offset=${offset}`, {
        headers
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch reviews')
      }
      
      return response.json()
    },
    enabled: !!bookId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Get rating stats for a book
export const useBookRatingStats = (bookId: string) => {
  return useQuery<RatingStats>({
    queryKey: ['reviews', 'stats', bookId],
    queryFn: async () => {
      const response = await fetch(`/api/reviews/book/${bookId}/stats`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch rating stats')
      }
      
      return response.json()
    },
    enabled: !!bookId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Get user's review for a book
export const useUserReview = (bookId: string) => {
  return useQuery<{ review: Review | null }>({
    queryKey: ['reviews', 'user', bookId],
    queryFn: async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        return { review: null }
      }

      const response = await fetch(`/api/reviews/book/${bookId}/user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.status === 404) {
        return { review: null }
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch user review')
      }
      
      return response.json()
    },
    enabled: !!bookId && !!localStorage.getItem('token'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Create a review
export const useCreateReview = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ bookId, rating, review }: { bookId: string; rating: number; review: string }) => {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch(`/api/reviews/book/${bookId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating, review })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create review')
      }

      return response.json()
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch reviews
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.bookId] })
      queryClient.invalidateQueries({ queryKey: ['reviews', 'stats', variables.bookId] })
      queryClient.invalidateQueries({ queryKey: ['reviews', 'user', variables.bookId] })
    }
  })
}

// Update a review
export const useUpdateReview = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ reviewId, rating, review }: { reviewId: number; rating: number; review: string }) => {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating, review })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update review')
      }

      return response.json()
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch reviews
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
    }
  })
}

// Delete a review
export const useDeleteReview = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (reviewId: number) => {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete review')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate and refetch reviews
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
    }
  })
}

// Vote on a review
export const useVoteOnReview = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ reviewId, isHelpful }: { reviewId: number; isHelpful: boolean }) => {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch(`/api/reviews/${reviewId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isHelpful })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to vote on review')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate and refetch reviews
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
    }
  })
}

// Remove vote on a review
export const useRemoveVote = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (reviewId: number) => {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch(`/api/reviews/${reviewId}/vote`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to remove vote')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate and refetch reviews
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
    }
  })
} 