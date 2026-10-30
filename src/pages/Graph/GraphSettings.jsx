import { Check, ChevronRight, Play, RotateCcw, Search, Settings2, X } from 'lucide-react'

function Section({ title, children }) {
  return (
    <details className="g-acc" open>
      <summary>
        <ChevronRight size={10} className="g-acc__chevron" />
        {title}
      </summary>
      <div className="g-acc__body">{children}</div>
    </details>
  )
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="g-toggle">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className={`g-checkbox g-checkbox--sm${checked ? ' is-checked' : ''}`}>
        {checked && <Check size={10} strokeWidth={3} />}
      </span>
    </label>
  )
}

function Slider({ label, value, display, min, max, step, onChange }) {
  return (
    <label className="g-slider">
      <span className="g-slider__row">
        <span>{label}</span>
        <span className="mono g-faint">{display ?? value}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  )
}

export default function GraphSettings({ settings, onChange, onReset, onClose, onReheat }) {
  const set = (key) => (value) => onChange(key, value)

  return (
    <div className="g-settings">
      <div className="g-settings__head">
        <span className="g-settings__title">
          <Settings2 size={12} />
          그래프 설정
        </span>
        <span className="g-settings__actions">
          <button className="g-icon-btn g-icon-btn--sm" onClick={onReset} aria-label="설정 초기화">
            <RotateCcw size={10} />
          </button>
          <button className="g-icon-btn g-icon-btn--sm" onClick={onClose} aria-label="설정 닫기">
            <X size={11} />
          </button>
        </span>
      </div>

      <div className="g-settings__body">
        <Section title="필터">
          <label className="g-search">
            <Search size={11} />
            <input placeholder="노드 검색..." value={settings.search} onChange={(e) => set('search')(e.target.value)} />
          </label>
          <Toggle label="중복 링크만" checked={settings.dupOnly} onChange={set('dupOnly')} />
          <Toggle label="부서 링크 숨김" checked={settings.hideDeptLinks} onChange={set('hideDeptLinks')} />
          <Toggle label="문서 링크 숨김" checked={settings.hideDocLinks} onChange={set('hideDocLinks')} />
          <Toggle label="고아 노드" checked={settings.showOrphans} onChange={set('showOrphans')} />
        </Section>

        <hr className="g-divider" />

        <Section title="표시">
          <Toggle label="화살표" checked={settings.arrows} onChange={set('arrows')} />
          <Slider
            label="텍스트 페이드 임계값"
            value={settings.textFade}
            display={`${settings.textFade.toFixed(1)}x`}
            min={0.3}
            max={4}
            step={0.1}
            onChange={set('textFade')}
          />
          <Slider label="노드 크기" value={settings.nodeSize} display={settings.nodeSize.toFixed(1)} min={0.5} max={2.5} step={0.1} onChange={set('nodeSize')} />
          <Slider label="링크 두께" value={settings.linkWidth} display={settings.linkWidth.toFixed(1)} min={0.3} max={3} step={0.1} onChange={set('linkWidth')} />
          <button className="g-btn" onClick={onReheat}>
            <Play size={9} fill="currentColor" />
            <span className="mono">시뮬레이션 재시작</span>
          </button>
        </Section>

        <hr className="g-divider" />

        <Section title="물리엔진 장력">
          <Slider label="중심력" value={settings.center} display={settings.center.toFixed(2)} min={0} max={0.4} step={0.01} onChange={set('center')} />
          <Slider label="반발력" value={settings.repel} min={10} max={300} step={5} onChange={set('repel')} />
          <Slider label="링크 장력" value={settings.linkForce} display={settings.linkForce.toFixed(2)} min={0} max={1} step={0.05} onChange={set('linkForce')} />
          <Slider label="링크 거리" value={settings.linkDistance} min={10} max={120} step={1} onChange={set('linkDistance')} />
        </Section>
      </div>
    </div>
  )
}
