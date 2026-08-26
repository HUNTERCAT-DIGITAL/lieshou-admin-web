/**
 * 主题模式 hook（Phase 9 · 暗色主题）.
 *
 * - 返回 { mode, resolved, setMode }：mode 是用户偏好；resolved 是当前实际生效
 * - 监听 prefers-color-scheme 系统偏好，mode='system' 时自动同步
 */
import { useEffect } from 'react';

import { useThemeStore, type ResolvedTheme, type ThemeMode } from '../stores/theme';

const MQ = '(prefers-color-scheme: dark)';

/** 把 mode + 系统偏好合并为实际生效的主题 */
function resolveTheme(mode: ThemeMode, systemDark: boolean): ResolvedTheme {
  if (mode === 'light') return 'light';
  if (mode === 'dark') return 'dark';
  return systemDark ? 'dark' : 'light';
}

export function useThemeMode(): {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
} {
  const mode = useThemeStore((s) => s.mode);
  const resolved = useThemeStore((s) => s.resolved);
  const setMode = useThemeStore((s) => s.setMode);
  const setResolved = useThemeStore((s) => s.setResolved);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      // SSR / jsdom 无 matchMedia：按 light 处理
      setResolved('light');
      return;
    }
    const mql = window.matchMedia(MQ);
    const apply = () => setResolved(resolveTheme(mode, mql.matches));
    apply();
    // modern API
    if (mql.addEventListener) {
      mql.addEventListener('change', apply);
      return () => mql.removeEventListener('change', apply);
    }
    // legacy fallback（Safari < 14 等）
    mql.addListener(apply);
    return () => mql.removeListener(apply);
  }, [mode, setResolved]);

  return { mode, resolved, setMode };
}
