import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Calendar from './components/Calendar'
import AddEvent from './components/AddEvent'
import DayEvents from './components/DayEvents'
import Login from './components/Login'
import Signup from './components/Signup'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'

function App() {

  useEffect(() => {
    const setCookie = (name, value) => {
      document.cookie = `${name}=${value}; path=/`
    }

    // analytics
    setCookie('_ga', 'GA1.2.123456789')
    setCookie('analytics_session', 'abc123')
    setCookie('gtm_id', 'GTM-ABC123')

    // marketing
    setCookie('_fbp', 'fb.1.123456789')
    setCookie('marketing_pixel', 'pixel123')
    setCookie('ads_tracking', 'ads123')

    // functional
    setCookie('user_pref', 'dark_theme')
    setCookie('lang', 'en')
    setCookie('theme', 'dark')

    // performance
    setCookie('perf_tracking', 'perf123')
    setCookie('speed_metric', 'speed123')
    setCookie('load_time', 'load123')

    // other
    setCookie('random_cookie', 'random123')
    setCookie('unknown_tracking', 'unknown123')
    setCookie('misc_data', 'misc123')

    // necessary
    setCookie('session_id', 'sess123')
    setCookie('csrf_token', 'token123')
    setCookie('auth_token', 'auth123')
  }, [])

  return (
    <AuthProvider>
      <div id="app" className="h-screen flex flex-col bg-gray-100">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected Routes */}
          <Route path="/*" element={
            <ProtectedRoute>
              <Navbar />
              <div className="flex-1 overflow-auto">
                <div className="h-full py-6">
                  <Routes>
                    <Route path="/" element={<Calendar />} />
                    <Route path="/add-event" element={<AddEvent />} />
                    <Route path="/day/:date" element={<DayEvents />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </div>
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App
