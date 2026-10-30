// 지식 그래프 목업 데이터. 추후 API(Agent 레지스트리 + 데이터 카탈로그) 응답으로 교체한다.

export const NODE_TYPES = [
  { key: 'agent', label: 'AI Agent', color: '#0F172A' },
  { key: 'data', label: '데이터 소스', color: '#475569' },
  { key: 'dept', label: '부서', color: '#64748B' },
  { key: 'platform', label: '플랫폼 / LLM', color: '#94A3B8' },
  { key: 'doc', label: '문서 · 프롬프트', color: '#CBD5E1' },
]

export const GRAPH_DEPTS = [
  { key: 'cs', label: 'CS' },
  { key: 'network', label: 'Network' },
  { key: 'enterprise', label: 'Enterprise' },
  { key: 'finance', label: '재무' },
]

// 링크 유형별 스타일
export const LINK_STYLES = {
  uses: { color: '#94A3B8', width: 1, dash: null }, // Agent → 데이터
  runs_on: { color: '#CBD5E1', width: 0.8, dash: null }, // Agent → 플랫폼
  owned_by: { color: '#CBD5E1', width: 0.8, dash: [2, 2] }, // Agent → 부서
  ref: { color: '#E2E8F0', width: 0.6, dash: null }, // 노드 → 문서
  duplicate: { color: '#64748B', width: 1.2, dash: [3, 2] }, // Agent ↔ Agent 중복 의심
}

export const EXTERNAL_PLATFORMS = ['p-azure', 'p-claude']

const nodes = [
  // Agents
  { id: 'a-cs', type: 'agent', label: '고객상담 요약 Agent', sub: 'AG-CS-014', dept: 'cs', tier: 4 },
  { id: 'a-callbot', type: 'agent', label: '콜센터 응대 봇', sub: 'AG-CS-022', dept: 'cs', tier: 4 },
  { id: 'a-net', type: 'agent', label: '기지국 이상 트래픽 감지', sub: 'AG-NW-007', dept: 'network', tier: 2 },
  { id: 'a-legal', type: 'agent', label: '계약서 리스크 검토 Agent', sub: 'AG-EN-021', dept: 'enterprise', tier: 3 },
  { id: 'a-legal2', type: 'agent', label: '대외 계약 검토 도구', sub: 'AG-EN-030', dept: 'enterprise', tier: 3 },
  { id: 'a-erp', type: 'agent', label: 'ERP 자동 전표', sub: 'AG-FN-003', dept: 'finance', tier: 3 },
  { id: 'a-ocr', type: 'agent', label: '영수증 OCR Agent', sub: 'AG-FN-011', dept: 'finance', tier: 2 },

  // 데이터 소스
  { id: 'd-voice', type: 'data', label: '고객 음성 상담 DB', sub: 'L4 · PII', tier: 4 },
  { id: 'd-rag', type: 'data', label: 'FAQ RAG 지식베이스', sub: 'L2', tier: 2 },
  { id: 'd-traffic', type: 'data', label: '기지국 트래픽 로그', sub: 'L2', tier: 2 },
  { id: 'd-alarm', type: 'data', label: 'NOC 알람 이력', sub: 'L1', tier: 1 },
  { id: 'd-legal', type: 'data', label: '계약 문서 저장소', sub: 'L3', tier: 3 },
  { id: 'd-client', type: 'data', label: '고객사 마스터', sub: 'L3', tier: 3 },
  { id: 'd-ledger', type: 'data', label: '재무 원장 DB', sub: 'L3', tier: 3 },

  // 플랫폼 / LLM
  { id: 'p-azure', type: 'platform', label: 'Azure OpenAI' },
  { id: 'p-claude', type: 'platform', label: 'Claude (VPC)' },
  { id: 'p-slm', type: 'platform', label: 'Private SLM' },
  { id: 'p-langchain', type: 'platform', label: 'LangChain' },
  { id: 'p-crm', type: 'platform', label: 'CRM' },
  { id: 'p-kafka', type: 'platform', label: 'Kafka Stream' },
  { id: 'p-sap', type: 'platform', label: 'SAP ERP' },

  // 부서
  { id: 'dept-cs', type: 'dept', label: 'CS·고객센터', dept: 'cs' },
  { id: 'dept-net', type: 'dept', label: '네트워크 운영본부', dept: 'network' },
  { id: 'dept-ent', type: 'dept', label: 'Enterprise 사업부', dept: 'enterprise' },
  { id: 'dept-fin', type: 'dept', label: '재무·경영지원', dept: 'finance' },

  // 문서 · 프롬프트
  { id: 'doc-script', type: 'doc', label: '상담 스크립트.md' },
  { id: 'doc-faq', type: 'doc', label: 'FAQ 프롬프트 v3' },
  { id: 'doc-mask', type: 'doc', label: '개인정보 마스킹 정책' },
  { id: 'doc-rule', type: 'doc', label: '이상탐지 룰셋' },
  { id: 'doc-threshold', type: 'doc', label: '알람 임계값 설정' },
  { id: 'doc-noc', type: 'doc', label: 'NOC 대응 매뉴얼' },
  { id: 'doc-clause', type: 'doc', label: '표준 계약 조항' },
  { id: 'doc-check', type: 'doc', label: '리스크 체크리스트' },
  { id: 'doc-guide', type: 'doc', label: '법무 검토 가이드' },
  { id: 'doc-mapping', type: 'doc', label: '전표 매핑 규칙' },
  { id: 'doc-account', type: 'doc', label: '계정과목 사전' },
  { id: 'doc-template', type: 'doc', label: '증빙 OCR 템플릿' },

  // 고아 노드 (연결 없음)
  { id: 'orphan-prompt', type: 'doc', label: '미분류 프롬프트', orphan: true },
  { id: 'orphan-agent', type: 'agent', label: '폐기 예정 Agent', sub: 'AG-XX-099', orphan: true, tier: 1 },
]

