import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { events, todos } from '../lib/supabase'

const AddEvent = () => {
  const [eventDate, setEventDate] = useState('')
  const [eventName, setEventName] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('📅')
  const [todoList, setTodoList] = useState([{ id: 1, text: '', completed: false }])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const { user } = useAuth()
  const navigate = useNavigate()

  // Available icons for events
  const availableIcons = [
    '📅', '🎉', '💼', '🏠', '🚗', '✈️', '🏥', '🎓',
    '💪', '🍽️', '🛍️', '📱', '💻', '📚', '🎵', '🎨',
    '⚽', '🎮', '🎬', '📺', '🌟', '❤️', '🔔', '⏰',
    '🎯', '💡', '🔧', '🎪', '🎭', '🎸', '📷', '✍️'
  ]

  // Add new todo item
  const addTodo = () => {
    const newTodo = {
      id: Date.now(),
      text: '',
      completed: false
    }
    setTodoList([...todoList, newTodo])
  }

  // Remove todo item
  const removeTodo = (id) => {
    setTodoList(todoList.filter(todo => todo.id !== id))
  }

  // Update todo text
  const updateTodoText = (id, text) => {
    setTodoList(todoList.map(todo => 
      todo.id === id ? { ...todo, text } : todo
    ))
  }

  // Toggle todo completion
  const toggleTodoCompletion = (id) => {
    setTodoList(todoList.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  // Validation functions
  const hasValidTodos = todoList.some(todo => todo.text.trim() !== '')
  const canAddTodo = (currentTodo) => currentTodo.text.trim() !== ''
  const canSaveEvent = eventDate && eventName.trim() && selectedIcon && hasValidTodos && !saving

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSaveEvent || !user) return

    setSaving(true)
    setError('')

    try {
      console.log('Creating event...', { eventDate, eventName, selectedIcon })

      // Create the event
      const eventData = {
        name: eventName,
        icon: selectedIcon,
        date: eventDate
      }

      const { data: eventResult, error: eventError } = await events.create(eventData, user.id)
      
      if (eventError) {
        throw new Error(eventError.message)
      }

      console.log('Event created:', eventResult)
      const createdEvent = eventResult[0] // Supabase returns array

      // Create todos for the event
      const validTodos = todoList
        .filter(todo => todo.text.trim() !== '')
        .map(todo => ({
          text: todo.text.trim(),
          completed: todo.completed
        }))

      if (validTodos.length > 0) {
        console.log('Creating todos...', validTodos)
        
        const { data: todosResult, error: todosError } = await todos.createMultiple(validTodos, createdEvent.id)
        
        if (todosError) {
          throw new Error(todosError.message)
        }

        console.log('Todos created:', todosResult)
      }

      // Success! Navigate to the day view
      console.log('Event and todos created successfully!')
      navigate(`/day/${eventDate}`)

    } catch (err) {
      console.error('Error saving event:', err)
      setError(err.message || 'Failed to save event. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 h-full">
      <div className="bg-white rounded-lg shadow-sm h-full flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Add New Event</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Create a new event with your todo list</p>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* Error Message */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Date Selection */}
            <div>
              <label htmlFor="eventDate" className="block text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
                📅 Choose Date
              </label>
              <input
                type="date"
                id="eventDate"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full max-w-sm px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-base sm:text-lg"
                required
                disabled={saving}
              />
            </div>

            {/* Event Name */}
            <div>
              <label htmlFor="eventName" className="block text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
                ✏️ Event Name
              </label>
              <input
                type="text"
                id="eventName"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="Enter your event name..."
                className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-base sm:text-lg"
                required
                disabled={saving}
              />
            </div>

            {/* Icon Selection */}
            <div>
              <label className="block text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
                🎨 Choose Icon
              </label>
              <div className="border border-gray-300 rounded-lg p-3 sm:p-4 bg-gray-50">
                <div className="mb-3">
                  <span className="text-xs sm:text-sm text-gray-600">Selected: </span>
                  <span className="text-xl sm:text-2xl ml-2 p-1.5 sm:p-2 bg-white rounded border border-cyan-200">
                    {selectedIcon}
                  </span>
                </div>
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1.5 sm:gap-2 max-h-32 sm:max-h-40 overflow-y-auto">
                  {availableIcons.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setSelectedIcon(icon)}
                      disabled={saving}
                      className={`p-2 sm:p-3 text-lg sm:text-2xl rounded-lg border-2 transition-all hover:scale-105 sm:hover:scale-110 ${
                        selectedIcon === icon
                          ? 'border-cyan-500 bg-cyan-100 shadow-md'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title={`Select ${icon} icon`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Todo List */}
            <div>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <label className="block text-base sm:text-lg font-semibold text-gray-900">
                  ✅ Todo List
                </label>
              </div>

              <div className="space-y-2 sm:space-y-3">
                {todoList.map((todo, index) => (
                  <div key={todo.id} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-500 font-medium min-w-[20px] sm:min-w-[30px] text-sm sm:text-base">
                      {index + 1}.
                    </span>
                    
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTodoCompletion(todo.id)}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600 bg-gray-100 border-gray-300 rounded focus:ring-cyan-500 focus:ring-2"
                      disabled={saving}
                    />
                    
                    <input
                      type="text"
                      value={todo.text}
                      onChange={(e) => updateTodoText(todo.id, e.target.value)}
                      placeholder="Enter todo item..."
                      className={`flex-1 px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm sm:text-base ${
                        todo.completed ? 'line-through text-gray-500 bg-gray-100' : ''
                      }`}
                      disabled={saving}
                    />
                    
                    {/* Add Todo Button - disabled until current todo has text */}
                    <button
                      type="button"
                      onClick={addTodo}
                      disabled={!canAddTodo(todo) || saving}
                      className={`p-1.5 sm:p-2 rounded transition-colors ${
                        canAddTodo(todo) && !saving
                          ? 'bg-green-500 hover:bg-green-600 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      title={canAddTodo(todo) ? "Add new todo" : "Enter text in this todo first"}
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                    
                    {/* Remove Todo Button */}
                    {todoList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTodo(todo.id)}
                        disabled={saving}
                        className="text-red-500 hover:text-red-700 p-1.5 sm:p-2 rounded transition-colors disabled:opacity-50"
                        title="Remove todo"
                      >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200">
              <Link
                to="/"
                className="w-full sm:w-auto px-4 py-2.5 sm:px-6 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={!canSaveEvent}
                className={`w-full sm:w-auto px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  canSaveEvent
                    ? 'bg-cyan-500 hover:bg-cyan-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                title={
                  !canSaveEvent 
                    ? "Please fill in all fields: date, event name, icon, and at least one todo item"
                    : "Save your event"
                }
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving Event...
                  </>
                ) : (
                  'Save Event'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddEvent 