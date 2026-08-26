/**
 * 电网拓扑（电路图式节点图 · 非真实地图）.
 *
 * 客户诉求：电网监控要一个「像电路图一样的节点图」——设备摆成节点、
 * 线缆画成连线。本页 = SVG 连线 + HTML 可拖拽节点卡片：
 *   - 只读模式：点节点看设备概要（状态/温度/地址/照片）
 *   - 编辑模式：拖拽摆放节点（自动保存坐标）+ 点源节点 → 点目标节点连线 + 连线中点 × 删除
 *   - 无坐标设备自动环形布局（保存后持久化）
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  App,
  Button,
  Descriptions,
  Image,
  Modal,
  Space,
  Switch,
  Tag,
  Typography,
} from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';

import { useApiError } from '../../hooks/useApiError';
import {
  addIotTopoLink,
  getIotTopo,
  listIotDevices,
  removeIotTopoLink,
  saveIotTopoNodes,
} from '../../services/iot';
import {
  DEVICE_STATUS_META,
  TEMPERATURE_LEVEL_COLOR,
  temperatureLevel,
  type IotDevice,
  type IotTopo,
} from '@lieshoucloud/types/business/iot';

interface Pos {
  x: number;
  y: number;
}

/**
 * 合并拓扑坐标：已保存坐标用保存值；未保存设备按环形布局（围绕画布中心），
 * 首次进入即可见、拖拽后才持久化。
 */
