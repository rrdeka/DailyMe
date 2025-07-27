import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { events, todos } from '../lib/supabase'

// Keep the formatDate function from mock.js
const formatDate = (dateString) => {
  const date = new Date(dateString)
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }
  return date.toLocaleDateString('en-US', options)
}

const DayEvents = () => {
  const { date } = useParams()
  const { user } = useAuth()
  const [dayEvents, setDayEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        setError(null)
        
        console.log('Fetching events for date:', date, 'user:', user.id)
        const { data, error: fetchError } = await events.getForDate(date, user.id)
        
        if (fetchError) {
          console.error('Error fetching events:', fetchError)
          setError(fetchError.message)
        } else {
          console.log('Events fetched successfully:', data)
          setDayEvents(data || [])
        }
      } catch (err) {
        console.error('Unexpected error:', err)
        setError('Failed to load events')
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [date, user])

  const handleTodoToggle = async (eventId, todoId, currentStatus) => {
    try {
      console.log('Updating todo:', todoId, 'to:', !currentStatus)
      
      const { data, error: updateError } = await todos.updateStatus(todoId, !currentStatus)
      
      if (updateError) {
        console.error('Error updating todo:', updateError)
        return
      }

      // Update local state to reflect the change
      setDayEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === eventId 
            ? {
                ...event,
                todos: event.todos.map(todo => 
                  todo.id === todoId 
                    ? { ...todo, completed: !currentStatus }
                    : todo
                )
              }
            : event
        )
      )
      
      console.log('Todo updated successfully')
    } catch (err) {
      console.error('Error updating todo:', err)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-full">
        <div className="bg-white rounded-lg shadow-sm h-full flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
          <p className="mt-4 text-gray-600">Loading events...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-full">
        <div className="bg-white rounded-lg shadow-sm h-full flex flex-col items-center justify-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Events</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 h-full">
      <div className="bg-white rounded-lg shadow-sm h-full flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">

              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {formatDate(date)}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                {dayEvents.length === 0 
                  ? 'No events scheduled for this day' 
                  : `${dayEvents.length} event${dayEvents.length > 1 ? 's' : ''} scheduled`
                }
              </p>
          </div>
        </div>

        {/* Events Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          {dayEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events today</h3>
              <p className="text-gray-600 mb-6">You have a free day! Why not add an event?</p>
              <Link
                to="/add-event"
                className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
              >
                <span className="text-lg">+</span>
                Add Event
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {dayEvents.map((event) => (
                <div key={event.id} className="bg-gray-50 rounded-lg p-4 sm:p-6 border border-gray-200">
                  {/* Event Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl sm:text-4xl">{event.icon}</span>
                    <div className="flex-1">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                        {event.name}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {event.todos?.filter(todo => todo.completed).length || 0} of {event.todos?.length || 0} tasks completed
                      </p>
                    </div>
                  </div>

                  {/* Todo List */}
                  {event.todos && event.todos.length > 0 && (
                    <div>
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3">
                        ✅ Todo List
                      </h3>
                      <div className="space-y-2 sm:space-y-3">
                        {event.todos.map((todo, index) => (
                          <div key={todo.id} className="flex items-center gap-3 p-2 sm:p-3 bg-white rounded-lg border border-gray-200">
                            <span className="text-gray-500 font-medium min-w-[20px] sm:min-w-[30px] text-sm sm:text-base">
                              {index + 1}.
                            </span>
                            
                            <input
                              type="checkbox"
                              checked={todo.completed}
                              onChange={() => handleTodoToggle(event.id, todo.id, todo.completed)}
                              className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600 bg-gray-100 border-gray-300 rounded focus:ring-cyan-500 focus:ring-2"
                            />
                            
                            <span 
                              className={`flex-1 text-sm sm:text-base ${
                                todo.completed 
                                  ? 'line-through text-gray-500' 
                                  : 'text-gray-900'
                              }`}
                            >
                              {todo.text}
                            </span>
                            
                            {todo.completed && (
                              <span className="text-green-500">
                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs sm:text-sm text-gray-600">Progress</span>
                          <span className="text-xs sm:text-sm text-gray-600">
                            {Math.round(((event.todos?.filter(todo => todo.completed).length || 0) / (event.todos?.length || 1)) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${((event.todos?.filter(todo => todo.completed).length || 0) / (event.todos?.length || 1)) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {dayEvents.length > 0 && (
          <div className="p-4 sm:p-6 border-t border-gray-200 flex-shrink-0">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link
                to="/add-event"
                className="flex-1 sm:flex-none bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center gap-2"
              >
                <span className="text-lg">+</span>
                Add Another Event
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DayEvents 