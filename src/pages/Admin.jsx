import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

import ScheduleAdmin from './admin/ScheduleAdmin'
import GazetteAdmin from './admin/GazetteAdmin'
import EBoardAdmin from './admin/EBoardAdmin'
import MemberArchiveAdmin from './admin/MemberArchiveAdmin'
import InvolvementAdmin from './admin/InvolvementAdmin'
import GalleryAdmin from './admin/GalleryAdmin'

function Admin() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [session, setSession] = useState(null)
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(true)

    const [activeSection, setActiveSection] =
        useState('schedule')

    const [eventCount, setEventCount] = useState(0)
    const [gazetteCount, setGazetteCount] = useState(0)
    const [eboardCount, setEboardCount] = useState(0)
    const [archiveCount, setArchiveCount] = useState(0)
    const [involvementCount, setInvolvementCount] =
        useState(0)
    const [galleryCount, setGalleryCount] = useState(0)

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session)
            setLoading(false)
        })

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(
            (_event, newSession) => {
                setSession(newSession)
            }
        )

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    useEffect(() => {
        if (session) {
            loadDashboardCounts()
        }
    }, [session, activeSection])

    async function loadDashboardCounts() {
        const [
            eventsResult,
            gazettesResult,
            eboardResult,
            archiveResult,
            involvementResult,
            galleryResult,
        ] = await Promise.all([
            supabase
                .from('events')
                .select('*', {
                    count: 'exact',
                    head: true,
                }),

            supabase
                .from('gazettes')
                .select('*', {
                    count: 'exact',
                    head: true,
                }),

            supabase
                .from('eboard_members')
                .select('*', {
                    count: 'exact',
                    head: true,
                }),

            supabase
                .from('member_archive')
                .select('*', {
                    count: 'exact',
                    head: true,
                }),

            supabase
                .from('involvement_opportunities')
                .select('*', {
                    count: 'exact',
                    head: true,
                }),

            supabase
                .from('gallery_photos')
                .select('*', {
                    count: 'exact',
                    head: true,
                }),
        ])

        setEventCount(eventsResult.count || 0)
        setGazetteCount(gazettesResult.count || 0)
        setEboardCount(eboardResult.count || 0)
        setArchiveCount(archiveResult.count || 0)
        setInvolvementCount(
            involvementResult.count || 0
        )
        setGalleryCount(galleryResult.count || 0)
    }

    async function handleLogin(event) {
        event.preventDefault()

        setMessage('Signing in...')

        const { error } =
            await supabase.auth.signInWithPassword({
                email,
                password,
            })

        if (error) {
            setMessage(error.message)
            return
        }

        setMessage('')
        setPassword('')
    }

    async function handleLogout() {
        await supabase.auth.signOut()

        setMessage('')
        setActiveSection('schedule')
    }

    if (loading) {
        return (
            <main className="admin-page">
                <div className="admin-login-card">
                    <p>Loading...</p>
                </div>
            </main>
        )
    }

    if (!session) {
        return (
            <main className="admin-page">
                <div className="admin-login-card">
                    <img
                        src="/nssa-logo.png"
                        alt="SSAN Logo"
                    />

                    <p className="section-eyebrow">
                        SSAN ADMIN
                    </p>

                    <h1>Admin Login</h1>

                    <p className="admin-description">
                        Sign in to manage SSAN website content.
                    </p>

                    <form
                        onSubmit={handleLogin}
                        className="admin-form"
                    >
                        <label>
                            Email

                            <input
                                type="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                placeholder="Email"
                                required
                            />
                        </label>

                        <label>
                            Password

                            <input
                                type="password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                placeholder="Password"
                                required
                            />
                        </label>

                        <button
                            type="submit"
                            className="button button-blue"
                        >
                            Sign In
                        </button>
                    </form>

                    {message && (
                        <p className="admin-message">
                            {message}
                        </p>
                    )}
                </div>
            </main>
        )
    }

    return (
        <main className="admin-page">
            <div className="admin-dashboard">
                <div className="admin-dashboard-header">
                    <div>
                        <p className="section-eyebrow">
                            SSAN ADMIN
                        </p>

                        <h1>Website Dashboard</h1>

                        <p>
                            Signed in as {session.user.email}
                        </p>
                    </div>

                    <button
                        type="button"
                        className="admin-logout"
                        onClick={handleLogout}
                    >
                        Sign Out
                    </button>
                </div>

                <div className="admin-summary-grid">
                    <button
                        type="button"
                        className="admin-summary-card"
                        onClick={() =>
                            setActiveSection('schedule')
                        }
                    >
                        <span className="admin-summary-label">
                            SCHEDULE
                        </span>

                        <strong>{eventCount}</strong>

                        <span>
                            Event{eventCount !== 1 ? 's' : ''} Live
                        </span>
                    </button>

                    <button
                        type="button"
                        className="admin-summary-card"
                        onClick={() =>
                            setActiveSection('gazette')
                        }
                    >
                        <span className="admin-summary-label">
                            SIKH GAZETTE
                        </span>

                        <strong>{gazetteCount}</strong>

                        <span>
                            Issue{gazetteCount !== 1 ? 's' : ''}
                        </span>
                    </button>

                    <button
                        type="button"
                        className="admin-summary-card"
                        onClick={() =>
                            setActiveSection('eboard')
                        }
                    >
                        <span className="admin-summary-label">
                            E-BOARD
                        </span>

                        <strong>{eboardCount}</strong>

                        <span>
                            Member{eboardCount !== 1 ? 's' : ''}
                        </span>
                    </button>

                    <button
                        type="button"
                        className="admin-summary-card"
                        onClick={() =>
                            setActiveSection('archive')
                        }
                    >
                        <span className="admin-summary-label">
                            MEMBER ARCHIVE
                        </span>

                        <strong>{archiveCount}</strong>

                        <span>
                            Former Member
                            {archiveCount !== 1 ? 's' : ''}
                        </span>
                    </button>

                    <button
                        type="button"
                        className="admin-summary-card"
                        onClick={() =>
                            setActiveSection('involvement')
                        }
                    >
                        <span className="admin-summary-label">
                            GET INVOLVED
                        </span>

                        <strong>{involvementCount}</strong>

                        <span>
                            Opportunit
                            {involvementCount === 1
                                ? 'y'
                                : 'ies'}
                        </span>
                    </button>

                    <button
                        type="button"
                        className="admin-summary-card"
                        onClick={() =>
                            setActiveSection('gallery')
                        }
                    >
                        <span className="admin-summary-label">
                            PHOTO GALLERY
                        </span>

                        <strong>{galleryCount}</strong>

                        <span>
                            Photo{galleryCount !== 1 ? 's' : ''} Live
                        </span>
                    </button>
                </div>

                <div className="admin-tabs">
                    <button
                        type="button"
                        className={
                            activeSection === 'schedule'
                                ? 'admin-tab active'
                                : 'admin-tab'
                        }
                        onClick={() =>
                            setActiveSection('schedule')
                        }
                    >
                        Schedule
                    </button>

                    <button
                        type="button"
                        className={
                            activeSection === 'gazette'
                                ? 'admin-tab active'
                                : 'admin-tab'
                        }
                        onClick={() =>
                            setActiveSection('gazette')
                        }
                    >
                        Sikh Gazette
                    </button>

                    <button
                        type="button"
                        className={
                            activeSection === 'eboard'
                                ? 'admin-tab active'
                                : 'admin-tab'
                        }
                        onClick={() =>
                            setActiveSection('eboard')
                        }
                    >
                        E-Board
                    </button>

                    <button
                        type="button"
                        className={
                            activeSection === 'archive'
                                ? 'admin-tab active'
                                : 'admin-tab'
                        }
                        onClick={() =>
                            setActiveSection('archive')
                        }
                    >
                        Member Archive
                    </button>

                    <button
                        type="button"
                        className={
                            activeSection === 'involvement'
                                ? 'admin-tab active'
                                : 'admin-tab'
                        }
                        onClick={() =>
                            setActiveSection('involvement')
                        }
                    >
                        Get Involved
                    </button>

                    <button
                        type="button"
                        className={
                            activeSection === 'gallery'
                                ? 'admin-tab active'
                                : 'admin-tab'
                        }
                        onClick={() =>
                            setActiveSection('gallery')
                        }
                    >
                        Photo Gallery
                    </button>
                </div>

                {activeSection === 'schedule' && (
                    <ScheduleAdmin
                        onContentChange={loadDashboardCounts}
                    />
                )}

                {activeSection === 'gazette' && (
                    <GazetteAdmin
                        onContentChange={loadDashboardCounts}
                    />
                )}

                {activeSection === 'eboard' && (
                    <EBoardAdmin
                        onContentChange={loadDashboardCounts}
                    />
                )}

                {activeSection === 'archive' && (
                    <MemberArchiveAdmin
                        onContentChange={loadDashboardCounts}
                    />
                )}

                {activeSection === 'involvement' && (
                    <InvolvementAdmin
                        onContentChange={loadDashboardCounts}
                    />
                )}

                {activeSection === 'gallery' && (
                    <GalleryAdmin
                        onContentChange={loadDashboardCounts}
                    />
                )}
            </div>
        </main>
    )
}

export default Admin
