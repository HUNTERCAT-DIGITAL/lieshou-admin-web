/**
 * 教育行业版门户（zhiye · ADR-0035 · 深圳市智野教育科技有限公司）.
 *
 * 页面结构：Nav → Hero → 数据统计 → 供应链协同三步（上游供应/伙伴协同/供应结算）→ 供应能力卡
 *          → 覆盖业态 → FAQ → CTA → Footer。
 * 文案/品牌/数据来自 EditionConfig，结构为本行业版独有。
 */

import { AccountBookOutlined, ShopOutlined, TeamOutlined } from '@ant-design/icons';
import { Button, Card, Col, Row, Typography } from 'antd';
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

const { Title, Paragraph, Text } = Typography;

/** 供应链协同三步（教育版独有结构 · B2B2C：上游供应 → 伙伴协同 → 供应结算） */
const SCENARIOS = [
  {
    icon: <TeamOutlined />,
    step: '01 上游供应',
    title: '师资与课程',
    desc: '师资档案、资质证书、课时包标准化，向合作伙伴稳定输出供应能力。',
  },
  {
    icon: <ShopOutlined />,
    step: '02 伙伴协同',
    title: '资质与共建',
    desc: '合作机构资质准入、办学许可存档；伙伴在各自工作区完成招生、教学与收费。',
  },
  {
    icon: <AccountBookOutlined />,
    step: '03 供应结算',
    title: '对账有数据',
    desc: '课程采购、师资派遣、课时消耗全程留痕，按合作周期自动对账、数据可溯。',
  },
];

const NAV_MENU = [
  { key: 'scenario', label: '供应链协同' },
  { key: 'capability', label: '核心能力' },
  { key: 'industries', label: '覆盖业态' },
];

export default function EduPortal() {
  const navigate = useNavigate();
  const edition = getEdition();

  // 版别开放自助开通（issue #24）→ 直达 /register；否则回退登录页注册 Modal
  const onRegister = () => navigate(edition.allowRegister ? '/register' : '/login?register=1');

  return (
    <div style={styles.page} id="top">
      <PortalNav edition={edition} menu={NAV_MENU} onLogin={() => navigate('/login')} />
      <PortalHero edition={edition} onLogin={() => navigate('/login')} onRegister={onRegister} />
      <PortalStats stats={edition.stats} primaryColor={edition.primaryColor} />

      {/* ===== 供应链协同三步 ===== */}
      <div style={styles.section} id="scenario">
        <FadeIn>
          <SectionHeader
            eyebrow="SUPPLY CHAIN"
            title="供应链协同三步"
            desc="上游供应 → 伙伴协同 → 供应结算，全链路数据打通"
          />
        </FadeIn>
        <Row gutter={[24, 24]} style={{ marginTop: 40 }}>
          {SCENARIOS.map((s, i) => (
            <Col xs={24} md={8} key={s.step}>
              <FadeIn delay={i * 120}>
                <Card style={{ height: '100%' }}>
                  <div style={{ fontSize: 40, color: edition.primaryColor, marginBottom: 8 }}>
                    {s.icon}
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {s.step}
                  </Text>
                  <Title level={4} style={{ marginTop: 4 }}>
                    {s.title}
                  </Title>
                  <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                    {s.desc}
                  </Paragraph>
                </Card>
              </FadeIn>
            </Col>
          ))}
        </Row>
      </div>

      {/* ===== 教育能力 ===== */}
      <div style={{ ...styles.section, background: '#e6fffb' }} id="capability">
        <FadeIn>
          <SectionHeader
            eyebrow="CAPABILITIES"
            title="智野教育核心能力"
            desc="围绕师资、课程、伙伴协同的供应侧能力"
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

      {/* ===== 覆盖业态 ===== */}
      <div style={styles.section} id="industries">
        <FadeIn>
          <SectionHeader eyebrow="SEGMENTS" title="覆盖业态" />
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
            style={{ background: edition.primaryColor, borderColor: edition.primaryColor }}
            onClick={() => navigate('/login')}
          >
            进入智野教育
          </Button>
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

      <PortalFooter />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#fff' },
  section: { padding: '64px 24px', maxWidth: 1080, margin: '0 auto' },
};
