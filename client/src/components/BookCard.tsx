import React from 'react'
import { Link } from 'react-router-dom'
import { Star, Calendar, BookOpen } from 'lucide-react'

interface Book {
  id: string
  title: string
  author: string
  description?: string
  coverImage?: string
  publishedDate?: string
  pageCount?: number
  genre?: string
  rating?: number
  isbn?: string
}

interface BookCardProps {
  book: Book
}

export default function BookCard({ book }: BookCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.getFullYear()
  }

  return (
    <Link to={`/book/${book.id}`} className="block group">
      <div className="modern-card overflow-hidden h-full transition-all duration-300 group-hover:scale-105">
        {/* Book Cover */}
        <div className="relative aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          {book.coverImage ? (
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-gray-400" />
            </div>
          )}
          
          {/* Rating Badge */}
          {book.rating && (
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1 shadow-sm">
              <Star className="h-3 w-3 text-yellow-500 fill-current" />
              <span className="text-xs font-semibold text-gray-700">{book.rating}</span>
            </div>
          )}
        </div>

        {/* Book Info */}
        <div className="p-3 sm:p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors text-sm sm:text-base">
            {book.title}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-1">
            {book.author}
          </p>
          
          {/* Meta Info */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            {formatDate(book.publishedDate) && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(book.publishedDate)}</span>
              </div>
            )}
            {book.pageCount && (
              <div className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                <span>{book.pageCount} pages</span>
              </div>
            )}
          </div>
          
          {/* Genre Badge */}
          {book.genre && (
            <div className="mt-3">
              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                {book.genre}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
} 