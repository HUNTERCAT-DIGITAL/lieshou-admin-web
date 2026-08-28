import { theme } from 'antd';
import { App as AntdApp, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import React from 'react';
import ReactDOM from 'react-dom/client';
import 'antd/dist/reset.css';
import 'dayjs/locale/zh-cn';

import App from './App';
import { configureCore, useAuthStore } from '@lieshoucloud/core-web';
import { message } from 'antd';
import { api } from './services/api';

// —— 注入 core-web 端口（业务核心层 · 2026-09 试点）——
configureCore({
  storage: {
    get: (k) => localStorage.getItem(k),
    set: (k, v) => localStorage.setItem(k, v),
    remove: (k) => localStorage.removeItem(k),
  },
  notifier: {
    success: (m) => message.success(m),
    error: (m) => message.error(m),
  },
  navigation: {
    to: (p) => { window.location.hash = p; },
    replace: (p) => { window.location.hash = p; },
  },
  api: {
    request: (path, init) => {
      const method = (init?.method ?? 'GET').toUpperCase();
      const body = typeof init?.body === 'string' ? (JSON.parse(init.body) as unknown) : init?.body;
      // core-web 业务核心走全路径（含 /api 前缀，与 contract-api 契约一致）；
      // 本薄壳 services 走相对路径（由下方 createApiClient baseUrl=/api 补全）。
      // 桥接层归一：全路径已带 /api 时不再叠加，避免 /api/api/auth/login 双写。
      const p = path.startsWith('/api/') ? path.slice(4) : path;
      // 透传 skipAuth401:登录/注册等认证接口的 401 不走会话过期拦截（由 contract-api 支持）
      const skipAuth401 = (init as { skipAuth401?: boolean } | undefined)?.skipAuth401;
      // 透传 asBlob:文件下载/预览（由 contract-api 返回 Blob,自动带 Authorization）
      const asBlob = (init as { asBlob?: boolean } | undefined)?.asBlob;
      return (api as unknown as {
        request<T>(o: { method: string; path: string; body?: unknown; skipAuth401?: boolean; asBlob?: boolean }): Promise<T>;
      }).request({ method, path: p, body, skipAuth401, asBlob });
    },
  },
});
// core-web auth store 采用 skipHydration（端口注入后显式恢复会话，2026-09 正本清源）
void useAuthStore.persist.rehydrate();
import { getEdition } from './config/editions';
import { useThemeMode } from './hooks/useThemeMode';

/**
 * 主题包装层（Phase 9 · 暗色主题）.
 * 把 antd ConfigProvider 的 algorithm 与 ProLayout 的 navTheme 都接在同一个
 * useThemeMode（跟系统 + localStorage）下，避免两者不同步。
 */
function ThemedApp(): React.JSX.Element {
  const { resolved } = useThemeMode();
  const edition = getEdition();
  // 品牌配置化（ADR-0035）：浏览器标题跟随版别 brandName，运行时覆盖 index.html 静态默认
  document.title = edition.brandName || '数字化平台';
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: resolved === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: { colorPrimary: getEdition().primaryColor },
      }}
    >
      <AntdApp>
        <App />
      </AntdApp>
    </ConfigProvider>
  );
}

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Missing #root mount element');
ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <ThemedApp />
  </React.StrictMode>,
);
