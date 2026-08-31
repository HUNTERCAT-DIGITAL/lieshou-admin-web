import React from 'react';
import ReactDOM from 'react-dom/client';

import { App as AntdApp, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

import { configureCore, useAuthStore } from '@lieshoucloud/core-web';
import {
  createApiClient,
  setAccessTokenProvider,
  setBaseUrl,
  setRefreshTokensProvider,
  setUnauthorizedHandler,
} from '@lieshoucloud/contract-api';

import App from './App';
import { getEdition } from './config/editions';
import './styles/global.css';

// —— contract-api 模块级单例配置（客户包 dwjk/api 等走模块级 request 需要；ApiPort 走实例不受影响）——
setBaseUrl('');
setAccessTokenProvider(() => useAuthStore.getState().accessToken);
setRefreshTokensProvider(async () => {
  try {
    await useAuthStore.getState().refresh();
    return true;
  } catch {
    return false;
  }
});
setUnauthorizedHandler(() => {
  useAuthStore.getState().logout();
});

// —— API 客户端（contract-api：token 注入 + 401 单飞刷新 + 会话过期兜底）——
const api = createApiClient({
  baseUrl: '',
  hooks: {
    getAccessToken: () => useAuthStore.getState().accessToken,
    refreshTokens: async () => {
      try {
        await useAuthStore.getState().refresh();
        return true;
      } catch {
        return false;
      }
    },
    onUnauthorized: () => {
      useAuthStore.getState().logout();
    },
  },
});

// —— 注入 core-web 端口（统一登录态/存储/通知/导航）——
configureCore({
  storage: {
    get: (k) => localStorage.getItem(k),
    set: (k, v) => localStorage.setItem(k, v),
    remove: (k) => localStorage.removeItem(k),
  },
  notifier: {
    // eslint-disable-next-line no-console -- 骨架无 UI 库，占位提示
    success: (m) => console.log('[notify]', m),
    error: (m) => console.error('[notify]', m),
  },
  navigation: {
    to: (p) => {
      window.location.href = p;
    },
    replace: (p) => {
      window.location.replace(p);
    },
  },
  // HTTP 传输：桥接 contract-api 实例（全路径透传 + skipAuth401/asBlob）
  api: {
    request: (path, init) => {
      const method = (init?.method ?? 'GET').toUpperCase() as
        | 'GET'
        | 'POST'
        | 'PUT'
        | 'DELETE'
        | 'PATCH';
      const body =
        typeof init?.body === 'string' ? (JSON.parse(init.body) as unknown) : init?.body;
      const skipAuth401 = (init as { skipAuth401?: boolean } | undefined)?.skipAuth401;
      const asBlob = (init as { asBlob?: boolean } | undefined)?.asBlob;
      return api.request({ method, path, body, skipAuth401, asBlob });
    },
  },
});

// core-web auth store：端口注入后显式恢复会话
void useAuthStore.persist.rehydrate();

// 运行时按版别设置文档标题
const edition = getEdition();
document.title = edition.brandName;

dayjs.locale('zh-cn');

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Missing #root mount element');

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <ConfigProvider
      locale={zhCN}
      theme={{ token: { colorPrimary: edition.primaryColor ?? '#1677ff' } }}
    >
      {/* antd App 上下文（2026-08-31：缺此包裹时 App.useApp() 的 messageApi 为空壳，
          新建规则等保存成功但提示/关闭中断 → 表现“保存没反应”） */}
      <AntdApp>
        <App />
      </AntdApp>
    </ConfigProvider>
  </React.StrictMode>,
);
