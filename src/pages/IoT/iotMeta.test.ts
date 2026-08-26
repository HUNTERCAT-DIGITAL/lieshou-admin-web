/**
 * IoT 纯函数单测（ADR-0040 · Phase 2 管理页）.
 *
 * types/iot.ts 的解析/格式化函数 + Rules 页的条件/动作摘要。
 */
import { describe, expect, it } from 'vitest';

import {
  formatShadowValue,
  isNodeTemperatureKey,
  nodeIdOfKey,
  parseRuleActions,
  temperatureLevel,
  type IotRule,
} from '@lieshoucloud/types/business/iot';
import { ruleActionSummary, ruleConditionSummary, parseRuleConditions } from './Rules';
import { toLinePoints } from './LineChart';
import { mergePositions } from './Topo';

describe('parseRuleActions', () => {
  it('解析合法动作数组', () => {
    const actions = parseRuleActions(
      '[{"type":"COMMAND","command":"setThreshold","params":{"threshold":30}},{"type":"WEBHOOK","url":"https://x.com/hook"}]',
    );
    expect(actions).toHaveLength(2);
    expect(actions[0]).toMatchObject({ type: 'COMMAND', command: 'setThreshold' });
    expect(actions[1]).toMatchObject({ type: 'WEBHOOK', url: 'https://x.com/hook' });
  });

  it('坏 JSON / 非数组 / 空串 → 空数组', () => {
    expect(parseRuleActions('not json')).toEqual([]);
    expect(parseRuleActions('{"type":"COMMAND"}')).toEqual([]);
    expect(parseRuleActions('')).toEqual([]);
    expect(parseRuleActions(null)).toEqual([]);
    expect(parseRuleActions(undefined)).toEqual([]);
  });
});

describe('节点温度 key（GJXA 线缆）', () => {
  it('isNodeTemperatureKey：识别 node{n}_temperature', () => {
    expect(isNodeTemperatureKey('node1_temperature')).toBe(true);
    expect(isNodeTemperatureKey('node12_temperature')).toBe(true);
    expect(isNodeTemperatureKey('node1_battery')).toBe(false);
    expect(isNodeTemperatureKey('temperature')).toBe(false);
    expect(isNodeTemperatureKey('ultrasonic_avg')).toBe(false);
  });

  it('nodeIdOfKey：提取节点号，非节点 key 返回 null', () => {
    expect(nodeIdOfKey('node2_temperature')).toBe(2);
    expect(nodeIdOfKey('node12_temperature')).toBe(12);
    expect(nodeIdOfKey('node1_battery')).toBeNull();
    expect(nodeIdOfKey('temperature')).toBeNull();
  });
});

describe('temperatureLevel（节点温度分级：≥70 告警红 / ≥50 预警橙 / 正常蓝）', () => {
  it('分级边界', () => {
    expect(temperatureLevel(70)).toBe('alert');
    expect(temperatureLevel(69.9)).toBe('warn');
    expect(temperatureLevel(50)).toBe('warn');
    expect(temperatureLevel(49.9)).toBe('ok');
    expect(temperatureLevel(-10)).toBe('ok');
  });
});

describe('formatShadowValue', () => {
  it('基础类型原样展示', () => {
    expect(formatShadowValue(23.5)).toBe('23.5');
    expect(formatShadowValue(true)).toBe('true');
    expect(formatShadowValue('ok')).toBe('ok');
  });

  it('对象/数组 JSON 化；null/undefined 显示占位', () => {
    expect(formatShadowValue({ a: 1 })).toBe('{"a":1}');
    expect(formatShadowValue([1, 2])).toBe('[1,2]');
    expect(formatShadowValue(null)).toBe('—');
    expect(formatShadowValue(undefined)).toBe('—');
  });
});

describe('toLinePoints（时序记录 → 折线数据点）', () => {
  it('仅保留数值 + 合法时间戳，按上报顺序输出', () => {
    const points = toLinePoints([
      { valueStr: '23.5', reportedAt: '2026-08-24T10:00:00Z' },
      { valueStr: 'abc', reportedAt: '2026-08-24T10:00:01Z' },
      { valueStr: '-10', reportedAt: '2026-08-24T10:00:02Z' },
    ]);
    expect(points).toHaveLength(2);
    expect(points[0]).toMatchObject({ value: 23.5 });
    expect(points[1]).toMatchObject({ value: -10 });
    expect(points[0].ts).toBeGreaterThan(0);
    expect(points[0].label).toBeTruthy();
  });

  it('空数组 / 全非法 → 空', () => {
    expect(toLinePoints([])).toEqual([]);
    expect(toLinePoints([{ valueStr: 'x', reportedAt: 'bad' }])).toEqual([]);
  });
});

