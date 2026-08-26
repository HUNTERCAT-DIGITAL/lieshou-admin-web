/**
 * LegalMind 今日作战台（TODAY COMMAND DESK · LegalMind Unity 共创版）.
 *
 * 对齐 docs/legalmind-unity-vision.md「今日工作已准备」聚合视图：
 *   - 问候 + 今日工作汇总（高关注/在办/律时/接洽待完善）
 *   - 六大中心卡（01 TODAY / 02 MATTER / 03 CLIENT / 04 TIME / 05 KNOWLEDGE / 06 GROWTH）
 *   - 实时指标条 + MY ACTIVE MATTERS 在办案件（关注度分层 · 阶段进度 · 继续办理）
 *
 * 数据：GET /api/legal/workbench/summary（单请求聚合）+ listCases（在办案件列表）。
 */
import {
  BulbOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  HistoryOutlined,
  PlusOutlined,
  ReloadOutlined,
  RightOutlined,
  RiseOutlined,
  SafetyCertificateOutlined,
  SendOutlined,
  TeamOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { PageContainer, ProCard, StatisticCard } from '@ant-design/pro-components';
import { Avatar, Button, Progress, Space, Tag, Tooltip, Typography } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useApiError } from '../../hooks/useApiError';
import { listCases, workbenchRecent, workbenchSummary } from '../../services/legal';
import { useAuthStore } from '../../stores/auth';
import {
  CASE_PRIORITY_META,
  CASE_STAGE_META,
  CASE_STATUS_META,
  CASE_TYPE_META,
  DATA_CLASS_META,
  type LegalCase,
  type RecentWorkItem,
  type WorkbenchSummary,
} from '@lieshoucloud/types/business/legal';

const { Text, Title } = Typography;

/** 时间问候（早上/中午/下午/晚上） */
function greeting(): string {
  const h = new Date().getHours();
  if (h < 6) return '夜深了';
  if (h < 9) return '早上好';
  if (h < 12) return '上午好';
  if (h < 14) return '中午好';
  if (h < 18) return '下午好';
  return '晚上好';
}

/** 在办案件（未结案） */
const ACTIVE_STATUSES = new Set(['INTAKE', 'FILED', 'IN_TRIAL']);

/** 最近工作项类型元数据（断点续作） */
const RECENT_KIND_META: Record<RecentWorkItem['kind'], { text: string; color: string }> = {
  document: { text: '文书', color: 'blue' },
  time: { text: '律时', color: 'purple' },
  letter: { text: '联系函', color: 'cyan' },
  event: { text: '事件', color: 'gold' },
  case: { text: '案件', color: 'geekblue' },
};

/** 最近工作 → 案件详情续作路径（带目标 Tab） */
function continuePath(r: RecentWorkItem): string {
  const tab =
    r.kind === 'document'
      ? 'documents'
      : r.kind === 'time'
        ? 'billing'
        : r.kind === 'letter'
          ? 'letters'
          : r.kind === 'event'
            ? 'events'
            : undefined;
  return `/legal/cases/${r.caseId}${tab ? `?tab=${tab}` : ''}`;
}

