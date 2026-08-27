/**
 * 进销存 · 商品管理页（Phase 9）.
 *
 * 商品 CRUD + 出入库 Modal + 流水抽屉。库存由后端事务内自动增减（IN + / OUT -）。
 */
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  App,
  Button,
  Drawer,
  Form,
  Popconfirm,
  Segmented,
  Select,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  ExperimentOutlined,
  ImportOutlined,
  UploadOutlined,
  ExportOutlined,
  PlusOutlined,
  ReloadOutlined,
  SwapOutlined,
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

import { useApiError } from '../../hooks/useApiError';
import { getEdition } from '../../config/editions';
import {
  createProduct,
  deleteProduct,
  importProducts,
  listMovements,
  listProducts,
  stockIn,
  stockOut,
  updateProduct,
} from '../../services/inventory';
import { listBatches } from '../../services/quality';
import { MOVEMENT_META, type Product, type StockMovement } from '@lieshoucloud/contract-types/business/inventory';
import type { Batch } from '@lieshoucloud/contract-types/business/quality';
import { PRODUCT_TEMPLATE } from '../../utils/csv';
import ImportModal from '../../components/ImportModal';

interface FormValues {
  name: string;
  code?: string;
  unit?: string;
  price?: number;
  remark?: string;
  // 教育版（zhiye · 课程产品）扩展字段
  lessonCount?: number;
  lessonPrice?: number;
  curriculumUrl?: string;
  ageGroup?: string;
  classMode?: string;
}

/** 教育供应商模式（zhiye · B2B2C）：商品即课程产品，展示课时包/教案字段 */
const eduSupplier = getEdition().eduSupplier === true;

interface StockFormValues {
  quantity: number;
  batchId?: number;
  remark?: string;
}

/** 低库存阈值 */
const LOW_STOCK_THRESHOLD = 5;

/** 库存筛选 */
type StockFilter = 'ALL' | 'LOW' | 'OUT';

/** 库存状态（用于 Tag 色 + 筛选） */
export function stockLevel(qty: number): 'OUT' | 'LOW' | 'OK' {
  if (qty <= 0) return 'OUT';
  if (qty <= LOW_STOCK_THRESHOLD) return 'LOW';
  return 'OK';
}

