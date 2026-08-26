/**
 * 任务与日程（MATTER CALENDAR · 愿景附录五）.
 *
 * 未来 7 天案件工作自动日程：本周期统计卡 + 周/双周日历视图 + NEXT ACTIONS 接下来
 * + MATTER CAPACITY 按案件投入 + 冲突检测提示 + 律时自动变动确认。
 */
import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import {
  Alert,
  App,
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Statistic,
  Tag,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useApiError } from '../../hooks/useApiError';
import {
  confirmSchedule,
  createSchedule,
  deleteSchedule,
  listCases,
  listSchedules,
  matterCalendarSummary,
  updateSchedule,
} from '../../services/legal';
import {
  formatDateCN,
  minuteToTime,
  SCHEDULE_RESPONSIBILITY_META,
  SCHEDULE_RESPONSIBILITY_OPTIONS,
  SCHEDULE_TYPE_META,
  SCHEDULE_TYPE_OPTIONS,
  type MatterCalendarSummary,
  type MatterSchedule,
  type ScheduleRequest,
} from '@lieshoucloud/types/business/legal';

const { Paragraph, Text } = Typography;

/** 视图范围：周（7 天）/ 双周（14 天） */
type RangeMode = 'week' | 'biweek';

/** 表单值：日期用 Dayjs（提交时转 YYYY-MM-DD） */
type ScheduleFormValues = Omit<ScheduleRequest, 'scheduleDate'> & { scheduleDate: dayjs.Dayjs };

