import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// 버전별로 코드/CSS 청크를 분리해 서로의 스타일이 섞이지 않게 한다.
// /1/... → v1(초기 전체 기능 시안, 보관용), 그 외 → 현재 버전
const isV1 = window.location.pathname === '/1' || window.location.pathname.startsWith('/1/')
const App = isV1 ? lazy(() => import('./v1/App.jsx')) : lazy(() => import('./App.jsx'))

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Suspense fallback={null}>
      <App />
    </Suspense>
  </StrictMode>,
)
