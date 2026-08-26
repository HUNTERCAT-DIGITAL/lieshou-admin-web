import { useState } from 'react';
import { Alert, App, Button, Modal, Table, Typography, Upload, type UploadFile } from 'antd';
import { DownloadOutlined, InboxOutlined } from '@ant-design/icons';

import { downloadCsvTemplate } from '../utils/csv';

export interface ImportResult {
  total: number;
  success: number;
  failed: number;
  errors: { row: number; message: string }[];
}

interface ImportModalProps {
  open: boolean;
  title: string;
  /** 模板配置（表头 + 示例行） */
  template: { filename: string; header: string[]; sample: string[][] };
  /** 上传并导入（返回结果；抛错走 useApiError 展示） */
  onImport: (file: File) => Promise<ImportResult>;
  onClose: () => void;
}

/**
 * 通用 CSV 导入弹窗（Phase 9 · 数据导入工具）.
 *
 * - 下载模板（浏览器生成，无需后端）
 * - Upload 选择 CSV → 调 onImport → 展示结果（成功/失败 + 错误明细表）
 * - 失败行不阻断成功行（后端部分成功语义）
 */
export default function ImportModal({
  open,
  title,
  template,
  onImport,
  onClose,
}: ImportModalProps) {
  const { message } = App.useApp();
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const reset = () => {
    setResult(null);
    setFileList([]);
    setUploading(false);
  };

  const handleImport = async () => {
    const file = fileList[0]?.originFileObj as File | undefined;
    if (!file) {
      message.warning('请先选择 CSV 文件');
      return;
    }
    setUploading(true);
    try {
      const r = await onImport(file);
      setResult(r);
      if (r.failed === 0) {
        message.success(`导入成功 ${r.success} 条`);
      } else {
        message.warning(`导入完成：成功 ${r.success} 条，失败 ${r.failed} 条`);
      }
    } catch {
      // 错误已由 useApiError 统一提示
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal
      open={open}
      title={title}
      width={640}
      okText="开始导入"
      okButtonProps={{ loading: uploading, disabled: fileList.length === 0 }}
      onOk={() => void handleImport()}
      onCancel={() => {
        reset();
        onClose();
      }}
      destroyOnClose
    >
      <Button
        type="link"
        icon={<DownloadOutlined />}
        onClick={() => downloadCsvTemplate(template.filename, template.header, template.sample)}
        style={{ paddingLeft: 0, marginBottom: 8 }}
      >
        下载 CSV 模板
      </Button>
      <Upload.Dragger
        accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        maxCount={1}
        fileList={fileList}
        beforeUpload={(file) => {
          setFileList([file]);
          return false; // 不自动上传
        }}
        onRemove={() => {
          setFileList([]);
          setResult(null);
        }}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">点击或拖拽 CSV 文件到此处</p>
        <p className="ant-upload-hint">UTF-8 编码，首行为表头（参考模板）</p>
      </Upload.Dragger>

      {result && (
        <div style={{ marginTop: 16 }}>
          <Alert
            type={result.failed === 0 ? 'success' : 'warning'}
            showIcon
            message={`共 ${result.total} 行：成功 ${result.success} 条，失败 ${result.failed} 条`}
          />
          {result.failed > 0 && (
            <Table
              size="small"
              style={{ marginTop: 8 }}
              rowKey="row"
              pagination={false}
              dataSource={result.errors}
              columns={[
                { title: '行号', dataIndex: 'row', width: 80 },
                { title: '失败原因', dataIndex: 'message' },
              ]}
            />
          )}
        </div>
      )}
      <Typography.Text type="secondary" style={{ display: 'block', marginTop: 12, fontSize: 12 }}>
        字段说明见模板表头；非法行跳过并展示原因，不影响其他行导入。
      </Typography.Text>
    </Modal>
  );
}
