// 지식 그래프 + 검색 화면의 검색창 위치 시안 (URL ?pos= 로 공유 가능)
export const SEARCH_POSITIONS = [
  { key: 'header', label: 'A 헤더', note: '전역 헤더 검색을 LLM 검색으로 대체 · 어디서나 보이지만 일반 검색과 역할이 겹치고, 결과 팝오버가 그래프를 가림' },
  { key: 'right', label: 'B 오른쪽 패널', note: '오른쪽 전용 검색 패널 · 근거까지 넉넉히 보이지만 그래프 폭이 줄고 설정 패널과 자리가 겹침' },
  { key: 'filter', label: 'C 필터 영역', note: '그래프 설정 > 필터 안 (기존 노드 검색 자리) · 구조 변화가 적지만 설정을 열어야 보이고 폭이 좁음' },
  { key: 'canvas', label: 'D 캔버스 상단', recommended: true, note: '캔버스 위 검색 바 + 왼쪽 결과 목록 · 검색 → 그래프 강조 → 노드 이동이 한 시선 안에서 이어짐' },
]

export const DEFAULT_SEARCH_POSITION = 'canvas'
