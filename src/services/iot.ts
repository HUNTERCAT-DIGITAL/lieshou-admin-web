/**
 * 物联网 API service（ADR-0040 · iot-service，走统一 api 封装 · Phase 2 管理页）.
 *
 * 路径前缀 /iot/... → gateway iot-route → lieshoucloud-iot（/api/iot/**）。
 */
import { api } from './api';
import type {
  CreateIotDeviceRequest,
  CreateIotProductRequest,
  CreateIotRuleRequest,
  CreateProductCommandRequest,
  CreateProductPropertyRequest,
  DeviceDetail,
  DeviceEventRecord,
  DeviceHealth,
  DevicePropertyRecord,
  IotAlert,
  IotDevice,
  IotOverview,
  IotProduct,
  IotRule,
  IotTopo,
  ProductCommand,
  ProductDetail,
  ProductProperty,
  TopoNodePosition,
} from '@lieshoucloud/types/business/iot';

// ────────────────────────── 产品物模型 ──────────────────────────

/** GET /api/iot/products — 租户内产品列表（可选关键字） */
export async function listIotProducts(keyword?: string): Promise<IotProduct[]> {
  const qs = keyword ? `?keyword=${encodeURIComponent(keyword)}` : '';
  return api.get<IotProduct[]>(`/iot/products${qs}`);
}

/** POST /api/iot/products — 创建产品 */
export async function createIotProduct(body: CreateIotProductRequest): Promise<IotProduct> {
  return api.post<IotProduct>('/iot/products', body);
}

/** PUT /api/iot/products/{id} — 更新产品 */
export async function updateIotProduct(
  id: number,
  body: CreateIotProductRequest,
): Promise<IotProduct> {
  return api.put<IotProduct>(`/iot/products/${id}`, body);
}

/** GET /api/iot/products/{id} — 产品详情（含属性 + 命令定义） */
export async function getIotProductDetail(id: number): Promise<ProductDetail> {
  return api.get<ProductDetail>(`/iot/products/${id}`);
}

/** DELETE /api/iot/products/{id} — 删除产品（有设备的产品后端会拒） */
export async function deleteIotProduct(id: number): Promise<void> {
  return api.delete<void>(`/iot/products/${id}`);
}

/** POST /api/iot/products/{productId}/properties — 添加属性定义 */
export async function addProductProperty(
  productId: number,
  body: CreateProductPropertyRequest,
): Promise<ProductProperty> {
  return api.post<ProductProperty>(`/iot/products/${productId}/properties`, body);
}

/** DELETE /api/iot/products/{productId}/properties/{propertyId} */
export async function removeProductProperty(productId: number, propertyId: number): Promise<void> {
  return api.delete<void>(`/iot/products/${productId}/properties/${propertyId}`);
}

/** POST /api/iot/products/{productId}/commands — 添加命令定义 */
export async function addProductCommand(
  productId: number,
  body: CreateProductCommandRequest,
): Promise<ProductCommand> {
  return api.post<ProductCommand>(`/iot/products/${productId}/commands`, body);
}

/** DELETE /api/iot/products/{productId}/commands/{commandId} */
export async function removeProductCommand(productId: number, commandId: number): Promise<void> {
  return api.delete<void>(`/iot/products/${productId}/commands/${commandId}`);
}

// ────────────────────────── 设备 ──────────────────────────

/** GET /api/iot/devices — 租户内设备列表（产品/状态/关键字过滤） */
export async function listIotDevices(params?: {
  productId?: number;
  status?: string;
  keyword?: string;
}): Promise<IotDevice[]> {
  const qs = new URLSearchParams();
  if (params?.productId) qs.set('productId', String(params.productId));
  if (params?.status) qs.set('status', params.status);
  if (params?.keyword) qs.set('keyword', params.keyword);
  const s = qs.toString();
  return api.get<IotDevice[]>(`/iot/devices${s ? `?${s}` : ''}`);
}

/** GET /api/iot/devices/count — 设备数量统计（总 + 在线） */
export async function countIotDevices(): Promise<{ total: number; online: number }> {
  return api.get<{ total: number; online: number }>('/iot/devices/count');
}

/** GET /api/iot/devices/health — 设备健康聚合（局放/电池/信号/最热节点 · 驾驶舱用） */
export async function getDeviceHealth(): Promise<{ devices: DeviceHealth[] }> {
  return api.get<{ devices: DeviceHealth[] }>('/iot/devices/health');
}

/** GET /api/iot/devices/overview — 监控总览（统计 + 最高温度 + 离线/告警设备） */
export async function getIotOverview(): Promise<IotOverview> {
  return api.get<IotOverview>('/iot/devices/overview');
}

/** POST /api/iot/devices — 创建设备（后端自动生成 deviceKey/deviceSecret） */
export async function createIotDevice(body: CreateIotDeviceRequest): Promise<IotDevice> {
  return api.post<IotDevice>('/iot/devices', body);
}

/** PUT /api/iot/devices/{id} — 更新设备（名称/分组/标签/备注） */
export async function updateIotDevice(
  id: number,
  body: CreateIotDeviceRequest,
): Promise<IotDevice> {
  return api.put<IotDevice>(`/iot/devices/${id}`, body);
}

/** DELETE /api/iot/devices/{id} */
export async function deleteIotDevice(id: number): Promise<void> {
  return api.delete<void>(`/iot/devices/${id}`);
}

