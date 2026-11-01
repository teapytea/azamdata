import { Link, Outlet } from '@tanstack/react-router'
import { Icon } from '@/components/ui/Icon'
import { useAuth } from '@/providers/auth-context'

const navigation = [
  { to: '/', label: 'Dashboard', mobileLabel: 'Home', icon: 'home' },
  { to: '/finance', label: 'Finance', mobileLabel: 'Money', icon: 'account_balance_wallet' },
  { to: '/subscriptions', label: 'Subscriptions', mobileLabel: 'Subs', icon: 'credit_card' },
  { to: '/ideas', label: 'Ideas', mobileLabel: 'Ideas', icon: 'lightbulb' },
  { to: '/quota', label: 'Quota', mobileLabel: 'Quota', icon: 'data_usage' },
  { to: '/connections', label: 'Connections', mobileLabel: 'Track', icon: 'hub' },
] as const

export function AppShell() {
  const { signOut, user } = useAuth()
  const displayName = typeof user?.user_metadata.full_name === 'string'
    ? user.user_metadata.full_name
    : user?.email?.split('@')[0] ?? 'Personal OS'

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="mobile-topbar">
        <Link className="brand" to="/">
          <img alt="Personal OS" src="/assets/personal-os.png" />
          <span>Personal OS</span>
        </Link>
        <button aria-label="Notifications" className="icon-button" type="button">
          <Icon name="notifications" />
          <span className="notification-dot" />
        </button>
      </header>

      <aside className="sidebar">
        <Link className="sidebar-brand" to="/">
          <img alt="Personal OS" src="/assets/personal-os.png" />
          <span>
            <strong>Personal OS</strong>
            <small>Command Center</small>
          </span>
        </Link>
        <nav aria-label="Primary navigation" className="sidebar-nav">
          {navigation.map((item) => (
            <Link
              activeOptions={{ exact: item.to === '/' }}
              activeProps={{ 'aria-current': 'page' }}
              className="sidebar-link"
              key={item.to}
              to={item.to}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-profile">
          <img alt="" src="/assets/avatar.png" />
          <span>
            <strong>{displayName}</strong>
            <small>{user?.email}</small>
          </span>
          <button aria-label="Sign out" className="icon-button small" onClick={() => void signOut()} type="button"><Icon name="logout" size={19} /></button>
        </div>
      </aside>

      <main className="app-main" id="main-content">
        <Outlet />
      </main>

      <nav aria-label="Mobile navigation" className="bottom-nav">
        {navigation.map((item) => (
          <Link
            activeOptions={{ exact: item.to === '/' }}
            activeProps={{ 'aria-current': 'page' }}
            className="bottom-link"
            key={item.to}
            to={item.to}
          >
            <span className="bottom-icon"><Icon name={item.icon} size={21} /></span>
            <small>{item.mobileLabel}</small>
          </Link>
        ))}
      </nav>
    </div>
  )
}
