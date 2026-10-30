import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SlidersHorizontal, Sparkles, X } from 'lucide-react'
import { NODE_TYPES, createGraphData } from '../../data/graph'
import GraphCanvas from '../Graph/GraphCanvas'
import GraphSettings from '../Graph/GraphSettings'
import { DEFAULT_SETTINGS, buildNeighbors, filterGraph } from '../Graph/graphUtils'
import { ExampleQueries, LlmSearchBox, SearchResults } from './SearchParts'
import { SEARCH_POSITIONS } from './positions'
import '../Graph/graph.css'
import './graphSearch.css'

const ALL_TYPES = NODE_TYPES.map((t) => t.key)

const SETTINGS_WIDTH = 268
const RIGHT_PANEL_WIDTH = 336

export default function GraphSearchPage({ search, pos, onPosChange }) {
  const fgRef = useRef(null)
  const [master] = useState(createGraphData)
  const byId = useMemo(() => new Map(master.nodes.map((n) => [n.id, n])), [master])
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  // 그래프 설정은 닫힌 상태가 기본. 단, C안은 검색창이 설정 패널 안에 있으므로 열어 둔다
  const [settingsOpen, setSettingsOpen] = useState(pos === 'filter')
  const [prevPos, setPrevPos] = useState(pos)
  if (pos !== prevPos) {
    setPrevPos(pos)
    setSettingsOpen(pos === 'filter')
  }
  // D안 결과 패널: 닫은 결과 객체를 기억해 두고, 새 검색 결과가 오면 다시 보인다
  const [closedResult, setClosedResult] = useState(null)
  const resultsOpen =
    search.status === 'loading' || search.status === 'error' || (search.result != null && search.result !== closedResult)

  const { showOrphans, dupOnly, hideDeptLinks, hideDocLinks } = settings
  const graphData = useMemo(
    () =>
      filterGraph(master, byId, {
        types: ALL_TYPES,
        dept: 'all',
        minTier: 1,
        showOrphans,
        dupOnly,
        hideDeptLinks,
        hideDocLinks,
        localFocus: null,
      }),
    [master, byId, showOrphans, dupOnly, hideDeptLinks, hideDocLinks],
  )
  const neighbors = useMemo(() => buildNeighbors(graphData.links), [graphData])

  // 검색 결과 Agent + 근거 노드는 강조, 나머지는 흐리게
  const highlightSet = useMemo(() => {
    const results = search.result?.results
    if (results?.length) return new Set(results.flatMap((r) => [r.id, ...r.matchedNodeIds]))
    const q = settings.search.trim().toLowerCase()
    if (!q) return null
    return new Set(graphData.nodes.filter((n) => `${n.label} ${n.sub ?? ''}`.toLowerCase().includes(q)).map((n) => n.id))
  }, [search.result, settings.search, graphData])

  const rightInset = pos === 'right' ? RIGHT_PANEL_WIDTH : settingsOpen ? SETTINGS_WIDTH : 0
  const leftInset = pos === 'canvas' && resultsOpen ? 340 : 0

  // 결과 목록이나 그래프에서 Agent 를 고르면 그 노드로 이동 (패널에 가리지 않게 비켜서)
  // 패널 폭은 ref 로 읽어서, 패널이 열리고 닫힐 때마다 다시 이동하지 않게 한다
  const { selectedId, setSelectedId } = search
  const insetRef = useRef({ left: 0, right: 0 })
  useEffect(() => {
    insetRef.current = { left: leftInset, right: rightInset }
  }, [leftInset, rightInset])
  useEffect(() => {
    const node = selectedId ? byId.get(selectedId) : null
    if (!node || node.x == null) return
    const zoom = 2.6
    const { left, right } = insetRef.current
    fgRef.current?.centerAt(node.x + (right - left) / 2 / zoom, node.y, 600)
    fgRef.current?.zoom(zoom, 600)
  }, [selectedId, byId])

  const handleEngineState = useCallback(() => {}, [])
  const changeSetting = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }))

  const settingsPanel = settingsOpen && (
    <GraphSettings
      settings={settings}
      onChange={changeSetting}
      onReset={() => setSettings(DEFAULT_SETTINGS)}
      onClose={() => setSettingsOpen(false)}
      onReheat={() => fgRef.current?.d3ReheatSimulation()}
      filterSearch={
        pos === 'filter' ? (
          <div className="gs-filter-search">
            <LlmSearchBox search={search} variant="compact" placeholder="자연어로 Agent 찾기" />
            {search.status === 'idle' ? <ExampleQueries search={search} limit={2} /> : <SearchResults search={search} compact />}
          </div>
        ) : undefined
      }
    />
  )

  return (
    <div className={`g-page gs-page gs-page--${pos}`}>
      {/* 검색창 위치 시안 비교 바 (위치가 확정되면 제거) */}
      <div className="gs-proposal">
        <span className="gs-proposal__title mono">검색창 위치 시안</span>
        <div className="gs-switch" role="group" aria-label="검색창 위치 시안">
          {SEARCH_POSITIONS.map((p) => (
            <button key={p.key} className={pos === p.key ? 'is-active' : ''} onClick={() => onPosChange(p.key)}>
              {p.label}
              {p.recommended && <span className="gs-switch__rec">추천</span>}
            </button>
          ))}
        </div>
        <span className="gs-proposal__note muted">{SEARCH_POSITIONS.find((p) => p.key === pos)?.note}</span>
      </div>

      <div className="g-stage">
        <GraphCanvas
          fgRef={fgRef}
          graphData={graphData}
          neighbors={neighbors}
          settings={settings}
          selectedId={selectedId}
          highlightSet={highlightSet}
          rightInset={rightInset}
          onSelect={setSelectedId}
          onEngineState={handleEngineState}
        />

        {pos === 'canvas' && (
          <div className="gs-command">
            <LlmSearchBox search={search} variant="command" />
            {search.status === 'idle' && <ExampleQueries search={search} />}
          </div>
        )}

        {!settingsOpen && pos !== 'filter' && (
          <button className="g-settings-fab gs-settings-fab" onClick={() => setSettingsOpen(true)}>
            <SlidersHorizontal size={12} />
            그래프 설정
          </button>
        )}

        {/* D안 결과: 탐색기가 있던 왼쪽 자리에 오버레이 */}
        {pos === 'canvas' && resultsOpen && (
          <aside className="gs-results-overlay">
            <div className="gs-panel-head">
              <span>
                <Sparkles size={12} />
                &lsquo;{search.query}&rsquo; 검색 결과
              </span>
              <button className="g-icon-btn g-icon-btn--sm" onClick={() => setClosedResult(search.result)} aria-label="결과 닫기">
                <X size={11} />
              </button>
            </div>
            <SearchResults search={search} />
          </aside>
        )}

        {/* B안: 오른쪽 전용 검색 패널 */}
        {pos === 'right' && (
          <aside className="gs-right-panel">
            <div className="gs-panel-head">
              <span>
                <Sparkles size={12} />
                Agent 찾기
              </span>
            </div>
            <div className="gs-right-panel__body">
              <LlmSearchBox search={search} variant="panel" placeholder="찾고 싶은 Agent를 설명해 주세요" />
              {search.status === 'idle' ? <ExampleQueries search={search} /> : <SearchResults search={search} />}
            </div>
          </aside>
        )}

        {pos !== 'right' && settingsPanel}
        {pos === 'right' && settingsOpen && <div className="gs-settings-shift">{settingsPanel}</div>}

        <div className="g-legend">
          {NODE_TYPES.slice(0, 4).map((t) => (
            <span key={t.key}>
              <span className="g-dot g-dot--lg" style={{ background: t.color }} />
              {t.label}
            </span>
          ))}
          <span className="g-legend__selected">
            <span className="g-dot g-dot--lg g-dot--ring" />
            선택된 노드
          </span>
        </div>
      </div>
    </div>
  )
}
