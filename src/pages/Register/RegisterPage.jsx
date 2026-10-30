import { useMemo, useRef, useState } from 'react'
import { AlertCircle, AlertTriangle, CheckCircle2, Download, FileUp, Plus, Sparkles, Trash2, Upload } from 'lucide-react'
import { AGENTS } from '../../data/dashboard'
import { clearRegistered, loadRegistered, registerAgents } from '../../store/agentRegistry'
import {
  DEPT_OPTIONS,
  FIELDS,
  SAMPLE_AGENTS,
  TIER_OPTIONS,
  csvTemplate,
  downloadFile,
  emptyRow,
  jsonTemplate,
  parseAgentFile,
  toRow,
  validateRows,
} from './agentImport'
import './register.css'

const STATUS = {
  ok: { label: '정상', icon: CheckCircle2 },
  warn: { label: '확인 필요', icon: AlertTriangle },
  error: { label: '오류', icon: AlertCircle },
}

const deptName = (key) => DEPT_OPTIONS.find((d) => d.key === key)?.name ?? key

export default function RegisterPage() {
  const fileRef = useRef(null)
  const [rows, setRows] = useState([])
  const [fileName, setFileName] = useState('')
  const [parseError, setParseError] = useState('')
  const [dragging, setDragging] = useState(false)
  const [onlyIssues, setOnlyIssues] = useState(false)
  const [registered, setRegistered] = useState(loadRegistered)
  const [lastResult, setLastResult] = useState(null)

  const existing = useMemo(
    () => ({
      ids: new Set([...AGENTS.map((a) => a.id), ...registered.map((a) => a.id)]),
      names: [...AGENTS.map((a) => a.name), ...registered.map((a) => a.name)],
    }),
    [registered],
  )
  const checks = useMemo(() => validateRows(rows, existing), [rows, existing])

  const counts = rows.reduce(
    (acc, r) => {
      acc[checks[r.uid].level] += 1
      if (r.selected) acc.selected += 1
      if (r.selected && checks[r.uid].level === 'error') acc.selectedErrors += 1
      return acc
    },
    { ok: 0, warn: 0, error: 0, selected: 0, selectedErrors: 0 },
  )
  const canRegister = counts.selected > 0 && counts.selectedErrors === 0
  const visibleRows = onlyIssues ? rows.filter((r) => checks[r.uid].level !== 'ok') : rows
  const step = lastResult && rows.length === 0 ? 3 : rows.length ? 2 : 1

  const loadObjects = (objects, name) => {
    setRows(objects.map(toRow))
    setFileName(name)
    setParseError('')
    setLastResult(null)
    setOnlyIssues(false)
  }

  const handleFile = async (file) => {
    if (!file) return
    try {
      const objects = await parseAgentFile(file)
      if (!objects.length) throw new Error('등록할 행이 없습니다.')
      loadObjects(objects, file.name)
    } catch (e) {
      setParseError(e.message || '파일을 읽지 못했습니다.')
    }
  }

  const updateValue = (uid, key, value) =>
    setRows((prev) =>
      prev.map((r) => {
        if (r.uid !== uid) return r
        const notes = { ...r.notes }
        delete notes[key] // 사용자가 직접 고치면 자동 해석 메모는 지운다
        return { ...r, values: { ...r.values, [key]: key === 'id' ? value.toUpperCase() : value }, notes }
      }),
    )
  const toggleRow = (uid) => setRows((prev) => prev.map((r) => (r.uid === uid ? { ...r, selected: !r.selected } : r)))
  const toggleAll = (selected) => setRows((prev) => prev.map((r) => ({ ...r, selected })))
  const deselectErrors = () => setRows((prev) => prev.map((r) => (checks[r.uid].level === 'error' ? { ...r, selected: false } : r)))
  const removeRow = (uid) => setRows((prev) => prev.filter((r) => r.uid !== uid))

  const handleRegister = () => {
    const targets = rows.filter((r) => r.selected)
    const { records, all } = registerAgents(targets.map((r) => r.values))
    setRegistered(all)
    setLastResult({ agents: records.length, relations: records.reduce((n, r) => n + r.relations.length, 0) })
    setRows((prev) => prev.filter((r) => !r.selected))
  }

  return (
    <div className="reg">
      <section className="reg-head">
        <div>
          <h1>Agent 등록</h1>
          <p className="muted">JSON 또는 엑셀 파일로 여러 Agent를 한 번에 등록합니다. 등록 전 추출 결과를 검증하고 표에서 바로 수정할 수 있습니다.</p>
        </div>
        <ol className="reg-steps">
          {['파일 업로드', '검증 · 수정', '일괄 등록'].map((label, i) => (
            <li key={label} className={step === i + 1 ? 'is-current' : step > i + 1 ? 'is-done' : ''}>
              <span className="mono">{i + 1}</span>
              {label}
            </li>
          ))}
        </ol>
      </section>

      {lastResult && (
        <div className="reg-banner">
          <CheckCircle2 size={16} />
          <span>
            Agent <strong>{lastResult.agents}개</strong>와 관계 <strong>{lastResult.relations}건</strong>을 등록했습니다.
          </span>
        </div>
      )}

      <section
        className={`card reg-upload${dragging ? ' is-dragging' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          handleFile(e.dataTransfer.files[0])
        }}
      >
        <div className="reg-upload__drop">
          <span className="reg-upload__icon">
            <FileUp size={18} />
          </span>
          <div>
            <strong>{fileName ? `불러온 파일: ${fileName}` : '파일을 끌어다 놓거나 선택하세요'}</strong>
            <p className="muted">JSON · XLSX · CSV 지원. 첫 행은 컬럼명이어야 합니다 (Agent 이름, 식별자, 부서, 모델, 데이터 등급 필수).</p>
          </div>
          <button className="primary-btn" onClick={() => fileRef.current?.click()}>
            <Upload size={11} />
            파일 선택
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,.xlsx,.csv"
            hidden
            onChange={(e) => {
              handleFile(e.target.files[0])
              e.target.value = ''
            }}
          />
        </div>
        <div className="reg-upload__links">
          <button className="text-btn" onClick={() => downloadFile('agent-template.csv', csvTemplate(), 'text/csv;charset=utf-8')}>
            <Download size={11} />
            엑셀 템플릿 (.csv)
          </button>
          <button className="text-btn" onClick={() => downloadFile('agent-template.json', jsonTemplate(), 'application/json')}>
            <Download size={11} />
            JSON 예시
          </button>
          <button className="text-btn" onClick={() => loadObjects(SAMPLE_AGENTS, '샘플 데이터')}>
            <Sparkles size={11} />
            샘플 데이터로 체험
          </button>
        </div>
        {parseError && (
          <div className="reg-error">
            <AlertCircle size={13} />
            {parseError}
          </div>
        )}
      </section>

      {rows.length > 0 && (
        <section className="card reg-review">
          <div className="reg-review__head">
            <div>
              <h2>등록 전 검증</h2>
              <p className="mono muted">
                총 {rows.length}건 · 정상 {counts.ok} · 확인 필요 {counts.warn} · 오류 {counts.error}
              </p>
            </div>
            <div className="reg-review__tools">
              <label className="reg-switch">
                <input type="checkbox" checked={onlyIssues} onChange={(e) => setOnlyIssues(e.target.checked)} />
                문제 있는 행만 보기
              </label>
              <button className="outline-btn" onClick={() => setRows((prev) => [...prev, emptyRow()])}>
                <Plus size={11} />
                행 추가
              </button>
            </div>
          </div>

          <div className="reg-legend">
            <span className="reg-cell-demo is-error" /> 오류: 수정해야 등록 가능
            <span className="reg-cell-demo is-warn" /> 확인 필요: 자동 해석·누락 항목, 등록은 가능
          </div>

          <div className="reg-table-wrap">
            <table className="reg-table">
              <thead>
                <tr>
                  <th className="reg-table__check">
                    <input
                      type="checkbox"
                      checked={counts.selected === rows.length}
                      onChange={(e) => toggleAll(e.target.checked)}
                      aria-label="전체 선택"
                    />
                  </th>
                  <th>상태</th>
                  {FIELDS.map((f) => (
                    <th key={f.key}>
                      {f.label}
                      {f.required && <span className="reg-req">*</span>}
                    </th>
                  ))}
                  <th />
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row) => {
                  const check = checks[row.uid]
                  const Status = STATUS[check.level]
                  return (
                    <tr key={row.uid} className={row.selected ? '' : 'is-unselected'}>
                      <td className="reg-table__check">
                        <input type="checkbox" checked={row.selected} onChange={() => toggleRow(row.uid)} aria-label="행 선택" />
                      </td>
                      <td>
                        <span className={`reg-status is-${check.level}`}>
                          <Status.icon size={11} />
                          {Status.label}
                        </span>
                      </td>
                      {FIELDS.map((f) => {
                        const issue = check.fields[f.key]
                        const value = row.values[f.key]
                        const cls = `reg-input${issue ? ` is-${issue.level}` : ''}`
                        return (
                          <td key={f.key} className={`reg-td reg-td--${f.key}`}>
                            {f.key === 'dept' ? (
                              <select className={cls} value={value} onChange={(e) => updateValue(row.uid, f.key, e.target.value)}>
                                {!DEPT_OPTIONS.some((d) => d.key === value) && <option value={value}>{value || '선택'}</option>}
                                {DEPT_OPTIONS.map((d) => (
                                  <option key={d.key} value={d.key}>
                                    {d.name}
                                  </option>
                                ))}
                              </select>
                            ) : f.key === 'tier' ? (
                              <select className={cls} value={value} onChange={(e) => updateValue(row.uid, f.key, e.target.value)}>
                                {!TIER_OPTIONS.includes(value) && <option value={value}>{value || '선택'}</option>}
                                {TIER_OPTIONS.map((t) => (
                                  <option key={t} value={t}>
                                    {t}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                className={cls}
                                value={value}
                                placeholder={f.required ? '필수' : ''}
                                onChange={(e) => updateValue(row.uid, f.key, e.target.value)}
                              />
                            )}
                            {issue && <div className={`reg-msg is-${issue.level}`}>{issue.msg}</div>}
                          </td>
                        )
                      })}
                      <td>
                        <button className="reg-icon-btn" onClick={() => removeRow(row.uid)} aria-label="행 삭제">
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="reg-actions">
            <div className="muted">
              선택 <strong className="mono">{counts.selected}</strong>건
              {counts.selectedErrors > 0 && (
                <>
                  {' '}· 그중 오류 <strong className="mono reg-actions__err">{counts.selectedErrors}</strong>건 —{' '}
                  <button className="link-btn" onClick={deselectErrors}>
                    오류 행 선택 해제
                  </button>
                </>
              )}
            </div>
            <button className="primary-btn" disabled={!canRegister} onClick={handleRegister}>
              선택한 {counts.selected}개 일괄 등록
            </button>
          </div>
        </section>
      )}

      <section className="card reg-done">
        <div className="reg-review__head">
          <div>
            <h2>등록된 Agent</h2>
            <p className="mono muted">총 {registered.length}건 · 브라우저 임시 저장소</p>
          </div>
          {registered.length > 0 && (
            <button className="text-btn" onClick={() => setRegistered(clearRegistered())}>
              <Trash2 size={11} />
              목록 비우기
            </button>
          )}
        </div>
        {registered.length === 0 ? (
          <p className="reg-empty muted">아직 등록된 Agent가 없습니다.</p>
        ) : (
          <div className="reg-table-wrap">
            <table className="reg-table reg-table--plain">
              <thead>
                <tr>
                  <th>Agent 이름</th>
                  <th>식별자</th>
                  <th>부서</th>
                  <th>모델</th>
                  <th>등급</th>
                  <th>관계</th>
                  <th>등록 시각</th>
                </tr>
              </thead>
              <tbody>
                {registered.map((a) => (
                  <tr key={`${a.id}-${a.registeredAt}`}>
                    <td className="reg-strong">{a.name}</td>
                    <td className="mono">{a.id}</td>
                    <td>{deptName(a.dept)}</td>
                    <td className="mono">{a.model}</td>
                    <td>
                      <span className={`tier-badge tier-badge--${a.tier.toLowerCase()} mono`}>{a.tier}</span>
                    </td>
                    <td className="muted" title={a.relations.map((r) => `${r.type} → ${r.target}`).join('\n')}>
                      {a.relations.length}건
                    </td>
                    <td className="mono muted">{new Date(a.registeredAt).toLocaleString('ko-KR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
