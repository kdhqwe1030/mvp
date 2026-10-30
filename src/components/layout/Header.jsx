import { useCallback, useState } from 'react'
import { Bell, Search, Settings } from 'lucide-react'
import { SAMPLE_NOTIFICATIONS } from '../../data/notifications'
import NotificationModal from './NotificationModal'

// search: 이 화면 전용 검색 UI 로 기본 검색창을 대체할 때 넘긴다 (지식 그래프 + 검색 A안)
export default function Header({ search }) {
  const [notiOpen, setNotiOpen] = useState(false)
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS)
  const hasUnread = notifications.some((n) => n.unread)
  const closeNoti = useCallback(() => setNotiOpen(false), [])

  return (
    <header className="header">
      {search ?? (
        <label className="search header__search">
          <Search size={12} className="search__icon" />
          <input placeholder="Agent, 부서, 모델 검색..." />
          <kbd className="mono">⌘K</kbd>
        </label>
      )}

      <div className="header__right">
        <div className="header__actions">
          <button className="icon-btn" aria-label="알림" aria-haspopup="dialog" onClick={() => setNotiOpen(true)}>
            <Bell size={14} />
            {hasUnread && <span className="icon-btn__badge" />}
          </button>
          <button className="icon-btn" aria-label="설정">
            <Settings size={14} />
          </button>
        </div>

        <span className="vdivider" />

        <div className="header__user">
          <div className="header__user-text">
            <span className="header__user-name">AI 거버넌스팀</span>
            <span className="mono muted">admin · 관리자</span>
          </div>
          <span className="avatar mono">AG</span>
        </div>
      </div>

      {notiOpen && (
        <NotificationModal
          items={notifications}
          onClose={closeNoti}
          onReadAll={() => setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))}
        />
      )}
    </header>
  )
}
