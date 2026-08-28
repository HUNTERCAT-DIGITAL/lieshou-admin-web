/**
 * 认证 API service —— 2026-10 上收 lieshou-core-web（业务逻辑唯一源）.
 * 本文件保留导出路径兼容既有页面/测试（实现已移至 core-web）。
 */
export {
  login,
  refreshTokens,
  fetchCurrentUser,
  switchTenant,
  sendCode,
  loginWithCode,
  register,
  resetPassword,
  oauthProviders,
  oauthAuthorize,
  oauthToken,
  type CodeChannel,
  type CodePurpose,
  type OAuthProvider,
  type OAuthAuthorizeResult,
  type OAuthTokenResult,
  type SecureSession,
} from '@lieshoucloud/core-web';

export type { TokenResponse, CurrentUser, LoginRequest } from '@lieshoucloud/contract-types/business/auth';

export { AuthError } from '../utils/errors';
