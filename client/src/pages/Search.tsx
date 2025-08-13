import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Filter, X } from 'lucide-react';
import { useSearchBooks, SearchFilters as SearchFiltersType } from '@/hooks/useBooks';
import { BookCard } from '@/components/BookCard';
import SearchSuggestions from '@/components/SearchSuggestions';
import SearchFilters from '@/components/SearchFilters';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [showFilters, setShowFilters] = useState(false);

  // Parse filters from URL params
  const filters: SearchFiltersType = {
    genre: searchParams.get('genre') || undefined,
    publicationYearStart: searchParams.get('yearFrom') ? parseInt(searchParams.get('yearFrom')!) : undefined,
    publicationYearEnd: searchParams.get('yearTo') ? parseInt(searchParams.get('yearTo')!) : undefined,
    pageCountMin: searchParams.get('pagesMin') ? parseInt(searchParams.get('pagesMin')!) : undefined,
    pageCountMax: searchParams.get('pagesMax') ? parseInt(searchParams.get('pagesMax')!) : undefined,
    language: searchParams.get('language') || undefined,
    rating: searchParams.get('rating') ? parseFloat(searchParams.get('rating')!) : undefined,
    printType: searchParams.get('printType') || undefined
  };

  const { data, isLoading, error } = useSearchBooks(query, filters);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('q', searchQuery);
    setSearchParams(newParams);
  };

  const handleFilterChange = (newFilters: any) => {
    const newParams = new URLSearchParams(searchParams);
    
    // Update URL params based on filters
    if (newFilters.genre) newParams.set('genre', newFilters.genre);
    else newParams.delete('genre');
    
    if (newFilters.publicationYearStart) newParams.set('yearFrom', newFilters.publicationYearStart.toString());
    else newParams.delete('yearFrom');
    
    if (newFilters.publicationYearEnd) newParams.set('yearTo', newFilters.publicationYearEnd.toString());
    else newParams.delete('yearTo');
    
    if (newFilters.pageCountMin) newParams.set('pagesMin', newFilters.pageCountMin.toString());
    else newParams.delete('pagesMin');
    
    if (newFilters.pageCountMax) newParams.set('pagesMax', newFilters.pageCountMax.toString());
    else newParams.delete('pagesMax');
    
    if (newFilters.language) newParams.set('language', newFilters.language);
    else newParams.delete('language');
    
    if (newFilters.rating) newParams.set('rating', newFilters.rating.toString());
    else newParams.delete('rating');
    
    if (newFilters.printType) newParams.set('printType', newFilters.printType);
    else newParams.delete('printType');
    
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setSearchParams({ q: query });
  };

  const books = data?.items || [];
  const totalResults = data?.totalItems || 0;

  return (
    <div className="min-h-screen gradient-bg-gentle">
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Your Next Book</h1>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-6">
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for books, authors, or genres..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(query)}
              className="w-full pl-12 pr-4 py-3 text-gray-900 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-gentle-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
            />
            <button
              onClick={() => handleSearch(query)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gentle-600 text-white px-4 py-2 rounded-lg hover:bg-gentle-700 transition-colors"
            >
              Search
            </button>
          </div>

          {/* Filter Toggle */}
          <div className="flex justify-center mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg hover:bg-white transition-colors"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <SearchFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          )}
        </div>

        {/* Search Results */}
        {query && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Search Results for "{query}"
              </h2>
              {totalResults > 0 && (
                <p className="text-gray-600">
                  {totalResults.toLocaleString()} results found
                </p>
              )}
            </div>

            {isLoading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gentle-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Searching for books...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-12">
                <p className="text-red-600 mb-2">Error searching for books</p>
                <p className="text-gray-600">Please try again later</p>
              </div>
            )}

            {!isLoading && !error && books.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-2">No books found for "{query}"</p>
                <p className="text-gray-500">Try adjusting your search terms or filters</p>
              </div>
            )}

            {!isLoading && !error && books.length > 0 && (
              <div className="modern-grid">
                {books.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Search Suggestions */}
        {!query && <SearchSuggestions onSuggestionClick={handleSearch} />}
      </div>
    </div>
  );
} 