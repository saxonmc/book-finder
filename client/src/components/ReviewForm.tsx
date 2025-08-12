import React, { useState } from 'react'
import { Star, Send, Loader2 } from 'lucide-react'

interface ReviewFormProps {
  bookId: string
  onSubmit: (rating: number, review: string) => Promise<void>
  onCancel: () => void
  initialRating?: number
  initialReview?: string
  isEditing?: boolean
}

export default function ReviewForm({ 
  bookId, 
  onSubmit, 
  onCancel, 
  initialRating = 0, 
  initialReview = '', 
  isEditing = false 
}: ReviewFormProps) {
  const [rating, setRating] = useState(initialRating)
  const [review, setReview] = useState(initialReview)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hoveredStar, setHoveredStar] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      alert('Please select a rating')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(rating, review)
    } catch (error) {
      console.error('Error submitting review:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starNumber = index + 1
      const isFilled = starNumber <= (hoveredStar || rating)
      
      return (
        <button
          key={starNumber}
          type="button"
          className={`p-1 transition-all duration-200 ${
            isFilled 
              ? 'text-yellow-400 hover:text-yellow-500' 
              : 'text-gray-300 hover:text-yellow-400'
          }`}
          onClick={() => setRating(starNumber)}
          onMouseEnter={() => setHoveredStar(starNumber)}
          onMouseLeave={() => setHoveredStar(0)}
        >
          <Star className="w-8 h-8 fill-current" />
        </button>
      )
    })
  }

  return (
    <div className="modern-card p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        {isEditing ? 'Edit Your Review' : 'Write a Review'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Star Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Your Rating *
          </label>
          <div className="flex items-center gap-1">
            {renderStars()}
            <span className="ml-3 text-sm text-gray-600">
              {rating > 0 ? `${rating} star${rating !== 1 ? 's' : ''}` : 'Select rating'}
            </span>
          </div>
        </div>

        {/* Review Text */}
        <div>
          <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-2">
            Your Review (optional)
          </label>
          <textarea
            id="review"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Share your thoughts about this book..."
            className="modern-input min-h-[120px] resize-none"
            maxLength={1000}
          />
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-500">
              {review.length}/1000 characters
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {isSubmitting ? 'Submitting...' : (isEditing ? 'Update Review' : 'Submit Review')}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
} 