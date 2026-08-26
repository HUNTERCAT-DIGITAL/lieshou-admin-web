/**
 * ErrorBoundary - 全局错误边界（Phase 9 · P0 体验硬伤）.
 *
 * 页面渲染 / 生命周期异常时兜底展示，避免白屏；提供「刷新」「返回工作台」。
 * App 层与 BasicLayout 内容层各挂一层：布局崩溃由 App 层兜，页面崩溃保住菜单。
 */
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button, Result } from 'antd';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info);
  }

  private reset = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    if (error) {
      return (
        <Result
          status="500"
          title="页面出错了"
          subTitle={error.message || '发生未知错误，请刷新重试'}
          extra={[
            <Button key="reload" type="primary" onClick={() => window.location.reload()}>
              刷新页面
            </Button>,
            <Button
              key="home"
              onClick={() => {
                this.reset();
                window.location.href = '/welcome';
              }}
            >
              返回工作台
            </Button>,
          ]}
        />
      );
    }
    return this.props.children;
  }
}
