// 등록된 Agent 와 관계 저장소.
// 백엔드가 붙기 전까지 브라우저 localStorage 를 임시 DB 로 쓴다. → 추후 POST /agents/bulk 로 교체.
import { DEPARTMENTS } from '../data/dashboard'

const KEY = 'agenthub.v2.registry'

export function loadRegistered() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? []
  } catch {
    return []
  }
}

function persist(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    // 저장소를 쓸 수 없는 환경(시크릿 모드 등)에서는 현재 세션에만 유지
  }
}

// Agent → 부서(owned_by) / 데이터 소스(uses) / 모델·플랫폼(runs_on) 관계를 만든다
export function buildRelations(agent) {
  const rel = []
  const dept = DEPARTMENTS.find((d) => d.key === agent.dept)
  if (dept) rel.push({ type: 'owned_by', target: dept.name })
  agent.dataSources
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((s) => rel.push({ type: 'uses', target: s }))
  if (agent.model) rel.push({ type: 'runs_on', target: agent.model })
  if (agent.stack) rel.push({ type: 'runs_on', target: agent.stack })
  return rel
}

export function registerAgents(agents) {
  const now = new Date().toISOString()
  const records = agents.map((a) => ({ ...a, relations: buildRelations(a), registeredAt: now }))
  const all = [...records, ...loadRegistered()]
  persist(all)
  return { records, all }
}

export function clearRegistered() {
  persist([])
  return []
}
