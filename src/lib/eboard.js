import { supabase } from './supabase'

export async function getEBoardMembers() {
  const { data, error } = await supabase
    .from('eboard_members')
    .select('*')
    .order('display_order', { ascending: true })
    .order('id', { ascending: true })

  if (error) {
    throw error
  }

  return data || []
}
