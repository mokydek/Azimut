import { useEffect, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Compass, LayoutDashboard, LogOut, NotebookPen, Radar, Route } from 'lucide-react'
import { useAuth } from '@frontend/auth/AuthProvider'
import { getProfile } from '@backend/services/profileService'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

const navItems: NavItem[] = [
  { to: '/app', label: 'Обзор', icon: LayoutDashboard, end: true },
  { to: '/app/assessment', label: 'Диагностика', icon: Radar },
  { to: '/app/roadmap', label: 'План', icon: Route },
  { to: '/app/tracker', label: 'Трекер', icon: NotebookPen },
]

function Wordmark() {
  return (
    <Link to="/app" className="flex items-center gap-2" aria-label="Azimut">
      <Compass size={20} strokeWidth={1.75} className="text-ink" aria-hidden />
      <span className="font-heading text-lg font-bold tracking-tight text-ink">Azimut</span>
    </Link>
  )
}

export function Sidebar() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [profileName, setProfileName] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    getProfile().then((result) => {
      if (!active) return
      if ('data' in result) {
        setProfileName(result.data?.full_name ?? null)
      }
    })
    return () => {
      active = false
    }
  }, [])

  const displayName = profileName ?? user?.email ?? ''

  // Leave the protected area before clearing the session so the guard does not
  // bounce us to /auth mid sign out.
  async function handleSignOut() {
    navigate('/', { replace: true })
    await signOut()
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-border bg-white px-4 py-6 md:flex">
        <Wordmark />

        <nav className="mt-8 flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink key={item.to} to={item.to} end={item.end} className="group block">
                {({ isActive }) => (
                  <span
                    className={`relative flex items-center gap-3 rounded-[2px] px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? 'bg-surface font-medium text-ink'
                        : 'text-muted group-hover:text-ink'
                    }`}
                  >
                    {isActive ? (
                      <span
                        className="absolute left-0 top-0 h-full w-[2px] bg-accent"
                        aria-hidden
                      />
                    ) : null}
                    <Icon size={18} strokeWidth={1.75} aria-hidden />
                    {item.label}
                  </span>
                )}
              </NavLink>
            )
          })}
        </nav>

        <div className="mt-auto border-t border-border pt-4">
          <div className="truncate text-[13px] text-ink">{displayName}</div>
          <button
            type="button"
            onClick={handleSignOut}
            className="mt-2 inline-flex items-center gap-2 text-[13px] text-muted transition-colors hover:text-ink"
          >
            <LogOut size={16} strokeWidth={1.75} aria-hidden />
            Выйти
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between border-b border-border bg-white px-4 md:hidden">
        <Wordmark />
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                aria-label={item.label}
                className={({ isActive }) =>
                  `flex h-9 w-9 items-center justify-center rounded-[2px] transition-colors ${
                    isActive ? 'bg-surface text-ink' : 'text-muted hover:text-ink'
                  }`
                }
              >
                <Icon size={18} strokeWidth={1.75} aria-hidden />
              </NavLink>
            )
          })}
          <button
            type="button"
            onClick={handleSignOut}
            aria-label="Выйти"
            className="flex h-9 w-9 items-center justify-center rounded-[2px] text-muted transition-colors hover:text-ink"
          >
            <LogOut size={18} strokeWidth={1.75} aria-hidden />
          </button>
        </div>
      </header>
    </>
  )
}
