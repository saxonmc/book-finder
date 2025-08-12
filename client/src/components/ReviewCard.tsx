import React, { useState } from 'react'
import { Star, ThumbsUp, ThumbsDown, MoreVertical, Edit, Trash2, Loader2 } from 'lucide-react'

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
  userVote?: number // Current user's vote (1 for helpful, 0 for not helpful, undefined for no vote)
}

interface ReviewCardProps {
  review: Review
  currentUserId?: number
  onVote: (reviewId: number, isHelpful: boolean) => Promise<void>
  onRemoveVote: (reviewId: number) => Promise<void>
  onEdit?: (review: Review) => void
  onDelete?: (reviewId: number) => Promise<void>
}

export default function ReviewCard({ 
  review, 
  currentUserId, 
  onVote, 
  onRemoveVote, 
  onEdit, 
  onDelete 
}: ReviewCardProps) {
  const [isVoting, setIsVoting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return 'Unknown date'
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => {
      const starNumber = index + 1
      const isFilled = starNumber <= rating
      
      return (
        <Star
          key={starNumber}
          className={`w-4 h-4 ${
            isFilled ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      )
    })
  }

  const handleVote = async (isHelpful: boolean) => {
    if (!currentUserId || isVoting) return

    setIsVoting(true)
    try {
      if (review.userVote === (isHelpful ? 1 : 0)) {
        // Remove vote if clicking the same button
        await onRemoveVote(review.id)
      } else {
        // Add or change vote
        await onVote(review.id, isHelpful)
      }
    } catch (error) {
      console.error('Error voting on review:', error)
    } finally {
      setIsVoting(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete || isDeleting) return

    if (!confirm('Are you sure you want to delete this review?')) return

    setIsDeleting(true)
    try {
      await onDelete(review.id)
    } catch (error) {
      console.error('Error deleting review:', error)
    } finally {
      setIsDeleting(false)
      setShowMenu(false)
    }
  }

  const isOwner = currentUserId === review.user.id

  return (
    <div className="modern-card p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
            {review.user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{review.user.name}</h4>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {renderStars(review.rating)}
              </div>
              <span className="text-sm text-gray-500">
                {formatDate(review.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Menu for owner */}
        {isOwner && (onEdit || onDelete) && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                {onEdit && (
                  <button
                    onClick={() => {
                      onEdit(review)
                      setShowMenu(false)
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review Content */}
      {review.review && (
        <div className="mb-4">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {review.review}
          </p>
        </div>
      )}

      {/* Helpful Votes */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleVote(true)}
            disabled={!currentUserId || isVoting}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm transition-colors ${
              review.userVote === 1
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600'
            } disabled:opacity-50`}
          >
            <ThumbsUp className="w-4 h-4" />
            Helpful
          </button>

          <button
            onClick={() => handleVote(false)}
            disabled={!currentUserId || isVoting}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm transition-colors ${
              review.userVote === 0
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
            } disabled:opacity-50`}
          >
            <ThumbsDown className="w-4 h-4" />
            Not Helpful
          </button>
        </div>

        {review.helpfulVotes && review.helpfulVotes > 0 && (
          <span className="text-sm text-gray-500">
            {review.helpfulVotes} found this helpful
          </span>
        )}
      </div>
    </div>
  )
} 