/** GET /api/iot/devices/{id} — 设备详情（含影子快照） */
export async function getIotDeviceDetail(id: number): Promise<DeviceDetail> {
  return api.get<DeviceDetail>(`/iot/devices/${id}`);
}

/** GET /api/iot/devices/{id}/history — 属性时序（propertyKey 可选；days 默认 1） */
export async function listDeviceHistory(
  id: number,
  propertyKey?: string,
  days = 1,
): Promise<DevicePropertyRecord[]> {
  const qs = new URLSearchParams({ days: String(days) });
  if (propertyKey) qs.set('propertyKey', propertyKey);
  return api.get<DevicePropertyRecord[]>(`/iot/devices/${id}/history?${qs.toString()}`);
}

/** GET /api/iot/devices/{id}/events — 设备事件（days 默认 1） */
export async function listDeviceEvents(id: number, days = 1): Promise<DeviceEventRecord[]> {
  return api.get<DeviceEventRecord[]>(`/iot/devices/${id}/events?days=${days}`);
}

/** POST /api/iot/devices/{id}/commands — 手动下发命令（经 device-gateway 写设备会话） */
export async function sendDeviceCommand(
  id: number,
  command: string,
  params?: Record<string, unknown>,
): Promise<{ sent: boolean; message: string }> {
  return api.post<{ sent: boolean; message: string }>(`/iot/devices/${id}/commands`, {
    command,
    params: params ?? {},
  });
}

/** POST /api/iot/devices/{id}/photo — 上传设备照片（multipart，≤5MB image/*） */
export async function uploadDevicePhoto(id: number, file: File): Promise<{ photoUrl: string }> {
  const form = new FormData();
  form.append('file', file);
  return api.postForm<{ photoUrl: string }>(`/iot/devices/${id}/photo`, form);
}

/** DELETE /api/iot/devices/{id}/photo — 删除设备照片（清 URL + 删文件） */
export async function deleteDevicePhoto(id: number): Promise<{ removed: number }> {
  return api.delete<{ removed: number }>(`/iot/devices/${id}/photo`);
}

// ────────────────────────── 规则 ──────────────────────────

/** GET /api/iot/rules — 租户内规则列表 */
export async function listIotRules(): Promise<IotRule[]> {
  return api.get<IotRule[]>('/iot/rules');
}

/** POST /api/iot/rules — 创建规则 */
export async function createIotRule(body: CreateIotRuleRequest): Promise<IotRule> {
  return api.post<IotRule>('/iot/rules', body);
}

/** PUT /api/iot/rules/{id} — 更新规则 */
export async function updateIotRule(id: number, body: CreateIotRuleRequest): Promise<IotRule> {
  return api.put<IotRule>(`/iot/rules/${id}`, body);
}

/** PATCH /api/iot/rules/{id}/enabled — 启用/停用 */
export async function setIotRuleEnabled(id: number, enabled: boolean): Promise<IotRule> {
  return api.patch<IotRule>(`/iot/rules/${id}/enabled`, { enabled });
}

/** DELETE /api/iot/rules/{id} */
export async function deleteIotRule(id: number): Promise<void> {
  return api.delete<void>(`/iot/rules/${id}`);
}

// ────────────────────────── 告警 ──────────────────────────

/** GET /api/iot/alerts — 告警列表（租户内 · 状态/级别/设备/关键字过滤） */
export async function listIotAlerts(params?: {
  status?: string;
  severity?: string;
  deviceId?: number;
  keyword?: string;
  days?: number;
}): Promise<IotAlert[]> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set('status', params.status);
  if (params?.severity) qs.set('severity', params.severity);
  if (params?.deviceId) qs.set('deviceId', String(params.deviceId));
  if (params?.keyword) qs.set('keyword', params.keyword);
  if (params?.days) qs.set('days', String(params.days));
  const s = qs.toString();
  return api.get<IotAlert[]>(`/iot/alerts${s ? `?${s}` : ''}`);
}

/** PATCH /api/iot/alerts/{id}/ack — 确认告警（PENDING → ACKNOWLEDGED） */
export async function ackIotAlert(
  id: number,
  remark?: string,
): Promise<{ id: number; status: string }> {
  return api.patch<{ id: number; status: string }>(`/iot/alerts/${id}/ack`, { remark });
}

// ────────────────────────── 电网拓扑（电路图式节点图） ──────────────────────────

/** GET /api/iot/topo — 拓扑快照（节点坐标 + 连线） */
export async function getIotTopo(): Promise<IotTopo> {
  return api.get<IotTopo>('/iot/topo');
}

/** PUT /api/iot/topo/nodes — 批量保存节点位置 */
export async function saveIotTopoNodes(positions: TopoNodePosition[]): Promise<{ saved: number }> {
  return api.put<{ saved: number }>('/iot/topo/nodes', positions);
}

/** POST /api/iot/topo/links — 添加连线 */
export async function addIotTopoLink(
  source: number,
  target: number,
): Promise<{ id: number }> {
  return api.post<{ id: number }>('/iot/topo/links', { source, target });
}

/** DELETE /api/iot/topo/links — 删除连线 */
export async function removeIotTopoLink(
  source: number,
  target: number,
): Promise<{ deleted: number }> {
  const qs = new URLSearchParams({ source: String(source), target: String(target) });
  return api.delete<{ deleted: number }>(`/iot/topo/links?${qs.toString()}`);
}
