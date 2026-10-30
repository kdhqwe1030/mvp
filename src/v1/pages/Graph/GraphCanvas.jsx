import { useEffect, useRef, useState } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import { forceCollide, forceX, forceY } from 'd3-force'
import { LINK_STYLES, NODE_TYPES } from '../../../data/graph'
import { linkEndId, nodeRadius } from './graphUtils'
import { ACCENT_200, INK, SLATE } from '../../../theme'

const TYPE_COLOR = Object.fromEntries(NODE_TYPES.map((t) => [t.key, t.color]))
const NODE_STROKE = {
  agent: ['#FFFFFF', 1.2],
  data: [SLATE[300], 1],
  dept: [SLATE[100], 0.8],
  platform: ['#FFFFFF', 0.6],
}
const LABEL_COLOR = { agent: INK, data: SLATE[700], dept: SLATE[600], platform: SLATE[600], doc: SLATE[400] }
const DIM_LINK = 'rgba(226, 232, 240, 0.35)'
const FOCUS_LINK = 'rgba(243, 115, 33, 0.7)'

const clamp01 = (v) => Math.min(1, Math.max(0, v))

// 캔버스 위에 떠 있는 UI(상단 바, 하단 범례, 오른쪽 설정 패널)를 피해서 화면에 맞춘다
const TOP_INSET = 60
const BOTTOM_INSET = 70

