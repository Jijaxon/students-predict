import { NavLink } from 'react-router-dom'
import { BarChart2, GitBranch, Zap, GraduationCap, TrendingUp } from 'lucide-react'
import ThemeToggle from './ui/ThemeToggle'

const NAV_ITEMS = [
  { to: '/',           label: 'Dashboard',    icon: BarChart2 },
  { to: '/clustering', label: 'Clustering',   icon: GitBranch },
  { to: '/comparison', label: 'Comparison',   icon: TrendingUp },
  { to: '/predict',    label: 'Predict',      icon: Zap },
]

export default function Navbar() {
  return (
    <nav className="
      sticky top-0 z-50
      border-b border-[var(--border)]
      bg-[var(--bg-card)]
      backdrop-blur-sm
    ">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2 no-underline">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent-1)] flex items-center justify-center">
            <GraduationCap size={14} color="white" />
          </div>
          <span className="font-mono text-sm font-bold text-[var(--text-primary)] tracking-tight">
            EduCluster
          </span>
        </NavLink>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                transition-all duration-150 no-underline
                ${isActive
                  ? 'bg-[var(--accent-1)] text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                }
              `}
            >
              <Icon size={13} />
              {label}
            </NavLink>
          ))}
        </div>

        {/* Right side */}
        <ThemeToggle />
      </div>
    </nav>
  )
}
