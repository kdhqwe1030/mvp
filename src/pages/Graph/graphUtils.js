import { EXTERNAL_PLATFORMS } from '../../data/graph'

const BASE_RADIUS = { agent: 6, data: 4.5, dept: 4, platform: 3.5, doc: 2.5 }

export const nodeRadius = (node, scale = 1) => BASE_RADIUS[node.type] * scale

// 시뮬레이션이 시작되면 link.source/target 이 id 문자열에서 노드 객체로 바뀐다
export const linkEndId = (end) => (typeof end === 'object' ? end.id : end)

export function buildNeighbors(links) {
  const map = new Map()
  const add = (a, b) => {
    if (!map.has(a)) map.set(a, new Set())
    map.get(a).add(b)
  }
  links.forEach((l) => {
    const s = linkEndId(l.source)
    const t = linkEndId(l.target)
    add(s, t)
    add(t, s)
  })
  return map
}

// seeds 에서 depth 만큼 확장. canEnter 가 false 인 노드로는 들어가지 않는다.
export function expand(seeds, neighbors, depth, canEnter = () => true) {
  const visited = new Set(seeds)
  let frontier = [...seeds]
  for (let d = 0; d < depth; d++) {
    const next = []
    frontier.forEach((id) => {
      neighbors.get(id)?.forEach((nb) => {
        if (!visited.has(nb) && canEnter(nb)) {
          visited.add(nb)
          next.push(nb)
        }
      })
    })
    frontier = next
  }
  return visited
}

export function filterGraph(master, byId, { types, dept, minTier, showOrphans, dupOnly, hideDeptLinks, hideDocLinks, localFocus }) {
  let nodes = master.nodes.filter(
    (n) => types.includes(n.type) && !(n.tier && n.tier < minTier) && (showOrphans || !n.orphan),
  )
  let ids = new Set(nodes.map((n) => n.id))
  let links = master.links.filter(
    (l) =>
      ids.has(linkEndId(l.source)) &&
      ids.has(linkEndId(l.target)) &&
      (!dupOnly || l.type === 'duplicate') &&
      !(hideDeptLinks && l.type === 'owned_by') &&
      !(hideDocLinks && l.type === 'ref'),
  )

  const keepOnly = (keep) => {
    nodes = nodes.filter((n) => keep.has(n.id))
    links = links.filter((l) => keep.has(linkEndId(l.source)) && keep.has(linkEndId(l.target)))
  }

  if (dept !== 'all') {
    const seeds = nodes.filter((n) => n.type === 'agent' && n.dept === dept).map((n) => n.id)
    const canEnter = (id) => byId.get(id).type !== 'agent' || byId.get(id).dept === dept
    keepOnly(expand(seeds, buildNeighbors(links), 2, canEnter))
  }

  if (localFocus && nodes.some((n) => n.id === localFocus)) {
    keepOnly(expand([localFocus], buildNeighbors(links), 1))
  }

  // 필터로 연결이 모두 끊긴 노드는 숨긴다 (원래 고아 노드는 유지)
  const degree = buildNeighbors(links)
  ids = new Set(nodes.filter((n) => n.orphan || degree.has(n.id) || n.id === localFocus).map((n) => n.id))
  keepOnly(ids)

  return { nodes, links }
}

export const PRESETS = [
  { key: 'duplicate', label: '중복 의심 Agent 쌍', color: '#0F172A' },
  { key: 'pii', label: 'L4 민감 데이터 접근 경로', color: '#475569' },
  { key: 'external', label: '외부 LLM 의존 Agent', color: '#CBD5E1' },
]

export function presetNodes(key, graph, byId) {
  const set = new Set()
  const typed = (type) =>
    graph.links.filter((l) => l.type === type).map((l) => [linkEndId(l.source), linkEndId(l.target)])

  if (key === 'duplicate') {
    typed('duplicate').forEach(([s, t]) => set.add(s).add(t))
  }
  if (key === 'pii') {
    const pii = graph.nodes.filter((n) => n.type === 'data' && n.tier === 4).map((n) => n.id)
    pii.forEach((id) => set.add(id))
    const agents = new Set()
    typed('uses').forEach(([s, t]) => pii.includes(t) && agents.add(s))
    agents.forEach((id) => set.add(id))
    typed('runs_on').forEach(([s, t]) => agents.has(s) && set.add(t))
  }
  if (key === 'external') {
    typed('runs_on').forEach(([s, t]) => {
      if (EXTERNAL_PLATFORMS.includes(t)) set.add(s).add(t)
    })
  }
  return { set, agentCount: [...set].filter((id) => byId.get(id)?.type === 'agent').length }
}
