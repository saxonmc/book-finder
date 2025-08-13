import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, Calendar, BookOpen, User, Plus, Check } from 'lucide-react';
import { useBook } from '@/hooks/useBooks';
import BookAvailability from '@/components/BookAvailability';

export default function BookDetails() {
  const { id } = useParams<{ id: string }>();
  const { data: book, isLoading, error } = useBook(id || '');

  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  // Mock library status check
  const checkLibraryStatus = () => {
    const userLibrary = localStorage.getItem('userLibrary');
    if (!userLibrary) return false;
    try {
      const library = JSON.parse(userLibrary);
      return library.some((libBook: any) => libBook.bookId === id);
    } catch {
      return false;
    }
  };

  const [inLibrary, setInLibrary] = useState(checkLibraryStatus());

  const handleAddToLibrary = async () => {
    if (!book) return;

    try {
      // Mock API call - in real app this would be a backend call
      const userLibrary = localStorage.getItem('userLibrary') || '[]';
      const library = JSON.parse(userLibrary);
      
      const bookToAdd = {
        bookId: book.id,
        title: book.title,
        author: book.authors?.join(', ') || 'Unknown Author',
        coverImage: book.imageLinks?.thumbnail || book.imageLinks?.smallThumbnail || '',
        isbn: book.industryIdentifiers?.[0]?.identifier || '',
        status: 'want-to-read',
        addedAt: new Date().toISOString()
      };

      library.push(bookToAdd);
      localStorage.setItem('userLibrary', JSON.stringify(library));
      setInLibrary(true);
    } catch (error) {
      console.error('Error adding book to library:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg-gentle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gentle-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading book details...</p>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen gradient-bg-gentle flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading book</p>
          <p className="text-gray-600">Please try again later</p>
          <Link to="/search" className="text-gentle-600 hover:text-gentle-700 mt-4 inline-block">
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  const coverImage = book.imageLinks?.thumbnail || book.imageLinks?.smallThumbnail || 'https://via.placeholder.com/300x450?text=No+Image';
  const authors = book.authors?.join(', ') || 'Unknown Author';
  const publishedYear = book.publishedDate ? new Date(book.publishedDate).getFullYear() : 'Unknown';

  return (
    <div className="min-h-screen gradient-bg-gentle">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link 
          to="/search" 
          className="inline-flex items-center gap-2 text-gentle-600 hover:text-gentle-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Search
        </Link>

        {/* Book Details */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
            {/* Book Cover */}
            <div className="lg:col-span-1">
              <div className="relative">
                <img
                  src={coverImage}
                  alt={book.title}
                  className="w-full max-w-sm mx-auto rounded-lg shadow-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/300x450?text=No+Image';
                  }}
                />
                {book.averageRating > 0 && (
                  <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    {book.averageRating.toFixed(1)}
                  </div>
                )}
              </div>

              {/* Add to Library Button */}
              {isLoggedIn && (
                <div className="mt-6 text-center">
                  {inLibrary ? (
                    <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                      <Check className="w-4 h-4" />
                      <span>In Your Library</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleAddToLibrary}
                      className="flex items-center justify-center gap-2 w-full bg-gentle-600 text-white px-6 py-3 rounded-lg hover:bg-gentle-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add to Library
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Book Info */}
            <div className="lg:col-span-2">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{book.title}</h1>
              
              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <User className="w-4 h-4" />
                <span>{authors}</span>
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 mb-6">
                {publishedYear !== 'Unknown' && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{publishedYear}</span>
                  </div>
                )}
                
                {book.pageCount > 0 && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <BookOpen className="w-4 h-4" />
                    <span>{book.pageCount} pages</span>
                  </div>
                )}

                {book.ratingsCount > 0 && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>{book.ratingsCount.toLocaleString()} ratings</span>
                  </div>
                )}
              </div>

              {/* Categories */}
              {book.categories && book.categories.length > 0 && (
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {book.categories.map((category, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gentle-100 text-gentle-700 text-sm rounded-full"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {book.description && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{book.description}</p>
                </div>
              )}

                             {/* Book Availability */}
               <BookAvailability 
                 bookId={book.id}
                 title={book.title}
                 author={authors}
                 isbn={book.industryIdentifiers?.[0]?.identifier}
               />
            </div>
          </div>
        </div>


      </div>
    </div>
  );
} 