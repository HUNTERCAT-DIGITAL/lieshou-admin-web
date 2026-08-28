/**
 * 审计日志 service 单测（ADR-0030 · 2026-10 上收 core-web 后测 ApiPort 传输）.
 *
 * services/audit.ts 为 core-web 薄 re-export，实现走 requestApi → 注入的 ApiPort。
 * 注入 portRequest spy，验证 URL path / query 透传（全路径带 /api 前缀）。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { configureCore } from '@lieshoucloud/core-web';

const { portRequest } = vi.hoisted(() => ({
  portRequest: vi.fn(),
}));

import { countAuditLogs, listAuditLogs } from './audit';

beforeEach(() => {
  portRequest.mockReset();
  configureCore({
    storage: { get: () => null, set: () => {}, remove: () => {} },
    notifier: { success: () => {}, error: () => {} },
    navigation: { to: () => {}, replace: () => {} },
    api: { request: portRequest },
  });
});

describe('audit service（core-web 上收 · ApiPort 传输）', () => {
  it('listAuditLogs 无参数 → GET /api/audit-logs', async () => {
    portRequest.mockResolvedValue([]);
    await listAuditLogs();
    expect(portRequest).toHaveBeenCalledWith('/api/audit-logs', undefined);
  });

  it('listAuditLogs 带 action/resourceType/limit → query string', async () => {
    portRequest.mockResolvedValue([]);
    await listAuditLogs({ action: 'LOGIN', resourceType: 'USER', limit: 50 });
    expect(portRequest).toHaveBeenCalledWith(
      '/api/audit-logs?action=LOGIN&resourceType=USER&limit=50',
      undefined,
    );
  });

  it('countAuditLogs → GET /api/audit-logs/count', async () => {
    portRequest.mockResolvedValue(7);
    await expect(countAuditLogs()).resolves.toBe(7);
    expect(portRequest).toHaveBeenCalledWith('/api/audit-logs/count', undefined);
  });
});
