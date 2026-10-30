import { Copy, ShieldAlert, UserPlus } from 'lucide-react'

// 예시 알림. 추후 알림 API 로 교체한다.
export const SAMPLE_NOTIFICATIONS = [
  {
    id: 'n1',
    icon: Copy,
    title: '중복 의심 Agent 쌍이 새로 감지됐습니다',
    body: '고객상담 요약 Agent ↔ 콜센터 응대 봇 (유사도 0.94)',
    time: '10분 전',
    unread: true,
  },
  {
    id: 'n2',
    icon: ShieldAlert,
    title: 'L4 민감 데이터에 접근하는 Agent가 등록됐습니다',
    body: 'VOC 감성 분석 Agent → 고객 음성 상담 DB',
    time: '1시간 전',
    unread: true,
  },
  {
    id: 'n3',
    icon: UserPlus,
    title: '일괄 등록이 완료됐습니다',
    body: 'Agent 3개, 관계 11건 등록',
    time: '어제',
    unread: false,
  },
]
