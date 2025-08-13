import { useQuery } from '@tanstack/react-query'

export interface Book {
  id: string
  title: string
  author: string
  description?: string
  coverImage?: string
  publishedDate?: string
  pageCount?: number
  genre?: string
  rating?: number
  isbn?: string
}

interface SearchResponse {
  books: Book[]
  total: number
}

interface BookResponse {
  book: Book
}

interface RecommendationsResponse {
  books: Book[]
}

// Mock book data for offline search
const mockBooks: Book[] = [
  {
    id: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    description: 'A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.',
    coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop',
    publishedDate: '1925',
    pageCount: 180,
    genre: 'Classic',
    rating: 4.5,
    isbn: '978-0743273565'
  },
  {
    id: '2',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    description: 'The story of young Scout Finch and her father Atticus in a racially divided Alabama town.',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=400&fit=crop',
    publishedDate: '1960',
    pageCount: 281,
    genre: 'Classic',
    rating: 4.8,
    isbn: '978-0446310789'
  },
  {
    id: '3',
    title: '1984',
    author: 'George Orwell',
    description: 'A dystopian novel about totalitarianism and surveillance society.',
    coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop',
    publishedDate: '1949',
    pageCount: 328,
    genre: 'Dystopian',
    rating: 4.6,
    isbn: '978-0451524935'
  },
  {
    id: '4',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    description: 'The story of Elizabeth Bennet and Mr. Darcy in early 19th century England.',
    coverImage: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=300&h=400&fit=crop',
    publishedDate: '1813',
    pageCount: 432,
    genre: 'Romance',
    rating: 4.7,
    isbn: '978-0141439518'
  },
  {
    id: '5',
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    description: 'Bilbo Baggins embarks on an adventure with thirteen dwarves to reclaim their homeland.',
    coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop',
    publishedDate: '1937',
    pageCount: 310,
    genre: 'Fantasy',
    rating: 4.8,
    isbn: '978-0547928241'
  },
  {
    id: '6',
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    description: 'Holden Caulfield recounts his experiences in New York City after being expelled from prep school.',
    coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop',
    publishedDate: '1951',
    pageCount: 277,
    genre: 'Coming-of-age',
    rating: 4.3,
    isbn: '978-0316769488'
  },
  {
    id: '7',
    title: 'Lord of the Flies',
    author: 'William Golding',
    description: 'A group of British boys stranded on an uninhabited island attempt to govern themselves.',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=400&fit=crop',
    publishedDate: '1954',
    pageCount: 224,
    genre: 'Allegory',
    rating: 4.4,
    isbn: '978-0399501487'
  },
  {
    id: '8',
    title: 'Animal Farm',
    author: 'George Orwell',
    description: 'A farm is taken over by its overworked, mistreated animals with disastrous results.',
    coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop',
    publishedDate: '1945',
    pageCount: 112,
    genre: 'Allegory',
    rating: 4.5,
    isbn: '978-0451526342'
  }
]

// Search books with mock data
export const useSearchBooks = (query: string, filters?: any, enabled: boolean = true) => {
  return useQuery<SearchResponse>({
    queryKey: ['books', 'search', query, filters],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      if (!query.trim()) {
        return { books: [], total: 0 }
      }
      
      // Filter books based on search query
      let filteredBooks = mockBooks.filter(book => {
        const searchLower = query.toLowerCase()
        return (
          book.title.toLowerCase().includes(searchLower) ||
          book.author.toLowerCase().includes(searchLower) ||
          book.genre?.toLowerCase().includes(searchLower) ||
          book.description?.toLowerCase().includes(searchLower)
        )
      })
      
      // Apply additional filters if provided
      if (filters) {
        if (filters.genre && filters.genre !== 'all') {
          filteredBooks = filteredBooks.filter(book => book.genre === filters.genre)
        }
        
        if (filters.yearFrom) {
          filteredBooks = filteredBooks.filter(book => 
            book.publishedDate && parseInt(book.publishedDate) >= filters.yearFrom
          )
        }
        
        if (filters.yearTo) {
          filteredBooks = filteredBooks.filter(book => 
            book.publishedDate && parseInt(book.publishedDate) <= filters.yearTo
          )
        }
        
        if (filters.pageCountMin) {
          filteredBooks = filteredBooks.filter(book => 
            book.pageCount && book.pageCount >= filters.pageCountMin
          )
        }
        
        if (filters.pageCountMax) {
          filteredBooks = filteredBooks.filter(book => 
            book.pageCount && book.pageCount <= filters.pageCountMax
          )
        }
        
        if (filters.rating) {
          filteredBooks = filteredBooks.filter(book => 
            book.rating && book.rating >= filters.rating
          )
        }
      }
      
      // Sort books
      if (filters?.orderBy === 'relevance') {
        // Sort by how well the book matches the query
        filteredBooks.sort((a, b) => {
          const aScore = getRelevanceScore(a, query)
          const bScore = getRelevanceScore(b, query)
          return bScore - aScore
        })
      } else if (filters?.orderBy === 'newest') {
        filteredBooks.sort((a, b) => 
          (b.publishedDate || '0').localeCompare(a.publishedDate || '0')
        )
      } else if (filters?.orderBy === 'rating') {
        filteredBooks.sort((a, b) => (b.rating || 0) - (a.rating || 0))
      }
      
      // Limit results
      const maxResults = filters?.maxResults || 20
      const limitedBooks = filteredBooks.slice(0, maxResults)
      
      return {
        books: limitedBooks,
        total: filteredBooks.length
      }
    },
    enabled: enabled && query.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Helper function to calculate relevance score
function getRelevanceScore(book: Book, query: string): number {
  const searchLower = query.toLowerCase()
  let score = 0
  
  if (book.title.toLowerCase().includes(searchLower)) score += 10
  if (book.author.toLowerCase().includes(searchLower)) score += 8
  if (book.genre?.toLowerCase().includes(searchLower)) score += 6
  if (book.description?.toLowerCase().includes(searchLower)) score += 4
  
  return score
}

// Get top selling books with mock data
export const useTopSellingBooks = (limit: number = 6) => {
  return useQuery<RecommendationsResponse>({
    queryKey: ['books', 'top-selling', limit],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Return top-rated books as "top selling"
      const topBooks = [...mockBooks]
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, limit)
      
      return { books: topBooks }
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  })
}

// Get personal recommendations based on user's library (mock data)
export const usePersonalRecommendations = (limit: number = 6) => {
  return useQuery<RecommendationsResponse>({
    queryKey: ['books', 'recommendations', limit],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 400))
      
      // Return random books as "personal recommendations"
      const shuffled = [...mockBooks].sort(() => 0.5 - Math.random())
      return { books: shuffled.slice(0, limit) }
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}

// Get book by ID with mock data
export const useBook = (id: string, enabled: boolean = true) => {
  return useQuery<BookResponse>({
    queryKey: ['book', id],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const book = mockBooks.find(b => b.id === id)
      if (!book) {
        throw new Error('Book not found')
      }
      
      return { book }
    },
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
} 