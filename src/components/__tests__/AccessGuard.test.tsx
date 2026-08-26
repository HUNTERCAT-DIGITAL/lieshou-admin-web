import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import { useAuthStore } from '../../stores/auth';
import { AccessGuard } from '../AccessGuard';

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({
    accessToken: null,
    refreshToken: null,
    user: null,
    isAuthenticated: false,
  });
});

function renderWith(roles: string[]): void {
  useAuthStore.setState({
    accessToken: 't',
    refreshToken: 'r',
    user: { userId: 1, username: 'u', roles },
    isAuthenticated: true,
  });
  render(
    <MemoryRouter>
      <AccessGuard access="canManageTenant">
        <div>secret-content</div>
      </AccessGuard>
    </MemoryRouter>,
  );
}

describe('AccessGuard（路由级权限兜底）', () => {
  it('无权限 → 渲染 403 页，不渲染受保护内容', () => {
    renderWith(['USER']);
    expect(screen.getByText(/没有权限/)).toBeInTheDocument();
    expect(screen.queryByText('secret-content')).not.toBeInTheDocument();
  });

  it('有权限 → 渲染子内容', () => {
    renderWith(['PLATFORM_ADMIN']);
    expect(screen.getByText('secret-content')).toBeInTheDocument();
    expect(screen.queryByText(/没有权限/)).not.toBeInTheDocument();
  });
});
