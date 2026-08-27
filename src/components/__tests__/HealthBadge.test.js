"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vitest_1 = require("vitest");
var react_1 = require("@testing-library/react");
var ui_1 = require("@lieshoucloud/ui");
// Phase 4 monorepo 升级后这个测试改为 import @lieshoucloud/ui 跨 workspace 包。
// 见 .ai/decisions/0012-monorepo-upgrade.md。
(0, vitest_1.describe)('HealthBadge (from @lieshoucloud/ui)', function () {
    (0, vitest_1.it)('status=up 时显示 UP 标签 + 绿色背景', function () {
        (0, react_1.render)(<ui_1.HealthBadge status="up"/>);
        var badge = react_1.screen.getByTestId('health-badge');
        (0, vitest_1.expect)(badge).toHaveTextContent('UP');
        (0, vitest_1.expect)(badge).toHaveStyle({ background: '#52c41a' });
    });
    (0, vitest_1.it)('status=down 时显示 DOWN 标签 + 红色背景', function () {
        (0, react_1.render)(<ui_1.HealthBadge status="down"/>);
        (0, vitest_1.expect)(react_1.screen.getByTestId('health-badge')).toHaveTextContent('DOWN');
    });
    (0, vitest_1.it)('status=degraded 时显示 DEGRADED 标签 + 黄色背景', function () {
        (0, react_1.render)(<ui_1.HealthBadge status="degraded"/>);
        (0, vitest_1.expect)(react_1.screen.getByTestId('health-badge')).toHaveTextContent('DEGRADED');
    });
    (0, vitest_1.it)('传入 serviceName 时会前缀在标签前', function () {
        (0, react_1.render)(<ui_1.HealthBadge status="up" serviceName="user-service"/>);
        (0, vitest_1.expect)(react_1.screen.getByTestId('health-badge')).toHaveTextContent('user-service: UP');
    });
    (0, vitest_1.it)('未传 serviceName 时不出现前缀冒号', function () {
        (0, react_1.render)(<ui_1.HealthBadge status="up"/>);
        (0, vitest_1.expect)(react_1.screen.getByTestId('health-badge').textContent).not.toMatch(/:\s/);
    });
});
