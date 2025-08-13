import React from 'react';
import { useTopSellingBooks, usePersonalRecommendations } from '@/hooks/useBooks';
import { BookCard } from '@/components/BookCard';

export const BookRecommendations: React.FC = () => {
  const { data: topSellingData, isLoading: topSellingLoading, error: topSellingError } = useTopSellingBooks();
  const { data: personalData, isLoading: personalLoading, error: personalError } = usePersonalRecommendations();

  const topSellingBooks = topSellingData || [];
  const personalBooks = personalData || [];

  return (
    <div className="space-y-12">
      {/* Top Selling Books */}
      <section className="slide-up">
        <div className="bg-gradient-to-r from-gentle-500/10 to-gentle-600/10 rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Top Selling Books</h2>
          
          {topSellingLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gentle-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading top selling books...</p>
            </div>
          )}

          {topSellingError && (
            <div className="text-center py-8">
              <p className="text-red-600 mb-2">Failed to load top selling books</p>
              <p className="text-gray-600">Please try again later</p>
            </div>
          )}

          {!topSellingLoading && !topSellingError && topSellingBooks.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">No top selling books available</p>
            </div>
          )}

          {!topSellingLoading && !topSellingError && topSellingBooks.length > 0 && (
            <div className="modern-grid">
              {topSellingBooks.slice(0, 6).map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Personal Recommendations */}
      <section className="slide-up">
        <div className="bg-gradient-to-r from-gentle-600/10 to-gentle-700/10 rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended for You</h2>
          
          {personalLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gentle-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading recommendations...</p>
            </div>
          )}

          {personalError && (
            <div className="text-center py-8">
              <p className="text-red-600 mb-2">Failed to load recommendations</p>
              <p className="text-gray-600">Please try again later</p>
            </div>
          )}

          {!personalLoading && !personalError && personalBooks.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">No recommendations available</p>
              <p className="text-gray-500 text-sm mt-2">Add some books to your library to get personalized recommendations</p>
            </div>
          )}

          {!personalLoading && !personalError && personalBooks.length > 0 && (
            <div className="modern-grid">
              {personalBooks.slice(0, 6).map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}; 