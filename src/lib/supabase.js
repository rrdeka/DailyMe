import { createClient } from '@supabase/supabase-js'

// Replace these with your actual Supabase project credentials
const supabaseUrl = 'https://pgjkpjgwelixbhnmamko.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnamtwamd3ZWxpeGJobm1hbWtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MTQzODMsImV4cCI6MjA2OTE5MDM4M30.V-_FPBimdnIusFt2jhJeQ3APBaoshPfW-cJBPvwG3Vw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Authentication functions
export const auth = {
  // Sign up new user
  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  },

  // Sign in existing user
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current user
  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // Listen to auth changes
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Database functions for events
export const events = {
  // Get events for a specific date and user
  getForDate: async (date, userId) => {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        todos (*)
      `)
      .eq('date', date)
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    
    return { data, error }
  },

  // Create a new event
  create: async (eventData, userId) => {
    const { data, error } = await supabase
      .from('events')
      .insert([{
        ...eventData,
        user_id: userId
      }])
      .select()
    
    return { data, error }
  },

  // Update an event
  update: async (eventId, updates) => {
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', eventId)
      .select()
    
    return { data, error }
  },

  // Delete an event
  delete: async (eventId) => {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)
    
    return { error }
  }
}

// Database functions for todos
export const todos = {
  // Create todos for an event
  createMultiple: async (todosList, eventId) => {
    const todosWithEventId = todosList.map(todo => ({
      ...todo,
      event_id: eventId
    }))
    
    const { data, error } = await supabase
      .from('todos')
      .insert(todosWithEventId)
      .select()
    
    return { data, error }
  },

  // Update todo completion status
  updateStatus: async (todoId, completed) => {
    const { data, error } = await supabase
      .from('todos')
      .update({ completed })
      .eq('id', todoId)
      .select()
    
    return { data, error }
  },

  // Delete a todo
  delete: async (todoId) => {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', todoId)
    
    return { error }
  }
} 