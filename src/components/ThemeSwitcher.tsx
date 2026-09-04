/**
 * 主题色切换（头部 · 铃铛旁 · 2026-09）.
 * 调色盘图标下拉：预设色板点选即切并持久化。
 */
import { BgColorsOutlined } from '@ant-design/icons';
import { Button, Dropdown } from 'antd';
import { readThemeColor, setThemeColor, THEME_PRESETS } from '../config/themePresets';

export default function ThemeSwitcher() {
  const current = readThemeColor();
  return (
    <Dropdown
      placement="bottomRight"
      menu={{
        items: [
          {
            type: 'group',
            label: '主题色',
            children: THEME_PRESETS.map((p) => ({
              key: p.color,
              label: (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, minWidth: 120 }}>
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 7,
                      background: p.color,
                      display: 'inline-block',
                      border: current === p.color ? '2px solid rgba(0,0,0,0.55)' : '1px solid rgba(0,0,0,0.12)',
                    }}
                  />
                  {p.name}
                  {current === p.color && <span style={{ color: '#999', fontSize: 12 }}>✓</span>}
                </span>
              ),
              onClick: () => {
                if (current === p.color) return;
                setThemeColor(p.color);
                window.location.reload();
              },
            })),
          },
        ],
      }}
    >
      <Button
        type="text"
        icon={<BgColorsOutlined style={{ fontSize: 16 }} />}
        style={{ color: 'rgba(0,0,0,0.65)' }}
        title="主题色"
      />
    </Dropdown>
  );
}
