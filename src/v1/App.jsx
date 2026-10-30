import { useState } from 'react'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import DashboardPage from './pages/Dashboard/DashboardPage'
import GraphPage from './pages/Graph/GraphPage'
import './components/layout/layout.css'

export default function App() {
  // 새로고침해도 현재 화면이 유지되도록 URL 해시와 동기화 (#graph)
  const [page, setPageState] = useState(() => (window.location.hash === '#graph' ? 'graph' : 'dashboard'))
  const setPage = (next) => {
    window.location.hash = next === 'dashboard' ? '' : next
    setPageState(next)
  }

  return (
    <div className="app">
      <Sidebar activePage={page} onNavigate={setPage} />
      <div className="app__body">
        <Header />
        <main>
          {page === 'graph' ? <GraphPage /> : <DashboardPage onNavigate={setPage} />}
        </main>
      </div>
    </div>
  )
}
