import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

function EBoardAdmin() {
    const [members, setMembers] = useState([])
    const [loading, setLoading] = useState(true)

    const [name, setName] = useState('')
    const [role, setRole] = useState('')
    const [photo, setPhoto] = useState(null)

    const [editingMember, setEditingMember] =
        useState(null)

    const [message, setMessage] = useState('')
    const [errorMessage, setErrorMessage] =
        useState('')

    const [saving, setSaving] = useState(false)

    useEffect(() => {
        loadMembers()
    }, [])

    async function loadMembers() {
        setLoading(true)

        const { data, error } = await supabase
            .from('eboard_members')
            .select('*')
            .order('display_order', { ascending: true })
            .order('id', { ascending: true })

        if (error) {
            console.error(error)

            setErrorMessage(
                `Could not load E-Board members: ${error.message}`
            )
        } else {
            setMembers(data || [])
        }

        setLoading(false)
    }

    function resetForm() {
        setName('')
        setRole('')
        setPhoto(null)
        setEditingMember(null)

        const input =
            document.getElementById('eboard-photo')

        if (input) {
            input.value = ''
        }
    }

    function handlePhotoChange(event) {
        const file = event.target.files?.[0]

        setErrorMessage('')
        setMessage('')

        if (!file) {
            setPhoto(null)
            return
        }

        if (!file.type.startsWith('image/')) {
            setErrorMessage(
                'Please select an image file.'
            )

            setPhoto(null)
            event.target.value = ''

            return
        }

        setPhoto(file)
    }

    function startEditing(member) {
        setEditingMember(member)
        setName(member.name)
        setRole(member.role)
        setPhoto(null)

        setMessage('')
        setErrorMessage('')

        const input =
            document.getElementById('eboard-photo')

        if (input) {
            input.value = ''
        }

        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        })
    }

    function cancelEditing() {
        resetForm()
        setMessage('')
        setErrorMessage('')
    }

    async function uploadPhoto(file) {
        const extension =
            file.name.split('.').pop()?.toLowerCase() ||
            'jpg'

        const safeName = `${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}.${extension}`

        const filePath = `members/${safeName}`

        const { error: uploadError } =
            await supabase.storage
                .from('eboard')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false,
                })

        if (uploadError) {
            throw uploadError
        }

        const { data } = supabase.storage
            .from('eboard')
            .getPublicUrl(filePath)

        return {
            photoUrl: data.publicUrl,
            photoPath: filePath,
        }
    }

    async function handleSubmit(event) {
        event.preventDefault()

        setMessage('')
        setErrorMessage('')

        if (!name.trim() || !role.trim()) {
            setErrorMessage(
                'Name and role are required.'
            )

            return
        }

        if (!editingMember && !photo) {
            setErrorMessage(
                'Please upload a photo for the new E-Board member.'
            )

            return
        }

        setSaving(true)

        let newlyUploadedPath = null

        try {
            let photoUrl =
                editingMember?.photo_url || null

            let photoPath =
                editingMember?.photo_path || null

            if (photo) {
                const uploaded =
                    await uploadPhoto(photo)

                photoUrl = uploaded.photoUrl
                photoPath = uploaded.photoPath
                newlyUploadedPath =
                    uploaded.photoPath
            }

            if (editingMember) {
                const { error } = await supabase
                    .from('eboard_members')
                    .update({
                        name: name.trim(),
                        role: role.trim(),
                        photo_url: photoUrl,
                        photo_path: photoPath,
                    })
                    .eq('id', editingMember.id)

                if (error) {
                    if (newlyUploadedPath) {
                        await supabase.storage
                            .from('eboard')
                            .remove([
                                newlyUploadedPath,
                            ])
                    }

                    throw error
                }

                if (
                    photo &&
                    editingMember.photo_path &&
                    editingMember.photo_path !==
                    newlyUploadedPath
                ) {
                    const { error: oldPhotoError } =
                        await supabase.storage
                            .from('eboard')
                            .remove([
                                editingMember.photo_path,
                            ])

                    if (oldPhotoError) {
                        console.error(
                            'Old photo could not be removed:',
                            oldPhotoError
                        )
                    }
                }

                setMessage(
                    'E-Board member updated successfully.'
                )
            } else {
                const nextOrder =
                    members.length === 0
                        ? 1
                        : Math.max(
                            ...members.map(
                                (member) =>
                                    member.display_order || 0
                            )
                        ) + 1

                const { error } = await supabase
                    .from('eboard_members')
                    .insert({
                        name: name.trim(),
                        role: role.trim(),
                        photo_url: photoUrl,
                        photo_path: photoPath,
                        display_order: nextOrder,
                    })

                if (error) {
                    if (newlyUploadedPath) {
                        await supabase.storage
                            .from('eboard')
                            .remove([
                                newlyUploadedPath,
                            ])
                    }

                    throw error
                }

                setMessage(
                    'E-Board member added successfully.'
                )
            }

            resetForm()
            await loadMembers()
        } catch (error) {
            console.error(error)

            setErrorMessage(
                `Could not save E-Board member: ${error.message}`
            )
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete(member) {
        const confirmed = window.confirm(
            `Delete ${member.name} from the E-Board?`
        )

        if (!confirmed) return

        setMessage('')
        setErrorMessage('')

        try {
            const { error: deleteError } =
                await supabase
                    .from('eboard_members')
                    .delete()
                    .eq('id', member.id)

            if (deleteError) {
                throw deleteError
            }

            if (member.photo_path) {
                const { error: storageError } =
                    await supabase.storage
                        .from('eboard')
                        .remove([member.photo_path])

                if (storageError) {
                    console.error(storageError)
                }
            }

            setMessage(
                `${member.name} was removed from the E-Board.`
            )

            await loadMembers()
        } catch (error) {
            console.error(error)

            setErrorMessage(
                `Could not delete member: ${error.message}`
            )
        }
    }

    async function updateOrder(updatedMembers) {
        const updates = updatedMembers.map(
            (member, index) => ({
                id: member.id,
                display_order: index + 1,
            })
        )

        for (const update of updates) {
            const { error } = await supabase
                .from('eboard_members')
                .update({
                    display_order:
                        update.display_order,
                })
                .eq('id', update.id)

            if (error) {
                throw error
            }
        }
    }

    async function moveMember(index, direction) {
        const newIndex = index + direction

        if (
            newIndex < 0 ||
            newIndex >= members.length
        ) {
            return
        }

        setMessage('')
        setErrorMessage('')

        const reordered = [...members]

        const [movedMember] =
            reordered.splice(index, 1)

        reordered.splice(
            newIndex,
            0,
            movedMember
        )

        const reorderedWithValues =
            reordered.map((member, memberIndex) => ({
                ...member,
                display_order: memberIndex + 1,
            }))

        setMembers(reorderedWithValues)

        try {
            await updateOrder(
                reorderedWithValues
            )

            setMessage(
                'E-Board order updated.'
            )
        } catch (error) {
            console.error(error)

            setErrorMessage(
                `Could not update order: ${error.message}`
            )

            await loadMembers()
        }
    }

    return (
        <>
            <div className="admin-dashboard-card">
                <p className="section-eyebrow">
                    E-BOARD
                </p>

                <h2>
                    {editingMember
                        ? 'Edit E-Board Member'
                        : 'Add E-Board Member'}
                </h2>

                <p className="admin-card-description">
                    Manage the people displayed on
                    the NSSA E-Board page.
                </p>

                <form
                    className="eboard-admin-form"
                    onSubmit={handleSubmit}
                >
                    <div className="eboard-form-grid">
                        <label>
                            Name

                            <input
                                type="text"
                                value={name}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                                placeholder="Siddakk Singh"
                                required
                            />
                        </label>

                        <label>
                            Role

                            <input
                                type="text"
                                value={role}
                                onChange={(event) =>
                                    setRole(event.target.value)
                                }
                                placeholder="President"
                                required
                            />
                        </label>
                    </div>

                    <label>
                        {editingMember
                            ? 'Replace Photo'
                            : 'Member Photo'}

                        <input
                            id="eboard-photo"
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                        />
                    </label>

                    {editingMember && (
                        <p className="admin-card-description">
                            Leave the photo blank to
                            keep the current photo.
                        </p>
                    )}

                    {photo && (
                        <div className="eboard-photo-preview">
                            <img
                                src={URL.createObjectURL(
                                    photo
                                )}
                                alt="Selected preview"
                            />

                            <p>
                                Selected:{' '}
                                <strong>
                                    {photo.name}
                                </strong>
                            </p>
                        </div>
                    )}

                    <div className="eboard-form-actions">
                        <button
                            type="submit"
                            className="button button-blue"
                            disabled={saving}
                        >
                            {saving
                                ? 'Saving...'
                                : editingMember
                                    ? 'Save Changes'
                                    : 'Add Member'}
                        </button>

                        {editingMember && (
                            <button
                                type="button"
                                className="admin-secondary-button"
                                onClick={cancelEditing}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>

                {errorMessage && (
                    <div className="admin-error-message">
                        {errorMessage}
                    </div>
                )}

                {message && (
                    <p className="admin-publish-message">
                        {message}
                    </p>
                )}
            </div>

            <div className="admin-dashboard-card admin-current-card">
                <p className="section-eyebrow">
                    CURRENTLY LIVE
                </p>

                <h2>Current E-Board</h2>

                <p className="admin-card-description">
                    Members appear on the public
                    website in this order.
                </p>

                {loading && (
                    <p className="admin-card-description">
                        Loading E-Board...
                    </p>
                )}

                {!loading &&
                    members.length === 0 && (
                        <p className="admin-card-description">
                            No E-Board members have been
                            added yet.
                        </p>
                    )}

                {!loading &&
                    members.length > 0 && (
                        <div className="eboard-admin-list">
                            {members.map(
                                (member, index) => (
                                    <div
                                        className="eboard-admin-member"
                                        key={member.id}
                                    >
                                        <div className="eboard-admin-member-main">
                                            <div className="eboard-admin-order">
                                                {index + 1}
                                            </div>

                                            {member.photo_url ? (
                                                <img
                                                    src={
                                                        member.photo_url
                                                    }
                                                    alt={
                                                        member.name
                                                    }
                                                    className="eboard-admin-photo"
                                                />
                                            ) : (
                                                <div className="eboard-admin-photo-placeholder">
                                                    No Photo
                                                </div>
                                            )}

                                            <div className="eboard-admin-member-info">
                                                <h3>
                                                    {member.name}
                                                </h3>

                                                <p>
                                                    {member.role}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="eboard-admin-controls">
                                            <div className="eboard-order-buttons">
                                                <button
                                                    type="button"
                                                    disabled={
                                                        index === 0
                                                    }
                                                    onClick={() =>
                                                        moveMember(
                                                            index,
                                                            -1
                                                        )
                                                    }
                                                    aria-label={`Move ${member.name} up`}
                                                >
                                                    ↑
                                                </button>

                                                <button
                                                    type="button"
                                                    disabled={
                                                        index ===
                                                        members.length -
                                                        1
                                                    }
                                                    onClick={() =>
                                                        moveMember(
                                                            index,
                                                            1
                                                        )
                                                    }
                                                    aria-label={`Move ${member.name} down`}
                                                >
                                                    ↓
                                                </button>
                                            </div>

                                            <button
                                                type="button"
                                                className="admin-secondary-button"
                                                onClick={() =>
                                                    startEditing(
                                                        member
                                                    )
                                                }
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                className="admin-delete-button"
                                                onClick={() =>
                                                    handleDelete(
                                                        member
                                                    )
                                                }
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    )}
            </div>
        </>
    )
}

export default EBoardAdmin
