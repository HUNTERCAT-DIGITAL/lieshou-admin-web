/**
 * 驾驶舱数据层 hook（2026-08-25 从 Cockpit.tsx 抽出）.
 *
 * 职责：数据加载 + 30s 轮询 + 秒级时钟 + 派生计算（风险/排行/分布/告警占比…）。
 * Cockpit.tsx 只做布局编排，不再持有数据状态。
 */
import { useMemo, useState } from 'react';
import { datavRisk, useClock, usePolling } from '@lieshoucloud/ui';
import {
  getDeviceHealth,
  getIotOverview,
  getIotTopo,
  listIotAlerts,
  listIotDevices,
} from '../../../../services/iot';
import {
  temperatureLevel,
  type DeviceHealth,
  type IotAlert,
  type IotDevice,
  type IotOverview,
  type IotTopo,
} from '@lieshoucloud/types/business/iot';

export interface CockpitData {
  overview: IotOverview | null;
  health: DeviceHealth[];
  alerts: IotAlert[];
  alerts7d: IotAlert[];
  topoData: IotTopo | null;
  topoDevices: IotDevice[];
  clock: string;
  loading: boolean;

  // 派生
  risk: datavRisk.RiskResult;
  ranking: ReturnType<typeof datavRisk.tempRanking>;
  tempDist: { normal: number; warn: number; alert: number };
  sevDist: { warn: number; critical: number; total: number };
  pdDevices: DeviceHealth[];
  maxUltrasonic: DeviceHealth | null;
  maxTev: DeviceHealth | null;
  pdOver: DeviceHealth[];
  /** 局放设备列表（按峰值降序 · 面板表格用） */
  pdList: DeviceHealth[];
  /** 线缆温度节点列表（合并全设备节点，按温度降序） */
  nodeList: NodeTemperatureRow[];
  lowBattery: DeviceHealth[];
  weakSignal: DeviceHealth[];
  trendByDate: { label: string; count: number }[];

  refresh: () => void;
}

export interface NodeTemperatureRow {
  deviceId: number;
  deviceName: string;
  nodeId: number;
  temperature: number | null;
  battery: number | null;
}

const EMPTY_DIST = { normal: 0, warn: 0, alert: 0 };

