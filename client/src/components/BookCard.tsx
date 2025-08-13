import React from 'react';
import { Link } from 'react-router-dom';
import { Star, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Book } from '@/hooks/useBooks';

interface BookCardProps {
  book: Book;
  className?: string;
}

export const BookCard: React.FC<BookCardProps> = ({ book, className }) => {
  const coverImage = book.imageLinks?.thumbnail || book.imageLinks?.smallThumbnail || 'https://via.placeholder.com/128x192?text=No+Image';
  const authors = book.authors?.join(', ') || 'Unknown Author';
  const genre = book.categories?.[0] || 'Unknown Genre';
  const rating = book.averageRating || 0;
  const ratingsCount = book.ratingsCount || 0;

  return (
    <Link 
      to={`/book/${book.id}`} 
      className={cn(
        'group block transition-all duration-300 hover:scale-105',
        'modern-card p-4 h-full',
        className
      )}
    >
      <div className="flex flex-col h-full">
        {/* Cover Image */}
        <div className="relative mb-4 overflow-hidden rounded-lg">
          <img
            src={coverImage}
            alt={book.title}
            className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/128x192?text=No+Image';
            }}
          />
          {rating > 0 && (
            <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              {rating.toFixed(1)}
            </div>
          )}
        </div>

        {/* Book Info */}
        <div className="flex-1 flex flex-col">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-gentle-600 transition-colors">
            {book.title}
          </h3>
          
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <User className="w-4 h-4 mr-1" />
            <span className="line-clamp-1">{authors}</span>
          </div>

          {book.publishedDate && (
            <p className="text-xs text-gray-500 mb-2">
              {new Date(book.publishedDate).getFullYear()}
            </p>
          )}

          {book.pageCount > 0 && (
            <p className="text-xs text-gray-500 mb-2">
              {book.pageCount} pages
            </p>
          )}

          <div className="mt-auto">
            <span className="inline-block bg-gentle-100 text-gentle-700 text-xs px-2 py-1 rounded-full">
              {genre}
            </span>
          </div>

          {ratingsCount > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              {ratingsCount.toLocaleString()} ratings
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}; 