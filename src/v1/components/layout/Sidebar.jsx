import { Bot, ChevronsLeft, Hexagon, LayoutDashboard, Network, ShieldCheck, Wallet } from 'lucide-react'

// page 가 없는 메뉴는 아직 화면이 없다
const NAV_ITEMS = [
  { label: 'Executive 대시보드', icon: LayoutDashboard, page: 'dashboard' },
  { label: 'Agent 레지스트리', icon: Bot },
  { label: '지식 그래프', icon: Network, page: 'graph' },
  { label: '데이터 거버넌스', icon: ShieldCheck },
  { label: '비용 & 사용량', icon: Wallet },
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
            <span className="mono sidebar__logo-text">AgentHub</span>
          </div>
          <button className="icon-btn icon-btn--ghost" aria-label="사이드바 접기">
            <ChevronsLeft size={14} />
          </button>
        </div>

        <div className="sidebar__section-label mono">Domains</div>

        <nav className="sidebar__nav">
          {NAV_ITEMS.map(({ label, icon: Icon, page }) => (
            <a
              key={label}
              href="#"
              className={`sidebar__link${page && page === activePage ? ' is-active' : ''}`}
              onClick={(e) => {
                e.preventDefault()
                if (page) onNavigate(page)
              }}
            >
              <Icon size={14} />
              <span>{label}</span>
            </a>
          ))}
        </nav>
      </div>

      <div className="sidebar__footer">
        <div className="health-card">
          <div className="health-card__row">
            <span className="mono muted upper">Index Health</span>
            <span className="health-card__status">
              <span className="dot dot--green" />
              <span className="mono">99.9%</span>
            </span>
          </div>
          <div className="health-card__bar">
            <span style={{ width: '99.9%' }} />
          </div>
          <div className="health-card__row">
            <span className="muted">마지막 인덱싱</span>
            <span className="mono muted">2분 전</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
