/**
 * 个人中心（账号设置 · 2026-09）
 *
 * 登录者查看/修改自己的账号信息——重点是「手机号」：
 * 手机号是告警短信的接收人（规则命中 → 发短信到账号手机号），
 * 值班员可在此维护自己的接收号码。
 */
import { useEffect, useState } from 'react';
import { App, Button, Card, Descriptions, Form, Input, Tag, Typography } from 'antd';
import { MobileOutlined, SaveOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';

import { getUser, updateUser, useAuthStore } from '@lieshoucloud/core-web';
import { STATUS_META, type User } from '@lieshoucloud/contract-types/business/user';

export default function ProfilePage() {
  const { message } = App.useApp();
  const user = useAuthStore((s) => s.user);
  const [detail, setDetail] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (!user?.userId) return;
    setLoading(true);
    getUser(user.userId)
      .then((u) => {
        setDetail(u);
        form.setFieldsValue({ displayName: u.displayName, email: u.email ?? '', phone: u.phone ?? '' });
      })
      .catch((e) => message.error(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [user?.userId]);

  const onSave = async () => {
    if (!detail) return;
    const v = await form.validateFields();
    setSaving(true);
    try {
      await updateUser(detail.id, {
        displayName: v.displayName,
        email: v.email || undefined,
        phone: v.phone || undefined,
        status: detail.status,
        roles: detail.roles,
      });
      message.success('已保存');
      setDetail({ ...detail, displayName: v.displayName, email: v.email, phone: v.phone });
    } catch (e) {
      message.error(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  const meta = detail ? STATUS_META[detail.status] : null;

  return (
    <PageContainer title="个人中心" loading={loading}>
      <Card style={{ maxWidth: 640 }}>
        <Descriptions column={1} size="middle" style={{ marginBottom: 24 }}>
          <Descriptions.Item label="账号">{detail?.username}</Descriptions.Item>
          <Descriptions.Item label="角色">
            {(detail?.roles ?? []).map((r) => (
              <Tag key={r} color="blue">{r}</Tag>
            ))}
          </Descriptions.Item>
          <Descriptions.Item label="状态">
            {meta ? <Tag color={meta.color}>{meta.text}</Tag> : '—'}
          </Descriptions.Item>
        </Descriptions>

        <Form form={form} layout="vertical" style={{ maxWidth: 420 }}>
          <Form.Item
            name="displayName"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="显示姓名" />
          </Form.Item>
          <Form.Item
            name="phone"
            label={
              <span>
                <MobileOutlined /> 手机号（告警短信接收人）
              </span>
            }
            rules={[
              { pattern: /^1\d{10}$/, message: '请输入 11 位手机号' },
            ]}
            extra="规则命中告警后，短信将发送到该手机号"
          >
            <Input placeholder="如 13800000000" maxLength={11} />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input placeholder="邮箱" />
          </Form.Item>
          <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={onSave}>
            保存
          </Button>
        </Form>
        <Typography.Paragraph type="secondary" style={{ marginTop: 16, marginBottom: 0 }}>
          提示：手机号是值班告警短信的接收地址，请保持为本人可用的号码。
        </Typography.Paragraph>
      </Card>
    </PageContainer>
  );
}