export default function GraphCanvas({
  fgRef,
  graphData,
  neighbors,
  settings,
  selectedId,
  highlightSet,
  rightInset,
  onSelect,
  onEngineState,
}) {
  const wrapRef = useRef(null)
  const fittedRef = useRef(false)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [hoverId, setHoverId] = useState(null)
  const ready = size.width > 0

  // 컨테이너 크기에 맞춰 캔버스 크기 갱신
  useEffect(() => {
    const el = wrapRef.current
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ width, height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // 물리엔진 설정 반영 (Obsidian 방식: 중심력은 x/y 방향 인력으로 구현)
  useEffect(() => {
    const fg = fgRef.current
    if (!fg) return
    fg.d3Force('charge').strength(-settings.repel).distanceMax(320)
    fg.d3Force('link').distance(settings.linkDistance).strength(settings.linkForce)
    fg.d3Force('center', null)
    fg.d3Force('x', forceX(0).strength(settings.center))
    fg.d3Force('y', forceY(0).strength(settings.center))
    fg.d3Force('collide', forceCollide((n) => nodeRadius(n, settings.nodeSize) + 2))
    fg.d3ReheatSimulation()
    onEngineState(true)
  }, [ready, fgRef, graphData, settings.repel, settings.linkDistance, settings.linkForce, settings.center, settings.nodeSize, onEngineState])

  const focusId = hoverId ?? selectedId
  const activeSet = focusId ? new Set([focusId, ...(neighbors.get(focusId) ?? [])]) : highlightSet

  const linkState = (link) => {
    const s = linkEndId(link.source)
    const t = linkEndId(link.target)
    if (focusId) return s === focusId || t === focusId ? 'focus' : 'dim'
    if (highlightSet) return highlightSet.has(s) && highlightSet.has(t) ? 'normal' : 'dim'
    return 'normal'
  }

  const linkColor = (link) => {
    const state = linkState(link)
    if (state === 'dim') return DIM_LINK
    if (state === 'focus') return FOCUS_LINK
    return LINK_STYLES[link.type].color
  }

  const drawNode = (node, ctx, scale) => {
    const r = nodeRadius(node, settings.nodeSize)
    const active = !activeSet || activeSet.has(node.id)
    const baseAlpha = node.orphan ? 0.6 : 1
    ctx.globalAlpha = active ? baseAlpha : 0.15

    if (node.id === selectedId) {
      ctx.beginPath()
      ctx.arc(node.x, node.y, r + 2.4, 0, 2 * Math.PI)
      ctx.strokeStyle = ACCENT_200
      ctx.lineWidth = 2
      ctx.stroke()
    }

    ctx.beginPath()
    ctx.arc(node.x, node.y, r, 0, 2 * Math.PI)
    if (node.orphan) {
      ctx.fillStyle = SLATE[100]
      ctx.fill()
      ctx.strokeStyle = SLATE[400]
      ctx.lineWidth = 0.6
      ctx.stroke()
    } else {
      ctx.fillStyle = TYPE_COLOR[node.type]
      ctx.fill()
      const stroke = NODE_STROKE[node.type]
      if (stroke) {
        ctx.strokeStyle = stroke[0]
        ctx.lineWidth = stroke[1]
        ctx.stroke()
      }
      if (node.type === 'agent') {
        ctx.beginPath()
        ctx.arc(node.x, node.y, r * 0.32, 0, 2 * Math.PI)
        ctx.fillStyle = '#FFFFFF'
        ctx.fill()
      }
    }

    // 라벨: 확대 배율이 텍스트 페이드 임계값을 넘으면 서서히 나타난다
    const isAgent = node.type === 'agent'
    let labelAlpha = clamp01((scale - settings.textFade) * 2)
    if (isAgent) labelAlpha = Math.max(labelAlpha, clamp01((scale - settings.textFade * 0.6) * 2))
    if (focusId && active) labelAlpha = 1
    if (!active) labelAlpha *= 0.3

    if (labelAlpha > 0.02) {
      const fontSize = isAgent ? 4.2 : 3.6
      const top = node.y + r + 1.6
      ctx.globalAlpha = labelAlpha * baseAlpha
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.font = `${isAgent ? 500 : 400} ${fontSize}px Inter, 'Apple SD Gothic Neo', sans-serif`
      ctx.fillStyle = LABEL_COLOR[node.type]
      ctx.fillText(node.label, node.x, top)
      if (node.sub) {
        ctx.font = `3px 'JetBrains Mono', monospace`
        ctx.fillStyle = isAgent ? SLATE[500] : SLATE[400]
        ctx.fillText(node.sub, node.x, top + fontSize + 0.6)
      }
    }
    ctx.globalAlpha = 1
  }

  const fitToView = (ms) => {
    const fg = fgRef.current
    const box = fg?.getGraphBbox((n) => !n.orphan)
    if (!box) return
    const availW = size.width - rightInset - 40
    const availH = size.height - TOP_INSET - BOTTOM_INSET
    const zoom = Math.min(4, (0.9 * availW) / Math.max(box.x[1] - box.x[0], 1), (0.9 * availH) / Math.max(box.y[1] - box.y[0], 1))
    const midX = (box.x[0] + box.x[1]) / 2
    const midY = (box.y[0] + box.y[1]) / 2
    fg.centerAt(midX + rightInset / 2 / zoom, midY - (TOP_INSET - BOTTOM_INSET) / 2 / zoom, ms)
    fg.zoom(zoom, ms)
  }

  // 첫 배치 직후 한 번, 시뮬레이션이 멈춘 뒤 한 번 화면에 맞춘다 (선택된 노드가 있으면 그 시점을 유지)
  const tickRef = useRef(0)
  const handleEngineTick = () => {
    tickRef.current += 1
    if (tickRef.current === 20 && !selectedId) fitToView(400)
  }
  const handleEngineStop = () => {
    onEngineState(false)
    if (!fittedRef.current) {
      fittedRef.current = true
      if (!selectedId) fitToView(600)
    }
  }

  return (
    <div ref={wrapRef} className="g-canvas" style={{ cursor: hoverId ? 'pointer' : 'grab' }}>
      {ready && (
        <ForceGraph2D
          ref={fgRef}
          width={size.width}
          height={size.height}
          graphData={graphData}
          nodeRelSize={1}
          nodeVal={(n) => nodeRadius(n, settings.nodeSize) ** 2}
          nodeLabel={() => ''}
          nodeCanvasObject={drawNode}
          linkColor={linkColor}
          linkWidth={(l) => LINK_STYLES[l.type].width * settings.linkWidth * (linkState(l) === 'focus' ? 1.6 : 1)}
          linkLineDash={(l) => LINK_STYLES[l.type].dash}
          linkDirectionalArrowLength={settings.arrows ? 3 * settings.linkWidth : 0}
          linkDirectionalArrowRelPos={1}
          linkDirectionalArrowColor={linkColor}
          warmupTicks={40}
          cooldownTicks={250}
          onEngineTick={handleEngineTick}
          onNodeHover={(node) => setHoverId(node?.id ?? null)}
          onNodeClick={(node) => onSelect(node.id)}
          onBackgroundClick={() => onSelect(null)}
          onEngineStop={handleEngineStop}
        />
      )}
    </div>
  )
}
