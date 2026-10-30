// Agent 일괄 등록: 파일 파싱 → 정규화 → 검증
import { readSheet } from 'read-excel-file/browser'
import { DEPARTMENTS } from '../../data/dashboard'

export const FIELDS = [
  { key: 'name', label: 'Agent 이름', required: true, aliases: ['name', 'agent', 'agentname', 'agent이름', '이름', 'agent명', '에이전트', '에이전트명'] },
  { key: 'id', label: '식별자', required: true, aliases: ['id', 'agentid', '식별자', '코드'] },
  { key: 'dept', label: '부서', required: true, aliases: ['dept', 'department', '부서', '조직', '소속'] },
  { key: 'purpose', label: '업무 성격', aliases: ['purpose', 'description', '업무', '업무성격', '설명'] },
  { key: 'model', label: '모델 / LLM', required: true, aliases: ['model', 'llm', '모델', '모델명'] },
  { key: 'stack', label: '스택 / 플랫폼', aliases: ['stack', 'platform', '스택', '플랫폼'] },
  { key: 'dataSources', label: '데이터 소스', aliases: ['data', 'datasource', 'datasources', '데이터', '데이터소스'] },
  { key: 'tier', label: '데이터 등급', required: true, aliases: ['tier', 'sensitivity', '등급', '데이터등급', '민감도'] },
  { key: 'owner', label: '담당자', aliases: ['owner', '담당자', '담당'] },
]

export const TIER_OPTIONS = ['L4', 'L3', 'L2', 'L1']
export const DEPT_OPTIONS = DEPARTMENTS.map((d) => ({ key: d.key, name: d.name }))

const norm = (s) => String(s ?? '').toLowerCase().replace(/[\s_\-·./]/g, '')

const DEPT_ALIASES = {
  cs: ['cs', '고객센터', '고객', '콜센터', '고객경험'],
  network: ['network', '네트워크', 'nw', '운영본부'],
  enterprise: ['enterprise', '엔터프라이즈', 'b2b', '기업사업'],
  finance: ['finance', '재무', '경영지원', '회계'],
  platform: ['platform', 'it', '플랫폼', '정보기술'],
}

const TIER_ALIASES = {
  L4: ['l4', '4', '극비', 'pii', '개인정보'],
  L3: ['l3', '3', '대외비', '기밀'],
  L2: ['l2', '2', '사내', '사내한정', '내부'],
  L1: ['l1', '1', '공개', '비식별'],
}

// ---------- 파싱 ----------

function parseCsv(text) {
  const rows = []
  let row = [], cell = '', quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++ }
      else if (c === '"') quoted = false
      else cell += c
    } else if (c === '"') quoted = true
    else if (c === ',') { row.push(cell); cell = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(cell); rows.push(row); row = []; cell = ''
    } else cell += c
  }
  if (cell || row.length) { row.push(cell); rows.push(row) }
  return rows.filter((r) => r.some((v) => String(v).trim()))
}

// 2차원 배열(첫 행 = 헤더) → 객체 배열
function tableToObjects(table) {
  const [header = [], ...body] = table
  const keys = header.map((h) => FIELDS.find((f) => f.aliases.includes(norm(h)))?.key ?? null)
  if (!keys.some(Boolean)) throw new Error('헤더에서 인식 가능한 컬럼을 찾지 못했습니다. 템플릿의 컬럼명을 사용해 주세요.')
  return body.map((cells) => {
    const obj = {}
    keys.forEach((k, i) => { if (k) obj[k] = cells[i] })
    return obj
  })
}

function jsonToObjects(text) {
  const data = JSON.parse(text)
  const list = Array.isArray(data) ? data : data.agents
  if (!Array.isArray(list)) throw new Error('JSON은 배열이거나 { "agents": [...] } 형태여야 합니다.')
  return list.map((item) => {
    const obj = {}
    Object.entries(item).forEach(([k, v]) => {
      const field = FIELDS.find((f) => f.aliases.includes(norm(k)))
      if (field) obj[field.key] = Array.isArray(v) ? v.join(', ') : v
    })
    return obj
  })
}

export async function parseAgentFile(file) {
  const ext = file.name.split('.').pop().toLowerCase()
  if (ext === 'json') return jsonToObjects(await file.text())
  if (ext === 'csv') return tableToObjects(parseCsv(await file.text()))
  if (ext === 'xlsx') return tableToObjects(await readSheet(file))
  if (ext === 'xls') throw new Error('구형 .xls 형식은 지원하지 않습니다. 엑셀에서 .xlsx 로 저장해 주세요.')
  throw new Error('JSON, XLSX, CSV 파일만 올릴 수 있습니다.')
}

// ---------- 정규화 ----------

const findAlias = (map, value) => {
  const v = norm(value)
  if (!v) return null
  return Object.entries(map).find(([, aliases]) => aliases.some((a) => v === a || v.includes(a)))?.[0] ?? null
}

let uidSeq = 0
export const newUid = () => `row-${Date.now()}-${uidSeq++}`

