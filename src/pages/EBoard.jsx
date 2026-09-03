import { useEffect, useState } from 'react'
import { getEBoardMembers } from '../lib/eboard'

function EBoard() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadEBoard() {
      try {
        const data = await getEBoardMembers()
        setMembers(data)
      } catch (error) {
        console.error(error)

        setError(
          'Unable to load the E-Board right now.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadEBoard()
  }, [])

  return (
    <main className="inner-page">
      <section className="page-hero">
        <p className="section-eyebrow">
          MEET THE TEAM
        </p>

        <h1>Our E-Board</h1>

        <p>
          Meet the students helping lead SSAN and build
          Sikh community at Northeastern.
        </p>
      </section>

      <section className="eboard-section">
        {loading && (
          <p className="schedule-status">
            Loading E-Board...
          </p>
        )}

        {error && (
          <p className="schedule-status schedule-error">
            {error}
          </p>
        )}

        {!loading &&
          !error &&
          members.length === 0 && (
            <p className="schedule-status">
              E-Board information is coming soon.
            </p>
          )}

        {!loading &&
          !error &&
          members.length > 0 && (
            <div className="eboard-grid">
              {members.map((member) => (
                <article
                  className="eboard-card"
                  key={member.id}
                >
                  <div className="eboard-image">
                    <img
                      src={
                        member.photo_url ||
                        '/nssa-logo.png'
                      }
                      alt={`${member.name}, ${member.role}`}
                      onError={(event) => {
                        event.currentTarget.src =
                          '/nssa-logo.png'
                      }}
                    />
                  </div>

                  <div className="eboard-content">
                    <p className="eboard-role">
                      {member.role}
                    </p>

                    <h2>{member.name}</h2>
                  </div>
                </article>
              ))}
            </div>
          )}
      </section>
    </main>
  )
}

export default EBoard
