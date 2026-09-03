import { useEffect, useState } from 'react'

import {
  formatGazetteDate,
  getGazettes,
} from '../lib/gazettes'
import { safeExternalUrl } from '../lib/externalUrls'

function GazetteCover({ gazette, latest = false }) {
  return (
    <div className="gazette-cover-frame">
      {gazette.cover_url ? (
        <img
          src={gazette.cover_url}
          alt={`${gazette.title} cover`}
          loading={latest ? 'eager' : 'lazy'}
          fetchPriority={latest ? 'high' : 'auto'}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
          }}
        />
      ) : (
        <div className="gazette-cover-error">
          Cover image unavailable
        </div>
      )}
    </div>
  )
}

function Gazette() {
  const [gazettes, setGazettes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadGazettes() {
      try {
        const data = await getGazettes()
        setGazettes(data)
      } catch (loadError) {
        console.error(loadError)
        setError('Could not load Sikh Gazette issues.')
      } finally {
        setLoading(false)
      }
    }

    loadGazettes()
  }, [])

  const latestIssue = gazettes[0]
  const previousIssues = gazettes.slice(1)
  const latestLink = safeExternalUrl(latestIssue?.link)

  return (
    <main>
      <section className="page-hero">
        <p className="section-eyebrow">
          SSAN PUBLICATION
        </p>

        <h1>Sikh Gazette</h1>

        <p>
          Read the latest issue of the Sikh Gazette and
          explore previous editions from Northeastern's
          Sikh Student Association.
        </p>
      </section>

      <section className="gazette-page-section">
        {loading && (
          <div className="gazette-state">
            Loading Gazette issues...
          </div>
        )}

        {!loading && error && (
          <div className="gazette-state">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          gazettes.length === 0 && (
            <div className="gazette-state">
              No Sikh Gazette issues have been published yet.
            </div>
          )}

        {!loading && !error && latestIssue && (
          <>
            <article className="latest-gazette">
              <div className="latest-gazette-cover">
                {latestLink ? <a
                  href={latestLink}
                  target="_blank"
                  rel="noreferrer"
                  className="gazette-cover-link"
                  aria-label={`Open ${latestIssue.title}`}
                >
                  <span className="gazette-cover-badge">
                    Latest Issue
                  </span>

                  <GazetteCover
                    gazette={latestIssue}
                    latest
                  />
                </a> : (
                  <div className="gazette-cover-link">
                    <span className="gazette-cover-badge">
                      Latest Issue
                    </span>
                    <GazetteCover gazette={latestIssue} latest />
                  </div>
                )}
              </div>

              <div className="latest-gazette-copy">
                <p className="section-eyebrow">
                  LATEST ISSUE
                </p>

                <h2>{latestIssue.title}</h2>

                <p className="latest-gazette-date">
                  {formatGazetteDate(
                    latestIssue.issue_date
                  )}
                </p>

                <p>
                  {latestIssue.description ||
                    'Read the newest issue of the Sikh Gazette.'}
                </p>

                {latestLink ? <a
                  href={latestLink}
                  target="_blank"
                  rel="noreferrer"
                  className="button button-blue"
                >
                  Read Latest Issue
                </a> : (
                  <p className="gazette-link-unavailable">
                    PDF currently unavailable
                  </p>
                )}
              </div>
            </article>

            {previousIssues.length > 0 && (
              <>
                <div className="archive-heading">
                  <p className="section-eyebrow">
                    THE ARCHIVE
                  </p>

                  <h2>Previous Issues</h2>

                  <p>
                    Browse earlier editions of the Sikh
                    Gazette.
                  </p>
                </div>

                <div className="gazette-archive-grid">
                  {previousIssues.map((gazette) => {
                    const gazetteLink = safeExternalUrl(gazette.link)

                    return (
                    <article
                      className="archive-card gazette-archive-card"
                      key={gazette.id}
                    >
                      <div className="gazette-archive-cover">
                        {gazetteLink ? <a
                          href={gazetteLink}
                          target="_blank"
                          rel="noreferrer"
                          className="gazette-cover-link"
                          aria-label={`Open ${gazette.title}`}
                        >
                          <GazetteCover
                            gazette={gazette}
                          />
                        </a> : (
                          <div className="gazette-cover-link">
                            <GazetteCover gazette={gazette} />
                          </div>
                        )}
                      </div>

                      <div className="gazette-archive-content">
                        <div className="archive-date">
                          <span>
                            {formatGazetteDate(
                              gazette.issue_date
                            )}
                          </span>

                          <strong>Issue</strong>
                        </div>

                        <h3>{gazette.title}</h3>

                        {gazette.description && (
                          <p className="gazette-archive-description">
                            {gazette.description}
                          </p>
                        )}

                        {gazetteLink ? <a
                          href={gazetteLink}
                          target="_blank"
                          rel="noreferrer"
                          className="button button-outline"
                        >
                          Read Issue
                        </a> : (
                          <p className="gazette-link-unavailable">
                            PDF currently unavailable
                          </p>
                        )}
                      </div>
                    </article>
                    )
                  })}
                </div>
              </>
            )}
          </>
        )}
      </section>
    </main>
  )
}

export default Gazette
