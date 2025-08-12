import React from 'react'
import { Link } from 'react-router-dom'
import { Loader2, TrendingUp, Sparkles, ArrowRight } from 'lucide-react'
import BookCard from './BookCard'
import { useTopSellingBooks, usePersonalRecommendations } from '../hooks/useBooks'

interface BookRecommendationsProps {
  showPersonalRecommendations?: boolean
}

export default function BookRecommendations({ showPersonalRecommendations = true }: BookRecommendationsProps) {
  const { data: topSellingData, isLoading: topSellingLoading, error: topSellingError } = useTopSellingBooks(6)
  const { data: personalData, isLoading: personalLoading, error: personalError } = usePersonalRecommendations(6)

  const isLoggedIn = !!localStorage.getItem('token')

  return (
    <div className="space-y-16">
      {/* Top Selling Books */}
      <section className="slide-up">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Top Selling Books</h2>
              <p className="text-gray-600">Most popular books right now</p>
            </div>
          </div>
          <Link
            to="/search?q=bestseller"
            className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors font-medium hover:bg-blue-50 rounded-lg"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {topSellingLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="text-gray-600 font-medium">Loading top selling books...</span>
            </div>
          </div>
        )}

        {topSellingError && (
          <div className="text-center py-16">
            <div className="modern-card p-8 max-w-md mx-auto">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Oops! Something went wrong</h3>
              <p className="text-gray-600">Failed to load top selling books. Please try again.</p>
            </div>
          </div>
        )}

        {topSellingData && topSellingData.books.length > 0 && (
          <div className="modern-grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {topSellingData.books.map((book, index) => (
              <div key={book.id} style={{ animationDelay: `${index * 0.1}s` }} className="scale-in">
                <BookCard book={book} />
              </div>
            ))}
          </div>
        )}

        {topSellingData && topSellingData.books.length === 0 && (
          <div className="text-center py-16">
            <div className="modern-card p-8 max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No books available</h3>
              <p className="text-gray-600">No top selling books available at the moment.</p>
            </div>
          </div>
        )}
      </section>

      {/* Personal Recommendations */}
      {showPersonalRecommendations && (
        <section className="slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Recommended for You</h2>
                <p className="text-gray-600">Based on your library and preferences</p>
              </div>
            </div>
            <Link
              to="/search"
              className="inline-flex items-center gap-2 px-4 py-2 text-purple-600 hover:text-purple-700 transition-colors font-medium hover:bg-purple-50 rounded-lg"
            >
              Explore more
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {!isLoggedIn && (
            <div className="modern-card p-12 text-center max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Get Personalized Recommendations</h3>
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                Sign in to your account to receive book recommendations based on your reading preferences and discover your next favorite book.
              </p>
              <Link
                to="/login"
                className="btn-primary inline-flex items-center"
              >
                Sign In
              </Link>
            </div>
          )}

          {isLoggedIn && personalLoading && (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                <span className="text-gray-600 font-medium">Loading your recommendations...</span>
              </div>
            </div>
          )}

          {isLoggedIn && personalError && (
            <div className="text-center py-16">
              <div className="modern-card p-8 max-w-md mx-auto">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Oops! Something went wrong</h3>
                <p className="text-gray-600">Failed to load recommendations. Please try again.</p>
              </div>
            </div>
          )}

          {isLoggedIn && personalData && personalData.books.length > 0 && (
            <div className="modern-grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              {personalData.books.map((book, index) => (
                <div key={book.id} style={{ animationDelay: `${index * 0.1}s` }} className="scale-in">
                  <BookCard book={book} />
                </div>
              ))}
            </div>
          )}

          {isLoggedIn && personalData && personalData.books.length === 0 && (
            <div className="modern-card p-12 text-center max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Start Building Your Library</h3>
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                Add some books to your library to get personalized recommendations tailored to your reading preferences.
              </p>
              <Link
                to="/search"
                className="btn-primary inline-flex items-center"
              >
                Search Books
              </Link>
            </div>
          )}
        </section>
      )}
    </div>
  )
} 