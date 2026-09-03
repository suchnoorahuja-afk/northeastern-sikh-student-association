import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const canonicalOrigin = 'https://www.northeasternsikhs.org'

const publicMetadata = {
  '/': {
    title: 'Sikh Student Association at Northeastern | SSAN',
    description:
      'The Sikh Student Association at Northeastern builds community through Sikhi, seva, sangat, cultural events, and interfaith engagement.',
  },
  '/schedule': {
    title: 'Schedule | Sikh Student Association at Northeastern',
    description:
      'View upcoming SSAN events, community gatherings, seva opportunities, and cultural programming at Northeastern.',
  },
  '/eboard': {
    title: 'E-Board | Sikh Student Association at Northeastern',
    description:
      'Meet the student leaders serving the Sikh Student Association at Northeastern and its community.',
  },
  '/gazette': {
    title: 'Sikh Gazette | Sikh Student Association at Northeastern',
    description:
      'Read the Sikh Gazette for SSAN news, community stories, event recaps, and student reflections.',
  },
  '/archive': {
    title: 'Member Archive | Sikh Student Association at Northeastern',
    description:
      'Explore the SSAN member archive and recognize students who have helped build Sikh community at Northeastern.',
  },
  '/gallery': {
    title: 'Photo Gallery | Sikh Student Association at Northeastern',
    description:
      'View photos from SSAN events, celebrations, seva, conversations, and community gatherings.',
  },
  '/applications': {
    title: 'Get Involved | Sikh Student Association at Northeastern',
    description:
      'Find SSAN leadership, service, event, and community opportunities at Northeastern.',
  },
  '/about': {
    title: 'About | Sikh Student Association at Northeastern',
    description:
      'Learn about SSAN, its Sikh values, and its work building an inclusive community at Northeastern.',
  },
}

const privateMetadata = {
  title: 'SSAN Admin | Sikh Student Association at Northeastern',
  description: 'Administrative access for the SSAN website.',
}

const notFoundMetadata = {
  title: 'Page Not Found | Sikh Student Association at Northeastern',
  description: 'The requested SSAN webpage could not be found.',
}

function setMetaContent(selector, content) {
  document.querySelector(selector)?.setAttribute('content', content)
}

function RouteMetadata() {
  const { pathname } = useLocation()

  useEffect(() => {
    const normalizedPath =
      pathname === '/' ? '/' : pathname.replace(/\/+$/, '')
    const isAdmin = normalizedPath === '/admin'
    const metadata = isAdmin
      ? privateMetadata
      : publicMetadata[normalizedPath] || notFoundMetadata
    const canonicalPath = normalizedPath || '/'
    const canonicalUrl = `${canonicalOrigin}${
      canonicalPath === '/' ? '/' : canonicalPath
    }`

    document.title = metadata.title
    document
      .querySelector('link[rel="canonical"]')
      ?.setAttribute('href', canonicalUrl)

    setMetaContent('meta[name="description"]', metadata.description)
    setMetaContent(
      'meta[name="robots"]',
      isAdmin || !publicMetadata[normalizedPath]
        ? 'noindex, nofollow'
        : 'index, follow'
    )
    setMetaContent('meta[property="og:title"]', metadata.title)
    setMetaContent(
      'meta[property="og:description"]',
      metadata.description
    )
    setMetaContent('meta[property="og:url"]', canonicalUrl)
    setMetaContent('meta[name="twitter:title"]', metadata.title)
    setMetaContent(
      'meta[name="twitter:description"]',
      metadata.description
    )
  }, [pathname])

  return null
}

export default RouteMetadata
