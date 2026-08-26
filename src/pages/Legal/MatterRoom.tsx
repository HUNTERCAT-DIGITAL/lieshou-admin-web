/**
 * 案件作战室（MATTER COMMAND · V35 八阶段程序树 + 八闸门）.
 *
 * 程序树：当前阶段之前的 = 已封版（✓），当前 = 进行中（进度），之后 = 未到达。
 * 闸门：立项四闸门（全部通过才可办理）+ 结案四闸门；状态可直接更新（对齐 V35 不可越级）。
 */
import { useCallback, useEffect, useState } from 'react';
import {
  App,
  Button,
  Card,
  Popconfirm,
  Progress,
  Select,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import {
  ArrowRightOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';

import {
  CASE_STAGE_FLOW,
  DATA_CLASS_META,
  GATE_STATUS_META,
  GATE_TYPE_META,
  stageIndex,
  type Gate,
  type GateStatus,
  type LegalCase,
} from '../../types/legal';
import { intakeGateSummary, listCaseGates, updateCase, updateGate } from '../../services/legal';
import { useApiError } from '../../hooks/useApiError';

const { Text } = Typography;

const STATUS_OPTIONS = (Object.keys(GATE_STATUS_META) as GateStatus[]).map((s) => ({
  label: GATE_STATUS_META[s].text,
  value: s,
}));

export default function MatterRoom({
  detail,
  onChanged,
}: {
  detail: LegalCase;
  onChanged: () => void;
}) {
  const { message } = App.useApp();
  const handleError = useApiError();
  const [gates, setGates] = useState<Gate[]>([]);
  const [intakePassed, setIntakePassed] = useState<boolean | null>(null);
  const currentIdx = stageIndex(detail.stage);
  const current = CASE_STAGE_FLOW[currentIdx];
  const dataClass = detail.dataClassification ?? 'L4';

  const loadGates = useCallback(async () => {
    try {
      const [g, s] = await Promise.all([listCaseGates(detail.id), intakeGateSummary(detail.id)]);
      setGates(g);
      setIntakePassed(s.intakeGatesPassed);
    } catch {
      setGates([]);
    }
  }, [detail.id]);

  useEffect(() => {
    void loadGates();
  }, [loadGates]);

  const advance = async () => {
    const next = CASE_STAGE_FLOW[currentIdx + 1];
    if (!next) return;
    try {
      await updateCase(detail.id, { caseNo: detail.caseNo, title: detail.title, stage: next.key });
      message.success(`已进入「${next.name}」阶段`);
      onChanged();
    } catch (e) {
      handleError(e);
    }
  };

  const changeGate = async (gate: Gate, status: GateStatus) => {
    try {
      await updateGate(gate.id, { status, note: gate.note ?? undefined });
      message.success(`${GATE_TYPE_META[gate.gateType].text} → ${GATE_STATUS_META[status].text}`);
      await loadGates();
    } catch (e) {
      handleError(e);
    }
  };

  const intakeGates = gates.filter((g) => GATE_TYPE_META[g.gateType].phase === 'intake');
  const closeGates = gates.filter((g) => GATE_TYPE_META[g.gateType].phase === 'close');

  return (
    <Card size="small">
      {/* 当前阶段摘要 */}
      <div
        style={{
          padding: '12px 16px',
          marginBottom: 16,
          borderRadius: 8,
          background: 'linear-gradient(120deg, #e6f4ff, #f9f0ff)',
          border: '1px solid #d9d9d9',
        }}
      >
        <Space size="large" wrap align="center">
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              当前阶段 · {current.no}
            </Text>
            <div style={{ fontSize: 16, fontWeight: 600, marginTop: 2 }}>{current.name}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              主责：{current.role}
            </Text>
          </div>
          <div style={{ width: 160 }}>
            <Progress percent={detail.stageProgress} size="small" status="active" />
          </div>
          <Space wrap>
            <Tag color={DATA_CLASS_META[dataClass]?.color ?? 'default'}>
              {DATA_CLASS_META[dataClass]?.text ?? dataClass}
            </Tag>
            <Tag color={intakePassed ? 'green' : 'orange'}>
              {intakePassed === null
                ? '闸门加载中…'
                : intakePassed
                  ? '立项闸门已全部通过'
                  : '立项闸门未全部通过'}
            </Tag>
            {currentIdx < CASE_STAGE_FLOW.length - 1 ? (
              <Popconfirm
                title={`推进到下一阶段「${CASE_STAGE_FLOW[currentIdx + 1].name}」？`}
                onConfirm={() => void advance()}
              >
                <Button type="primary" size="small" icon={<ArrowRightOutlined />}>
                  推进到下一阶段
                </Button>
              </Popconfirm>
            ) : (
              <Tag color="green">已完成全部阶段</Tag>
            )}
          </Space>
        </Space>
      </div>

      {/* 八阶段程序树 */}
      <div>
        {CASE_STAGE_FLOW.map((f, idx) => {
          const state = idx < currentIdx ? 'done' : idx === currentIdx ? 'current' : 'pending';
          return (
            <div
              key={f.key}
              style={{
                display: 'flex',
                gap: 12,
                padding: '12px 8px',
                borderBottom: idx < CASE_STAGE_FLOW.length - 1 ? '1px dashed #f0f0f0' : 'none',
                background: state === 'current' ? '#fafafa' : undefined,
                borderRadius: 8,
              }}
            >
              <div style={{ width: 28, textAlign: 'center', marginTop: 2 }}>
                {state === 'done' ? (
                  <CheckCircleFilled style={{ color: '#52c41a', fontSize: 16 }} />
                ) : state === 'current' ? (
                  <ClockCircleOutlined style={{ color: '#1677ff', fontSize: 16 }} />
                ) : (
                  <LockOutlined style={{ color: '#d9d9d9', fontSize: 16 }} />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <Space size="middle" wrap>
                  <Text strong>{f.no}</Text>
                  <Text
                    strong={state === 'current'}
                    style={state === 'current' ? { color: '#1677ff' } : undefined}
                  >
                    {f.name}
                  </Text>
                  <Tag
                    color={
                      state === 'done' ? 'success' : state === 'current' ? 'processing' : 'default'
                    }
                  >
                    {state === 'done'
                      ? '已封版'
                      : state === 'current'
                        ? `进行中 ${detail.stageProgress}%`
                        : '未到达'}
                  </Tag>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    主责：{f.role}
                  </Text>
                </Space>
                <div style={{ marginTop: 4, color: 'rgba(0,0,0,0.55)', fontSize: 12 }}>
                  产出物：{f.outputs.join(' · ')}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 闸门体系（V35） */}
      <div style={{ marginTop: 16 }}>
        <Space style={{ marginBottom: 8 }}>
          <SafetyCertificateOutlined style={{ color: '#1677ff' }} />
          <Text strong>TRUSTED MATTER CHAIN · V35 可信业务链</Text>
        </Space>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {/* 立项闸门 */}
          <Card size="small" title="立项前置闸门" style={{ flex: 1, minWidth: 260 }}>
            {intakeGates.map((g) => (
              <GateRow key={g.id} gate={g} onChange={changeGate} />
            ))}
            {intakeGates.length === 0 && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                暂无闸门数据
              </Text>
            )}
          </Card>
          {/* 结案闸门 */}
          <Card size="small" title="结案与持续服务闸门" style={{ flex: 1, minWidth: 260 }}>
            {closeGates.map((g) => (
              <GateRow key={g.id} gate={g} onChange={changeGate} />
            ))}
            {closeGates.length === 0 && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                暂无闸门数据
              </Text>
            )}
          </Card>
        </div>
        <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
          真实身份、案件职责、空间、材料、任务、AI、程序状态与法律效果已统一绑定；未满足前置条件的节点不能越级办理。
        </div>
      </div>
    </Card>
  );
}

function GateRow({ gate, onChange }: { gate: Gate; onChange: (g: Gate, s: GateStatus) => void }) {
  const meta = GATE_TYPE_META[gate.gateType];
  const statusMeta = GATE_STATUS_META[gate.status];
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        padding: '6px 0',
        borderBottom: '1px dashed #f0f0f0',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <Space size="small">
          <Tag color={statusMeta.color}>{statusMeta.text}</Tag>
          <Text strong style={{ fontSize: 13 }}>
            {meta.text}
          </Text>
        </Space>
        <Tooltip title={meta.desc}>
          <div
            style={{
              fontSize: 11,
              color: '#999',
              marginTop: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {meta.desc}
          </div>
        </Tooltip>
      </div>
      <Select
        size="small"
        value={gate.status}
        options={STATUS_OPTIONS}
        onChange={(v) => onChange(gate, v)}
        style={{ width: 90 }}
      />
    </div>
  );
}