const links = [
  // 고객상담
  ['a-cs', 'd-voice', 'uses'],
  ['a-cs', 'd-rag', 'uses'],
  ['a-cs', 'p-azure', 'runs_on'],
  ['a-cs', 'p-langchain', 'runs_on'],
  ['a-cs', 'p-crm', 'runs_on'],
  ['a-cs', 'dept-cs', 'owned_by'],
  ['a-cs', 'doc-script', 'ref'],
  ['a-cs', 'doc-faq', 'ref'],
  ['d-voice', 'doc-mask', 'ref'],
  ['a-callbot', 'd-voice', 'uses'],
  ['a-callbot', 'd-rag', 'uses'],
  ['a-callbot', 'p-azure', 'runs_on'],
  ['a-callbot', 'dept-cs', 'owned_by'],
  ['a-callbot', 'doc-script', 'ref'],
  ['a-cs', 'a-callbot', 'duplicate'],

  // 네트워크
  ['a-net', 'd-traffic', 'uses'],
  ['a-net', 'd-alarm', 'uses'],
  ['a-net', 'p-slm', 'runs_on'],
  ['a-net', 'p-kafka', 'runs_on'],
  ['a-net', 'dept-net', 'owned_by'],
  ['a-net', 'doc-rule', 'ref'],
  ['a-net', 'doc-threshold', 'ref'],
  ['d-alarm', 'doc-noc', 'ref'],

  // Enterprise
  ['a-legal', 'd-legal', 'uses'],
  ['a-legal', 'd-client', 'uses'],
  ['a-legal', 'p-claude', 'runs_on'],
  ['a-legal', 'dept-ent', 'owned_by'],
  ['a-legal', 'doc-clause', 'ref'],
  ['a-legal', 'doc-check', 'ref'],
  ['a-legal2', 'd-legal', 'uses'],
  ['a-legal2', 'p-azure', 'runs_on'],
  ['a-legal2', 'dept-ent', 'owned_by'],
  ['a-legal2', 'doc-guide', 'ref'],
  ['a-legal', 'a-legal2', 'duplicate'],

  // 재무
  ['a-erp', 'd-ledger', 'uses'],
  ['a-erp', 'd-client', 'uses'],
  ['a-erp', 'p-azure', 'runs_on'],
  ['a-erp', 'p-sap', 'runs_on'],
  ['a-erp', 'dept-fin', 'owned_by'],
  ['a-erp', 'doc-mapping', 'ref'],
  ['a-erp', 'doc-account', 'ref'],
  ['a-ocr', 'd-ledger', 'uses'],
  ['a-ocr', 'p-slm', 'runs_on'],
  ['a-ocr', 'dept-fin', 'owned_by'],
  ['a-ocr', 'doc-template', 'ref'],
  ['a-erp', 'a-ocr', 'duplicate'],
]

// 그래프 라이브러리가 노드/링크 객체를 변형(x, y, source 객체화)하므로 호출마다 새 사본을 만든다.
export function createGraphData() {
  return {
    nodes: nodes.map((n) => ({ ...n })),
    links: links.map(([source, target, type]) => ({ source, target, type })),
  }
}
