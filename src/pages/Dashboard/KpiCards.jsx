import { Bot, Coins, Copy, ShieldAlert, TrendingUp } from 'lucide-react'
import { TOTAL_AGENTS, tierTotal } from '../../data/dashboard'

export default function KpiCards() {
  const kpis = [
    {
      label: '등록 Agent',
      value: TOTAL_AGENTS,
      trend: true,
      icon: Bot,
      foot: [{ text: '+12', strong: true, mono: true }, { text: '지난 분기 대비' }],
    },
    {
      label: '고위험 데이터 접근',
      value: tierTotal('L4'),
      trend: true,
      icon: ShieldAlert,
      dot: true,
      foot: [{ text: 'L4 PII 접근', strong: true }, { text: '검토 필요' }],
    },
    {
      label: '중복 의심 군집',
      value: 3,
      unit: '개',
      icon: Copy,
      foot: [{ text: '12건', strong: true, mono: true }, { text: '통합 대상 인스턴스' }],
    },
    {
      label: '월 LLM 비용',
      value: '₩48.2',
      unit: 'M / 월',
      icon: Coins,
      foot: [{ text: '예산 대비', strong: true }, { text: '82% 소진' }],
    },
  ]

  return (
    <div className="kpi-grid">
      {kpis.map(({ label, value, unit, trend, icon: Icon, dot, foot }) => (
        <div key={label} className="card kpi">
          <div className="kpi__top">
            <div>
              <div className="kpi__label mono upper">{label}</div>
              <div className="kpi__value">
                <span className="mono">{value}</span>
                {trend && <TrendingUp size={11} className="muted" />}
                {unit && <span className="kpi__unit muted">{unit}</span>}
              </div>
            </div>
            <span className="kpi__icon">
              <Icon size={15} />
            </span>
          </div>
          <div className="kpi__foot">
            {dot && <span className="dot dot--dark" />}
            {foot.map((f) => (
              <span key={f.text} className={`${f.strong ? 'kpi__foot-strong' : 'muted'}${f.mono ? ' mono' : ''}`}>
                {f.text}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
