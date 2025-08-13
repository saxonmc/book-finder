import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, CreditCard, Headphones, BookOpen, Music, Library, ExternalLink, Loader2, ChevronDown, ChevronUp } from 'lucide-react'

interface Membership {
  id: number
  service: string
  membershipType: string
  price?: string
  status: string
  startDate?: number
  endDate?: number
  notes?: string
}

interface User {
  id: string
  name: string
  email: string
}

const MEMBERSHIP_SERVICES = [
  { 
    id: 'audible', 
    name: 'Audible', 
    icon: Headphones, 
    color: 'bg-orange-500',
    membershipTypes: ['Audible Membership ($7.95/month)']
  },
  { 
    id: 'kindle_unlimited', 
    name: 'Kindle Unlimited', 
    icon: BookOpen, 
    color: 'bg-blue-500',
    membershipTypes: ['Monthly ($11.99/month)', 'Annual ($119.99/year)', 'Student Plan']
  },
  { 
    id: 'spotify', 
    name: 'Spotify', 
    icon: Music, 
    color: 'bg-green-500',
    membershipTypes: ['Free', 'Premium ($9.99/month)', 'Premium Family ($14.99/month)', 'Student Plan']
  },
  { 
    id: 'libby', 
    name: 'Libby (Library)', 
    icon: Library, 
    color: 'bg-purple-500',
    membershipTypes: ['Free with Library Card', 'Digital Library Card']
  },
  { 
    id: 'apple_books', 
    name: 'Apple Books', 
    icon: BookOpen, 
    color: 'bg-gray-800',
    membershipTypes: ['Free', 'Apple One ($16.95/month)', 'Student Plan']
  },
  { 
    id: 'google_play_books', 
    name: 'Google Play Books', 
    icon: BookOpen, 
    color: 'bg-red-500',
    membershipTypes: ['Free', 'Google One ($1.99/month)', 'Student Plan']
  },
  { 
    id: 'scribd', 
    name: 'Scribd', 
    icon: BookOpen, 
    color: 'bg-blue-600',
    membershipTypes: ['Monthly ($11.99/month)', 'Annual ($99.99/year)', 'Student Plan']
  },
  { 
    id: 'kobo', 
    name: 'Kobo Plus', 
    icon: BookOpen, 
    color: 'bg-red-600',
    membershipTypes: ['Monthly ($9.99/month)', 'Annual ($99.99/year)']
  },
  { 
    id: 'hoopla', 
    name: 'Hoopla', 
    icon: Library, 
    color: 'bg-yellow-500',
    membershipTypes: ['Free with Library Card']
  },
  { 
    id: 'overdrive', 
    name: 'OverDrive', 
    icon: Library, 
    color: 'bg-blue-700',
    membershipTypes: ['Free with Library Card']
  },
  { 
    id: 'chirp', 
    name: 'Chirp', 
    icon: Headphones, 
    color: 'bg-pink-500',
    membershipTypes: ['Free', 'Premium ($14.99/month)']
  },
  { 
    id: 'libro_fm', 
    name: 'Libro.fm', 
    icon: Headphones, 
    color: 'bg-indigo-500',
    membershipTypes: ['Monthly ($14.99/month)', 'Annual ($149.99/year)']
  }
]

