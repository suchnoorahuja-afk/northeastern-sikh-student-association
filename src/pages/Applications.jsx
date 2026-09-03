import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { supabase } from '../lib/supabase'
import { safeExternalUrl } from '../lib/externalUrls'
import './Applications.css'

function formatStatus(status) {
  if (status === 'coming-soon') {
    return 'Coming Soon'
  }

  if (status === 'closed') {
    return 'Closed'
  }

  return 'Open'
}

function Applications() {
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadOpportunities() {
      try {
        const { data, error: loadError } =
          await supabase
            .from('involvement_opportunities')
            .select('*')
            .order('display_order', {
              ascending: true,
            })
            .order('id', {
              ascending: true,
            })

        if (loadError) {
          throw loadError
        }

        setOpportunities(data || [])
      } catch (loadError) {
        console.error(loadError)

        setError(
          'Could not load current opportunities.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadOpportunities()
  }, [])

  return (
    <main className="involvement-page">
      <section className="involvement-hero">
        <div className="involvement-hero-content">
          <p className="involvement-eyebrow">
            GET INVOLVED
          </p>

          <h1>Find your place in SSAN</h1>

          <p>
            Explore leadership opportunities,
            applications, service, events, and other
            ways to take part in the Sikh community at
            Northeastern.
          </p>

          <div className="involvement-hero-buttons">
            <a
              href="#opportunities"
              className="involvement-gold-button"
            >
              View Opportunities
            </a>

            <Link
              to="/schedule"
              className="involvement-hero-outline"
            >
              Upcoming Events
            </Link>
          </div>
        </div>
      </section>

      <section
        className="involvement-opportunities-section"
        id="opportunities"
      >
        <div className="involvement-container">
          <div className="involvement-section-heading">
            <p className="involvement-eyebrow">
              CURRENT OPPORTUNITIES
            </p>

            <h2>Ways to get involved</h2>

            <p>
              See what is currently open and find an
              opportunity that fits how you want to
              contribute.
            </p>
          </div>

          {loading && (
            <div className="involvement-state">
              Loading opportunities...
            </div>
          )}

          {!loading && error && (
            <div className="involvement-state involvement-error">
              {error}
            </div>
          )}

          {!loading &&
            !error &&
            opportunities.length === 0 && (
              <div className="involvement-empty">
                <p className="involvement-eyebrow">
                  CHECK BACK SOON
                </p>

                <h3>
                  No opportunities are open right now.
                </h3>

                <p>
                  Follow SSAN on Instagram or check
                  back later for new applications and
                  sign-ups.
                </p>
              </div>
            )}

          {!loading &&
            !error &&
            opportunities.length > 0 && (
              <div className="involvement-feature-list">
                {opportunities.map(
                  (opportunity) => {
                    const status =
                      opportunity.status || 'open'
                    const opportunityLink =
                      safeExternalUrl(opportunity.link)

                    return (
                      <article
                        className="involvement-feature"
                        key={opportunity.id}
                      >
                        <div className="involvement-feature-accent" />

                        <div className="involvement-feature-main">
                          <div className="involvement-feature-copy">
                            <div className="involvement-feature-meta">
                              {opportunity.category && (
                                <span className="involvement-category">
                                  {
                                    opportunity.category
                                  }
                                </span>
                              )}

                              <span
                                className={`involvement-status involvement-status-${status}`}
                              >
                                {formatStatus(
                                  status
                                )}
                              </span>
                            </div>

                            <h3>
                              {opportunity.title}
                            </h3>

                            {opportunity.description && (
                              <p>
                                {
                                  opportunity.description
                                }
                              </p>
                            )}
                          </div>

                          <div className="involvement-feature-action">
                            {status === 'open' &&
                              opportunityLink && (
                                <a
                                  href={
                                    opportunityLink
                                  }
                                  target="_blank"
                                  rel="noreferrer"
                                  className="involvement-primary-button"
                                >
                                  Apply / Sign Up
                                </a>
                              )}

                            {status === 'open' &&
                              !opportunityLink && (
                                <span className="involvement-unavailable">
                                  Details coming soon
                                </span>
                              )}

                            {status ===
                              'coming-soon' && (
                              <span className="involvement-unavailable">
                                Link coming soon
                              </span>
                            )}

                            {status === 'closed' && (
                              <span className="involvement-unavailable">
                                This opportunity is
                                closed
                              </span>
                            )}
                          </div>
                        </div>
                      </article>
                    )
                  }
                )}
              </div>
            )}
        </div>
      </section>

      <section className="involvement-more-section">
        <div className="involvement-container">
          <div className="involvement-section-heading involvement-more-heading">
            <p className="involvement-eyebrow">
              MORE WAYS TO CONNECT
            </p>

            <h2>
              You do not need a position to be part of
              the community.
            </h2>
          </div>

          <div className="involvement-path-grid">
            <Link
              to="/schedule"
              className="involvement-path"
            >
              <span>01</span>

              <h3>Attend an Event</h3>

              <p>
                Join community gatherings, seva,
                discussions, and social events.
              </p>

              <strong>View Schedule →</strong>
            </Link>

            <a
              href="https://www.instagram.com/nssaboston/"
              target="_blank"
              rel="noreferrer"
              className="involvement-path"
            >
              <span>02</span>

              <h3>Follow SSAN</h3>

              <p>
                Keep up with announcements, events,
                applications, and community updates.
              </p>

              <strong>Instagram →</strong>
            </a>

            <div className="involvement-path">
              <span>03</span>

              <h3>Join the Mailing List</h3>

              <p>
                Get SSAN announcements, upcoming
                events, opportunities, and community
                updates delivered directly to you.
              </p>

              <strong>Coming Soon</strong>
            </div>

            <Link
              to="/eboard"
              className="involvement-path"
            >
              <span>04</span>

              <h3>Meet the E-Board</h3>

              <p>
                Learn more about the students helping
                lead SSAN.
              </p>

              <strong>Meet the Team →</strong>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Applications
