import { Link, useLocation } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

const Navbar = () => {
  const location = useLocation()
  const { user, signOut } = useAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  
  const handleSignOut = async () => {
    await signOut()
    setIsDropdownOpen(false)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Generate user initials from email
  const getUserInitials = (email) => {
    if (!email) return 'U'
    return email.charAt(0).toUpperCase()
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
      <div className="max-w-7xl mx-auto px-2 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Back Link - moved to left side */}
            {(location.pathname === '/add-event' || location.pathname.startsWith('/day/')) && (
              <Link 
                to="/"
                className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </Link>
            )}
            
            <Link to="/" className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
              DailyMe
            </Link>
          </div>
          
          {/* User Avatar Dropdown */}
          <div className="relative" ref={dropdownRef}>
            {user && (
              <>
                {/* Desktop View - Show welcome text and sign out button */}
                <div className="hidden md:flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    Welcome, {user.email}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md transition-colors text-sm"
                  >
                    Sign Out
                  </button>
                </div>

                {/* Mobile View - Show avatar dropdown */}
                <div className="md:hidden">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-10 h-10 rounded-full bg-cyan-500 text-white font-semibold flex items-center justify-center hover:bg-cyan-600 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
                  >
                    {getUserInitials(user.email)}
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                      <div className="py-1">
                        {/* User Info - Not clickable */}
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">Signed in as</p>
                          <p className="text-sm text-gray-600 truncate">{user.email}</p>
                        </div>
                        
                        {/* Sign Out Option */}
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar 