/**
 * 物联网 · 产品物模型管理页（ADR-0040 · Phase 2）.
 *
 * 产品 CRUD + 物模型定义管理（属性 + 命令，Drawer 内维护）。
 */
import { useState } from 'react';
import {
  App,
  Button,
  Drawer,
  Popconfirm,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  type TableProps,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SettingOutlined,
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

import { useApiError } from '../../hooks/useApiError';
import {
  addProductProperty,
  createIotProduct,
  deleteIotProduct,
  getIotProductDetail,
  listIotProducts,
  removeProductProperty,
  updateIotProduct,
} from '../../services/iot';
import {
  IOT_DATA_TYPE_META,
  IOT_PROTOCOL_META,
  type IotProduct,
  type ProductDetail,
  type ProductProperty,
} from '@lieshoucloud/types/business/iot';

interface ProductFormValues {
  name: string;
  code?: string;
  protocolType: string;
  description?: string;
}

interface PropertyFormValues {
  name: string;
  label: string;
  dataType: string;
  unit?: string;
  rw?: string;
  sortOrder?: number;
  description?: string;
}

/** 属性定义列（属性表专用） */
const detailColumns: NonNullable<TableProps<ProductProperty>['columns']> = [
  { title: 'Key', dataIndex: 'name', width: 140, ellipsis: true },
  { title: '显示名', dataIndex: 'label', width: 120 },
  { title: '类型', dataIndex: 'dataType', width: 90 },
  { title: '单位', dataIndex: 'unit', width: 80 },
  { title: '读写', dataIndex: 'rw', width: 70 },
];

export default function IotProducts() {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const { message: messageApi } = App.useApp();
  const handleError = useApiError();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IotProduct | null>(null);

  // 详情抽屉（属性；命令定义已按需求屏蔽——无数据下发场景）
  const [detail, setDetail] = useState<ProductDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [propModalOpen, setPropModalOpen] = useState(false);

  const reload = () => actionRef.current?.reload();

  const openDetail = (product: IotProduct) => {
    setDetailLoading(true);
    getIotProductDetail(product.id)
      .then((d) => {
        setDetail(d);
        // 刷新列表里的名称/状态可能变化
        reload();
      })
      .catch(handleError)
      .finally(() => setDetailLoading(false));
  };

  const columns: ProColumns<IotProduct>[] = [
    { title: 'ID', dataIndex: 'id', width: 60, search: false },
    { title: '产品名称', dataIndex: 'name', width: 180 },
    {
      title: '编码',
      dataIndex: 'code',
      width: 130,
      search: false,
      render: (_, r) => r.code ?? '—',
    },
    {
      title: '协议类型',
      dataIndex: 'protocolType',
      width: 110,
      search: false,
      render: (_, r) => {
        const meta = IOT_PROTOCOL_META[r.protocolType];
        return meta ? <Tag color={meta.color}>{meta.text}</Tag> : <Tag>{r.protocolType}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      width: 90,
      search: false,
      render: (_, r) => (r.enabled ? <Tag color="green">启用</Tag> : <Tag color="red">停用</Tag>),
    },
    {
      title: '描述',
      dataIndex: 'description',
      search: false,
      ellipsis: true,
      render: (_, r) =>
        r.description ? (
          <Tooltip title={r.description}>
            <span>{r.description}</span>
          </Tooltip>
        ) : (
          '—'
        ),
    },
    { title: '创建时间', dataIndex: 'createdAt', valueType: 'dateTime', width: 160, search: false },
    {
      title: '操作',
      valueType: 'option',
      width: 260,
      render: (_, row) => [
        <Button
          key="detail"
          type="link"
          size="small"
          icon={<SettingOutlined />}
          onClick={() => openDetail(row)}
        >
          物模型
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
          title="删除该产品？（同时删除其属性/命令定义；有设备的产品无法删除）"
          okText="删除"
          cancelText="取消"
          okButtonProps={{ danger: true }}
          onConfirm={async () => {
            try {
              await deleteIotProduct(row.id);
              messageApi.success('已删除');
              reload();
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

  const onFinish = async (values: ProductFormValues) => {
    try {
      const payload = {
        name: String(values.name),
        code: values.code ? String(values.code) : undefined,
        protocolType: String(values.protocolType),
        description: values.description ? String(values.description) : undefined,
      };
      if (editing) {
        await updateIotProduct(editing.id, payload);
        messageApi.success('已保存');
      } else {
        await createIotProduct(payload);
        messageApi.success('已创建');
      }
      setModalOpen(false);
      setEditing(null);
      reload();
      return true;
    } catch (e) {
      handleError(e);
      return false;
    }
  };

  const onAddProperty = async (values: PropertyFormValues) => {
    if (!detail) return;
    try {
      await addProductProperty(detail.product.id, {
        name: String(values.name),
        label: String(values.label),
        dataType: String(values.dataType),
        unit: values.unit ? String(values.unit) : undefined,
        rw: values.rw ?? 'R',
        sortOrder: values.sortOrder ?? 0,
        description: values.description ? String(values.description) : undefined,
      });
      messageApi.success('已添加属性');
      setPropModalOpen(false);
      openDetail(detail.product);
      return true;
    } catch (e) {
      handleError(e);
      return false;
    }
  };

  // 命令下发功能已按需求屏蔽（无数据下发场景）——addProductCommand 保留在 services/iot.ts 供恢复


  const product = detail?.product;

  return (
    <PageContainer
      title="产品物模型"
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
          新建产品
        </Button>,
      ]}
    >
      <ProTable<IotProduct>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={async (params) => {
          try {
            const keyword =
              (params.keyword as string | undefined) ?? (params.name as string | undefined);
            const data = await listIotProducts(keyword);
            return { data, success: true, total: data.length };
          } catch (e) {
            handleError(e);
            return { data: [], success: false, total: 0 };
          }
        }}
        search={{ labelWidth: 'auto' }}
        dateFormatter="string"
        headerTitle="产品列表（设备型号 + 接入协议，租户内数据）"
        options={{ setting: { draggable: true, checkable: true } }}
        cardBordered
      />

      {/* 新建 / 编辑产品 */}
      <ModalForm<ProductFormValues>
        key={editing?.id ?? 'create'}
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setEditing(null);
        }}
        title={editing ? `编辑产品：${editing.name}` : '新建产品'}
        width={480}
        modalProps={{ destroyOnClose: true, maskClosable: false }}
        initialValues={
          editing
            ? {
                name: editing.name,
                code: editing.code ?? undefined,
                protocolType: editing.protocolType,
                description: editing.description ?? undefined,
              }
            : { protocolType: 'BINARY_FRAME' }
        }
        onFinish={onFinish}
        submitter={{ searchConfig: { submitText: '保存', resetText: '取消' } }}
      >
        <ProFormText
          name="name"
          label="产品名称"
          rules={[{ required: true, message: '请输入产品名称' }]}
          placeholder="如：温湿度传感器"
        />
        <ProFormText name="code" label="产品编码" placeholder="如：TH-SENSOR-01" />
        <ProFormSelect
          name="protocolType"
          label="接入协议"
          rules={[{ required: true, message: '请选择接入协议' }]}
          options={[
            { label: '二进制帧（TCP 9100）', value: 'BINARY_FRAME' },
            { label: 'JSON 行（TCP 9101）', value: 'JSON_LINE' },
            { label: 'HTTP', value: 'HTTP' },
          ]}
          placeholder="与 device-gateway 协议 SPI 对应"
        />
        <ProFormTextArea name="description" label="描述" placeholder="选填" />
      </ModalForm>

      {/* 物模型详情抽屉（属性 + 命令） */}
      <Drawer
        open={detail !== null}
        onClose={() => setDetail(null)}
        width={720}
        title={product ? `物模型：${product.name}` : '物模型'}
        loading={detailLoading}
      >
        {detail && (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            {/* 属性定义 */}
            <div>
              <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 8 }}>
                <Typography.Title level={5} style={{ margin: 0 }}>
                  属性定义
                </Typography.Title>
                <Button
                  size="small"
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setPropModalOpen(true)}
                >
                  添加属性
                </Button>
              </Space>
              <Table<ProductProperty>
                size="small"
                rowKey="id"
                dataSource={detail.properties}
                columns={[
                  ...detailColumns,
                  {
                    title: '操作',
                    width: 70,
                    render: (_, r) => (
                      <Popconfirm
                        title="删除该属性定义？"
                        okText="删除"
                        cancelText="取消"
                        okButtonProps={{ danger: true }}
                        onConfirm={async () => {
                          try {
                            await removeProductProperty(detail.product.id, r.id);
                            messageApi.success('已删除');
                            openDetail(detail.product);
                          } catch (e) {
                            handleError(e);
                          }
                        }}
                      >
                        <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                          删除
                        </Button>
                      </Popconfirm>
                    ),
                  },
                ]}
                pagination={false}
                locale={{ emptyText: '暂无属性定义' }}
              />
            </div>
          </Space>
        )}
      </Drawer>

      {/* 添加属性 */}
      <ModalForm<PropertyFormValues>
        open={propModalOpen}
        onOpenChange={setPropModalOpen}
        title={`添加属性：${product?.name ?? ''}`}
        width={440}
        modalProps={{ destroyOnClose: true, maskClosable: false }}
        initialValues={{ dataType: 'NUMBER', rw: 'R', sortOrder: 0 }}
        onFinish={onAddProperty}
        submitter={{ searchConfig: { submitText: '保存', resetText: '取消' } }}
      >
        <ProFormText
          name="name"
          label="属性 Key"
          rules={[{ required: true, message: '请输入属性 Key（设备报文字段名）' }]}
          placeholder="如：temperature"
        />
        <ProFormText
          name="label"
          label="显示名"
          rules={[{ required: true, message: '请输入显示名' }]}
          placeholder="如：温度"
        />
        <ProFormSelect
          name="dataType"
          label="数据类型"
          rules={[{ required: true, message: '请选择数据类型' }]}
          options={Object.entries(IOT_DATA_TYPE_META).map(([value, label]) => ({ value, label }))}
        />
        <ProFormText name="unit" label="单位" placeholder="如：°C" />
        <ProFormSelect
          name="rw"
          label="读写权限"
          options={[
            { label: '只读 R（设备上报）', value: 'R' },
            { label: '读写 RW（可下发）', value: 'RW' },
          ]}
        />
        <ProFormTextArea name="description" label="描述" placeholder="选填" />
      </ModalForm>
    </PageContainer>
  );
}
