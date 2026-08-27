"use strict";
/**
 * 通用门户（generic · LieShouCloud 开源版默认门户）.
 *
 * 结构：Nav → Hero → 数据统计 → 平台核心能力 → 平台流程（成交→开租户→使用→增长）
 *      → 覆盖行业 → 行业版入口导航 → FAQ → CTA → 关于我们 → Footer。
 * 文案/品牌/数据来自 EditionConfig（generic 版），结构为本版别独有。
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GenericPortal;
var icons_1 = require("@ant-design/icons");
var antd_1 = require("antd");
var react_router_dom_1 = require("react-router-dom");
var editions_1 = require("../../config/editions");
var auth_1 = require("../../stores/auth");
var PortalShell_1 = require("./PortalShell");
var Paragraph = antd_1.Typography.Paragraph, Text = antd_1.Typography.Text;
/** 平台流程（通用版独有结构 · 开源演示定位） */
var PLATFORM_FLOW = [
    { title: '一键部署', desc: 'docker compose 一键拉起全栈，前后端代码全部开源（Apache-2.0）' },
    { title: '一键开租户', desc: '平台管理员开通租户，分配管理员，当天可上线' },
    { title: '团队使用', desc: '客户管理员邀请成员，按角色使用审批流 / 审计 / 用户中心等开源模块' },
    { title: '数据增长', desc: '业务数据持续沉淀，看板驱动经营决策，规模可复制' },
];
var NAV_MENU = [
    { key: 'capability', label: '核心能力' },
    { key: 'platform-flow', label: '平台流程' },
    { key: 'industries', label: '覆盖行业' },
    { key: 'editions', label: '行业版' },
    { key: 'about', label: '关于我们' },
];
function GenericPortal() {
    var navigate = (0, react_router_dom_1.useNavigate)();
    var edition = (0, editions_1.getEdition)();
    var isAuthenticated = (0, auth_1.useAuthStore)(function (s) { return s.isAuthenticated; });
    // 版别开放自助开通（issue #24）→ 直达 /register；否则回退登录页注册 Modal
    var onRegister = function () {
        navigate(isAuthenticated ? '/welcome' : edition.allowRegister ? '/register' : '/login?register=1');
    };
    return (<div style={styles.page} id="top">
      <PortalShell_1.PortalNav edition={edition} menu={NAV_MENU} onLogin={function () { return navigate('/login'); }} onRegister={onRegister}/>
      <PortalShell_1.PortalHero edition={edition} onLogin={function () { return navigate('/login'); }} onRegister={onRegister}/>
      <PortalShell_1.PortalStats stats={edition.stats} primaryColor={edition.primaryColor}/>

      {/* ===== 平台核心能力 ===== */}
      <div style={styles.section} id="capability">
        <PortalShell_1.FadeIn>
          <PortalShell_1.SectionHeader eyebrow="CORE CAPABILITIES" title="平台核心能力" desc="一套底座，支撑所有客户与行业版"/>
        </PortalShell_1.FadeIn>
        <antd_1.Row gutter={[24, 24]} style={{ marginTop: 32 }}>
          {edition.features.map(function (f, i) { return (<antd_1.Col xs={24} md={12} lg={6} key={f.title}>
              <PortalShell_1.FadeIn delay={i * 100}>
                <PortalShell_1.FeatureCard feature={f} primaryColor={edition.primaryColor}/>
              </PortalShell_1.FadeIn>
            </antd_1.Col>); })}
        </antd_1.Row>
      </div>

      {/* ===== 平台流程（成交 → 开租户 → 使用 → 增长） ===== */}
      <div style={__assign(__assign({}, styles.section), { background: '#f5f5f5' })} id="platform-flow">
        <PortalShell_1.FadeIn>
          <PortalShell_1.SectionHeader eyebrow="HOW IT WORKS" title="平台流程" desc="从成交到增长，四步跑通"/>
        </PortalShell_1.FadeIn>
        <antd_1.Steps style={{ marginTop: 40, maxWidth: 960, marginLeft: 'auto', marginRight: 'auto' }} items={PLATFORM_FLOW.map(function (s) { return ({ title: s.title, description: s.desc }); })} responsive/>
      </div>

      {/* ===== 覆盖行业 ===== */}
      <div style={styles.section} id="industries">
        <PortalShell_1.FadeIn>
          <PortalShell_1.SectionHeader eyebrow="INDUSTRIES" title="覆盖行业" desc="行业专属配置，同一平台底座"/>
        </PortalShell_1.FadeIn>
        <antd_1.Row gutter={[16, 16]} style={{ marginTop: 32 }} justify="center">
          {edition.industriesText.map(function (ind, i) { return (<antd_1.Col key={ind}>
              <PortalShell_1.FadeIn delay={i * 60}>
                <antd_1.Card style={{ minWidth: 160, textAlign: 'center' }}>
                  <Text strong>{ind}</Text>
                </antd_1.Card>
              </PortalShell_1.FadeIn>
            </antd_1.Col>); })}
        </antd_1.Row>
      </div>

      {/* ===== 行业版入口导航（ADR-0035 · 行业版门户） ===== */}
      {(<div style={__assign(__assign({}, styles.section), { background: '#f0f5ff' })} id="editions">
        <PortalShell_1.FadeIn>
          <PortalShell_1.SectionHeader eyebrow="EDITION PORTALS" title="行业版入口" desc="同一平台底座，行业专属门户与业务模块"/>
        </PortalShell_1.FadeIn>
        <antd_1.Row gutter={[24, 24]} style={{ marginTop: 32 }}>
          {editions_1.INDUSTRY_ENTRIES.map(function (e, i) { return (<antd_1.Col xs={24} md={8} key={e.edition}>
              <PortalShell_1.FadeIn delay={i * 120}>
                <antd_1.Card hoverable onClick={function () { return window.open(e.href, '_blank', 'noopener'); }}>
                  <Text strong style={{ fontSize: 16 }}>
                    {e.name}
                  </Text>
                  <Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>
                    {e.desc}
                  </Paragraph>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    访问 {new URL(e.href).hostname}
                  </Text>
                </antd_1.Card>
              </PortalShell_1.FadeIn>
            </antd_1.Col>); })}
        </antd_1.Row>
      </div>)}
      {/* ===== FAQ ===== */}
      <div style={styles.section} id="faq">
        <PortalShell_1.FadeIn>
          <PortalShell_1.SectionHeader eyebrow="FAQ" title="常见问题"/>
        </PortalShell_1.FadeIn>
        <div style={{ maxWidth: 720, margin: '24px auto 0' }}>
          <PortalShell_1.FadeIn>
            <PortalShell_1.PortalFaq items={edition.faq}/>
          </PortalShell_1.FadeIn>
        </div>
      </div>

      {/* ===== CTA ===== */}
      <PortalShell_1.PortalCta cta={edition.cta} primaryColor={edition.primaryColor} onAction={onRegister}/>

      {/* ===== 关于我们（dwjk 不展示公司/商业信息） ===== */}
      {(<div style={styles.section} id="about">
        <PortalShell_1.FadeIn>
          <PortalShell_1.SectionHeader eyebrow="ABOUT US" title="关于我们"/>
        </PortalShell_1.FadeIn>
          <Paragraph style={{ maxWidth: 720, margin: '16px auto 0', textAlign: 'center' }}>
            LieShouCloud（猎手云）是开源的数字化平台演示项目：Java 21 + Spring Cloud 全栈后端、
            React 19 前端、四端覆盖（Web / 桌面 / 移动 / 小程序），代码全部开源（Apache-2.0），
            支持一键自部署体验多租户 SaaS、CRM、进销存、财务等完整模块。
            本站为开源版演示环境，欢迎体验。
          </Paragraph>
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <antd_1.Button size="large" onClick={onRegister}>
            立即体验 <icons_1.LinkOutlined />
          </antd_1.Button>
        </div>
      </div>)}
      <PortalShell_1.PortalFooter />
    </div>);
}
var styles = {
    page: { minHeight: '100vh', background: '#fff' },
    section: { padding: '64px 24px', maxWidth: 1080, margin: '0 auto' },
};
