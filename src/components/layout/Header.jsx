import { Bell, Layers, Search, Settings } from 'lucide-react'

const HEADER_STATS = [
  { label: 'Active Agents', value: '142' },
  { label: '월 호출 수', value: '1.28M' },
  { label: 'SLA', value: '99.9%' },
]

export default function Header() {
  return (
    <header className="header">
      <div className="header__left">
        <div className="header__title">
          <span className="header__title-icon">
            <Layers size={16} />
          </span>
          <div>
            <div className="header__name">AI Agent Hub</div>
            <div className="mono muted upper header__sub">Governance Console</div>
          </div>
        </div>
        <span className="vdivider" />
        <span className="status-pill mono">
          <span className="dot dot--green" />
          All systems OK
        </span>
      </div>

      <label className="search header__search">
        <Search size={12} className="search__icon" />
        <input placeholder="Agent, 부서, 모델 검색..." />
        <kbd className="mono">⌘K</kbd>
      </label>

      <div className="header__right">
        <div className="header__stats">
          {HEADER_STATS.map((s, i) => (
            <div key={s.label} className="header__stat-wrap">
              {i > 0 && <span className="vdivider" />}
              <div className="header__stat">
                <span className="mono muted upper">{s.label}</span>
                <strong className="mono">{s.value}</strong>
              </div>
            </div>
          ))}
        </div>

        <div className="header__actions">
          <button className="icon-btn" aria-label="알림">
            <Bell size={14} />
            <span className="icon-btn__badge" />
          </button>
          <button className="icon-btn" aria-label="설정">
            <Settings size={14} />
          </button>
        </div>

        <span className="vdivider" />

        <div className="header__user">
          <div className="header__user-text">
            <span className="header__user-name">AI 거버넌스팀</span>
            <span className="mono muted">admin · 관리자</span>
          </div>
          <span className="avatar mono">AG</span>
        </div>
      </div>
    </header>
  )
}