export function useCockpitData(): CockpitData {
  const [overview, setOverview] = useState<IotOverview | null>(null);
  const [health, setHealth] = useState<DeviceHealth[]>([]);
  const [alerts, setAlerts] = useState<IotAlert[]>([]);
  const [alerts7d, setAlerts7d] = useState<IotAlert[]>([]);
  const [topoData, setTopoData] = useState<IotTopo | null>(null);
  const [topoDevices, setTopoDevices] = useState<IotDevice[]>([]);
  const [loading, setLoading] = useState(false);

  /** 拉取全量数据（首次 / 手动刷新共用） */
  const load = async () => {
    setLoading(true);
    try {
      const [o, h, a, a7, t, devs] = await Promise.all([
        getIotOverview(),
        getDeviceHealth(),
        listIotAlerts({ status: 'PENDING', days: 7 }),
        listIotAlerts({ days: 7 }),
        getIotTopo(),
        listIotDevices(),
      ]);
      setOverview(o);
      setHealth(h.devices);
      setAlerts(a);
      setAlerts7d(a7);
      setTopoData(t);
      setTopoDevices(devs);
    } catch {
      // 静默失败：保留旧数据，值班不被打断
    } finally {
      setLoading(false);
    }
  };

  // 30s 轮询（失败静默，保留旧数据不打断值班）+ 秒级时钟（usePolling/useClock 来自 @lieshoucloud/ui）
  usePolling(() => void load(), 30_000);
  const clock = useClock();

  // ── 派生计算 ──
  const d = overview?.deviceCount;

  const ranking = useMemo(
    () => datavRisk.tempRanking(health.map((h) => ({ id: h.deviceId, name: h.name, maxTemperature: h.maxTemperature }))),
    [health],
  );

  const tempDist = useMemo(() => {
    const dist = { ...EMPTY_DIST };
    for (const h of health) {
      if (h.maxTemperature === null || h.maxTemperature === undefined || !Number.isFinite(h.maxTemperature)) continue;
      const lv = temperatureLevel(h.maxTemperature);
      if (lv === 'alert') dist.alert += 1;
      else if (lv === 'warn') dist.warn += 1;
      else dist.normal += 1;
    }
    return dist;
  }, [health]);

  const sevDist = useMemo(() => {
    let warn = 0;
    let critical = 0;
    for (const a of alerts7d) {
      if (a.severity === 'CRITICAL') critical += 1;
      else warn += 1;
    }
    return { warn, critical, total: Math.max(warn + critical, 1) };
  }, [alerts7d]);

  const pdDevices = useMemo(
    () => health.filter((h) => (h.ultrasonicPeak ?? 0) > 0 || (h.tevPeak ?? 0) > 0),
    [health],
  );
  const maxUltrasonic = useMemo(() => {
    let best: DeviceHealth | null = null;
    for (const h of pdDevices) {
      if (!best || (h.ultrasonicPeak ?? 0) > (best.ultrasonicPeak ?? 0)) best = h;
    }
    return best;
  }, [pdDevices]);
  const maxTev = useMemo(() => {
    let best: DeviceHealth | null = null;
    for (const h of pdDevices) {
      if (!best || (h.tevPeak ?? 0) > (best.tevPeak ?? 0)) best = h;
    }
    return best;
  }, [pdDevices]);
  const pdOver = useMemo(() => pdDevices.filter((h) => (h.ultrasonicPeak ?? 0) > 30), [pdDevices]);

  /** 局放设备列表：按超声/地电波峰值降序（有局放数据的设备） */
  const pdList = useMemo(
    () =>
      [...pdDevices].sort((a, b) => {
        const pa = Math.max(a.ultrasonicPeak ?? 0, a.tevPeak ?? 0);
        const pb = Math.max(b.ultrasonicPeak ?? 0, b.tevPeak ?? 0);
        return pb - pa;
      }),
    [pdDevices],
  );

  /** 线缆温度节点列表：合并全设备节点，按温度降序（null 排最后） */
  const nodeList = useMemo<NodeTemperatureRow[]>(() => {
    const rows: NodeTemperatureRow[] = [];
    for (const h of health) {
      for (const n of h.nodes ?? []) {
        rows.push({
          deviceId: h.deviceId,
          deviceName: h.name,
          nodeId: n.nodeId,
          temperature: n.temperature,
          battery: n.battery,
        });
      }
    }
    rows.sort((a, b) => {
      const ta = a.temperature ?? -Infinity;
      const tb = b.temperature ?? -Infinity;
      return tb - ta;
    });
    return rows;
  }, [health]);

  const lowBattery = useMemo(() => health.filter((h) => (h.battery ?? 99) < 3.0), [health]);
  const weakSignal = useMemo(() => health.filter((h) => (h.signalStrength ?? 99) < 50), [health]);

  const trendByDate = useMemo(() => datavRisk.alertByDate(alerts7d, 7), [alerts7d]);

  const risk: datavRisk.RiskResult = useMemo(() => {
    const overTemp = health.filter(
      (h) => h.maxTemperature !== null && h.maxTemperature !== undefined && temperatureLevel(h.maxTemperature) === 'alert',
    ).length;
    const warnTemp = health.filter(
      (h) => h.maxTemperature !== null && h.maxTemperature !== undefined && temperatureLevel(h.maxTemperature) === 'warn',
    ).length;
    return datavRisk.calcRiskScore({
      total: d?.total ?? 0,
      online: d?.online ?? 0,
      overTempDevices: overTemp,
      warnTempDevices: warnTemp,
      pendingAlerts: overview?.pendingAlerts ?? 0,
      pdOverDevices: pdOver.length,
    });
  }, [health, d, overview, pdOver]);

  return {
    overview,
    health,
    alerts,
    alerts7d,
    topoData,
    topoDevices,
    clock,
    loading,
    risk,
    ranking,
    tempDist,
    sevDist,
    pdDevices,
    maxUltrasonic,
    maxTev,
    pdOver,
    pdList,
    nodeList,
    lowBattery,
    weakSignal,
    trendByDate,
    refresh: () => void load(),
  };
}
