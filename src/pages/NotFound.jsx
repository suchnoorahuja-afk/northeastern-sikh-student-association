import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <main className="not-found-page">
      <section className="not-found-content">
        <p className="section-eyebrow">404 · PAGE NOT FOUND</p>
        <h1>We couldn’t find that page.</h1>
        <p>
          The page may have moved or the address may be incorrect.
          Return home to continue exploring SSAN.
        </p>
        <Link to="/" className="button button-gold">
          Back to Home
        </Link>
      </section>
    </main>
  )
}

export default NotFound
