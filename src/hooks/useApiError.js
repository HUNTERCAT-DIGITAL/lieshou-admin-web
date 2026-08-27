"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useApiError = void 0;
/**
 * useApiError —— 页面统一错误提示 hook（L1-1 · Bottom-Up）.
 *
 * 实现已下沉到 @lieshoucloud/ui，本文件仅做 re-export，保证历史调用点
 * （`import { useApiError } from '../hooks/useApiError'`）零改动。
 */
var ui_1 = require("@lieshoucloud/ui");
Object.defineProperty(exports, "useApiError", { enumerable: true, get: function () { return ui_1.useApiError; } });
