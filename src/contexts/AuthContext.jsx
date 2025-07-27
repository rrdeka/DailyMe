import { createContext, useContext, useEffect, useState } from 'react'
import { auth } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const currentUser = await auth.getCurrentUser()
        console.log('Initial session check:', currentUser)
        setUser(currentUser)
      } catch (error) {
        console.error('Error getting initial session:', error)
      }
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        const newUser = session?.user || null
        setUser(newUser)
        setLoading(false)
        
        if (newUser) {
          console.log('User logged in:', newUser.email)
        } else {
          console.log('User logged out')
        }
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const signUp = async (email, password) => {
    try {
      setLoading(true)
      console.log('Attempting signup for:', email)
      const { data, error } = await auth.signUp(email, password)
      
      if (error) throw error
      
      console.log('Signup successful:', data)
      return { data, error: null }
    } catch (error) {
      console.error('Signup error:', error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    try {
      setLoading(true)
      console.log('Attempting signin for:', email)
      const { data, error } = await auth.signIn(email, password)
      
      if (error) throw error
      
      console.log('Signin successful:', data)
      return { data, error: null }
    } catch (error) {
      console.error('Signin error:', error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      console.log('Attempting signout')
      const { error } = await auth.signOut()
      
      if (error) throw error
      
      setUser(null)
      console.log('Signout successful')
      return { error: null }
    } catch (error) {
      console.error('Signout error:', error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user
  }

  console.log('AuthContext state:', { user: user?.email, loading, isAuthenticated: !!user })

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 