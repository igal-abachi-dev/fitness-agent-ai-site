import { useEffect } from 'react'
import { useLocation } from 'react-router'

const SITE_NAME = 'Fitness AI Coach'

const DEFAULT_META = {
  title: `${SITE_NAME} — Plans, Nutrition & Chat`,
  description:
    'AI fitness coach for personalized training plans, nutrition guidance, and expert answers — built for hypertrophy, strength, fat loss, and more.',
} as const

/** Public routes get unique descriptions; app routes only override the tab title. */
const ROUTE_META: Record<string, { title: string; description?: string }> = {
  '/': DEFAULT_META,
  '/ask': {
    title: `Ask the Coach · ${SITE_NAME}`,
    description:
      'Get expert answers on training, nutrition, and recovery from your AI fitness coach.',
  },
  '/plan': {
    title: `Build a Plan · ${SITE_NAME}`,
    description:
      'Generate a personalized workout and nutrition plan from your profile and goals.',
  },
  '/chat': {
    title: `Coach Chat · ${SITE_NAME}`,
  },
}

function setMetaContent(
  selector: string,
  attr: 'name' | 'property',
  key: string,
  content: string,
) {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = content
}

function applyRouteMeta(pathname: string) {
  const route = ROUTE_META[pathname]
  const title = route?.title ?? `Not Found · ${SITE_NAME}`
  const description = route?.description ?? DEFAULT_META.description

  document.title = title

  setMetaContent(
    'meta[name="description"]',
    'name',
    'description',
    description,
  )
  setMetaContent(
    'meta[property="og:title"]',
    'property',
    'og:title',
    title,
  )
  setMetaContent(
    'meta[property="og:description"]',
    'property',
    'og:description',
    description,
  )
  setMetaContent(
    'meta[name="twitter:title"]',
    'name',
    'twitter:title',
    title,
  )
  setMetaContent(
    'meta[name="twitter:description"]',
    'name',
    'twitter:description',
    description,
  )
}

/**
 * Keeps document title and meta tags in sync with the current route. Initial
 * values come from index.html for first paint; this hook updates them after
 * navigation for tabs, bookmarks, and JS-aware crawlers (Google).
 */
export function useRouteMeta() {
  const { pathname } = useLocation()

  useEffect(() => {
    applyRouteMeta(pathname)
  }, [pathname])
}
