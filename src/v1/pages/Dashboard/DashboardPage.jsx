import { useMemo, useState } from 'react'
import { Calendar, Download, LayoutDashboard, Link2, Network, Plus } from 'lucide-react'
import { AGENTS, TIERS } from '../../../data/dashboard'
import FilterPanel from './FilterPanel'
import KpiCards from './KpiCards'
import { DeptSensitivityChart, DuplicateClusters, LlmDonutChart } from './Charts'
import AgentTable from './AgentTable'
import './dashboard.css'

const ALL_TIERS = TIERS.map((t) => t.key)
const DEFAULT_THRESHOLD = 0.82

export default function DashboardPage({ onNavigate }) {
  const [dept, setDept] = useState('all')
  const [tiers, setTiers] = useState(ALL_TIERS)
  const [threshold, setThreshold] = useState(DEFAULT_THRESHOLD)
  const [query, setQuery] = useState('')

  const toggleTier = (key) =>
    setTiers((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))

  const resetFilters = () => {
    setDept('all')
    setTiers(ALL_TIERS)
    setThreshold(DEFAULT_THRESHOLD)
    setQuery('')
  }

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return AGENTS.filter((a) => {
      if (dept !== 'all' && a.dept !== dept) return false
      if (!tiers.includes(a.data[0].tier)) return false
      if (!q) return true
      const haystack = [a.name, a.id, a.purpose, a.model, a.stack, ...a.data.map((d) => d.label)].join(' ')
      return haystack.toLowerCase().includes(q)
    })
  }, [dept, tiers, query])

  return (
    <div className="page">
      <div className="context-bar">
        <div className="mode-switch">
          <button onClick={() => onNavigate('graph')}>
            <Network size={12} />
            지식 그래프 뷰
          </button>
          <button className="is-active">
            <LayoutDashboard size={11} />
            Executive 대시보드
            <span className="mode-switch__badge mono">Live</span>
          </button>
        </div>
        <div className="context-bar__right">
          <span className="context-chip mono">기간 2026-07-01 ~ 09-30</span>
          <button className="outline-btn mono">
            <Calendar size={11} />
            Q3 2026 분기 리포트
          </button>
          <button className="primary-btn">
            <Plus size={9} strokeWidth={3} />
            신규 Agent 등록
          </button>
        </div>
      </div>

      <div className="layout-grid">
        <FilterPanel
          dept={dept}
          onDeptChange={setDept}
          tiers={tiers}
          onTierToggle={toggleTier}
          threshold={threshold}
          onThresholdChange={setThreshold}
          onReset={resetFilters}
        />

        <div className="main-col">
          <section className="page-head">
            <div>
              <div className="page-head__meta">
                <span className="context-chip mono upper">Q3 2026 · 정기 리포트</span>
                <span className="mono muted">최종 동기화 2026-10-30 09:00</span>
              </div>
              <h1 className="page-head__title">
                사내 AI Agent 현황 및
                <br />
                중복 · 리스크 거버넌스 대시보드
              </h1>
            </div>
            <div className="page-head__actions">
              <button className="outline-btn">
                <Download size={10} />
                보고서 내보내기
              </button>
              <button className="outline-btn">
                <Link2 size={10} />
                공유 링크 복사
              </button>
            </div>
          </section>

          <KpiCards />

          <div className="chart-row">
            <DeptSensitivityChart />
            <LlmDonutChart />
            <DuplicateClusters />
          </div>

          <AgentTable rows={rows} query={query} onQueryChange={setQuery} />
        </div>
      </div>
    </div>
  )
}
