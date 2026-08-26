import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ErrorBoundary } from '../ErrorBoundary';

afterEach(() => {
  vi.restoreAllMocks();
});

/** 正常子组件 */
function Normal() {
  return <div>normal-content</div>;
}

/** 渲染即抛错的子组件 */
function Bomb(): never {
  throw new Error('boom');
}

describe('ErrorBoundary', () => {
  it('子组件正常时正常渲染内容', () => {
    render(
      <ErrorBoundary>
        <Normal />
      </ErrorBoundary>,
    );
    expect(screen.getByText('normal-content')).toBeInTheDocument();
  });

  it('子组件抛错 → 展示 500 兜底页，不白屏', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );
    expect(screen.getByText('页面出错了')).toBeInTheDocument();
    expect(screen.getByText('boom')).toBeInTheDocument();
    expect(screen.queryByText('normal-content')).not.toBeInTheDocument();
  });
});
