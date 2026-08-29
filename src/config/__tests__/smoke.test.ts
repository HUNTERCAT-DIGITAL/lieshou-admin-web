/**
 * 冒烟测试：验证测试链路 + editions 装配 + 版本常量解析
 */
import { describe, expect, it } from 'vitest';

import { getEdition } from '../editions';
import { APP_VERSION } from '../version';

describe('冒烟', () => {
  it('版本常量可解析', () => {
    expect(APP_VERSION).toBe('0.0.1');
  });

  it('getEdition 返回 generic 版别配置', () => {
    const e = getEdition();
    expect(e.id).toBe('generic');
    // brandName 可能被客户 extra.ts 叠加（客户仓环境），只锁「非空」不锁具体值
    expect(typeof e.brandName).toBe('string');
    expect(e.brandName.length).toBeGreaterThan(0);
    expect(e.login?.required).toBe(true);
  });
});
