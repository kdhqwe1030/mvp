// 자연어로 관련 Agent 찾기.
// ⚠️ 현재는 데모용 로컬 매칭(키워드 확장 + 그래프 이웃 점수)이다.
// LLM 연동 시 searchAgents() 내부만 POST /search/agents 호출로 바꾸면 되고, 반환 형태는 그대로 유지한다.
//   반환: { intents: string[], keywords: string[], results: [{ id, label, sub, relevance(0~1), reasons: string[], matchedNodeIds: string[] }] }
import { NODE_TYPES, createGraphData } from '../data/graph'

const TYPE_LABEL = Object.fromEntries(NODE_TYPES.map((t) => [t.key, t.label]))

// 질의 의도 → 확장 키워드 (LLM 이 해 줄 "의미 해석" 역할을 흉내 낸다)
const INTENTS = [
  { label: 'L4 민감 데이터', keys: ['개인정보', 'pii', '민감', '극비', 'l4'], expand: ['고객 음성 상담 DB', '개인정보 마스킹 정책', 'PII'] },
  { label: '고객 상담 업무', keys: ['고객', '상담', '콜센터', 'cs', 'voc', '응대'], expand: ['CS·고객센터', '상담', '콜센터', 'FAQ'] },
  { label: '계약 · 법무', keys: ['계약', '법무', '조항', 'b2b', '리스크'], expand: ['계약', '법무', '리스크', 'Enterprise'] },
  { label: '재무 · 회계', keys: ['재무', '회계', '전표', '영수증', 'erp', 'sap', '세금', '증빙'], expand: ['재무', '전표', '원장', '영수증', 'SAP', '계정과목', 'OCR'] },
  { label: '네트워크 운영', keys: ['네트워크', '기지국', '트래픽', 'noc', '장애', '알람'], expand: ['네트워크', '기지국', '트래픽', 'NOC', '알람', '이상탐지'] },
  { label: '외부 LLM 사용', keys: ['외부', 'gpt', 'openai', 'azure', 'claude', '클라우드'], expand: ['Azure OpenAI', 'Claude (VPC)'] },
  { label: '사내 모델 사용', keys: ['사내모델', '온프레미스', 'slm', '내부모델', 'private'], expand: ['Private SLM'] },
  { label: '중복 의심', keys: ['중복', '유사', '겹치', '비슷'], expand: [], flag: 'duplicate' },
]

const JOSA = /(으로|에서|에게|이랑|하고|이나|은|는|이|가|을|를|의|에|로|와|과|도|만|들)$/
const tokenize = (q) =>
  q
    .toLowerCase()
    .split(/[\s,.?!]+/)
    .map((t) => t.replace(JOSA, ''))
    .filter((t) => t.length >= 2 && !['agent', '에이전트', '찾아줘', '알려줘', '관련', '쓰는', '사용하는', '다루는'].includes(t))

// 그래프 데이터로 Agent 별 검색 색인을 만든다 (Agent + 이웃 노드)
function buildIndex() {
  const { nodes, links } = createGraphData()
  const byId = new Map(nodes.map((n) => [n.id, n]))
  return nodes
    .filter((n) => n.type === 'agent' && !n.orphan)
    .map((agent) => {
      const neighbors = []
      const duplicates = []
      links.forEach(({ source, target, type }) => {
        if (source !== agent.id && target !== agent.id) return
        const other = byId.get(source === agent.id ? target : source)
        if (type === 'duplicate') duplicates.push(other)
        else neighbors.push(other)
      })
      // 2단계 이웃 중 문서(정책 등)도 근거로 쓸 수 있게 포함
      neighbors.slice().forEach((nb) => {
        links.forEach(({ source, target, type }) => {
          if (type === 'ref' && source === nb.id) neighbors.push(byId.get(target))
        })
      })
      return { agent, neighbors, duplicates }
    })
}

const INDEX = buildIndex()
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export async function searchAgents(query) {
  await sleep(500 + Math.random() * 400) // LLM 응답 지연 흉내

  const q = query.toLowerCase().replace(/\s/g, '')
  const intents = INTENTS.filter((it) => it.keys.some((k) => q.includes(k)))
  const tokens = tokenize(query)
  const terms = [...new Set([...tokens, ...intents.flatMap((it) => it.expand.map((e) => e.toLowerCase()))])]
  const wantsDuplicate = intents.some((it) => it.flag === 'duplicate')

  const results = INDEX.map(({ agent, neighbors, duplicates }) => {
    let score = 0
    const reasons = []
    const matched = new Set()
    const label = agent.label.toLowerCase()

    const nameHit = terms.find((t) => label.includes(t))
    if (nameHit) {
      score += 3
      reasons.push(`이름에 '${nameHit}' 포함`)
    }
    neighbors.forEach((nb) => {
      const text = `${nb.label} ${nb.sub ?? ''}`.toLowerCase()
      if (!matched.has(nb.id) && terms.some((t) => text.includes(t))) {
        matched.add(nb.id)
        score += nb.type === 'data' ? 2.5 : 2
        reasons.push(`${TYPE_LABEL[nb.type]} '${nb.label}'${nb.tier === 4 ? ' (L4)' : ''} 연결`)
      }
    })
    if (wantsDuplicate && duplicates.length) {
      score += 3
      duplicates.forEach((d) => matched.add(d.id))
      reasons.push(`중복 의심: '${duplicates.map((d) => d.label).join(', ')}'`)
    }
    return {
      id: agent.id,
      label: agent.label,
      sub: agent.sub,
      score,
      reasons: reasons.slice(0, 3),
      matchedNodeIds: [...matched],
    }
  })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)

  const top = results[0]?.score ?? 1
  return {
    intents: intents.map((it) => it.label),
    keywords: terms.slice(0, 8),
    results: results.map(({ score, ...r }) => ({ ...r, relevance: Math.min(1, score / Math.max(top, 6)) })),
  }
}

export const EXAMPLE_QUERIES = [
  '개인정보를 다루는 Agent',
  '외부 LLM 쓰는 재무 Agent',
  '중복 가능성이 있는 상담 Agent',
  '기지국 트래픽 관련',
]