export default function Profile() {
  const [user, setUser] = useState<User | null>(null)
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showMembershipDropdown, setShowMembershipDropdown] = useState(false)
  const [selectedMemberships, setSelectedMemberships] = useState<string[]>([])

  useEffect(() => {
    loadUserData()
    loadMemberships()
  }, [])

  const loadUserData = async () => {
    try {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
      if (!isLoggedIn) {
        // Redirect to login if not logged in
        window.location.href = '/login'
        return
      }

      const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null')
      if (currentUser) {
        setUser(currentUser)
      } else {
        // No user data, redirect to login
        localStorage.removeItem('currentUser')
        localStorage.removeItem('isLoggedIn')
        window.location.href = '/login'
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const loadMemberships = async () => {
    try {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
      if (!isLoggedIn) return

      // Load memberships from localStorage
      const storedMemberships = JSON.parse(localStorage.getItem('userMemberships') || '[]')
      setMemberships(storedMemberships)
    } catch (error) {
      console.error('Error loading memberships:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddMemberships = async () => {
    if (selectedMemberships.length === 0) {
      alert('Please select at least one membership')
      return
    }

    try {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
      if (!isLoggedIn) return

      // Add each selected membership to localStorage
      const existingMemberships = JSON.parse(localStorage.getItem('userMemberships') || '[]')
      const newMemberships = []

      for (const serviceId of selectedMemberships) {
        const serviceInfo = getServiceInfo(serviceId)
        const membershipData = {
          id: Date.now() + Math.random(), // Generate unique ID
          service: serviceId,
          membershipType: serviceInfo?.membershipTypes[0] || 'Standard Membership',
          price: '',
          status: 'active',
          notes: ''
        }
        newMemberships.push(membershipData)
      }

      const updatedMemberships = [...existingMemberships, ...newMemberships]
      localStorage.setItem('userMemberships', JSON.stringify(updatedMemberships))
      setMemberships(updatedMemberships)

      setShowMembershipDropdown(false)
      setSelectedMemberships([])
    } catch (error) {
      console.error('Error adding memberships:', error)
      alert('Error adding memberships. Please try again.')
    }
  }

  const handleDeleteMembership = async (membershipId: number) => {
    if (!confirm('Are you sure you want to delete this membership?')) return

    try {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
      if (!isLoggedIn) return

      const existingMemberships = JSON.parse(localStorage.getItem('userMemberships') || '[]')
      const updatedMemberships = existingMemberships.filter((m: Membership) => m.id !== membershipId)
      localStorage.setItem('userMemberships', JSON.stringify(updatedMemberships))
      setMemberships(updatedMemberships)
    } catch (error) {
      console.error('Error deleting membership:', error)
    }
  }

  const getServiceInfo = (serviceId: string) => {
    return MEMBERSHIP_SERVICES.find(s => s.id === serviceId)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'expired': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gentle-50 to-white flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-gentle-600" />
          <span className="text-gray-600">Loading profile...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gentle-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* User Info */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gentle-200">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gentle-100 rounded-full flex items-center justify-center">
              <CreditCard className="h-8 w-8 text-gentle-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Memberships Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gentle-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Memberships</h2>
            <div className="relative">
              <button
                onClick={() => setShowMembershipDropdown(!showMembershipDropdown)}
                className="flex items-center space-x-2 bg-gentle-600 text-white px-4 py-2 rounded-lg hover:bg-gentle-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Membership</span>
                {showMembershipDropdown ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              
              {/* Modal Popup */}
              {showMembershipDropdown && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => {
                      setShowMembershipDropdown(false)
                      setSelectedMemberships([])
                    }}
                  />
                  
                  {/* Modal */}
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                      {/* Header */}
                      <div className="flex items-center justify-between p-6 border-b border-gentle-200">
                        <h3 className="text-xl font-semibold text-gray-900">Select Your Memberships</h3>
                        <button
                          onClick={() => {
                            setShowMembershipDropdown(false)
                            setSelectedMemberships([])
                          }}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      
                      {/* Content */}
                      <div className="p-6 overflow-y-auto max-h-[60vh]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {MEMBERSHIP_SERVICES.map(service => (
                            <label key={service.id} className="flex items-center space-x-4 p-4 border border-gentle-200 rounded-xl hover:bg-gentle-50 cursor-pointer transition-colors">
                              <input
                                type="checkbox"
                                checked={selectedMemberships.includes(service.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedMemberships([...selectedMemberships, service.id])
                                  } else {
                                    setSelectedMemberships(selectedMemberships.filter(id => id !== service.id))
                                  }
                                }}
                                className="h-5 w-5 text-gentle-600 focus:ring-gentle-500 border-gentle-300 rounded"
                              />
                              <div className={`w-12 h-12 ${service.color} rounded-xl flex items-center justify-center`}>
                                <service.icon className="h-6 w-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <span className="text-base font-semibold text-gray-900">{service.name}</span>
                                <p className="text-sm text-gray-600 mt-1">{service.membershipTypes[0]}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                      
                      {/* Footer */}
                      <div className="flex space-x-3 p-6 border-t border-gentle-200 bg-gray-50">
                        <button
                          onClick={handleAddMemberships}
                          className="flex-1 bg-gentle-600 text-white px-6 py-3 rounded-xl hover:bg-gentle-700 transition-colors font-semibold"
                        >
                          Add Selected ({selectedMemberships.length})
                        </button>
                        <button
                          onClick={() => {
                            setShowMembershipDropdown(false)
                            setSelectedMemberships([])
                          }}
                          className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-400 transition-colors font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Memberships List */}
          <div className="space-y-4">
            {memberships.length === 0 ? (
              <div className="text-center py-12">
                <Library className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No memberships added yet</p>
                <button
                  onClick={() => setShowMembershipDropdown(true)}
                  className="bg-gentle-600 text-white px-4 py-2 rounded-lg hover:bg-gentle-700 transition-colors"
                >
                  Add Your First Membership
                </button>
              </div>
            ) : (
              memberships.map(membership => {
                const serviceInfo = getServiceInfo(membership.service)
                const IconComponent = serviceInfo?.icon || CreditCard
                
                return (
                  <div key={membership.id} className="flex items-center justify-between p-4 border border-gentle-200 rounded-lg hover:bg-gentle-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 ${serviceInfo?.color || 'bg-gray-500'} rounded-lg flex items-center justify-center`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{serviceInfo?.name || membership.service}</h3>
                        <p className="text-sm text-gray-600">{membership.membershipType}</p>
                        {membership.price && (
                          <p className="text-sm text-gray-500">{membership.price}</p>
                        )}
                        {membership.notes && (
                          <p className="text-sm text-gray-500">{membership.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(membership.status)}`}>
                        {membership.status}
                      </span>
                      <button
                        onClick={() => handleDeleteMembership(membership.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 