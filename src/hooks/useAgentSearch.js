import { useCallback, useRef, useState } from 'react'
import { searchAgents } from '../services/agentSearch'

// 검색창이 헤더/패널/캔버스 어디에 있든 같은 상태를 공유하기 위한 훅 (App 에서 한 번 생성)
export function useAgentSearch() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | done | error
  const [result, setResult] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const requestRef = useRef(0)

  const run = useCallback(async (text) => {
    const q = text.trim()
    if (!q) return
    setQuery(q)
    const id = ++requestRef.current
    setStatus('loading')
    setSelectedId(null)
    try {
      const r = await searchAgents(q)
      if (id !== requestRef.current) return // 더 최근 요청이 있으면 버린다
      setResult(r)
      setStatus('done')
    } catch {
      if (id === requestRef.current) setStatus('error')
    }
  }, [])

  const clear = useCallback(() => {
    requestRef.current++
    setQuery('')
    setResult(null)
    setStatus('idle')
    setSelectedId(null)
  }, [])

  return { query, setQuery, status, result, run, clear, selectedId, setSelectedId }
}
