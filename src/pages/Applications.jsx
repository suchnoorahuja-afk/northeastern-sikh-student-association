import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function Applications() {
    const [opportunities, setOpportunities] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        async function loadOpportunities() {
            try {
                const { data, error } = await supabase
                    .from('involvement_opportunities')
                    .select('*')
                    .order('display_order', { ascending: true })
                    .order('id', { ascending: true })

                if (error) {
                    throw error
                }

                setOpportunities(data || [])
            } catch (error) {
                console.error(error)
                setError(
                    'Unable to load Get Involved opportunities right now.'
                )
            } finally {
                setLoading(false)
            }
        }

        loadOpportunities()
    }, [])

    function formatStatus(status) {
        if (status === 'coming-soon') {
            return 'Coming Soon'
        }

        if (status === 'closed') {
            return 'Closed'
        }

        return 'Open'
    }

    return (
        <main className="inner-page">
            <section className="page-hero">
                <p className="section-eyebrow">
                    GET INVOLVED
                </p>

                <h1>Join NSSA</h1>

                <p>
                    Explore current applications, sign-ups,
                    leadership opportunities, and other ways to
                    get involved with the Northeastern Sikh
                    Student Association.
                </p>
            </section>

            <section className="involvement-section">
                {loading && (
                    <p className="schedule-status">
                        Loading opportunities...
                    </p>
                )}

                {error && (
                    <p className="schedule-status schedule-error">
                        {error}
                    </p>
                )}

                {!loading &&
                    !error &&
                    opportunities.length === 0 && (
                        <div className="involvement-empty">
                            <p className="section-eyebrow">
                                CURRENT OPPORTUNITIES
                            </p>

                            <h2>Nothing open right now</h2>

                            <p>
                                Check back soon for future applications,
                                sign-ups, and ways to get involved with
                                NSSA.
                            </p>
                        </div>
                    )}

                {!loading &&
                    !error &&
                    opportunities.length > 0 && (
                        <div className="involvement-grid">
                            {opportunities.map((opportunity) => (
                                <article
                                    className="involvement-card"
                                    key={opportunity.id}
                                >
                                    <div className="involvement-card-top">
                                        <div>
                                            <p className="involvement-category">
                                                {opportunity.category ||
                                                    'OPPORTUNITY'}
                                            </p>

                                            <h2>{opportunity.title}</h2>
                                        </div>

                                        <span
                                            className={`involvement-status involvement-status-${opportunity.status}`}
                                        >
                                            {formatStatus(
                                                opportunity.status
                                            )}
                                        </span>
                                    </div>

                                    {opportunity.description && (
                                        <p className="involvement-description">
                                            {opportunity.description}
                                        </p>
                                    )}

                                    <div className="involvement-card-footer">
                                        {opportunity.status === 'open' &&
                                            opportunity.link && (
                                                <a
                                                    href={opportunity.link}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="button button-blue"
                                                >
                                                    Apply / Sign Up
                                                </a>
                                            )}

                                        {opportunity.status ===
                                            'coming-soon' && (
                                                <span className="involvement-unavailable">
                                                    Link coming soon
                                                </span>
                                            )}

                                        {opportunity.status === 'closed' && (
                                            <span className="involvement-unavailable">
                                                This opportunity is closed
                                            </span>
                                        )}

                                        {opportunity.status === 'open' &&
                                            !opportunity.link && (
                                                <span className="involvement-unavailable">
                                                    Details coming soon
                                                </span>
                                            )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
            </section>
        </main>
    )
}

export default Applications
