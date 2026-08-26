/**
 * 质检追溯页（ADR-0037 · jmzz 制造版能力）.
 *
 * 两个 Tab：
 *  - 质检记录：IQC 来料 / IPQC 制程 / FQC 成品检验记录（新建 Modal + 筛选）
 *  - 批次追溯：批次列表（新建 Modal）+ 详情抽屉（该批次质检 + 出入库流水链路）
 * 商品追溯入口：库存列表操作列「追溯」按钮 → 本页批次 Tab 打开商品追溯抽屉。
 */
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  App,
  Button,
  DatePicker,
  Descriptions,
  Drawer,
  Form,
  Select,
  Table,
  Tabs,
  Tag,
  Timeline,
  Typography,
} from 'antd';
import { PlusOutlined, ReloadOutlined, ExperimentOutlined } from '@ant-design/icons';
import { ModalForm, PageContainer, ProFormText, ProFormTextArea, ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';

import { useApiError } from '../../hooks/useApiError';
import {
  createBatch,
  createInspection,
  getBatchDetail,
  getProductTrace,
  listBatches,
  listInspections,
} from '../../services/quality';
import { listProducts } from '../../services/inventory';
import type { Product } from '../../types/inventory';
import {
  INSPECTION_RESULT_META,
  INSPECTION_TYPE_META,
  type Batch,
  type BatchDetail,
  type InspectionResult,
  type InspectionType,
  type ProductTrace,
  type QualityInspection,
} from '../../types/quality';

type TabKey = 'inspections' | 'batches';

export default function QualityList() {
  const { message: messageApi } = App.useApp();
  const handleError = useApiError();
  const [searchParams] = useSearchParams();

  const inspectionRef = useRef<ActionType | undefined>(undefined);
  const batchRef = useRef<ActionType | undefined>(undefined);

  const [tab, setTab] = useState<TabKey>('inspections');
  const [inspectionOpen, setInspectionOpen] = useState(false);
  const [batchOpen, setBatchOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [batchDetail, setBatchDetail] = useState<BatchDetail | null>(null);
  const [trace, setTrace] = useState<ProductTrace | null>(null);
  const [traceProduct, setTraceProduct] = useState<Product | null>(null);
  const [traceOpen, setTraceOpen] = useState(false);
  // 新建质检：商品 → 批次联动
  const [inspectionBatches, setInspectionBatches] = useState<Batch[]>([]);

  // 商品下拉（新建质检/批次共用，加载一次）
  const loadProducts = () => {
    void listProducts()
      .then(setProducts)
      .catch(handleError);
  };
  useEffect(loadProducts, []);

  // 来自库存列表「追溯」按钮：/quality/list?trace=<productId> 自动打开商品追溯抽屉
  useEffect(() => {
    const traceId = searchParams.get('trace');
    if (!traceId) return;
    const id = Number(traceId);
    if (!Number.isFinite(id) || id <= 0) return;
    void listProducts()
      .then((list) => {
        const p = list.find((x) => x.id === id);
        if (!p) {
          messageApi.warning('商品不存在或不在当前租户');
          return;
        }
        void getProductTrace(p.id)
          .then((t) => {
            setTraceProduct(p);
            setTrace(t);
            setTraceOpen(true);
          })
          .catch(handleError);
      })
      .catch(handleError);
  }, [searchParams]);

  const reloadActive = () => {
    if (tab === 'inspections') inspectionRef.current?.reload();
    else batchRef.current?.reload();
  };

  const inspectionColumns: ProColumns<QualityInspection>[] = [
    { title: 'ID', dataIndex: 'id', width: 60, search: false },
    { title: '商品 ID', dataIndex: 'productId', width: 90, search: false },
    { title: '检验类型', dataIndex: 'type', width: 110, valueType: 'select', valueEnum: {
        IQC: { text: '来料检验', status: 'Processing' },
        IPQC: { text: '制程检验', status: 'Processing' },
        FQC: { text: '成品检验', status: 'Processing' },
      }, render: (_, r) => <Tag color={INSPECTION_TYPE_META[r.type].color}>{INSPECTION_TYPE_META[r.type].text}</Tag> },
    {
      title: '结果',
      dataIndex: 'result',
      width: 100,
      valueType: 'select',
      valueEnum: {
        PASS: { text: '合格', status: 'Success' },
        FAIL: { text: '不合格', status: 'Error' },
      },
      render: (_, r) => <Tag color={INSPECTION_RESULT_META[r.result].color}>{INSPECTION_RESULT_META[r.result].text}</Tag>,
    },
    { title: '数量', dataIndex: 'quantity', width: 90, search: false },
    { title: '检验员', dataIndex: 'inspector', width: 110, search: false, render: (_, r) => r.inspector ?? '—' },
    { title: '检验日期', dataIndex: 'inspectedAt', valueType: 'dateTime', width: 160, search: false },
    { title: '备注', dataIndex: 'remark', ellipsis: true, search: false, render: (_, r) => r.remark ?? '—' },
  ];

  const batchColumns: ProColumns<Batch>[] = [
    { title: 'ID', dataIndex: 'id', width: 60, search: false },
    { title: '批次号', dataIndex: 'batchNo', width: 170 },
    { title: '商品 ID', dataIndex: 'productId', width: 90, search: false },
    { title: '供应商', dataIndex: 'supplier', width: 170, search: false, render: (_, r) => r.supplier ?? '—' },
    { title: '批次数量', dataIndex: 'quantity', width: 100, search: false },
    { title: '创建时间', dataIndex: 'createdAt', valueType: 'dateTime', width: 160, search: false },
    {
      title: '操作',
      valueType: 'option',
      width: 120,
      render: (_, row) => [
        <Button key="detail" type="link" size="small" onClick={() => openBatchDetail(row.id)}>
          追溯
        </Button>,
      ],
    },
  ];

  const openBatchDetail = async (id: number) => {
    try {
      setBatchDetail(await getBatchDetail(id));
    } catch (e) {
      handleError(e);
    }
  };

  const openProductTrace = async (p: Product) => {
    try {
      setTraceProduct(p);
      setTrace(await getProductTrace(p.id));
      setTraceOpen(true);
    } catch (e) {
      handleError(e);
    }
  };
  void openProductTrace;

  const productSelectOptions = products.map((p) => ({
    label: `${p.name}${p.code ? ` (${p.code})` : ''} #${p.id}`,
    value: p.id,
  }));

  const batchSelectOptions = inspectionBatches.map((b) => ({
    label: `${b.batchNo}${b.supplier ? ` · ${b.supplier}` : ''}（${b.quantity}）`,
    value: b.id,
  }));

  const onInspectionProductChange = async (productId: number | undefined) => {
    setInspectionBatches([]);
    if (!productId) return;
    try {
      setInspectionBatches(await listBatches(productId));
    } catch (e) {
      handleError(e);
    }
  };

  return (
    <PageContainer
      title="质检追溯"
      extra={[
        <Button key="reload" icon={<ReloadOutlined />} onClick={reloadActive}>
          刷新
        </Button>,
        <Button key="inspection" type="primary" icon={<PlusOutlined />} onClick={() => setInspectionOpen(true)}>
          新建质检
        </Button>,
        <Button key="batch" icon={<ExperimentOutlined />} onClick={() => setBatchOpen(true)}>
          新建批次
        </Button>,
      ]}
    >
      <Tabs
        activeKey={tab}
        onChange={(k) => setTab(k as TabKey)}
        items={[
          {
            key: 'inspections',
            label: '质检记录',
            children: (
              <ProTable<QualityInspection>
                actionRef={inspectionRef}
                rowKey="id"
                columns={inspectionColumns}
                request={async (params) => {
                  try {
                    const data = await listInspections({
                      type: params.type as InspectionType | undefined,
                      result: params.result as InspectionResult | undefined,
                    });
                    return { data, success: true, total: data.length };
                  } catch (e) {
                    handleError(e);
                    return { data: [], success: false };
                  }
                }}
              />
            ),
          },
          {
            key: 'batches',
            label: '批次追溯',
            children: (
              <ProTable<Batch>
                actionRef={batchRef}
                rowKey="id"
                columns={batchColumns}
                request={async (params) => {
                  try {
                    const keyword = (params.batchNo as string | undefined) ?? undefined;
                    const data = await listBatches(undefined, keyword);
                    return { data, success: true, total: data.length };
                  } catch (e) {
                    handleError(e);
                    return { data: [], success: false };
                  }
                }}
              />
            ),
          },
        ]}
      />

      {/* 新建质检记录 */}
      <ModalForm
        title="新建质检记录"
        open={inspectionOpen}
        onOpenChange={setInspectionOpen}
        modalProps={{ destroyOnClose: true }}
        onFinish={async (values) => {
          try {
            await createInspection({
              productId: values.productId,
              batchId: values.batchId ?? undefined,
              type: values.type,
              result: values.result,
              quantity: values.quantity,
              inspector: values.inspector,
              inspectedAt: values.inspectedAt ? values.inspectedAt.toISOString() : undefined,
              remark: values.remark,
            });
            messageApi.success('质检记录已创建');
            reloadActive();
            return true;
          } catch (e) {
            handleError(e);
            return false;
          }
        }}
      >
        <Form.Item name="productId" label="商品" rules={[{ required: true, message: '请选择商品' }]}>
          <Select virtual={false} showSearch options={productSelectOptions} placeholder="选择商品" onChange={onInspectionProductChange} />
        </Form.Item>
        <Form.Item name="batchId" label="批次(可选)">
          <Select virtual={false}
            allowClear
            showSearch
            placeholder="IQC 建议关联批次（先选商品）"
            options={batchSelectOptions}
          />
        </Form.Item>
        <Form.Item name="type" label="检验类型" rules={[{ required: true }]}>
          <Select virtual={false}
            options={[
              { label: '来料检验 (IQC)', value: 'IQC' },
              { label: '制程检验 (IPQC)', value: 'IPQC' },
              { label: '成品检验 (FQC)', value: 'FQC' },
            ]}
          />
        </Form.Item>
        <Form.Item name="result" label="检验结果" rules={[{ required: true }]}>
          <Select virtual={false}
            options={[
              { label: '合格 (PASS)', value: 'PASS' },
              { label: '不合格 (FAIL)', value: 'FAIL' },
            ]}
          />
        </Form.Item>
        <Form.Item name="quantity" label="检验数量" rules={[{ required: true, message: '请填写数量' }]}>
          <ProFormText fieldProps={{ type: 'number' }} placeholder=">0" />
        </Form.Item>
        <Form.Item name="inspector" label="检验员">
          <ProFormText placeholder="检验员姓名" />
        </Form.Item>
        <Form.Item name="inspectedAt" label="检验日期">
          <DatePicker showTime style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="remark" label="备注">
          <ProFormTextArea placeholder="不合格原因等" />
        </Form.Item>
      </ModalForm>

      {/* 新建批次 */}
      <ModalForm
        title="新建批次"
        open={batchOpen}
        onOpenChange={setBatchOpen}
        modalProps={{ destroyOnClose: true }}
        onFinish={async (values) => {
          try {
            await createBatch({
              productId: values.productId,
              batchNo: values.batchNo,
              supplier: values.supplier,
              quantity: values.quantity,
              remark: values.remark,
            });
            messageApi.success('批次已创建（注意：批次仅作追溯，需另做出入库入库）');
            reloadActive();
            return true;
          } catch (e) {
            handleError(e);
            return false;
          }
        }}
      >
        <Form.Item name="productId" label="商品" rules={[{ required: true, message: '请选择商品' }]}>
          <Select virtual={false} showSearch options={productSelectOptions} placeholder="选择商品" />
        </Form.Item>
        <Form.Item name="batchNo" label="批次号" rules={[{ required: true, message: '请填写批次号' }]}>
          <ProFormText placeholder="如 B20260826-001（租户内唯一）" />
        </Form.Item>
        <Form.Item name="supplier" label="供应商">
          <ProFormText placeholder="供应商名称" />
        </Form.Item>
        <Form.Item name="quantity" label="批次数量" rules={[{ required: true, message: '请填写数量' }]}>
          <ProFormText fieldProps={{ type: 'number' }} placeholder=">0" />
        </Form.Item>
        <Form.Item name="remark" label="备注">
          <ProFormTextArea />
        </Form.Item>
      </ModalForm>

      {/* 批次追溯抽屉 */}
      <Drawer
        title={batchDetail ? `批次追溯 · ${batchDetail.batch.batchNo}` : '批次追溯'}
        open={!!batchDetail}
        onClose={() => setBatchDetail(null)}
        width={560}
      >
        {batchDetail && (
          <>
            <Descriptions column={1} size="small" bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="商品">
                {batchDetail.productName ?? `#${batchDetail.batch.productId}`}
              </Descriptions.Item>
              <Descriptions.Item label="供应商">{batchDetail.batch.supplier ?? '—'}</Descriptions.Item>
              <Descriptions.Item label="批次数量">{batchDetail.batch.quantity}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{new Date(batchDetail.batch.createdAt).toLocaleString()}</Descriptions.Item>
              {batchDetail.batch.remark && (
                <Descriptions.Item label="备注">{batchDetail.batch.remark}</Descriptions.Item>
              )}
            </Descriptions>
            <Typography.Title level={5}>质检记录</Typography.Title>
            {batchDetail.inspections.length === 0 ? (
              <Typography.Text type="secondary">该批次暂无质检记录</Typography.Text>
            ) : (
              <Table
                size="small"
                rowKey="id"
                pagination={false}
                dataSource={batchDetail.inspections}
                columns={[
                  { title: '类型', dataIndex: 'type', width: 100, render: (_, r) => (
                      <Tag color={INSPECTION_TYPE_META[r.type].color}>{INSPECTION_TYPE_META[r.type].text}</Tag>
                    ) },
                  { title: '结果', dataIndex: 'result', width: 90, render: (_, r) => (
                      <Tag color={INSPECTION_RESULT_META[r.result].color}>{INSPECTION_RESULT_META[r.result].text}</Tag>
                    ) },
                  { title: '数量', dataIndex: 'quantity', width: 70 },
                  { title: '检验员', dataIndex: 'inspector', render: (_, r) => r.inspector ?? '—' },
                ]}
              />
            )}
            <Typography.Title level={5} style={{ marginTop: 16 }}>
              出入库流水
            </Typography.Title>
            {batchDetail.movements.length === 0 ? (
              <Typography.Text type="secondary">该批次暂无出入库流水</Typography.Text>
            ) : (
              <Timeline
                items={batchDetail.movements.map((m) => ({
                  color: m.type === 'IN' ? 'green' : 'orange',
                  children: (
                    <>
                      <Tag color={m.type === 'IN' ? 'green' : 'orange'}>{m.type === 'IN' ? '入库' : '出库'}</Tag>
                      {m.quantity} {new Date(m.createdAt).toLocaleString()}
                      {m.remark ? ` · ${m.remark}` : ''}
                    </>
                  ),
                }))}
              />
            )}
          </>
        )}
      </Drawer>

      {/* 商品追溯抽屉 */}
      <Drawer
        title={traceProduct ? `商品追溯 · ${traceProduct.name}` : '商品追溯'}
        open={traceOpen}
        onClose={() => setTraceOpen(false)}
        width={620}
      >
        {trace && (
          <>
            <Descriptions column={2} size="small" bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="商品编码">{trace.product.code ?? '—'}</Descriptions.Item>
              <Descriptions.Item label="当前库存">{trace.product.stockQuantity}</Descriptions.Item>
            </Descriptions>
            <Typography.Title level={5}>批次（{trace.batches.length}）</Typography.Title>
            {trace.batches.length === 0 ? (
              <Typography.Text type="secondary">该商品暂无批次</Typography.Text>
            ) : (
              <Table
                size="small"
                rowKey="id"
                pagination={false}
                dataSource={trace.batches}
                columns={[
                  { title: '批次号', dataIndex: 'batchNo' },
                  { title: '供应商', dataIndex: 'supplier', render: (_, r) => r.supplier ?? '—' },
                  { title: '数量', dataIndex: 'quantity', width: 80 },
                  { title: '操作', width: 80, render: (_, r) => (
                      <Button type="link" size="small" onClick={() => openBatchDetail(r.id)}>
                        追溯
                      </Button>
                    ) },
                ]}
              />
            )}
            <Typography.Title level={5} style={{ marginTop: 16 }}>
              质检记录（{trace.inspections.length}）
            </Typography.Title>
            {trace.inspections.length === 0 ? (
              <Typography.Text type="secondary">该商品暂无质检记录</Typography.Text>
            ) : (
              <Table
                size="small"
                rowKey="id"
                pagination={false}
                dataSource={trace.inspections}
                columns={[
                  { title: '类型', dataIndex: 'type', width: 90, render: (_, r) => (
                      <Tag color={INSPECTION_TYPE_META[r.type].color}>{INSPECTION_TYPE_META[r.type].text}</Tag>
                    ) },
                  { title: '结果', dataIndex: 'result', width: 80, render: (_, r) => (
                      <Tag color={INSPECTION_RESULT_META[r.result].color}>{INSPECTION_RESULT_META[r.result].text}</Tag>
                    ) },
                  { title: '数量', dataIndex: 'quantity', width: 70 },
                  { title: '检验员', dataIndex: 'inspector', render: (_, r) => r.inspector ?? '—' },
                ]}
              />
            )}
          </>
        )}
      </Drawer>
    </PageContainer>
  );
}
