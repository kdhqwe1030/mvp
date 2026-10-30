import { Check, Filter, Info, RotateCcw } from 'lucide-react'
import { DEPARTMENTS, TIERS, TOTAL_AGENTS, deptTotal, tierTotal } from '../../data/dashboard'

export default function FilterPanel({ dept, onDeptChange, tiers, onTierToggle, threshold, onThresholdChange, onReset }) {
  const deptOptions = [{ key: 'all', name: '전체 조직', total: TOTAL_AGENTS }].concat(
    DEPARTMENTS.map((d) => ({ key: d.key, name: d.name, total: deptTotal(d) })),
  )

  return (
    <aside className="card filter-panel">
      <div className="filter-panel__head">
        <span className="filter-panel__title">
          <Filter size={12} />
          필터 & 거버넌스
        </span>
        <button className="text-btn" onClick={onReset}>
          <RotateCcw size={9} />
          초기화
        </button>
      </div>

      <section className="filter-group">
        <div className="filter-group__label mono upper">조직 / 부서</div>
        <div className="dept-list">
          {deptOptions.map((d) => {
            const active = dept === d.key
            return (
              <button
                key={d.key}
                className={`dept-item${active ? ' is-active' : ''}`}
                onClick={() => onDeptChange(d.key)}
              >
                <span className="dept-item__name">
                  {active && <span className="dot dot--accent" />}
                  {d.name}
                </span>
                <span className="mono">{d.total}</span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="filter-group filter-group--bordered">
        <div className="filter-group__label-row">
          <span className="filter-group__label mono upper">
            데이터 민감도 <span className="ext-tag">확장</span>
          </span>
          <span className="mono filter-group__value">
            {tiers.length}/{TIERS.length} 선택
          </span>
        </div>
        <div className="tier-list">
          {TIERS.map((t) => {
            const checked = tiers.includes(t.key)
            return (
              <label key={t.key} className="tier-item">
                <span className="tier-item__left">
                  <input type="checkbox" checked={checked} onChange={() => onTierToggle(t.key)} />
                  <span className={`checkbox${checked ? ' is-checked' : ''}`}>
                    {checked && <Check size={11} strokeWidth={3} />}
                  </span>
                  <span>{t.label}</span>
                </span>
                <span className="chip mono">{tierTotal(t.key)}</span>
              </label>
            )
          })}
        </div>
      </section>

      <section className="filter-group filter-group--bordered">
        <div className="filter-group__label-row">
          <span className="filter-group__label mono upper">
            중복 유사도 임계값 <span className="ext-tag">확장</span>
          </span>
          <span className="mono filter-group__strong">{threshold.toFixed(2)}</span>
        </div>
        <div className="range">
          <input
            type="range"
            min="0.5"
            max="1"
            step="0.01"
            value={threshold}
            onChange={(e) => onThresholdChange(Number(e.target.value))}
          />
          <div className="range__scale mono muted">
            <span>0.5</span>
            <span>기본 0.75</span>
            <span>1.0</span>
          </div>
        </div>
        <div className="note">
          <Info size={12} />
          <p>
            임계값 이상 인스턴스 <strong>12개</strong>가 <strong>3개 군집</strong>으로 묶였습니다.
          </p>
        </div>
      </section>

    </aside>
  )
}
