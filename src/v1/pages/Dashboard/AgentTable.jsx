import { ChevronDown, ChevronLeft, ChevronRight, Eye, Search, TableProperties } from 'lucide-react'
import { TOTAL_AGENTS } from '../../../data/dashboard'
import { ACCENT, ACCENT_300, SLATE } from '../../../theme'

const DUP_DOT = { high: ACCENT, mid: ACCENT_300, none: SLATE[300] }

const COLUMNS = ['Agent / 식별자', '부서', '업무 성격', '모델 / 스택', '데이터 등급', '중복 상태', '관리']

export default function AgentTable({ rows, query, onQueryChange }) {
  return (
    <section className="card table-card">
      <div className="table-card__head">
        <div>
          <h2 className="table-card__title">
            <TableProperties size={12} />
            사내 AI Agent 인벤토리
          </h2>
          <p className="mono muted">
            총 {TOTAL_AGENTS}개 중 필터링 결과 {rows.length}개 표시 중
          </p>
        </div>
        <div className="table-card__controls">
          <label className="search">
            <Search size={11} className="search__icon" />
            <input
              placeholder="식별자, 업무 성격, 데이터..."
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
            />
          </label>
          <select className="select">
            <option>전체 상태</option>
            <option>중복 의심</option>
            <option>부분 중복</option>
            <option>고유</option>
          </select>
          <select className="select">
            <option>최근 업데이트 순</option>
            <option>민감도 높은 순</option>
            <option>이름 순</option>
          </select>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              {COLUMNS.map((c, i) => (
                <th key={c} className={`mono${i === COLUMNS.length - 1 ? ' is-right' : ''}`}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className="table__empty muted">
                  조건에 맞는 Agent가 없습니다.
                </td>
              </tr>
            )}
            {rows.map((a) => (
              <tr key={a.id}>
                <td>
                  <div className="agent-cell">
                    <span className="agent-cell__no mono">{a.no}</span>
                    <div>
                      <div className="agent-cell__name">{a.name}</div>
                      <div className="mono muted agent-cell__id">{a.id}</div>
                    </div>
                  </div>
                </td>
                <td className="table__dept">{a.deptLabel}</td>
                <td className="muted">{a.purpose}</td>
                <td>
                  <div className="mono">{a.model}</div>
                  <div className="mono muted table__small">{a.stack}</div>
                </td>
                <td>
                  <div className="data-tags">
                    {a.data.map((d) => (
                      <span key={d.label} className="data-tag">
                        <span className={`tier-badge tier-badge--${d.tier.toLowerCase()} mono`}>{d.tier}</span>
                        {d.label}
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  <div className="dup-status mono">
                    <span className="dot" style={{ background: DUP_DOT[a.dup.level] }} />
                    {a.dup.label}
                  </div>
                  <div className="muted table__small">{a.dup.note}</div>
                </td>
                <td className="is-right">
                  <div className="row-actions">
                    <button className="ghost-btn">
                      <Eye size={11} />
                      상세
                    </button>
                    <button className="mini-btn" aria-label="더보기">
                      <ChevronDown size={11} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <div className="pagination__info mono muted">
          <span>표시 행</span>
          <span className="chip">10</span>
          <span>
            1–{rows.length} / {TOTAL_AGENTS} 결과
          </span>
        </div>
        <div className="pagination__pages mono">
          <button className="page-btn" disabled aria-label="이전">
            <ChevronLeft size={11} />
          </button>
          <button className="page-btn is-active">1</button>
          <button className="page-btn">2</button>
          <button className="page-btn">3</button>
          <span className="muted">…</span>
          <button className="page-btn">15</button>
          <button className="page-btn" aria-label="다음">
            <ChevronRight size={11} />
          </button>
        </div>
      </div>
    </section>
  )
}
