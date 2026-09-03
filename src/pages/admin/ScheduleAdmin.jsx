import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'
import { supabase } from '../../lib/supabase'

function ScheduleAdmin({ onContentChange }) {
    const [scheduleRows, setScheduleRows] = useState([])
    const [currentEvents, setCurrentEvents] = useState([])
    const [currentEventsLoading, setCurrentEventsLoading] =
        useState(false)

    const [fileName, setFileName] = useState('')
    const [uploadError, setUploadError] = useState('')
    const [message, setMessage] = useState('')
    const [publishing, setPublishing] = useState(false)

    useEffect(() => {
        loadCurrentEvents()
    }, [])

    async function loadCurrentEvents() {
        setCurrentEventsLoading(true)

        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('event_date', { ascending: true })

        if (error) {
            console.error(error)
        } else {
            setCurrentEvents(data || [])
        }

        setCurrentEventsLoading(false)
    }

    function normalizeHeader(header) {
        return String(header || '').trim().toLowerCase()
    }

    function formatExcelDate(value) {
        if (!value) return ''

        if (value instanceof Date) {
            const year = value.getFullYear()
            const month = String(value.getMonth() + 1).padStart(
                2,
                '0'
            )
            const day = String(value.getDate()).padStart(2, '0')

            return `${year}-${month}-${day}`
        }

        if (typeof value === 'number') {
            const parsed = XLSX.SSF.parse_date_code(value)

            if (!parsed) return ''

            const year = parsed.y
            const month = String(parsed.m).padStart(2, '0')
            const day = String(parsed.d).padStart(2, '0')

            return `${year}-${month}-${day}`
        }

        const date = new Date(value)

        if (Number.isNaN(date.getTime())) {
            return ''
        }

        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(
            2,
            '0'
        )
        const day = String(date.getDate()).padStart(2, '0')

        return `${year}-${month}-${day}`
    }

    function formatExcelTime(value) {
        if (!value) return ''

        if (value instanceof Date) {
            let hours = value.getHours()
            const minutes = String(value.getMinutes()).padStart(
                2,
                '0'
            )
            const suffix = hours >= 12 ? 'PM' : 'AM'

            hours = hours % 12

            if (hours === 0) {
                hours = 12
            }

            return `${hours}:${minutes} ${suffix}`
        }

        if (typeof value === 'number') {
            const totalMinutes = Math.round(value * 24 * 60)

            let hours = Math.floor(totalMinutes / 60) % 24
            const minutes = String(
                totalMinutes % 60
            ).padStart(2, '0')
            const suffix = hours >= 12 ? 'PM' : 'AM'

            hours = hours % 12

            if (hours === 0) {
                hours = 12
            }

            return `${hours}:${minutes} ${suffix}`
        }

        return String(value).trim()
    }

    function handleFileUpload(event) {
        const file = event.target.files?.[0]

        if (!file) return

        setUploadError('')
        setScheduleRows([])
        setFileName(file.name)
        setMessage('')

        const reader = new FileReader()

        reader.onload = (readerEvent) => {
            try {
                const data = readerEvent.target.result

                const workbook = XLSX.read(data, {
                    type: 'array',
                    cellDates: true,
                })

                const firstSheetName = workbook.SheetNames[0]
                const worksheet = workbook.Sheets[firstSheetName]

                const rawRows = XLSX.utils.sheet_to_json(
                    worksheet,
                    {
                        defval: '',
                    }
                )

                if (rawRows.length === 0) {
                    setUploadError(
                        'The spreadsheet does not contain any event rows.'
                    )
                    return
                }

                const parsedRows = rawRows.map((row, index) => {
                    const normalizedRow = {}

                    Object.entries(row).forEach(([key, value]) => {
                        normalizedRow[normalizeHeader(key)] = value
                    })

                    const dateValue =
                        normalizedRow.date ||
                        normalizedRow['event date'] ||
                        normalizedRow.event_date

                    const titleValue =
                        normalizedRow.event ||
                        normalizedRow.title ||
                        normalizedRow['event name']

                    return {
                        rowNumber: index + 2,
                        event_date: formatExcelDate(dateValue),
                        title: String(titleValue || '').trim(),
                        time: formatExcelTime(normalizedRow.time),
                        location: String(
                            normalizedRow.location || ''
                        ).trim(),
                        category: String(
                            normalizedRow.category || ''
                        ).trim(),
                        description: String(
                            normalizedRow.description || ''
                        ).trim(),
                        link: String(normalizedRow.link || '').trim(),
                    }
                })

                const invalidRows = parsedRows.filter(
                    (row) => !row.event_date || !row.title
                )

                if (invalidRows.length > 0) {
                    const rowNumbers = invalidRows
                        .map((row) => row.rowNumber)
                        .join(', ')

                    setUploadError(
                        `Some rows are missing a valid Date or Event. Check Excel row(s): ${rowNumbers}.`
                    )

                    return
                }

                parsedRows.sort(
                    (a, b) =>
                        new Date(a.event_date) -
                        new Date(b.event_date)
                )

                setScheduleRows(parsedRows)
            } catch (error) {
                console.error(error)

                setUploadError(
                    'The spreadsheet could not be read. Make sure it is a valid Excel file.'
                )
            }
        }

        reader.readAsArrayBuffer(file)
    }

    function downloadTemplate() {
        const templateData = [
            {
                Date: '9/10/2026',
                Event: 'Welcome Back Gathering',
                Time: '6:30 PM',
                Location: 'Curry Student Center',
                Category: 'Community',
                Description:
                    'Meet the SSAN community and learn about the semester ahead.',
                Link: '',
            },
        ]

        const worksheet =
            XLSX.utils.json_to_sheet(templateData)

        worksheet['!cols'] = [
            { wch: 14 },
            { wch: 30 },
            { wch: 14 },
            { wch: 25 },
            { wch: 18 },
            { wch: 55 },
            { wch: 35 },
        ]

        const workbook = XLSX.utils.book_new()

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            'Schedule'
        )

        XLSX.writeFile(
            workbook,
            'SSAN-Schedule-Template.xlsx'
        )
    }

    async function handlePublish() {
        if (scheduleRows.length === 0) {
            setUploadError(
                'Upload a valid schedule before publishing.'
            )

            return
        }

        const confirmed = window.confirm(
            `This will replace the current website schedule with ${scheduleRows.length} event(s). Continue?`
        )

        if (!confirmed) return

        setPublishing(true)
        setUploadError('')
        setMessage('Publishing schedule...')

        const schedule = scheduleRows.map((row) => ({
            event_date: row.event_date,
            title: row.title,
            time: row.time,
            location: row.location,
            category: row.category,
            description: row.description,
            link: row.link,
        }))

        const { error } = await supabase.rpc(
            'replace_events',
            {
                schedule,
            }
        )

        if (error) {
            console.error(error)

            setUploadError(
                `Could not publish schedule: ${error.message}`
            )

            setMessage('')
            setPublishing(false)

            return
        }

        setMessage(
            `Schedule published successfully. ${scheduleRows.length} event(s) are now live.`
        )

        setPublishing(false)

        await loadCurrentEvents()
        await onContentChange?.()
    }

    return (
        <>
            <div className="admin-dashboard-card">
                <div className="admin-section-heading">
                    <div>
                        <p className="section-eyebrow">SCHEDULE</p>
                        <h2>Schedule Management</h2>
                    </div>

                    <button
                        type="button"
                        className="admin-secondary-button"
                        onClick={downloadTemplate}
                    >
                        Download Excel Template
                    </button>
                </div>

                <p className="admin-card-description">
                    Upload an Excel schedule, review the events, and
                    publish them to the website.
                </p>

                <div className="excel-upload-box">
                    <label htmlFor="schedule-upload">
                        <span>Upload Excel Schedule</span>
                        <small>.xlsx or .xls</small>
                    </label>

                    <input
                        id="schedule-upload"
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileUpload}
                    />

                    {fileName && (
                        <p className="selected-file">
                            Selected file: <strong>{fileName}</strong>
                        </p>
                    )}
                </div>

                {uploadError && (
                    <div className="admin-error-message">
                        {uploadError}
                    </div>
                )}

                {scheduleRows.length > 0 && (
                    <>
                        <div className="schedule-preview-header">
                            <div>
                                <p className="section-eyebrow">PREVIEW</p>

                                <h3>
                                    {scheduleRows.length} Event
                                    {scheduleRows.length !== 1 ? 's' : ''}{' '}
                                    Detected
                                </h3>
                            </div>

                            <button
                                type="button"
                                className="button button-blue"
                                onClick={handlePublish}
                                disabled={publishing}
                            >
                                {publishing
                                    ? 'Publishing...'
                                    : 'Publish Schedule'}
                            </button>
                        </div>

                        <div className="admin-table-wrapper">
                            <table className="admin-schedule-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Event</th>
                                        <th>Time</th>
                                        <th>Location</th>
                                        <th>Category</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {scheduleRows.map((row, index) => (
                                        <tr
                                            key={`${row.event_date}-${row.title}-${index}`}
                                        >
                                            <td>{row.event_date}</td>
                                            <td>{row.title}</td>
                                            <td>{row.time || '—'}</td>
                                            <td>{row.location || '—'}</td>
                                            <td>{row.category || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {message && (
                    <p className="admin-publish-message">
                        {message}
                    </p>
                )}
            </div>

            <div className="admin-dashboard-card admin-current-card">
                <p className="section-eyebrow">CURRENTLY LIVE</p>
                <h2>Published Schedule</h2>

                {currentEventsLoading && (
                    <p className="admin-card-description">
                        Loading current schedule...
                    </p>
                )}

                {!currentEventsLoading &&
                    currentEvents.length === 0 && (
                        <p className="admin-card-description">
                            There are currently no published events.
                        </p>
                    )}

                {!currentEventsLoading &&
                    currentEvents.length > 0 && (
                        <div className="admin-table-wrapper">
                            <table className="admin-schedule-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Event</th>
                                        <th>Time</th>
                                        <th>Location</th>
                                        <th>Category</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {currentEvents.map((event) => (
                                        <tr key={event.id}>
                                            <td>{event.event_date}</td>
                                            <td>{event.title}</td>
                                            <td>{event.time || '—'}</td>
                                            <td>{event.location || '—'}</td>
                                            <td>{event.category || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
            </div>
        </>
    )
}

export default ScheduleAdmin
