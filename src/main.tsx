import { theme } from 'antd';
import { App as AntdApp, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import React from 'react';
import ReactDOM from 'react-dom/client';
import 'antd/dist/reset.css';
import 'dayjs/locale/zh-cn';

import App from './App';
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
