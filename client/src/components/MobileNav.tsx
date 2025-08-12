import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Search, BookOpen, Home, User } from 'lucide-react'

export default function MobileNav() {
  const location = useLocation()
  const isLoggedIn = !!localStorage.getItem('token')

  const navItems = [
    {
      path: '/',
      icon: Home,
      label: 'Home',
      active: location.pathname === '/'
    },
    {
      path: '/search',
      icon: Search,
      label: 'Search',
      active: location.pathname === '/search'
    },
    {
      path: '/library',
      icon: BookOpen,
      label: 'Library',
      active: location.pathname === '/library'
    },
    {
      path: isLoggedIn ? '/profile' : '/login',
      icon: User,
      label: isLoggedIn ? 'Profile' : 'Login',
      active: location.pathname === '/profile' || location.pathname === '/login'
    }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-2 px-3 min-w-0 flex-1 transition-colors duration-200 ${
                item.active
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium truncate">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
} 