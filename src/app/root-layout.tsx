import { useEffect } from 'react'
import { Outlet, ScrollRestoration } from 'react-router'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { usePageTitle } from '@/hooks/use-page-title'
import { useTheme } from '@/stores/useAppStore'

/**
 * App shell rendered for every route. Owns cross-cutting concerns: theme class,
 * scroll restoration, and global toasts. Pure client SPA, so touching
 * `document` / `matchMedia` here is safe (no SSR).
 */
export function RootLayout() {
  const theme = useTheme()
  usePageTitle()

  useEffect(() => {
    const root = document.documentElement
    const isDark =
      theme === 'dark' ||
      (theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)

    root.classList.toggle('dark', isDark)
  }, [theme])

  return (
    <TooltipProvider>
      <Outlet />
      <ScrollRestoration />
      <Toaster />
    </TooltipProvider>
  )
}
