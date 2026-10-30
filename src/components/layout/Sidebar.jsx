import { ChevronsLeft, Hexagon, LayoutDashboard, Network, Sparkles, UserPlus } from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Executive 대시보드', icon: LayoutDashboard, page: 'dashboard' },
  { label: '지식 그래프', icon: Network, page: 'graph' },
  { label: 'Agent 등록', icon: UserPlus, page: 'register' },
  { label: '지식 그래프 + 검색', icon: Sparkles, page: 'graph-search' },
]

export default function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar__brand">
          <div className="sidebar__logo">
            <span className="sidebar__logo-mark">
              <Hexagon size={12} color="#fff" strokeWidth={2.5} />
            </span>
            <span className="mono sidebar__logo-text">AI Agent Hub</span>
          </div>
          <button className="icon-btn icon-btn--ghost" aria-label="사이드바 접기">
            <ChevronsLeft size={14} />
          </button>
        </div>

        <nav className="sidebar__nav">
          {NAV_ITEMS.map(({ label, icon: Icon, page }) => (
            <a
              key={label}
              href={`/${page}`}
              className={`sidebar__link${page === activePage ? ' is-active' : ''}`}
              onClick={(e) => {
                e.preventDefault()
                onNavigate(page)
              }}
            >
              <Icon size={14} />
              <span>{label}</span>
            </a>
          ))}
        </nav>
      </div>
    </aside>
  )
}
