import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import {
  getEvents,
  formatEventDate,
} from '../lib/events'

import {
  getGazettes,
  formatGazetteDate,
} from '../lib/gazettes'

function Home() {
  const [events, setEvents] = useState([])
  const [loadingEvents, setLoadingEvents] =
    useState(true)

  const [latestGazette, setLatestGazette] =
    useState(null)

  const [loadingGazette, setLoadingGazette] =
    useState(true)

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await getEvents()

        setEvents(data.slice(0, 3))
      } catch (error) {
        console.error(
          'Could not load events:',
          error
        )
      } finally {
        setLoadingEvents(false)
      }
    }

    async function loadLatestGazette() {
      try {
        const data = await getGazettes()

        if (data.length > 0) {
          setLatestGazette(data[0])
        }
      } catch (error) {
        console.error(
          'Could not load Gazette:',
          error
        )
      } finally {
        setLoadingGazette(false)
      }
    }

    loadEvents()
    loadLatestGazette()
  }, [])

  return (
    <main className="home">
      <section className="hero">
        <div className="hero-content">
          <p className="hero-eyebrow">
            SIKHI · SEVA · SANGAT
          </p>

          <h1>
            Sikh Student Association
            <span>
              at Northeastern University
            </span>
          </h1>

          <p className="hero-description">
            Building a community rooted in Sikhi,
            service, and connection at Northeastern
            University.
          </p>

          <div className="hero-buttons">
            <Link
              to="/schedule"
              className="button button-gold"
            >
              Upcoming Events
            </Link>

            <Link
              to="/applications"
              className="button button-outline"
            >
              Get Involved
            </Link>
          </div>
        </div>

        <div className="hero-logo">
          <img
            src="/nssa-logo.png"
            alt="NSSA Logo"
          />
        </div>
      </section>

      {/* EVENTS */}

      <section className="upcoming-section">
        <div className="section-heading">
          <p className="section-eyebrow">
            WHAT'S HAPPENING
          </p>

          <h2>Upcoming Events</h2>

          <p>
            Join us for community gatherings, seva,
            discussions, and cultural events throughout
            the semester.
          </p>
        </div>

        {loadingEvents && (
          <p className="schedule-status">
            Loading upcoming events...
          </p>
        )}

        {!loadingEvents &&
          events.length === 0 && (
            <p className="schedule-status">
              No upcoming events have been posted yet.
            </p>
          )}

        {!loadingEvents &&
          events.length > 0 && (
            <div className="event-grid">
              {events.map((event) => {
                const date =
                  formatEventDate(
                    event.event_date
                  )

                return (
                  <article
                    className="event-card"
                    key={event.id}
                  >
                    <div className="event-date">
                      <span>
                        {date.month}
                      </span>

                      <strong>
                        {date.day}
                      </strong>
                    </div>

                    <div className="event-info">
                      {event.category && (
                        <p className="event-type">
                          {
                            event.category
                          }
                        </p>
                      )}

                      <h3>
                        {event.title}
                      </h3>

                      {event.description && (
                        <p>
                          {
                            event.description
                          }
                        </p>
                      )}

                      <p className="event-details">
                        {event.time ||
                          'Time TBD'}

                        {event.location &&
                          ` · ${event.location}`}
                      </p>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

        <div className="section-button">
          <Link
            to="/schedule"
            className="button button-blue"
          >
            View Full Schedule
          </Link>
        </div>
      </section>

      {/* ABOUT */}

      <section className="about-section">
        <div className="about-content">
          <p className="section-eyebrow">
            WHO WE ARE
          </p>

          <h2>
            Built around Sikhi, Seva, and Sangat
          </h2>

          <p>
            NSSA is a community for Sikh students and
            anyone interested in learning more about
            Sikhi. We create spaces for connection,
            service, reflection, cultural programming,
            and interfaith engagement across
            Northeastern.
          </p>

          <Link
            to="/about"
            className="text-link"
          >
            Learn more about NSSA →
          </Link>
        </div>

        <div className="pillar-grid">
          <article className="pillar-card">
            <h3>Sikhi</h3>

            <p>
              Learn, reflect, and connect through
              conversations about Sikh history,
              values, and traditions.
            </p>
          </article>

          <article className="pillar-card">
            <h3>Seva</h3>

            <p>
              Serve others through volunteering,
              community initiatives, and service
              opportunities throughout Boston.
            </p>
          </article>

          <article className="pillar-card">
            <h3>Sangat</h3>

            <p>
              Build lasting friendships and create a
              welcoming community for students across
              Northeastern.
            </p>
          </article>
        </div>
      </section>

      {/* GAZETTE */}

      <section className="gazette-preview">
        <div className="gazette-copy">
          <p className="section-eyebrow">
            THE SIKH GAZETTE
          </p>

          <h2>
            Stay connected with the community
          </h2>

          <p>
            Read our newsletter for NSSA updates,
            community stories, event recaps, and
            reflections from students.
          </p>

          <Link
            to="/gazette"
            className="button button-gold"
          >
            Explore the Sikh Gazette
          </Link>
        </div>

        <div className="gazette-card">
          {loadingGazette && (
            <p>
              Loading latest issue...
            </p>
          )}

          {!loadingGazette &&
            !latestGazette && (
              <>
                <p className="gazette-label">
                  SIKH GAZETTE
                </p>

                <h3>
                  New issue coming soon
                </h3>

                <p>
                  Check back for the latest
                  Gazette publication.
                </p>
              </>
            )}

          {!loadingGazette &&
            latestGazette && (
              <>
                <p className="gazette-label">
                  LATEST ISSUE
                </p>

                <h3>
                  {latestGazette.title}
                </h3>

                <p className="home-gazette-date">
                  {formatGazetteDate(
                    latestGazette.issue_date
                  )}
                </p>

                {latestGazette.description && (
                  <p>
                    {
                      latestGazette.description
                    }
                  </p>
                )}

                <a
                  href={latestGazette.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-link"
                >
                  Read issue →
                </a>
              </>
            )}
        </div>
      </section>

      {/* CTA */}

      <section className="cta-section">
        <div>
          <p className="section-eyebrow">
            JOIN THE COMMUNITY
          </p>

          <h2>
            There’s a place for you at NSSA.
          </h2>

          <p>
            Come to an event, join our mailing list,
            volunteer, or get involved with the
            E-Board.
          </p>
        </div>

        <Link
          to="/applications"
          className="button button-gold"
        >
          Get Involved
        </Link>
      </section>
    </main>
  )
}

export default Home
