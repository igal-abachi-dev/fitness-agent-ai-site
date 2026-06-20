import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import { PanelLeft } from 'lucide-react'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { Button } from '@/components/ui/button'
import { ProfileModal } from '@/features/profile'
import { useMediaQuery } from '@/hooks/use-media-query'
import { cn } from '@/lib/utils'
import {
  useSetSidebarOpen,
  useSidebarOpen,
  useToggleSidebar,
} from '@/stores/useAppStore'

const DESKTOP_QUERY = '(min-width: 768px)'

/**
 * ChatGPT/Claude-style app shell.
 *
 * `sidebarOpen` means two things depending on viewport (resolved via
 * `useMediaQuery`): on desktop it toggles expanded ⇄ icon-rail; on mobile it
 * opens/closes an off-canvas drawer. The shell is a fixed-height app frame so
 * the sidebar stays put while the main pane scrolls internally.
 */
export function AppShell() {
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const sidebarOpen = useSidebarOpen()
  const setSidebarOpen = useSetSidebarOpen()
  const toggleSidebar = useToggleSidebar()
  const location = useLocation()

  // Sensible default per breakpoint: expanded on desktop, closed on mobile.
  useEffect(() => {
    setSidebarOpen(isDesktop)
  }, [isDesktop, setSidebarOpen])

  // Close the mobile drawer after navigating.
  useEffect(() => {
    if (!isDesktop) setSidebarOpen(false)
  }, [location.pathname, isDesktop, setSidebarOpen])

  return (
    <div className="bg-background flex h-svh overflow-hidden">
      {/* Desktop: persistent sidebar, width animates between expanded and rail */}
      <aside
        className={cn(
          'hidden shrink-0 border-r transition-[width] duration-200 ease-in-out md:block',
          sidebarOpen ? 'w-64' : 'w-[3.25rem]',
        )}
      >
        <AppSidebar collapsed={!sidebarOpen} onToggle={toggleSidebar} />
      </aside>

      {/* Mobile: off-canvas drawer + backdrop */}
      {!isDesktop && sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="animate-in fade-in-0 absolute inset-0 bg-black/50 duration-200"
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />
          <aside className="animate-in slide-in-from-left absolute inset-y-0 left-0 w-72 border-r shadow-lg duration-200">
            <AppSidebar
              collapsed={false}
              mobile
              onToggle={() => setSidebarOpen(false)}
              onNavigate={() => setSidebarOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* Main pane */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar with the drawer trigger */}
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-2 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            aria-label="Open sidebar"
          >
            <PanelLeft />
          </Button>
          <span className="font-semibold">Fitness AI</span>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Mounted once: auto-opens on first visit, editable later from the sidebar. */}
      <ProfileModal />
    </div>
  )
}
