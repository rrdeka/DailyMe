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
