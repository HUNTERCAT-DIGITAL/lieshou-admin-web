/**
 * EditionGuard 单测：版别裁剪路由兜底（ADR-0035）.
 */
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { getEdition } from '../../config/editions';
import { EditionGuard } from '../EditionGuard';

vi.mock('../../config/editions', () => ({
  getEdition: vi.fn(),
  // 与真实实现同语义（配置层条件性隐藏）：非 eduTeacher 版别隐藏师资档案 /edu
  getEditionHiddenMenus: (edition: { hiddenMenus?: string[]; eduTeacher?: boolean }) => [
    ...(edition.hiddenMenus ?? []),
    ...(edition.eduTeacher ? [] : ['/edu']),
  ],
}));

const mockedGetEdition = vi.mocked(getEdition);

beforeEach(() => {
  vi.restoreAllMocks();
  mockedGetEdition.mockReturnValue({
    id: 'generic',
    brandName: 'test',
    slogan: '',
    heroDesc: '',
    logo: '',
    primaryColor: '#1677ff',
    defaultTenantCode: 'huntercat',
    allowRegister: true,
    industriesText: [],
    features: [],
    stats: [],
    faq: [],
    cta: { title: '', desc: '', buttonText: '' },
  });
});

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="*"
          element={
            <EditionGuard>
              <div>guard-content</div>
            </EditionGuard>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('EditionGuard（版别路由裁剪）', () => {
  it('generic 版不裁剪，任何路径都渲染内容', () => {
    renderAt('/customer/list');
    expect(screen.getByText('guard-content')).toBeTruthy();
  });

  it('dwjk 版命中隐藏前缀 → 渲染 404', () => {
    mockedGetEdition.mockReturnValue({
      id: 'dwjk',
      brandName: 'test',
      slogan: '',
      heroDesc: '',
      logo: '',
      primaryColor: '#1677ff',
      defaultTenantCode: 'dwjk',
      allowRegister: false,
      hiddenMenus: ['/customer', '/lead', '/inventory', '/finance', '/approval'],
      industriesText: [],
      features: [],
      stats: [],
      faq: [],
      cta: { title: '', desc: '', buttonText: '' },
    });
    renderAt('/customer/list');
    expect(screen.queryByText('guard-content')).toBeNull();
  });

  it('非 eduTeacher 版别命中 /edu 师资档案 → 渲染 404（zhiye 独有 · 配置层）', () => {
    renderAt('/edu/teacher/list');
    expect(screen.queryByText('guard-content')).toBeNull();
  });

  it('eduTeacher 版别（zhiye）访问 /edu → 正常渲染', () => {
    mockedGetEdition.mockReturnValue({
      id: 'zhiye',
      brandName: 'test',
      slogan: '',
      heroDesc: '',
      logo: '',
      primaryColor: '#13c2c2',
      defaultTenantCode: 'zhiye',
      allowRegister: true,
      eduTeacher: true,
      industriesText: [],
      features: [],
      stats: [],
      faq: [],
      cta: { title: '', desc: '', buttonText: '' },
    });
    renderAt('/edu/teacher/list');
    expect(screen.getByText('guard-content')).toBeTruthy();
  });

  it('dwjk 版未命中隐藏前缀（/iot）→ 正常渲染', () => {
    mockedGetEdition.mockReturnValue({
      id: 'dwjk',
      brandName: 'test',
      slogan: '',
      heroDesc: '',
      logo: '',
      primaryColor: '#1677ff',
      defaultTenantCode: 'dwjk',
      allowRegister: false,
      hiddenMenus: ['/customer', '/lead', '/inventory', '/finance', '/approval'],
      industriesText: [],
      features: [],
      stats: [],
      faq: [],
      cta: { title: '', desc: '', buttonText: '' },
    });
    renderAt('/iot/device/list');
    expect(screen.getByText('guard-content')).toBeTruthy();
  });
});
