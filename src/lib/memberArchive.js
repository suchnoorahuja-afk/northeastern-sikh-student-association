import { supabase } from './supabase'

export async function getMemberArchive() {
    const { data, error } = await supabase
        .from('member_archive')
        .select('*')
        .order('graduation_year', { ascending: false })
        .order('display_order', { ascending: true })

    if (error) {
        throw error
    }

    return data || []
}
