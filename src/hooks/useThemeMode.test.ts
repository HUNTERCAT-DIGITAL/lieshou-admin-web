/**
 * 主题 store + 解析逻辑测试.
 */
import { afterEach, describe, expect, it } from 'vitest';

import { useThemeStore } from '../stores/theme';
import type { ThemeMode } from '../stores/theme';

/** 复刻 useThemeMode 里的 resolveTheme 纯函数（避免在 jsdom 下引用 hook） */
function resolveTheme(mode: ThemeMode, systemDark: boolean): 'light' | 'dark' {
  if (mode === 'light') return 'light';
  if (mode === 'dark') return 'dark';
  return systemDark ? 'dark' : 'light';
}

describe('theme store', () => {
  afterEach(() => {
    localStorage.clear();
    useThemeStore.setState({ mode: 'system', resolved: 'light' });
  });

  it('默认 mode 是 system', () => {
    expect(useThemeStore.getState().mode).toBe('system');
  });

  it('setMode 写入 store', () => {
    useThemeStore.getState().setMode('dark');
    expect(useThemeStore.getState().mode).toBe('dark');
  });
});

describe('resolveTheme（mode + 系统偏好合并）', () => {
  it('mode=light → 永远 light（忽略系统）', () => {
    expect(resolveTheme('light', false)).toBe('light');
    expect(resolveTheme('light', true)).toBe('light');
  });

  it('mode=dark → 永远 dark（忽略系统）', () => {
    expect(resolveTheme('dark', false)).toBe('dark');
    expect(resolveTheme('dark', true)).toBe('dark');
  });

  it('mode=system → 跟随系统', () => {
    expect(resolveTheme('system', false)).toBe('light');
    expect(resolveTheme('system', true)).toBe('dark');
  });
});
