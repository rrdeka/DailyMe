import { useState, useEffect } from 'react'
import { supabase, auth } from '../lib/supabase'

const TestSupabase = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dbTest, setDbTest] = useState(null)

  useEffect(() => {
    // Test connection and database
    const runTests = async () => {
      try {
        // Test 1: Authentication connection
        const currentUser = await auth.getCurrentUser()
        setUser(currentUser)
        console.log('✅ Auth connected! Current user:', currentUser)

        // Test 2: Database connection
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .limit(1)
        
        if (error) {
          console.error('❌ Database error:', error)
          setDbTest({ success: false, error: error.message })
        } else {
          console.log('✅ Database connected! Events table accessible')
          setDbTest({ success: true, data })
        }

      } catch (error) {
        console.error('❌ Connection failed:', error)
        setDbTest({ success: false, error: error.message })
      }
      setLoading(false)
    }

    runTests()
  }, [])

  if (loading) {
    return (
      <div className="p-4 bg-blue-100 border border-blue-400 rounded">
        <div className="animate-pulse">🔄 Testing Supabase connection...</div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Authentication Test */}
      <div className="p-4 bg-green-100 border border-green-400 rounded">
        <h3 className="font-bold text-green-800">✅ Authentication Connected!</h3>
        <p className="text-green-700">
          {user ? `Logged in as: ${user.email}` : 'No user logged in (this is normal)'}
        </p>
      </div>

      {/* Database Test */}
      <div className={`p-4 border rounded ${
        dbTest?.success 
          ? 'bg-green-100 border-green-400' 
          : 'bg-red-100 border-red-400'
      }`}>
        <h3 className={`font-bold ${
          dbTest?.success ? 'text-green-800' : 'text-red-800'
        }`}>
          {dbTest?.success ? '✅ Database Connected!' : '❌ Database Error'}
        </h3>
        <p className={dbTest?.success ? 'text-green-700' : 'text-red-700'}>
          {dbTest?.success 
            ? 'Events table is accessible and ready to use!'
            : `Error: ${dbTest?.error}`
          }
        </p>
      </div>

      {/* Instructions */}
      <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">
        <h3 className="font-bold text-yellow-800">📋 Next Steps:</h3>
        <ul className="text-yellow-700 text-sm mt-2 space-y-1">
          <li>1. ✅ If both tests pass, Supabase is ready!</li>
          <li>2. 🔧 If database fails, check SQL commands in Supabase</li>
          <li>3. 🚀 When ready, we'll remove this test component</li>
        </ul>
      </div>
    </div>
  )
}

export default TestSupabase 