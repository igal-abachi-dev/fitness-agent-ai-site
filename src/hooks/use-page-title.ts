import { useEffect } from 'react'
import { useLocation } from 'react-router'

const SITE_NAME = 'Fitness AI Coach'

/** Default `<title>` from index.html — restored when leaving a subpage. */
const DEFAULT_TITLE = `${SITE_NAME} — Plans, Nutrition & Chat`

const PAGE_TITLES: Record<string, string> = {
  '/': DEFAULT_TITLE,
  '/chat': `Coach Chat · ${SITE_NAME}`,
  '/ask': `Ask the Coach · ${SITE_NAME}`,
  '/plan': `Build a Plan · ${SITE_NAME}`,
}

/**
 * Keeps `document.title` in sync with the current route for bookmarks, tabs,
 * and crawlers that execute JS (Google). Initial HTML title in index.html
 * covers the first paint before hydration.
 */
export function usePageTitle() {
  const { pathname } = useLocation()

  useEffect(() => {
    document.title = PAGE_TITLES[pathname] ?? `Not Found · ${SITE_NAME}`
  }, [pathname])
}
