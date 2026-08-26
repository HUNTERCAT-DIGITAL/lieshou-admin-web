/**
 * 路由懒加载的 Suspense fallback（Phase 9 · 包体积优化）.
 */
import { Spin } from 'antd';

export default function PageLoading() {
  return (
    <div style={styles.wrap}>
      <Spin size="large" />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    minHeight: 320,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
