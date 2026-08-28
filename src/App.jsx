import { useEffect, useState } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from 'react-router-dom'

import './App.css'

import Home from './pages/Home'
import Schedule from './pages/Schedule'
import EBoard from './pages/EBoard'
import Gazette from './pages/Gazette'
import MemberArchive from './pages/MemberArchive'
import Applications from './pages/Applications'
import About from './pages/About'
import Admin from './pages/Admin'

function SiteLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  return (
    <>
      <header className="site-header">
        <nav className="navbar">
          <Link
            to="/"
            className="nav-logo"
            aria-label="NSSA Home"
          >
            <img
              src="/nssa-logo.png"
              alt="Northeastern Sikh Student Association"
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
            onClick={() =>
              setMenuOpen((current) => !current)
            }
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div
            className={
              menuOpen
                ? 'nav-links nav-links-open'
                : 'nav-links'
            }
          >
            <Link to="/">Home</Link>
            <Link to="/schedule">Schedule</Link>
            <Link to="/eboard">E-Board</Link>
            <Link to="/gazette">Sikh Gazette</Link>
            <Link to="/archive">Member Archive</Link>
            <Link to="/applications">Get Involved</Link>
            <Link to="/about">About</Link>
          </div>
        </nav>
      </header>

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
      </Routes>

      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-brand">
            <img
              src="/nssa-logo.png"
              alt="NSSA Logo"
            />

            <div>
              <h2>
                Northeastern Sikh Student Association
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
            Northeastern Sikh Student Association ·
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
