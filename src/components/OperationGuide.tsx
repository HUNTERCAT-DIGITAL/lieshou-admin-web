/**
 * 操作引导（Operation Guide · 2026-09）
 *
 * 引导使用者按正确顺序操作这套告警能力：
 *   配置告警规则 → 模拟调试设备造场景 → 观察告警落库/短信 → 处理告警闭环。
 *
 * 入口在控制台顶栏右侧「操作引导」按钮；点击展开右侧 Drawer，
 * 用 Steps 分步展示完整操作链，每步附操作按钮（跳转页面 / 复制命令）。
 */
import { useState } from 'react';
import { Button, Drawer, Steps, Typography, Space } from 'antd';
import {
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

interface GuideStep {
  title: string;
  description: string;
  /** 跳转动作 */
  actionLabel?: string;
  actionPath?: string;
  /** 命令（模拟调试步骤） */
  command?: string;
}

const STEPS: GuideStep[] = [
  {
    title: '配置告警规则',
    description:
      '在「规则」页新建规则：选择作用产品（GJXA-CABLE-1）与作用设备（留空=产品级全部设备），'
      + '选属性（如 node*_battery）→ 比较符/阈值（如 LT 2.8）→ 通知动作（NOTIFY 触发短信）。',
    actionLabel: '前往规则配置',
    actionPath: '/iot/rules',
  },
  {
    title: '模拟调试设备',
    description:
      '真实物理设备的属性不一定符合测试要求（如电池一直 3.5V 无法触发缺电）。'
      + '用模拟脚本造场景，立即触发对应告警规则。',
    command: 'node deploy/simulate-device.mjs low-battery',
  },
  {
    title: '观察告警',
    description:
      '模拟上报后，在「告警」页查看落库的告警（缺电/高温/离线），'
      + '侧栏菜单「告警」角标显示待确认数量。',
    actionLabel: '前往告警列表',
    actionPath: '/iot/alerts',
  },
  {
    title: '处理告警',
    description:
      '在告警列表对每条告警执行「确认」（PENDING → ACKNOWLEDGED），完成值班处置闭环。',
    actionLabel: '前往告警列表',
    actionPath: '/iot/alerts',
  },
];

/** 顶栏「操作引导」按钮 + 右侧引导 Drawer（自包含，供 ConsoleLayout actionsRender 直接挂载） */
export default function OperationGuide() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <Button
        type="text"
        icon={<QuestionCircleOutlined />}
        onClick={() => setOpen(true)}
        style={{ color: 'rgba(0,0,0,0.65)' }}
      >
        操作引导
      </Button>
      <Drawer
        title="操作引导"
        placement="right"
        width={440}
        open={open}
        onClose={() => setOpen(false)}
      >
        <Steps
          direction="vertical"
          current={-1}
          items={STEPS.map((s) => ({
            title: s.title,
            description: (
              <Space direction="vertical" size={6} style={{ width: '100%' }}>
                <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                  {s.description}
                </Typography.Text>
                {s.command && (
                  <Typography.Paragraph
                    code
                    copyable={{ text: s.command }}
                    style={{ margin: 0, fontSize: 12 }}
                  >
                    {s.command}
                  </Typography.Paragraph>
                )}
                {s.actionLabel && s.actionPath && (
                  <Button
                    size="small"
                    type="primary"
                    ghost
                    onClick={() => {
                      setOpen(false);
                      navigate(s.actionPath!);
                    }}
                  >
                    {s.actionLabel}
                  </Button>
                )}
              </Space>
            ),
          }))}
        />
      </Drawer>
    </>
  );
}
