// 캔버스/SVG 등 CSS 변수를 쓸 수 없는 곳에서 쓰는 색상. index.css 의 :root 토큰과 값을 맞춘다.
// 원칙: 무채색(slate) 기반 + 강조는 오렌지 하나만. 오렌지는 "주요 액션 · 주의가 필요한 데이터"에만 쓴다.

export const ACCENT = '#F37321'
export const ACCENT_300 = '#F8AE7C'
export const ACCENT_200 = '#FBD3B7'
export const ACCENT_50 = '#FEF4ED'

export const INK = '#111827'
export const SLATE = {
  100: '#F1F5F9',
  200: '#E2E8F0',
  300: '#CBD5E1',
  400: '#94A3B8',
  500: '#64748B',
  600: '#475569',
  700: '#334155',
}
