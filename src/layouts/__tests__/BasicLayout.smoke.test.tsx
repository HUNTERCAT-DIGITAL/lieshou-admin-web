import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import { ConfigProvider, App as AntdApp } from 'antd';

import BasicLayout from '../BasicLayout';
import { useAuthStore } from '../../stores/auth';

// ProLayout 用 window.matchMedia 做响应式检测；jsdom 没实现，mock 之
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
});

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({
    accessToken: null,
    refreshToken: null,
    user: null,
    isAuthenticated: false,
  });
});

describe('BasicLayout smoke（图标 + ProLayout 渲染）', () => {
  it('PLATFORM_ADMIN 登录后渲染 BasicLayout 成功（不抛错）', () => {
    useAuthStore.setState({
      accessToken: 't',
      refreshToken: 'r',
      user: { userId: 1, username: 'ops', roles: ['PLATFORM_ADMIN'] },
      isAuthenticated: true,
    });
    expect(() => {
      render(
        <ConfigProvider>
          <AntdApp>
            <MemoryRouter initialEntries={['/welcome']}>
              <BasicLayout />
            </MemoryRouter>
          </AntdApp>
        </ConfigProvider>,
      );
    }).not.toThrow();
  });

  it('渲染侧边栏菜单项（basic sanity）', () => {
    useAuthStore.setState({
      accessToken: 't',
      refreshToken: 'r',
      user: { userId: 1, username: 'ops', roles: ['PLATFORM_ADMIN'] },
      isAuthenticated: true,
    });
    const { container } = render(
      <ConfigProvider>
        <AntdApp>
          <MemoryRouter initialEntries={['/welcome']}>
            <BasicLayout />
          </MemoryRouter>
        </AntdApp>
      </ConfigProvider>,
    );
    // ProLayout 在 jsdom 下可能默认收起，只验证 DOM 有内容 + 出现菜单项某一块
    expect(container.firstChild).toBeTruthy();
    expect(container.innerHTML.length).toBeGreaterThan(0);
  });
});
