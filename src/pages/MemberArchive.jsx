import { useEffect, useMemo, useState } from 'react'
import { getMemberArchive } from '../lib/memberArchive'
import './MemberArchive.css'

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

      <section className="member-archive-section">
        <div className="member-archive-container">
          <div className="member-archive-toolbar">
            <div className="member-search-wrapper">
              <input
                type="search"
                className="member-archive-search"
                placeholder="Search by name, role, year..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>

            <p className="member-archive-count">
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
                <section
                  className="member-year-section"
                  key={year}
                >
                  <div className="member-year-heading">
                    <div>
                      <p className="member-year-eyebrow">
                        MEMBER ARCHIVE
                      </p>

                      <h2>
                        {year === 'Other'
                          ? 'Former Members'
                          : `Class of ${year}`}
                      </h2>
                    </div>

                    <span>
                      {yearMembers.length} member
                      {yearMembers.length !== 1
                        ? 's'
                        : ''}
                    </span>
                  </div>

                  <div className="member-list">
                    <div className="member-list-header">
                      <span>Name</span>
                      <span>Role</span>
                      <span>Years Active</span>
                      <span>Contact</span>
                    </div>

                    {yearMembers.map((member) => (
                      <article
                        className="member-list-row"
                        key={member.id}
                      >
                        <div className="member-list-name">
                          <strong>{member.name}</strong>
                        </div>

                        <div className="member-list-role">
                          {member.role ||
                            'Former Member'}
                        </div>

                        <div className="member-list-years">
                          {member.years_active || '—'}
                        </div>

                        <div className="member-list-contact">
                          {member.email && (
                            <a
                              href={`mailto:${member.email}`}
                            >
                              Email
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
                            <span>
                              {member.contact_info}
                            </span>
                          )}

                          {!member.email &&
                            !member.linkedin &&
                            !member.contact_info && (
                              <span>—</span>
                            )}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )
            )}
        </div>
      </section>
    </main>
  )
}

export default MemberArchive
