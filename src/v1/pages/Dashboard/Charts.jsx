import { ChartBar, ChartPie, ChevronRight, Combine } from 'lucide-react'
import { CLUSTERS, DEPARTMENTS, LLM_SHARE, TIERS, deptTotal } from '../../../data/dashboard'

function ChartHeader({ icon: Icon, title, aside }) {
  return (
    <div className="chart__head">
      <span className="chart__title">
        <Icon size={12} />
        {title}
      </span>
      {aside}
    </div>
  )
}

export function DeptSensitivityChart() {
  return (
    <div className="card chart">
      <ChartHeader
        icon={ChartBar}
        title="부서별 Agent · 민감도 분포"
        aside={<span className="mono muted">단위: 개</span>}
      />
      <div className="stack-bars">
        {DEPARTMENTS.map((d) => {
          const total = deptTotal(d)
          return (
            <div key={d.key} className="stack-bar">
              <div className="stack-bar__label">
                <span>{d.name}</span>
                <span className="mono">{total}</span>
              </div>
              <div className="stack-bar__track">
                {TIERS.map((t) => (
                  <span
                    key={t.key}
                    title={`${t.key}: ${d.tiers[t.key]}`}
                    style={{ width: `${(d.tiers[t.key] / total) * 100}%`, background: t.color }}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
      <div className="chart__legend">
        {TIERS.map((t) => (
          <span key={t.key} className="mono muted">
            <span className="dot" style={{ background: t.color }} />
            {t.key}
          </span>
        ))}
      </div>
    </div>
  )
}

export function LlmDonutChart() {
  const r = 38
  const circumference = 2 * Math.PI * r
  const external = LLM_SHARE.filter((s) => s.name !== '사내 SLM').reduce((a, s) => a + s.value, 0)

  const segments = LLM_SHARE.map((s, i) => {
    const offset = LLM_SHARE.slice(0, i).reduce((a, x) => a + x.value, 0)
    return { ...s, offset }
  })

  return (
    <div className="card chart">
      <ChartHeader icon={ChartPie} title="플랫폼 & LLM 의존도" aside={<span className="mono muted">N=142</span>} />
      <div className="donut-wrap">
        <div className="donut">
          <svg viewBox="0 0 96 96">
            <circle cx="48" cy="48" r={r} fill="none" stroke="#F1F5F9" strokeWidth="10" />
            {segments.map((s) => (
              <circle
                key={s.name}
                cx="48"
                cy="48"
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth="10"
                strokeDasharray={`${(s.value / 100) * circumference} ${circumference}`}
                strokeDashoffset={-(s.offset / 100) * circumference}
              />
            ))}
          </svg>
          <div className="donut__center">
            <strong className="mono">{external}%</strong>
            <span className="muted">외부</span>
          </div>
        </div>
        <ul className="donut-legend">
          {LLM_SHARE.map((s) => (
            <li key={s.name}>
              <span className="donut-legend__name">
                <span className="dot" style={{ background: s.color }} />
                {s.name}
              </span>
              <span className="mono">{s.value}%</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="chart__summary mono">
        <span className="muted">외부 API 의존도</span>
        <strong>벤더 집중 위험: 중간</strong>
      </div>
    </div>
  )
}

export function DuplicateClusters() {
  return (
    <div className="card chart">
      <ChartHeader icon={Combine} title="중복 의심 Agent 군집" aside={<span className="chip mono">AI</span>} />
      <p className="chart__desc muted">
        업무 영역과 프롬프트 의도가 겹치는 인스턴스를 군집화하여 중복 개발을 방지합니다.
      </p>
      <div className="clusters">
        {CLUSTERS.map((c) => (
          <div key={c.name} className="cluster">
            <div>
              <div className="cluster__name">{c.name}</div>
              <div className="cluster__meta mono muted">{c.meta}</div>
            </div>
            <div className="cluster__right">
              <span className={`cluster__score mono${c.similarity >= 0.9 ? ' is-high' : ''}`}>{c.similarity.toFixed(2)}</span>
              <button className="mini-btn" aria-label={`${c.name} 상세`}>
                <ChevronRight size={10} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="chart__foot">
        <div className="mono">
          <div className="muted">통합 시 예상 절감</div>
          <strong>₩6.4M / 월</strong>
        </div>
        <a href="#" className="link">
          전체 보기
        </a>
      </div>
    </div>
  )
}
