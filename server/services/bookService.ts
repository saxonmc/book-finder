interface GoogleBook {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    publishedDate?: string;
    pageCount?: number;
    categories?: string[];
    averageRating?: number;
    ratingsCount?: number;
    industryIdentifiers?: Array<{
      type: string;
      identifier: string;
    }>;
  };
}

interface GoogleBooksResponse {
  items?: GoogleBook[];
  totalItems: number;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description?: string;
  coverImage?: string;
  publishedDate?: string;
  pageCount?: number;
  genre?: string;
  rating?: number;
  isbn?: string;
}

export class BookService {
  private baseUrl = 'https://www.googleapis.com/books/v1';

  async searchBooks(query: string, filters: any = {}): Promise<Book[]> {
    try {
      const params = new URLSearchParams({
        q: query,
        maxResults: (filters.maxResults || 20).toString(),
        ...(filters.orderBy && { orderBy: filters.orderBy }),
        ...(filters.printType && filters.printType !== 'all' && { printType: filters.printType }),
        ...(filters.language && { langRestrict: filters.language.toLowerCase() })
      });

      // Add subject/genre filter if specified
      if (filters.genre) {
        params.set('q', `${query} subject:${filters.genre}`);
      }

      // Add year range filter if specified
      if (filters.yearFrom || filters.yearTo) {
        let yearQuery = '';
        if (filters.yearFrom && filters.yearTo) {
          yearQuery = `after:${filters.yearFrom} before:${filters.yearTo}`;
        } else if (filters.yearFrom) {
          yearQuery = `after:${filters.yearFrom}`;
        } else if (filters.yearTo) {
          yearQuery = `before:${filters.yearTo}`;
        }
        params.set('q', `${params.get('q')} ${yearQuery}`);
      }

      const response = await fetch(`${this.baseUrl}/volumes?${params}`);
      
      if (!response.ok) {
        console.warn(`Google Books API returned ${response.status} for query: ${query}`);
        // Return empty array instead of throwing error to allow fallback
        return [];
      }
      
      const data: GoogleBooksResponse = await response.json();
      
      if (!data.items) {
        return [];
      }
      
      let books = data.items.map(this.mapGoogleBookToBook);

      // Apply client-side filters that Google Books API doesn't support
      if (filters.pageCountMin || filters.pageCountMax) {
        books = books.filter(book => {
          if (!book.pageCount) return false;
          if (filters.pageCountMin && book.pageCount < filters.pageCountMin) return false;
          if (filters.pageCountMax && book.pageCount > filters.pageCountMax) return false;
          return true;
        });
      }

      if (filters.rating) {
        books = books.filter(book => book.rating && book.rating >= filters.rating);
      }

      return books;
    } catch (error) {
      console.error('Error searching books:', error);
      return [];
    }
  }

  async getBookById(id: string): Promise<Book | null> {
    try {
      const response = await fetch(`${this.baseUrl}/volumes/${id}`);
      
      if (!response.ok) {
        console.warn(`Google Books API returned ${response.status} for book ID: ${id}`);
        // Return null instead of throwing error to allow fallback
        return null;
      }
      
      const data: GoogleBook = await response.json();
      return this.mapGoogleBookToBook(data);
    } catch (error) {
      console.error('Error fetching book:', error);
      return null;
    }
  }

  async getTopSellingBooks(limit: number = 6): Promise<Book[]> {
    try {
      // Try to fetch from Google Books API first
      const popularQueries = [
        'bestseller fiction',
        'new york times bestseller',
        'popular books 2024'
      ];
      
      const allBooks: Book[] = [];
      
      for (const query of popularQueries) {
        try {
          const response = await fetch(
            `${this.baseUrl}/volumes?q=${encodeURIComponent(query)}&maxResults=${Math.ceil(limit / 2)}&orderBy=relevance`
          );
          
          if (response.ok) {
            const data: GoogleBooksResponse = await response.json();
            if (data.items) {
              allBooks.push(...data.items.map(this.mapGoogleBookToBook));
            }
          }
        } catch (queryError) {
          console.warn(`Failed to fetch query "${query}":`, queryError);
          continue;
        }
      }
      
      // Remove duplicates and limit results
      const uniqueBooks = allBooks.filter((book, index, self) => 
        index === self.findIndex(b => b.id === book.id)
      );
      
      if (uniqueBooks.length > 0) {
        return uniqueBooks.slice(0, limit);
      }
      
      // Fallback to mock data if API fails
      console.log('Using fallback data for top selling books');
      return this.getMockTopSellingBooks(limit);
    } catch (error) {
      console.error('Error fetching top selling books:', error);
      return this.getMockTopSellingBooks(limit);
    }
  }

