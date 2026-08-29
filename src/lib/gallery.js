import { supabase } from './supabase'

export async function getGalleryPhotos() {
    const { data, error } = await supabase
        .from('gallery_photos')
        .select('*')
        .order('display_order', { ascending: true })
        .order('id', { ascending: true })

    if (error) {
        throw error
    }

    return data || []
}
