import { supabase } from './supabase'

export async function getEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: true })

  if (error) {
    throw error
  }

  return data || []
}

export function formatEventDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`)

  return {
    month: date
      .toLocaleString('en-US', { month: 'short' })
      .toUpperCase(),

    day: String(date.getDate()).padStart(2, '0'),
  }
}
