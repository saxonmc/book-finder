import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, Calendar, BookOpen, User, Plus, Check } from 'lucide-react';
import { useBook } from '@/hooks/useBooks';
import BookAvailability from '@/components/BookAvailability';
import ReviewForm from '@/components/ReviewForm';
import ReviewCard from '@/components/ReviewCard';
import ReviewStats from '@/components/ReviewStats';

export default function BookDetails() {
  const { id } = useParams<{ id: string }>();
  const { data: book, isLoading, error } = useBook(id || '');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<any>(null);

  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const currentUserId = currentUser?.id;

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

  const handleReviewSubmit = (reviewData: any) => {
    // Mock review submission
    console.log('Review submitted:', reviewData);
    setShowReviewForm(false);
    setEditingReview(null);
  };

  const handleReviewEdit = (review: any) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleReviewDelete = (reviewId: string) => {
    // Mock review deletion
    console.log('Review deleted:', reviewId);
  };

  const handleReviewVote = (reviewId: string, isHelpful: boolean) => {
    // Mock review voting
    console.log('Review voted:', reviewId, isHelpful);
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
  const rating = book.averageRating || 0;
  const ratingsCount = book.ratingsCount || 0;

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
                {rating > 0 && (
                  <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    {rating.toFixed(1)}
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

                {ratingsCount > 0 && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>{ratingsCount.toLocaleString()} ratings</span>
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

        {/* Reviews & Ratings */}
        <div className="mt-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Reviews & Ratings</h2>
              {isLoggedIn && (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="bg-gentle-600 text-white px-4 py-2 rounded-lg hover:bg-gentle-700 transition-colors"
                >
                  Write a Review
                </button>
              )}
            </div>

                         {/* Review Stats */}
             <ReviewStats
               stats={{
                 averageRating: rating,
                 totalReviews: ratingsCount,
                 ratingDistribution: {
                   5: Math.floor(ratingsCount * 0.4),
                   4: Math.floor(ratingsCount * 0.3),
                   3: Math.floor(ratingsCount * 0.2),
                   2: Math.floor(ratingsCount * 0.08),
                   1: Math.floor(ratingsCount * 0.02)
                 }
               }}
             />

             {/* Review Form */}
             {showReviewForm && (
               <ReviewForm
                 bookId={book.id}
                 onSubmit={async (rating: number, review: string) => {
                   handleReviewSubmit({ rating, review });
                 }}
                 onCancel={() => {
                   setShowReviewForm(false);
                   setEditingReview(null);
                 }}
                 initialRating={editingReview?.rating || 0}
                 initialReview={editingReview?.text || ''}
                 isEditing={!!editingReview}
               />
             )}

             {/* Review List */}
             <div className="mt-8 space-y-4">
               {/* Mock reviews - in real app these would come from API */}
               {ratingsCount > 0 && (
                 <>
                   <ReviewCard
                     review={{
                       id: 1,
                       userId: 1,
                       bookId: book.id,
                       rating: 5,
                       review: 'Absolutely fantastic book! The writing is beautiful and the story is captivating.',
                       helpfulVotes: 12,
                       createdAt: Date.now() - 86400000, // 1 day ago
                       user: {
                         id: 1,
                         name: 'Book Lover'
                       }
                     }}
                     currentUserId={currentUserId}
                     onVote={async (reviewId: number, isHelpful: boolean) => {
                       handleReviewVote(reviewId.toString(), isHelpful);
                     }}
                     onRemoveVote={async (reviewId: number) => {
                       // Mock remove vote
                       console.log('Remove vote:', reviewId);
                     }}
                     onEdit={handleReviewEdit}
                     onDelete={async (reviewId: number) => {
                       handleReviewDelete(reviewId.toString());
                     }}
                   />
                   <ReviewCard
                     review={{
                       id: 2,
                       userId: 2,
                       bookId: book.id,
                       rating: 4,
                       review: 'Well-written with interesting characters. Highly recommend for anyone interested in this genre.',
                       helpfulVotes: 8,
                       createdAt: Date.now() - 172800000, // 2 days ago
                       user: {
                         id: 2,
                         name: 'Literary Critic'
                       }
                     }}
                     currentUserId={currentUserId}
                     onVote={async (reviewId: number, isHelpful: boolean) => {
                       handleReviewVote(reviewId.toString(), isHelpful);
                     }}
                     onRemoveVote={async (reviewId: number) => {
                       // Mock remove vote
                       console.log('Remove vote:', reviewId);
                     }}
                     onEdit={handleReviewEdit}
                     onDelete={async (reviewId: number) => {
                       handleReviewDelete(reviewId.toString());
                     }}
                   />
                 </>
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
} 