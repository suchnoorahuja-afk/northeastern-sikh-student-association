import { useEffect, useState } from 'react'

import { getGalleryPhotos } from '../lib/gallery'
import './Gallery.css'

function Gallery() {
    const [photos, setPhotos] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [selectedPhoto, setSelectedPhoto] = useState(null)

    useEffect(() => {
        async function loadPhotos() {
            try {
                const data = await getGalleryPhotos()
                setPhotos(data)
            } catch (loadError) {
                console.error(loadError)
                setError('Could not load the photo gallery.')
            } finally {
                setLoading(false)
            }
        }

        loadPhotos()
    }, [])

    useEffect(() => {
        function handleKeyDown(event) {
            if (event.key === 'Escape') {
                setSelectedPhoto(null)
            }
        }

        if (selectedPhoto) {
            document.body.style.overflow = 'hidden'
            window.addEventListener('keydown', handleKeyDown)
        }

        return () => {
            document.body.style.overflow = ''
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
                                onClick={() =>
                                    setSelectedPhoto(photo)
                                }
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
                                        'SSAN community'
                                    }
                                    loading="lazy"
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

            {selectedPhoto && (
                <div
                    className="gallery-lightbox"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Photo preview"
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
                                'SSAN community'
                            }
                        />

                        {selectedPhoto.caption && (
                            <p>{selectedPhoto.caption}</p>
                        )}
                    </div>
                </div>
            )}
        </main>
    )
}

export default Gallery
