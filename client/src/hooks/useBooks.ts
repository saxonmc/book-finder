import { useQuery } from '@tanstack/react-query';

export interface Book {
  id: string;
  title: string;
  authors: string[];
  description: string;
  publishedDate: string;
  pageCount: number;
  categories: string[];
  averageRating: number;
  ratingsCount: number;
  imageLinks: {
    thumbnail: string;
    smallThumbnail: string;
  };
  industryIdentifiers: Array<{
    type: string;
    identifier: string;
  }>;
  language: string;
  previewLink: string;
  infoLink: string;
}

export interface SearchFilters {
  genre?: string;
  publicationYearStart?: number;
  publicationYearEnd?: number;
  pageCountMin?: number;
  pageCountMax?: number;
  language?: string;
  rating?: number;
  printType?: string;
}

// Google Books API base URL
const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1';

// Search books using Google Books API
const searchBooksAPI = async (query: string, filters: SearchFilters = {}): Promise<{ items: Book[]; totalItems: number }> => {
  if (!query.trim()) {
    return { items: [], totalItems: 0 };
  }

  // Build search query with filters
  let searchQuery = query;
  
  if (filters.genre) {
    searchQuery += ` subject:${filters.genre}`;
  }
  
  if (filters.language) {
    searchQuery += ` lang:${filters.language}`;
  }
  
  if (filters.printType) {
    searchQuery += ` printType:${filters.printType}`;
  }

  // Add publication year filter
  if (filters.publicationYearStart || filters.publicationYearEnd) {
    const startYear = filters.publicationYearStart || 0;
    const endYear = filters.publicationYearEnd || new Date().getFullYear();
    searchQuery += ` ${startYear}-${endYear}`;
  }

  const params = new URLSearchParams({
    q: searchQuery,
    maxResults: '40', // Get more results
    orderBy: 'relevance',
    fields: 'items(id,volumeInfo),totalItems'
  });

  try {
    const response = await fetch(`${GOOGLE_BOOKS_API}/volumes?${params}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.items) {
      return { items: [], totalItems: 0 };
    }

    // Transform and filter results
    let books = data.items.map((item: any) => ({
      id: item.id,
      title: item.volumeInfo?.title || 'Unknown Title',
      authors: item.volumeInfo?.authors || ['Unknown Author'],
      description: item.volumeInfo?.description || 'No description available.',
      publishedDate: item.volumeInfo?.publishedDate || '',
      pageCount: item.volumeInfo?.pageCount || 0,
      categories: item.volumeInfo?.categories || [],
      averageRating: item.volumeInfo?.averageRating || 0,
      ratingsCount: item.volumeInfo?.ratingsCount || 0,
      imageLinks: item.volumeInfo?.imageLinks || {
        thumbnail: 'https://via.placeholder.com/128x192?text=No+Image',
        smallThumbnail: 'https://via.placeholder.com/128x192?text=No+Image'
      },
      industryIdentifiers: item.volumeInfo?.industryIdentifiers || [],
      language: item.volumeInfo?.language || 'en',
      previewLink: item.volumeInfo?.previewLink || '',
      infoLink: item.volumeInfo?.infoLink || ''
    }));

    // Apply client-side filters that can't be done via API
    if (filters.pageCountMin || filters.pageCountMax) {
      books = books.filter((book: Book) => {
        if (filters.pageCountMin && book.pageCount < filters.pageCountMin) return false;
        if (filters.pageCountMax && book.pageCount > filters.pageCountMax) return false;
        return true;
      });
    }

    if (filters.rating) {
      books = books.filter((book: Book) => book.averageRating >= filters.rating!);
    }

    return { items: books, totalItems: data.totalItems };
  } catch (error) {
    console.error('Error searching books:', error);
    throw error;
  }
};

// Get book details by ID
const getBookByIdAPI = async (id: string): Promise<Book> => {
  try {
    const response = await fetch(`${GOOGLE_BOOKS_API}/volumes/${id}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      id: data.id,
      title: data.volumeInfo?.title || 'Unknown Title',
      authors: data.volumeInfo?.authors || ['Unknown Author'],
      description: data.volumeInfo?.description || 'No description available.',
      publishedDate: data.volumeInfo?.publishedDate || '',
      pageCount: data.volumeInfo?.pageCount || 0,
      categories: data.volumeInfo?.categories || [],
      averageRating: data.volumeInfo?.averageRating || 0,
      ratingsCount: data.volumeInfo?.ratingsCount || 0,
      imageLinks: data.volumeInfo?.imageLinks || {
        thumbnail: 'https://via.placeholder.com/128x192?text=No+Image',
        smallThumbnail: 'https://via.placeholder.com/128x192?text=No+Image'
      },
      industryIdentifiers: data.volumeInfo?.industryIdentifiers || [],
      language: data.volumeInfo?.language || 'en',
      previewLink: data.volumeInfo?.previewLink || '',
      infoLink: data.volumeInfo?.infoLink || ''
    };
  } catch (error) {
    console.error('Error fetching book:', error);
    throw error;
  }
};

