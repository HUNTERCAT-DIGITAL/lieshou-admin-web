/**
 * 物联网 · 设备管理页（ADR-0040 · Phase 2）.
 *
 * 设备列表（产品/状态/关键字过滤）+ 创建设备（一次性展示凭证）+ 详情抽屉
 * （影子快照 / 属性时序 / 事件）。
 */
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  App,
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Form,
  Popconfirm,
  Row,
  Segmented,
  Select,
  Space,
  Tabs,
  Table,
  Tag,
  Typography,
  Upload,
  type TableProps,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import {
  ModalForm,
  PageContainer,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProTable,
  type ActionType,
  type ProColumns,
} from '@ant-design/pro-components';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { useApiError } from '../../hooks/useApiError';
import { compressImage } from '../../utils/image';
import LineChart, { toLinePoints } from './LineChart';
import {
  countIotDevices,
  createIotDevice,
  deleteDevicePhoto,
  deleteIotDevice,
  getIotDeviceDetail,
  getIotProductDetail,
  listDeviceEvents,
  listDeviceHistory,
  listIotDevices,
  listIotProducts,
  updateIotDevice,
  uploadDevicePhoto,
} from '../../services/iot';
import {
  DEVICE_STATUS_META,
  formatShadowValue,
  isNodeTemperatureKey,
  nodeIdOfKey,
  TEMPERATURE_LEVEL_COLOR,
  temperatureLevel,
  type DeviceDetail,
  type DeviceEventRecord,
  type DevicePropertyRecord,
  type IotDevice,
  type IotProduct,
  type ProductDetail,
} from '../../types/iot';

interface DeviceFormValues {
  name: string;
  productId: number;
  deviceKey?: string;
  deviceSecret?: string;
  groupName?: string;
  installAddress?: string;
  remark?: string;
}

type DeviceStatusFilter = 'ALL' | 'ONLINE' | 'OFFLINE';

/**
 * 设备照片上传控件：预览（已存照片/本地待传/占位图）+ 选择文件 + 移除。
 * 创建时无 deviceId，文件在表单提交后统一上传（见 onFinish）。
 */
function DevicePhotoInput({
  currentUrl,
  pendingFile,
  removed,
  onPick,
  onRemove,
}: {
  currentUrl?: string | null;
  pendingFile: File | null;
  removed: boolean;
  onPick: (f: File | null) => void;
  onRemove: () => void;
}) {
  const { message: msg } = App.useApp();
  const previewUrl = useMemo(
    () => (pendingFile ? URL.createObjectURL(pendingFile) : null),
    [pendingFile],
  );
  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const shown = pendingFile ? previewUrl : removed ? null : currentUrl || null;
  return (
    <Space direction="vertical" size={8} style={{ width: '100%' }}>
      <img
        src={shown || '/device-placeholder.svg'}
        alt="设备照片"
        style={{
          width: 200,
          height: 125,
          objectFit: 'cover',
          borderRadius: 6,
          border: '1px solid #f0f0f0',
        }}
      />
      <Space size={8}>
        <Upload
          accept="image/*"
          showUploadList={false}
          beforeUpload={async (file) => {
            if (!file.type.startsWith('image/')) {
              msg.error('仅支持图片文件');
              return Upload.LIST_IGNORE;
            }
            if (file.size > 20 * 1024 * 1024) {
              msg.error('照片不能超过 20MB');
              return Upload.LIST_IGNORE;
            }
            // 手机照片常 >5MB：先压缩（最大边 1600px / JPEG 0.82）再上传
            const compressed = await compressImage(file);
            onPick(compressed);
            return false;
          }}
        >
          <Button size="small" icon={<UploadOutlined />}>
            {pendingFile ? '重新选择' : currentUrl ? '更换照片' : '上传照片'}
          </Button>
        </Upload>
        {pendingFile && (
          <Button size="small" onClick={() => onPick(null)}>
            取消选择
          </Button>
        )}
        {(currentUrl || pendingFile) && !removed && (
          <Button size="small" danger onClick={onRemove}>
            移除
          </Button>
        )}
      </Space>
      {pendingFile && (
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          已选择：{pendingFile.name}（保存设备时上传）
        </Typography.Text>
      )}
    </Space>
  );
}

