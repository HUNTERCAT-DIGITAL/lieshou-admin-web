/**
 * 全局错误边界（2026-09-01 · 友好化页面崩溃）.
 *
 * 常见场景：后台发布新版本后，客户停留在旧页面，懒加载新 chunk 404
 * （Failed to fetch dynamically imported module）→ 默认英文崩溃页不友好。
 *
 * 本边界捕获后：
 * - 识别「模块加载失败/chunk 404」→ 提示“系统已更新，刷新即可恢复” + 刷新按钮
 * - 其他渲染错误 → 中文提示 + 刷新按钮（可复制错误信息）
 */
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button, Result, Typography } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

const CHUNK_PATTERNS = [
  /Failed to fetch dynamically imported module/i,
  /Importing a module script failed/i,
  /Loading chunk .* failed/i,
  /dynamically imported module/i,
  /error loading dynamically imported module/i,
];

function isChunkError(message: string): boolean {
  return CHUNK_PATTERNS.some((re) => re.test(message));
}

export default class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // 上报/留痕（生产可接监控）
    console.error('[AppErrorBoundary]', error, info.componentStack);
  }

  private reload = () => {
    // 清理：先复位状态，再整页刷新（重新拉取最新资源）
    this.setState({ error: null }, () => window.location.reload());
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const chunk = isChunkError(error.message || '');
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f5f5f5',
          padding: 24,
        }}
      >
        <Result
          status="warning"
          title={chunk ? '系统已更新，请刷新页面' : '页面加载失败'}
          subTitle={
            chunk
              ? '检测到系统刚刚完成了一次更新（页面资源已替换）。点击下方按钮刷新后即可继续使用，您的数据不会丢失。'
              : '页面出现了一点问题，刷新后一般可恢复正常。'
          }
          extra={[
            <Button key="reload" type="primary" icon={<ReloadOutlined />} onClick={this.reload}>
              刷新页面
            </Button>,
            <Button key="home" onClick={() => (window.location.href = '/home')}>
              回到首页
            </Button>,
          ]}
        >
          {!chunk && (
            <Typography.Paragraph
              type="secondary"
              style={{ fontSize: 12, maxWidth: 480, margin: '0 auto' }}
              copyable={{ tooltips: ['复制错误信息', '已复制'] }}
            >
              {error.message}
            </Typography.Paragraph>
          )}
        </Result>
      </div>
    );
  }
}
