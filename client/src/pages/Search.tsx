import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search as SearchIcon, Loader2 } from 'lucide-react'
import { useSearchBooks } from '../hooks/useBooks'
import BookCard from '../components/BookCard'
import SearchSuggestions from '../components/SearchSuggestions'
import SearchFilters from '../components/SearchFilters'

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({ 
    maxResults: 20, 
    orderBy: 'relevance',
    genre: undefined,
    yearFrom: undefined,
    yearTo: undefined,
    pageCountMin: undefined,
    pageCountMax: undefined,
    language: undefined,
    rating: undefined,
    printType: 'all'
  })
  
  // Initialize from URL params
  useEffect(() => {
    const urlQuery = searchParams.get('q')
    if (urlQuery) {
      setQuery(urlQuery)
      setSearchTerm(urlQuery)
    }
  }, [searchParams])
  
  const { data, isLoading, error } = useSearchBooks(searchTerm, filters, searchTerm.length > 0)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchTerm(query)
    setSearchParams({ q: query })
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    setSearchTerm(suggestion)
    setSearchParams({ q: suggestion })
  }

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters)
  }

  const handleClearFilters = () => {
    setFilters({ 
      maxResults: 20, 
      orderBy: 'relevance',
      genre: undefined,
      yearFrom: undefined,
      yearTo: undefined,
      pageCountMin: undefined,
      pageCountMax: undefined,
      language: undefined,
      rating: undefined,
      printType: 'all'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gentle-50 to-white">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 text-gray-900">Search Books</h1>
        
        <form onSubmit={handleSearch} className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for books, authors, or genres..."
                className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 border-2 border-gentle-200 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gentle-500 focus:border-gentle-500 shadow-sm text-base"
              />
            </div>
            <button
              type="submit"
              disabled={!query.trim()}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-gentle-600 text-white rounded-xl hover:bg-gentle-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl text-base font-medium"
            >
              Search
            </button>
          </div>
        </form>



      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gentle-600" />
          <span className="ml-2 text-gray-600">Searching for books...</span>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-red-600">Error searching for books. Please try again.</p>
        </div>
      )}

      {data && data.books.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <p className="text-gray-600">No books found for "{searchTerm}"</p>
        </div>
      )}

      {data && data.books.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              Found {data.total} book{data.total !== 1 ? 's' : ''} for "{searchTerm}"
            </p>
            <SearchFilters filters={filters} onFilterChange={handleFilterChange} onClearFilters={handleClearFilters} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {data.books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </div>
      )}

      {!searchTerm && (
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <SearchIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Enter a search term to find books</p>
          </div>
          <SearchSuggestions onSuggestionClick={handleSuggestionClick} />
        </div>
      )}
      </div>
    </div>
  )
} 