/** 相对时间（刚刚/分钟/小时/天/日期） */
function formatRecentTime(iso: string): string {
  const at = new Date(iso).getTime();
  const diff = Date.now() - at;
  if (diff < 60_000) return '刚刚';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分钟前`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小时前`;
  if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)} 天前`;
  return iso.slice(0, 10);
}

/** 六大中心卡定义（01-06，与愿景文档对齐） */
interface CenterCard {
  no: string;
  name: string;
  en: string;
  icon: React.ReactNode;
  color: string;
  value: React.ReactNode;
  unit?: string;
  desc: string;
  link: string;
}

export default function LegalMindDashboard() {
  const navigate = useNavigate();
  const handleError = useApiError();
  const user = useAuthStore((s) => s.user);

  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<WorkbenchSummary | null>(null);
  const [activeCases, setActiveCases] = useState<LegalCase[]>([]);
  const [recent, setRecent] = useState<RecentWorkItem[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, page, r] = await Promise.all([
        workbenchSummary(),
        listCases({}, 1, 50).catch(() => ({
          items: [] as LegalCase[],
          total: 0,
          page: 1,
          size: 50,
        })),
        workbenchRecent(6).catch(() => [] as RecentWorkItem[]),
      ]);
      setSummary(s);
      setActiveCases(page.items.filter((c) => ACTIVE_STATUSES.has(c.status)));
      setRecent(r);
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  useEffect(() => {
    void load();
  }, [load]);

  const statusCounts = summary?.statusCounts ?? {
    INTAKE: 0,
    FILED: 0,
    IN_TRIAL: 0,
    CLOSED: 0,
    ARCHIVED: 0,
  };
  const highPriority = summary?.highPriorityCount ?? 0;
  const activeCount = summary?.activeCount ?? 0;
  const intakeCount = statusCounts.INTAKE;
  const unpassed = summary?.unpassedIntakeCases ?? 0;
  const pendingLetters = summary?.pendingLetters ?? 0;
  const clientSuccessScore = summary?.clientSuccessScore ?? 0;
  const clientFollowUp = summary?.clientFollowUp ?? 0;
  const monthlyHours = summary?.monthlyHours ?? 0;
  const monthlyTimeCount = summary?.monthlyTimeCount ?? 0;
  const pendingTimeCount = summary?.pendingTimeCount ?? 0;
  const documentCount = summary?.documentCount ?? 0;
  const knowledgeTotal = summary?.knowledgeTotal ?? 0;
  const knowledgeCandidates = summary?.knowledgeCandidates ?? 0;
  const knowledgeReviewPending = summary?.knowledgeReviewPending ?? 0;
  const growthIndex = summary?.growthIndex ?? 0;

  const cards: CenterCard[] = [
    {
      no: '01',
      name: '今日待办',
      en: 'TODAY COMMAND',
      icon: <ThunderboltOutlined />,
      color: '#1677ff',
      value: highPriority + unpassed,
      desc: `${highPriority} 项高关注 · ${unpassed} 项接洽待完善`,
      link: '/legal/cases',
    },
    {
      no: '02',
      name: '在办案件',
      en: 'MATTER COMMAND',
      icon: <FolderOpenOutlined />,
      color: '#722ed1',
      value: activeCount,
      desc: `待立案 ${statusCounts.INTAKE} · 已立案 ${statusCounts.FILED} · 审理中 ${statusCounts.IN_TRIAL}`,
      link: '/legal/cases',
    },
    {
      no: '03',
      name: '客户成功',
      en: 'CLIENT SUCCESS',
      icon: <TeamOutlined />,
      color: '#13c2c2',
      value: clientSuccessScore,
      unit: '分',
      desc: `组合健康度 ${clientSuccessScore} · ${clientFollowUp} 待跟进 · ${pendingLetters} 联系函待确认`,
      link: '/legal/clients',
    },
    {
      no: '04',
      name: '律时 · 本月',
      en: 'TIME INTELLIGENCE',
      icon: <ClockCircleOutlined />,
      color: '#fa8c16',
      value: monthlyHours.toFixed(1),
      unit: 'h',
      desc: `本月 ${monthlyTimeCount} 笔 · ${pendingTimeCount} 笔待确认归属`,
      link: '/legal/cases',
    },
    {
      no: '05',
      name: '知识资产',
      en: 'KNOWLEDGE ASSETS',
      icon: <BulbOutlined />,
      color: '#52c41a',
      value: knowledgeTotal,
      desc: `${knowledgeCandidates} 项候选待复核 · 含 ${knowledgeReviewPending} 待专业复核`,
      link: '/legal/knowledge',
    },
    {
      no: '06',
      name: '专业成长',
      en: 'PROFESSIONAL GROWTH',
      icon: <RiseOutlined />,
      color: '#eb2f96',
      value: growthIndex,
      desc: '六维画像 · 成长指数实时计算',
      link: '/legal/growth',
    },
  ];

  return (
    <PageContainer
      title="今日作战台"
      subTitle="TODAY COMMAND · 今日工作已准备"
      extra={[
        <Button
          key="reload"
          icon={<ReloadOutlined />}
          onClick={() => void load()}
          loading={loading}
        >
          刷新
        </Button>,
        <Button
          key="new"
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/legal/cases')}
        >
          案件列表
        </Button>,
      ]}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* 问候 + 今日工作汇总 */}
        <ProCard bordered>
          <Space size="middle" align="start" wrap>
            <Avatar size={56} icon={<TeamOutlined />} style={{ background: '#02429B' }}>
              {user?.username?.charAt(0).toUpperCase()}
            </Avatar>
            <div style={{ flex: 1, minWidth: 280 }}>
              <Title level={4} style={{ margin: 0 }}>
                {greeting()}，{user?.username ?? '律师'}。今天共有{' '}
                <Text strong style={{ color: '#02429B' }}>
                  {highPriority + unpassed}
                </Text>{' '}
                项工作待关注
              </Title>
              <Text type="secondary">
                建议优先处理高关注案件与立项闸门未完善事项；进入案件作战室可查看程序树与八闸门。
              </Text>
            </div>
            <Space wrap>
              <Button icon={<SafetyCertificateOutlined />} onClick={() => navigate('/legal/cases')}>
                案件作战室
              </Button>
              <Button icon={<SendOutlined />} onClick={() => navigate('/legal/cases')}>
                查看全部案件
              </Button>
            </Space>
          </Space>
        </ProCard>

        {/* 实时指标条 */}
        <ProCard split="vertical" bordered bodyStyle={{ padding: '12px 0' }}>
          <StatisticCard
            statistic={{
              title: '接洽中客户',
              value: intakeCount,
              prefix: <TeamOutlined />,
            }}
          />
          <StatisticCard
            statistic={{
              title: '联系函待确认',
              value: pendingLetters,
              prefix: <SendOutlined />,
              valueStyle: { color: pendingLetters > 0 ? '#fa8c16' : '#52c41a' },
            }}
          />
          <StatisticCard
            statistic={{
              title: '高关注案件',
              value: highPriority,
              prefix: <ThunderboltOutlined />,
              valueStyle: { color: highPriority > 0 ? '#f5222d' : '#52c41a' },
            }}
          />
          <StatisticCard
            statistic={{
              title: '立项闸门未通过',
              value: unpassed,
              prefix: <SafetyCertificateOutlined />,
              valueStyle: { color: unpassed > 0 ? '#fa8c16' : '#52c41a' },
            }}
          />
          <StatisticCard
            statistic={{
              title: '本月律时',
              value: `${monthlyHours.toFixed(1)}h`,
              prefix: <ClockCircleOutlined />,
            }}
          />
          <StatisticCard
            statistic={{
              title: '在办案件',
              value: activeCount,
              prefix: <FolderOpenOutlined />,
            }}
          />
          <StatisticCard
            statistic={{
              title: '卷宗文书',
              value: documentCount,
              prefix: <FileTextOutlined />,
            }}
          />
        </ProCard>

        {/* 六大中心卡（01-06） */}
        <ProCard gutter={[12, 12]} wrap>
          {cards.map((c) => (
            <ProCard
              key={c.no}
              colSpan={{ xs: 24, sm: 12, lg: 8 }}
              hoverable
              onClick={() => navigate(c.link)}
              style={{ cursor: 'pointer' }}
            >
              <Space size="middle" align="start">
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: `${c.color}18`,
                    color: c.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                  }}
                >
                  {c.icon}
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {c.no} · {c.en}
                  </Text>
                  <div>
                    <Text strong style={{ fontSize: 16 }}>
                      {c.name}
                    </Text>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <Text strong style={{ fontSize: 24, color: c.color }}>
                      {c.value}
                    </Text>
                    {c.unit && (
                      <Text type="secondary" style={{ marginLeft: 4 }}>
                        {c.unit}
                      </Text>
                    )}
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {c.desc}
                  </Text>
                </div>
              </Space>
            </ProCard>
          ))}
        </ProCard>

        {/* RECENT WORK · 最近工作（断点续作） */}
        <ProCard
          title={
            <Space>
              <HistoryOutlined style={{ color: '#02429B' }} />
              <span>RECENT WORK · 最近工作</span>
            </Space>
          }
          bordered
          loading={loading}
          extra={
            <Text type="secondary" style={{ fontSize: 12 }}>
              上次工作可从任意产物继续
            </Text>
          }
        >
          {recent.length === 0 && <Text type="secondary">暂无最近工作记录。</Text>}
          <Space direction="vertical" style={{ width: '100%' }} size={4}>
            {recent.map((r) => {
              const meta = RECENT_KIND_META[r.kind];
              return (
                <div
                  key={`${r.kind}-${r.id}`}
                  onClick={() => navigate(continuePath(r))}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    border: '1px solid #f0f0f0',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f0f5ff';
                    e.currentTarget.style.borderColor = '#b7c9ea';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = '#f0f0f0';
                  }}
                >
                  <Tag color={meta.color} style={{ marginRight: 0 }}>
                    {meta.text}
                  </Tag>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        color: 'rgba(0,0,0,0.88)',
                        fontSize: 13,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'block',
                      }}
                    >
                      {r.title}
                    </span>
                    <span style={{ color: '#999', fontSize: 11 }}>
                      {r.caseTitle}
                      {r.matterNo ? ` · ${r.matterNo}` : ''} · {formatRecentTime(r.at)}
                    </span>
                  </span>
                  <RightOutlined style={{ color: '#ccc', fontSize: 12 }} />
                </div>
              );
            })}
          </Space>
        </ProCard>

        {/* MY ACTIVE MATTERS 在办案件 */}
        <ProCard
          title={
            <Space>
              <CalendarOutlined style={{ color: '#02429B' }} />
              <span>MY ACTIVE MATTERS · 在办案件</span>
            </Space>
          }
          bordered
          loading={loading}
          extra={
            <Button type="link" size="small" onClick={() => navigate('/legal/cases')}>
              查看全部
            </Button>
          }
        >
          {activeCases.length === 0 && (
            <Text type="secondary">暂无在办案件，点击右上角「案件列表」新建案件。</Text>
          )}
          <Space direction="vertical" style={{ width: '100%' }} size={12}>
            {activeCases.map((c) => {
              const stageMeta = CASE_STAGE_META[c.stage];
              const priorityMeta = CASE_PRIORITY_META[c.priority];
              const dataClass = c.dataClassification ?? 'L4';
              return (
                <ProCard
                  key={c.id}
                  size="small"
                  hoverable
                  onClick={() => navigate(`/legal/cases/${c.id}`)}
                  style={{ cursor: 'pointer' }}
                  bodyStyle={{ padding: '12px 16px' }}
                >
                  <Space direction="vertical" size={6} style={{ width: '100%' }}>
                    <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Space wrap>
                        <Text strong>{c.title}</Text>
                        <Tag color={priorityMeta.color}>{priorityMeta.text}</Tag>
                        <Tag color={DATA_CLASS_META[dataClass]?.color ?? 'default'}>
                          {DATA_CLASS_META[dataClass]?.text ?? dataClass}
                        </Tag>
                      </Space>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {c.matterNo ?? c.caseNo} · {CASE_TYPE_META[c.caseType]}
                      </Text>
                    </Space>
                    <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Space wrap size={12}>
                        <Tag color={stageMeta.color}>{stageMeta.text}</Tag>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {CASE_STATUS_META[c.status].text}
                          {c.responsibleLawyer ? ` · 承办 ${c.responsibleLawyer}` : ''}
                        </Text>
                      </Space>
                      <Space size={8}>
                        <div style={{ width: 140 }}>
                          <Progress
                            percent={c.stageProgress}
                            size="small"
                            status="active"
                            format={(p) => `${p ?? 0}%`}
                          />
                        </div>
                        <Tooltip title="进入案件作战室（程序树 + 八闸门）">
                          <Button size="small" type="primary" ghost>
                            继续办理
                          </Button>
                        </Tooltip>
                      </Space>
                    </Space>
                  </Space>
                </ProCard>
              );
            })}
          </Space>
        </ProCard>

        <div style={{ color: '#999', fontSize: 12 }}>
          LINK & CROSS · TODAY COMMAND —— 待办/律时/客户/案件统一聚合；可信业务链 V35
          八闸门保障不越级办理。
        </div>
      </Space>
    </PageContainer>
  );
}
