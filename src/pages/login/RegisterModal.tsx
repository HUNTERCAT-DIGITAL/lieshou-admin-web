/**
 * 注册 Modal（验证码注册，注册即登录）.
 *
 * 从 Login.tsx 拆分（P0 组件化）——单租户版（hideTenantInput）固定用版别默认租户，
 * 不读表单输入；注册成功后 setSession 直接进入已登录态。
 */
import {
  LinkOutlined,
  LockOutlined,
  MailOutlined,
  SafetyOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Alert, Button, Form, Input, Modal, Select, Space } from 'antd';
import { useState } from 'react';

import { getEdition } from '../../config/editions';
import { AuthError, register, sendCode, type CodeChannel } from '../../services/auth';
import { useAuthStore } from '../../stores/auth';
import { getTenantCode, setTenantCode } from '../../utils/tenant-code';

export interface RegisterModalProps {
  open: boolean;
  onClose: () => void;
  onGo: () => void;
}

interface CodeFormValues {
  channel: CodeChannel;
  target: string;
  code: string;
}

interface RegisterFormValues extends CodeFormValues {
  tenantCode?: string;
  username: string;
  displayName: string;
  password: string;
  inviteCode?: string;
}

export default function RegisterModal({ open, onClose, onGo }: RegisterModalProps) {
  const [form] = Form.useForm<RegisterFormValues>();
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const send = async () => {
    const channel = form.getFieldValue('channel') as CodeChannel;
    const target = form.getFieldValue('target') as string;
    if (!target) {
      setErr('请先输入手机号/邮箱');
      return;
    }
    try {
      await sendCode(channel, target, 'REGISTER');
      setErr('验证码已发送（dev 日志查看）');
    } catch {
      setErr('发送失败（60 秒内请勿重复）');
    }
  };

  const submit = async (values: RegisterFormValues) => {
    setSubmitting(true);
    setErr(null);
    try {
      // 单租户版（hideTenantInput）：固定用版别默认租户，不读表单输入
      const edition = getEdition();
      const tenant = edition.hideTenantInput
        ? edition.defaultTenantCode
        : values.tenantCode?.trim();
      const token = await register({
        tenantCode: tenant || undefined,
        username: values.username,
        displayName: values.displayName,
        password: values.password,
        channel: values.channel,
        target: values.target,
        code: values.code,
        inviteCode: values.inviteCode || undefined,
      });
      if (tenant) setTenantCode(tenant);
      useAuthStore.getState().setSession(token);
      onClose();
      onGo();
    } catch (e) {
      setErr(e instanceof AuthError ? `${e.code}: ${e.message}` : `注册失败: ${String(e)}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="注册账号" open={open} onCancel={onClose} footer={null} destroyOnClose>
      <Form<RegisterFormValues>
        form={form}
        layout="vertical"
        onFinish={submit}
        requiredMark={false}
        initialValues={{ channel: 'SMS', tenantCode: getTenantCode() }}
        style={{ marginTop: 16 }}
      >
        <Form.Item
          label="租户编码"
          name="tenantCode"
          tooltip="加入哪个企业；有邀请码时忽略；默认猎手猫"
        >
          {getEdition().hideTenantInput ? (
            <Input prefix={<UserOutlined />} disabled value={getEdition().defaultTenantCode} />
          ) : (
            <Input prefix={<UserOutlined />} placeholder={getEdition().defaultTenantCode} />
          )}
        </Form.Item>
        <Form.Item
          label="邀请码（可选）"
          name="inviteCode"
          tooltip="租户管理员发的邀请码；填写后自动加入该租户并分配角色"
        >
          <Input prefix={<LinkOutlined />} placeholder="如：AB12CD34" />
        </Form.Item>
        <Form.Item
          label="用户名"
          name="username"
          rules={[
            { required: true, message: '请输入用户名' },
            { pattern: /^[a-zA-Z0-9_]{3,64}$/, message: '3-64 位字母/数字/下划线' },
          ]}
        >
          <Input prefix={<UserOutlined />} placeholder="登录名" />
        </Form.Item>
        <Form.Item
          label="显示名"
          name="displayName"
          rules={[{ required: true, message: '请输入显示名' }]}
        >
          <Input placeholder="如：李四" />
        </Form.Item>
        <Form.Item
          label="密码"
          name="password"
          rules={[
            { required: true, message: '请输入密码' },
            { min: 6, message: '至少 6 位' },
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="至少 6 位" />
        </Form.Item>
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
          <Input prefix={<MailOutlined />} placeholder="13800000000 / user@example.com" />
        </Form.Item>
        <Form.Item label="验证码" name="code" rules={[{ required: true, message: '请输入验证码' }]}>
          <Space.Compact style={{ width: '100%' }}>
            <Input prefix={<SafetyOutlined />} placeholder="6 位验证码" />
            <Button onClick={send}>获取验证码</Button>
          </Space.Compact>
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
          注册并登录
        </Button>
      </Form>
    </Modal>
  );
}