  async getPersonalRecommendations(userId: number, limit: number = 6): Promise<Book[]> {
    try {
      // Try to fetch from Google Books API first
      const response = await fetch(
        `${this.baseUrl}/volumes?q=subject:fiction&maxResults=${limit}&orderBy=relevance`
      );
      
      if (response.ok) {
        const data: GoogleBooksResponse = await response.json();
        if (data.items) {
          return data.items.map(this.mapGoogleBookToBook);
        }
      }
      
      // Fallback to mock data if API fails
      console.log('Using fallback data for personal recommendations');
      return this.getMockPersonalRecommendations(limit);
    } catch (error) {
      console.error('Error fetching personal recommendations:', error);
      return this.getMockPersonalRecommendations(limit);
    }
  }

  private getMockTopSellingBooks(limit: number): Book[] {
    const mockBooks: Book[] = [
      {
        id: 'mock-1',
        title: 'The Midnight Library',
        author: 'Matt Haig',
        description: 'Between life and death there is a library, and within that library, the shelves go on forever.',
        coverImage: 'https://books.google.com/books/content?id=QxJ-DwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
        publishedDate: '2020-08-13',
        pageCount: 288,
        genre: 'Fiction',
        rating: 4.2,
        isbn: '9780525559474'
      },
      {
        id: 'mock-2',
        title: 'Project Hail Mary',
        author: 'Andy Weir',
        description: 'Ryland Grace is the sole survivor on a desperate, last-chance mission—and if he fails, humanity and the Earth itself will perish.',
        coverImage: 'https://books.google.com/books/content?id=QxJ-DwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
        publishedDate: '2021-05-04',
        pageCount: 496,
        genre: 'Science Fiction',
        rating: 4.5,
        isbn: '9780593135204'
      },
      {
        id: 'mock-3',
        title: 'Klara and the Sun',
        author: 'Kazuo Ishiguro',
        description: 'From the bestselling author of Never Let Me Go and The Remains of the Day, a stunning new novel.',
        coverImage: 'https://books.google.com/books/content?id=QxJ-DwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
        publishedDate: '2021-03-02',
        pageCount: 320,
        genre: 'Fiction',
        rating: 4.1,
        isbn: '9780593318171'
      },
      {
        id: 'mock-4',
        title: 'The Four Winds',
        author: 'Kristin Hannah',
        description: 'From the number-one bestselling author of The Nightingale and The Great Alone comes a powerful American epic about love and heroism.',
        coverImage: 'https://books.google.com/books/content?id=QxJ-DwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
        publishedDate: '2021-02-02',
        pageCount: 464,
        genre: 'Historical Fiction',
        rating: 4.3,
        isbn: '9780312577230'
      },
      {
        id: 'mock-5',
        title: 'The Sanatorium',
        author: 'Sarah Pearse',
        description: 'A chilling debut in which a detective must uncover the dark history of a luxury hotel in the Alps if she has any hopes of solving the murder.',
        coverImage: 'https://books.google.com/books/content?id=QxJ-DwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
        publishedDate: '2021-02-02',
        pageCount: 400,
        genre: 'Thriller',
        rating: 3.8,
        isbn: '9780593296677'
      },
      {
        id: 'mock-6',
        title: 'The Push',
        author: 'Ashley Audrain',
        description: 'A tense, page-turning psychological drama about the making and breaking of a family.',
        coverImage: 'https://books.google.com/books/content?id=QxJ-DwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
        publishedDate: '2021-01-05',
        pageCount: 320,
        genre: 'Psychological Thriller',
        rating: 4.0,
        isbn: '9780593081907'
      }
    ];
    
    return mockBooks.slice(0, limit);
  }

