// Vitest 测试全局 setup 文件
// 见 .ai/TESTING.md §2 / §4
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// antd / ProLayout 用 window.matchMedia 做响应式检测；jsdom 没实现，mock 之
if (typeof window !== 'undefined' && !window.matchMedia) {
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
}

// ResizeObserver 一些 antd 组件用，jsdom 也没实现
if (typeof window !== 'undefined' && !window.ResizeObserver) {
  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    value: class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  });
}

// jsdom 25 不支持 `:has()` 等新选择器；antd/pro-components cssinjs 会生成
// `&:has(+ .ant-select-item-option-selected...)` 规则并做 selector 校验，
// 直接抛 SyntaxError 导致 ProTable 等页面整树崩进 ErrorBoundary。
// 这里仅吞掉“选择器语法不支持”的异常（样式在测试中本就无意义），其余照常抛。
function patchCssSyntaxError(name: string) {
  const original = (window as unknown as Record<string, unknown>)[name];
  if (typeof original !== 'function') return;
  (window as unknown as Record<string, unknown>)[name] = function (...args: unknown[]) {
    try {
      return (original as (...a: unknown[]) => unknown).apply(this, args);
    } catch (e) {
      if (e instanceof DOMException && e.name === 'SyntaxError') return null;
      throw e;
    }
  };
}

// CSSStyleSheet.insertRule / addRule：不支持的 selector 直接跳过（返回 0）
if (typeof CSSStyleSheet !== 'undefined' && CSSStyleSheet.prototype) {
  const origInsert = CSSStyleSheet.prototype.insertRule;
  CSSStyleSheet.prototype.insertRule = function (...args: [string, number?]) {
    try {
      return origInsert.apply(this, args);
    } catch (e) {
      if (e instanceof DOMException && e.name === 'SyntaxError') return 0;
      throw e;
    }
  };
  const origAdd = CSSStyleSheet.prototype.addRule;
  if (origAdd) {
    CSSStyleSheet.prototype.addRule = function (...args: [string, string?, number?]) {
      try {
        return origAdd.apply(this, args);
      } catch (e) {
        if (e instanceof DOMException && e.name === 'SyntaxError') return -1;
        throw e;
      }
    };
  }
}

// document.querySelector/querySelectorAll：不支持的选择器返回 null / []
if (typeof document !== 'undefined') {
  patchCssSyntaxError('querySelector');
  patchCssSyntaxError('querySelectorAll');
}

// rc-util 测滚动条宽度会带 pseudoElt 调 getComputedStyle，jsdom 打 "Not implemented" 噪音
// （ProTable 渲染必经路径）。带伪元素的调用返回空样式即可静默。
if (typeof window !== 'undefined' && 'getComputedStyle' in window) {
  const origGCS = window.getComputedStyle.bind(window);
  window.getComputedStyle = (elt: Element, pseudoElt?: string | null) => {
    if (pseudoElt) {
      const decl = { getPropertyValue: () => '' } as unknown as CSSStyleDeclaration;
      return decl;
    }
    return origGCS(elt);
  };
}

if (typeof Element !== 'undefined' && Element.prototype) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const proto = Element.prototype as unknown as Record<string, (...args: any[]) => any>;
  const wrap = (name: string, fallback: unknown) => {
    const original = proto[name];
    if (typeof original !== 'function') return;
    proto[name] = function (...args: never[]) {
      try {
        return original.apply(this, args);
      } catch (e) {
        if (e instanceof DOMException && e.name === 'SyntaxError') return fallback;
        throw e;
      }
    };
  };
  wrap('querySelector', null);
  wrap('querySelectorAll', []);
  wrap('matches', false);
  wrap('closest', null);
}

// 每个测试后自动 unmount 组件，避免状态污染
afterEach(() => {
  cleanup();
});

// —— core-web 全局默认适配器（2026-09 接入核心层）——
import { configureCore } from '@lieshoucloud/core-web';

configureCore({
  storage: {
    get: (k) => localStorage.getItem(k),
    set: (k, v) => localStorage.setItem(k, v),
    remove: (k) => localStorage.removeItem(k),
  },
  notifier: { success: () => {}, error: () => {} },
  navigation: { to: () => {}, replace: () => {} },
  api: {
    request: <T>(path: string): Promise<T> => {
      if (path.includes('/login'))
        return Promise.resolve({
          accessToken: 'access-x',
          refreshToken: 'refresh-x',
          expiresIn: 1800,
          tokenType: 'Bearer',
          userId: 42,
          username: 'futurewl',
          tenantCode: 'huntercat',
          tenantName: 't',
          tenantEdition: 'GENERIC',
          availableTenants: [],
        } as T);
      if (path.includes('/me'))
        return Promise.resolve({ userId: 42, username: 'futurewl', roles: ['USER'] } as T);
      if (path.includes('/refresh'))
        return Promise.resolve({
          accessToken: 'new-access',
          refreshToken: 'new-refresh',
          expiresIn: 1800,
          tokenType: 'Bearer',
          userId: 1,
          username: 'futurewl',
        } as T);
      return Promise.resolve({} as T);
    },
  },
});
