/**
 * 精密制造版门户（jmzz · ADR-0035）.
 *
 * 页面结构：Nav → Hero → 数据统计 → 车间生产链路（横向 5 步）→ 制造能力卡
 *          → 覆盖行业 → FAQ → CTA → Footer。
 * 文案/品牌/数据来自 EditionConfig，结构为本行业版独有。
 */

import {
  CheckCircleOutlined,
  ExportOutlined,
  ImportOutlined,
  SettingOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
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

/** 车间生产链路（横向 Steps · 制造版独有结构） */
const SHOP_FLOOR_FLOW = [
  { icon: <ShoppingOutlined />, title: '采购', desc: '供应商 / 采购单 / 到货' },
  { icon: <ImportOutlined />, title: '入库', desc: '来料检验 / 扫码入库' },
  { icon: <SettingOutlined />, title: '生产', desc: '领料 / 报工 / 工序流转' },
  { icon: <CheckCircleOutlined />, title: '质检', desc: '制程 / 成品检验' },
  { icon: <ExportOutlined />, title: '出库', desc: '发货 / 批次追溯' },
];

const NAV_MENU = [
  { key: 'shop-flow', label: '生产链路' },
  { key: 'capability', label: '核心能力' },
  { key: 'industries', label: '覆盖行业' },
];

export default function MfgPortal() {
  const navigate = useNavigate();
  const edition = getEdition();

  // 版别开放自助开通（issue #24）→ 直达 /register；否则回退登录页注册 Modal
  const onRegister = () => navigate(edition.allowRegister ? '/register' : '/login?register=1');

  return (
    <div style={styles.page} id="top">
      <PortalNav edition={edition} menu={NAV_MENU} onLogin={() => navigate('/login')} />
      <PortalHero edition={edition} onLogin={() => navigate('/login')} onRegister={onRegister} />
      <PortalStats stats={edition.stats} primaryColor={edition.primaryColor} />

      {/* ===== 车间生产链路 ===== */}
      <div style={styles.section} id="shop-flow">
        <FadeIn>
          <SectionHeader
            eyebrow="SHOP FLOOR"
            title="车间生产全链路在线"
            desc="采购 → 入库 → 生产 → 质检 → 出库，批次可追溯"
          />
        </FadeIn>
        <Steps
          style={{ marginTop: 40, maxWidth: 1000, marginLeft: 'auto', marginRight: 'auto' }}
          items={SHOP_FLOOR_FLOW.map((s) => ({
            title: s.title,
            description: s.desc,
            icon: s.icon,
          }))}
          responsive
        />
      </div>

      {/* ===== 制造能力 ===== */}
      <div style={{ ...styles.section, background: '#fff7e6' }} id="capability">
        <FadeIn>
          <SectionHeader
            eyebrow="CAPABILITIES"
            title="制造版核心能力"
            desc="围绕物料、库存、生产、质检的车间能力"
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

      {/* ===== 覆盖行业 ===== */}
      <div style={styles.section} id="industries">
        <FadeIn>
          <SectionHeader eyebrow="INDUSTRIES" title="覆盖行业" />
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
            进入制造版
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
