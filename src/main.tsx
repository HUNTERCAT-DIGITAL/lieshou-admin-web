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
