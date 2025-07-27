// Mock data for events - simulating real API data
export const mockEvents = {
  // Format: 'YYYY-MM-DD': [events array]
  '2024-12-25': [
    {
      id: 1,
      name: 'Christmas Celebration',
      icon: '🎉',
      date: '2024-12-25',
      todos: [
        { id: 1, text: 'Buy Christmas gifts', completed: true },
        { id: 2, text: 'Prepare Christmas dinner', completed: false },
        { id: 3, text: 'Decorate Christmas tree', completed: true },
        { id: 4, text: 'Call family members', completed: false }
      ]
    },
    {
      id: 2,
      name: 'Holiday Shopping',
      icon: '🛍️',
      date: '2024-12-25',
      todos: [
        { id: 5, text: 'Visit shopping mall', completed: false },
        { id: 6, text: 'Buy presents for kids', completed: true }
      ]
    }
  ],
  '2024-12-31': [
    {
      id: 3,
      name: 'New Year Party',
      icon: '🎊',
      date: '2024-12-31',
      todos: [
        { id: 7, text: 'Plan party menu', completed: true },
        { id: 8, text: 'Send invitations', completed: true },
        { id: 9, text: 'Buy decorations', completed: false },
        { id: 10, text: 'Prepare music playlist', completed: false }
      ]
    }
  ],
  '2025-01-01': [
    {
      id: 4,
      name: 'New Year Resolutions',
      icon: '🎯',
      date: '2025-01-01',
      todos: [
        { id: 11, text: 'Write down goals for 2025', completed: false },
        { id: 12, text: 'Plan workout routine', completed: false },
        { id: 13, text: 'Start meditation practice', completed: false }
      ]
    }
  ],
  '2025-01-15': [
    {
      id: 5,
      name: 'Work Project Meeting',
      icon: '💼',
      date: '2025-01-15',
      todos: [
        { id: 14, text: 'Prepare presentation slides', completed: true },
        { id: 15, text: 'Review project timeline', completed: false },
        { id: 16, text: 'Send meeting agenda', completed: true }
      ]
    },
    {
      id: 6,
      name: 'Gym Session',
      icon: '💪',
      date: '2025-01-15',
      todos: [
        { id: 17, text: 'Cardio workout - 30 mins', completed: false },
        { id: 18, text: 'Strength training', completed: false }
      ]
    }
  ],
  '2025-01-20': [
    {
      id: 7,
      name: 'Doctor Appointment',
      icon: '🏥',
      date: '2025-01-20',
      todos: [
        { id: 19, text: 'Bring medical records', completed: false },
        { id: 20, text: 'List current medications', completed: false },
        { id: 21, text: 'Prepare questions to ask', completed: true }
      ]
    }
  ]
}

// Function to get events for a specific date
export const getEventsForDate = (dateString) => {
  return mockEvents[dateString] || []
}

// Function to get all events (for testing)
export const getAllEvents = () => {
  return mockEvents
}

// Function to update todo completion status
export const updateTodoStatus = (eventId, todoId, completed) => {
  // Find the event across all dates
  for (const date in mockEvents) {
    const events = mockEvents[date]
    const event = events.find(e => e.id === eventId)
    if (event) {
      const todo = event.todos.find(t => t.id === todoId)
      if (todo) {
        todo.completed = completed
        return true
      }
    }
  }
  return false
}

// Function to format date for display
export const formatDate = (dateString) => {
  const date = new Date(dateString)
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }
  return date.toLocaleDateString('en-US', options)
} 