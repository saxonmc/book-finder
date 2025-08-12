import React, { useState, useEffect } from 'react'
import { ExternalLink, ShoppingCart, BookOpen, Library, DollarSign, Clock } from 'lucide-react'

interface BookAvailabilityProps {
  bookId: string
  title: string
  author: string
  isbn?: string
}

interface AvailabilityOption {
  source: string
  type: 'buy' | 'rent' | 'borrow' | 'free'
  price?: string
  url: string
  availability: 'in_stock' | 'limited' | 'out_of_stock' | 'available'
  delivery?: string
  icon: React.ReactNode
}

export default function BookAvailability({ bookId, title, author, isbn }: BookAvailabilityProps) {
  const [availability, setAvailability] = useState<AvailabilityOption[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching availability data
    // In a real app, this would call APIs for Amazon, Barnes & Noble, etc.
    const fetchAvailability = async () => {
      setLoading(true)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data - in production this would come from real APIs
      const mockAvailability: AvailabilityOption[] = [
        {
          source: 'Amazon',
          type: 'buy',
          price: '$12.99',
          url: `https://www.amazon.com/s?k=${encodeURIComponent(title + ' ' + author)}`,
          availability: 'in_stock',
          delivery: 'Free 2-day delivery',
          icon: <ShoppingCart className="h-4 w-4" />
        },
        {
          source: 'Barnes & Noble',
          type: 'buy',
          price: '$14.99',
          url: `https://www.barnesandnoble.com/s/${encodeURIComponent(title + ' ' + author)}`,
          availability: 'in_stock',
          delivery: 'Free shipping on $35+',
          icon: <BookOpen className="h-4 w-4" />
        },
        {
          source: 'Amazon Kindle',
          type: 'buy',
          price: '$9.99',
          url: `https://www.amazon.com/s?k=${encodeURIComponent(title + ' ' + author + ' kindle')}`,
          availability: 'in_stock',
          delivery: 'Instant download',
          icon: <BookOpen className="h-4 w-4" />
        },
        {
          source: 'Audible Plus',
          type: 'rent',
          price: 'Free with $7.95/month',
          url: `https://www.audible.com/search?keywords=${encodeURIComponent(title + ' ' + author)}`,
          availability: 'available',
          delivery: 'Unlimited listening',
          icon: <Clock className="h-4 w-4" />
        },
        {
          source: 'Audible Premium',
          type: 'rent',
          price: 'Free with $14.95/month',
          url: `https://www.audible.com/search?keywords=${encodeURIComponent(title + ' ' + author)}`,
          availability: 'available',
          delivery: '1 credit + Plus catalog',
          icon: <Clock className="h-4 w-4" />
        },
        {
          source: 'Local Library',
          type: 'borrow',
          price: 'Free',
          url: `https://www.worldcat.org/search?q=${encodeURIComponent(title + ' ' + author)}`,
          availability: 'available',
          delivery: 'Check local availability',
          icon: <Library className="h-4 w-4" />
        },
        {
          source: 'Google Books',
          type: 'free',
          price: 'Free preview',
          url: `https://books.google.com/books?id=${bookId}`,
          availability: 'available',
          delivery: 'Online preview',
          icon: <BookOpen className="h-4 w-4" />
        }
      ]
      
      setAvailability(mockAvailability)
      setLoading(false)
    }

    fetchAvailability()
  }, [bookId, title, author])

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'in_stock':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'limited':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'out_of_stock':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'buy':
        return 'bg-blue-100 text-blue-800'
      case 'rent':
        return 'bg-purple-100 text-purple-800'
      case 'borrow':
        return 'bg-green-100 text-green-800'
      case 'free':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="bg-white border border-gentle-200 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-900">
          <DollarSign className="h-5 w-5 mr-2 text-gentle-600" />
          Where to Get This Book
        </h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gentle-600"></div>
          <span className="ml-2 text-gray-600">Loading availability...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gentle-200 rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-900">
        <DollarSign className="h-5 w-5 mr-2 text-gentle-600" />
        Where to Get This Book
      </h3>
      
      <div className="space-y-3">
        {availability.map((option, index) => (
          <div key={index} className="flex items-center justify-between p-4 border border-gentle-200 rounded-lg hover:bg-gentle-50 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="text-gentle-500">
                {option.icon}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">{option.source}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(option.type)}`}>
                    {option.type}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getAvailabilityColor(option.availability)}`}>
                    {option.availability.replace('_', ' ')}
                  </span>
                </div>
                {option.delivery && (
                  <p className="text-sm text-gray-600">{option.delivery}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="font-semibold text-lg text-gray-900">{option.price}</span>
              <a
                href={option.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1 bg-gentle-600 text-white rounded hover:bg-gentle-700 transition-colors text-sm"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View
              </a>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-gentle-50 rounded-lg">
        <p className="text-sm text-gray-600">
          💡 <strong>Tip:</strong> Prices and availability may vary. Check each retailer for the most current information.
        </p>
      </div>
    </div>
  )
} 