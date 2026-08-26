/**
 * NotFound / Forbidden 页面单测（Phase 9 · 覆盖率）.
 */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import Forbidden from '../Forbidden';
import NotFound from '../NotFound';

describe('NotFound', () => {
  it('渲染 404 + 跳转按钮', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>,
    );
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('页面不存在或已被移除。')).toBeInTheDocument();
    expect(screen.getByText('回到工作台')).toBeInTheDocument();
    expect(screen.getByText('返回上一页')).toBeInTheDocument();
  });
});

describe('Forbidden', () => {
  it('渲染 403 + 跳转按钮', () => {
    render(
      <MemoryRouter>
        <Forbidden />
      </MemoryRouter>,
    );
    expect(screen.getByText('403')).toBeInTheDocument();
    expect(screen.getByText(/没有权限/)).toBeInTheDocument();
    expect(screen.getByText('回到工作台')).toBeInTheDocument();
    expect(screen.getByText('返回上一页')).toBeInTheDocument();
  });
});
