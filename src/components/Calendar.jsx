import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { events } from '../lib/supabase'

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [eventsByDate, setEventsByDate] = useState({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  
  // Helper function to format date without timezone issues
  const formatDateString = (year, month, day) => {
    const y = year.toString()
    const m = (month + 1).toString().padStart(2, '0')
    const d = day.toString().padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  
  // Get today's date for highlighting
  const today = new Date()
  const todayDay = today.getDate()
  const todayMonth = today.getMonth()
  const todayYear = today.getFullYear()
  
  // Get first day of the month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
  const firstDayWeekday = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()
  
  // Get days from previous month
  const lastDayOfPrevMonth = new Date(currentYear, currentMonth, 0).getDate()
  
  // Generate calendar grid
  const calendarDays = []
  
  // Previous month's trailing days
  for (let i = firstDayWeekday - 1; i >= 0; i--) {
    const day = lastDayOfPrevMonth - i
    const prevMonth = currentMonth - 1
    const prevYear = prevMonth < 0 ? currentYear - 1 : currentYear
    const adjustedMonth = prevMonth < 0 ? 11 : prevMonth
    
    calendarDays.push({
      day: day,
      isCurrentMonth: false,
      isPrevMonth: true,
      isToday: false,
      dateString: formatDateString(prevYear, adjustedMonth, day)
    })
  }
  
  // Current month's days
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = day === todayDay && currentMonth === todayMonth && currentYear === todayYear
    calendarDays.push({
      day: day,
      isCurrentMonth: true,
      isPrevMonth: false,
      isToday: isToday,
      dateString: formatDateString(currentYear, currentMonth, day)
    })
  }
  
  // Next month's leading days
  const remainingCells = 42 - calendarDays.length // 6 rows × 7 days
  for (let day = 1; day <= remainingCells; day++) {
    const nextMonth = currentMonth + 1
    const nextYear = nextMonth > 11 ? currentYear + 1 : currentYear
    const adjustedMonth = nextMonth > 11 ? 0 : nextMonth
    
    calendarDays.push({
      day: day,
      isCurrentMonth: false,
      isPrevMonth: false,
      isToday: false,
      dateString: formatDateString(nextYear, adjustedMonth, day)
    })
  }

  // Fetch events for the current month
  useEffect(() => {
    const fetchMonthEvents = async () => {
      if (!user) return

      setLoading(true)
      try {
        // Get first and last date of the calendar view (including prev/next month days)
        const firstDate = calendarDays[0]?.dateString
        const lastDate = calendarDays[calendarDays.length - 1]?.dateString

        if (!firstDate || !lastDate) return

        console.log('Fetching events for month range:', firstDate, 'to', lastDate)

        // Fetch all events for the visible dates
        const eventPromises = calendarDays.map(async (dayObj) => {
          const { data, error } = await events.getForDate(dayObj.dateString, user.id)
          if (error) {
            console.error('Error fetching events for', dayObj.dateString, error)
            return { date: dayObj.dateString, events: [] }
          }
          return { date: dayObj.dateString, events: data || [] }
        })

        const results = await Promise.all(eventPromises)
        
        // Create events by date object
        const eventsMap = {}
        results.forEach(({ date, events: dayEvents }) => {
          if (dayEvents.length > 0) {
            eventsMap[date] = dayEvents
          }
        })

        setEventsByDate(eventsMap)
        console.log('Events by date:', eventsMap)

      } catch (error) {
        console.error('Error fetching month events:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMonthEvents()
  }, [currentMonth, currentYear, user])
  
  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentMonth + direction)
    setCurrentDate(newDate)
  }
  
  const navigateYear = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setFullYear(currentYear + direction)
    setCurrentDate(newDate)
  }
  
  const handleMonthChange = (monthIndex) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(monthIndex)
    setCurrentDate(newDate)
  }

  const handleDateClick = (dateObj) => {
    // Navigate to the day events page for the clicked date
    navigate(`/day/${dateObj.dateString}`)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex flex-col">
      <div className="bg-white rounded-lg shadow-sm flex-1 flex flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 pb-3 sm:pb-4 flex-shrink-0 gap-4 sm:gap-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            {/* Today Button - moved to extreme left */}
            <button
              onClick={() => setCurrentDate(new Date())}
              className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md transition-colors text-sm sm:text-base border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            >
              Today
            </button>
            
            {/* Month and Year Controls */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Month Dropdown */}
              <select 
                value={currentMonth}
                onChange={(e) => handleMonthChange(parseInt(e.target.value))}
                className="text-base sm:text-lg font-medium bg-white border border-gray-200 rounded-md px-2 py-1.5 sm:px-3 sm:py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 flex-1 sm:flex-none"
              >
                {months.map((month, index) => (
                  <option key={month} value={index}>{month}</option>
                ))}
              </select>
              
              {/* Year Navigation */}
              <div className="flex items-center gap-1 sm:gap-2">
                <button 
                  onClick={() => navigateYear(-1)}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <span className="text-lg sm:text-xl font-semibold min-w-[60px] sm:min-w-[80px] text-center">
                  {currentYear}
                </span>
                
                <button 
                  onClick={() => navigateYear(1)}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          {/* Add Event Button - now navigates to add event page */}
          <Link 
            to="/add-event"
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-md font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <span className="text-base sm:text-lg">+</span>
            Add Event
          </Link>
        </div>
        
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-px px-4 sm:px-6 pb-1 sm:pb-2 flex-shrink-0">
          {daysOfWeek.map((day) => (
            <div key={day} className="p-2 sm:p-4 text-center text-xs sm:text-sm font-medium text-gray-600">
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.slice(0, 1)}</span>
            </div>
          ))}
        </div>
        
        {/* Calendar Grid - fills remaining space */}
        <div className="flex-1 px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden h-full">
            {calendarDays.map((dateObj, index) => {
              const dayEvents = eventsByDate[dateObj.dateString] || []
              const hasEvents = dayEvents.length > 0
              
              return (
                <div
                  key={index}
                  onClick={() => handleDateClick(dateObj)}
                  className={`
                    p-1.5 sm:p-3 border-r border-b border-gray-100 last:border-r-0 hover:bg-gray-50 cursor-pointer transition-colors flex flex-col min-h-[60px] sm:min-h-[80px] md:min-h-[100px]
                    ${!dateObj.isCurrentMonth ? 'text-gray-400 bg-gray-50 hover:bg-gray-100' : 'text-gray-900 bg-white hover:bg-blue-50'}
                    ${dateObj.isToday ? 'bg-blue-100 hover:bg-blue-200 ring-1 sm:ring-2 ring-blue-500 ring-inset' : ''}
                    ${index % 7 === 6 ? 'border-r-0' : ''}
                    ${index >= 35 ? 'border-b-0' : ''}
                  `}
                  title={`Click to view events for ${dateObj.dateString}`}
                >
                  <div className={`text-xs sm:text-sm font-medium flex-shrink-0 ${dateObj.isToday ? 'text-blue-700 font-bold' : ''}`}>
                    {dateObj.day}
                  </div>
                  
                  {/* Event indicators */}
                  <div className="mt-1 sm:mt-2 space-y-0.5 sm:space-y-1 flex-1 overflow-hidden">
                    {hasEvents && (
                      <div className="space-y-0.5">
                        {dayEvents.slice(0, 3).map((event) => (
                          <div
                            key={event.id}
                            className="flex items-center gap-1 text-xs truncate"
                            title={event.name}
                          >
                            <span className="text-sm">{event.icon}</span>
                            <span className="truncate text-gray-700 font-medium">
                              {event.name}
                            </span>
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-gray-500 font-medium">
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Calendar 