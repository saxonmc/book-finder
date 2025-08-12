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

// Search books
export const useSearchBooks = (query: string, filters?: any, enabled: boolean = true) => {
  return useQuery<SearchResponse>({
    queryKey: ['books', 'search', query, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        q: query,
        ...(filters?.maxResults && { maxResults: filters.maxResults.toString() }),
        ...(filters?.orderBy && { orderBy: filters.orderBy }),
        ...(filters?.genre && { genre: filters.genre }),
        ...(filters?.yearFrom && { yearFrom: filters.yearFrom.toString() }),
        ...(filters?.yearTo && { yearTo: filters.yearTo.toString() }),
        ...(filters?.pageCountMin && { pageCountMin: filters.pageCountMin.toString() }),
        ...(filters?.pageCountMax && { pageCountMax: filters.pageCountMax.toString() }),
        ...(filters?.language && { language: filters.language }),
        ...(filters?.rating && { rating: filters.rating.toString() }),
        ...(filters?.printType && { printType: filters.printType })
      })
      
      const response = await fetch(`/api/books/search?${params}`)
      if (!response.ok) {
        throw new Error('Failed to search books')
      }
      return response.json()
    },
    enabled: enabled && query.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Get top selling books
export const useTopSellingBooks = (limit: number = 6) => {
  return useQuery<RecommendationsResponse>({
    queryKey: ['books', 'top-selling', limit],
    queryFn: async () => {
      const response = await fetch(`/api/books/top-selling?limit=${limit}`)
      if (!response.ok) {
        throw new Error('Failed to fetch top selling books')
      }
      return response.json()
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  })
}

// Get personal recommendations based on user's library
export const usePersonalRecommendations = (limit: number = 6) => {
  return useQuery<RecommendationsResponse>({
    queryKey: ['books', 'recommendations', limit],
    queryFn: async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('User not authenticated')
      }
      
      const response = await fetch(`/api/books/recommendations?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations')
      }
      return response.json()
    },
    enabled: !!localStorage.getItem('token'),
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}

// Get book by ID
export const useBook = (id: string, enabled: boolean = true) => {
  return useQuery<BookResponse>({
    queryKey: ['books', id],
    queryFn: async () => {
      const response = await fetch(`/api/books/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch book')
      }
      return response.json()
    },
    enabled: enabled && id.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
} 