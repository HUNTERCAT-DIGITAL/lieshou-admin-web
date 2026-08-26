/**
 * 404 页（Phase 9 · P0 体验硬伤）.
 */
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <Result
      status="404"
      title="404"
      subTitle="页面不存在或已被移除。"
      extra={[
        <Button key="home" type="primary" onClick={() => navigate('/welcome')}>
          回到工作台
        </Button>,
        <Button key="back" onClick={() => navigate(-1)}>
          返回上一页
        </Button>,
      ]}
    />
  );
}
