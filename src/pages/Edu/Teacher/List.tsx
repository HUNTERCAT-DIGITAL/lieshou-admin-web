import { useCallback, useEffect, useRef, useState } from 'react';
import { App, Button, Form, Popconfirm, Space, Tooltip, Upload } from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import {
  ModalForm,
  PageContainer,
  ProCard,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProTable,
  StatisticCard,
  type ActionType,
  type ProColumns,
} from '@ant-design/pro-components';

import { StatusTag } from '@lieshoucloud/ui';

import { useApiError } from '../../../hooks/useApiError';
import { fetchFileContent, getFileMeta, uploadFile } from '../../../services/file';
import {
  createTeacher,
  deleteTeacher,
  listTeachers,
  updateTeacher,
} from '../../../services/teacher';
import {
  STATUS_META,
  SUBJECT_OPTIONS,
  type Teacher,
  type TeacherStatus,
} from '@lieshoucloud/types/business/teacher';

const STATUS_OPTIONS = (Object.keys(STATUS_META) as TeacherStatus[]).map((s) => ({
  label: STATUS_META[s].text,
  value: s,
}));

const SUBJECT_OPTIONS_MAP = SUBJECT_OPTIONS.map((s) => ({ label: s, value: s }));

/** 附件大小上限（core.file multipart 20MB） */
const MAX_ATTACH_BYTES = 20 * 1024 * 1024;

/** 概览统计（总 + 各状态） */
interface TeacherStats {
  total: number;
  AVAILABLE: number;
  DISPATCHING: number;
  DISABLED: number;
}

/** 新建/编辑表单值（ModalForm 泛型） */
interface FormValues {
  name: string;
  gender?: string;
  phone?: string;
  email?: string;
  subject?: string;
  licenseNo?: string;
  certAttach?: string;
  idCard?: string;
  weeklyCap?: number;
  status: TeacherStatus;
  remark?: string;
}