  private getMockPersonalRecommendations(limit: number): Book[] {
    const mockBooks: Book[] = [
      {
        id: 'rec-1',
        title: 'The Seven Husbands of Evelyn Hugo',
        author: 'Taylor Jenkins Reid',
        description: 'Aging and reclusive Hollywood movie icon Evelyn Hugo is finally ready to tell the truth about her glamorous and scandalous life.',
        coverImage: 'https://books.google.com/books/content?id=QxJ-DwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
        publishedDate: '2017-06-13',
        pageCount: 400,
        genre: 'Historical Fiction',
        rating: 4.4,
        isbn: '9781501161933'
      },
      {
        id: 'rec-2',
        title: 'Verity',
        author: 'Colleen Hoover',
        description: 'A struggling writer discovers a manuscript that changes her life forever.',
        coverImage: 'https://books.google.com/books/content?id=QxJ-DwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
        publishedDate: '2021-10-05',
        pageCount: 336,
        genre: 'Thriller',
        rating: 4.3,
        isbn: '9781538724736'
      },
      {
        id: 'rec-3',
        title: 'Tomorrow, and Tomorrow, and Tomorrow',
        author: 'Gabrielle Zevin',
        description: 'A modern love story about two friends finding their way through life.',
        coverImage: 'https://books.google.com/books/content?id=QxJ-DwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
        publishedDate: '2022-07-05',
        pageCount: 416,
        genre: 'Literary Fiction',
        rating: 4.2,
        isbn: '9780593321201'
      },
      {
        id: 'rec-4',
        title: 'Lessons in Chemistry',
        author: 'Bonnie Garmus',
        description: 'A scientist in the 1960s becomes a cooking show host and challenges the status quo.',
        coverImage: 'https://books.google.com/books/content?id=QxJ-DwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
        publishedDate: '2022-04-05',
        pageCount: 400,
        genre: 'Historical Fiction',
        rating: 4.3,
        isbn: '9780385547345'
      },
      {
        id: 'rec-5',
        title: 'The Silent Patient',
        author: 'Alex Michaelides',
        description: 'A woman shoots her husband and then never speaks again.',
        coverImage: 'https://books.google.com/books/content?id=QxJ-DwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
        publishedDate: '2019-02-05',
        pageCount: 352,
        genre: 'Psychological Thriller',
        rating: 4.1,
        isbn: '9781250301697'
      },
      {
        id: 'rec-6',
        title: 'The Invisible Life of Addie LaRue',
        author: 'V.E. Schwab',
        description: 'A young woman makes a Faustian bargain to live forever and is cursed to be forgotten by everyone she meets.',
        coverImage: 'https://books.google.com/books/content?id=QxJ-DwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
        publishedDate: '2020-10-06',
        pageCount: 448,
        genre: 'Fantasy',
        rating: 4.2,
        isbn: '9780765387561'
      }
    ];
    
    return mockBooks.slice(0, limit);
  }

  private mapGoogleBookToBook(googleBook: GoogleBook): Book {
    const isbn = googleBook.volumeInfo.industryIdentifiers?.find(
      id => id.type === 'ISBN_13' || id.type === 'ISBN_10'
    )?.identifier;

    return {
      id: googleBook.id,
      title: googleBook.volumeInfo.title,
      author: googleBook.volumeInfo.authors?.join(', ') || 'Unknown Author',
      description: googleBook.volumeInfo.description,
      coverImage: googleBook.volumeInfo.imageLinks?.thumbnail,
      publishedDate: googleBook.volumeInfo.publishedDate,
      pageCount: googleBook.volumeInfo.pageCount,
      genre: googleBook.volumeInfo.categories?.[0],
      rating: googleBook.volumeInfo.averageRating,
      isbn,
    };
  }
} 