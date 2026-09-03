import { useEffect, useRef, useState } from 'react'

import { getGalleryPhotoPage } from '../lib/gallery'
import './Gallery.css'

const GALLERY_BATCH_SIZE = 24

function Gallery() {
    const [photos, setPhotos] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [selectedPhoto, setSelectedPhoto] = useState(null)
    const [hasMore, setHasMore] = useState(false)
    const [loadingMore, setLoadingMore] = useState(false)
    const [loadMoreError, setLoadMoreError] = useState('')
    const closeButtonRef = useRef(null)
    const openerRef = useRef(null)

    useEffect(() => {
        async function loadPhotos() {
            try {
                const page = await getGalleryPhotoPage(
                    0,
                    GALLERY_BATCH_SIZE
                )
                setPhotos(page.photos)
                setHasMore(page.hasMore)
            } catch (loadError) {
                console.error(loadError)
                setError('Could not load the photo gallery.')
            } finally {
                setLoading(false)
            }
        }

        loadPhotos()
    }, [])

    async function loadMorePhotos() {
        setLoadingMore(true)
        setLoadMoreError('')

        try {
            const page = await getGalleryPhotoPage(
                photos.length,
                GALLERY_BATCH_SIZE
            )

            setPhotos((current) => {
                const knownIds = new Set(
                    current.map((photo) => photo.id)
                )
                const newPhotos = page.photos.filter(
                    (photo) => !knownIds.has(photo.id)
                )

                return [...current, ...newPhotos]
            })
            setHasMore(page.hasMore)
        } catch (loadError) {
            console.error(loadError)
            setLoadMoreError('Could not load more gallery photos.')
        } finally {
            setLoadingMore(false)
        }
    }

    useEffect(() => {
        function handleKeyDown(event) {
            if (event.key === 'Escape') {
                setSelectedPhoto(null)
            }

            if (event.key === 'Tab') {
                event.preventDefault()
                closeButtonRef.current?.focus()
            }
        }

        if (selectedPhoto) {
            const previousOverflow = document.body.style.overflow
            document.body.style.overflow = 'hidden'
            window.addEventListener('keydown', handleKeyDown)
            closeButtonRef.current?.focus()

            return () => {
                document.body.style.overflow = previousOverflow
                window.removeEventListener('keydown', handleKeyDown)
                openerRef.current?.focus()
            }
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [selectedPhoto])

    return (
        <main className="gallery-page">
            <section className="gallery-heading">
                <p className="gallery-eyebrow">SSAN PHOTO GALLERY</p>
                <h1>Moments from our community</h1>
                <p>
                    A look back at events, celebrations, seva,
                    conversations, and time spent together.
                </p>
            </section>

            {loading && (
                <div className="gallery-state">
                    Loading gallery...
                </div>
            )}

            {!loading && error && (
                <div className="gallery-state gallery-state-error">
                    {error}
                </div>
            )}

            {!loading &&
                !error &&
                photos.length === 0 && (
                    <div className="gallery-empty">
                        <p className="gallery-eyebrow">
                            PHOTO GALLERY
                        </p>
                        <h2>Photos coming soon.</h2>
                        <p>
                            Check back as we add moments from the
                            SSAN community.
                        </p>
                    </div>
                )}

            {!loading &&
                !error &&
                photos.length > 0 && (
                    <section
                        className="gallery-masonry"
                        aria-label="SSAN photo gallery"
                    >
                        {photos.map((photo) => (
                            <button
                                type="button"
                                className="gallery-photo"
                                key={photo.id}
                                onClick={(event) => {
                                    openerRef.current = event.currentTarget
                                    setSelectedPhoto(photo)
                                }}
                                aria-label={`Open ${photo.alt_text ||
                                    photo.caption ||
                                    'gallery photo'
                                    }`}
                            >
                                <img
                                    src={photo.image_url}
                                    alt={
                                        photo.alt_text ||
                                        photo.caption ||
                                        'SSAN community event photo'
                                    }
                                    loading="lazy"
                                    decoding="async"
                                />

                                {photo.caption && (
                                    <span className="gallery-photo-caption">
                                        {photo.caption}
                                    </span>
                                )}
                            </button>
                        ))}
                    </section>
                )}

            {!loading && !error && hasMore && (
                <div className="gallery-load-more">
                    <button
                        type="button"
                        className="button button-blue"
                        onClick={loadMorePhotos}
                        disabled={loadingMore}
                    >
                        {loadingMore ? 'Loading...' : 'Load More'}
                    </button>
                    {loadMoreError && (
                        <p className="gallery-state-error" role="alert">
                            {loadMoreError}
                        </p>
                    )}
                </div>
            )}

            {selectedPhoto && (
                <div
                    className="gallery-lightbox"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Photo preview"
                    aria-describedby={
                        selectedPhoto.caption
                            ? 'gallery-lightbox-caption'
                            : undefined
                    }
                    onMouseDown={(event) => {
                        if (
                            event.target === event.currentTarget
                        ) {
                            setSelectedPhoto(null)
                        }
                    }}
                >
                    <button
                        type="button"
                        ref={closeButtonRef}
                        className="gallery-lightbox-close"
                        onClick={() =>
                            setSelectedPhoto(null)
                        }
                        aria-label="Close photo preview"
                    >
                        ×
                    </button>

                    <div className="gallery-lightbox-content">
                        <img
                            src={selectedPhoto.image_url}
                            alt={
                                selectedPhoto.alt_text ||
                                selectedPhoto.caption ||
                                'SSAN community event photo'
                            }
                        />

                        {selectedPhoto.caption && (
                            <p id="gallery-lightbox-caption">
                                {selectedPhoto.caption}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </main>
    )
}

export default Gallery