export default function TeacherList() {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const { message: messageApi } = App.useApp();
  const handleError = useApiError();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Teacher | null>(null);
  /** 新建/编辑表单中待上传的附件文件（选择后暂存，保存时上传） */
  const [pendingAttach, setPendingAttach] = useState<File | null>(null);
  /** 编辑时已存在的附件原始文件名（编辑回显用） */
  const [existingAttachName, setExistingAttachName] = useState<string | null>(null);
  const [stats, setStats] = useState<TeacherStats>({
    total: 0,
    AVAILABLE: 0,
    DISPATCHING: 0,
    DISABLED: 0,
  });

  /** 刷新概览统计（全量拉一次在客户端聚合；起步数据量小） */
  const refreshStats = useCallback(async () => {
    try {
      const data = await listTeachers();
      const s: TeacherStats = { total: data.length, AVAILABLE: 0, DISPATCHING: 0, DISABLED: 0 };
      for (const t of data) s[t.status] += 1;
      setStats(s);
    } catch {
      // 统计失败不阻塞页面（表格自身有错误处理）
    }
  }, []);

  useEffect(() => {
    void refreshStats();
  }, [refreshStats]);

  const reloadAll = () => {
    actionRef.current?.reload();
    void refreshStats();
  };

  /** 预览/下载资质附件（强制鉴权 blob 通道；<a href> 直接打开无 Authorization 会 401） */
  const previewAttach = async (row: Teacher) => {
    const id = Number(row.certAttach);
    if (!Number.isFinite(id) || id <= 0) {
      messageApi.warning('附件引用无效');
      return;
    }
    try {
      const [blob, meta] = await Promise.all([fetchFileContent(id), getFileMeta(id)]);
      const url = URL.createObjectURL(blob);
      // 图片内联预览（新标签），其他类型触发下载
      if (meta.contentType?.startsWith('image/')) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        const a = document.createElement('a');
        a.href = url;
        a.download = meta.originalName || `attachment-${id}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (e) {
      handleError(e);
    }
  };

  /** 编辑回显：读取已存在附件文件名 */
  useEffect(() => {
    if (editing?.certAttach && Number(editing.certAttach) > 0) {
      void getFileMeta(Number(editing.certAttach))
        .then((m) => setExistingAttachName(m.originalName))
        .catch(() => setExistingAttachName(null));
    } else {
      setExistingAttachName(null);
    }
    // 关闭弹窗时清空待上传附件
    if (!modalOpen) setPendingAttach(null);
  }, [editing, modalOpen]);

  const columns: ProColumns<Teacher>[] = [
    { title: 'ID', dataIndex: 'id', width: 64, search: false },
    {
      // 后端只支持统一 keyword（姓名/电话/授课方向模糊），搜索框映射到 keyword
      title: '姓名 / 关键字',
      dataIndex: 'keyword',
      width: 160,
      render: (_, row) => row.name,
    },
    {
      title: '性别',
      dataIndex: 'gender',
      width: 70,
      search: false,
      render: (_, row) => row.gender ?? '—',
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      width: 130,
      search: false,
      render: (_, row) => row.phone ?? '—',
    },
    {
      title: '授课方向',
      dataIndex: 'subject',
      width: 120,
      search: false,
      render: (_, row) => row.subject ?? '—',
    },
    {
      title: '合作状态',
      dataIndex: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: Object.fromEntries(
        (Object.keys(STATUS_META) as TeacherStatus[]).map((s) => [
          s,
          { text: STATUS_META[s].text },
        ]),
      ),
      render: (_, row) => <StatusTag meta={STATUS_META[row.status]} />,
    },
    {
      title: '每周产能',
      dataIndex: 'weeklyCap',
      width: 90,
      search: false,
      render: (_, row) => (row.weeklyCap !== null ? `${row.weeklyCap} 课时` : '—'),
    },
    {
      title: '教资证号',
      dataIndex: 'licenseNo',
      width: 150,
      search: false,
      ellipsis: true,
      render: (_, row) => row.licenseNo ?? '—',
    },
    {
      title: '资质附件',
      dataIndex: 'certAttach',
      width: 110,
      search: false,
      render: (_, row) =>
        row.certAttach ? (
          <Tooltip title="点击预览/下载资质证书（强制鉴权通道）">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => void previewAttach(row)}
            >
              查看
            </Button>
          </Tooltip>
        ) : (
          '—'
        ),
    },
    {
      title: '备注',
      dataIndex: 'remark',
      width: 160,
      search: false,
      ellipsis: true,
      render: (_, row) =>
        row.remark ? (
          <Tooltip title={row.remark}>
            <span>{row.remark}</span>
          </Tooltip>
        ) : (
          '—'
        ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      width: 170,
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 130,
      render: (_, row) => [
        <Button
          key="edit"
          type="link"
          icon={<EditOutlined />}
          onClick={() => {
            setEditing(row);
            setModalOpen(true);
          }}
        >
          编辑
        </Button>,
        <Popconfirm
          key="del"
          title="确定删除该师资？"
          description={`${row.name} 删除后将从列表移除（软删）`}
          okText="删除"
          cancelText="取消"
          okButtonProps={{ danger: true }}
          onConfirm={async () => {
            try {
              await deleteTeacher(row.id);
              messageApi.success('已删除');
              reloadAll();
            } catch (e) {
              handleError(e);
            }
          }}
        >
          <Button type="link" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Popconfirm>,
      ],
    },
  ];

  const onFinish = async (values: FormValues) => {
    try {
      // 附件：先上传到 core.file，把返回的 fileId 存入 certAttach；未选择时编辑保留原值/新建置空
      let certAttach = values.certAttach ?? undefined;
      if (pendingAttach) {
        const meta = await uploadFile(pendingAttach);
        certAttach = String(meta.id);
        setPendingAttach(null);
      }
      const payload = {
        name: String(values.name),
        gender: values.gender ? String(values.gender) : undefined,
        phone: values.phone ? String(values.phone) : undefined,
        email: values.email ? String(values.email) : undefined,
        subject: values.subject ? String(values.subject) : undefined,
        licenseNo: values.licenseNo ? String(values.licenseNo) : undefined,
        certAttach,
        // 身份证只写不读：编辑时留空表示不修改
        idCard: values.idCard ? String(values.idCard) : undefined,
        weeklyCap: values.weeklyCap !== null ? Number(values.weeklyCap) : undefined,
        status: values.status as TeacherStatus,
        remark: values.remark ? String(values.remark) : undefined,
      };
      if (editing) {
        await updateTeacher(editing.id, payload);
        messageApi.success('已保存');
      } else {
        await createTeacher(payload);
        messageApi.success('已创建');
      }
      setModalOpen(false);
      setEditing(null);
      reloadAll();
      return true;
    } catch (e) {
      handleError(e);
      return false;
    }
  };

  return (
    <PageContainer
      title="师资档案"
      extra={[
        <Button key="reload" icon={<ReloadOutlined />} onClick={reloadAll}>
          刷新
        </Button>,
        <Button
          key="create"
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          新建师资
        </Button>,
      ]}
    >
      {/* 师资概览 */}
      <ProCard
        style={{ marginBottom: 16 }}
        bodyStyle={{ padding: '12px 0' }}
        split="vertical"
        bordered
      >
        <StatisticCard statistic={{ title: '师资总数', value: stats.total }} />
        <StatisticCard
          statistic={{
            title: '可用',
            value: stats.AVAILABLE,
            valueStyle: { color: STATUS_META.AVAILABLE.color },
          }}
        />
        <StatisticCard
          statistic={{
            title: '派遣中',
            value: stats.DISPATCHING,
            valueStyle: { color: STATUS_META.DISPATCHING.color },
          }}
        />
        <StatisticCard
          statistic={{
            title: '停用',
            value: stats.DISABLED,
            valueStyle: { color: STATUS_META.DISABLED.color },
          }}
        />
      </ProCard>

      <ProTable<Teacher>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={async (params) => {
          try {
            const keyword =
              (params.keyword as string | undefined) ?? (params.name as string | undefined);
            const status = params.status as TeacherStatus | undefined;
            const data = await listTeachers(keyword, status);
            return { data, success: true, total: data.length };
          } catch (e) {
            handleError(e);
            return { data: [], success: false, total: 0 };
          }
        }}
        pagination={{ pageSize: 10, showSizeChanger: false }}
        search={{ labelWidth: 'auto' }}
        dateFormatter="string"
        headerTitle="师资列表（租户内数据，跨租户不可见）"
        options={{ setting: { draggable: true, checkable: true } }}
        cardBordered
      />

      {/* 新建 / 编辑 */}
      <ModalForm<FormValues>
        key={editing?.id ?? 'create'}
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setEditing(null);
        }}
        title={editing ? `编辑师资：${editing.name}` : '新建师资'}
        width={560}
        modalProps={{ destroyOnClose: true, maskClosable: false }}
        initialValues={
          editing
            ? {
                name: editing.name,
                gender: editing.gender ?? undefined,
                phone: editing.phone ?? undefined,
                email: editing.email ?? undefined,
                subject: editing.subject ?? undefined,
                licenseNo: editing.licenseNo ?? undefined,
                certAttach: editing.certAttach ?? undefined,
                weeklyCap: editing.weeklyCap ?? undefined,
                status: editing.status,
                remark: editing.remark ?? undefined,
              }
            : { status: 'AVAILABLE' }
        }
        onFinish={onFinish}
        submitter={{
          searchConfig: { submitText: '保存', resetText: '取消' },
        }}
      >
        <ProFormText
          name="name"
          label="教师姓名"
          rules={[
            { required: true, message: '请输入教师姓名' },
            { max: 64, message: '最长 64 字' },
          ]}
          placeholder="如：张老师"
        />
        <ProFormSelect
          name="gender"
          label="性别"
          options={[
            { label: '男', value: '男' },
            { label: '女', value: '女' },
          ]}
          allowClear
          placeholder="选择性别"
        />
        <ProFormText name="phone" label="联系电话" placeholder="13800000000" />
        <ProFormText
          name="email"
          label="邮箱"
          rules={[{ type: 'email', message: '邮箱格式不正确' }]}
          placeholder="teacher@example.com"
        />
        <ProFormSelect
          name="subject"
          label="授课方向"
          options={SUBJECT_OPTIONS_MAP}
          allowClear
          fieldProps={{ showSearch: true, optionFilterProp: 'label' }}
          placeholder="选择或输入授课方向"
        />
        <ProFormText
          name="licenseNo"
          label="教资证号"
          rules={[{ max: 64, message: '最长 64 字' }]}
          placeholder="教师资格证编号"
        />
        <ProFormText name="certAttach" label="资质证书附件" hidden />
        <Form.Item
          label="资质证书附件"
          help="PDF / 图片 / Office 文档，≤20MB"
          extra="上传后存 core.file 文件服务，预览/下载走强制鉴权通道"
        >
          <Space direction="vertical">
            <Upload
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
              showUploadList={false}
              beforeUpload={(file) => {
                if (file.size > MAX_ATTACH_BYTES) {
                  messageApi.error('附件不能超过 20MB');
                  return Upload.LIST_IGNORE;
                }
                setPendingAttach(file);
                return false;
              }}
            >
              <Button icon={<UploadOutlined />}>
                {pendingAttach ? '已选择，重新选择' : editing?.certAttach ? '更换附件' : '上传附件'}
              </Button>
            </Upload>
            {(pendingAttach || (editing?.certAttach && !pendingAttach)) && (
              <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>
                {pendingAttach
                  ? `待上传：${pendingAttach.name}`
                  : existingAttachName
                    ? `已上传：${existingAttachName}`
                    : `已上传附件（fileId ${editing?.certAttach}）`}
              </div>
            )}
          </Space>
        </Form.Item>
        <ProFormText
          name="idCard"
          label={editing ? '身份证号（留空不修改）' : '身份证号'}
          rules={[{ pattern: /^\d{17}[\dXx]$/, message: '身份证号格式不正确（18 位）' }]}
          placeholder="仅写入，系统加密存储，不对外回显"
          extra={editing?.idCardMasked ? `当前：${editing.idCardMasked}` : undefined}
        />
        <ProFormText
          name="weeklyCap"
          label="每周可授课时数"
          rules={[
            { pattern: /^\d+$/, message: '请输入数字' },
            { type: 'number', min: 1, max: 168, message: '范围 1-168' },
          ]}
          placeholder="如：20"
          fieldProps={{ type: 'number', min: 1, max: 168 }}
        />
        <ProFormSelect
          name="status"
          label="合作状态"
          options={STATUS_OPTIONS}
          rules={[{ required: true, message: '请选择合作状态' }]}
        />
        <ProFormTextArea name="remark" label="备注" placeholder="教研方向 / 排期备注" />
      </ModalForm>
    </PageContainer>
  );
}
