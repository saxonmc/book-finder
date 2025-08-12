import React, { useState } from 'react'
import { Filter, ChevronDown, X, Calendar, BookOpen, Globe, Star } from 'lucide-react'

interface SearchFiltersProps {
  filters: {
    maxResults: number
    orderBy: string
    genre?: string
    yearFrom?: number
    yearTo?: number
    pageCountMin?: number
    pageCountMax?: number
    language?: string
    rating?: number
    printType?: string
  }
  onFilterChange: (filters: any) => void
  onClearFilters: () => void
}

const GENRES = [
  'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction', 'Fantasy',
  'Thriller', 'Horror', 'Biography', 'History', 'Self-Help', 'Business',
  'Cooking', 'Travel', 'Poetry', 'Drama', 'Comics', 'Children', 'Young Adult'
]

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
  'Russian', 'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi'
]

const PRINT_TYPES = [
  'all', 'books', 'magazines'
]

const YEARS = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i)

export default function SearchFilters({ filters, onFilterChange, onClearFilters }: SearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleFilterChange = (key: string, value: any) => {
    onFilterChange({ ...filters, [key]: value })
  }

  const hasActiveFilters = Object.keys(filters).some(key => 
    key !== 'maxResults' && key !== 'orderBy' && filters[key as keyof typeof filters]
  )

  return (
    <div className="bg-white border border-gentle-200 rounded-xl shadow-sm">
      {/* Filter Header */}
      <div className="flex items-center justify-between p-4 border-b border-gentle-200">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gentle-600" />
          <span className="text-sm font-medium text-gray-900">Advanced Filters</span>
          {hasActiveFilters && (
            <span className="px-2 py-1 text-xs bg-gentle-100 text-gentle-700 rounded-full">
              Active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-xs text-gray-500 hover:text-red-600 transition-colors"
            >
              Clear all
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-sm text-gentle-600 hover:text-gentle-700 transition-colors"
          >
            {isExpanded ? 'Hide' : 'Show'}
            <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Basic Filters (Always Visible) */}
      <div className="px-4 py-3 border-b border-gentle-200">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Results:</label>
            <select
              value={filters.maxResults}
              onChange={(e) => handleFilterChange('maxResults', parseInt(e.target.value))}
              className="text-sm border border-gentle-200 rounded-lg px-3 py-1 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gentle-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={40}>40</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Sort by:</label>
            <select
              value={filters.orderBy}
              onChange={(e) => handleFilterChange('orderBy', e.target.value)}
              className="text-sm border border-gentle-200 rounded-lg px-3 py-1 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gentle-500"
            >
              <option value="relevance">Relevance</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Advanced Filters (Expandable) */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Genre Filter */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
              <BookOpen className="h-4 w-4 text-gentle-600" />
              Genre
            </label>
            <select
              value={filters.genre || ''}
              onChange={(e) => handleFilterChange('genre', e.target.value || undefined)}
              className="w-full text-sm border border-gentle-200 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gentle-500"
            >
              <option value="">All Genres</option>
              {GENRES.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>

          {/* Publication Year Range */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
              <Calendar className="h-4 w-4 text-gentle-600" />
              Publication Year
            </label>
            <div className="flex items-center gap-2">
              <select
                value={filters.yearFrom || ''}
                onChange={(e) => handleFilterChange('yearFrom', e.target.value ? parseInt(e.target.value) : undefined)}
                className="flex-1 text-sm border border-gentle-200 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gentle-500"
              >
                <option value="">From</option>
                {YEARS.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <span className="text-gray-400">to</span>
              <select
                value={filters.yearTo || ''}
                onChange={(e) => handleFilterChange('yearTo', e.target.value ? parseInt(e.target.value) : undefined)}
                className="flex-1 text-sm border border-gentle-200 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gentle-500"
              >
                <option value="">To</option>
                {YEARS.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Page Count Range */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
              <BookOpen className="h-4 w-4 text-gentle-600" />
              Page Count
            </label>
            <div className="flex items-center gap-2">
              <select
                value={filters.pageCountMin || ''}
                onChange={(e) => handleFilterChange('pageCountMin', e.target.value ? parseInt(e.target.value) : undefined)}
                className="flex-1 text-sm border border-gentle-200 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gentle-500"
              >
                <option value="">Min</option>
                <option value={50}>50+</option>
                <option value={100}>100+</option>
                <option value={200}>200+</option>
                <option value={300}>300+</option>
                <option value={500}>500+</option>
              </select>
              <span className="text-gray-400">to</span>
              <select
                value={filters.pageCountMax || ''}
                onChange={(e) => handleFilterChange('pageCountMax', e.target.value ? parseInt(e.target.value) : undefined)}
                className="flex-1 text-sm border border-gentle-200 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gentle-500"
              >
                <option value="">Max</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={300}>300</option>
                <option value={500}>500</option>
                <option value={1000}>1000+</option>
              </select>
            </div>
          </div>

          {/* Language Filter */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
              <Globe className="h-4 w-4 text-gentle-600" />
              Language
            </label>
            <select
              value={filters.language || ''}
              onChange={(e) => handleFilterChange('language', e.target.value || undefined)}
              className="w-full text-sm border border-gentle-200 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gentle-500"
            >
              <option value="">All Languages</option>
              {LANGUAGES.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          {/* Rating Filter */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
              <Star className="h-4 w-4 text-gentle-600" />
              Minimum Rating
            </label>
            <select
              value={filters.rating || ''}
              onChange={(e) => handleFilterChange('rating', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full text-sm border border-gentle-200 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gentle-500"
            >
              <option value="">Any Rating</option>
              <option value={4.5}>4.5+ Stars</option>
              <option value={4.0}>4.0+ Stars</option>
              <option value={3.5}>3.5+ Stars</option>
              <option value={3.0}>3.0+ Stars</option>
            </select>
          </div>

          {/* Print Type Filter */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
              <BookOpen className="h-4 w-4 text-gentle-600" />
              Print Type
            </label>
            <select
              value={filters.printType || 'all'}
              onChange={(e) => handleFilterChange('printType', e.target.value)}
              className="w-full text-sm border border-gentle-200 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gentle-500"
            >
              {PRINT_TYPES.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  )
} 