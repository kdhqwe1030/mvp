import { useEffect, useRef, useState } from 'react'
import { ArrowUp, Loader2, Sparkles, X } from 'lucide-react'
import { EXAMPLE_QUERIES } from '../../services/agentSearch'

export function LlmSearchBox({ search, variant = 'panel', placeholder = '자연어로 Agent 찾기 — 예: 개인정보를 다루는 Agent', onFocus, onSubmit }) {
  const loading = search.status === 'loading'
  return (
    <form
      className={`llm-box llm-box--${variant}`}
      onSubmit={(e) => {
        e.preventDefault()
        search.run(search.query)
        onSubmit?.()
      }}
    >
      <Sparkles size={13} className="llm-box__icon" />
      <input
        value={search.query}
        onChange={(e) => search.setQuery(e.target.value)}
        onFocus={onFocus}
        placeholder={placeholder}
        aria-label="LLM 기반 Agent 검색"
      />
      {search.query && !loading && (
        <button type="button" className="llm-box__clear" onClick={search.clear} aria-label="검색 지우기">
          <X size={12} />
        </button>
      )}
      <button type="submit" className="llm-box__submit" disabled={!search.query.trim() || loading} aria-label="검색">
        {loading ? <Loader2 size={12} className="llm-spin" /> : <ArrowUp size={12} strokeWidth={2.5} />}
      </button>
    </form>
  )
}

export function ExampleQueries({ search, limit = EXAMPLE_QUERIES.length }) {
  return (
    <div className="llm-examples">
      <span className="mono muted">예시</span>
      {EXAMPLE_QUERIES.slice(0, limit).map((q) => (
        <button key={q} type="button" className="llm-chip" onClick={() => search.run(q)}>
          {q}
        </button>
      ))}
    </div>
  )
}

export function SearchResults({ search, compact = false }) {
  const { status, result, selectedId, setSelectedId } = search

  if (status === 'loading') {
    return (
      <div className="llm-state">
        <Loader2 size={14} className="llm-spin" />
        관련 Agent를 찾는 중…
      </div>
    )
  }
  if (status === 'error') return <div className="llm-state">검색 중 오류가 발생했습니다. 다시 시도해 주세요.</div>
  if (!result) return null

  return (
    <div className={`llm-results${compact ? ' llm-results--compact' : ''}`}>
      {(result.intents.length > 0 || result.keywords.length > 0) && (
        <div className="llm-intent">
          <span className="mono muted">해석</span>
          {result.intents.map((i) => (
            <span key={i} className="llm-intent__chip">
              {i}
            </span>
          ))}
          {result.intents.length === 0 && <span className="mono muted">{result.keywords.join(' · ')}</span>}
        </div>
      )}

      {result.results.length === 0 ? (
        <div className="llm-state">관련 Agent를 찾지 못했습니다. 다른 표현으로 시도해 보세요.</div>
      ) : (
        <>
          <div className="llm-results__count mono muted">관련 Agent {result.results.length}개 · 관련도 순</div>
          <ol className="llm-list">
            {result.results.map((r, i) => (
              <li key={r.id}>
                <button
                  type="button"
                  className={`llm-item${selectedId === r.id ? ' is-selected' : ''}`}
                  onClick={() => setSelectedId(selectedId === r.id ? null : r.id)}
                >
                  <span className="llm-item__rank mono">{i + 1}</span>
                  <span className="llm-item__body">
                    <span className="llm-item__head">
                      <strong>{r.label}</strong>
                      <span className="mono muted">{r.sub}</span>
                    </span>
                    <span className="llm-item__bar" aria-label={`관련도 ${Math.round(r.relevance * 100)}%`}>
                      <span style={{ width: `${Math.round(r.relevance * 100)}%` }} />
                    </span>
                    {!compact && (
                      <span className="llm-item__reasons">
                        {r.reasons.map((reason) => (
                          <span key={reason}>· {reason}</span>
                        ))}
                      </span>
                    )}
                  </span>
                  <span className="llm-item__pct mono">{Math.round(r.relevance * 100)}%</span>
                </button>
              </li>
            ))}
          </ol>
        </>
      )}
      <p className="llm-note mono">※ 데모: 로컬 키워드 매칭 결과입니다 (LLM API 연동 예정)</p>
    </div>
  )
}

// A안: 헤더에 들어가는 검색창 + 아래로 펼쳐지는 결과 팝오버
export function HeaderLlmSearch({ search }) {
  const wrapRef = useRef(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onDown = (e) => !wrapRef.current?.contains(e.target) && setOpen(false)
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <div ref={wrapRef} className="llm-header">
      <LlmSearchBox search={search} variant="header" onFocus={() => setOpen(true)} onSubmit={() => setOpen(true)} />
      {open && (
        <div className="llm-popover">
          {search.status === 'idle' ? <ExampleQueries search={search} /> : <SearchResults search={search} />}
        </div>
      )}
    </div>
  )
}
