/**
 * 通用门户（generic · LieShouCloud 开源版默认门户）.
 *
 * 结构：Nav → Hero → 数据统计 → 平台核心能力 → 平台流程（成交→开租户→使用→增长）
 *      → 覆盖行业 → 行业版入口导航 → FAQ → CTA → 关于我们 → Footer。
 * 文案/品牌/数据来自 EditionConfig（generic 版），结构为本版别独有。
 */

import { LinkOutlined } from '@ant-design/icons';
import { Button, Card, Col, Row, Steps, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

import { getEdition, INDUSTRY_ENTRIES } from '../../config/editions';
import { useAuthStore } from '../../stores/auth';
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

const { Paragraph, Text } = Typography;

/** 平台流程（通用版独有结构 · 开源演示定位） */
const PLATFORM_FLOW = [
  { title: '一键部署', desc: 'docker compose 一键拉起全栈，前后端代码全部开源（Apache-2.0）' },
  { title: '一键开租户', desc: '平台管理员开通租户，分配管理员，当天可上线' },
  { title: '团队使用', desc: '客户管理员邀请成员，按角色使用审批流 / 审计 / 用户中心等开源模块' },
  { title: '数据增长', desc: '业务数据持续沉淀，看板驱动经营决策，规模可复制' },
];

const NAV_MENU = [
  { key: 'capability', label: '核心能力' },
  { key: 'platform-flow', label: '平台流程' },
  { key: 'industries', label: '覆盖行业' },
  { key: 'editions', label: '行业版' },
  { key: 'about', label: '关于我们' },
];

export default function GenericPortal() {
  const navigate = useNavigate();
  const edition = getEdition();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // 版别开放自助开通（issue #24）→ 直达 /register；否则回退登录页注册 Modal
  const onRegister = () => {
    navigate(
      isAuthenticated ? '/welcome' : edition.allowRegister ? '/register' : '/login?register=1',
    );
  };

  return (
    <div style={styles.page} id="top">
      <PortalNav
        edition={edition}
        menu={NAV_MENU}
        onLogin={() => navigate('/login')}
        onRegister={onRegister}
      />
      <PortalHero edition={edition} onLogin={() => navigate('/login')} onRegister={onRegister} />
      <PortalStats stats={edition.stats} primaryColor={edition.primaryColor} />

      {/* ===== 平台核心能力 ===== */}
      <div style={styles.section} id="capability">
        <FadeIn>
          <SectionHeader
            eyebrow="CORE CAPABILITIES"
            title="平台核心能力"
            desc="一套底座，支撑所有客户与行业版"
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

      {/* ===== 平台流程（成交 → 开租户 → 使用 → 增长） ===== */}
      <div style={{ ...styles.section, background: '#f5f5f5' }} id="platform-flow">
        <FadeIn>
          <SectionHeader eyebrow="HOW IT WORKS" title="平台流程" desc="从成交到增长，四步跑通" />
        </FadeIn>
        <Steps
          style={{ marginTop: 40, maxWidth: 960, marginLeft: 'auto', marginRight: 'auto' }}
          items={PLATFORM_FLOW.map((s) => ({ title: s.title, description: s.desc }))}
          responsive
        />
      </div>

      {/* ===== 覆盖行业 ===== */}
      <div style={styles.section} id="industries">
        <FadeIn>
          <SectionHeader eyebrow="INDUSTRIES" title="覆盖行业" desc="行业专属配置，同一平台底座" />
        </FadeIn>
        <Row gutter={[16, 16]} style={{ marginTop: 32 }} justify="center">
          {edition.industriesText.map((ind, i) => (
            <Col key={ind}>
              <FadeIn delay={i * 60}>
                <Card style={{ minWidth: 160, textAlign: 'center' }}>
                  <Text strong>{ind}</Text>
                </Card>
              </FadeIn>
            </Col>
          ))}
        </Row>
      </div>

      {/* ===== 行业版入口导航（ADR-0035 · 行业版门户） ===== */}
      {(
      <div style={{ ...styles.section, background: '#f0f5ff' }} id="editions">
        <FadeIn>
          <SectionHeader
            eyebrow="EDITION PORTALS"
            title="行业版入口"
            desc="同一平台底座，行业专属门户与业务模块"
          />
        </FadeIn>
        <Row gutter={[24, 24]} style={{ marginTop: 32 }}>
          {INDUSTRY_ENTRIES.map((e, i) => (
            <Col xs={24} md={8} key={e.edition}>
              <FadeIn delay={i * 120}>
                <Card hoverable onClick={() => window.open(e.href, '_blank', 'noopener')}>
                  <Text strong style={{ fontSize: 16 }}>
                    {e.name}
                  </Text>
                  <Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>
                    {e.desc}
                  </Paragraph>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    访问 {new URL(e.href).hostname}
                  </Text>
                </Card>
              </FadeIn>
            </Col>
          ))}
        </Row>
      </div>

      )}
      {/* ===== FAQ ===== */}
      <div style={styles.section} id="faq">
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
      <PortalCta cta={edition.cta} primaryColor={edition.primaryColor} onAction={onRegister} />

      {/* ===== 关于我们（dwjk 不展示公司/商业信息） ===== */}
      {(
      <div style={styles.section} id="about">
        <FadeIn>
          <SectionHeader eyebrow="ABOUT US" title="关于我们" />
        </FadeIn>
          <Paragraph style={{ maxWidth: 720, margin: '16px auto 0', textAlign: 'center' }}>
            LieShouCloud（猎手云）是开源的数字化平台演示项目：Java 21 + Spring Cloud 全栈后端、
            React 19 前端、四端覆盖（Web / 桌面 / 移动 / 小程序），代码全部开源（Apache-2.0），
            支持一键自部署体验多租户 SaaS、CRM、进销存、财务等完整模块。
            本站为开源版演示环境，欢迎体验。
          </Paragraph>
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Button size="large" onClick={onRegister}>
            立即体验 <LinkOutlined />
          </Button>
        </div>
      </div>

      )}
      <PortalFooter />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#fff' },
  section: { padding: '64px 24px', maxWidth: 1080, margin: '0 auto' },
};
