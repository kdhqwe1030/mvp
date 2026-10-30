// 대시보드 목업 데이터. 추후 API 응답으로 교체한다.
import { ACCENT, ACCENT_300, SLATE } from '../theme'

export const TIERS = [
  { key: 'L4', label: 'L4 극비 · 고객 PII', color: ACCENT },
  { key: 'L3', label: 'L3 대외비 · 재무/계약', color: SLATE[600] },
  { key: 'L2', label: 'L2 사내 한정', color: SLATE[400] },
  { key: 'L1', label: 'L1 공개 · 비식별 데이터', color: SLATE[200] },
]

export const DEPARTMENTS = [
  { key: 'cs', name: 'CS·고객센터', tiers: { L4: 6, L3: 9, L2: 15, L1: 8 } },
  { key: 'network', name: '네트워크 운영본부', tiers: { L4: 2, L3: 5, L2: 18, L1: 6 } },
  { key: 'enterprise', name: 'Enterprise 사업부', tiers: { L4: 2, L3: 4, L2: 13, L1: 8 } },
  { key: 'finance', name: '재무·경영지원', tiers: { L4: 3, L3: 6, L2: 10, L1: 5 } },
  { key: 'platform', name: 'IT·플랫폼', tiers: { L4: 3, L3: 5, L2: 8, L1: 6 } },
]

export const deptTotal = (dept) => Object.values(dept.tiers).reduce((a, b) => a + b, 0)

export const TOTAL_AGENTS = DEPARTMENTS.reduce((sum, d) => sum + deptTotal(d), 0)

export const tierTotal = (tierKey) => DEPARTMENTS.reduce((sum, d) => sum + d.tiers[tierKey], 0)

export const LLM_SHARE = [
  { name: 'Azure OpenAI', value: 42, color: ACCENT },
  { name: 'Claude (VPC)', value: 24, color: ACCENT_300 },
  { name: '사내 SLM', value: 20, color: SLATE[500] },
  { name: '오픈소스 기타', value: 14, color: SLATE[300] },
]

export const CLUSTERS = [
  { name: '상담 요약 · FAQ 응답', meta: '5개 인스턴스 · 3개 부서', similarity: 0.94 },
  { name: '계약서 조항 리스크 검토', meta: '4개 인스턴스 · 2개 부서', similarity: 0.88 },
  { name: '전표 · 영수증 OCR 처리', meta: '3개 인스턴스 · 2개 부서', similarity: 0.83 },
]

export const AGENTS = [
  {
    no: '01',
    name: '고객상담 요약 & Q&A Agent',
    id: 'AG-CS-014',
    dept: 'cs',
    deptLabel: 'CS',
    purpose: '상담 이력 요약 및 FAQ 자동 응답',
    model: 'Azure OpenAI GPT-4',
    stack: 'LangChain + Vector DB',
    data: [
      { tier: 'L4', label: '고객 PII' },
      { tier: 'L2', label: '상담 로그' },
    ],
    dup: { level: 'high', label: '중복 의심', note: '콜센터 모듈과 중복' },
  },
  {
    no: '02',
    name: '기지국 이상 트래픽 감지 Agent',
    id: 'AG-NW-007',
    dept: 'network',
    deptLabel: '네트워크',
    purpose: '실시간 트래픽 이상 탐지 및 알림',
    model: 'Private SLM Core',
    stack: 'Kafka + Flink Streaming',
    data: [
      { tier: 'L2', label: '트래픽 로그' },
      { tier: 'L1', label: '장비 메타' },
    ],
    dup: { level: 'none', label: '고유', note: '네트워크 고유 파이프라인' },
  },
  {
    no: '03',
    name: '계약서 리스크 검토 Agent',
    id: 'AG-EN-021',
    dept: 'enterprise',
    deptLabel: 'Enterprise',
    purpose: 'B2B 계약 조항 리스크 분석',
    model: 'Claude Sonnet (VPC)',
    stack: 'Isolated Sandbox Run',
    data: [
      { tier: 'L3', label: '계약 문서' },
      { tier: 'L2', label: '고객사 정보' },
    ],
    dup: { level: 'mid', label: '부분 중복', note: '대외 계약 도구와 부분 중복' },
  },
  {
    no: '04',
    name: 'ERP 자동 전표 처리 Agent',
    id: 'AG-FN-003',
    dept: 'finance',
    deptLabel: '재무',
    purpose: '증빙 기반 전표 자동 생성',
    model: 'ERP Gateway + GPT-4o',
    stack: 'SAP Connector Interface',
    data: [
      { tier: 'L3', label: '재무 데이터' },
      { tier: 'L2', label: '거래처 정보' },
    ],
    dup: { level: 'high', label: '중복 의심', note: '통합 협의 권고' },
  },
]
