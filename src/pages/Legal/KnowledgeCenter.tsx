/**
 * 知识资产中心（KNOWLEDGE ASSETS · 经验候选 → 专业复核 → 脱敏复用）.
 *
 * 六类知识卡（裁判规则/证据策略/失败教训/文书表达/客户沟通/产品交付）+ 策略/经验；
 * 状态流：经验候选 → 待复核 → 已复核 → 脱敏可复用（驳回）。失败教训卡内部受限。
 */
import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeInvisibleOutlined,
  PlusOutlined,
  ReloadOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import {
  App,
  Button,
  Card,
  Empty,
  Input,
  Modal,
  Pagination,
  Popconfirm,
  Select,
  Space,
  Statistic,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import { useCallback, useEffect, useState } from 'react';

import { useApiError } from '../../hooks/useApiError';
import {
  createKnowledgeCard,
  deleteKnowledgeCard,
  knowledgeSummary,
  listKnowledgeCards,
  transitionKnowledgeCard,
  updateKnowledgeCard,
} from '../../services/legal';
import {
  KNOWLEDGE_STATUS_META,
  KNOWLEDGE_TYPE_META,
  type KnowledgeCard,
  type KnowledgeCardRequest,
  type KnowledgeCardStatus,
  type KnowledgeCardType,
} from '../../types/legal';
import { usePaged } from '../../hooks/usePaged';

const { Text } = Typography;

const TYPE_OPTIONS = (Object.keys(KNOWLEDGE_TYPE_META) as KnowledgeCardType[]).map((t) => ({
  label: KNOWLEDGE_TYPE_META[t].text,
  value: t,
}));
const STATUS_OPTIONS = (Object.keys(KNOWLEDGE_STATUS_META) as KnowledgeCardStatus[]).map((s) => ({
  label: KNOWLEDGE_STATUS_META[s].text,
  value: s,
}));

export default function KnowledgeCenter() {
  const { message } = App.useApp();
  const handleError = useApiError();
  const [summary, setSummary] = useState({ total: 0, candidateCount: 0, reviewPendingCount: 0 });
  const [cardType, setCardType] = useState<string | undefined>();
  const [status, setStatus] = useState<string | undefined>();
  const [keyword, setKeyword] = useState('');
  const paged = usePaged<KnowledgeCard>((page, size) =>
    listKnowledgeCards({ cardType, status, keyword: keyword || undefined }, page, size),
  );

  const loadSummary = useCallback(async () => {
    try {
      setSummary(await knowledgeSummary());
    } catch {
      /* 静默 */
    }
  }, []);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  const onFilter = () => {
    paged.reload();
  };

  const create = async (body: KnowledgeCardRequest) => {
    try {
      await createKnowledgeCard(body);
      message.success('已沉淀为经验候选');
      await paged.reload();
      await loadSummary();
    } catch (e) {
      handleError(e);
    }
  };

  const transition = async (k: KnowledgeCard, s: KnowledgeCardStatus) => {
    try {
      await transitionKnowledgeCard(k.id, s);
      message.success(`已更新为「${KNOWLEDGE_STATUS_META[s].text}」`);
      await paged.reload();
      await loadSummary();
    } catch (e) {
      handleError(e);
    }
  };

  const remove = async (k: KnowledgeCard) => {
    try {
      await deleteKnowledgeCard(k.id);
      message.success('已删除');
      await paged.reload();
      await loadSummary();
    } catch (e) {
      handleError(e);
    }
  };

  return (
    <PageContainer
      title="知识资产中心"
      subTitle="KNOWLEDGE ASSETS · 让专业沉淀，让卓越生长"
      extra={[
        <Button key="reload" icon={<ReloadOutlined />} onClick={() => void paged.reload()}>
          刷新
        </Button>,
        <KnowledgeCardModal key="create" trigger="新建知识卡" onSubmit={create} />,
      ]}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* 知识资产总览 */}
        <ProCard split="vertical" bordered bodyStyle={{ padding: '12px 0' }}>
          <Statistic title="知识卡总量" value={summary.total} suffix="张" />
          <Statistic
            title="候选待复核"
            value={summary.candidateCount}
            valueStyle={{ color: summary.candidateCount > 0 ? '#fa8c16' : '#52c41a' }}
          />
          <Statistic
            title="待专业复核"
            value={summary.reviewPendingCount}
            valueStyle={{ color: summary.reviewPendingCount > 0 ? '#fa8c16' : '#52c41a' }}
          />
        </ProCard>

        {/* 过滤 + 列表 */}
        <ProCard bordered>
          <Space wrap style={{ marginBottom: 12 }}>
            <Select
              allowClear
              placeholder="卡类型"
              style={{ width: 140 }}
              options={TYPE_OPTIONS}
              onChange={(v) => {
                setCardType(v);
                onFilter();
              }}
            />
            <Select
              allowClear
              placeholder="状态"
              style={{ width: 140 }}
              options={STATUS_OPTIONS}
              onChange={(v) => {
                setStatus(v);
                onFilter();
              }}
            />
            <Input.Search
              placeholder="搜索标题 / 内容"
              allowClear
              style={{ width: 220 }}
              onSearch={() => onFilter()}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </Space>

          {paged.items.length === 0 && !paged.loading ? (
            <Empty description="暂无知识卡，点击「新建知识卡」沉淀办案经验" />
          ) : (
            <Space direction="vertical" style={{ width: '100%' }} size={12}>
              {paged.items.map((k) => {
                const typeMeta = KNOWLEDGE_TYPE_META[k.cardType];
                const statusMeta = KNOWLEDGE_STATUS_META[k.status];
                return (
                  <Card key={k.id} size="small">
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Space wrap size={6} style={{ marginBottom: 4 }}>
                          <Tag color={typeMeta.color}>{typeMeta.text}</Tag>
                          <Tag color={statusMeta.color}>{statusMeta.text}</Tag>
                          {k.confidential && (
                            <Tag icon={<EyeInvisibleOutlined />} color="default">
                              内部受限
                            </Tag>
                          )}
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            复用 {k.usageCount} 次
                            {k.reviewedAt ? ` · 复核于 ${k.reviewedAt.slice(0, 10)}` : ''}
                          </Text>
                        </Space>
                        <div style={{ fontWeight: 600 }}>{k.title}</div>
                        {k.content && (
                          <Text
                            type="secondary"
                            style={{
                              fontSize: 12,
                              display: 'block',
                              marginTop: 2,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {k.content}
                          </Text>
                        )}
                      </div>
                      <Space size={4}>
                        {/* 状态流转：待复核 → 已复核 → 可复用；候选 → 待复核 */}
                        {k.status === 'DRAFT' && (
                          <Button
                            size="small"
                            type="primary"
                            ghost
                            icon={<SendOutlined />}
                            onClick={() => transition(k, 'PENDING_REVIEW')}
                          >
                            提交复核
                          </Button>
                        )}
                        {k.status === 'PENDING_REVIEW' && (
                          <Button
                            size="small"
                            type="primary"
                            icon={<CheckCircleOutlined />}
                            onClick={() => transition(k, 'REVIEWED')}
                          >
                            通过复核
                          </Button>
                        )}
                        {k.status === 'REVIEWED' && (
                          <Button
                            size="small"
                            type="primary"
                            ghost
                            icon={<CheckCircleOutlined />}
                            onClick={() => transition(k, 'PUBLISHED')}
                          >
                            脱敏发布
                          </Button>
                        )}
                        <KnowledgeCardModal
                          key={`edit-${k.id}`}
                          trigger="编辑"
                          initial={{
                            cardType: k.cardType,
                            title: k.title,
                            content: k.content ?? undefined,
                          }}
                          onSubmit={async (body) => {
                            await updateKnowledgeCard(k.id, body);
                            message.success('已更新');
                            await paged.reload();
                          }}
                        />
                        <Popconfirm title="删除该知识卡？" onConfirm={() => void remove(k)}>
                          <Tooltip title="删除">
                            <Button type="link" size="small" danger icon={<DeleteOutlined />} />
                          </Tooltip>
                        </Popconfirm>
                      </Space>
                    </div>
                  </Card>
                );
              })}
            </Space>
          )}
          <Pagination
            style={{ marginTop: 12, textAlign: 'right' }}
            current={paged.page}
            total={paged.total}
            pageSize={paged.size}
            showSizeChanger={false}
            onChange={(p) => paged.goPage(p)}
          />
        </ProCard>

        <div style={{ color: '#999', fontSize: 12 }}>
          知识贡献评价：是否被验证、是否能复用、是否帮助了他人 —— 单纯上传文件不计算贡献。
        </div>
      </Space>
    </PageContainer>
  );
}

/** 知识卡新建/编辑弹窗（卡类型/标题/内容） */
function KnowledgeCardModal({
  trigger,
  initial,
  onSubmit,
}: {
  trigger: string;
  initial?: { cardType: KnowledgeCardType; title: string; content?: string };
  onSubmit: (body: KnowledgeCardRequest) => Promise<void>;
}) {
  const isCreate = trigger === '新建知识卡';
  const [open, setOpen] = useState(false);
  const [cardType, setCardType] = useState<KnowledgeCardType>(initial?.cardType ?? 'RULE');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [content, setContent] = useState(initial?.content ?? '');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        cardType,
        title: title.trim(),
        content: content || undefined,
      });
      setOpen(false);
      if (isCreate) {
        setCardType('RULE');
        setTitle('');
        setContent('');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {isCreate ? (
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>
          {trigger}
        </Button>
      ) : (
        <Tooltip title="编辑">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => setOpen(true)} />
        </Tooltip>
      )}
      <Modal
        title={isCreate ? '沉淀知识卡（经验候选）' : '编辑知识卡'}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => void submit()}
        okText="保存"
        cancelText="取消"
        confirmLoading={submitting}
        width={520}
      >
        <Space direction="vertical" style={{ width: '100%' }} size={12}>
          <div>
            <Text strong style={{ fontSize: 13 }}>
              卡类型
            </Text>
            <Select
              value={cardType}
              onChange={setCardType}
              options={TYPE_OPTIONS}
              style={{ width: '100%', marginTop: 4 }}
            />
          </div>
          <div>
            <Text strong style={{ fontSize: 13 }}>
              标题
            </Text>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="如：资本维持原则与回购条款效力"
              style={{ marginTop: 4 }}
            />
          </div>
          <div>
            <Text strong style={{ fontSize: 13 }}>
              内容（要点/规则/框架）
            </Text>
            <Input.TextArea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              placeholder="沉淀可复用的专业要点…"
              style={{ marginTop: 4 }}
            />
          </div>
        </Space>
      </Modal>
    </>
  );
}
