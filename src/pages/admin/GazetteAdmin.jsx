import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

function GazetteAdmin() {
    const [gazettes, setGazettes] = useState([])
    const [gazettesLoading, setGazettesLoading] =
        useState(false)

    const [gazetteDate, setGazetteDate] = useState('')
    const [gazetteTitle, setGazetteTitle] = useState('')
    const [gazetteDescription, setGazetteDescription] =
        useState('')
    const [gazetteFile, setGazetteFile] = useState(null)

    const [gazetteMessage, setGazetteMessage] =
        useState('')
    const [gazetteError, setGazetteError] = useState('')
    const [gazettePublishing, setGazettePublishing] =
        useState(false)

    useEffect(() => {
        loadGazettes()
    }, [])

    async function loadGazettes() {
        setGazettesLoading(true)

        const { data, error } = await supabase
            .from('gazettes')
            .select('*')
            .order('issue_date', { ascending: false })

        if (error) {
            console.error(error)
        } else {
            setGazettes(data || [])
        }

        setGazettesLoading(false)
    }

    function handleGazetteFile(event) {
        const file = event.target.files?.[0]

        setGazetteError('')
        setGazetteMessage('')

        if (!file) {
            setGazetteFile(null)
            return
        }

        if (file.type !== 'application/pdf') {
            setGazetteFile(null)

            setGazetteError(
                'Gazette files must be PDFs.'
            )

            event.target.value = ''
            return
        }

        setGazetteFile(file)
    }

    function formatGazetteDate(dateString) {
        if (!dateString) return ''

        const [year, month] = dateString.split('-')

        const date = new Date(
            Number(year),
            Number(month) - 1,
            1
        )

        return date.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
        })
    }

    async function handleGazettePublish(event) {
        event.preventDefault()

        setGazetteError('')
        setGazetteMessage('')

        if (
            !gazetteDate ||
            !gazetteTitle.trim() ||
            !gazetteFile
        ) {
            setGazetteError(
                'Issue date, title, and PDF are required.'
            )

            return
        }

        setGazettePublishing(true)

        let uploadedFilePath = ''

        try {
            const cleanName = gazetteFile.name
                .replace(/[^a-zA-Z0-9._-]/g, '-')
                .toLowerCase()

            uploadedFilePath = `${Date.now()}-${cleanName}`

            const { error: uploadError } =
                await supabase.storage
                    .from('gazettes')
                    .upload(uploadedFilePath, gazetteFile, {
                        contentType: 'application/pdf',
                        upsert: false,
                    })

            if (uploadError) {
                throw uploadError
            }

            const { data: publicUrlData } =
                supabase.storage
                    .from('gazettes')
                    .getPublicUrl(uploadedFilePath)

            const publicUrl = publicUrlData.publicUrl

            const { error: databaseError } =
                await supabase.from('gazettes').insert({
                    issue_date: `${gazetteDate}-01`,
                    title: gazetteTitle.trim(),
                    description: gazetteDescription.trim(),
                    link: publicUrl,
                    file_path: uploadedFilePath,
                })

            if (databaseError) {
                await supabase.storage
                    .from('gazettes')
                    .remove([uploadedFilePath])

                throw databaseError
            }

            setGazetteMessage(
                'Gazette issue published successfully.'
            )

            setGazetteDate('')
            setGazetteTitle('')
            setGazetteDescription('')
            setGazetteFile(null)

            const input =
                document.getElementById('gazette-pdf')

            if (input) {
                input.value = ''
            }

            await loadGazettes()
        } catch (error) {
            console.error(error)

            setGazetteError(
                `Could not publish Gazette: ${error.message}`
            )
        } finally {
            setGazettePublishing(false)
        }
    }

    async function handleDeleteGazette(gazette) {
        const confirmed = window.confirm(
            `Delete "${gazette.title}"? This will remove the issue from the website.`
        )

        if (!confirmed) return

        setGazetteError('')
        setGazetteMessage('')

        try {
            if (gazette.file_path) {
                const { error: storageError } =
                    await supabase.storage
                        .from('gazettes')
                        .remove([gazette.file_path])

                if (storageError) {
                    throw storageError
                }
            }

            const { error: databaseError } =
                await supabase
                    .from('gazettes')
                    .delete()
                    .eq('id', gazette.id)

            if (databaseError) {
                throw databaseError
            }

            setGazetteMessage(
                'Gazette issue deleted.'
            )

            await loadGazettes()
        } catch (error) {
            console.error(error)

            setGazetteError(
                `Could not delete Gazette: ${error.message}`
            )
        }
    }

    return (
        <>
            <div className="admin-dashboard-card">
                <p className="section-eyebrow">
                    SIKH GAZETTE
                </p>

                <h2>Gazette Management</h2>

                <p className="admin-card-description">
                    Upload a new PDF issue and publish it directly
                    to the website.
                </p>

                <form
                    className="gazette-admin-form"
                    onSubmit={handleGazettePublish}
                >
                    <div className="gazette-form-grid">
                        <label>
                            Issue Month

                            <input
                                type="month"
                                value={gazetteDate}
                                onChange={(event) =>
                                    setGazetteDate(event.target.value)
                                }
                                required
                            />
                        </label>

                        <label>
                            Issue Title

                            <input
                                type="text"
                                value={gazetteTitle}
                                onChange={(event) =>
                                    setGazetteTitle(event.target.value)
                                }
                                placeholder="September 2026"
                                required
                            />
                        </label>
                    </div>

                    <label>
                        Description

                        <textarea
                            value={gazetteDescription}
                            onChange={(event) =>
                                setGazetteDescription(
                                    event.target.value
                                )
                            }
                            placeholder="A short description of this issue..."
                            rows="4"
                        />
                    </label>

                    <label>
                        Gazette PDF

                        <input
                            id="gazette-pdf"
                            type="file"
                            accept="application/pdf,.pdf"
                            onChange={handleGazetteFile}
                            required
                        />
                    </label>

                    {gazetteFile && (
                        <p className="selected-file">
                            Selected PDF:{' '}
                            <strong>{gazetteFile.name}</strong>
                        </p>
                    )}

                    <button
                        type="submit"
                        className="button button-blue"
                        disabled={gazettePublishing}
                    >
                        {gazettePublishing
                            ? 'Publishing...'
                            : 'Publish Gazette'}
                    </button>
                </form>

                {gazetteError && (
                    <div className="admin-error-message">
                        {gazetteError}
                    </div>
                )}

                {gazetteMessage && (
                    <p className="admin-publish-message">
                        {gazetteMessage}
                    </p>
                )}
            </div>

            <div className="admin-dashboard-card admin-current-card">
                <p className="section-eyebrow">
                    CURRENTLY LIVE
                </p>

                <h2>Published Gazette Issues</h2>

                {gazettesLoading && (
                    <p className="admin-card-description">
                        Loading Gazette issues...
                    </p>
                )}

                {!gazettesLoading &&
                    gazettes.length === 0 && (
                        <p className="admin-card-description">
                            No Gazette issues have been published yet.
                        </p>
                    )}

                {!gazettesLoading &&
                    gazettes.length > 0 && (
                        <div className="gazette-admin-list">
                            {gazettes.map((gazette) => (
                                <div
                                    className="gazette-admin-item"
                                    key={gazette.id}
                                >
                                    <div>
                                        <p className="gazette-admin-date">
                                            {formatGazetteDate(
                                                gazette.issue_date
                                            )}
                                        </p>

                                        <h3>{gazette.title}</h3>

                                        {gazette.description && (
                                            <p>{gazette.description}</p>
                                        )}
                                    </div>

                                    <div className="gazette-admin-actions">
                                        <a
                                            href={gazette.link}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="admin-secondary-button"
                                        >
                                            View PDF
                                        </a>

                                        <button
                                            type="button"
                                            className="admin-delete-button"
                                            onClick={() =>
                                                handleDeleteGazette(gazette)
                                            }
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
            </div>
        </>
    )
}

export default GazetteAdmin
