import {
  lazy,
  Suspense,
  useEffect,
  useState,
} from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  NavLink,
} from 'react-router-dom'

import './App.css'

import Home from './pages/Home'
import RouteMetadata from './components/RouteMetadata'

const Schedule = lazy(() => import('./pages/Schedule'))
const EBoard = lazy(() => import('./pages/EBoard'))
const Gazette = lazy(() => import('./pages/Gazette'))
const MemberArchive = lazy(() => import('./pages/MemberArchive'))
const Gallery = lazy(() => import('./pages/Gallery'))
const Applications = lazy(() => import('./pages/Applications'))
const About = lazy(() => import('./pages/About'))
const Admin = lazy(() => import('./pages/Admin'))
const NotFound = lazy(() => import('./pages/NotFound'))

function SiteLayout() {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!menuOpen) return undefined

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [menuOpen])

  function navLinkClass({ isActive }) {
    return isActive ? 'nav-link active' : 'nav-link'
  }

  return (
    <>
      <RouteMetadata />

      <header className="site-header">
        <nav className="navbar">
          <Link
            to="/"
            className="nav-logo"
            aria-label="SSAN Home"
            onClick={() => setMenuOpen(false)}
          >
            <img
              src="/nssa-logo.png"
              alt="Sikh Student Association at Northeastern"
            />
          </Link>

          <button
            type="button"
            className="nav-menu-button"
            aria-label={
              menuOpen
                ? 'Close navigation menu'
                : 'Open navigation menu'
            }
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            onClick={() =>
              setMenuOpen((current) => !current)
            }
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div
            id="primary-navigation"
            className={
              menuOpen
                ? 'nav-links nav-links-open'
                : 'nav-links'
            }
          >
            <NavLink to="/" end className={navLinkClass} onClick={() => setMenuOpen(false)}>Home</NavLink>
            <NavLink to="/schedule" className={navLinkClass} onClick={() => setMenuOpen(false)}>Schedule</NavLink>
            <NavLink to="/eboard" className={navLinkClass} onClick={() => setMenuOpen(false)}>E-Board</NavLink>
            <NavLink to="/gazette" className={navLinkClass} onClick={() => setMenuOpen(false)}>Sikh Gazette</NavLink>
            <NavLink to="/archive" className={navLinkClass} onClick={() => setMenuOpen(false)}>Member Archive</NavLink>
            <NavLink to="/gallery" className={navLinkClass} onClick={() => setMenuOpen(false)}>Photo Gallery</NavLink>
            <NavLink to="/applications" className={navLinkClass} onClick={() => setMenuOpen(false)}>Get Involved</NavLink>
            <NavLink to="/about" className={navLinkClass} onClick={() => setMenuOpen(false)}>About</NavLink>
          </div>
        </nav>
      </header>

      <Suspense
        fallback={(
          <main className="route-loading" role="status">
            <span className="route-loading-mark" />
            <p>Loading...</p>
          </main>
        )}
      >
        <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/schedule"
          element={<Schedule />}
        />

        <Route
          path="/eboard"
          element={<EBoard />}
        />

        <Route
          path="/gazette"
          element={<Gazette />}
        />

        <Route
          path="/archive"
          element={<MemberArchive />}
        />

        <Route
          path="/gallery"
          element={<Gallery />}
        />

        <Route
          path="/applications"
          element={<Applications />}
        />

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/admin"
          element={<Admin />}
        />

        <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-brand">
            <img
              src="/nssa-logo.png"
              alt="SSAN Logo"
            />

            <div>
              <h2>
                Sikh Student Association at Northeastern
              </h2>

              <p>Sikhi · Seva · Sangat</p>
            </div>
          </div>

          <div className="footer-column">
            <h3>Explore</h3>

            <Link to="/schedule">
              Schedule
            </Link>

            <Link to="/eboard">
              E-Board
            </Link>

            <Link to="/gazette">
              Sikh Gazette
            </Link>

            <Link to="/archive">
              Member Archive
            </Link>

            <Link to="/gallery">
              Photo Gallery
            </Link>

            <Link to="/about">
              About
            </Link>
          </div>

          <div className="footer-column">
            <h3>Get Involved</h3>

            <Link to="/applications">
              Applications & Sign-Ups
            </Link>

            <a
              href="https://www.instagram.com/nssaboston/"
              target="_blank"
              rel="noreferrer"
            >
              Instagram
            </a>

            <Link
              to="/admin"
              className="footer-admin-link"
            >
              Admin Access
            </Link>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            Sikh Student Association at Northeastern ·
            Boston, Massachusetts
          </p>

          <p>
            This student organization website is not an
            official Northeastern University website.
          </p>
        </div>
      </footer>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <SiteLayout />
    </BrowserRouter>
  )
}

export default App
