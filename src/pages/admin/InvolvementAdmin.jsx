import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import {
    normalizeExternalUrl,
    safeExternalUrl,
} from '../../lib/externalUrls'

function InvolvementAdmin({ onContentChange }) {
    const [opportunities, setOpportunities] = useState([])
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [link, setLink] = useState('')
    const [status, setStatus] = useState('open')
    const [category, setCategory] = useState('')
    const [editingId, setEditingId] = useState(null)
    const [message, setMessage] = useState('')
    const [saving, setSaving] = useState(false)
    const [deletingId, setDeletingId] = useState(null)
    const [reordering, setReordering] = useState(false)

    useEffect(() => {
        loadOpportunities()
    }, [])

    async function loadOpportunities() {
        const { data, error } = await supabase
            .from('involvement_opportunities')
            .select('*')
            .order('display_order', { ascending: true })
            .order('id', { ascending: true })

        if (error) {
            console.error(error)
            setMessage(
                `Could not load Get Involved opportunities: ${error.message}`
            )
            return
        }

        setOpportunities(data || [])
    }

    function resetForm() {
        setTitle('')
        setDescription('')
        setLink('')
        setStatus('open')
        setCategory('')
        setEditingId(null)
    }

    async function handleSubmit(event) {
        event.preventDefault()

        if (!title.trim()) {
            setMessage('Title is required.')
            return
        }

        setSaving(true)
        setMessage(
            editingId
                ? 'Saving changes...'
                : 'Adding opportunity...'
        )

        try {
            const normalizedLink = normalizeExternalUrl(link)

            if (editingId) {
                const { error } = await supabase
                    .from('involvement_opportunities')
                    .update({
                        title: title.trim(),
                        description: description.trim() || null,
                        link: normalizedLink || null,
                        status,
                        category: category.trim() || null,
                    })
                    .eq('id', editingId)

                if (error) throw error

                setMessage('Opportunity updated successfully.')
            } else {
                const { error } = await supabase
                    .from('involvement_opportunities')
                    .insert({
                        title: title.trim(),
                        description: description.trim() || null,
                        link: normalizedLink || null,
                        status,
                        category: category.trim() || null,
                        display_order: opportunities.length,
                    })

                if (error) throw error

                setMessage('Opportunity added successfully.')
            }

            resetForm()
            await loadOpportunities()
            await onContentChange?.()
        } catch (error) {
            console.error(error)

            setMessage(
                `Could not save opportunity: ${error.message}`
            )
        } finally {
            setSaving(false)
        }
    }

    function handleEdit(opportunity) {
        setEditingId(opportunity.id)
        setTitle(opportunity.title || '')
        setDescription(opportunity.description || '')
        setLink(opportunity.link || '')
        setStatus(opportunity.status || 'open')
        setCategory(opportunity.category || '')
        setMessage('')

        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        })
    }

    async function handleDelete(opportunity) {
        const confirmed = window.confirm(
            `Delete "${opportunity.title}"?`
        )

        if (!confirmed) return

        setDeletingId(opportunity.id)
        setMessage('')

        try {
            const { error } = await supabase
                .from('involvement_opportunities')
                .delete()
                .eq('id', opportunity.id)

            if (error) throw error

            if (editingId === opportunity.id) {
                resetForm()
            }

            setMessage('Opportunity deleted.')
            await loadOpportunities()
            await onContentChange?.()
        } catch (error) {
            console.error(error)

            setMessage(
                `Could not delete opportunity: ${error.message}`
            )
        } finally {
            setDeletingId(null)
        }
    }

    async function moveOpportunity(index, direction) {
        const targetIndex = index + direction

        if (
            targetIndex < 0 ||
            targetIndex >= opportunities.length
        ) {
            return
        }

        const reordered = [...opportunities]

        const [movedItem] = reordered.splice(index, 1)

        reordered.splice(targetIndex, 0, movedItem)

        setOpportunities(reordered)
        setReordering(true)

        try {
            for (let i = 0; i < reordered.length; i += 1) {
                const { error } = await supabase
                    .from('involvement_opportunities')
                    .update({
                        display_order: i,
                    })
                    .eq('id', reordered[i].id)

                if (error) throw error
            }

            setMessage('Display order updated.')
        } catch (error) {
            console.error(error)

            setMessage(
                `Could not update order: ${error.message}`
            )

            await loadOpportunities()
        } finally {
            setReordering(false)
        }
    }

    return (
        <section className="admin-section">
            <div className="admin-section-header">
                <div>
                    <p className="section-eyebrow">
                        GET INVOLVED
                    </p>

                    <h2>
                        {editingId
                            ? 'Edit Opportunity'
                            : 'Add Opportunity'}
                    </h2>

                    <p>
                        Manage applications, sign-ups, leadership
                        opportunities, and other ways students can
                        get involved with SSAN.
                    </p>
                </div>
            </div>

            <form
                className="admin-form admin-content-form"
                onSubmit={handleSubmit}
            >
                <label>
                    Title

                    <input
                        type="text"
                        value={title}
                        onChange={(event) =>
                            setTitle(event.target.value)
                        }
                        placeholder="E-Board Applications"
                        required
                    />
                </label>

                <label>
                    Category

                    <input
                        type="text"
                        value={category}
                        onChange={(event) =>
                            setCategory(event.target.value)
                        }
                        placeholder="Leadership, Event, Volunteer..."
                    />
                </label>

                <label>
                    Status

                    <select
                        value={status}
                        onChange={(event) =>
                            setStatus(event.target.value)
                        }
                    >
                        <option value="open">
                            Open
                        </option>

                        <option value="closed">
                            Closed
                        </option>

                        <option value="coming-soon">
                            Coming Soon
                        </option>
                    </select>
                </label>

                <label>
                    Description

                    <textarea
                        value={description}
                        onChange={(event) =>
                            setDescription(event.target.value)
                        }
                        placeholder="Describe the opportunity..."
                        rows="5"
                    />
                </label>

                <label>
                    Application or Sign-Up Link

                    <input
                        type="url"
                        value={link}
                        onChange={(event) =>
                            setLink(event.target.value)
                        }
                        placeholder="https://..."
                    />
                </label>

                <div className="admin-form-actions">
                    <button
                        type="submit"
                        className="button button-blue"
                        disabled={saving}
                    >
                        {saving
                            ? 'Saving...'
                            : editingId
                                ? 'Save Changes'
                                : 'Add Opportunity'}
                    </button>

                    {editingId && (
                        <button
                            type="button"
                            className="button button-outline"
                            onClick={resetForm}
                        >
                            Cancel Edit
                        </button>
                    )}
                </div>
            </form>

            {message && (
                <p className="admin-message">
                    {message}
                </p>
            )}

            <div className="admin-current-card">
                <div className="admin-current-header">
                    <div>
                        <p className="section-eyebrow">
                            CURRENTLY LIVE
                        </p>

                        <h3>
                            {opportunities.length}{' '}
                            Opportunit
                            {opportunities.length === 1
                                ? 'y'
                                : 'ies'}
                        </h3>
                    </div>
                </div>

                {opportunities.length === 0 ? (
                    <p>
                        No Get Involved opportunities are currently
                        published.
                    </p>
                ) : (
                    <div className="admin-list">
                        {opportunities.map(
                            (opportunity, index) => (
                                <article
                                    className="admin-list-item"
                                    key={opportunity.id}
                                >
                                    <div className="admin-list-content">
                                        <p className="section-eyebrow">
                                            {opportunity.category ||
                                                'OPPORTUNITY'}
                                        </p>

                                        <h3>{opportunity.title}</h3>

                                        <p>
                                            Status:{' '}
                                            <strong>
                                                {opportunity.status ===
                                                    'coming-soon'
                                                    ? 'Coming Soon'
                                                    : opportunity.status
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                    opportunity.status.slice(1)}
                                            </strong>
                                        </p>

                                        {opportunity.description && (
                                            <p>
                                                {opportunity.description}
                                            </p>
                                        )}

                                        {safeExternalUrl(opportunity.link) && (
                                            <a
                                                href={safeExternalUrl(opportunity.link)}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                View Link
                                            </a>
                                        )}
                                    </div>

                                    <div className="admin-list-actions">
                                        <button
                                            type="button"
                                            aria-label={`Move ${opportunity.title} up`}
                                            className="admin-order-button"
                                            onClick={() =>
                                                moveOpportunity(index, -1)
                                            }
                                            disabled={
                                                index === 0 ||
                                                reordering ||
                                                deletingId !== null
                                            }
                                        >
                                            ↑
                                        </button>

                                        <button
                                            type="button"
                                            aria-label={`Move ${opportunity.title} down`}
                                            className="admin-order-button"
                                            onClick={() =>
                                                moveOpportunity(index, 1)
                                            }
                                            disabled={
                                                index ===
                                                opportunities.length - 1 ||
                                                reordering ||
                                                deletingId !== null
                                            }
                                        >
                                            ↓
                                        </button>

                                        <button
                                            type="button"
                                            className="button button-outline"
                                            disabled={reordering || deletingId !== null}
                                            onClick={() =>
                                                handleEdit(opportunity)
                                            }
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            className="admin-delete-button"
                                            disabled={reordering || deletingId !== null}
                                            onClick={() =>
                                                handleDelete(opportunity)
                                            }
                                        >
                                            {deletingId === opportunity.id
                                                ? 'Deleting...'
                                                : 'Delete'}
                                        </button>
                                    </div>
                                </article>
                            )
                        )}
                    </div>
                )}
            </div>
        </section>
    )
}

export default InvolvementAdmin
