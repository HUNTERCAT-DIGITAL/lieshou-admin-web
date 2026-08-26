/**
 * 403 页（Phase 9 · P0 体验硬伤）.
 */
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function Forbidden() {
  const navigate = useNavigate();
  return (
    <Result
      status="403"
      title="403"
      subTitle="抱歉，你没有权限访问该页面。"
      extra={[
        <Button key="back" onClick={() => navigate(-1)}>
          返回上一页
        </Button>,
        <Button key="home" type="primary" onClick={() => navigate('/welcome')}>
          回到工作台
        </Button>,
      ]}
    />
  );
}
