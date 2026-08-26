/**
 * 风险指数面板（百分比大字 + 四维分解网格 · 2026-08-25）.
 *
 * 版式：上 = 大号百分比（等级色发光）+ 等级；下 = 2×2 分解指标卡。
 */
import { DatavPanel, DatavPanelBadge, datavRisk, datavTheme, type ZoomInfo } from '@lieshoucloud/ui';

interface RiskPanelProps {
  risk: datavRisk.RiskResult;
  onZoom: (info: ZoomInfo) => void;
}

export default function RiskPanel({ risk, onZoom }: RiskPanelProps) {
  const meta = datavRisk.RISK_LEVEL_META[risk.level];
  const tone = risk.level === 'high' ? 'red' : risk.level === 'medium' ? 'orange' : 'green';

  return (
    <DatavPanel
      title="风险指数"
      zoomKey="risk"
      onZoom={onZoom}
      extra={
        <DatavPanelBadge tone={tone} dot>
          {meta.text}
        </DatavPanelBadge>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
        {/* 上：大号百分比 + 等级 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'center',
            gap: 10,
            padding: '8px 0 4px',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: datavTheme.FONT.hero,
              fontWeight: 800,
              lineHeight: 1,
              color: meta.color,
              fontVariantNumeric: 'tabular-nums',
              textShadow: `0 0 22px ${meta.glow}`,
            }}
          >
            {risk.score}
            <span style={{ fontSize: 30, fontWeight: 700 }}>%</span>
          </span>
          <span style={{ fontSize: datavTheme.FONT.strong, color: meta.color, letterSpacing: 4 }}>{meta.text}</span>
        </div>

        {/* 下：2×2 分解指标卡 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 6,
            flex: 1,
            minHeight: 0,
            alignContent: 'center',
          }}
        >
          {risk.parts.map((p) => {
            const c = p.score > p.weight * 0.5 ? '#ff4d4f' : p.score > 0 ? '#fa8c16' : '#52c41a';
            return (
              <div
                key={p.key}
                style={{
                  border: '1px solid rgba(30,91,138,0.4)',
                  borderRadius: 6,
                  padding: '5px 10px',
                  background: 'rgba(9,30,60,0.4)',
                  minWidth: 0,
                }}
                title={p.detail}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: datavTheme.FONT.label, color: '#8fc1e3' }}>
                    <i style={{ width: 6, height: 6, borderRadius: '50%', background: c, boxShadow: `0 0 5px ${c}` }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.label}</span>
                  </span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: c, fontVariantNumeric: 'tabular-nums' }}>{p.score}</span>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${(p.score / p.weight) * 100}%`,
                      height: '100%',
                      background: c,
                      borderRadius: 3,
                      transition: 'width .6s',
                    }}
                  />
                </div>
                <div style={{ fontSize: datavTheme.FONT.muted, color: '#5a7f9f', marginTop: 3, textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.detail}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DatavPanel>
  );
}
