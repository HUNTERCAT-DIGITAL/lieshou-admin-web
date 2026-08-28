/**
 * 忘记密码 Modal（验证码重置）.
 *
 * 从 Login.tsx 拆分（P0 组件化）——发送验证码 → 校验 → 重置新密码。
 */
import { LockOutlined, MobileOutlined, SafetyOutlined } from '@ant-design/icons';
import { Alert, Button, Form, Input, Modal, Select, Space } from 'antd';
import { useState } from 'react';

import { AuthError, resetPassword, sendCode, type CodeChannel } from '../../services/auth';

export interface ResetModalProps {
  open: boolean;
  onClose: () => void;
}

interface CodeFormValues {
  channel: CodeChannel;
  target: string;
  code: string;
}

interface ResetFormValues extends CodeFormValues {
  newPassword: string;
}

export default function ResetModal({ open, onClose }: ResetModalProps) {
  const [form] = Form.useForm<ResetFormValues>();
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const send = async () => {
    const channel = form.getFieldValue('channel') as CodeChannel;
    const target = form.getFieldValue('target') as string;
    if (!target) {
      setErr('请先输入手机号/邮箱');
      return;
    }
    try {
      await sendCode(channel, target, 'RESET_PASSWORD');
      setErr('验证码已发送（dev 日志查看）');
    } catch {
      setErr('发送失败（60 秒内请勿重复）');
    }
  };

  const submit = async (values: ResetFormValues) => {
    setSubmitting(true);
    setErr(null);
    try {
      await resetPassword(values.channel, values.target, values.code, values.newPassword);
      setDone(true);
    } catch (e) {
      setErr(e instanceof AuthError ? `${e.code}: ${e.message}` : `重置失败: ${String(e)}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="忘记密码" open={open} onCancel={onClose} footer={null} destroyOnClose>
      {done ? (
        <Alert
          type="success"
          message="密码已重置"
          description="请返回登录页使用新密码登录。"
          showIcon
        />
      ) : (
        <Form<ResetFormValues>
          form={form}
          layout="vertical"
          onFinish={submit}
          requiredMark={false}
          initialValues={{ channel: 'SMS' }}
          style={{ marginTop: 16 }}
        >
          <Form.Item label="验证方式" name="channel">
            <Select
              options={[
                { label: '手机号', value: 'SMS' },
                { label: '邮箱', value: 'EMAIL' },
              ]}
            />
          </Form.Item>
          <Form.Item
            label="手机号 / 邮箱"
            name="target"
            rules={[{ required: true, message: '请输入手机号或邮箱' }]}
          >
            <Input prefix={<MobileOutlined />} placeholder="13800000000 / user@example.com" />
          </Form.Item>
          <Form.Item
            label="验证码"
            name="code"
            rules={[{ required: true, message: '请输入验证码' }]}
          >
            <Space.Compact style={{ width: '100%' }}>
              <Input prefix={<SafetyOutlined />} placeholder="6 位验证码" />
              <Button onClick={send}>获取验证码</Button>
            </Space.Compact>
          </Form.Item>
          <Form.Item
            label="新密码"
            name="newPassword"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '至少 6 位' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="至少 6 位" />
          </Form.Item>
          {err && (
            <Alert
              type={err.includes('已发送') ? 'success' : 'error'}
              message={err}
              showIcon
              style={{ marginBottom: 12 }}
            />
          )}
          <Button type="primary" htmlType="submit" loading={submitting} block>
            重置密码
          </Button>
        </Form>
      )}
    </Modal>
  );
}