export default function IotDevices() {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const { message: messageApi } = App.useApp();
  const handleError = useApiError();
  const navigate = useNavigate();

  const [products, setProducts] = useState<IotProduct[]>([]);
  const [counts, setCounts] = useState<{ total: number; online: number }>({ total: 0, online: 0 });
  const [statusFilter, setStatusFilter] = useState<DeviceStatusFilter>('ALL');
  const [productFilter, setProductFilter] = useState<number | undefined>(undefined);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IotDevice | null>(null);
  const [credential, setCredential] = useState<IotDevice | null>(null);
  // 照片上传：创建时无 id，文件暂存待表单提交后统一上传
  const [pendingPhoto, setPendingPhoto] = useState<File | null>(null);
  const [photoRemoved, setPhotoRemoved] = useState(false);

  // 详情抽屉
  const [detail, setDetail] = useState<DeviceDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [history, setHistory] = useState<DevicePropertyRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [events, setEvents] = useState<DeviceEventRecord[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [historyKey, setHistoryKey] = useState<string>('');
  // 所属产品详情（属性定义，供时序过滤）
  const [detailProductDetail, setDetailProductDetail] = useState<ProductDetail | null>(null);

  const reload = () => actionRef.current?.reload();

  // 产品选项 + 设备统计（首次加载 + 每次 reload）
  const loadMeta = () => {
    listIotProducts().then(setProducts).catch(handleError);
    countIotDevices().then(setCounts).catch(handleError);
  };
  useEffect(loadMeta, []);

  const productName = useMemo(() => {
    const m = new Map<number, string>();
    products.forEach((p) => m.set(p.id, p.name));
    return m;
  }, [products]);

  const detailProduct = detail ? products.find((p) => p.id === detail.device.productId) : undefined;
  const detailProperties = detailProductDetail?.properties ?? [];

  const loadHistory = (deviceId: number, propertyKey: string) => {
    setHistoryLoading(true);
    listDeviceHistory(deviceId, propertyKey || undefined)
      .then(setHistory)
      .catch(handleError)
      .finally(() => setHistoryLoading(false));
  };

  const loadEvents = (deviceId: number) => {
    setEventsLoading(true);
    listDeviceEvents(deviceId)
      .then(setEvents)
      .catch(handleError)
      .finally(() => setEventsLoading(false));
  };

  const openDetail = (device: IotDevice) => {
    setDetailLoading(true);
    getIotDeviceDetail(device.id)
      .then((d) => {
        setDetail(d);
        setHistoryKey('');
        loadHistory(device.id, '');
        loadEvents(device.id);
        // 同步拉所属产品详情（属性/命令定义）
        getIotProductDetail(d.device.productId)
          .then((pd) => setDetailProductDetail(pd))
          .catch(handleError);
      })
      .catch(handleError)
      .finally(() => setDetailLoading(false));
  };

  const columns: ProColumns<IotDevice>[] = [
    { title: 'ID', dataIndex: 'id', width: 60, search: false },
    { title: '设备名称', dataIndex: 'name', width: 170 },
    {
      title: '产品',
      dataIndex: 'productId',
      width: 130,
      search: false,
      render: (_, r) => productName.get(r.productId) ?? `#${r.productId}`,
    },
    {
      title: '设备 Key',
      dataIndex: 'deviceKey',
      width: 180,
      search: false,
      render: (_, r) => (
        <Typography.Text
          code
          copyable={{ text: r.deviceKey, tooltips: ['复制', '已复制'] }}
          style={{ fontSize: 12 }}
        >
          {r.deviceKey}
        </Typography.Text>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      search: false,
      render: (_, r) => {
        const meta = DEVICE_STATUS_META[r.status];
        return <Tag color={meta.color}>{meta.text}</Tag>;
      },
    },
    {
      title: '最高节点温度',
      dataIndex: 'maxTemperature',
      width: 120,
      search: false,
      sorter: (a, b) => (a.maxTemperature ?? -Infinity) - (b.maxTemperature ?? -Infinity),
      render: (_, r) => {
        const t = r.maxTemperature;
        if (t === null || t === undefined) return '—';
        return (
          <Typography.Text style={{ color: TEMPERATURE_LEVEL_COLOR[temperatureLevel(t)] }}>
            {t}℃
          </Typography.Text>
        );
      },
    },
    {
      title: '信号',
      dataIndex: 'signalStrength',
      width: 80,
      search: false,
      render: (_, r) => {
        const s = r.signalStrength;
        if (s === null || s === undefined) return '—';
        return <Tag color={s >= 50 ? 'green' : 'orange'}>{s}</Tag>;
      },
    },
    {
      title: '告警',
      dataIndex: 'pendingAlerts',
      width: 90,
      search: false,
      render: (_, r) => {
        const n = r.pendingAlerts ?? 0;
        if (n <= 0) return '—';
        return (
          <Tag
            color="red"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/iot/alerts')}
          >
            未确认 {n}
          </Tag>
        );
      },
    },
    {
      title: '分组',
      dataIndex: 'groupName',
      width: 110,
      search: false,
      render: (_, r) => r.groupName ?? '—',
    },
    {
      title: '最后在线',
      dataIndex: 'lastOnlineAt',
      valueType: 'dateTime',
      width: 160,
      search: false,
      render: (_, r) => (r.lastOnlineAt ? r.lastOnlineAt : '—'),
    },
    {
      title: '操作',
      valueType: 'option',
      width: 220,
      render: (_, row) => [
        <Button
          key="detail"
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => openDetail(row)}
        >
          详情
        </Button>,
        <Button
          key="edit"
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={() => {
            setEditing(row);
            setModalOpen(true);
          }}
        >
          编辑
        </Button>,
        <Popconfirm
          key="del"
          title="确定删除该设备？（设备将无法接入）"
          okText="删除"
          cancelText="取消"
          okButtonProps={{ danger: true }}
          onConfirm={async () => {
            try {
              await deleteIotDevice(row.id);
              messageApi.success('已删除');
              reload();
              loadMeta();
            } catch (e) {
              handleError(e);
            }
          }}
        >
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Popconfirm>,
      ],
    },
  ];

  const onFinish = async (values: DeviceFormValues) => {
    try {
      const payload = {
        name: String(values.name),
        productId: Number(values.productId),
        deviceKey: values.deviceKey ? String(values.deviceKey) : undefined,
        deviceSecret: values.deviceSecret ? String(values.deviceSecret) : undefined,
        groupName: values.groupName ? String(values.groupName) : undefined,
        installAddress: values.installAddress ? String(values.installAddress) : undefined,
        remark: values.remark ? String(values.remark) : undefined,
      };
      let savedId: number;
      if (editing) {
        await updateIotDevice(editing.id, payload);
        savedId = editing.id;
        messageApi.success('已保存');
      } else {
        const created = await createIotDevice(payload);
        setCredential(created); // 一次性展示设备凭证
        savedId = created.id;
        messageApi.success('设备已创建，请保存凭证');
      }
      // 照片：选了文件 → 上传；点了移除且有旧照片 → 删除
      if (pendingPhoto) {
        await uploadDevicePhoto(savedId, pendingPhoto);
        messageApi.success('设备照片已上传');
      } else if (photoRemoved && editing?.photoUrl) {
        await deleteDevicePhoto(savedId);
        messageApi.success('设备照片已移除');
      }
      setModalOpen(false);
      setEditing(null);
      setPendingPhoto(null);
      setPhotoRemoved(false);
      reload();
      loadMeta();
      return true;
    } catch (e) {
      handleError(e);
      return false;
    }
  };

  // 命令下发功能已按需求屏蔽（无数据下发场景）——sendDeviceCommand 保留在 services/iot.ts 供恢复


  const historyPoints = useMemo(
    () => (historyKey ? toLinePoints(history) : []),
    [history, historyKey],
  );

  const historyColumns: TableProps<DevicePropertyRecord>['columns'] = [
    { title: '属性 Key', dataIndex: 'propertyKey', width: 140 },
    { title: '值', dataIndex: 'valueStr', width: 160 },
    { title: '上报时间', dataIndex: 'reportedAt' },
  ];

  const eventColumns: TableProps<DeviceEventRecord>['columns'] = [
    { title: '事件 Key', dataIndex: 'eventKey', width: 140 },
    {
      title: '载荷',
      dataIndex: 'payloadJson',
      render: (_, r) =>
        r.payloadJson ? <Typography.Text code>{r.payloadJson}</Typography.Text> : '—',
    },
    { title: '发生时间', dataIndex: 'occurredAt' },
  ];

  const shadowEntries = detail
    ? Object.entries(detail.shadow).map(([key, value]) => ({
        key,
        label: key,
        value: formatShadowValue(value),
      }))
    : [];

  // GJXA 业务推导（从影子快照提取，无需后端改造）
  const shadow: Record<string, unknown> = detail?.shadow ?? {};
  /** 节点温度列表（node{n}_temperature，按节点号排序） */
  const nodeEntries = Object.entries(shadow)
    .filter(([k]) => isNodeTemperatureKey(k))
    .sort((a, b) => (nodeIdOfKey(a[0]) ?? 0) - (nodeIdOfKey(b[0]) ?? 0))
    .map(([key, temp]) => {
      const nodeId = nodeIdOfKey(key) ?? 0;
      return {
        nodeId,
        temperature: Number(temp),
        battery: shadow[`node${nodeId}_battery`] as number | undefined,
      };
    });
  /** 局放面板（超声波/地电波均值峰值 + 温湿度） */
  const pd = {
    ultrasonicAvg: shadow['ultrasonic_avg'],
    ultrasonicPeak: shadow['ultrasonic_peak'],
    tevAvg: shadow['tev_avg'],
    tevPeak: shadow['tev_peak'],
    temperature: shadow['temperature'],
    humidity: shadow['humidity'],
  };
  const hasPdData = Object.values(pd).some((v) => v !== undefined);
  /** 登录信息（MAC / CCID，登录帧落影子） */
  const loginMac = shadow['mac'];
  const loginCcid = shadow['ccid'];

  /** 节点温度状态色（与总览一致：≥70 红 / ≥50 橙 / 正常蓝） */
  const tempColor = (t: number): string => TEMPERATURE_LEVEL_COLOR[temperatureLevel(t)];

  return (
    <PageContainer
      title="设备管理"
      extra={[
        <Button key="reload" icon={<ReloadOutlined />} onClick={reload}>
          刷新
        </Button>,
        <Button
          key="create"
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          注册设备
        </Button>,
      ]}
    >
      {/* 设备统计 */}
      <Space style={{ marginBottom: 12 }} size={12}>
        <Alert
          style={{ padding: '4px 16px' }}
          type="info"
          showIcon={false}
          message={
            <Typography.Text>
              设备总数 <Typography.Text strong>{counts.total}</Typography.Text> · 在线{' '}
              <Typography.Text strong type="success">
                {counts.online}
              </Typography.Text>
            </Typography.Text>
          }
        />
      </Space>

      <ProTable<IotDevice>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        onRow={(r) => {
          const t = r.maxTemperature;
          return {
            style:
              t !== null && t !== undefined && temperatureLevel(t) === 'alert'
                ? { background: '#fff1f0' }
                : undefined,
          };
        }}
        request={async (params) => {
          try {
            const keyword =
              (params.keyword as string | undefined) ?? (params.name as string | undefined);
            const data = await listIotDevices({
              productId: productFilter,
              status: statusFilter === 'ALL' ? undefined : statusFilter,
              keyword,
            });
            return { data, success: true, total: data.length };
          } catch (e) {
            handleError(e);
            return { data: [], success: false, total: 0 };
          }
        }}
        search={{ labelWidth: 'auto' }}
        dateFormatter="string"
        headerTitle="设备列表（租户内数据）"
        toolBarRender={() => [
          <Select
            key="product-filter"
            style={{ width: 180 }}
            placeholder="按产品筛选"
            allowClear
            options={products.map((p) => ({ label: p.name, value: p.id }))}
            value={productFilter}
            onChange={(v) => {
              setProductFilter(v);
              actionRef.current?.reload();
            }}
          />,
          <Segmented
            key="status-filter"
            value={statusFilter}
            onChange={(v) => {
              setStatusFilter(v as DeviceStatusFilter);
              actionRef.current?.reload();
            }}
            options={[
              { label: '全部', value: 'ALL' },
              { label: '在线', value: 'ONLINE' },
              { label: '离线', value: 'OFFLINE' },
            ]}
          />,
        ]}
        options={{ setting: { draggable: true, checkable: true } }}
        cardBordered
      />

      {/* 新建 / 编辑设备 */}
      <ModalForm<DeviceFormValues>
        key={editing?.id ?? 'create'}
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) {
            setEditing(null);
            setPendingPhoto(null);
            setPhotoRemoved(false);
          }
        }}
        title={editing ? `编辑设备：${editing.name}` : '注册设备'}
        width={460}
        modalProps={{ destroyOnClose: true, maskClosable: false }}
        initialValues={
          editing
            ? {
                name: editing.name,
                productId: editing.productId,
                groupName: editing.groupName ?? undefined,
                installAddress: editing.installAddress ?? undefined,
                photoUrl: editing.photoUrl ?? undefined,
                remark: editing.remark ?? undefined,
              }
            : {}
        }
        onFinish={onFinish}
        submitter={{ searchConfig: { submitText: '保存', resetText: '取消' } }}
      >
        <ProFormText
          name="name"
          label="设备名称"
          rules={[{ required: true, message: '请输入设备名称' }]}
          placeholder="如：车间1号温湿度计"
        />
        <ProFormSelect
          name="productId"
          label="所属产品"
          rules={[{ required: true, message: '请选择产品' }]}
          disabled={!!editing}
          options={products.map((p) => ({ label: `${p.name}（${p.protocolType}）`, value: p.id }))}
          placeholder="请先在产品物模型页创建产品"
        />
        <ProFormText
          name="deviceKey"
          label="设备 Key（选填）"
          disabled={!!editing}
          placeholder="私有协议设备填设备号（如 0610000012）；缺省自动生成"
        />
        <ProFormText
          name="deviceSecret"
          label="设备密钥（选填）"
          disabled={!!editing}
          placeholder="私有协议设备填约定密钥；缺省自动生成"
        />
        <ProFormText name="groupName" label="分组" placeholder="如：车间A / 1号机房" />
        <ProFormText
          name="installAddress"
          label="安装地址"
          placeholder="如：南湖变电站 3 号电缆井（电网项目必填）"
        />
        <Form.Item label="设备照片">
          <DevicePhotoInput
            currentUrl={editing?.photoUrl}
            pendingFile={pendingPhoto}
            removed={photoRemoved}
            onPick={(f) => {
              setPendingPhoto(f);
              if (f) setPhotoRemoved(false);
            }}
            onRemove={() => {
              setPhotoRemoved(true);
              setPendingPhoto(null);
            }}
          />
        </Form.Item>
        <ProFormTextArea name="remark" label="备注" placeholder="选填" />
      </ModalForm>

      {/* 设备凭证（创建后一次性展示） */}
      <ModalForm
        open={credential !== null}
        onOpenChange={(open) => {
          if (!open) setCredential(null);
        }}
        title="设备接入凭证"
        width={520}
        submitter={false}
        modalProps={{ destroyOnClose: true, maskClosable: false }}
      >
        {credential && (
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            <Alert
              type="warning"
              showIcon
              message="凭证只在创建时展示一次，请立即保存；设备接入（TCP AUTH 握手 / HTTP X-Device-Secret）均需使用。"
            />
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="设备 Key">
                <Typography.Text
                  code
                  copyable={{ text: credential.deviceKey, tooltips: ['复制', '已复制'] }}
                >
                  {credential.deviceKey}
                </Typography.Text>
              </Descriptions.Item>
              <Descriptions.Item label="设备密钥（Secret）">
                <Typography.Text
                  code
                  copyable={{ text: credential.deviceSecret ?? '', tooltips: ['复制', '已复制'] }}
                >
                  {credential.deviceSecret ?? '—'}
                </Typography.Text>
              </Descriptions.Item>
              <Descriptions.Item label="接入协议">
                {detailProduct?.protocolType ? (
                  <Tag>{detailProduct.protocolType}</Tag>
                ) : (
                  '按所属产品协议'
                )}
              </Descriptions.Item>
            </Descriptions>
            <Button block onClick={() => setCredential(null)}>
              我已保存
            </Button>
          </Space>
        )}
      </ModalForm>

      {/* 设备详情抽屉 */}
      <Drawer
        open={detail !== null}
        onClose={() => setDetail(null)}
        width={760}
        title={detail ? `设备详情：${detail.device.name}` : '设备详情'}
        loading={detailLoading}
      >
        {detail && (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="设备名称">{detail.device.name}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={DEVICE_STATUS_META[detail.device.status].color}>
                  {DEVICE_STATUS_META[detail.device.status].text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="产品">
                {productName.get(detail.device.productId) ?? `#${detail.device.productId}`}
              </Descriptions.Item>
              <Descriptions.Item label="分组">{detail.device.groupName ?? '—'}</Descriptions.Item>
              <Descriptions.Item label="设备 Key" span={2}>
                <Typography.Text
                  code
                  copyable={{ text: detail.device.deviceKey, tooltips: ['复制', '已复制'] }}
                  style={{ fontSize: 12 }}
                >
                  {detail.device.deviceKey}
                </Typography.Text>
              </Descriptions.Item>
              <Descriptions.Item label="MAC（登录）">
                {loginMac ? (
                  <Typography.Text code style={{ fontSize: 12 }}>
                    {String(loginMac)}
                  </Typography.Text>
                ) : (
                  '—'
                )}
              </Descriptions.Item>
              <Descriptions.Item label="物联网卡 CCID">
                {loginCcid ? (
                  <Typography.Text
                    code
                    copyable={{ text: String(loginCcid), tooltips: ['复制', '已复制'] }}
                    style={{ fontSize: 12 }}
                  >
                    {String(loginCcid)}
                  </Typography.Text>
                ) : (
                  '—'
                )}
              </Descriptions.Item>
              <Descriptions.Item label="最后在线">
                {detail.device.lastOnlineAt ?? '—'}
              </Descriptions.Item>
              <Descriptions.Item label="最后离线">
                {detail.device.lastOfflineAt ?? '—'}
              </Descriptions.Item>
              <Descriptions.Item label="安装地址">
                {detail.device.installAddress ?? '—'}
              </Descriptions.Item>
              <Descriptions.Item label="设备照片">
                <img
                  src={detail.device.photoUrl || '/device-placeholder.svg'}
                  alt={detail.device.name}
                  style={{
                    width: 160,
                    height: 100,
                    objectFit: 'cover',
                    borderRadius: 6,
                    border: '1px solid #f0f0f0',
                  }}
                />
              </Descriptions.Item>
            </Descriptions>

            <Tabs
              defaultActiveKey="shadow"
              items={[
                {
                  key: 'nodes',
                  label: '节点温度',
                  children:
                    nodeEntries.length === 0 ? (
                      <Typography.Text type="secondary">
                        暂无节点温度上报（设备上报后自动显示节点卡片）
                      </Typography.Text>
                    ) : (
                      <Row gutter={[12, 12]}>
                        {nodeEntries.map((n) => (
                          <Col key={n.nodeId} xs={12} sm={8} md={6}>
                            <Card
                              size="small"
                              title={`节点 ${n.nodeId}`}
                              styles={{ body: { textAlign: 'center' } }}
                            >
                              <Typography.Text
                                style={{
                                  fontSize: 26,
                                  fontWeight: 600,
                                  color: tempColor(n.temperature),
                                }}
                              >
                                {n.temperature}℃
                              </Typography.Text>
                              <div style={{ marginTop: 4 }}>
                                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                                  电池{' '}
                                  {n.battery !== undefined && Number.isFinite(n.battery)
                                    ? `${n.battery.toFixed(1)}V`
                                    : '—'}
                                </Typography.Text>
                              </div>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    ),
                },
                {
                  key: 'pd',
                  label: '局放面板',
                  children: !hasPdData ? (
                    <Typography.Text type="secondary">
                      暂无局放数据（设备上报后展示超声波/地电波）
                    </Typography.Text>
                  ) : (
                    <Row gutter={[12, 12]}>
                      {[
                        { label: '超声波均值', value: pd.ultrasonicAvg, unit: 'dBuv' },
                        { label: '超声波峰值', value: pd.ultrasonicPeak, unit: 'dBuv' },
                        { label: '地电波均值', value: pd.tevAvg, unit: 'dBmv' },
                        { label: '地电波峰值', value: pd.tevPeak, unit: 'dBmv' },
                      ].map((m) => (
                        <Col key={m.label} xs={12} sm={6}>
                          <Card size="small" styles={{ body: { textAlign: 'center' } }}>
                            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                              {m.label}
                            </Typography.Text>
                            <div>
                              <Typography.Text style={{ fontSize: 22, fontWeight: 600 }}>
                                {m.value !== undefined ? String(m.value) : '—'}
                              </Typography.Text>
                              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                                {' '}
                                {m.unit}
                              </Typography.Text>
                            </div>
                          </Card>
                        </Col>
                      ))}
                      <Col span={24}>
                        <Typography.Text type="secondary">
                          环境温度 {pd.temperature !== undefined ? `${pd.temperature}℃` : '—'} ·
                          湿度 {pd.humidity !== undefined ? `${pd.humidity}%` : '—'}
                        </Typography.Text>
                      </Col>
                    </Row>
                  ),
                },
                {
                  key: 'shadow',
                  label: '设备影子（最新属性）',
                  children:
                    shadowEntries.length === 0 ? (
                      <Typography.Text type="secondary">暂无属性上报</Typography.Text>
                    ) : (
                      <Table
                        size="small"
                        rowKey="key"
                        dataSource={shadowEntries}
                        pagination={false}
                        columns={[
                          { title: '属性', dataIndex: 'label', width: 180 },
                          { title: '最新值', dataIndex: 'value' },
                        ]}
                      />
                    ),
                },
                {
                  key: 'history',
                  label: '属性时序',
                  children: (
                    <Space direction="vertical" size={8} style={{ width: '100%' }}>
                      <Space wrap>
                        <Select
                          style={{ width: 200 }}
                          placeholder="按属性 Key 过滤（默认全部）"
                          allowClear
                          options={detailProperties.map((p) => ({
                            label: `${p.label}（${p.name}）`,
                            value: p.name,
                          }))}
                          value={historyKey || undefined}
                          onChange={(v) => {
                            setHistoryKey(v ?? '');
                            loadHistory(detail.device.id, v ?? '');
                          }}
                        />
                        <Button
                          size="small"
                          icon={<ReloadOutlined />}
                          onClick={() => loadHistory(detail.device.id, historyKey)}
                        >
                          刷新
                        </Button>
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                          选择单个属性后展示遥测曲线（多节点温度对比后续支持）
                        </Typography.Text>
                      </Space>
                      {historyKey && historyPoints.length > 0 && (
                        <Card size="small" title={`遥测曲线：${historyKey}`}>
                          <LineChart data={historyPoints} width={640} height={200} />
                        </Card>
                      )}
                      <Table<DevicePropertyRecord>
                        size="small"
                        rowKey="id"
                        loading={historyLoading}
                        dataSource={history}
                        columns={historyColumns}
                        pagination={{ pageSize: 10, showSizeChanger: false }}
                        locale={{ emptyText: '暂无上报记录' }}
                      />
                    </Space>
                  ),
                },
                {
                  key: 'events',
                  label: '设备事件',
                  children: (
                    <Table<DeviceEventRecord>
                      size="small"
                      rowKey="id"
                      loading={eventsLoading}
                      dataSource={events}
                      columns={eventColumns}
                      pagination={{ pageSize: 10, showSizeChanger: false }}
                      locale={{ emptyText: '暂无事件' }}
                    />
                  ),
                },
              ]}
            />
          </Space>
        )}
      </Drawer>
    </PageContainer>
  );
}
