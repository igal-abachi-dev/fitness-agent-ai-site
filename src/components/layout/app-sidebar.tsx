import {
  ClipboardList,
  Dumbbell,
  type LucideIcon,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  Sparkles,
  SquarePen,
  UserRound,
  X,
} from 'lucide-react'
import { Link, NavLink } from 'react-router'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  PROFILE_LABELS,
  useOpenProfileModal,
  useProfile,
} from '@/features/profile'

/** Primary feature navigation. Each maps to a route under the app shell. */
const NAV_ITEMS: ReadonlyArray<{ to: string; icon: LucideIcon; label: string }> =
  [
    { to: '/ask', icon: Sparkles, label: 'Ask the coach' },
    { to: '/plan', icon: ClipboardList, label: 'Build a plan' },
  ]

/**
 * Placeholder conversation history. Static until chat persistence exists —
 * replace with a TanStack Query–backed list then (no server-side conversations
 * endpoint yet; chat is currently stateless/multi-turn via the messages array).
 */
const SAMPLE_CONVERSATIONS = [
  { id: '1', title: 'Push/pull/legs split for hypertrophy' },
  { id: '2', title: 'High-protein vegetarian meal plan' },
  { id: '3', title: 'Cutting macros at 1800 kcal' },
  { id: '4', title: 'Mobility routine for desk workers' },
  { id: '5', title: 'Creatine timing and dosage' },
]

interface NavItemProps {
  to: string
  icon: LucideIcon
  label: string
  collapsed: boolean
  onNavigate?: () => void
  end?: boolean
}

function NavItem({ to, icon: Icon, label, collapsed, onNavigate, end }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        cn(
          buttonVariants({
            variant: isActive ? 'secondary' : 'ghost',
            size: collapsed ? 'icon' : 'default',
          }),
          !collapsed && 'w-full justify-start font-normal',
          !isActive && 'text-muted-foreground',
        )
      }
    >
      <Icon />
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  )
}

interface AppSidebarProps {
  /** Desktop icon-rail mode. Ignored on mobile (drawer is always expanded). */
  collapsed: boolean
  /** Toggle/close affordance: collapses the rail on desktop, closes the drawer on mobile. */
  onToggle: () => void
  /** Called when a nav item is activated (used to close the mobile drawer). */
  onNavigate?: () => void
  /** Renders the mobile drawer variant (close button instead of collapse). */
  mobile?: boolean
}

export function AppSidebar({
  collapsed,
  onToggle,
  onNavigate,
  mobile = false,
}: AppSidebarProps) {
  const ToggleIcon = mobile ? X : collapsed ? PanelLeftOpen : PanelLeftClose
  const profile = useProfile()
  const openProfileModal = useOpenProfileModal()

  const handleEditProfile = () => {
    openProfileModal()
    onNavigate?.()
  }

  return (
    <div className="bg-sidebar text-sidebar-foreground flex h-full flex-col">
      {/* Header: brand + collapse/close */}
      <div
        className={cn(
          'flex h-12 items-center px-2',
          collapsed ? 'justify-center' : 'justify-between',
        )}
      >
        {!collapsed && (
          <Link to="/" onClick={onNavigate} className="flex items-center gap-2 px-1 font-semibold">
            <Dumbbell className="size-5" />
            Fitness AI
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          aria-label={mobile ? 'Close sidebar' : 'Toggle sidebar'}
        >
          <ToggleIcon />
        </Button>
      </div>

      {/* Primary actions + feature nav */}
      <div className="flex flex-col gap-1 px-2">
        {collapsed ? (
          <NavLink
            to="/chat"
            onClick={onNavigate}
            title="New chat"
            className={cn(buttonVariants({ size: 'icon' }))}
          >
            <SquarePen />
          </NavLink>
        ) : (
          <NavLink
            to="/chat"
            onClick={onNavigate}
            className={cn(buttonVariants(), 'w-full justify-start')}
          >
            <SquarePen />
            New chat
          </NavLink>
        )}

        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.to}
            {...item}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}

        {!collapsed && (
          <Button variant="ghost" className="text-muted-foreground justify-start">
            <Search />
            Search chats
          </Button>
        )}
      </div>

      {/* Conversation history (hidden in the icon rail) */}
      {!collapsed && (
        <nav className="mt-4 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-2">
          <p className="text-muted-foreground px-2 py-1 text-xs font-medium">
            Recent
          </p>
          {SAMPLE_CONVERSATIONS.map((conversation) => (
            <Button
              key={conversation.id}
              variant="ghost"
              className="text-muted-foreground hover:text-foreground w-full justify-start font-normal"
              onClick={onNavigate}
            >
              <MessageSquare />
              <span className="truncate">{conversation.title}</span>
            </Button>
          ))}
        </nav>
      )}

      {collapsed && <div className="flex-1" />}

      {/* Footer: settings + user */}
      <div className="mt-auto flex flex-col gap-1 border-t p-2">
        <Button
          variant="ghost"
          size={collapsed ? 'icon' : 'default'}
          className={cn('text-muted-foreground', !collapsed && 'justify-start')}
          title={collapsed ? 'Settings' : undefined}
          aria-label="Settings"
        >
          <Settings />
          {!collapsed && 'Settings'}
        </Button>
        <button
          type="button"
          onClick={handleEditProfile}
          title={collapsed ? 'Edit profile' : undefined}
          aria-label="Edit profile"
          className={cn(
            'hover:bg-accent flex items-center gap-2 rounded-lg p-1.5 text-left transition-colors',
            collapsed && 'justify-center',
          )}
        >
          <span className="bg-primary text-primary-foreground flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-medium">
            <UserRound className="size-4" />
          </span>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {profile ? 'Your profile' : 'Set up profile'}
              </p>
              <p className="text-muted-foreground truncate text-xs">
                {profile
                  ? PROFILE_LABELS.primaryGoal[profile.primaryGoal]
                  : 'Tap to get started'}
              </p>
            </div>
          )}
        </button>
      </div>
    </div>
  )
}
