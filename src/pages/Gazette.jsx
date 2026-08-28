import { useEffect, useState } from 'react'
import {
  getGazettes,
  formatGazetteDate,
} from '../lib/gazettes'

function Gazette() {
  const [gazettes, setGazettes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadGazettes() {
      try {
        const data = await getGazettes()
        setGazettes(data)
      } catch (error) {
        console.error(error)

        setError(
          'Unable to load the Sikh Gazette right now.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadGazettes()
  }, [])

  return (
    <main className="gazette-page">
      <section className="page-hero">
        <p className="section-eyebrow">
          THE SIKH GAZETTE
        </p>

        <h1>Sikh Gazette</h1>

        <p>
          News, reflections, community updates, event
          recaps, and stories from the Northeastern Sikh
          Student Association.
        </p>
      </section>

      <section className="gazette-library">
        <div className="section-heading">
          <p className="section-eyebrow">
            OUR PUBLICATIONS
          </p>

          <h2>Latest Issues</h2>

          <p>
            Explore current and past editions of the Sikh
            Gazette.
          </p>
        </div>

        {loading && (
          <p className="schedule-status">
            Loading Gazette issues...
          </p>
        )}

        {error && (
          <p className="schedule-status schedule-error">
            {error}
          </p>
        )}

        {!loading &&
          !error &&
          gazettes.length === 0 && (
            <p className="schedule-status">
              No Gazette issues have been published yet.
            </p>
          )}

        {!loading &&
          !error &&
          gazettes.length > 0 && (
            <div className="gazette-issue-grid">
              {gazettes.map((gazette, index) => (
                <article
                  className={`gazette-issue-card ${index === 0
                      ? 'gazette-latest-issue'
                      : ''
                    }`}
                  key={gazette.id}
                >
                  <div>
                    {index === 0 && (
                      <p className="gazette-latest-label">
                        LATEST ISSUE
                      </p>
                    )}

                    <p className="gazette-issue-date">
                      {formatGazetteDate(
                        gazette.issue_date
                      )}
                    </p>

                    <h2>{gazette.title}</h2>

                    {gazette.description && (
                      <p className="gazette-issue-description">
                        {gazette.description}
                      </p>
                    )}
                  </div>

                  <a
                    href={gazette.link}
                    target="_blank"
                    rel="noreferrer"
                    className="button button-blue"
                  >
                    Read Issue
                  </a>
                </article>
              ))}
            </div>
          )}
      </section>
    </main>
  )
}

export default Gazette
