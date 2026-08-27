import { theme } from 'antd';
import { App as AntdApp, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import React from 'react';
import ReactDOM from 'react-dom/client';
import 'antd/dist/reset.css';
import 'dayjs/locale/zh-cn';

import App from './App';
import { configureCore } from '@lieshoucloud/core-web';
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
      switch (method) {
        case 'POST': return api.post(path, body);
        case 'PUT': return api.put(path, body);
        case 'PATCH': return api.patch(path, body);
        case 'DELETE': return api.delete(path);
        default: return api.get(path);
      }
    },
  },
});
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
  document.title = edition.brandName ? `${edition.brandName} · 猎手云数字化平台` : '猎手云 · 数字化平台';
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
