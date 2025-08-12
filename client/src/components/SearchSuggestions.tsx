import React from 'react'
import { Search, TrendingUp, Clock } from 'lucide-react'

interface SearchSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void
}

const popularSearches = [
  'Harry Potter',
  'Lord of the Rings',
  'The Hobbit',
  'Game of Thrones',
  'Dune',
  '1984',
  'To Kill a Mockingbird',
  'The Great Gatsby'
]

const recentSearches = [
  'Stephen King',
  'Science Fiction',
  'Mystery',
  'Romance'
]

export default function SearchSuggestions({ onSuggestionClick }: SearchSuggestionsProps) {
  return (
    <div className="space-y-6">
      {/* Popular Searches */}
      <div>
        <div className="flex items-center mb-3">
          <TrendingUp className="h-4 w-4 text-gentle-600 mr-2" />
          <h3 className="font-semibold text-sm text-gray-900">Popular Searches</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {popularSearches.map((search) => (
            <button
              key={search}
              onClick={() => onSuggestionClick(search)}
              className="px-3 py-1 text-sm bg-gentle-100 hover:bg-gentle-200 text-gentle-700 rounded-full transition-colors"
            >
              {search}
            </button>
          ))}
        </div>
      </div>

      {/* Recent Searches */}
      <div>
        <div className="flex items-center mb-3">
          <Clock className="h-4 w-4 text-gentle-600 mr-2" />
          <h3 className="font-semibold text-sm text-gray-900">Recent Searches</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {recentSearches.map((search) => (
            <button
              key={search}
              onClick={() => onSuggestionClick(search)}
              className="px-3 py-1 text-sm bg-gentle-100 hover:bg-gentle-200 text-gentle-700 rounded-full transition-colors"
            >
              {search}
            </button>
          ))}
        </div>
      </div>

      {/* Search Tips */}
      <div className="bg-gentle-50 rounded-lg p-4">
        <h3 className="font-semibold text-sm mb-2 text-gray-900">Search Tips</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Search by title, author, or genre</li>
          <li>• Use quotes for exact phrases</li>
          <li>• Try searching by ISBN for specific books</li>
          <li>• Use keywords like "bestseller" or "award-winning"</li>
        </ul>
      </div>
    </div>
  )
} 