export default function MatterCalendar() {
  const { message } = App.useApp();
  const handleError = useApiError();
  const [summary, setSummary] = useState<MatterCalendarSummary | null>(null);
  const [items, setItems] = useState<MatterSchedule[]>([]);
  const [rangeMode, setRangeMode] = useState<RangeMode>('week');
  const [loading, setLoading] = useState(false);
  const [caseOptions, setCaseOptions] = useState<{ value: number; label: string }[]>([]);
  const [modal, setModal] = useState<{ open: boolean; editing?: MatterSchedule }>({ open: false });
  const [form] = Form.useForm<ScheduleFormValues>();

  const days = rangeMode === 'week' ? 7 : 14;

  const loadSummary = useCallback(async () => {
    try {
      setSummary(await matterCalendarSummary());
    } catch {
      /* 静默 */
    }
  }, []);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const today = dayjs().format('YYYY-MM-DD');
      const to = dayjs()
        .add(days - 1, 'day')
        .format('YYYY-MM-DD');
      const r = await listSchedules({ from: today, to });
      setItems(r.items);
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
    }
  }, [days, handleError]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const loadCases = useCallback(async () => {
    try {
      const r = await listCases({}, 1, 100);
      setCaseOptions(
        r.items.map((c) => ({
          value: c.id,
          label: `${c.matterNo ? `${c.matterNo} · ` : ''}${c.title}`,
        })),
      );
    } catch {
      /* 静默 */
    }
  }, []);

  const openCreate = () => {
    void loadCases();
    form.resetFields();
    form.setFieldsValue({
      scheduleDate: dayjs(),
      startMinute: 9 * 60,
      durationMinutes: 60,
      scheduleType: 'NODE_TASK',
      responsibility: 'PRIMARY',
      confirmed: true,
    });
    setModal({ open: true });
  };

  const openEdit = (s: MatterSchedule) => {
    void loadCases();
    form.setFieldsValue({
      title: s.title,
      caseId: s.caseId ?? undefined,
      scheduleDate: dayjs(s.scheduleDate),
      startMinute: s.startMinute,
      durationMinutes: s.durationMinutes,
      scheduleType: s.scheduleType,
      responsibility: s.responsibility,
      confirmed: s.confirmed,
    });
    setModal({ open: true, editing: s });
  };

  const submit = async () => {
    const raw = await form.validateFields();
    const body: ScheduleRequest = {
      ...raw,
      scheduleDate: raw.scheduleDate.format('YYYY-MM-DD'),
    };
    try {
      if (modal.editing) {
        await updateSchedule(modal.editing.id, body);
        message.success('已保存日程');
      } else {
        await createSchedule(body);
        message.success('已新增日程');
      }
      setModal({ open: false });
      await loadItems();
      await loadSummary();
    } catch (e) {
      handleError(e);
    }
  };

  const remove = async (s: MatterSchedule) => {
    try {
      await deleteSchedule(s.id);
      message.success('已删除');
      await loadItems();
      await loadSummary();
    } catch (e) {
      handleError(e);
    }
  };

  const confirm = async (s: MatterSchedule) => {
    try {
      await confirmSchedule(s.id);
      message.success('已确认');
      await loadItems();
      await loadSummary();
    } catch (e) {
      handleError(e);
    }
  };

  /** 按日分组（保持日期升序） */
  const byDay = useMemo(() => {
    const map = new Map<string, MatterSchedule[]>();
    for (const s of items) {
      const list = map.get(s.scheduleDate) ?? [];
      list.push(s);
      map.set(s.scheduleDate, list);
    }
    return [...map.entries()];
  }, [items]);

  const nextActions = useMemo(
    () => items.filter((s) => s.scheduleDate === dayjs().format('YYYY-MM-DD')).slice(0, 6),
    [items],
  );

  const conflicts = summary?.conflicts ?? [];
  const capacity = Object.values(summary?.capacity ?? {});

  return (
    <PageContainer
      title="任务与日程"
      subTitle="MATTER CALENDAR · 自动日程 · 冲突检测 · 本周期工作分布"
      extra={[
        <Button
          key="reload"
          icon={<ReloadOutlined />}
          onClick={() => {
            void loadItems();
            void loadSummary();
          }}
        >
          刷新
        </Button>,
        <Button key="create" type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新建日程
        </Button>,
      ]}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* 01 本周期统计卡 */}
        <ProCard split="vertical" bordered>
          <Statistic title="本周期工作" value={summary?.workCount ?? 0} suffix="项" />
          <Statistic
            title="预计专业工时"
            value={((summary?.estimatedMinutes ?? 0) / 60).toFixed(1)}
            suffix="h"
            valueStyle={{ color: '#1677ff' }}
          />
          <Statistic
            title="客户与团队会议"
            value={summary?.meetingCount ?? 0}
            suffix="场"
            valueStyle={{ color: '#722ed1' }}
          />
          <Statistic
            title="待确认变动"
            value={summary?.pendingConfirm ?? 0}
            suffix="项"
            valueStyle={{ color: (summary?.pendingConfirm ?? 0) > 0 ? '#fa8c16' : '#52c41a' }}
          />
        </ProCard>

        {/* 02 冲突提示 */}
        {conflicts.length > 0 && (
          <Alert
            type="warning"
            showIcon
            icon={<WarningOutlined />}
            message={`发现 ${conflicts.length} 处时间冲突（律时已标记，等待调整确认）`}
            description={
              <Space direction="vertical" size={4}>
                {conflicts.map((c, i) => (
                  <Text key={i}>
                    {formatDateCN(c.date)}{' '}
                    {minuteToTime(Math.max(c.a.startMinute, c.b.startMinute))} · 「{c.a.title}」与「
                    {c.b.title}」重叠 {c.overlapMinutes} 分钟
                  </Text>
                ))}
              </Space>
            }
          />
        )}

        {/* 03 日历视图（周/双周） */}
        <ProCard
          title="未来日程"
          bordered
          extra={
            <Select
              value={rangeMode}
              style={{ width: 90 }}
              options={[
                { value: 'week', label: '周视图' },
                { value: 'biweek', label: '双周' },
              ]}
              onChange={(v) => setRangeMode(v)}
            />
          }
        >
          {loading && items.length === 0 ? (
            <Paragraph type="secondary">加载中…</Paragraph>
          ) : byDay.length === 0 ? (
            <Paragraph type="secondary">
              未来 {days} 天暂无日程，点「新建日程」安排案件工作
            </Paragraph>
          ) : (
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              {byDay.map(([date, dayItems]) => (
                <div key={date}>
                  <Text strong style={{ display: 'block', marginBottom: 4 }}>
                    {formatDateCN(date)}
                  </Text>
                  <Space direction="vertical" size={4} style={{ width: '100%' }}>
                    {dayItems.map((s) => (
                      <div
                        key={s.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '6px 10px',
                          border: '1px solid #f0f0f0',
                          borderRadius: 6,
                          background: s.confirmed ? undefined : '#fffbe6',
                        }}
                      >
                        <Text strong style={{ width: 48 }}>
                          {minuteToTime(s.startMinute)}
                        </Text>
                        <Tag
                          color={SCHEDULE_TYPE_META[s.scheduleType].color}
                          style={{ marginRight: 4 }}
                        >
                          {SCHEDULE_TYPE_META[s.scheduleType].text}
                        </Tag>
                        <Tag
                          color={SCHEDULE_RESPONSIBILITY_META[s.responsibility].color}
                          style={{ marginRight: 4 }}
                        >
                          {SCHEDULE_RESPONSIBILITY_META[s.responsibility].text}
                        </Tag>
                        <Text ellipsis style={{ flex: 1 }}>
                          {s.title}
                          {s.caseMatterNo && <Text type="secondary">（{s.caseMatterNo}）</Text>}
                          {s.durationMinutes > 0 && (
                            <Text type="secondary"> · {s.durationMinutes}m</Text>
                          )}
                        </Text>
                        {!s.confirmed && (
                          <Tag color="orange" style={{ marginRight: 4 }}>
                            待确认
                          </Tag>
                        )}
                        {s.conflictNote && (
                          <Tag color="red" icon={<WarningOutlined />} style={{ marginRight: 4 }}>
                            {s.conflictNote}
                          </Tag>
                        )}
                        {!s.confirmed && (
                          <Button
                            size="small"
                            type="primary"
                            ghost
                            icon={<CheckCircleOutlined />}
                            onClick={() => void confirm(s)}
                          >
                            确认
                          </Button>
                        )}
                        <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(s)} />
                        <Popconfirm title={`删除「${s.title}」？`} onConfirm={() => void remove(s)}>
                          <Button size="small" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                      </div>
                    ))}
                  </Space>
                </div>
              ))}
            </Space>
          )}
        </ProCard>

        {/* 04 NEXT ACTIONS + 05 MATTER CAPACITY */}
        <ProCard gutter={12} bordered>
          <ProCard title="接下来（今日 · 自动更新）" colSpan="55%">
            {nextActions.length === 0 ? (
              <Paragraph type="secondary">今日暂无待办日程</Paragraph>
            ) : (
              <Space direction="vertical" size={6} style={{ width: '100%' }}>
                {nextActions.map((s) => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Text strong style={{ width: 44 }}>
                      {minuteToTime(s.startMinute)}
                    </Text>
                    <Tag color={SCHEDULE_TYPE_META[s.scheduleType].color}>
                      {SCHEDULE_TYPE_META[s.scheduleType].text}
                    </Tag>
                    <Text ellipsis style={{ flex: 1 }}>
                      {s.title}
                    </Text>
                    {s.caseMatterNo && <Text type="secondary">{s.caseMatterNo}</Text>}
                  </div>
                ))}
              </Space>
            )}
          </ProCard>
          <ProCard title="本周期工作分布（按案件）" colSpan="45%">
            {capacity.length === 0 ? (
              <Paragraph type="secondary">暂无案件日程投入</Paragraph>
            ) : (
              <Space direction="vertical" size={6} style={{ width: '100%' }}>
                {capacity.map((c) => (
                  <div key={c.caseId} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text ellipsis style={{ maxWidth: 240 }}>
                      {c.caseTitle}
                      {c.matterNo && <Text type="secondary"> · {c.matterNo}</Text>}
                    </Text>
                    <Text strong>{(c.minutes / 60).toFixed(1)}h</Text>
                  </div>
                ))}
              </Space>
            )}
          </ProCard>
        </ProCard>

        <Paragraph type="secondary" style={{ fontSize: 12 }}>
          律时自动更新日程（新增/顺延/冲突调整）均等待本人确认后才生效；确认后进入案件计划与个人日程。
        </Paragraph>
      </Space>

      {/* 新建/编辑日程 */}
      <Modal
        title={modal.editing ? `编辑日程 · ${modal.editing.title}` : '新建日程'}
        open={modal.open}
        onOk={() => void submit()}
        onCancel={() => setModal({ open: false })}
        destroyOnClose
        width={520}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="任务标题"
            rules={[{ required: true, message: '请输入任务标题' }]}
          >
            <Input maxLength={200} placeholder="如：今日 16:00 前审定策略分析报告 V2" />
          </Form.Item>
          <Form.Item name="caseId" label="关联案件">
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="选择案件（可空）"
              options={caseOptions}
            />
          </Form.Item>
          <Form.Item name="scheduleDate" label="日期" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Space size="middle" style={{ display: 'flex' }}>
            <Form.Item name="startMinute" label="开始时间" rules={[{ required: true }]}>
              <Select
                style={{ width: 120 }}
                options={Array.from({ length: 48 }, (_, i) => {
                  const h = Math.floor(i / 2);
                  const m = i % 2 === 0 ? 0 : 30;
                  return {
                    value: h * 60 + m,
                    label: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
                  };
                })}
              />
            </Form.Item>
            <Form.Item name="durationMinutes" label="时长（分钟）" rules={[{ required: true }]}>
              <InputNumber min={5} max={600} step={15} style={{ width: 120 }} />
            </Form.Item>
          </Space>
          <Space size="middle" style={{ display: 'flex' }}>
            <Form.Item name="scheduleType" label="类型" rules={[{ required: true }]}>
              <Select style={{ width: 150 }} options={SCHEDULE_TYPE_OPTIONS} />
            </Form.Item>
            <Form.Item name="responsibility" label="职责" rules={[{ required: true }]}>
              <Select style={{ width: 150 }} options={SCHEDULE_RESPONSIBILITY_OPTIONS} />
            </Form.Item>
          </Space>
          <Form.Item
            name="confirmed"
            label="状态"
            tooltip="律时自动变动（新增/顺延/冲突调整）默认待确认"
          >
            <Select
              options={[
                { value: true, label: '已确认' },
                { value: false, label: '待确认（律时自动变动）' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
}
