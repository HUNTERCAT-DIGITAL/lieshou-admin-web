"use strict";
/**
 * 前端统一错误类型与展示（L0-2 · Bottom-Up）.
 *
 * 自 2026-08 起错误类收敛到 @lieshoucloud/contract-api（共享包），本文件仅做 re-export，
 * 保证历史调用点（`import { ApiError } from '../utils/errors'`）零改动。
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthError = exports.isApiError = exports.getErrorMessage = exports.AuthError = exports.ApiError = void 0;
var contract_api_1 = require("@lieshoucloud/contract-api");
Object.defineProperty(exports, "ApiError", { enumerable: true, get: function () { return contract_api_1.ApiError; } });
Object.defineProperty(exports, "AuthError", { enumerable: true, get: function () { return contract_api_1.AuthError; } });
Object.defineProperty(exports, "getErrorMessage", { enumerable: true, get: function () { return contract_api_1.getErrorMessage; } });
Object.defineProperty(exports, "isApiError", { enumerable: true, get: function () { return contract_api_1.isApiError; } });
Object.defineProperty(exports, "isAuthError", { enumerable: true, get: function () { return contract_api_1.isAuthError; } });
