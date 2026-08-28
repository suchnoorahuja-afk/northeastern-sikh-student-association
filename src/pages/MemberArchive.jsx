import { useEffect, useMemo, useState } from 'react'
import { getMemberArchive } from '../lib/memberArchive'

function MemberArchive() {
  const [members, setMembers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadMembers() {
      try {
        const data = await getMemberArchive()
        setMembers(data)
      } catch (error) {
        console.error(error)
        setError(
          'Unable to load the member archive right now.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadMembers()
  }, [])

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return members
    }

    return members.filter((member) => {
      const searchableText = [
        member.name,
        member.role,
        member.graduation_year,
        member.years_active,
        member.email,
        member.contact_info,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return searchableText.includes(query)
    })
  }, [members, search])

  const groupedMembers = useMemo(() => {
    const groups = {}

    filteredMembers.forEach((member) => {
      const year =
        member.graduation_year || 'Other'

      if (!groups[year]) {
        groups[year] = []
      }

      groups[year].push(member)
    })

    return Object.entries(groups).sort(
      ([yearA], [yearB]) => {
        if (yearA === 'Other') return 1
        if (yearB === 'Other') return -1

        return Number(yearB) - Number(yearA)
      }
    )
  }, [filteredMembers])

  return (
    <main className="inner-page">
      <section className="page-hero">
        <p className="section-eyebrow">
          OUR COMMUNITY
        </p>

        <h1>Member Archive</h1>

        <p>
          Explore former SSAN members and the students
          who have helped build Sikh community at
          Northeastern over the years.
        </p>
      </section>

      <section className="archive-section">
        <div className="archive-toolbar">
          <input
            type="search"
            className="archive-search"
            placeholder="Search by name, role, year..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          <p>
            {filteredMembers.length} member
            {filteredMembers.length !== 1 ? 's' : ''}
          </p>
        </div>

        {loading && (
          <p className="schedule-status">
            Loading member archive...
          </p>
        )}

        {error && (
          <p className="schedule-status schedule-error">
            {error}
          </p>
        )}

        {!loading &&
          !error &&
          filteredMembers.length === 0 && (
            <p className="schedule-status">
              No members found.
            </p>
          )}

        {!loading &&
          !error &&
          groupedMembers.map(
            ([year, yearMembers]) => (
              <div
                className="archive-year-section"
                key={year}
              >
                <div className="archive-year-heading">
                  <p className="section-eyebrow">
                    MEMBER ARCHIVE
                  </p>

                  <h2>
                    {year === 'Other'
                      ? 'Former Members'
                      : `Class of ${year}`}
                  </h2>

                  <span>
                    {yearMembers.length} member
                    {yearMembers.length !== 1
                      ? 's'
                      : ''}
                  </span>
                </div>

                <div className="archive-grid">
                  {yearMembers.map((member) => (
                    <article
                      className="archive-card"
                      key={member.id}
                    >
                      <div className="archive-card-header">
                        <div>
                          <p className="archive-role">
                            {member.role ||
                              'Former Member'}
                          </p>

                          <h3>{member.name}</h3>
                        </div>
                      </div>

                      {member.years_active && (
                        <p className="archive-years">
                          NSSA: {member.years_active}
                        </p>
                      )}

                      <div className="archive-contact">
                        {member.email && (
                          <a
                            href={`mailto:${member.email}`}
                          >
                            {member.email}
                          </a>
                        )}

                        {member.linkedin && (
                          <a
                            href={member.linkedin}
                            target="_blank"
                            rel="noreferrer"
                          >
                            LinkedIn
                          </a>
                        )}

                        {member.contact_info && (
                          <p>
                            {member.contact_info}
                          </p>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )
          )}
      </section>
    </main>
  )
}

export default MemberArchive
