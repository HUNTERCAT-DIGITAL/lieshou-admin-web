"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var antd_1 = require("antd");
var antd_2 = require("antd");
var zh_CN_1 = require("antd/locale/zh_CN");
var react_1 = require("react");
var client_1 = require("react-dom/client");
require("antd/dist/reset.css");
require("dayjs/locale/zh-cn");
var App_1 = require("./App");
var core_web_1 = require("@lieshoucloud/core-web");
var antd_3 = require("antd");
var api_1 = require("./services/api");
// —— 注入 core-web 端口（业务核心层 · 2026-09 试点）——
(0, core_web_1.configureCore)({
    storage: {
        get: function (k) { return localStorage.getItem(k); },
        set: function (k, v) { return localStorage.setItem(k, v); },
        remove: function (k) { return localStorage.removeItem(k); },
    },
    notifier: {
        success: function (m) { return antd_3.message.success(m); },
        error: function (m) { return antd_3.message.error(m); },
    },
    navigation: {
        to: function (p) { window.location.hash = p; },
        replace: function (p) { window.location.hash = p; },
    },
    api: {
        request: function (path, init) {
            var _a;
            var method = ((_a = init === null || init === void 0 ? void 0 : init.method) !== null && _a !== void 0 ? _a : 'GET').toUpperCase();
            var body = typeof (init === null || init === void 0 ? void 0 : init.body) === 'string' ? JSON.parse(init.body) : init === null || init === void 0 ? void 0 : init.body;
            switch (method) {
                case 'POST': return api_1.api.post(path, body);
                case 'PUT': return api_1.api.put(path, body);
                case 'PATCH': return api_1.api.patch(path, body);
                case 'DELETE': return api_1.api.delete(path);
                default: return api_1.api.get(path);
            }
        },
    },
});
var editions_1 = require("./config/editions");
var useThemeMode_1 = require("./hooks/useThemeMode");
/**
 * 主题包装层（Phase 9 · 暗色主题）.
 * 把 antd ConfigProvider 的 algorithm 与 ProLayout 的 navTheme 都接在同一个
 * useThemeMode（跟系统 + localStorage）下，避免两者不同步。
 */
function ThemedApp() {
    var resolved = (0, useThemeMode_1.useThemeMode)().resolved;
    var edition = (0, editions_1.getEdition)();
    // 品牌配置化（ADR-0035）：浏览器标题跟随版别 brandName，运行时覆盖 index.html 静态默认
    document.title = edition.brandName ? "".concat(edition.brandName, " \u00B7 \u730E\u624B\u4E91\u6570\u5B57\u5316\u5E73\u53F0") : '猎手云 · 数字化平台';
    return (<antd_2.ConfigProvider locale={zh_CN_1.default} theme={{
            algorithm: resolved === 'dark' ? antd_1.theme.darkAlgorithm : antd_1.theme.defaultAlgorithm,
            token: { colorPrimary: (0, editions_1.getEdition)().primaryColor },
        }}>
      <antd_2.App>
        <App_1.default />
      </antd_2.App>
    </antd_2.ConfigProvider>);
}
var rootEl = document.getElementById('root');
if (!rootEl)
    throw new Error('Missing #root mount element');
client_1.default.createRoot(rootEl).render(<react_1.default.StrictMode>
    <ThemedApp />
  </react_1.default.StrictMode>);
