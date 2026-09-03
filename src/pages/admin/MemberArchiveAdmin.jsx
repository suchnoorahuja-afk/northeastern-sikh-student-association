import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { normalizeExternalUrl } from '../../lib/externalUrls'
import { safeExternalUrl } from '../../lib/externalUrls'
import {
    MAX_EXCEL_UPLOAD_BYTES,
    MAX_EXCEL_UPLOAD_LABEL,
} from '../../lib/uploadFiles'

const MEMBER_HEADERS = [
    'Name',
    'Role',
    'Graduation Year',
    'Phone Number',
    'Email',
    'LinkedIn',
]

function MemberArchiveAdmin({ onContentChange }) {
    const [previewMembers, setPreviewMembers] =
        useState([])

    const [liveMembers, setLiveMembers] =
        useState([])

    const [fileName, setFileName] =
        useState('')

    const [message, setMessage] =
        useState('')

    const [publishing, setPublishing] =
        useState(false)

    useEffect(() => {
        loadLiveMembers()
    }, [])

    async function loadLiveMembers() {
        const { data, error } = await supabase
            .from('member_archive')
            .select('*')
            .order('graduation_year', {
                ascending: false,
            })
            .order('display_order', {
                ascending: true,
            })

        if (error) {
            console.error(error)

            setMessage(
                `Could not load member archive: ${error.message}`
            )

            return
        }

        setLiveMembers(data || [])
    }

    function downloadTemplate() {
        const link =
            document.createElement('a')

        link.href =
            '/SSAN-Member-Archive-Template.xlsx'

        link.download =
            'SSAN-Member-Archive-Template.xlsx'

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    async function handleFileChange(event) {
        const file =
            event.target.files?.[0]

        setMessage('')
        setPreviewMembers([])
        setFileName('')

        if (!file) {
            return
        }

        try {
            if (file.size > MAX_EXCEL_UPLOAD_BYTES) {
                throw new Error(
                    `The Excel workbook must be ${MAX_EXCEL_UPLOAD_LABEL} or smaller.`
                )
            }

            const XLSX = await import('xlsx')
            const buffer =
                await file.arrayBuffer()

            const workbook = XLSX.read(
                buffer,
                {
                    type: 'array',
                }
            )

            /*
             * We specifically use the first sheet.
             *
             * In the SSAN template:
             * Sheet 1 = Member Archive
             * Sheet 2 = Roles
             *
             * The Roles sheet exists only to power
             * Excel's Role dropdown.
             */
            const firstSheetName =
                workbook.SheetNames[0]

            if (
                firstSheetName !== 'Member Archive' ||
                workbook.SheetNames[1] !== 'Roles'
            ) {
                throw new Error(
                    'Use the SSAN template with “Member Archive” as the first worksheet and “Roles” as the second worksheet.'
                )
            }

            const worksheet =
                workbook.Sheets[
                firstSheetName
                ]

            const sheetRows = XLSX.utils.sheet_to_json(
                worksheet,
                { header: 1, defval: '', blankrows: false }
            )
            const headers = (sheetRows[0] || []).map((header) =>
                String(header).trim()
            )
            const missingHeaders = MEMBER_HEADERS.filter(
                (header) => !headers.includes(header)
            )

            if (missingHeaders.length > 0) {
                throw new Error(
                    `The Member Archive worksheet is missing required column(s): ${missingHeaders.join(', ')}.`
                )
            }

            const rows =
                XLSX.utils.sheet_to_json(
                    worksheet,
                    {
                        defval: '',
                    }
                )

            if (rows.length === 0) {
                throw new Error(
                    'The spreadsheet does not contain any members.'
                )
            }

            const currentYear = new Date().getFullYear()
            const seenMembers = new Set()
            const formattedMembers = rows.map((row, index) => {
                        const rowNumber = index + 2
                        const name = String(
                            row.Name || ''
                        ).trim()

                        if (!name) {
                            throw new Error(
                                `Name is required in Excel row ${rowNumber}.`
                            )
                        }

                        const role = String(
                            row.Role || ''
                        ).trim()

                        const graduationYearValue =
                            row['Graduation Year'] ?? ''

                        const graduationYear =
                            graduationYearValue === ''
                                ? ''
                                : String(
                                    graduationYearValue
                                ).trim()

                        const phoneNumber =
                            String(
                                row['Phone Number'] || ''
                            ).trim()

                        const email = String(
                            row.Email || ''
                        ).trim()

                        const linkedin =
                            String(
                                row.LinkedIn || ''
                            ).trim()

                        if (
                            graduationYear &&
                            (!/^\d{4}$/.test(graduationYear) ||
                                Number(graduationYear) < 1900 ||
                                Number(graduationYear) > currentYear + 10)
                        ) {
                            throw new Error(
                                `Graduation Year in Excel row ${rowNumber} must be a sensible four-digit year.`
                            )
                        }

                        if (
                            email &&
                            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                        ) {
                            throw new Error(
                                `Email in Excel row ${rowNumber} is not valid.`
                            )
                        }

                        let normalizedLinkedin
                        try {
                            normalizedLinkedin = normalizeExternalUrl(linkedin)
                        } catch (urlError) {
                            throw new Error(
                                `LinkedIn in Excel row ${rowNumber}: ${urlError.message}`,
                                { cause: urlError }
                            )
                        }

                        const duplicateKey = `${name.toLowerCase()}|${graduationYear}`
                        if (seenMembers.has(duplicateKey)) {
                            throw new Error(
                                `Duplicate member in Excel row ${rowNumber}: ${name}${graduationYear ? ` (${graduationYear})` : ''}.`
                            )
                        }
                        seenMembers.add(duplicateKey)

                        return {
                            name,
                            role,

                            graduation_year:
                                graduationYear,

                            /*
                             * Existing database schema
                             * still contains years_active.
                             * The new template no longer
                             * uses that field.
                             */
                            years_active: '',

                            email,
                            linkedin: normalizedLinkedin,

                            /*
                             * We store Phone Number in
                             * contact_info so we do not
                             * need a database migration.
                             */
                            contact_info:
                                phoneNumber,

                            display_order:
                                index,
                        }
                    })

            if (
                formattedMembers.length === 0
            ) {
                throw new Error(
                    'No valid members were found. Make sure the spreadsheet has a Name column.'
                )
            }

            setPreviewMembers(
                formattedMembers
            )

            setFileName(file.name)

            setMessage(
                `${formattedMembers.length} member${formattedMembers.length === 1
                    ? ''
                    : 's'
                } ready to publish.`
            )
        } catch (error) {
            console.error(error)

            setMessage(
                `Could not read Excel file: ${error.message}`
            )
        }
    }

    async function publishArchive() {
        if (
            previewMembers.length === 0
        ) {
            setMessage(
                'Upload an Excel file before publishing.'
            )

            return
        }

        const confirmed =
            window.confirm(
                `Publish ${previewMembers.length} members? This will replace the entire currently published member archive.`
            )

        if (!confirmed) {
            return
        }

        setPublishing(true)

        setMessage(
            'Publishing member archive...'
        )

        try {
            const { error } =
                await supabase.rpc(
                    'replace_member_archive',
                    {
                        members:
                            previewMembers,
                    }
                )

            if (error) {
                throw error
            }

            await loadLiveMembers()
            await onContentChange?.()

            setPreviewMembers([])
            setFileName('')

            setMessage(
                'Member archive published successfully.'
            )

            const input =
                document.getElementById(
                    'member-archive-file'
                )

            if (input) {
                input.value = ''
            }
        } catch (error) {
            console.error(error)

            setMessage(
                `Could not publish member archive: ${error.message}`
            )
        } finally {
            setPublishing(false)
        }
    }

    return (
        <section className="admin-section">
            <div className="admin-section-header">
                <div>
                    <p className="section-eyebrow">
                        MEMBER ARCHIVE
                    </p>

                    <h2>
                        Manage Former Members
                    </h2>

                    <p>
                        Upload an Excel spreadsheet
                        to replace the public SSAN
                        member archive.
                    </p>
                </div>

                <button
                    type="button"
                    className="button button-outline"
                    onClick={downloadTemplate}
                >
                    Download Excel Template
                </button>
            </div>

            <div className="admin-upload-card">
                <h3>
                    Upload Member Archive
                </h3>

                <p>
                    Upload an Excel file using
                    the SSAN member archive
                    template. Maximum size: {MAX_EXCEL_UPLOAD_LABEL}.
                </p>

                <input
                    id="member-archive-file"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={
                        handleFileChange
                    }
                />

                {fileName && (
                    <p>
                        Selected file:{' '}
                        <strong>
                            {fileName}
                        </strong>
                    </p>
                )}

                {message && (
                    <p className="admin-message">
                        {message}
                    </p>
                )}
            </div>

            {previewMembers.length >
                0 && (
                    <div className="admin-preview-card">
                        <div className="admin-preview-header">
                            <div>
                                <p className="section-eyebrow">
                                    PREVIEW
                                </p>

                                <h3>
                                    {
                                        previewMembers.length
                                    }{' '}
                                    Member
                                    {previewMembers.length ===
                                        1
                                        ? ''
                                        : 's'}
                                </h3>
                            </div>

                            <button
                                type="button"
                                className="button button-blue"
                                onClick={
                                    publishArchive
                                }
                                disabled={
                                    publishing
                                }
                            >
                                {publishing
                                    ? 'Publishing...'
                                    : 'Publish Member Archive'}
                            </button>
                        </div>

                        <div className="admin-table-wrap">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Role</th>
                                        <th>Class</th>
                                        <th>
                                            Phone Number
                                        </th>
                                        <th>Email</th>
                                        <th>
                                            LinkedIn
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {previewMembers.map(
                                        (
                                            member,
                                            index
                                        ) => (
                                            <tr
                                                key={`${member.name}-${index}`}
                                            >
                                                <td>
                                                    {
                                                        member.name
                                                    }
                                                </td>

                                                <td>
                                                    {member.role ||
                                                        '—'}
                                                </td>

                                                <td>
                                                    {member.graduation_year ||
                                                        '—'}
                                                </td>

                                                <td>
                                                    {member.contact_info ||
                                                        '—'}
                                                </td>

                                                <td>
                                                    {member.email ||
                                                        '—'}
                                                </td>

                                                <td>
                                                    {member.linkedin
                                                        ? 'LinkedIn'
                                                        : '—'}
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            <div className="admin-current-card">
                <div className="admin-current-header">
                    <div>
                        <p className="section-eyebrow">
                            CURRENTLY LIVE
                        </p>

                        <h3>
                            {liveMembers.length}{' '}
                            Former Member
                            {liveMembers.length ===
                                1
                                ? ''
                                : 's'}
                        </h3>
                    </div>
                </div>

                {liveMembers.length ===
                    0 ? (
                    <p>
                        No former members have
                        been published yet.
                    </p>
                ) : (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Role</th>
                                    <th>Class</th>
                                    <th>
                                        Phone Number
                                    </th>
                                    <th>Email</th>
                                    <th>
                                        LinkedIn
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {liveMembers.map(
                                    (member) => (
                                        <tr
                                            key={
                                                member.id
                                            }
                                        >
                                            <td>
                                                {
                                                    member.name
                                                }
                                            </td>

                                            <td>
                                                {member.role ||
                                                    '—'}
                                            </td>

                                            <td>
                                                {member.graduation_year ||
                                                    '—'}
                                            </td>

                                            <td>
                                                {member.contact_info ||
                                                    '—'}
                                            </td>

                                            <td>
                                                {member.email ||
                                                    '—'}
                                            </td>

                                            <td>
                                                {safeExternalUrl(member.linkedin) ? (
                                                    <a
                                                        href={
                                                            safeExternalUrl(member.linkedin)
                                                        }
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        LinkedIn
                                                    </a>
                                                ) : (
                                                    '—'
                                                )}
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </section>
    )
}

export default MemberArchiveAdmin
