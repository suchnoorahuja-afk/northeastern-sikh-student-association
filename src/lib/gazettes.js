import { supabase } from './supabase'

export async function getGazettes() {
  const { data, error } = await supabase
    .from('gazettes')
    .select('*')
    .order('issue_date', { ascending: false })

  if (error) {
    throw error
  }

  return data || []
}

export function formatGazetteDate(dateString) {
  if (!dateString) return ''

  const [year, month] = dateString
    .split('-')
    .map(Number)

  const date = new Date(year, month - 1, 1)

  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}
