/**
 * 法律行业版门户（layer · ADR-0035）.
 *
 * 页面结构：Nav → Hero → 数据统计 → 办案全流程时间线 → 律所能力卡 → 服务对象
 *          → FAQ → CTA → Footer。
 * 文案/品牌/数据来自 EditionConfig，结构为本行业版独有。
 */

import { SolutionOutlined, TeamOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Button, Card, Col, Row, Steps, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

import { getEdition } from '../../config/editions';
import {
  FadeIn,
  FeatureCard,
  PortalCta,
  PortalFaq,
  PortalFooter,
  PortalHero,
  PortalNav,
  PortalStats,
  SectionHeader,
} from './PortalShell';

const { Text } = Typography;

/** 办案全流程（时间线 · 法律版独有结构） */
const CASE_FLOW = [
  { title: '线索获取', desc: '官网 / 转介绍 / 公海线索统一归集' },
  { title: '委托受理', desc: '利益冲突审查、风险告知、委托合同' },
  { title: '立案承办', desc: '指派承办人/协办人，卷宗电子化归档' },
  { title: '结案归档', desc: '结案文书、卷宗归档、计费结算' },
];

const NAV_MENU = [
  { key: 'case-flow', label: '办案流程' },
  { key: 'capability', label: '核心能力' },
  { key: 'industries', label: '服务对象' },
];

export default function LegalPortal() {
  const navigate = useNavigate();
  const edition = getEdition();

  // 版别开放自助开通（issue #24）→ 直达 /register；否则回退登录页注册 Modal
  const onRegister = () => navigate(edition.allowRegister ? '/register' : '/login?register=1');

  return (
    <div style={styles.page} id="top">
      <PortalNav edition={edition} menu={NAV_MENU} onLogin={() => navigate('/login')} />
      <PortalHero edition={edition} onLogin={() => navigate('/login')} onRegister={onRegister} />
      <PortalStats stats={edition.stats} primaryColor={edition.primaryColor} />

      {/* ===== 办案全流程（时间线） ===== */}
      <div style={styles.section} id="case-flow">
        <FadeIn>
          <SectionHeader
            eyebrow="CASE WORKFLOW"
            title="办案全流程数字化"
            desc="从线索到结案，每个环节责任清晰、留痕可溯"
          />
        </FadeIn>
        <Steps
          style={{ marginTop: 40, maxWidth: 900, marginLeft: 'auto', marginRight: 'auto' }}
          items={CASE_FLOW.map((s) => ({ title: s.title, description: s.desc }))}
          responsive
        />
      </div>

      {/* ===== 律所能力 ===== */}
      <div style={{ ...styles.section, background: '#f9f0ff' }} id="capability">
        <FadeIn>
          <SectionHeader
            eyebrow="CAPABILITIES"
            title="律所核心能力"
            desc="围绕律师办案与律所经营的关键能力"
          />
        </FadeIn>
        <Row gutter={[24, 24]} style={{ marginTop: 32 }}>
          {edition.features.map((f, i) => (
            <Col xs={24} md={12} lg={6} key={f.title}>
              <FadeIn delay={i * 100}>
                <FeatureCard feature={f} primaryColor={edition.primaryColor} />
              </FadeIn>
            </Col>
          ))}
        </Row>
      </div>

      {/* ===== 服务对象 ===== */}
      <div style={styles.section} id="industries">
        <FadeIn>
          <SectionHeader eyebrow="WHO IT SERVES" title="服务对象" />
        </FadeIn>
        <Row gutter={[16, 16]} style={{ marginTop: 32 }} justify="center">
          {edition.industries.map((ind, i) => (
            <Col key={ind}>
              <FadeIn delay={i * 60}>
                <Card style={{ minWidth: 160, textAlign: 'center' }}>
                  <Text strong>{ind}</Text>
                </Card>
              </FadeIn>
            </Col>
          ))}
        </Row>
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <Button
            size="large"
            type="primary"
            icon={<ThunderboltOutlined />}
            style={{ background: edition.primaryColor, borderColor: edition.primaryColor }}
            onClick={() => navigate('/login')}
          >
            进入法律版
          </Button>
          <Text type="secondary" style={{ display: 'block', marginTop: 12 }}>
            <TeamOutlined /> 平台底座：多租户隔离 · 审批留痕 · 审计日志 · 数据安全
          </Text>
          <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
            <SolutionOutlined /> 案件 / 卷宗 / 计时计费模块持续迭代中
          </Text>
        </div>
      </div>

      {/* ===== FAQ ===== */}
      <div style={{ ...styles.section, background: '#f5f5f5' }} id="faq">
        <FadeIn>
          <SectionHeader eyebrow="FAQ" title="常见问题" />
        </FadeIn>
        <div style={{ maxWidth: 720, margin: '24px auto 0' }}>
          <FadeIn>
            <PortalFaq items={edition.faq} />
          </FadeIn>
        </div>
      </div>

      {/* ===== CTA ===== */}
      <PortalCta
        cta={edition.cta}
        primaryColor={edition.primaryColor}
        onAction={() => navigate('/login')}
      />

      <PortalFooter brandName={edition.companyName ?? edition.brandName} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#fff' },
  section: { padding: '64px 24px', maxWidth: 1080, margin: '0 auto' },
};
