/**
 * 全局主题色预设与持久化（版别之上可用户选择 · 2026-09）.
 *
 * 默认取 edition.primaryColor；用户可从预设切换并记忆（localStorage），
 * 刷新/重登保持。antd token colorPrimary 在 main.tsx 统一读取。
 */
export interface ThemePreset {
  name: string;
  color: string;
}

/** 预设色板（首位为墨绿 · 客户确认的智法云枢主色调） */
export const THEME_PRESETS: ThemePreset[] = [
  { name: '墨绿', color: '#1e9e57' },
  { name: '智法绿', color: '#23b96f' },
  { name: '经典蓝', color: '#1677ff' },
  { name: '藏青', color: '#003a8c' },
  { name: '罗兰紫', color: '#722ed1' },
  { name: '暖橙', color: '#fa8c16' },
];

const KEY = 'lieshoucloud:themeColor';

export function readThemeColor(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setThemeColor(color: string): void {
  try {
    localStorage.setItem(KEY, color);
  } catch {
    /* ignore */
  }
}

export function isPreset(color?: string | null): boolean {
  return !!color && THEME_PRESETS.some((p) => p.color === color);
}
