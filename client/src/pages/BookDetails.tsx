import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Star, Calendar, BookOpen, User, Tag, Bookmark, Check, MessageSquare } from 'lucide-react'
import { useBook } from '../hooks/useBooks'
import { Loader2 } from 'lucide-react'
import BookAvailability from '../components/BookAvailability'
import ReviewForm from '../components/ReviewForm'
import ReviewCard from '../components/ReviewCard'
import ReviewStats from '../components/ReviewStats'
import { 
  useBookReviews, 
  useBookRatingStats, 
  useUserReview, 
  useCreateReview, 
  useUpdateReview, 
  useDeleteReview, 
  useVoteOnReview, 
  useRemoveVote 
} from '../hooks/useReviews'

export default function BookDetails() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, error } = useBook(id || '', !!id)
  const [isInLibrary, setIsInLibrary] = useState(false)
  const [isAddingToLibrary, setIsAddingToLibrary] = useState(false)
  const [libraryStatus, setLibraryStatus] = useState<string>('')
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [editingReview, setEditingReview] = useState<any>(null)

  // Review hooks
  const { data: reviewsData, isLoading: reviewsLoading } = useBookReviews(id || '', 10, 0)
  const { data: ratingStats, isLoading: statsLoading } = useBookRatingStats(id || '')
  const { data: userReviewData } = useUserReview(id || '')
  
  // Review mutations
  const createReviewMutation = useCreateReview()
  const updateReviewMutation = useUpdateReview()
  const deleteReviewMutation = useDeleteReview()
  const voteMutation = useVoteOnReview()
  const removeVoteMutation = useRemoveVote()

  const isLoggedIn = !!localStorage.getItem('token')
  const currentUserId = isLoggedIn ? JSON.parse(localStorage.getItem('user') || '{}').id : undefined

  useEffect(() => {
    if (id) {
      checkLibraryStatus(id)
    }
  }, [id])

  const checkLibraryStatus = async (bookId: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`/api/user-library/status/${bookId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setIsInLibrary(data.inLibrary)
        setLibraryStatus(data.status || '')
      }
    } catch (error) {
      console.error('Error checking library status:', error)
    }
  }

  const handleAddToLibrary = async () => {
    if (!id || !data?.book) return

    try {
      setIsAddingToLibrary(true)
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Please log in to add books to your library')
        return
      }

      const response = await fetch('/api/user-library/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bookId: id,
          title: data.book.title,
          author: data.book.author,
          coverImage: data.book.coverImage,
          isbn: data.book.isbn,
          status: 'want_to_read'
        })
      })

      if (response.ok) {
        setIsInLibrary(true)
        setLibraryStatus('want_to_read')
      } else {
        alert('Error adding book to library')
      }
    } catch (error) {
      console.error('Error adding to library:', error)
      alert('Error adding book to library')
    } finally {
      setIsAddingToLibrary(false)
    }
  }

  // Review handling functions
  const handleSubmitReview = async (rating: number, review: string) => {
    if (!id) return

    if (editingReview) {
      await updateReviewMutation.mutateAsync({
        reviewId: editingReview.id,
        rating,
        review
      })
      setEditingReview(null)
    } else {
      await createReviewMutation.mutateAsync({
        bookId: id,
        rating,
        review
      })
    }
    setShowReviewForm(false)
  }

  const handleEditReview = (review: any) => {
    setEditingReview(review)
    setShowReviewForm(true)
  }

  const handleDeleteReview = async (reviewId: number) => {
    await deleteReviewMutation.mutateAsync(reviewId)
  }

  const handleVoteOnReview = async (reviewId: number, isHelpful: boolean) => {
    await voteMutation.mutateAsync({ reviewId, isHelpful })
  }

  const handleRemoveVote = async (reviewId: number) => {
    await removeVoteMutation.mutateAsync(reviewId)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gentle-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gentle-600" />
            <span className="ml-2 text-gray-600">Loading book details...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gentle-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-red-600">Error loading book details. Please try again.</p>
            <Link to="/search" className="text-gentle-600 hover:text-gentle-700 hover:underline mt-4 inline-block">
              Back to Search
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const book = data.book

  return (
    <div className="min-h-screen bg-gradient-to-br from-gentle-50 to-white">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <Link 
          to="/search" 
          className="inline-flex items-center text-gray-600 hover:text-gentle-600 mb-4 sm:mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Search
        </Link>

        {/* Book Availability Section - Prominently Displayed */}
        <div className="mb-6 sm:mb-8">
          <BookAvailability 
            bookId={book.id}
            title={book.title}
            author={book.author}
            isbn={book.isbn}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          {/* Book Cover */}
          <div className="md:col-span-1">
            <div className="aspect-[3/4] relative overflow-hidden rounded-xl border border-gentle-200 shadow-lg">
              {book.coverImage ? (
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gentle-100 flex items-center justify-center">
                  <BookOpen className="h-16 w-16 text-gentle-400" />
                </div>
              )}
            </div>
          </div>

          {/* Book Details */}
          <div className="md:col-span-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-gray-900">{book.title}</h1>
            
            <div className="flex items-center text-base sm:text-lg text-gray-600 mb-4 sm:mb-6">
              <User className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-gentle-500" />
              <span>{book.author}</span>
            </div>

          {book.rating && (
            <div className="flex items-center mb-4">
              <Star className="h-5 w-5 text-yellow-500 fill-current mr-2" />
              <span className="text-lg font-semibold text-gray-700">{book.rating.toFixed(1)}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-6">
            {book.publishedDate && (
              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-2 text-gentle-500" />
                <span>{new Date(book.publishedDate).getFullYear()}</span>
              </div>
            )}
            
            {book.pageCount && (
              <div className="flex items-center text-gray-600">
                <BookOpen className="h-4 w-4 mr-2 text-gentle-500" />
                <span>{book.pageCount} pages</span>
              </div>
            )}
            
            {book.genre && (
              <div className="flex items-center text-gray-600">
                <Tag className="h-4 w-4 mr-2 text-gentle-500" />
                <span>{book.genre}</span>
              </div>
            )}
            
            {book.isbn && (
              <div className="flex items-center text-gray-600">
                <span className="font-mono text-sm">ISBN: {book.isbn}</span>
              </div>
            )}
          </div>

          {book.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {book.description}
              </p>
            </div>
          )}

          <div className="flex gap-4">
            {isInLibrary ? (
              <button 
                disabled
                className="px-6 py-3 bg-green-600 text-white rounded-lg flex items-center space-x-2 cursor-not-allowed"
              >
                <Check className="h-5 w-5" />
                <span>In Library</span>
              </button>
            ) : (
              <button 
                onClick={handleAddToLibrary}
                disabled={isAddingToLibrary}
                className="px-6 py-3 bg-gentle-600 text-white rounded-lg hover:bg-gentle-700 transition-colors shadow-lg flex items-center space-x-2 disabled:opacity-50"
              >
                {isAddingToLibrary ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Bookmark className="h-5 w-5" />
                )}
                <span>{isAddingToLibrary ? 'Adding...' : 'Add to Library'}</span>
              </button>
            )}
            
            {isLoggedIn ? (
              userReviewData?.review ? (
                <button 
                  onClick={() => handleEditReview(userReviewData.review)}
                  className="px-6 py-3 border border-gentle-300 text-gentle-700 rounded-lg hover:bg-gentle-50 transition-colors flex items-center space-x-2"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span>Edit Review</span>
                </button>
              ) : (
                <button 
                  onClick={() => setShowReviewForm(true)}
                  className="px-6 py-3 border border-gentle-300 text-gentle-700 rounded-lg hover:bg-gentle-50 transition-colors flex items-center space-x-2"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span>Write Review</span>
                </button>
              )
            ) : (
              <Link 
                to="/login"
                className="px-6 py-3 border border-gentle-300 text-gentle-700 rounded-lg hover:bg-gentle-50 transition-colors flex items-center space-x-2"
              >
                <MessageSquare className="h-5 w-5" />
                <span>Login to Review</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-blue-600" />
            Reviews & Ratings
          </h2>

          {/* Review Form */}
          {showReviewForm && (
            <div className="mb-8">
              <ReviewForm
                bookId={id || ''}
                onSubmit={handleSubmitReview}
                onCancel={() => {
                  setShowReviewForm(false)
                  setEditingReview(null)
                }}
                initialRating={editingReview?.rating || 0}
                initialReview={editingReview?.review || ''}
                isEditing={!!editingReview}
              />
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Rating Stats */}
            <div className="lg:col-span-1">
              {statsLoading ? (
                <div className="modern-card p-6">
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Loading stats...</span>
                  </div>
                </div>
              ) : ratingStats ? (
                <ReviewStats stats={ratingStats} />
              ) : null}
            </div>

            {/* Reviews List */}
            <div className="lg:col-span-2">
              {reviewsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="modern-card p-6">
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        <span className="ml-2 text-gray-600">Loading reviews...</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : reviewsData?.reviews && reviewsData.reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviewsData.reviews.map(review => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      currentUserId={currentUserId}
                      onVote={handleVoteOnReview}
                      onRemoveVote={handleRemoveVote}
                      onEdit={isLoggedIn && currentUserId === review.user.id ? handleEditReview : undefined}
                      onDelete={isLoggedIn && currentUserId === review.user.id ? handleDeleteReview : undefined}
                    />
                  ))}
                </div>
              ) : (
                <div className="modern-card p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
                  <p className="text-gray-600 mb-4">
                    Be the first to share your thoughts about this book!
                  </p>
                  {isLoggedIn && (
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="btn-primary"
                    >
                      Write the First Review
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 