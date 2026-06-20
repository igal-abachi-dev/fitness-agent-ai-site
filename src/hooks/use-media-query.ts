import { useSyncExternalStore } from 'react'

/**
 * Subscribe to a CSS media query. Uses `useSyncExternalStore` so reads stay
 * tearing-safe under React 19 concurrent rendering.
 *
 * @example const isDesktop = useMediaQuery('(min-width: 768px)')
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}
