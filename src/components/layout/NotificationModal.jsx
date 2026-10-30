import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export default function NotificationModal({ items, onClose, onReadAll }) {
  const closeRef = useRef(null)

  // ESC 로 닫기 + 열릴 때 닫기 버튼에 포커스
  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const unread = items.filter((n) => n.unread).length

  // 헤더의 backdrop-filter 가 fixed 요소의 기준이 되어 모달이 헤더 안에 갇히므로 body 로 포털 렌더링
  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="noti-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal__head">
          <div>
            <h2 id="noti-title">알림</h2>
            <span className="mono muted">읽지 않음 {unread}건</span>
          </div>
          <button ref={closeRef} className="icon-btn icon-btn--ghost" onClick={onClose} aria-label="닫기">
            <X size={14} />
          </button>
        </div>

        <ul className="noti-list">
          {items.map(({ id, icon: Icon, title, body, time, unread: isUnread }) => (
            <li key={id} className={isUnread ? 'is-unread' : ''}>
              <span className="noti-list__icon">
                <Icon size={13} />
              </span>
              <div className="noti-list__text">
                <strong>{title}</strong>
                <span className="muted">{body}</span>
              </div>
              <span className="noti-list__time mono muted">{time}</span>
            </li>
          ))}
        </ul>

        <div className="modal__foot">
          <button className="modal__btn" onClick={onReadAll} disabled={unread === 0}>
            모두 읽음 처리
          </button>
          <button className="modal__btn modal__btn--primary" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
