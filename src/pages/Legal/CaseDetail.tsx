import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  App,
  Button,
  Card,
  Descriptions,
  Empty,
  Form,
  Pagination,
  Popconfirm,
  Space,
  Statistic,
  Tabs,
  Tag,
  Timeline,
  Tooltip,
  Upload,
} from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  FileTextOutlined,
  FundOutlined,
  LinkOutlined,
  PlusOutlined,
  ReloadOutlined,
  SendOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import {
  ModalForm,
  PageContainer,
  ProFormDatePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';

import { StatusTag } from '@lieshoucloud/ui';

import { useApiError } from '../../hooks/useApiError';
import { api } from '../../services/api';
import MatterRoom from './MatterRoom';
import {
  confirmCaseLetter,
  createCaseDocument,
  createCaseEvent,
  createCaseExpense,
  createCaseLetter,
  createCaseTimeEntry,
  confirmTimeEntry,
  deleteCaseDocument,
  deleteCaseEvent,
  deleteCaseExpense,
  deleteCaseLetter,
  deleteCaseTimeEntry,
  expenseSummary,
  getCase,
  letterSummary,
  listCaseDocuments,
  listCaseEvents,
  listCaseExpenses,
  listCaseLetters,
  listCaseTimeEntries,
  timeEntrySummary,
  updateCaseDocument,
  updateCaseEvent,
  updateCaseExpense,
  updateCaseLetter,
  updateCaseTimeEntry,
} from '../../services/legal';
import {
  CASE_PRIORITY_META,
  CASE_STAGE_META,
  CASE_STATUS_META,
  CASE_TYPE_META,
  DOC_TYPE_META,
  EVENT_TYPE_META,
  EXPENSE_TYPE_META,
  type CaseEvent,
  type CaseEventRequest,
  type ContactLetter,
  type DocType,
  type DocumentRequest,
  type EventType,
  type Expense,
  type ExpenseRequest,
  type ExpenseSummary,
  type ExpenseType,
  LETTER_DIRECTION_META,
  LETTER_STATUS_META,
  type LegalCase,
  type LegalDocument,
  type LetterRequest,
  type LetterSummary,
  TIME_ENTRY_STATUS_META,
  type TimeEntry,
  type TimeEntryRequest,
  type TimeEntrySummary,
} from '../../types/legal';

const EVENT_OPTIONS = (Object.keys(EVENT_TYPE_META) as EventType[]).map((t) => ({
  label: EVENT_TYPE_META[t].text,
  value: t,
}));

const DOC_OPTIONS = (Object.keys(DOC_TYPE_META) as DocType[]).map((t) => ({
  label: DOC_TYPE_META[t].text,
  value: t,
}));

const EXPENSE_OPTIONS = (Object.keys(EXPENSE_TYPE_META) as ExpenseType[]).map((t) => ({
  label: EXPENSE_TYPE_META[t].text,
  value: t,
}));

interface EventFormValues {
  eventType: EventType;
  occurredAt: string;
  title: string;
  detail?: string;
}

interface DocFormValues {
  title: string;
  docType?: DocType;
  content?: string;
  fileUrl?: string;
  docDate?: string;
}

interface TimeEntryFormValues {
  lawyer: string;
  workDate: string;
  hours: number;
  rate: number;
  description?: string;
}

interface ExpenseFormValues {
  description: string;
  expenseType?: ExpenseType;
  amount: number;
  expenseDate: string;
}

export default function CaseDetail() {
  const { id } = useParams<{ id: string }>();
  const caseId = Number(id);
  const navigate = useNavigate();
  const { message } = App.useApp();
  const handleError = useApiError();
  // 断点续作：支持 ?tab=documents|billing|letters|events 直达对应 Tab（最近工作入口）
  const initialTab = (() => {
    if (typeof window === 'undefined') return 'room';
    const t = new URLSearchParams(window.location.search).get('tab');
    return ['room', 'events', 'documents', 'billing', 'expenses', 'letters'].includes(t ?? '')
      ? (t as string)
      : 'room';
  })();
  const [detail, setDetail] = useState<LegalCase | null>(null);
  const [events, setEvents] = useState<CaseEvent[]>([]);
  const [docTotal, setDocTotal] = useState(0);
  const [billingSummary, setBillingSummary] = useState<TimeEntrySummary | null>(null);
  const [expenseSummaryData, setExpenseSummaryData] = useState<ExpenseSummary | null>(null);
  const [letterSummaryData, setLetterSummaryData] = useState<LetterSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const [c, evs, docPage, bill, exp, letters] = await Promise.all([
        getCase(caseId),
        listCaseEvents(caseId),
        listCaseDocuments(caseId, 1, 1), // 只取 total
        timeEntrySummary(caseId),
        expenseSummary(caseId),
        letterSummary(caseId),
      ]);
      setDetail(c);
      setEvents(evs);
      setDocTotal(docPage.total);
      setBillingSummary(bill);
      setExpenseSummaryData(exp);
      setLetterSummaryData(letters);
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
    }
  }, [caseId, handleError]);

  useEffect(() => {
    void reload();
  }, [reload]);

  if (!detail) {
    return (
      <PageContainer loading={loading}>
        <Empty description="案件不存在或已被删除" />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={detail.caseNo}
      subTitle={detail.title}
      onBack={() => navigate('/legal/cases')}
      backIcon={<ArrowLeftOutlined />}
      extra={[<Button key="refresh" icon={<ReloadOutlined />} onClick={() => void reload()} />]}
    >
      <Card size="small" style={{ marginBottom: 16 }}>
        <Descriptions column={3} size="small">
          <Descriptions.Item label="状态">
            <StatusTag meta={CASE_STATUS_META[detail.status]} />
          </Descriptions.Item>
          <Descriptions.Item label="案件类型">{CASE_TYPE_META[detail.caseType]}</Descriptions.Item>
          <Descriptions.Item label="办理阶段">
            <StatusTag meta={CASE_STAGE_META[detail.stage]} /> {detail.stageProgress}%
          </Descriptions.Item>
          <Descriptions.Item label="承办律师">{detail.responsibleLawyer ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="关注度">
            <StatusTag meta={CASE_PRIORITY_META[detail.priority]} />
          </Descriptions.Item>
          <Descriptions.Item label="我方当事人">{detail.party ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="对方当事人">{detail.oppositeParty ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="受理法院">{detail.court ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="标的额">
            {typeof detail.amount === 'number' ? `¥${detail.amount.toLocaleString()}` : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="立案日期">{detail.filedAt ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="结案日期">{detail.closedAt ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="协办律师">{detail.coLawyer ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="备注" span={2}>
            {detail.remark ?? '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Tabs
        defaultActiveKey={initialTab}
        items={[
          {
            key: 'room',
            label: `案件作战室 · ${CASE_STAGE_META[detail.stage].text}`,
            children: <MatterRoom detail={detail} onChanged={() => void reload()} />,
          },
          {
            key: 'timeline',
            label: `办案时间线（${events.length}）`,
            children: (
              <Card
                size="small"
                title="办案时间线"
                extra={
                  <ModalForm<EventFormValues>
                    title="添加时间线事件"
                    width={520}
                    trigger={
                      <Button type="primary" size="small" icon={<PlusOutlined />}>
                        添加事件
                      </Button>
                    }
                    modalProps={{ destroyOnClose: true }}
                    onFinish={async (values) => {
                      try {
                        await createCaseEvent(caseId, {
                          ...values,
                          occurredAt: toIso(values.occurredAt),
                        } as CaseEventRequest);
                        message.success('事件已添加');
                        await reload();
                        return true;
                      } catch (e) {
                        handleError(e);
                        return false;
                      }
                    }}
                  >
                    <EventFormFields />
                  </ModalForm>
                }
              >
                {events.length === 0 ? (
                  <Empty description="暂无时间线事件，点击「添加事件」开始记录" />
                ) : (
                  <Timeline
                    items={events.map((e) => ({
                      color:
                        EVENT_TYPE_META[e.eventType].color === 'default'
                          ? 'gray'
                          : EVENT_TYPE_META[e.eventType].color,
                      children: (
                        <div>
                          <Space size="middle" wrap>
                            <Tag color={EVENT_TYPE_META[e.eventType].color}>
                              {EVENT_TYPE_META[e.eventType].text}
                            </Tag>
                            <strong>{e.title}</strong>
                            <span style={{ color: '#999', fontSize: 12 }}>
                              {new Date(e.occurredAt).toLocaleString('zh-CN', { hour12: false })}
                            </span>
                            <ModalForm<EventFormValues>
                              key={`edit-${e.id}`}
                              title="编辑事件"
                              width={520}
                              trigger={
                                <Tooltip title="编辑">
                                  <Button type="link" size="small" icon={<EditOutlined />} />
                                </Tooltip>
                              }
                              initialValues={{
                                eventType: e.eventType,
                                occurredAt: e.occurredAt,
                                title: e.title,
                                detail: e.detail ?? undefined,
                              }}
                              onFinish={async (values) => {
                                try {
                                  await updateCaseEvent(e.id, {
                                    ...values,
                                    occurredAt: toIso(values.occurredAt),
                                  } as CaseEventRequest);
                                  message.success('已更新');
                                  await reload();
                                  return true;
                                } catch (err) {
                                  handleError(err);
                                  return false;
                                }
                              }}
                            >
                              <EventFormFields />
                            </ModalForm>
                            <Popconfirm
                              title="删除该事件？"
                              onConfirm={async () => {
                                try {
                                  await deleteCaseEvent(e.id);
                                  message.success('已删除');
                                  await reload();
                                } catch (err) {
                                  handleError(err);
                                }
                              }}
                            >
                              <Tooltip title="删除">
                                <Button type="link" size="small" danger icon={<DeleteOutlined />} />
                              </Tooltip>
                            </Popconfirm>
                          </Space>
                          {e.detail && (
                            <div style={{ marginTop: 4, color: 'rgba(0,0,0,0.65)' }}>
                              {e.detail}
                            </div>
                          )}
                        </div>
                      ),
                    }))}
                  />
                )}
              </Card>
            ),
          },
          {
            key: 'documents',
            label: `卷宗文书（${docTotal}）`,
            children: <DocumentsTab caseId={caseId} onChanged={() => void reload()} />,
          },
          {
            key: 'billing',
            label: `律时 · 时间中心（${billingSummary?.count ?? 0} 笔${billingSummary && billingSummary.pendingCount > 0 ? ` · ${billingSummary.pendingCount} 待确认` : ''}）`,
            children: (
              <BillingTab
                caseId={caseId}
                summary={billingSummary}
                onChanged={() => void reload()}
              />
            ),
          },
          {
            key: 'expenses',
            label: `费用支出（${expenseSummaryData?.count ?? 0}）`,
            children: (
              <ExpensesTab
                caseId={caseId}
                summary={expenseSummaryData}
                onChanged={() => void reload()}
              />
            ),
          },
          {
            key: 'letters',
            label: `联系函（${letterSummaryData?.count ?? 0}${letterSummaryData && letterSummaryData.pendingCount > 0 ? ` · ${letterSummaryData.pendingCount} 待确认` : ''}）`,
            children: (
              <LettersTab
                caseId={caseId}
                summary={letterSummaryData}
                onChanged={() => void reload()}
              />
            ),
          },
        ]}
      />
    </PageContainer>
  );
}

/** 分页子列表通用钩子 */
function usePaged<T>(
  fetcher: (page: number, size: number) => Promise<{ items: T[]; total: number }>,
) {
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const handleError = useApiError();
  const size = 20;

  const load = useCallback(
    async (p: number) => {
      setLoading(true);
      try {
        const r = await fetcher(p, size);
        setItems(r.items);
        setTotal(r.total);
        setPage(p);
      } catch (e) {
        handleError(e);
      } finally {
        setLoading(false);
      }
    },
    [fetcher, handleError],
  );

  useEffect(() => {
    void load(1);
  }, [load]);

  return {
    items,
    total,
    page,
    size,
    loading,
    reload: () => load(page),
    goPage: (p: number) => load(p),
  };
}

/** 卷宗文书 Tab（分页 · ADR-0045 Phase 2） */
function DocumentsTab({ caseId, onChanged }: { caseId: number; onChanged: () => void }) {
  const { message } = App.useApp();
  const handleError = useApiError();
  const paged = usePaged<LegalDocument>((page, size) => listCaseDocuments(caseId, page, size));

  return (
    <Card
      size="small"
      title="卷宗文书"
      extra={
        <ModalForm<DocFormValues>
          title="添加卷宗文书"
          width={520}
          trigger={
            <Button type="primary" size="small" icon={<PlusOutlined />}>
              添加文书
            </Button>
          }
          modalProps={{ destroyOnClose: true }}
          onFinish={async (values) => {
            try {
              await createCaseDocument(caseId, values as DocumentRequest);
              message.success('文书已添加');
              await paged.reload();
              onChanged();
              return true;
            } catch (e) {
              handleError(e);
              return false;
            }
          }}
        >
          <DocFormFields />
        </ModalForm>
      }
    >
      {paged.items.length === 0 && !paged.loading ? (
        <Empty description="暂无卷宗文书" />
      ) : (
        <div>
          {paged.items.map((d) => (
            <div
              key={d.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '10px 0',
                borderBottom: '1px solid rgba(5,5,5,0.06)',
              }}
            >
              <FileTextOutlined style={{ marginTop: 4, color: DOC_TYPE_META[d.docType].color }} />
              <div style={{ flex: 1 }}>
                <Space size="middle" wrap>
                  <Tag color={DOC_TYPE_META[d.docType].color}>{DOC_TYPE_META[d.docType].text}</Tag>
                  <strong>{d.title}</strong>
                  {d.docDate && <span style={{ color: '#999', fontSize: 12 }}>{d.docDate}</span>}
                </Space>
                {d.content && (
                  <div style={{ marginTop: 4, color: 'rgba(0,0,0,0.65)' }}>{d.content}</div>
                )}
                {d.fileUrl && (
                  <div style={{ marginTop: 4 }}>
                    <a href={d.fileUrl} target="_blank" rel="noreferrer">
                      <LinkOutlined /> 查看附件
                    </a>
                  </div>
                )}
              </div>
              <Space>
                <ModalForm<DocFormValues>
                  key={`edit-doc-${d.id}`}
                  title="编辑文书"
                  width={520}
                  trigger={
                    <Tooltip title="编辑">
                      <Button type="link" size="small" icon={<EditOutlined />} />
                    </Tooltip>
                  }
                  initialValues={{
                    title: d.title,
                    docType: d.docType,
                    content: d.content ?? undefined,
                    fileUrl: d.fileUrl ?? undefined,
                    docDate: d.docDate ?? undefined,
                  }}
                  onFinish={async (values) => {
                    try {
                      await updateCaseDocument(d.id, values as DocumentRequest);
                      message.success('已更新');
                      await paged.reload();
                      return true;
                    } catch (err) {
                      handleError(err);
                      return false;
                    }
                  }}
                >
                  <DocFormFields />
                </ModalForm>
                <Popconfirm
                  title="删除该文书？"
                  onConfirm={async () => {
                    try {
                      await deleteCaseDocument(d.id);
                      message.success('已删除');
                      await paged.reload();
                      onChanged();
                    } catch (err) {
                      handleError(err);
                    }
                  }}
                >
                  <Tooltip title="删除">
                    <Button type="link" size="small" danger icon={<DeleteOutlined />} />
                  </Tooltip>
                </Popconfirm>
              </Space>
            </div>
          ))}
          <Pagination
            style={{ marginTop: 12, textAlign: 'right' }}
            current={paged.page}
            total={paged.total}
            pageSize={paged.size}
            showSizeChanger={false}
            onChange={(p) => paged.goPage(p)}
          />
        </div>
      )}
    </Card>
  );
}

/** 律时 Tab（分页 · TIME INTELLIGENCE 品牌化 · 待确认流程） */
function BillingTab({
  caseId,
  summary,
  onChanged,
}: {
  caseId: number;
  summary: TimeEntrySummary | null;
  onChanged: () => void;
}) {
  const { message } = App.useApp();
  const handleError = useApiError();
  const paged = usePaged<TimeEntry>((page, size) => listCaseTimeEntries(caseId, page, size));

  return (
    <Card
      size="small"
      title="律时 · 时间中心"
      extra={
        <Space>
          <ModalForm<TimeEntryFormValues>
            title="记录律时"
            width={520}
            trigger={
              <Button type="primary" size="small" icon={<PlusOutlined />}>
                记录时间
              </Button>
            }
            modalProps={{ destroyOnClose: true }}
            onFinish={async (values) => {
              try {
                await createCaseTimeEntry(caseId, values as TimeEntryRequest);
                message.success('已记录，待确认归属');
                await paged.reload();
                onChanged();
                return true;
              } catch (e) {
                handleError(e);
                return false;
              }
            }}
          >
            <TimeEntryFormFields />
          </ModalForm>
          <Button size="small" icon={<ReloadOutlined />} onClick={() => void paged.reload()}>
            刷新
          </Button>
        </Space>
      }
    >
      {summary && (
        <Space size={48} style={{ marginBottom: 16 }} wrap>
          <Statistic title="总工时" value={Number(summary.hours)} precision={2} suffix="小时" />
          <Statistic title="总费用" value={Number(summary.amount)} precision={2} prefix="¥" />
          <Statistic
            title="待确认归属"
            value={summary.pendingCount}
            suffix="笔"
            valueStyle={{ color: summary.pendingCount > 0 ? '#fa8c16' : '#52c41a' }}
          />
          <Statistic title="记录数" value={summary.count} suffix="条" />
        </Space>
      )}
      {paged.items.length === 0 && !paged.loading ? (
        <Empty description="暂无律时记录，点击「记录时间」开始沉淀工时" />
      ) : (
        <div>
          {paged.items.map((t) => (
            <div
              key={t.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '10px 0',
                borderBottom: '1px solid rgba(5,5,5,0.06)',
              }}
            >
              <ClockCircleOutlined style={{ marginTop: 4, color: '#722ed1' }} />
              <div style={{ flex: 1 }}>
                <Space size="middle" wrap>
                  <Tag color="purple">{t.lawyer}</Tag>
                  <Tag color={TIME_ENTRY_STATUS_META[t.status].color}>
                    {TIME_ENTRY_STATUS_META[t.status].text}
                  </Tag>
                  <strong>
                    {t.hours} 小时 × ¥{Number(t.rate).toLocaleString()}/时
                  </strong>
                  <span style={{ color: '#999', fontSize: 12 }}>{t.workDate}</span>
                  <span style={{ fontWeight: 600, color: '#722ed1' }}>
                    ¥{Number(t.amount).toLocaleString()}
                  </span>
                </Space>
                {t.description && (
                  <div style={{ marginTop: 4, color: 'rgba(0,0,0,0.65)' }}>{t.description}</div>
                )}
              </div>
              <Space>
                {t.status === 'PENDING' && (
                  <Tooltip title="确认归属（进入计费口径）">
                    <Button
                      type="link"
                      size="small"
                      icon={<CheckCircleOutlined />}
                      onClick={async () => {
                        try {
                          await confirmTimeEntry(t.id);
                          message.success('已确认归属');
                          await paged.reload();
                          onChanged();
                        } catch (err) {
                          handleError(err);
                        }
                      }}
                    >
                      确认
                    </Button>
                  </Tooltip>
                )}
                <ModalForm<TimeEntryFormValues>
                  key={`edit-entry-${t.id}`}
                  title="编辑律时"
                  width={520}
                  trigger={
                    <Tooltip title="编辑">
                      <Button type="link" size="small" icon={<EditOutlined />} />
                    </Tooltip>
                  }
                  initialValues={{
                    lawyer: t.lawyer,
                    workDate: t.workDate,
                    hours: Number(t.hours),
                    rate: Number(t.rate),
                    description: t.description ?? undefined,
                  }}
                  onFinish={async (values) => {
                    try {
                      await updateCaseTimeEntry(t.id, values as TimeEntryRequest);
                      message.success('已更新');
                      await paged.reload();
                      return true;
                    } catch (err) {
                      handleError(err);
                      return false;
                    }
                  }}
                >
                  <TimeEntryFormFields />
                </ModalForm>
                <Popconfirm
                  title="删除该工时记录？"
                  onConfirm={async () => {
                    try {
                      await deleteCaseTimeEntry(t.id);
                      message.success('已删除');
                      await paged.reload();
                      onChanged();
                    } catch (err) {
                      handleError(err);
                    }
                  }}
                >
                  <Tooltip title="删除">
                    <Button type="link" size="small" danger icon={<DeleteOutlined />} />
                  </Tooltip>
                </Popconfirm>
              </Space>
            </div>
          ))}
          <Pagination
            style={{ marginTop: 12, textAlign: 'right' }}
            current={paged.page}
            total={paged.total}
            pageSize={paged.size}
            showSizeChanger={false}
            onChange={(p) => paged.goPage(p)}
          />
        </div>
      )}
    </Card>
  );
}

/** 费用支出 Tab（分页 · ADR-0045 Phase 2 扩展） */
function ExpensesTab({
  caseId,
  summary,
  onChanged,
}: {
  caseId: number;
  summary: ExpenseSummary | null;
  onChanged: () => void;
}) {
  const { message } = App.useApp();
  const handleError = useApiError();
  const paged = usePaged<Expense>((page, size) => listCaseExpenses(caseId, page, size));

  return (
    <Card
      size="small"
      title="费用支出"
      extra={
        <ModalForm<ExpenseFormValues>
          title="添加费用条目"
          width={520}
          trigger={
            <Button type="primary" size="small" icon={<PlusOutlined />}>
              添加费用
            </Button>
          }
          modalProps={{ destroyOnClose: true }}
          onFinish={async (values) => {
            try {
              await createCaseExpense(caseId, values as ExpenseRequest);
              message.success('已添加');
              await paged.reload();
              onChanged();
              return true;
            } catch (e) {
              handleError(e);
              return false;
            }
          }}
        >
          <ExpenseFormFields />
        </ModalForm>
      }
    >
      {summary && (
        <Space size={48} style={{ marginBottom: 16 }} wrap>
          <Statistic title="费用总额" value={Number(summary.amount)} precision={2} prefix="¥" />
          <Statistic title="记录数" value={summary.count} suffix="条" />
        </Space>
      )}
      {paged.items.length === 0 && !paged.loading ? (
        <Empty description="暂无费用记录（差旅/诉讼费/保全费…）" />
      ) : (
        <div>
          {paged.items.map((e) => (
            <div
              key={e.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '10px 0',
                borderBottom: '1px solid rgba(5,5,5,0.06)',
              }}
            >
              <FundOutlined
                style={{ marginTop: 4, color: EXPENSE_TYPE_META[e.expenseType].color }}
              />
              <div style={{ flex: 1 }}>
                <Space size="middle" wrap>
                  <Tag color={EXPENSE_TYPE_META[e.expenseType].color}>
                    {EXPENSE_TYPE_META[e.expenseType].text}
                  </Tag>
                  <strong>{e.description}</strong>
                  <span style={{ color: '#999', fontSize: 12 }}>{e.expenseDate}</span>
                  <span style={{ fontWeight: 600, color: '#cf1322' }}>
                    ¥{Number(e.amount).toLocaleString()}
                  </span>
                </Space>
              </div>
              <Space>
                <ModalForm<ExpenseFormValues>
                  key={`edit-exp-${e.id}`}
                  title="编辑费用"
                  width={520}
                  trigger={
                    <Tooltip title="编辑">
                      <Button type="link" size="small" icon={<EditOutlined />} />
                    </Tooltip>
                  }
                  initialValues={{
                    description: e.description,
                    expenseType: e.expenseType,
                    amount: Number(e.amount),
                    expenseDate: e.expenseDate,
                  }}
                  onFinish={async (values) => {
                    try {
                      await updateCaseExpense(e.id, values as ExpenseRequest);
                      message.success('已更新');
                      await paged.reload();
                      return true;
                    } catch (err) {
                      handleError(err);
                      return false;
                    }
                  }}
                >
                  <ExpenseFormFields />
                </ModalForm>
                <Popconfirm
                  title="删除该费用记录？"
                  onConfirm={async () => {
                    try {
                      await deleteCaseExpense(e.id);
                      message.success('已删除');
                      await paged.reload();
                      onChanged();
                    } catch (err) {
                      handleError(err);
                    }
                  }}
                >
                  <Tooltip title="删除">
                    <Button type="link" size="small" danger icon={<DeleteOutlined />} />
                  </Tooltip>
                </Popconfirm>
              </Space>
            </div>
          ))}
          <Pagination
            style={{ marginTop: 12, textAlign: 'right' }}
            current={paged.page}
            total={paged.total}
            pageSize={paged.size}
            showSizeChanger={false}
            onChange={(p) => paged.goPage(p)}
          />
        </div>
      )}
    </Card>
  );
}

/** 时间线事件表单（添加/编辑共用） */
function EventFormFields() {
  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <ProFormSelect
        name="eventType"
        label="事件类型"
        rules={[{ required: true }]}
        options={EVENT_OPTIONS}
      />
      <ProFormDatePicker
        name="occurredAt"
        label="发生时间"
        rules={[{ required: true, message: '请选择发生时间' }]}
        fieldProps={{ style: { width: '100%' }, showTime: true, format: 'YYYY-MM-DD HH:mm' }}
      />
      <ProFormText
        name="title"
        label="事件标题"
        rules={[{ required: true, message: '请输入事件标题' }]}
        placeholder="如：第一次开庭 / 提交证据材料"
      />
      <ProFormTextArea name="detail" label="事件详情" placeholder="补充说明…" />
    </Space>
  );
}

/** 卷宗文书表单（添加/编辑共用 · ADR-0045 Phase 2 · 附件直传 file 服务） */
function DocFormFields() {
  const form = Form.useFormInstance();
  const fileUrl = Form.useWatch('fileUrl', form) as string | undefined;
  const fileList = fileUrl
    ? [{ uid: '-1', name: fileUrl.split('/').pop() ?? '附件', status: 'done' as const }]
    : [];
  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <ProFormText
        name="title"
        label="文书标题"
        rules={[{ required: true, message: '请输入文书标题' }]}
        placeholder="如：一审委托代理合同 / 起诉状"
      />
      <ProFormSelect name="docType" label="文书类型" initialValue="OTHER" options={DOC_OPTIONS} />
      <ProFormTextArea name="content" label="文书内容 / 摘要" placeholder="关键条款、要点…" />
      <Form.Item label="附件" name="fileUrl">
        <Upload
          fileList={fileList}
          maxCount={1}
          customRequest={async ({ file, onSuccess, onError }) => {
            try {
              const fd = new FormData();
              fd.append('file', file as File);
              const res = await api.post<{ id: number }>('/files', fd);
              form.setFieldValue('fileUrl', `/api/files/${res.id}/content`);
              onSuccess?.(res);
            } catch (e) {
              onError?.(e as Error);
            }
          }}
          onRemove={() => {
            form.setFieldValue('fileUrl', undefined);
          }}
        >
          <Button icon={<UploadOutlined />}>{fileUrl ? '重新上传' : '上传附件（≤20MB）'}</Button>
        </Upload>
      </Form.Item>
      <ProFormDatePicker name="docDate" label="文书日期" />
    </Space>
  );
}

/** 工时记录表单（添加/编辑共用） */
function TimeEntryFormFields() {
  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <ProFormText
        name="lawyer"
        label="律师"
        rules={[{ required: true, message: '请输入律师' }]}
        placeholder="如：张律师"
      />
      <Space.Compact style={{ width: '100%' }}>
        <ProFormDigit
          name="hours"
          label="工时(小时)"
          min={0.01}
          fieldProps={{ precision: 2, step: 0.5 }}
          rules={[{ required: true, message: '请输入工时' }]}
        />
        <ProFormDigit
          name="rate"
          label="费率(元/时)"
          min={0}
          fieldProps={{ precision: 2 }}
          rules={[{ required: true, message: '请输入费率' }]}
        />
      </Space.Compact>
      <ProFormDatePicker name="workDate" label="工作日期" rules={[{ required: true }]} />
      <ProFormTextArea
        name="description"
        label="工作内容"
        placeholder="如：起草起诉状并整理证据清单"
      />
    </Space>
  );
}

/** 费用条目表单（添加/编辑共用） */
function ExpenseFormFields() {
  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <ProFormSelect
        name="expenseType"
        label="费用类型"
        initialValue="OTHER"
        options={EXPENSE_OPTIONS}
      />
      <ProFormText
        name="description"
        label="费用说明"
        rules={[{ required: true, message: '请输入费用说明' }]}
        placeholder="如：南昌→北京 高铁往返 / 一审诉讼费"
      />
      <Space.Compact style={{ width: '100%' }}>
        <ProFormDigit
          name="amount"
          label="金额(元)"
          min={0.01}
          fieldProps={{ precision: 2 }}
          rules={[{ required: true, message: '请输入金额' }]}
        />
        <ProFormDatePicker name="expenseDate" label="发生日期" rules={[{ required: true }]} />
      </Space.Compact>
    </Space>
  );
}

/** 表单日期（'YYYY-MM-DD HH:mm'）→ ISO 字符串（后端 Instant） */
function toIso(v: string): string {
  return new Date(v.replace(' ', 'T') + ':00+08:00').toISOString();
}

/** 联系函 Tab（客户沟通 CLIENT COMMUNICATION · 愿景「1 封联系函 · 2 项待确认」） */
function LettersTab({
  caseId,
  summary,
  onChanged,
}: {
  caseId: number;
  summary: LetterSummary | null;
  onChanged: () => void;
}) {
  const { message } = App.useApp();
  const handleError = useApiError();
  const paged = usePaged<ContactLetter>((page, size) => listCaseLetters(caseId, page, size));

  return (
    <Card
      size="small"
      title="联系函 · 客户沟通"
      extra={
        <ModalForm<LetterFormValues>
          title="发送联系函"
          width={560}
          trigger={
            <Button type="primary" size="small" icon={<PlusOutlined />}>
              新增联系函
            </Button>
          }
          modalProps={{ destroyOnClose: true }}
          onFinish={async (values) => {
            try {
              await createCaseLetter(caseId, values as LetterRequest);
              message.success('已发送，待客户确认');
              await paged.reload();
              onChanged();
              return true;
            } catch (e) {
              handleError(e);
              return false;
            }
          }}
        >
          <LetterFormFields />
        </ModalForm>
      }
    >
      {summary && (
        <Space size={48} style={{ marginBottom: 16 }} wrap>
          <Statistic title="联系函" value={summary.count} suffix="封" />
          <Statistic
            title="待确认事项"
            value={summary.pendingCount}
            suffix="项"
            valueStyle={{ color: summary.pendingCount > 0 ? '#fa8c16' : '#52c41a' }}
          />
        </Space>
      )}
      {paged.items.length === 0 && !paged.loading ? (
        <Empty description="暂无联系函，点击「新增联系函」开始与客户沟通" />
      ) : (
        <div>
          {paged.items.map((l) => (
            <div
              key={l.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '10px 0',
                borderBottom: '1px solid rgba(5,5,5,0.06)',
              }}
            >
              <SendOutlined style={{ marginTop: 4, color: '#13c2c2' }} />
              <div style={{ flex: 1 }}>
                <Space size="middle" wrap>
                  <Tag color={LETTER_DIRECTION_META[l.direction].color}>
                    {LETTER_DIRECTION_META[l.direction].text}
                  </Tag>
                  <Tag color={LETTER_STATUS_META[l.status].color}>
                    {LETTER_STATUS_META[l.status].text}
                  </Tag>
                  <strong>{l.subject}</strong>
                  <span style={{ color: '#999', fontSize: 12 }}>{l.letterDate}</span>
                </Space>
                {l.sender && l.recipient && (
                  <div style={{ marginTop: 2, color: '#999', fontSize: 12 }}>
                    {l.sender} → {l.recipient}
                  </div>
                )}
                {l.content && (
                  <div style={{ marginTop: 4, color: 'rgba(0,0,0,0.65)' }}>{l.content}</div>
                )}
              </div>
              <Space>
                {l.status === 'PENDING' && (
                  <Tooltip title="确认（客户已回执/事项已确认）">
                    <Button
                      type="link"
                      size="small"
                      icon={<CheckCircleOutlined />}
                      onClick={async () => {
                        try {
                          await confirmCaseLetter(l.id);
                          message.success('已确认');
                          await paged.reload();
                          onChanged();
                        } catch (err) {
                          handleError(err);
                        }
                      }}
                    >
                      确认
                    </Button>
                  </Tooltip>
                )}
                <ModalForm<LetterFormValues>
                  key={`edit-letter-${l.id}`}
                  title="编辑联系函"
                  width={560}
                  trigger={
                    <Tooltip title="编辑">
                      <Button type="link" size="small" icon={<EditOutlined />} />
                    </Tooltip>
                  }
                  initialValues={{
                    direction: l.direction,
                    subject: l.subject,
                    content: l.content ?? undefined,
                    sender: l.sender ?? undefined,
                    recipient: l.recipient ?? undefined,
                    letterDate: l.letterDate,
                  }}
                  onFinish={async (values) => {
                    try {
                      await updateCaseLetter(l.id, values as LetterRequest);
                      message.success('已更新');
                      await paged.reload();
                      return true;
                    } catch (err) {
                      handleError(err);
                      return false;
                    }
                  }}
                >
                  <LetterFormFields />
                </ModalForm>
                <Popconfirm
                  title="删除该联系函？"
                  onConfirm={async () => {
                    try {
                      await deleteCaseLetter(l.id);
                      message.success('已删除');
                      await paged.reload();
                      onChanged();
                    } catch (err) {
                      handleError(err);
                    }
                  }}
                >
                  <Tooltip title="删除">
                    <Button type="link" size="small" danger icon={<DeleteOutlined />} />
                  </Tooltip>
                </Popconfirm>
              </Space>
            </div>
          ))}
          <Pagination
            style={{ marginTop: 12, textAlign: 'right' }}
            current={paged.page}
            total={paged.total}
            pageSize={paged.size}
            showSizeChanger={false}
            onChange={(p) => paged.goPage(p)}
          />
        </div>
      )}
    </Card>
  );
}

interface LetterFormValues {
  direction: LetterDirectionType;
  subject: string;
  content?: string;
  sender?: string;
  recipient?: string;
  letterDate: string;
}
type LetterDirectionType = 'OUTBOUND' | 'INBOUND';

const LETTER_DIRECTION_OPTIONS = (Object.keys(LETTER_DIRECTION_META) as LetterDirectionType[]).map(
  (d) => ({ label: LETTER_DIRECTION_META[d].text, value: d }),
);

/** 联系函表单（添加/编辑共用） */
function LetterFormFields() {
  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <ProFormSelect
        name="direction"
        label="方向"
        initialValue="OUTBOUND"
        options={LETTER_DIRECTION_OPTIONS}
      />
      <ProFormText
        name="subject"
        label="主题"
        rules={[{ required: true, message: '请输入主题' }]}
        placeholder="如：关于补充证据材料的通知"
      />
      <ProFormTextArea
        name="content"
        label="函件正文"
        placeholder="需客户确认/知悉的事项，关键诉求与期限…"
      />
      <ProFormText name="sender" label="发件人（律师）" placeholder="郝律师" />
      <ProFormText name="recipient" label="收件方（客户/对方）" placeholder="宏远科技 王总" />
      <ProFormDatePicker name="letterDate" label="发送/接收日期" rules={[{ required: true }]} />
    </Space>
  );
}
