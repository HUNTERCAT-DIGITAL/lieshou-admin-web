/**
 * 租户自助开通页（SaaS 增长路径 · 公开页面，无需登录 · issue #24）.
 *
 * 官网/登录页「免费开通」→ 填写租户 + 管理员 → 创建成功 → 自动跳登录页（预填租户编码 + 用户名）。
 * 后端 POST /api/tenants/register（gateway 白名单放行）；版别默认 GENERIC。
 */
import { App, Button, Card, Form, Input, Typography } from 'antd';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { getEdition } from '../config/editions';
import { registerTenant } from '../services/tenant';

interface FormValues {
  tenantName: string;
  tenantCode: string;
  username: string;
  displayName: string;
  password: string;
  confirm: string;
  email?: string;
}

const CODE_RULE = /^[a-z0-9][a-z0-9-]{1,31}$/;

export default function RegisterTenant() {
  const { message: messageApi } = App.useApp();
  const navigate = useNavigate();
  const edition = getEdition();
  const [submitting, setSubmitting] = useState(false);

  const onFinish = async (values: FormValues) => {
    if (values.password !== values.confirm) {
      messageApi.error('两次输入的密码不一致');
      return;
    }
    setSubmitting(true);
    try {
      const result = await registerTenant({
        tenantName: values.tenantName,
        tenantCode: values.tenantCode,
        username: values.username,
        displayName: values.displayName,
        password: values.password,
        email: values.email,
      });
      messageApi.success(`开通成功！租户「${result.tenant.name}」，管理员 ${result.adminUsername}`);
      // 跳登录页并预填
      navigate(
        `/login?tenant=${encodeURIComponent(result.tenant.code)}&username=${encodeURIComponent(result.adminUsername)}`,
      );
    } catch (e) {
      const err = e as { message?: string; data?: { message?: string } };
      messageApi.error(err.data?.message ?? err.message ?? '开通失败，请稍后重试');
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${edition.primaryColor} 0%, ${edition.primaryColor}99 100%)`,
        padding: 24,
      }}
    >
      <Card style={{ width: 420, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
        <Typography.Title level={3} style={{ textAlign: 'center', marginBottom: 4 }}>
          {edition.brandName} · 免费开通
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ textAlign: 'center', marginBottom: 24 }}>
          创建您的专属租户，注册即开通（管理员账号可直接登录）
        </Typography.Paragraph>

        <Form<FormValues> layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item
            name="tenantName"
            label="公司 / 组织名称"
            rules={[{ required: true, message: '请输入公司或组织名称' }]}
          >
            <Input placeholder="如：示例科技有限公司" maxLength={128} />
          </Form.Item>
          <Form.Item
            name="tenantCode"
            label="租户编码（登录用）"
            rules={[
              { required: true, message: '请输入租户编码' },
              {
                pattern: CODE_RULE,
                message: '2-32 位小写字母/数字/连字符（如 mycompany）',
              },
            ]}
          >
            <Input placeholder="mycompany" maxLength={32} />
          </Form.Item>
          <Form.Item
            name="username"
            label="管理员用户名"
            rules={[{ required: true, message: '请输入管理员用户名' }]}
          >
            <Input placeholder="admin" maxLength={64} />
          </Form.Item>
          <Form.Item
            name="displayName"
            label="管理员姓名"
            rules={[{ required: true, message: '请输入管理员姓名' }]}
          >
            <Input placeholder="如：张三" maxLength={64} />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱（选填）"
            rules={[{ type: 'email', message: '邮箱格式不正确' }]}
          >
            <Input placeholder="admin@company.com" />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少 6 位' },
            ]}
          >
            <Input.Password placeholder="至少 6 位" />
          </Form.Item>
          <Form.Item
            name="confirm"
            label="确认密码"
            dependencies={['password']}
            rules={[
              { required: true, message: '请再次输入密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="再次输入密码" />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={submitting}
            style={{ background: edition.primaryColor, borderColor: edition.primaryColor }}
          >
            免费开通
          </Button>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            已有账号？<Link to="/login">去登录</Link>
          </Typography.Text>
        </div>
      </Card>
    </div>
  );
}
