import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Bookmark, Eye, CheckCircle, Clock, Trash2, Loader2, Filter, X } from 'lucide-react'

interface UserBook {
  id: number
  bookId: string
  title: string
  author: string
  coverImage: string
  status: string
  addedAt: string
}

export default function Library() {
  const [books, setBooks] = useState<UserBook[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadUserLibrary()
  }, [])

  const loadUserLibrary = async () => {
    try {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
      if (!isLoggedIn) {
        window.location.href = '/login'
        return
      }

      // Load books from localStorage
      const storedBooks = JSON.parse(localStorage.getItem('userLibrary') || '[]')
      setBooks(storedBooks)
    } catch (error) {
      console.error('Error loading library:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (userBookId: number, newStatus: string) => {
    try {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
      if (!isLoggedIn) return

      // Update book status in localStorage
      const existingBooks = JSON.parse(localStorage.getItem('userLibrary') || '[]')
      const updatedBooks = existingBooks.map((book: UserBook) => 
        book.id === userBookId ? { ...book, status: newStatus } : book
      )
      
      localStorage.setItem('userLibrary', JSON.stringify(updatedBooks))
      setBooks(updatedBooks)
    } catch (error) {
      console.error('Error updating book status:', error)
    }
  }

  const handleRemoveBook = async (userBookId: number) => {
    if (!confirm('Are you sure you want to remove this book from your library?')) return

    try {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
      if (!isLoggedIn) return

      // Remove book from localStorage
      const existingBooks = JSON.parse(localStorage.getItem('userLibrary') || '[]')
      const updatedBooks = existingBooks.filter((book: UserBook) => book.id !== userBookId)
      
      localStorage.setItem('userLibrary', JSON.stringify(updatedBooks))
      setBooks(updatedBooks)
    } catch (error) {
      console.error('Error removing book:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'want_to_read': return <Bookmark className="h-4 w-4" />
      case 'reading': return <Eye className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'want_to_read': return 'bg-blue-100 text-blue-800'
      case 'reading': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'want_to_read': return 'Want to Read'
      case 'reading': return 'Reading'
      case 'completed': return 'Completed'
      default: return 'Unknown'
    }
  }

  const filteredBooks = statusFilter === 'all' 
    ? books 
    : books.filter(book => book.status === statusFilter)

  const statusCounts = {
    all: books.length,
    want_to_read: books.filter(b => b.status === 'want_to_read').length,
    reading: books.filter(b => b.status === 'reading').length,
    completed: books.filter(b => b.status === 'completed').length
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gentle-50 to-white flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-gentle-600" />
          <span className="text-gray-600">Loading your library...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gentle-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Library</h1>
          <p className="text-gray-600">Manage your personal book collection</p>
        </div>

        {/* Status Filters */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Filter className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filter by status:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Books' },
              { key: 'want_to_read', label: 'Want to Read' },
              { key: 'reading', label: 'Reading' },
              { key: 'completed', label: 'Completed' }
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => setStatusFilter(filter.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === filter.key
                    ? 'bg-gentle-600 text-white'
                    : 'bg-white text-gray-700 border border-gentle-200 hover:bg-gentle-50'
                }`}
              >
                {filter.label} ({statusCounts[filter.key as keyof typeof statusCounts]})
              </button>
            ))}
          </div>
        </div>

        {/* Books Grid */}
        {filteredBooks.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {statusFilter === 'all' ? 'Your library is empty' : `No ${getStatusLabel(statusFilter).toLowerCase()} books`}
            </h3>
            <p className="text-gray-600 mb-6">
              {statusFilter === 'all' 
                ? 'Start building your library by searching for books and adding them to your collection.'
                : `You haven't marked any books as ${getStatusLabel(statusFilter).toLowerCase()} yet.`
              }
            </p>
            <Link
              to="/search"
              className="bg-gentle-600 text-white px-6 py-3 rounded-lg hover:bg-gentle-700 transition-colors"
            >
              Search for Books
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map(book => (
              <div key={book.id} className="bg-white rounded-xl border border-gentle-200 shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden">
                {/* Book Cover */}
                <div className="aspect-[3/4] relative overflow-hidden">
                  {book.coverImage ? (
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gentle-100 flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-gentle-400" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(book.status)}`}>
                      {getStatusLabel(book.status)}
                    </span>
                  </div>
                </div>

                {/* Book Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{book.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{book.author}</p>
                  
                  {/* Status Controls */}
                  <div className="space-y-2">
                    <select
                      value={book.status}
                      onChange={(e) => handleStatusChange(book.id, e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gentle-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gentle-500"
                    >
                      <option value="want_to_read">Want to Read</option>
                      <option value="reading">Reading</option>
                      <option value="completed">Completed</option>
                    </select>
                    
                    <div className="flex space-x-2">
                      <Link
                        to={`/book/${book.bookId}`}
                        className="flex-1 bg-gentle-600 text-white text-sm px-3 py-2 rounded-lg hover:bg-gentle-700 transition-colors text-center"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => handleRemoveBook(book.id)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove from library"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 