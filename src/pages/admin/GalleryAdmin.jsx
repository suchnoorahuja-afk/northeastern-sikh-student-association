import { useEffect, useState } from 'react'

import { supabase } from '../../lib/supabase'
import { getGalleryPhotos } from '../../lib/gallery'
import {
    MAX_IMAGE_UPLOAD_LABEL,
    optimizeImageFile,
    validateImageFile,
} from '../../lib/uploadFiles'
import './GalleryAdmin.css'

function safeName(name) {
    return String(name || 'photo')
        .replace(/[^a-zA-Z0-9._-]/g, '-')
        .toLowerCase()
}

function GalleryAdmin({ onContentChange }) {
    const [photos, setPhotos] = useState([])
    const [loading, setLoading] = useState(true)
    const [files, setFiles] = useState([])
    const [caption, setCaption] = useState('')
    const [altText, setAltText] = useState('')
    const [uploading, setUploading] = useState(false)
    const [busyId, setBusyId] = useState(null)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    async function loadPhotos() {
        const data = await getGalleryPhotos()
        setPhotos(data)
    }

    useEffect(() => {
        async function initialLoad() {
            try {
                await loadPhotos()
            } catch (loadError) {
                console.error(loadError)
                setError('Could not load gallery photos.')
            } finally {
                setLoading(false)
            }
        }

        initialLoad()
    }, [])

    async function handleFiles(event) {
        const selected = Array.from(
            event.target.files || []
        )

        try {
            await Promise.all(
                selected.map(validateImageFile)
            )
        } catch (validationError) {
            setFiles([])
            event.target.value = ''
            setError(validationError.message)
            return
        }

        setError('')
        setFiles(selected)
    }

    async function handleUpload(event) {
        event.preventDefault()

        if (files.length === 0) {
            setError('Choose at least one photo.')
            return
        }

        setUploading(true)
        setError('')
        setMessage('Uploading photos...')

        const uploadedPaths = []

        try {
            const startingOrder =
                photos.length > 0
                    ? Math.max(
                        ...photos.map(
                            (photo) =>
                                photo.display_order || 0
                        )
                    ) + 1
                    : 0

            const rows = []

            for (
                let index = 0;
                index < files.length;
                index += 1
            ) {
                const file = files[index]
                const optimizedFile =
                    await optimizeImageFile(file)

                const path =
                    `photos/${Date.now()}-${index}-${safeName(
                        file.name
                    )}`

                const { error: uploadError } =
                    await supabase.storage
                        .from('gallery')
                        .upload(path, optimizedFile, {
                            contentType:
                                optimizedFile.type,
                            cacheControl: '31536000',
                            upsert: false,
                        })

                if (uploadError) {
                    throw uploadError
                }

                uploadedPaths.push(path)

                const {
                    data: { publicUrl },
                } = supabase.storage
                    .from('gallery')
                    .getPublicUrl(path)

                rows.push({
                    image_url: publicUrl,
                    image_path: path,
                    caption:
                        files.length === 1
                            ? caption.trim() || null
                            : null,
                    alt_text:
                        files.length === 1
                            ? altText.trim() || null
                            : null,
                    display_order:
                        startingOrder + index,
                })
            }

            const { error: insertError } =
                await supabase
                    .from('gallery_photos')
                    .insert(rows)

            if (insertError) {
                throw insertError
            }

            setFiles([])
            setCaption('')
            setAltText('')

            const input =
                document.getElementById(
                    'gallery-photo-upload'
                )

            if (input) {
                input.value = ''
            }

            await loadPhotos()
            await onContentChange?.()

            setMessage(
                `${rows.length} photo${rows.length === 1 ? '' : 's'
                } added to the gallery.`
            )
        } catch (uploadError) {
            console.error(uploadError)

            if (uploadedPaths.length > 0) {
                const { error: cleanupError } = await supabase.storage
                    .from('gallery')
                    .remove(uploadedPaths)

                if (cleanupError) {
                    setMessage('')
                    setError(
                        `Could not upload photo: ${uploadError.message}. Uploaded files also could not be cleaned up; check Supabase Storage for orphaned files.`
                    )
                    return
                }
            }

            setMessage('')
            setError(
                `Could not upload photo: ${uploadError.message}`
            )
        } finally {
            setUploading(false)
        }
    }

    async function handleDelete(photo) {
        const confirmed = window.confirm(
            'Delete this photo from the gallery?'
        )

        if (!confirmed) return

        setBusyId(photo.id)
        setError('')
        setMessage('')

        try {
            const { error: deleteError } =
                await supabase
                    .from('gallery_photos')
                    .delete()
                    .eq('id', photo.id)

            if (deleteError) {
                throw deleteError
            }

            let cleanupFailed = false

            if (photo.image_path) {
                const { error: storageError } =
                    await supabase.storage
                        .from('gallery')
                        .remove([photo.image_path])

                if (storageError) {
                    console.error(storageError)
                    cleanupFailed = true
                }
            }

            await loadPhotos()
            await onContentChange?.()
            setMessage(
                cleanupFailed
                    ? 'Photo removed from the gallery, but its stored image could not be deleted. Remove the orphaned file from Supabase Storage or try again later.'
                    : 'Photo deleted.'
            )
        } catch (deletePhotoError) {
            console.error(deletePhotoError)

            setError(
                `Could not delete photo: ${deletePhotoError.message}`
            )
        } finally {
            setBusyId(null)
        }
    }

    async function movePhoto(index, direction) {
        const swapIndex = index + direction

        if (
            swapIndex < 0 ||
            swapIndex >= photos.length
        ) {
            return
        }

        const current = photos[index]
        const swap = photos[swapIndex]

        setBusyId(current.id)
        setError('')
        setMessage('')

        try {
            const currentOrder =
                current.display_order ?? index
            const swapOrder =
                swap.display_order ?? swapIndex

            const { error: firstError } =
                await supabase
                    .from('gallery_photos')
                    .update({
                        display_order: swapOrder,
                    })
                    .eq('id', current.id)

            if (firstError) {
                throw firstError
            }

            const { error: secondError } =
                await supabase
                    .from('gallery_photos')
                    .update({
                        display_order: currentOrder,
                    })
                    .eq('id', swap.id)

            if (secondError) {
                throw secondError
            }

            await loadPhotos()
        } catch (moveError) {
            console.error(moveError)

            setError(
                `Could not reorder photos: ${moveError.message}`
            )
        } finally {
            setBusyId(null)
        }
    }

    return (
        <section className="admin-section">
            <div className="admin-section-heading">
                <div>
                    <p className="section-eyebrow">
                        PHOTO GALLERY
                    </p>

                    <h2>Manage Gallery</h2>

                    <p className="admin-card-description">
                        Upload photos that will appear in the
                        public SSAN gallery. You can upload
                        multiple images at once.
                    </p>
                </div>
            </div>

            <form
                className="admin-form gallery-admin-form"
                onSubmit={handleUpload}
            >
                <label>
                    Photos (JPEG, PNG, or WebP; maximum {MAX_IMAGE_UPLOAD_LABEL} each)
                    <input
                        id="gallery-photo-upload"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFiles}
                        required
                    />
                </label>

                {files.length > 0 && (
                    <p className="selected-file">
                        {files.length} photo
                        {files.length === 1 ? '' : 's'} selected
                    </p>
                )}

                {files.length === 1 && (
                    <>
                        <label>
                            Caption
                            <input
                                type="text"
                                value={caption}
                                onChange={(event) =>
                                    setCaption(event.target.value)
                                }
                                placeholder="Optional caption"
                            />
                        </label>

                        <label>
                            Alt Text
                            <input
                                type="text"
                                value={altText}
                                onChange={(event) =>
                                    setAltText(event.target.value)
                                }
                                placeholder="Describe the photo for accessibility"
                            />
                        </label>
                    </>
                )}

                <button
                    type="submit"
                    className="button button-blue"
                    disabled={uploading}
                >
                    {uploading
                        ? 'Uploading...'
                        : 'Upload to Gallery'}
                </button>
            </form>

            {message && (
                <p className="admin-publish-message">
                    {message}
                </p>
            )}

            {error && (
                <p className="admin-error">{error}</p>
            )}

            <div className="admin-current-card">
                <p className="section-eyebrow">
                    CURRENTLY LIVE
                </p>

                <h2>Gallery Photos</h2>

                <p className="admin-card-description">
                    Move photos up or down to control
                    their display order.
                </p>

                {loading && (
                    <p className="admin-card-description">
                        Loading gallery...
                    </p>
                )}

                {!loading && photos.length === 0 && (
                    <p className="admin-card-description">
                        No gallery photos have been uploaded yet.
                    </p>
                )}

                {!loading && photos.length > 0 && (
                    <div className="gallery-admin-grid">
                        {photos.map((photo, index) => (
                            <article
                                className="gallery-admin-item"
                                key={photo.id}
                            >
                                <img
                                    src={photo.image_url}
                                    alt={
                                        photo.alt_text ||
                                        photo.caption ||
                                        'Gallery photo'
                                    }
                                />

                                <div className="gallery-admin-item-content">
                                    {photo.caption && (
                                        <p>{photo.caption}</p>
                                    )}

                                    <div className="gallery-admin-actions">
                                        <button
                                            type="button"
                                            aria-label={`Move photo ${index + 1} up`}
                                            className="admin-secondary-button"
                                            disabled={
                                                index === 0 ||
                                                busyId !== null
                                            }
                                            onClick={() =>
                                                movePhoto(index, -1)
                                            }
                                        >
                                            ↑
                                        </button>

                                        <button
                                            type="button"
                                            aria-label={`Move photo ${index + 1} down`}
                                            className="admin-secondary-button"
                                            disabled={
                                                index ===
                                                photos.length - 1 ||
                                                busyId !== null
                                            }
                                            onClick={() =>
                                                movePhoto(index, 1)
                                            }
                                        >
                                            ↓
                                        </button>

                                        <button
                                            type="button"
                                            className="admin-delete-button"
                                            disabled={
                                                busyId !== null
                                            }
                                            onClick={() =>
                                                handleDelete(photo)
                                            }
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}

export default GalleryAdmin
