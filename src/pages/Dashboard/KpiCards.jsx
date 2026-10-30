import { Bot, Copy, TrendingUp } from 'lucide-react'
import { TOTAL_AGENTS } from '../../data/dashboard'

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
      label: '중복 의심 군집',
      value: 3,
      unit: '개',
      icon: Copy,
      foot: [{ text: '12건', strong: true, mono: true }, { text: '통합 대상 인스턴스' }],
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
                {trend && <TrendingUp size={12} className="kpi__trend" />}
                {unit && <span className="kpi__unit muted">{unit}</span>}
              </div>
            </div>
            <span className="kpi__icon">
              <Icon size={15} />
            </span>
          </div>
          <div className="kpi__foot">
            {dot && <span className="dot dot--accent" />}
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
