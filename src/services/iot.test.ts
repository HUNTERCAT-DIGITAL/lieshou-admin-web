/**
 * IoT service wrapper 单测（ADR-0040 · Phase 2）.
 *
 * 验证 URL path / query string / body 透传正确（api 层本身有独立测试）。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiGet, apiPost, apiPut, apiPatch, apiDelete, apiPostForm } = vi.hoisted(() => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPut: vi.fn(),
  apiPatch: vi.fn(),
  apiDelete: vi.fn(),
  apiPostForm: vi.fn(),
}));

vi.mock('./api', () => ({
  api: {
    get: apiGet,
    post: apiPost,
    put: apiPut,
    patch: apiPatch,
    delete: apiDelete,
    postForm: apiPostForm,
  },
}));

import {
  addProductCommand,
  addProductProperty,
  ackIotAlert,
  countIotDevices,
  createIotDevice,
  createIotProduct,
  createIotRule,
  deleteIotDevice,
  deleteIotProduct,
  deleteIotRule,
  getIotDeviceDetail,
  getIotOverview,
  getIotTopo,
  getDeviceHealth,
  addIotTopoLink,
  removeIotTopoLink,
  saveIotTopoNodes,
  uploadDevicePhoto,
  deleteDevicePhoto,
  getIotProductDetail,
  listDeviceEvents,
  listDeviceHistory,
  listIotAlerts,
  listIotDevices,
  listIotProducts,
  listIotRules,
  removeProductCommand,
  removeProductProperty,
  sendDeviceCommand,
  setIotRuleEnabled,
  updateIotDevice,
  updateIotProduct,
  updateIotRule,
} from './iot';

beforeEach(() => {
  apiGet.mockReset();
  apiPost.mockReset();
  apiPut.mockReset();
  apiPatch.mockReset();
  apiDelete.mockReset();
  apiPostForm.mockReset();
});

describe('iot service · 产品物模型', () => {
  it('listIotProducts：无关键字不带 query', async () => {
    apiGet.mockResolvedValue([]);
    await listIotProducts();
    expect(apiGet).toHaveBeenCalledWith('/iot/products');
  });

  it('listIotProducts：关键字 encode 后拼接', async () => {
    apiGet.mockResolvedValue([]);
    await listIotProducts('温湿度 传感器');
    expect(apiGet).toHaveBeenCalledWith(
      '/iot/products?keyword=%E6%B8%A9%E6%B9%BF%E5%BA%A6%20%E4%BC%A0%E6%84%9F%E5%99%A8',
    );
  });

  it('createIotProduct：body 透传', async () => {
    apiPost.mockResolvedValue({ id: 1 });
    await createIotProduct({ name: '传感器', protocolType: 'BINARY_FRAME' });
    expect(apiPost).toHaveBeenCalledWith('/iot/products', {
      name: '传感器',
      protocolType: 'BINARY_FRAME',
    });
  });

  it('updateIotProduct：PUT 动态 id', async () => {
    apiPut.mockResolvedValue({ id: 3 });
    await updateIotProduct(3, { name: '改名', protocolType: 'HTTP' });
    expect(apiPut).toHaveBeenCalledWith('/iot/products/3', {
      name: '改名',
      protocolType: 'HTTP',
    });
  });

  it('getIotProductDetail / deleteIotProduct', async () => {
    apiGet.mockResolvedValue({ product: {}, properties: [], commands: [] });
    await getIotProductDetail(7);
    expect(apiGet).toHaveBeenCalledWith('/iot/products/7');
    apiDelete.mockResolvedValue(undefined);
    await deleteIotProduct(7);
    expect(apiDelete).toHaveBeenCalledWith('/iot/products/7');
  });

  it('addProductProperty / removeProductProperty / addProductCommand / removeProductCommand', async () => {
    apiPost.mockResolvedValue({ id: 1 });
    await addProductProperty(7, { name: 'temperature', label: '温度', dataType: 'NUMBER' });
    expect(apiPost).toHaveBeenCalledWith('/iot/products/7/properties', {
      name: 'temperature',
      label: '温度',
      dataType: 'NUMBER',
    });
    apiDelete.mockResolvedValue(undefined);
    await removeProductProperty(7, 9);
    expect(apiDelete).toHaveBeenCalledWith('/iot/products/7/properties/9');
    apiPost.mockResolvedValue({ id: 2 });
    await addProductCommand(7, { name: 'setThreshold', label: '设置阈值' });
    expect(apiPost).toHaveBeenCalledWith('/iot/products/7/commands', {
      name: 'setThreshold',
      label: '设置阈值',
    });
    apiDelete.mockResolvedValue(undefined);
    await removeProductCommand(7, 10);
    expect(apiDelete).toHaveBeenCalledWith('/iot/products/7/commands/10');
  });
});

describe('iot service · 设备', () => {
  it('listIotDevices：无参数不带 query', async () => {
    apiGet.mockResolvedValue([]);
    await listIotDevices();
    expect(apiGet).toHaveBeenCalledWith('/iot/devices');
  });

  it('listIotDevices：产品/状态/关键字拼接', async () => {
    apiGet.mockResolvedValue([]);
    await listIotDevices({ productId: 5, status: 'ONLINE', keyword: '车间' });
    expect(apiGet).toHaveBeenCalledWith(
      '/iot/devices?productId=5&status=ONLINE&keyword=%E8%BD%A6%E9%97%B4',
    );
  });

  it('countIotDevices / createIotDevice / deleteIotDevice / getIotDeviceDetail', async () => {
    apiGet.mockResolvedValue({ total: 3, online: 1 });
    await countIotDevices();
    expect(apiGet).toHaveBeenCalledWith('/iot/devices/count');
    apiPost.mockResolvedValue({ id: 1, deviceKey: 'dev_abc', deviceSecret: 'sec' });
    await createIotDevice({ name: '设备1', productId: 5 });
    expect(apiPost).toHaveBeenCalledWith('/iot/devices', { name: '设备1', productId: 5 });
    apiDelete.mockResolvedValue(undefined);
    await deleteIotDevice(2);
    expect(apiDelete).toHaveBeenCalledWith('/iot/devices/2');
    apiGet.mockResolvedValue({ device: {}, shadow: {} });
    await getIotDeviceDetail(2);
    expect(apiGet).toHaveBeenCalledWith('/iot/devices/2');
  });

  it('updateIotDevice：PUT 动态 id', async () => {
    apiPut.mockResolvedValue({ id: 2 });
    await updateIotDevice(2, { name: '新名', productId: 5 });
    expect(apiPut).toHaveBeenCalledWith('/iot/devices/2', { name: '新名', productId: 5 });
  });

  it('listDeviceHistory：days 默认 1，propertyKey 可选', async () => {
    apiGet.mockResolvedValue([]);
    await listDeviceHistory(2);
    expect(apiGet).toHaveBeenCalledWith('/iot/devices/2/history?days=1');
    await listDeviceHistory(2, 'temperature', 7);
    expect(apiGet).toHaveBeenCalledWith('/iot/devices/2/history?days=7&propertyKey=temperature');
  });

  it('listDeviceEvents：days 参数', async () => {
    apiGet.mockResolvedValue([]);
    await listDeviceEvents(2, 3);
    expect(apiGet).toHaveBeenCalledWith('/iot/devices/2/events?days=3');
  });

  it('sendDeviceCommand：body 含 command + params', async () => {
    apiPost.mockResolvedValue({ sent: true, message: 'ok' });
    await sendDeviceCommand(2, 'setThreshold', { threshold: 30 });
    expect(apiPost).toHaveBeenCalledWith('/iot/devices/2/commands', {
      command: 'setThreshold',
      params: { threshold: 30 },
    });
  });
  it('uploadDevicePhoto：FormData multipart 到 /devices/{id}/photo', async () => {
    apiPostForm.mockResolvedValue({ photoUrl: '/api/iot/photos/2/3/abc.jpg' });
    const file = new File(['x'], 'a.jpg', { type: 'image/jpeg' });
    await uploadDevicePhoto(3, file);
    expect(apiPostForm).toHaveBeenCalledTimes(1);
    const [path, form] = apiPostForm.mock.calls[0] as [string, FormData];
    expect(path).toBe('/iot/devices/3/photo');
    expect(form.get('file')).toBe(file);
  });

  it('deleteDevicePhoto：DELETE /devices/{id}/photo', async () => {
    apiDelete.mockResolvedValue({ removed: 3 });
    await deleteDevicePhoto(3);
    expect(apiDelete).toHaveBeenCalledWith('/iot/devices/3/photo');
  });

  it('getDeviceHealth：GET /iot/devices/health', async () => {
    apiGet.mockResolvedValue({ devices: [] });
    await getDeviceHealth();
    expect(apiGet).toHaveBeenCalledWith('/iot/devices/health');
  });

  it('getIotOverview：GET /iot/devices/overview', async () => {
    apiGet.mockResolvedValue({
      deviceCount: { total: 1, online: 1, offline: 0 },
      alertsToday: 0,
      pendingAlerts: 0,
      maxTemperature: { deviceId: 1, name: 'x', value: 30 },
      offlineDevices: [],
      alertDevices: [],
    });
    await getIotOverview();
    expect(apiGet).toHaveBeenCalledWith('/iot/devices/overview');
  });

  it('getIotTopo / saveIotTopoNodes / addIotTopoLink / removeIotTopoLink', async () => {
    apiGet.mockResolvedValue({ nodes: [], links: [] });
    await getIotTopo();
    expect(apiGet).toHaveBeenCalledWith('/iot/topo');

    apiPut.mockResolvedValue({ saved: 2 });
    await saveIotTopoNodes([
      { deviceId: 1, x: 20, y: 30 },
      { deviceId: 2, x: 80, y: 60 },
    ]);
    expect(apiPut).toHaveBeenCalledWith('/iot/topo/nodes', [
      { deviceId: 1, x: 20, y: 30 },
      { deviceId: 2, x: 80, y: 60 },
    ]);

    apiPost.mockResolvedValue({ id: 1 });
    await addIotTopoLink(1, 2);
    expect(apiPost).toHaveBeenCalledWith('/iot/topo/links', { source: 1, target: 2 });

    apiDelete.mockResolvedValue({ deleted: 1 });
    await removeIotTopoLink(1, 2);
    expect(apiDelete).toHaveBeenCalledWith('/iot/topo/links?source=1&target=2');
  });

  it('listIotAlerts：过滤参数拼接', async () => {
    apiGet.mockResolvedValue([]);
    await listIotAlerts({ status: 'PENDING', severity: 'CRITICAL', days: 7 });
    expect(apiGet).toHaveBeenCalledWith('/iot/alerts?status=PENDING&severity=CRITICAL&days=7');
    await listIotAlerts();
    expect(apiGet).toHaveBeenCalledWith('/iot/alerts');
  });

  it('ackIotAlert：PATCH 到 /ack 带备注', async () => {
    apiPatch.mockResolvedValue({ id: 3, status: 'ACKNOWLEDGED' });
    await ackIotAlert(3, '现场已处理');
    expect(apiPatch).toHaveBeenCalledWith('/iot/alerts/3/ack', { remark: '现场已处理' });
  });
});

describe('iot service · 规则', () => {
  it('listIotRules / createIotRule / updateIotRule / deleteIotRule', async () => {
    apiGet.mockResolvedValue([]);
    await listIotRules();
    expect(apiGet).toHaveBeenCalledWith('/iot/rules');

    const body = {
      name: '温度过高告警',
      triggerType: 'PROPERTY' as const,
      productId: 5,
      propertyKey: 'temperature',
      operator: 'GT',
      threshold: '30',
      windowSec: 0,
      actionsJson: '[{"type":"COMMAND","command":"setThreshold"}]',
    };
    apiPost.mockResolvedValue({ id: 1 });
    await createIotRule(body);
    expect(apiPost).toHaveBeenCalledWith('/iot/rules', body);

    apiPut.mockResolvedValue({ id: 1 });
    await updateIotRule(1, body);
    expect(apiPut).toHaveBeenCalledWith('/iot/rules/1', body);

    apiDelete.mockResolvedValue(undefined);
    await deleteIotRule(1);
    expect(apiDelete).toHaveBeenCalledWith('/iot/rules/1');
  });

  it('setIotRuleEnabled：PATCH 到 /enabled', async () => {
    apiPatch.mockResolvedValue({ id: 1, enabled: false });
    await setIotRuleEnabled(1, false);
    expect(apiPatch).toHaveBeenCalledWith('/iot/rules/1/enabled', { enabled: false });
  });
});
