import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HealthBadge } from '@lieshoucloud/ui';

// Phase 4 monorepo 升级后这个测试改为 import @lieshoucloud/ui 跨 workspace 包。
// 见 .ai/decisions/0012-monorepo-upgrade.md。
describe('HealthBadge (from @lieshoucloud/ui)', () => {
  it('status=up 时显示 UP 标签 + 绿色背景', () => {
    render(<HealthBadge status="up" />);
    const badge = screen.getByTestId('health-badge');
    expect(badge).toHaveTextContent('UP');
    expect(badge).toHaveStyle({ background: '#52c41a' });
  });

  it('status=down 时显示 DOWN 标签 + 红色背景', () => {
    render(<HealthBadge status="down" />);
    expect(screen.getByTestId('health-badge')).toHaveTextContent('DOWN');
  });

  it('status=degraded 时显示 DEGRADED 标签 + 黄色背景', () => {
    render(<HealthBadge status="degraded" />);
    expect(screen.getByTestId('health-badge')).toHaveTextContent('DEGRADED');
  });

  it('传入 serviceName 时会前缀在标签前', () => {
    render(<HealthBadge status="up" serviceName="user-service" />);
    expect(screen.getByTestId('health-badge')).toHaveTextContent('user-service: UP');
  });

  it('未传 serviceName 时不出现前缀冒号', () => {
    render(<HealthBadge status="up" />);
    expect(screen.getByTestId('health-badge').textContent).not.toMatch(/:\s/);
  });
});
