import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'
import { supabase } from '../../lib/supabase'

function MemberArchiveAdmin() {
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

            if (!firstSheetName) {
                throw new Error(
                    'The Excel file does not contain a worksheet.'
                )
            }

            const worksheet =
                workbook.Sheets[
                firstSheetName
                ]

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

            const formattedMembers =
                rows
                    .map((row, index) => {
                        const name = String(
                            row.Name ||
                            row.name ||
                            ''
                        ).trim()

                        const role = String(
                            row.Role ||
                            row.role ||
                            ''
                        ).trim()

                        const graduationYearValue =
                            row['Graduation Year'] ??
                            row.graduation_year ??
                            ''

                        const graduationYear =
                            graduationYearValue === ''
                                ? ''
                                : String(
                                    graduationYearValue
                                ).trim()

                        const phoneNumber =
                            String(
                                row['Phone Number'] ||
                                row.Phone ||
                                row.phone ||
                                row.phone_number ||
                                ''
                            ).trim()

                        const email = String(
                            row.Email ||
                            row.email ||
                            ''
                        ).trim()

                        const linkedin =
                            String(
                                row.LinkedIn ||
                                row.Linkedin ||
                                row.linkedin ||
                                ''
                            ).trim()

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
                            linkedin,

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
                    .filter(
                        (member) =>
                            member.name
                    )

            if (
                formattedMembers.length === 0
            ) {
                throw new Error(
                    'No valid members were found. Make sure the spreadsheet has a Name column.'
                )
            }

            const invalidYear =
                formattedMembers.find(
                    (member) =>
                        member.graduation_year &&
                        !/^\d{4}$/.test(
                            member.graduation_year
                        )
                )

            if (invalidYear) {
                throw new Error(
                    `Graduation Year for ${invalidYear.name} must be a four-digit year, such as 2027.`
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
                    template.
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
                                                {member.linkedin ? (
                                                    <a
                                                        href={
                                                            member.linkedin
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
