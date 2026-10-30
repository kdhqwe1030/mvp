import { useEffect, useState } from 'react'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import DashboardPage from './pages/Dashboard/DashboardPage'
import GraphPage from './pages/Graph/GraphPage'
import RegisterPage from './pages/Register/RegisterPage'
import GraphSearchPage from './pages/GraphSearch/GraphSearchPage'
import { HeaderLlmSearch } from './pages/GraphSearch/SearchParts'
import { DEFAULT_SEARCH_POSITION, SEARCH_POSITIONS } from './pages/GraphSearch/positions'
import { useAgentSearch } from './hooks/useAgentSearch'
import './components/layout/layout.css'

// 경로 기반 라우팅: /dashboard, /graph, /register, /graph-search
const PAGES = ['dashboard', 'graph', 'register', 'graph-search']

// 예전 주소도 받아준다: /2/graph (v2 시절), /#graph (해시 방식)
const pageFromLocation = () => {
  const { pathname, hash } = window.location
  const seg = pathname.replace(/^\/2(?=\/|$)/, '').replace(/^\/|\/$/g, '')
  if (PAGES.includes(seg)) return seg
  const legacyHash = hash.replace('#', '')
  return PAGES.includes(legacyHash) ? legacyHash : 'dashboard'
}

export default function App() {
  const [page, setPageState] = useState(pageFromLocation)
  // 지식 그래프 + 검색: 검색 상태는 헤더(A안)와 페이지가 함께 쓰므로 App 에서 소유
  const search = useAgentSearch()
  const [searchPos, setSearchPosState] = useState(() => {
    const p = new URLSearchParams(window.location.search).get('pos')
    return SEARCH_POSITIONS.some((s) => s.key === p) ? p : DEFAULT_SEARCH_POSITION
  })
  const setSearchPos = (next) => {
    window.history.replaceState(null, '', `/graph-search?pos=${next}`)
    setSearchPosState(next)
  }

  useEffect(() => {
    // 루트·예전 주소·알 수 없는 경로는 정식 경로로 정규화
    const canonical = `/${page}`
    if (window.location.pathname !== canonical || window.location.hash) {
      window.history.replaceState(null, '', canonical + (page === 'graph-search' ? `?pos=${searchPos}` : ''))
    }
    const onPop = () => setPageState(pageFromLocation())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [page, searchPos])

  const setPage = (next) => {
    window.history.pushState(null, '', next === 'graph-search' ? `/${next}?pos=${searchPos}` : `/${next}`)
    setPageState(next)
  }

  return (
    <div className="app">
      <Sidebar activePage={page} onNavigate={setPage} />
      <div className="app__body">
        <Header search={page === 'graph-search' && searchPos === 'header' ? <HeaderLlmSearch search={search} /> : null} />
        <main>
          {page === 'graph' && <GraphPage />}
          {page === 'register' && <RegisterPage />}
          {page === 'graph-search' && <GraphSearchPage search={search} pos={searchPos} onPosChange={setSearchPos} />}
          {page === 'dashboard' && <DashboardPage onNavigate={setPage} />}
        </main>
      </div>
    </div>
  )
}