// 원본 값을 표준 값으로 바꾸고, 자동 해석한 항목은 notes 에 남긴다 (사용자 확인용)
export function toRow(raw) {
  const values = {}
  const notes = {}
  FIELDS.forEach((f) => { values[f.key] = String(raw[f.key] ?? '').trim() })

  if (values.dept) {
    const exact = DEPT_OPTIONS.find((d) => norm(d.name) === norm(values.dept) || d.key === norm(values.dept))
    const key = exact?.key ?? findAlias(DEPT_ALIASES, values.dept)
    if (key) {
      if (!exact) notes.dept = `원본 '${values.dept}' → 자동 해석됨`
      values.dept = key
    }
  }
  if (values.tier) {
    const tier = findAlias(TIER_ALIASES, values.tier)
    if (tier) {
      if (values.tier.toUpperCase() !== tier) notes.tier = `원본 '${values.tier}' → ${tier} 로 해석됨`
      values.tier = tier
    }
  }
  if (values.id) values.id = values.id.toUpperCase()
  return { uid: newUid(), values, notes, selected: true }
}

export const emptyRow = () => ({ uid: newUid(), values: Object.fromEntries(FIELDS.map((f) => [f.key, ''])), notes: {}, selected: true })

// ---------- 검증 ----------

const stripAgent = (s) => norm(s).replace(/agent$/, '')

// 반환: { [uid]: { level: 'ok'|'warn'|'error', fields: { [key]: { level, msg } } } }
export function validateRows(rows, existing) {
  const idCount = new Map()
  rows.forEach((r) => { const id = r.values.id; if (id) idCount.set(id, (idCount.get(id) ?? 0) + 1) })

  const result = {}
  rows.forEach((row) => {
    const v = row.values
    const fields = {}
    const set = (key, level, msg) => { if (!fields[key] || fields[key].level !== 'error') fields[key] = { level, msg } }

    FIELDS.filter((f) => f.required && !v[f.key]).forEach((f) => set(f.key, 'error', '필수 항목 누락'))

    if (v.id) {
      if (idCount.get(v.id) > 1) set('id', 'error', '파일 안에서 식별자 중복')
      else if (existing.ids.has(v.id)) set('id', 'error', '이미 등록된 식별자')
      else if (!/^AG-[A-Z]{2}-\d{3}$/.test(v.id)) set('id', 'warn', '권장 형식: AG-XX-000')
    }
    if (v.dept && !DEPT_OPTIONS.some((d) => d.key === v.dept)) set('dept', 'error', '알 수 없는 부서 — 목록에서 선택')
    if (v.tier && !TIER_OPTIONS.includes(v.tier)) set('tier', 'error', '알 수 없는 등급 — L1~L4 중 선택')
    if (v.name) {
      const similar = existing.names.find((n) => {
        const a = stripAgent(n), b = stripAgent(v.name)
        return a && b && (a.includes(b) || b.includes(a))
      })
      if (similar) set('name', 'warn', `기존 '${similar}'와 유사 — 중복 여부 확인`)
    }
    if (!v.purpose) set('purpose', 'warn', '업무 성격 누락')
    if (!v.dataSources) set('dataSources', 'warn', '데이터 소스 미기재 — 관계 생성 불가')

    Object.entries(row.notes).forEach(([k, msg]) => set(k, 'warn', msg))

    const levels = Object.values(fields).map((f) => f.level)
    result[row.uid] = {
      level: levels.includes('error') ? 'error' : levels.includes('warn') ? 'warn' : 'ok',
      fields,
    }
  })
  return result
}

// ---------- 템플릿 / 샘플 ----------

export const TEMPLATE_HEADERS = ['Agent 이름', '식별자', '부서', '업무 성격', '모델', '플랫폼', '데이터 소스', '데이터 등급', '담당자']

export const SAMPLE_AGENTS = [
  { name: 'VOC 감성 분석 Agent', id: 'AG-CS-031', dept: 'CS·고객센터', purpose: '상담 VOC 감성 분류', model: 'Azure OpenAI GPT-4o', stack: 'LangChain', dataSources: ['고객 음성 상담 DB', 'VOC 게시판'], tier: 'L4', owner: '고객경험팀' },
  { name: '고객상담 요약 Agent v2', id: 'AG-CS-032', dept: '고객센터', purpose: '상담 이력 요약', model: 'Claude (VPC)', stack: '', dataSources: ['고객 음성 상담 DB'], tier: '극비', owner: '' },
  { name: '장애 티켓 자동 분류', id: 'ag-nw-012', dept: '네트워크', purpose: '', model: 'Private SLM', stack: 'Kafka Stream', dataSources: [], tier: '2', owner: 'NOC' },
  { name: '세금계산서 검증 Agent', id: 'AG-FN-020', dept: '회계팀', purpose: '세금계산서 정합성 검증', model: '', stack: 'SAP ERP', dataSources: ['재무 원장 DB'], tier: 'L3', owner: '재무팀' },
  { name: '견적서 초안 생성', id: 'AG-FN-020', dept: 'Enterprise 사업부', purpose: 'B2B 견적서 초안', model: 'Azure OpenAI GPT-4o', stack: '', dataSources: ['고객사 마스터'], tier: '중요', owner: '영업기획' },
]

export function downloadFile(name, content, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

export function csvTemplate() {
  const example = ['VOC 감성 분석 Agent', 'AG-CS-031', 'CS·고객센터', '상담 VOC 감성 분류', 'Azure OpenAI GPT-4o', 'LangChain', '고객 음성 상담 DB, VOC 게시판', 'L4', '고객경험팀']
  const line = (cells) => cells.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')
  // BOM 을 붙여야 엑셀에서 한글이 깨지지 않는다
  return '﻿' + [line(TEMPLATE_HEADERS), line(example)].join('\r\n')
}

export function jsonTemplate() {
  return JSON.stringify({ agents: [SAMPLE_AGENTS[0]] }, null, 2)
}
