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

export function isCurrentOrUpcomingEvent(dateString) {
  if (!dateString) return false

  const [year, month, day] = dateString
    .split('-')
    .map(Number)

  if (!year || !month || !day) return false

  const eventDate = new Date(year, month - 1, day)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return eventDate >= today
}