// Get top selling books (using bestsellers search)
const getTopSellingBooksAPI = async (): Promise<Book[]> => {
  try {
    const response = await fetch(`${GOOGLE_BOOKS_API}/volumes?q=bestseller&maxResults=20&orderBy=relevance`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.items) {
      return [];
    }

    return data.items.map((item: any) => ({
      id: item.id,
      title: item.volumeInfo?.title || 'Unknown Title',
      authors: item.volumeInfo?.authors || ['Unknown Author'],
      description: item.volumeInfo?.description || 'No description available.',
      publishedDate: item.volumeInfo?.publishedDate || '',
      pageCount: item.volumeInfo?.pageCount || 0,
      categories: item.volumeInfo?.categories || [],
      averageRating: item.volumeInfo?.averageRating || 0,
      ratingsCount: item.volumeInfo?.ratingsCount || 0,
      imageLinks: item.volumeInfo?.imageLinks || {
        thumbnail: 'https://via.placeholder.com/128x192?text=No+Image',
        smallThumbnail: 'https://via.placeholder.com/128x192?text=No+Image'
      },
      industryIdentifiers: item.volumeInfo?.industryIdentifiers || [],
      language: item.volumeInfo?.language || 'en',
      previewLink: item.volumeInfo?.previewLink || '',
      infoLink: item.volumeInfo?.infoLink || ''
    }));
  } catch (error) {
    console.error('Error fetching top selling books:', error);
    return [];
  }
};

// Get personal recommendations based on user's library
const getPersonalRecommendationsAPI = async (): Promise<Book[]> => {
  try {
    // Get user's library to base recommendations on
    const userLibrary = localStorage.getItem('userLibrary');
    let searchTerms = ['fiction', 'nonfiction']; // Default search terms
    
    if (userLibrary) {
      try {
        const library = JSON.parse(userLibrary);
        if (library.length > 0) {
          // Use categories from user's books for recommendations
          const categories = library
            .map((book: any) => book.categories || [])
            .flat()
            .slice(0, 3); // Take top 3 categories
          
          if (categories.length > 0) {
            searchTerms = categories;
          }
        }
      } catch (e) {
        console.error('Error parsing user library:', e);
      }
    }

    // Search for books in user's preferred categories
    const recommendations: Book[] = [];
    
    for (const term of searchTerms.slice(0, 2)) { // Limit to 2 terms to avoid too many requests
      try {
        const response = await fetch(`${GOOGLE_BOOKS_API}/volumes?q=subject:${term}&maxResults=10&orderBy=relevance`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.items) {
            const books = data.items.map((item: any) => ({
              id: item.id,
              title: item.volumeInfo?.title || 'Unknown Title',
              authors: item.volumeInfo?.authors || ['Unknown Author'],
              description: item.volumeInfo?.description || 'No description available.',
              publishedDate: item.volumeInfo?.publishedDate || '',
              pageCount: item.volumeInfo?.pageCount || 0,
              categories: item.volumeInfo?.categories || [],
              averageRating: item.volumeInfo?.averageRating || 0,
              ratingsCount: item.volumeInfo?.ratingsCount || 0,
              imageLinks: item.volumeInfo?.imageLinks || {
                thumbnail: 'https://via.placeholder.com/128x192?text=No+Image',
                smallThumbnail: 'https://via.placeholder.com/128x192?text=No+Image'
              },
              industryIdentifiers: item.volumeInfo?.industryIdentifiers || [],
              language: item.volumeInfo?.language || 'en',
              previewLink: item.volumeInfo?.previewLink || '',
              infoLink: item.volumeInfo?.infoLink || ''
            }));
            
            recommendations.push(...books);
          }
        }
      } catch (error) {
        console.error(`Error fetching recommendations for ${term}:`, error);
      }
    }

    // Remove duplicates and limit results
    const uniqueBooks = recommendations.filter((book, index, self) => 
      index === self.findIndex(b => b.id === book.id)
    );

    return uniqueBooks.slice(0, 20);
  } catch (error) {
    console.error('Error fetching personal recommendations:', error);
    return [];
  }
};

// React Query hooks
export const useSearchBooks = (query: string, filters: SearchFilters = {}) => {
  return useQuery({
    queryKey: ['searchBooks', query, filters],
    queryFn: () => searchBooksAPI(query, filters),
    enabled: !!query.trim(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  });
};

export const useBook = (id: string) => {
  return useQuery({
    queryKey: ['book', id],
    queryFn: () => getBookByIdAPI(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2
  });
};

export const useTopSellingBooks = () => {
  return useQuery({
    queryKey: ['topSellingBooks'],
    queryFn: getTopSellingBooksAPI,
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 2
  });
};

export const usePersonalRecommendations = () => {
  return useQuery({
    queryKey: ['personalRecommendations'],
    queryFn: getPersonalRecommendationsAPI,
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 2
  });
}; 