import { useCallback, useMemo, useRef, useState } from 'react'
import { Crosshair, List, PanelLeftOpen, SlidersHorizontal, Waypoints } from 'lucide-react'
import { NODE_TYPES, createGraphData } from '../../data/graph'
import { ACCENT, SLATE } from '../../theme'
import GraphCanvas from './GraphCanvas'
import ExplorerPanel from './ExplorerPanel'
import GraphSettings from './GraphSettings'
import { DEFAULT_SETTINGS, PRESETS, buildNeighbors, filterGraph, presetNodes } from './graphUtils'
import './graph.css'

const ALL_TYPES = NODE_TYPES.map((t) => t.key)

const TYPE_LABEL = Object.fromEntries(NODE_TYPES.map((t) => [t.key, t.label]))

export default function GraphPage() {
  const fgRef = useRef(null)
  const [master] = useState(createGraphData)
  const byId = useMemo(() => new Map(master.nodes.map((n) => [n.id, n])), [master])

  const [view, setView] = useState('graph')
  const [explorerOpen, setExplorerOpen] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(true)
  const [types, setTypes] = useState(ALL_TYPES)
  const [dept, setDept] = useState('all')
  const [minTier, setMinTier] = useState(1)
  const [preset, setPreset] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [localGraph, setLocalGraph] = useState(false)
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [running, setRunning] = useState(true)

  const localFocus = localGraph ? selectedId : null
  const { showOrphans, dupOnly, hideDeptLinks, hideDocLinks } = settings

  const graphData = useMemo(
    () =>
      filterGraph(master, byId, { types, dept, minTier, showOrphans, dupOnly, hideDeptLinks, hideDocLinks, localFocus }),
    [master, byId, types, dept, minTier, showOrphans, dupOnly, hideDeptLinks, hideDocLinks, localFocus],
  )
  const neighbors = useMemo(() => buildNeighbors(graphData.links), [graphData])

  const presetCounts = useMemo(
    () => Object.fromEntries(PRESETS.map((p) => [p.key, presetNodes(p.key, master, byId).agentCount])),
    [master, byId],
  )

  const typeCounts = useMemo(
    () => Object.fromEntries(ALL_TYPES.map((t) => [t, master.nodes.filter((n) => n.type === t).length])),
    [master],
  )

  // 프리셋 · 검색 결과는 그래프를 자르지 않고 나머지를 흐리게 처리한다
  const highlightSet = useMemo(() => {
    const q = settings.search.trim().toLowerCase()
    let set = preset ? presetNodes(preset, graphData, byId).set : null
    if (q) {
      const matches = graphData.nodes
        .filter((n) => `${n.label} ${n.sub ?? ''}`.toLowerCase().includes(q))
        .map((n) => n.id)
      set = new Set(set ? matches.filter((id) => set.has(id)) : matches)
    }
    return set
  }, [preset, settings.search, graphData, byId])

  const selectedNode = selectedId ? byId.get(selectedId) : null

  const toggleType = (key) => setTypes((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))
  const changeSetting = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }))
  const handleEngineState = useCallback((isRunning) => setRunning(isRunning), [])

  const selectNode = (id) => {
    setSelectedId(id)
    if (!id) setLocalGraph(false)
  }

  const centerOnNode = (id = selectedId) => {
    const node = byId.get(id)
    if (!node || node.x == null) return
    // 오른쪽 설정 패널에 가리지 않도록 패널 폭의 절반만큼 비켜서 중앙 정렬
    const zoom = 3
    const offset = settingsOpen ? 268 / 2 / zoom : 0
    fgRef.current?.centerAt(node.x + offset, node.y, 600)
    fgRef.current?.zoom(zoom, 600)
  }

  const openFromList = (id) => {
    selectNode(id)
    setView('graph')
    // 그래프 뷰가 다시 그려진 뒤 이동
    setTimeout(() => centerOnNode(id), 50)
  }

  return (
    <div className="g-page">
      {explorerOpen ? (
        <ExplorerPanel
          types={types}
          onToggleType={toggleType}
          typeCounts={typeCounts}
          dept={dept}
          onDeptChange={setDept}
          minTier={minTier}
          onMinTierChange={setMinTier}
          preset={preset}
          onPresetChange={setPreset}
          presetCounts={presetCounts}
          stats={{
            nodes: graphData.nodes.length,
            links: graphData.links.length,
            totalNodes: master.nodes.length,
            totalLinks: master.links.length,
            running,
          }}
          onCollapse={() => setExplorerOpen(false)}
        />
      ) : (
        <button className="g-explorer-tab" onClick={() => setExplorerOpen(true)} aria-label="탐색기 열기">
          <PanelLeftOpen size={14} />
        </button>
      )}

      <div className="g-stage">
        {view === 'graph' ? (
          <GraphCanvas
            fgRef={fgRef}
            graphData={graphData}
            neighbors={neighbors}
            settings={settings}
            selectedId={selectedId}
            highlightSet={highlightSet}
            rightInset={settingsOpen ? 268 : 0}
            onSelect={selectNode}
            onEngineState={handleEngineState}
          />
        ) : (
          <NodeList graphData={graphData} neighbors={neighbors} byId={byId} onOpen={openFromList} />
        )}

        <div className="g-topbar">
          <div className="g-focus">
            <span className="g-dot g-dot--lg" style={{ background: selectedNode ? ACCENT : SLATE[300] }} />
            <span className="g-focus__text">
              {selectedNode ? (
                <>
                  포커스: <strong>{selectedNode.label}</strong>
                </>
              ) : (
                `전체 그래프 · 노드 ${graphData.nodes.length}개`
              )}
            </span>
            <span className="g-focus__sep">|</span>
            <button
              className={`g-text-btn${localGraph ? ' is-active' : ''}`}
              disabled={!selectedNode}
              onClick={() => setLocalGraph((v) => !v)}
            >
              로컬 그래프
            </button>
            <button className="g-text-btn" disabled={!selectedNode || view !== 'graph'} onClick={() => centerOnNode()}>
              <Crosshair size={10} />
              노드로 이동
            </button>
            <button className="g-text-btn" disabled={!selectedNode} onClick={() => selectNode(null)}>
              해제
            </button>
          </div>

          <div className="g-view-toggle">
            <button className={view === 'graph' ? 'is-active' : ''} onClick={() => setView('graph')}>
              <Waypoints size={11} />
              그래프
            </button>
            <button className={view === 'list' ? 'is-active' : ''} onClick={() => setView('list')}>
              <List size={11} />
              노드 목록
            </button>
          </div>
        </div>

        {view === 'graph' &&
          (settingsOpen ? (
            <GraphSettings
              settings={settings}
              onChange={changeSetting}
              onReset={() => setSettings(DEFAULT_SETTINGS)}
              onClose={() => setSettingsOpen(false)}
              onReheat={() => {
                fgRef.current?.d3ReheatSimulation()
                setRunning(true)
              }}
            />
          ) : (
            <button className="g-settings-fab" onClick={() => setSettingsOpen(true)}>
              <SlidersHorizontal size={12} />
              그래프 설정
            </button>
          ))}

        {view === 'graph' && (
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
        )}
      </div>
    </div>
  )
}

function NodeList({ graphData, neighbors, byId, onOpen }) {
  const rows = [...graphData.nodes].sort((a, b) => (neighbors.get(b.id)?.size ?? 0) - (neighbors.get(a.id)?.size ?? 0))
  return (
    <div className="g-list">
      <table>
        <thead>
          <tr>
            <th>노드</th>
            <th>유형</th>
            <th>연결 수</th>
            <th>연결된 노드</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((n) => {
            const nbs = [...(neighbors.get(n.id) ?? [])].map((id) => byId.get(id).label)
            return (
              <tr key={n.id} onClick={() => onOpen(n.id)}>
                <td>
                  <div className="g-list__name">{n.label}</div>
                  {n.sub && <div className="mono g-faint">{n.sub}</div>}
                </td>
                <td>{TYPE_LABEL[n.type]}</td>
                <td className="mono">{nbs.length}</td>
                <td className="g-faint">
                  {nbs.slice(0, 4).join(', ')}
                  {nbs.length > 4 && ` 외 ${nbs.length - 4}개`}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
