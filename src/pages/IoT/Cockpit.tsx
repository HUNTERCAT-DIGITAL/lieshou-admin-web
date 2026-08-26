/**
 * 电网监控驾驶舱（值班大屏 · 2026-08-25 重构：数据层抽 hook，布局纯编排）.
 *
 * 本文件只做：useCockpitData 取数 + 布局编排 + 交互动作（详情/确认/全屏/放大）。
 * 业务面板全部独立组件（panels/），纯计算在 risk.ts，图表主题在 chartTheme.ts。
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { DatavHeader, DatavStatRow, DatavStatusBar, DatavTicker, DatavZoomOverlay, cockpitColumns, cockpitScale, datavRisk, useElementSize, type ZoomInfo } from '@lieshoucloud/ui';
import TopoView from './cockpit/TopoView';
import DeviceModal from './cockpit/DeviceModal';
import RiskPanel from './cockpit/panels/RiskPanel';
import TemperaturePanel from './cockpit/panels/TemperaturePanel';
import PdPanel from './cockpit/panels/PdPanel';
import AlertPanel from './cockpit/panels/AlertPanel';
import { useCockpitData } from './cockpit/hooks/useCockpitData';

import { getIotDeviceDetail } from '../../services/iot';
import type { DeviceDetail, DeviceHealth, IotDevice } from '@lieshoucloud/types/business/iot';

export default function IotCockpitPage() {
  const navigate = useNavigate();
  const data = useCockpitData();

  const [canvasRef, { width: cw, height: ch }] = useElementSize<HTMLDivElement>();
  const scale = cockpitScale(cw, ch);
  const isStacked = scale <= 0;
  const measured = cw > 0 && ch > 0;
  const vGap = !isStacked ? Math.max(ch - 1080 * scale, 0) : 0;
  const topGap = Math.round(vGap / 2);
  const bottomGap = vGap - topGap;
  const decoShow = (g: number) => g >= 40;
  const cols = isStacked ? cockpitColumns(cw) : 4;
  const mainCols = cols === 4 ? '1.15fr 2.7fr 1.15fr' : cols === 2 ? '1fr 1fr' : '1fr';

  const [zoom, setZoom] = useState<ZoomInfo | null>(null);
  const [detailDev, setDetailDev] = useState<DeviceHealth | null>(null);
  const [detailExtra, setDetailExtra] = useState<DeviceDetail | null>(null);

  const kiosk = useMemo(() => new URLSearchParams(window.location.search).get('kiosk') === '1', []);

  // kiosk 模式自动浏览器全屏（电视墙）
  useEffect(() => {
    if (kiosk) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    }
  }, [kiosk]);

  /** 打开设备详情（health 即时数据 + detail 补安装信息） */
  const openDeviceDetail = async (h: DeviceHealth) => {
    setDetailDev(h);
    setDetailExtra(null);
    try {
      const d = await getIotDeviceDetail(h.deviceId);
      setDetailExtra(d);
    } catch {
      // 详情失败不影响弹窗
    }
  };

  /** 从设备（拓扑节点）打开详情：优先复用 health 聚合 */
  const openFromDevice = (d: IotDevice) => {
    const h = data.health.find((x) => x.deviceId === d.id);
    if (h) {
      void openDeviceDetail(h);
      return;
    }
    void openDeviceDetail({
      deviceId: d.id,
      name: d.name,
      status: d.status,
      maxTemperature: d.maxTemperature ?? null,
      hottestNodeKey: null,
      signalStrength: d.signalStrength ?? null,
      battery: null,
      ultrasonicPeak: null,
      tevPeak: null,
      environmentTemp: null,
      humidity: null,
      pendingAlerts: d.pendingAlerts ?? 0,
    });
  };

  /** 按设备 ID 打开详情（面板列表行点击） */
  const openByDeviceId = (deviceId: number) => {
    const h = data.health.find((x) => x.deviceId === deviceId);
    if (h) void openDeviceDetail(h);
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else document.documentElement.requestFullscreen?.().catch(() => {});
  };

  const { overview, health, alerts, topoData, topoDevices, clock, loading } = data;
  const d = overview?.deviceCount;

  // 底部滚动横幅：汇总驾驶舱所有卡片的核心指标（全站状态）
  const tickerItems = useMemo(() => {
    const parts: string[] = [];
    if (d) {
      parts.push(`设备 ${d.total} 台 · 在线 ${d.online} · 离线 ${d.offline} · 今日告警 ${overview?.alertsToday ?? 0} · 待确认 ${overview?.pendingAlerts ?? 0}`);
    }
    const hot = overview?.maxTemperature;
    if (hot && hot.value !== null && hot.value !== undefined) {
      parts.push(`最高温度 ${hot.value}℃（${hot.name}）`);
    }
    parts.push(`风险指数 ${data.risk.score}（${datavRisk.RISK_LEVEL_META[data.risk.level].text}）`);
    parts.push(`温度分布 正常 ${data.tempDist.normal} / 预警 ${data.tempDist.warn} / 告警 ${data.tempDist.alert}`);
    if (data.maxUltrasonic?.ultrasonicPeak) parts.push(`超声峰值 ${data.maxUltrasonic.ultrasonicPeak}dBuv`);
    if (data.maxTev?.tevPeak) parts.push(`地电波峰值 ${data.maxTev.tevPeak}dBmv`);
    parts.push(`告警 预警 ${data.sevDist.warn} / 严重 ${data.sevDist.critical}`);
    parts.push(`低电量 ${data.lowBattery.length} · 弱信号 ${data.weakSignal.length} · 离线 ${(overview?.offlineDevices ?? []).length}`);
    if (alerts.length > 0) {
      parts.push(`未确认：${alerts.slice(0, 5).map((a) => `${health.find((h) => h.deviceId === a.deviceId)?.name ?? '#' + a.deviceId} ${a.ruleName ?? ''}`).join(' / ')}`);
    }
    return parts;
  }, [d, overview, data, alerts, health]);

  return (
    <div
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        overflow: isStacked ? 'auto' : 'hidden',
        minHeight: '100%',
        padding: isStacked ? 12 : 0,
        background:
          'radial-gradient(ellipse at 50% -10%, rgba(0,188,235,0.14) 0%, transparent 55%), radial-gradient(ellipse at 20% 0%, #123a63 0%, #0a1e36 55%, #071527 100%)',
        color: '#e6f4ff',
      }}
    >
      {/* 顶部氛围扫描线 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: 'linear-gradient(90deg, transparent 0%, rgba(0,188,235,0.7) 30%, rgba(0,188,235,0.9) 50%, rgba(0,188,235,0.7) 70%, transparent 100%)',
          boxShadow: '0 0 18px rgba(0,188,235,0.6)',
          zIndex: 5,
          pointerEvents: 'none',
        }}
      />
      {/* 角落装饰光晕 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 0% 100%, rgba(0,188,235,0.08) 0%, transparent 40%), radial-gradient(circle at 100% 100%, rgba(0,188,235,0.08) 0%, transparent 40%)',
          pointerEvents: 'none',
        }}
      />
      {/* 缓慢扫描光带（氛围 · 低强度不干扰） */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: 120,
          background: 'linear-gradient(180deg, transparent, rgba(0,188,235,0.05), transparent)',
          animation: 'cockpit-scan 14s linear infinite',
          pointerEvents: 'none',
        }}
      />
      {/* 顶栏科技风按钮样式 */}
      <style>{`
        @keyframes cockpit-scan {
          0% { top: -4%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 104%; opacity: 0; }
        }
        .cockpit-btn {
          background: rgba(0, 188, 235, 0.08) !important;
          border: 1px solid #1e5b8a !important;
          color: #8fc1e3 !important;
          border-radius: 4px !important;
          box-shadow: 0 0 6px rgba(0, 188, 235, 0.15);
          transition: all .2s;
        }
        .cockpit-btn:hover {
          background: rgba(0, 188, 235, 0.18) !important;
          border-color: #00bceb !important;
          color: #e6f4ff !important;
          box-shadow: 0 0 12px rgba(0, 188, 235, 0.4);
        }
        .cockpit-btn-ghost {
          background: transparent !important;
          border: 1px solid rgba(30, 91, 138, 0.5) !important;
          color: #5a7f9f !important;
          border-radius: 4px !important;
          transition: all .2s;
        }
        .cockpit-btn-ghost:hover {
          color: #8fc1e3 !important;
          border-color: #1e5b8a !important;
        }
      `}</style>

      {!measured ? (
        <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh', color: '#5a7f9f' }}>
          驾驶舱加载中…
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
          {/* 顶部装饰区（矮屏剩余空间 → 信息条） */}
          {!isStacked && topGap > 0 && decoShow(topGap) && (
            <div
              style={{
                height: topGap,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 32,
                padding: '0 24px',
                background: 'linear-gradient(180deg, rgba(0,188,235,0.10) 0%, rgba(9,30,60,0) 100%)',
                borderBottom: '1px solid rgba(0,188,235,0.15)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <i style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#52c41a', boxShadow: '0 0 8px #52c41a' }} />
                <span style={{ fontSize: 16, color: '#8fc1e3', letterSpacing: 3 }}>系统运行正常</span>
              </div>
              <div style={{ fontSize: 20, color: '#e6f4ff', letterSpacing: 3 }}>
                {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
              </div>
              <div style={{ fontSize: 14, color: '#5a7f9f', letterSpacing: 2 }}>物联网云平台 · 电网监控平台</div>
            </div>
          )}

          {/* 内容区：1920×1080 等比缩放 */}
          <div style={{ position: 'relative', flex: isStacked ? undefined : 1, minHeight: 0 }}>
            <div
              style={{
                position: isStacked ? undefined : 'absolute',
                left: isStacked ? undefined : Math.max(Math.round((cw - 1920 * scale) / 2), 0),
                top: isStacked ? undefined : 0,
                width: isStacked ? undefined : 1920,
                height: isStacked ? undefined : 1080,
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                transform: isStacked ? undefined : `scale(${scale})`,
                transformOrigin: 'top left',
              }}
            >
              <DatavHeader
                title="电网监控驾驶舱"
                clock={clock}
                loading={loading}
                isFullscreen={!!document.fullscreenElement}
                onRefresh={data.refresh}
                onToggleFullscreen={toggleFullscreen}
                onBack={() => navigate('/welcome')}
              />
              <DatavStatRow
                cols={cols}
                stats={[
                  { title: '设备总数', value: d?.total ?? 0, suffix: '台' },
                  { title: '在线', value: d?.online ?? 0, suffix: '台', color: '#52c41a' },
                  { title: '离线', value: d?.offline ?? 0, suffix: '台', color: d && d.offline > 0 ? '#ff4d4f' : '#52c41a' },
                  { title: '今日告警', value: overview?.alertsToday ?? 0, suffix: '条', color: '#fa8c16' },
                  { title: '待确认', value: overview?.pendingAlerts ?? 0, suffix: '条', color: overview && overview.pendingAlerts > 0 ? '#ff4d4f' : '#52c41a' },
                ]}
              />

              {/* 主区三栏：左（态势）| 中央拓扑 | 右（监测） */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: mainCols,
                  gridTemplateRows: '1fr',
                  gap: 8,
                  marginBottom: 8,
                  flex: isStacked ? undefined : 1,
                  minHeight: 0,
                }}
              >
                {/* 左列：风险 + 温度 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, height: '100%', minHeight: 0 }}>
                  <div style={{ flex: 1.1, minHeight: 0 }}>
                    <RiskPanel risk={data.risk} onZoom={setZoom} />
                  </div>
                  <div style={{ flex: 1.7, minHeight: 0 }}>
                    <TemperaturePanel
                      nodeList={data.nodeList}
                      onZoom={setZoom}
                      openDeviceDetail={openByDeviceId}
                    />
                  </div>
                </div>

                {/* 中央：电网拓扑（P1 主视觉） */}
                <TopoView devices={topoDevices} topo={topoData} onSelect={openFromDevice} onZoom={setZoom} />

                {/* 右列：局放 + 告警占比 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, height: '100%', minHeight: 0 }}>
                  <div style={{ flex: 1.1, minHeight: 0 }}>
                    <PdPanel
                      pdList={data.pdList}
                      pdOver={data.pdOver}
                      onZoom={setZoom}
                      openDeviceDetail={openByDeviceId}
                    />
                  </div>
                  <div style={{ flex: 1.7, minHeight: 0 }}>
                    <AlertPanel alerts7d={data.alerts7d} sevDist={data.sevDist} onZoom={setZoom} />
                  </div>
                </div>
              </div>

              {/* 底部全站状态滚动横幅 */}
              <DatavTicker items={tickerItems} prefix="全站状态" />

              {!isStacked && bottomGap < 40 && <DatavStatusBar total={d?.total} online={d?.online} />}
            </div>
          </div>

          {/* 底部装饰区 */}
          {!isStacked && bottomGap > 0 && decoShow(bottomGap) && (
            <div
              style={{
                height: bottomGap,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 48px',
                background: 'linear-gradient(0deg, rgba(0,188,235,0.10) 0%, rgba(9,30,60,0) 100%)',
                borderTop: '1px solid rgba(0,188,235,0.15)',
                fontSize: 15,
                color: '#8fc1e3',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <i style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#52c41a', boxShadow: '0 0 8px #52c41a' }} />
                系统运行正常
              </span>
              <span>物联网云平台 · 电网监控值班平台 v0.0.1</span>
            </div>
          )}
        </div>
      )}

      {/* 设备详情弹窗 */}
      <DeviceModal
        detailDev={detailDev}
        detailExtra={detailExtra}
        onClose={() => setDetailDev(null)}
        onGoDevices={() => navigate('/iot/devices')}
      />

      {/* 卡片单独全屏层 */}
      <DatavZoomOverlay
        zoom={zoom}
        isFullscreen={!!document.fullscreenElement}
        onToggleFullscreen={toggleFullscreen}
        onClose={() => setZoom(null)}
      />
    </div>
  );
}
