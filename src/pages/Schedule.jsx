import { useEffect, useState } from 'react'
import { getEvents, formatEventDate } from '../lib/events'
import { safeExternalUrl } from '../lib/externalUrls'

function Schedule() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await getEvents()
        setEvents(data)
      } catch (err) {
        console.error(err)
        setError('Unable to load the schedule right now.')
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [])

  return (
    <main className="inner-page">
      <section className="page-hero">
        <p className="section-eyebrow">SSAN EVENTS</p>
        <h1>Schedule</h1>

        <p>
          Explore upcoming SSAN events, community gatherings, seva
          opportunities, and cultural programming.
        </p>
      </section>

      <section className="schedule-section">
        {loading && (
          <p className="schedule-status">
            Loading schedule...
          </p>
        )}

        {error && (
          <p className="schedule-status schedule-error">
            {error}
          </p>
        )}

        {!loading && !error && events.length === 0 && (
          <p className="schedule-status">
            No upcoming events have been posted yet.
          </p>
        )}

        {!loading && !error && events.length > 0 && (
          <div className="schedule-list">
            {events.map((event) => {
              const date = formatEventDate(event.event_date)
              const eventLink = safeExternalUrl(event.link)

              return (
                <article
                  className="schedule-card"
                  key={event.id}
                >
                  <div className="schedule-date">
                    <span>{date.month}</span>
                    <strong>{date.day}</strong>
                  </div>

                  <div className="schedule-content">
                    {event.category && (
                      <p className="event-type">
                        {event.category}
                      </p>
                    )}

                    <h2>{event.title}</h2>

                    {event.description && (
                      <p>{event.description}</p>
                    )}

                    <div className="schedule-meta">
                      {event.time && (
                        <span>{event.time}</span>
                      )}

                      {event.location && (
                        <span>{event.location}</span>
                      )}
                    </div>

                    {eventLink && (
                      <a
                        href={eventLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-link schedule-event-link"
                      >
                        Event Details →
                      </a>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}

export default Schedule
