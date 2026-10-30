import { ArrowUpRight, Check, ChevronLeft, ListFilter } from 'lucide-react'
import { GRAPH_DEPTS, NODE_TYPES } from '../../../data/graph'
import { PRESETS } from './graphUtils'

const TIER_LABELS = ['L1 공개', 'L2 사내', 'L3 대외비', 'L4 극비']

export default function ExplorerPanel({
  types,
  onToggleType,
  typeCounts,
  dept,
  onDeptChange,
  minTier,
  onMinTierChange,
  preset,
  onPresetChange,
  presetCounts,
  stats,
  onCollapse,
}) {
  return (
    <aside className="g-explorer">
      <div className="g-explorer__head">
        <div className="g-explorer__title">
          <ListFilter size={13} />
          <div>
            <h2>그래프 탐색기</h2>
            <span className="mono">
              {stats.totalNodes} NODES · {stats.totalLinks} EDGES
            </span>
          </div>
        </div>
        <button className="g-icon-btn" onClick={onCollapse} aria-label="패널 접기">
          <ChevronLeft size={12} />
        </button>
      </div>

      <div className="g-explorer__body">
        <section className="g-section">
          <div className="g-section__label">
            <span>Preset Queries</span>
            <span className="g-section__count">{String(PRESETS.length).padStart(2, '0')}</span>
          </div>
          <div className="g-presets">
            {PRESETS.map((p) => (
              <button
                key={p.key}
                className={`g-preset${preset === p.key ? ' is-active' : ''}`}
                onClick={() => onPresetChange(preset === p.key ? null : p.key)}
              >
                <span className="g-preset__name">
                  <span className="g-dot" style={{ background: p.color }} />
                  {p.label}
                </span>
                {preset === p.key ? (
                  <span className="g-chip mono">{String(presetCounts[p.key]).padStart(2, '0')}</span>
                ) : (
                  <ArrowUpRight size={11} className="g-faint" />
                )}
              </button>
            ))}
          </div>
        </section>

        <section className="g-section">
          <div className="g-section__label">엔터티 유형 (Entity Types)</div>
          <div className="g-types">
            {NODE_TYPES.map((t) => {
              const checked = types.includes(t.key)
              return (
                <label key={t.key} className="g-type">
                  <span className="g-type__name">
                    <input type="checkbox" checked={checked} onChange={() => onToggleType(t.key)} />
                    <span className={`g-checkbox${checked ? ' is-checked' : ''}`}>
                      {checked && <Check size={11} strokeWidth={3} />}
                    </span>
                    <span className="g-dot g-dot--lg" style={{ background: t.color }} />
                    {t.label}
                  </span>
                  <span className="mono g-faint">{typeCounts[t.key]}</span>
                </label>
              )
            })}
          </div>
        </section>

        <section className="g-section">
          <div className="g-section__label">소속 부서 / 도메인</div>
          <div className="g-pills">
            {[{ key: 'all', label: '전체' }, ...GRAPH_DEPTS].map((d) => (
              <button
                key={d.key}
                className={`g-pill${dept === d.key ? ' is-active' : ''}`}
                onClick={() => onDeptChange(d.key)}
              >
                {d.label}
              </button>
            ))}
          </div>
        </section>

        <section className="g-section">
          <div className="g-section__label">
            <span>최소 데이터 민감도</span>
            <span className="g-section__value mono">L{minTier} 이상</span>
          </div>
          <div className="g-tier">
            <input
              type="range"
              min="1"
              max="4"
              step="1"
              value={minTier}
              onChange={(e) => onMinTierChange(Number(e.target.value))}
            />
            <div className="g-tier__scale mono">
              {TIER_LABELS.map((label, i) => (
                <span key={label} className={i + 1 === minTier ? 'is-active' : ''}>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="g-status">
        <div>
          <span>표시 노드</span>
          <strong className="mono">
            {stats.nodes} / {stats.totalNodes}
          </strong>
        </div>
        <div>
          <span>표시 링크</span>
          <strong className="mono">
            {stats.links} / {stats.totalLinks}
          </strong>
        </div>
        <div>
          <span>시뮬레이션</span>
          <span className="g-status__sim mono">
            <span className={`g-dot${stats.running ? ' is-pulsing' : ''}`} />
            {stats.running ? 'running' : 'stable'}
          </span>
        </div>
      </div>
    </aside>
  )
}