export function mergePositions(
  devices: { id: number }[],
  nodes: { deviceId: number; x: number; y: number }[],
): Record<number, Pos> {
  const saved = new Map(nodes.map((n) => [n.deviceId, { x: n.x, y: n.y }]));
  const result: Record<number, Pos> = {};
  const ring = devices.filter((d) => !saved.has(d.id));
  const cx = 50;
  const cy = 32;
  const r = 22;
  ring.forEach((d, i) => {
    const angle = (2 * Math.PI * i) / Math.max(ring.length, 1) - Math.PI / 2;
    result[d.id] = { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });
  for (const [id, p] of saved) result[id] = p;
  return result;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export default function IotTopoPage() {
  const { message } = App.useApp();
  const handleError = useApiError();

  const [devices, setDevices] = useState<IotDevice[]>([]);
  const [topo, setTopo] = useState<IotTopo | null>(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [connectSource, setConnectSource] = useState<number | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [pos, setPos] = useState<Record<number, Pos>>({});
  const dragMoved = useRef(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [d, t] = await Promise.all([listIotDevices(), getIotTopo()]);
      setDevices(d);
      setTopo(t);
      setPos(mergePositions(d, t.nodes));
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, []);

  const deviceById = useMemo(() => {
    const m = new Map<number, IotDevice>();
    devices.forEach((d) => m.set(d.id, d));
    return m;
  }, [devices]);

  const links = topo?.links ?? [];
  const detail = detailId !== null ? deviceById.get(detailId) : undefined;

  // ── 拖拽摆放（编辑模式） ──
  const onPointerDown = (e: React.PointerEvent, id: number) => {
    if (!editMode) return;
    e.preventDefault();
    dragMoved.current = false;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(id);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (dragging === null || !canvasRef.current) return;
    dragMoved.current = true;
    const rect = canvasRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const x = clamp(((e.clientX - rect.left) / rect.width) * 100, 2, 98);
    const y = clamp(((e.clientY - rect.top) / rect.height) * 100, 4, 96);
    setPos((p) => ({ ...p, [dragging]: { x, y } }));
  };
  const onPointerUp = () => {
    if (dragging === null) return;
    const moved = dragMoved.current;
    setDragging(null);
    if (moved) {
      const positions = Object.entries(pos).map(([id, p]) => ({
        deviceId: Number(id),
        x: p.x,
        y: p.y,
      }));
      saveIotTopoNodes(positions)
        .then(() => message.success('节点位置已保存'))
        .catch(handleError);
    }
  };

  // ── 节点点击：编辑=连线 / 只读=概要弹窗 ──
  const onNodeClick = (id: number) => {
    if (dragMoved.current) return;
    if (!editMode) {
      setDetailId(id);
      return;
    }
    if (connectSource === null) {
      setConnectSource(id);
      message.info('已选源节点，再点目标节点完成连线');
    } else if (connectSource === id) {
      setConnectSource(null);
    } else {
      const source = connectSource;
      setConnectSource(null);
      addIotTopoLink(source, id)
        .then(() => {
          setTopo((t) =>
            t ? { ...t, links: [...t.links, { source, target: id }] } : t,
          );
          message.success('已连线');
        })
        .catch(handleError);
    }
  };

  const onDeleteLink = (source: number, target: number) => {
    removeIotTopoLink(source, target)
      .then(() => {
        setTopo((t) =>
          t ? { ...t, links: t.links.filter((l) => !(l.source === source && l.target === target)) } : t,
        );
        message.success('已删除连线');
      })
      .catch(handleError);
  };

  const linksSvg = links
    .map((l) => ({ l, a: pos[l.source], b: pos[l.target] }))
    .filter((x): x is { l: { source: number; target: number }; a: Pos; b: Pos } => !!x.a && !!x.b);

  return (
    <PageContainer
      title="电网拓扑"
      extra={[
        <Space key="controls" size={12}>
          <Tag>电路图节点图（非真实地图）</Tag>
          <Switch
            checked={editMode}
            onChange={setEditMode}
            checkedChildren="编辑"
            unCheckedChildren="查看"
          />
          <Button icon={<ReloadOutlined />} loading={loading} onClick={() => void load()}>
            刷新
          </Button>
        </Space>,
      ]}
    >
      <Alert
        style={{ marginBottom: 12 }}
        type={editMode ? 'warning' : 'info'}
        showIcon
        message={
          editMode
            ? '编辑模式：拖动节点摆放位置（松手自动保存）；先点源节点再点目标节点画连线；连线中点 × 删除连线。'
            : '查看模式：点击节点查看设备概要（状态/温度/安装地址/照片）；切换「编辑」可摆放节点与画线。'
        }
      />

      <div
        ref={canvasRef}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 8.2',
          background:
            'linear-gradient(#ececec 1px, transparent 1px), linear-gradient(90deg, #ececec 1px, transparent 1px)',
          backgroundSize: '26px 26px',
          borderRadius: 8,
          border: '1px solid #e8e8e8',
          overflow: 'hidden',
          userSelect: 'none',
        }}
      >
        {/* 连线（SVG，viewBox 0-100 与节点 % 坐标同构） */}
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0 }}
        >
          {linksSvg.map(({ l, a, b }) => (
            <line
              key={`${l.source}-${l.target}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="#8c8c8c"
              strokeWidth={1.6}
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeDasharray={editMode ? '6 4' : undefined}
            />
          ))}
        </svg>

        {/* 连线删除按钮（编辑模式，中点） */}
        {editMode &&
          linksSvg.map(({ l, a, b }) => {
            const mx = (a.x + b.x) / 2;
            const my = (a.y + b.y) / 2;
            return (
              <button
                key={`del-${l.source}-${l.target}`}
                onClick={() => onDeleteLink(l.source, l.target)}
                style={{
                  position: 'absolute',
                  left: `${mx}%`,
                  top: `${my}%`,
                  transform: 'translate(-50%, -50%)',
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  border: '1px solid #ff4d4f',
                  background: '#fff',
                  color: '#ff4d4f',
                  fontSize: 12,
                  lineHeight: 1,
                  cursor: 'pointer',
                  zIndex: 5,
                }}
                title="删除连线"
              >
                ×
              </button>
            );
          })}

        {/* 设备节点卡片（HTML 绝对定位，拖拽用 pointer 事件） */}
        {devices.map((d) => {
          const p = pos[d.id];
          if (!p) return null;
          const online = d.status === 'ONLINE';
          const temp = d.maxTemperature;
          const isSource = connectSource === d.id;
          return (
            <div
              key={d.id}
              onPointerDown={(e) => onPointerDown(e, d.id)}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onClick={() => onNodeClick(d.id)}
              onDoubleClick={() => setDetailId(d.id)}
              style={{
                position: 'absolute',
                left: `${p.x}%`,
                top: `${p.y}%`,
                transform: 'translate(-50%, -50%)',
                width: 118,
                padding: '6px 8px',
                background: online ? '#e6f4ff' : '#f5f5f5',
                border: `1.5px solid ${isSource ? '#fa8c16' : online ? '#1677ff' : '#d9d9d9'}`,
                borderRadius: 8,
                cursor: editMode ? 'grab' : 'pointer',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                zIndex: dragging === d.id ? 10 : 2,
                textAlign: 'center',
              }}
            >
              <Space size={4} style={{ justifyContent: 'center' }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: online ? '#52c41a' : '#bfbfbf',
                  }}
                />
                <Typography.Text
                  strong
                  ellipsis
                  style={{ fontSize: 12, maxWidth: 88 }}
                  title={d.name}
                >
                  {d.name}
                </Typography.Text>
              </Space>
              <div style={{ fontSize: 12, marginTop: 2 }}>
                {temp !== null && temp !== undefined ? (
                  <span style={{ color: TEMPERATURE_LEVEL_COLOR[temperatureLevel(temp)] }}>
                    {temp}℃
                  </span>
                ) : (
                  <span style={{ color: '#999' }}>{online ? '—' : '离线'}</span>
                )}
              </div>
            </div>
          );
        })}

        {devices.length === 0 && (
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
            <Typography.Text type="secondary">暂无设备，先在「设备管理」注册</Typography.Text>
          </div>
        )}
      </div>

      {/* 设备概要弹窗 */}
      <Modal
        open={detail !== undefined}
        onCancel={() => setDetailId(null)}
        footer={null}
        width={440}
        title={detail?.name ?? '设备'}
      >
        {detail && (
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            <Image
              src={detail.photoUrl || '/device-placeholder.svg'}
              alt={detail.name}
              width="100%"
              height={180}
              style={{ objectFit: 'cover', borderRadius: 8 }}
              fallback="/device-placeholder.svg"
            />
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="状态">
                <Tag color={DEVICE_STATUS_META[detail.status].color}>
                  {DEVICE_STATUS_META[detail.status].text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="设备 Key">
                <Typography.Text code style={{ fontSize: 12 }}>
                  {detail.deviceKey}
                </Typography.Text>
              </Descriptions.Item>
              <Descriptions.Item label="最高节点温度">
                {detail.maxTemperature !== null && detail.maxTemperature !== undefined
                  ? `${detail.maxTemperature}℃`
                  : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="安装地址">
                {detail.installAddress ?? '—'}
              </Descriptions.Item>
              <Descriptions.Item label="最后在线">
                {detail.lastOnlineAt ?? '—'}
              </Descriptions.Item>
            </Descriptions>
          </Space>
        )}
      </Modal>
    </PageContainer>
  );
}