describe('mergePositions（拓扑坐标合并：已存 + 环形自动布局）', () => {
  it('已保存坐标原样保留，未保存设备环形分布', () => {
    const devices = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const pos = mergePositions(devices, [{ deviceId: 1, x: 20, y: 30 }]);
    expect(pos[1]).toEqual({ x: 20, y: 30 });
    expect(pos[2]).toBeDefined();
    expect(pos[3]).toBeDefined();
    // 环形对称：设备 2、3 关于中心 x=50 对称
    expect(Math.abs(pos[2].x - 50)).toBeCloseTo(Math.abs(pos[3].x - 50), 5);
  });

  it('空设备 / 全部已存 → 无环形补充', () => {
    expect(mergePositions([], [])).toEqual({});
    const pos = mergePositions([{ id: 1 }], [{ deviceId: 1, x: 5, y: 5 }]);
    expect(pos).toEqual({ 1: { x: 5, y: 5 } });
  });
});

describe('ruleConditionSummary', () => {
  const base: IotRule = {
    id: 1,
    tenantId: 1,
    name: 'r',
    enabled: true,
    triggerType: 'PROPERTY',
    productId: 1,
    actionsJson: '[]',
    createdAt: '2026-08-24T00:00:00Z',
  };

  it('属性阈值：key + 操作符 + 阈值', () => {
    expect(
      ruleConditionSummary({
        ...base,
        propertyKey: 'temperature',
        operator: 'GT',
        threshold: '30',
      }),
    ).toBe('temperature > 30');
  });

  it('未知操作符兜底', () => {
    expect(
      ruleConditionSummary({ ...base, propertyKey: 'x', operator: '??', threshold: '1' }),
    ).toBe('x ?? 1');
  });

  it('事件触发：事件 Key', () => {
    expect(ruleConditionSummary({ ...base, triggerType: 'EVENT', eventKey: 'alarm' })).toBe(
      '事件 alarm',
    );
  });

  it('多条件组合：AND 用「同时」连接', () => {
    expect(
      ruleConditionSummary({
        ...base,
        conditionsJson:
          '[{"key":"node*_temperature","operator":"GT","threshold":"70"},{"key":"node*_voltage","operator":"LT","threshold":"3.0"}]',
        conditionLogic: 'AND',
      }),
    ).toBe('node*_temperature > 70 同时 node*_voltage < 3.0');
  });

  it('多条件组合：OR 用「任一」连接', () => {
    expect(
      ruleConditionSummary({
        ...base,
        conditionsJson:
          '[{"key":"a","operator":"GT","threshold":"1"},{"key":"b","operator":"LT","threshold":"2"}]',
        conditionLogic: 'OR',
      }),
    ).toBe('a > 1 任一 b < 2');
  });

  it('无 conditionsJson 回退单条件（存量规则兼容）', () => {
    expect(
      ruleConditionSummary({ ...base, propertyKey: 'temperature', operator: 'GT', threshold: '70' }),
    ).toBe('temperature > 70');
  });

  it('parseRuleConditions：conditionsJson 优先，坏 JSON/空回退单条件', () => {
    expect(
      parseRuleConditions({
        conditionsJson:
          '[{"key":"node*_temperature","operator":"GT","threshold":"70"},{"key":"node*_voltage","operator":"LT","threshold":"3.0"}]',
        propertyKey: 'temperature',
        operator: 'GT',
        threshold: '30',
      }),
    ).toHaveLength(2);
    expect(
      parseRuleConditions({ conditionsJson: 'not-json', propertyKey: 'temperature', operator: 'GT', threshold: '30' }),
    ).toEqual([{ key: 'temperature', operator: 'GT', threshold: '30' }]);
    expect(
      parseRuleConditions({ conditionsJson: null, propertyKey: 'temperature', operator: 'GT', threshold: '30' }),
    ).toEqual([{ key: 'temperature', operator: 'GT', threshold: '30' }]);
  });
});

describe('ruleActionSummary', () => {
  it('多种动作拼接；空数组占位', () => {
    expect(
      ruleActionSummary([
        { type: 'COMMAND', command: 'setThreshold' },
        { type: 'WEBHOOK', url: 'https://x.com/hook' },
        { type: 'NOTIFY', message: '温度过高' },
      ]),
    ).toBe('下发命令 setThreshold；Webhook https://x.com/hook；通知：温度过高');
    expect(ruleActionSummary([])).toBe('—');
  });
});