export default function InventoryList() {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const navigate = useNavigate();
  const { message: messageApi } = App.useApp();
  const handleError = useApiError();

  const [modalOpen, setModalOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [stockOpen, setStockOpen] = useState(false);
  const [stockProduct, setStockProduct] = useState<Product | null>(null);
  const [stockType, setStockType] = useState<'IN' | 'OUT'>('IN');
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [movementOpen, setMovementOpen] = useState(false);
  // ADR-0037：出入库可选挂批次（追溯链路）
  const [stockBatches, setStockBatches] = useState<Batch[]>([]);
  const [stockFilter, setStockFilter] = useState<StockFilter>('ALL');
  const [lowCount, setLowCount] = useState(0);
  const [outCount, setOutCount] = useState(0);

  const reload = () => actionRef.current?.reload();

  const columns: ProColumns<Product>[] = [
    { title: 'ID', dataIndex: 'id', width: 60, search: false },
    { title: '商品名称', dataIndex: 'name', width: 200 },
    {
      title: '编码',
      dataIndex: 'code',
      width: 100,
      search: false,
      render: (_, r) => r.code ?? '—',
    },
    { title: '单位', dataIndex: 'unit', width: 70, search: false, render: (_, r) => r.unit ?? '—' },
    {
      title: '单价',
      dataIndex: 'price',
      width: 100,
      search: false,
      render: (_, r) => {
        const price = r.price;
        return price !== undefined && price !== null ? `¥ ${price.toFixed(2)}` : '—';
      },
    },
    {
      title: '库存',
      dataIndex: 'stockQuantity',
      width: 100,
      search: false,
      sorter: (a, b) => a.stockQuantity - b.stockQuantity,
      render: (_, r) => {
        const level = stockLevel(r.stockQuantity);
        if (level === 'OUT') return <Tag color="red">缺货 {r.stockQuantity}</Tag>;
        if (level === 'LOW') return <Tag color="orange">低库存 {r.stockQuantity}</Tag>;
        return <Tag color="blue">{r.stockQuantity}</Tag>;
      },
    },
    // 教育版（zhiye · 课程产品）列：仅 eduSupplier 版别渲染
    ...(eduSupplier
      ? [
          {
            title: '课时',
            dataIndex: 'lessonCount',
            width: 80,
            search: false,
            render: (_: unknown, r: Product) =>
              r.lessonCount !== undefined && r.lessonCount !== null ? `${r.lessonCount} 课时` : '—',
          },
          {
            title: '单课时价',
            dataIndex: 'lessonPrice',
            width: 110,
            search: false,
            render: (_: unknown, r: Product) =>
              r.lessonPrice !== undefined && r.lessonPrice !== null
                ? `¥ ${r.lessonPrice.toFixed(2)}`
                : '—',
          },
          {
            title: '年龄 / 班型',
            dataIndex: 'ageGroup',
            width: 120,
            search: false,
            render: (_: unknown, r: Product) =>
              [r.ageGroup, r.classMode].filter(Boolean).join(' · ') || '—',
          },
        ]
      : []),
    {
      title: '备注',
      dataIndex: 'remark',
      search: false,
      ellipsis: true,
      render: (_, r) =>
        r.remark ? (
          <Tooltip title={r.remark}>
            <span>{r.remark}</span>
          </Tooltip>
        ) : (
          '—'
        ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      width: 160,
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 280,
      render: (_, row) => [
        <Button
          key="in"
          type="link"
          size="small"
          icon={<ImportOutlined />}
          onClick={() => {
            openStockModal(row, 'IN');
          }}
        >
          入库
        </Button>,
        <Button
          key="out"
          type="link"
          size="small"
          icon={<ExportOutlined />}
          disabled={row.stockQuantity <= 0}
          onClick={() => {
            openStockModal(row, 'OUT');
          }}
        >
          出库
        </Button>,
        <Button
          key="log"
          type="link"
          size="small"
          icon={<SwapOutlined />}
          onClick={() => {
            setStockProduct(row);
            setMovementOpen(true);
            void listMovements(row.id).then(setMovements).catch(handleError);
          }}
        >
          流水
        </Button>,
        <Button
          key="trace"
          type="link"
          size="small"
          icon={<ExperimentOutlined />}
          onClick={() => navigate(`/quality/list?trace=${row.id}`)}
        >
          追溯
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
          title="确定删除该商品？"
          okText="删除"
          cancelText="取消"
          okButtonProps={{ danger: true }}
          onConfirm={async () => {
            try {
              await deleteProduct(row.id);
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

  const onFinish = async (values: FormValues) => {
    try {
      const payload = {
        name: String(values.name),
        code: values.code ? String(values.code) : undefined,
        unit: values.unit ? String(values.unit) : undefined,
        price: values.price,
        remark: values.remark ? String(values.remark) : undefined,
        // 教育版（zhiye · 课程产品）扩展字段
        lessonCount: values.lessonCount ?? undefined,
        lessonPrice: values.lessonPrice ?? undefined,
        curriculumUrl: values.curriculumUrl ? String(values.curriculumUrl) : undefined,
        ageGroup: values.ageGroup ? String(values.ageGroup) : undefined,
        classMode: values.classMode ? String(values.classMode) : undefined,
      };
      if (editing) {
        await updateProduct(editing.id, payload);
        messageApi.success('已保存');
      } else {
        await createProduct(payload);
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

  const onStock = async (values: StockFormValues) => {
    if (!stockProduct) return;
    try {
      const batchId = values.batchId ?? undefined;
      if (stockType === 'IN') {
        await stockIn(stockProduct.id, {
          quantity: values.quantity,
          batchId,
          remark: values.remark,
        });
      } else {
        await stockOut(stockProduct.id, {
          quantity: values.quantity,
          batchId,
          remark: values.remark,
        });
      }
      messageApi.success(
        stockType === 'IN' ? `入库 ${values.quantity}` : `出库 ${values.quantity}`,
      );
      setStockOpen(false);
      reload();
      return true;
    } catch (e) {
      handleError(e);
      return false;
    }
  };

  // ADR-0037：打开出入库 Modal 时预载该商品批次（供挂批次）
  const openStockModal = (row: Product, type: 'IN' | 'OUT') => {
    setStockProduct(row);
    setStockType(type);
    setStockBatches([]);
    setStockOpen(true);
    void listBatches(row.id)
      .then(setStockBatches)
      .catch(() => {});
  };

  return (
    <PageContainer
      title="库存管理"
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
          新建商品
        </Button>,
      ]}
    >
      {/* 低库存预警横幅 */}
      {(lowCount > 0 || outCount > 0) && (
        <Alert
          style={{ marginBottom: 12 }}
          type="warning"
          showIcon
          message={`库存预警：${lowCount} 个商品低库存（≤${LOW_STOCK_THRESHOLD}），${outCount} 个缺货`}
          action={
            <Space size={4}>
              {lowCount > 0 && (
                <Button
                  size="small"
                  onClick={() => {
                    setStockFilter('LOW');
                    actionRef.current?.reload();
                  }}
                >
                  查看低库存
                </Button>
              )}
              {outCount > 0 && (
                <Button
                  size="small"
                  danger
                  onClick={() => {
                    setStockFilter('OUT');
                    actionRef.current?.reload();
                  }}
                >
                  查看缺货
                </Button>
              )}
            </Space>
          }
        />
      )}
      <ProTable<Product>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={async (params) => {
          try {
            const keyword =
              (params.keyword as string | undefined) ?? (params.name as string | undefined);
            const data = await listProducts(keyword);
            // 预警统计（全量，不受筛选影响）
            setLowCount(data.filter((p) => stockLevel(p.stockQuantity) === 'LOW').length);
            setOutCount(data.filter((p) => stockLevel(p.stockQuantity) === 'OUT').length);
            const filtered =
              stockFilter === 'ALL'
                ? data
                : data.filter((p) => {
                    const level = stockLevel(p.stockQuantity);
                    return stockFilter === 'LOW'
                      ? level === 'LOW' || level === 'OUT'
                      : level === 'OUT';
                  });
            return { data: filtered, success: true, total: filtered.length };
          } catch (e) {
            handleError(e);
            return { data: [], success: false, total: 0 };
          }
        }}
        search={{ labelWidth: 'auto' }}
        dateFormatter="string"
        headerTitle="商品列表（库存实时同步，租户内数据）"
        toolBarRender={() => [
          <Segmented
            key="stock-filter"
            value={stockFilter}
            onChange={(v) => {
              setStockFilter(v as StockFilter);
              actionRef.current?.reload();
            }}
            options={[
              { label: '全部', value: 'ALL' },
              { label: '低库存', value: 'LOW' },
              { label: '缺货', value: 'OUT' },
            ]}
          />,
          <Button key="import" icon={<UploadOutlined />} onClick={() => setImportOpen(true)}>
            CSV 导入
          </Button>,
        ]}
        options={{ setting: { draggable: true, checkable: true } }}
        cardBordered
      />

      {/* CSV 导入 */}
      <ImportModal
        open={importOpen}
        title="CSV 导入商品"
        template={PRODUCT_TEMPLATE}
        onImport={(file) => importProducts(file)}
        onClose={() => setImportOpen(false)}
      />

      {/* 新建 / 编辑商品 */}
      <ModalForm<FormValues>
        key={editing?.id ?? 'create'}
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setEditing(null);
        }}
        title={editing ? `编辑商品：${editing.name}` : '新建商品'}
        width={480}
        modalProps={{ destroyOnClose: true, maskClosable: false }}
        initialValues={
          editing
            ? {
                name: editing.name,
                code: editing.code ?? undefined,
                unit: editing.unit ?? undefined,
                price: editing.price ?? undefined,
                remark: editing.remark ?? undefined,
                // 教育版（zhiye · 课程产品）扩展字段
                lessonCount: editing.lessonCount ?? undefined,
                lessonPrice: editing.lessonPrice ?? undefined,
                curriculumUrl: editing.curriculumUrl ?? undefined,
                ageGroup: editing.ageGroup ?? undefined,
                classMode: editing.classMode ?? undefined,
              }
            : {}
        }
        onFinish={onFinish}
        submitter={{ searchConfig: { submitText: '保存', resetText: '取消' } }}
      >
        <ProFormText
          name="name"
          label="商品名称"
          rules={[{ required: true, message: '请输入商品名称' }]}
          placeholder="如：联想 ThinkPad X1"
        />
        <ProFormText name="code" label="商品编码（SKU）" placeholder="如：SKU-001" />
        <ProFormText name="unit" label="单位" placeholder="台 / 件 / kg" />
        <ProFormText name="price" label="单价（元）" placeholder="8999" />
        <ProFormTextArea name="remark" label="备注" placeholder="选填" />
        {/* 教育版（zhiye · 课程产品）扩展字段：仅 eduSupplier 版别渲染 */}
        {eduSupplier && (
          <>
            <ProFormText
              name="lessonCount"
              label="课时数"
              placeholder="如：32"
              rules={[{ pattern: /^\d+$/, message: '请输入正整数' }]}
            />
            <ProFormText
              name="lessonPrice"
              label="单课时价（元）"
              placeholder="如：120"
              rules={[{ pattern: /^\d+(\.\d{1,2})?$/, message: '请输入金额' }]}
            />
            <ProFormText
              name="curriculumUrl"
              label="标准教案 / 大纲"
              placeholder="教案文档 URL / 文件名"
            />
            <ProFormText name="ageGroup" label="适用年龄" placeholder="如：6-12" />
            <ProFormSelect
              name="classMode"
              label="班型"
              options={[
                { label: '小班', value: '小班' },
                { label: '1v1', value: '1v1' },
                { label: '营地', value: '营地' },
              ]}
              placeholder="选择班型"
              allowClear
            />
          </>
        )}
      </ModalForm>

      {/* 出入库 Modal */}
      <ModalForm<StockFormValues>
        open={stockOpen}
        onOpenChange={setStockOpen}
        title={`${stockType === 'IN' ? '入库' : '出库'}：${stockProduct?.name ?? ''}`}
        width={400}
        modalProps={{ destroyOnClose: true, maskClosable: false }}
        onFinish={onStock}
        submitter={{ searchConfig: { submitText: '确认', resetText: '取消' } }}
      >
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Typography.Text type="secondary">
            当前库存：<Tag color="blue">{stockProduct?.stockQuantity ?? 0}</Tag>
            {stockType === 'OUT' && '（不能超过当前库存）'}
          </Typography.Text>
          <ProFormText
            name="quantity"
            label="数量"
            rules={[{ required: true, message: '请输入数量' }]}
            fieldProps={{ type: 'number', min: 1 }}
            placeholder="正整数"
            transform={(v) => Number(v)}
          />
          <Form.Item name="batchId" label="批次(可选)" style={{ marginBottom: 12 }}>
            <Select
              virtual={false}
              allowClear
              showSearch
              placeholder={stockBatches.length ? '挂批次可追溯（选填）' : '该商品暂无批次，可不选'}
              options={stockBatches.map((b) => ({
                label: `${b.batchNo}${b.supplier ? ` · ${b.supplier}` : ''}（${b.quantity}）`,
                value: b.id,
              }))}
            />
          </Form.Item>
          <ProFormTextArea name="remark" label="备注" placeholder="选填" />
        </Space>
      </ModalForm>

      {/* 出入库流水抽屉 */}
      <Drawer
        open={movementOpen}
        onClose={() => setMovementOpen(false)}
        width={420}
        title={`出入库流水：${stockProduct?.name ?? ''}`}
      >
        {movements.length === 0 ? (
          <Typography.Text type="secondary">暂无流水记录</Typography.Text>
        ) : (
          movements.map((m) => (
            <Space
              key={m.id}
              style={{ width: '100%', justifyContent: 'space-between', padding: '8px 0' }}
            >
              <Space>
                <Tag color={MOVEMENT_META[m.type].color}>{MOVEMENT_META[m.type].text}</Tag>
                <Typography.Text strong>{m.quantity}</Typography.Text>
                {m.remark && <Typography.Text type="secondary">{m.remark}</Typography.Text>}
              </Space>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {m.createdAt}
              </Typography.Text>
            </Space>
          ))
        )}
      </Drawer>
    </PageContainer>
  );
}
