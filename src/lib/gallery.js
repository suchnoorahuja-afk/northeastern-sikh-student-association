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

export async function getGalleryPhotoPage(offset = 0, limit = 24) {
    const { data, error } = await supabase
        .from('gallery_photos')
        .select('*')
        .order('display_order', { ascending: true })
        .order('id', { ascending: true })
        .range(offset, offset + limit)

    if (error) {
        throw error
    }

    const rows = data || []

    return {
        photos: rows.slice(0, limit),
        hasMore: rows.length > limit,
    }
}
