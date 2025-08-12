import React from 'react'
import { Star } from 'lucide-react'

interface RatingStats {
  averageRating: number
  totalReviews: number
  ratingDistribution: {
    [key: number]: number // 1-5 stars and their counts
  }
}

interface ReviewStatsProps {
  stats: RatingStats
}

export default function ReviewStats({ stats }: ReviewStatsProps) {
  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-6 h-6'
    }

    return Array.from({ length: 5 }, (_, index) => {
      const starNumber = index + 1
      const isFilled = starNumber <= Math.round(rating)
      const isPartial = !isFilled && starNumber === Math.ceil(rating) && rating % 1 > 0
      
      return (
        <Star
          key={starNumber}
          className={`${sizeClasses[size]} ${
            isFilled 
              ? 'text-yellow-400 fill-current' 
              : isPartial
                ? 'text-yellow-400 fill-current opacity-50'
                : 'text-gray-300'
          }`}
        />
      )
    })
  }

  const getRatingPercentage = (rating: number) => {
    if (stats.totalReviews === 0) return 0
    return Math.round((stats.ratingDistribution[rating] / stats.totalReviews) * 100)
  }

  const renderRatingBar = (rating: number) => {
    const percentage = getRatingPercentage(rating)
    const count = stats.ratingDistribution[rating] || 0

    return (
      <div key={rating} className="flex items-center gap-3">
        <div className="flex items-center gap-1 min-w-[60px]">
          <span className="text-sm text-gray-600">{rating}</span>
          <Star className="w-3 h-3 text-yellow-400 fill-current" />
        </div>
        
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        <span className="text-sm text-gray-500 min-w-[40px] text-right">
          {count}
        </span>
      </div>
    )
  }

  return (
    <div className="modern-card p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Rating Summary</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Overall Rating */}
        <div className="text-center">
          <div className="mb-3">
            {renderStars(stats.averageRating, 'lg')}
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {stats.averageRating.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">
            out of 5 stars
          </div>
          <div className="text-sm text-gray-500 mt-2">
            {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900 mb-3">Rating Breakdown</h4>
          {[5, 4, 3, 2, 1].map(rating => renderRatingBar(rating))}
        </div>
      </div>

      {/* No Reviews State */}
      {stats.totalReviews === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <Star className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-gray-500">No reviews yet</p>
          <p className="text-sm text-gray-400">Be the first to review this book!</p>
        </div>
      )}
    </div>
  )
} 