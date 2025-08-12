import React from 'react'
import { Link } from 'react-router-dom'
import { Search, BookOpen, Star, Sparkles, TrendingUp } from 'lucide-react'
import BookRecommendations from '../components/BookRecommendations'

export default function Home() {
  return (
    <div className="min-h-screen gradient-bg-gentle">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
        <div className="relative container mx-auto container-padding section-padding">
          <div className="text-center mb-16 fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-8 shadow-2xl">
              <BookOpen className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 text-shadow">
              Discover Your Next
              <span className="text-gradient block">Great Read</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed px-4">
              Find, explore, and track your favorite books with our comprehensive search engine powered by real book data
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto mb-8">
              <Link
                to="/search"
                className="btn-primary flex items-center justify-center"
              >
                <Search className="mr-2 h-5 w-5" />
                Start Searching
              </Link>
              <Link
                to="/library"
                className="btn-secondary flex items-center justify-center"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                My Library
              </Link>
            </div>
            <div className="slide-up">
              <Link
                to="/search?q=harry+potter"
                className="inline-flex items-center justify-center px-6 py-3 text-blue-600 hover:text-blue-700 hover:underline transition-all duration-200 font-medium"
              >
                Try "Harry Potter" →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto container-padding section-padding">
        <div className="text-center mb-8 sm:mb-12 slide-up">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to
            <span className="text-gradient"> Find Great Books</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Powerful tools to discover, organize, and enjoy your reading journey
          </p>
        </div>
        
        <div className="modern-grid modern-grid-cols">
          <div className="modern-card p-8 text-center scale-in">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Search className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Advanced Search</h3>
            <p className="text-gray-600 leading-relaxed">
              Search by title, author, genre, or any keyword to find exactly what you're looking for with powerful filters.
            </p>
          </div>
          
          <div className="modern-card p-8 text-center scale-in" style={{ animationDelay: '0.1s' }}>
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Detailed Information</h3>
            <p className="text-gray-600 leading-relaxed">
              Get comprehensive book details including ratings, reviews, publication information, and availability.
            </p>
          </div>
          
          <Link
            to="/library"
            className="modern-card p-8 text-center scale-in group cursor-pointer"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Star className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 group-hover:text-gradient transition-colors">Personal Library</h3>
            <p className="text-gray-600 leading-relaxed">
              Save your favorite books and track your reading progress with a personal account and smart recommendations.
            </p>
          </Link>
        </div>
      </div>

      {/* Book Recommendations */}
      <div className="container mx-auto container-padding section-padding">
        <BookRecommendations />
      </div>
    </div>
  )
} 