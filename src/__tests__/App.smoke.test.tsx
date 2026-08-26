/**
 * App 入口 smoke 单测（Phase 9 · 覆盖率）.
 *
 * App.tsx 包了 ErrorBoundary + BrowserRouter，自身没逻辑；
 * 这里只验证它能渲染（不抛错）。
 */
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import App from '../App';

// matchMedia / ResizeObserver 已在 setup.ts 中 mock
describe('App', () => {
  it('挂载 ErrorBoundary + BrowserRouter 不抛错', () => {
    expect(() => render(<App />)).not.toThrow();
  });
});
