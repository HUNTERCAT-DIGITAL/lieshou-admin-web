"use strict";
/**
 * 门户共享组件库（ADR-0035 · 行业版门户）.
 *
 * Hero / Footer 之外新增一套通用区块组件，四个版别门户共用：
 *  - PortalNav（吸顶导航） / FadeIn（滚动淡入） / SectionHeader（区块标题）
 *  - PortalStats（数据统计条） / FeatureCard（能力卡） / PortalFaq（FAQ 折叠） / PortalCta（CTA 横幅）
 * 品牌 / 文案 / 主色 / 数据全部来自 EditionConfig——「客户差异进配置层，禁止 fork 仓库」。
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
exports.PortalHero = PortalHero;
exports.PortalFooter = PortalFooter;
exports.PortalNav = PortalNav;
exports.FadeIn = FadeIn;
exports.SectionHeader = SectionHeader;
exports.PortalStats = PortalStats;
exports.FeatureCard = FeatureCard;
exports.PortalFaq = PortalFaq;
exports.PortalCta = PortalCta;
var icons_1 = require("@ant-design/icons");
var antd_1 = require("antd");
var react_1 = require("react");
var BeianFooter_1 = require("../../components/BeianFooter");
var Title = antd_1.Typography.Title, Paragraph = antd_1.Typography.Paragraph, Text = antd_1.Typography.Text;
/** 门户 Hero：品牌 + 口号 + CTA（登录 / 可选注册） */
function PortalHero(_a) {
    var edition = _a.edition, onLogin = _a.onLogin, onRegister = _a.onRegister;
    return (<div style={heroStyle(edition.primaryColor)}>
      <antd_1.Space direction="vertical" size="middle" align="center">
        <div style={styles.brand}>
          <img src={edition.logo} alt={edition.brandName} style={styles.logo}/>
          <span style={styles.brandText}>{edition.brandName}</span>
        </div>
        <Title style={{ margin: 0, color: '#fff', textAlign: 'center' }}>{edition.slogan}</Title>
        <Paragraph style={{
            color: 'rgba(255,255,255,0.85)',
            fontSize: 16,
            maxWidth: 640,
            textAlign: 'center',
            margin: 0,
        }}>
          {edition.heroDesc}
        </Paragraph>
        <antd_1.Space size="middle">
          {onRegister && edition.allowRegister && (<antd_1.Button type="primary" size="large" style={styles.heroBtn} onClick={onRegister}>
              免费注册体验 <icons_1.ArrowRightOutlined />
            </antd_1.Button>)}
          <antd_1.Button size="large" style={{
            background: 'rgba(255,255,255,0.15)',
            color: '#fff',
            borderColor: 'rgba(255,255,255,0.4)',
        }} onClick={onLogin}>
            已有账号登录
          </antd_1.Button>
        </antd_1.Space>
      </antd_1.Space>
    </div>);
}
/** 门户页脚：dwjk 等专属版只显示平台品牌（隐藏公司主体与产品线名） */
function PortalFooter(_a) {
    var brandName = _a.brandName;
    return (<div style={styles.footer}>
      <antd_1.Typography.Text style={{ color: 'rgba(255,255,255,0.65)' }}>
        {brandName ? "\u00A9 2026 ".concat(brandName) : '© 2026 LieShouCloud 开源版 · Apache-2.0'}
      </antd_1.Typography.Text>
      <div style={{ marginTop: 8 }}>
        <BeianFooter_1.BeianFooter dark/>
      </div>
    </div>);
}
/** 吸顶导航：sticky 不遮挡 Hero，滚动过顶后吸附 */
function PortalNav(_a) {
    var edition = _a.edition, menu = _a.menu, onLogin = _a.onLogin, onRegister = _a.onRegister;
    return (<div style={styles.nav}>
      <a href="#top" style={styles.navBrand}>
        <img src={edition.logo} alt={edition.brandName} style={styles.navLogo}/>
        <span style={{ fontSize: 16, fontWeight: 600, color: 'rgba(0,0,0,0.88)' }}>
          {edition.brandName}
        </span>
      </a>
      <div style={styles.navMenu}>
        {menu.map(function (m) { return (<a key={m.key} href={"#".concat(m.key)} style={styles.navLink}>
            {m.label}
          </a>); })}
      </div>
      <antd_1.Space size="small">
        {onRegister && edition.allowRegister && (<antd_1.Button type="primary" ghost size="small" onClick={onRegister}>
            免费注册
          </antd_1.Button>)}
        <antd_1.Button type="primary" size="small" style={{ background: edition.primaryColor, borderColor: edition.primaryColor }} onClick={onLogin}>
          登录
        </antd_1.Button>
      </antd_1.Space>
    </div>);
}
/** 进入视口淡入上滑；无 IntersectionObserver 环境（jsdom）直接显示 */
function FadeIn(_a) {
    var children = _a.children, _b = _a.delay, delay = _b === void 0 ? 0 : _b, style = _a.style;
    var ref = (0, react_1.useRef)(null);
    var _c = (0, react_1.useState)(false), visible = _c[0], setVisible = _c[1];
    (0, react_1.useEffect)(function () {
        var el = ref.current;
        if (!el)
            return;
        if (typeof IntersectionObserver === 'undefined') {
            setVisible(true);
            return;
        }
        var obs = new IntersectionObserver(function (entries) {
            for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
                var entry = entries_1[_i];
                if (entry.isIntersecting) {
                    setVisible(true);
                    obs.disconnect();
                }
            }
        }, { threshold: 0.12 });
        obs.observe(el);
        return function () { return obs.disconnect(); };
    }, []);
    return (<div ref={ref} style={__assign({ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(24px)', transition: "opacity 0.6s ease ".concat(delay, "ms, transform 0.6s ease ").concat(delay, "ms") }, style)}>
      {children}
    </div>);
}
function SectionHeader(_a) {
    var eyebrow = _a.eyebrow, title = _a.title, desc = _a.desc;
    return (<div style={{ textAlign: 'center' }}>
      {eyebrow && (<Text type="secondary" style={{ letterSpacing: 2, fontSize: 13 }}>
          {eyebrow}
        </Text>)}
      <Title level={2} style={{ marginTop: eyebrow ? 8 : 0, marginBottom: desc ? 8 : 0 }}>
        {title}
      </Title>
      {desc && (<Paragraph type="secondary" style={{ marginTop: 0 }}>
          {desc}
        </Paragraph>)}
    </div>);
}
function PortalStats(_a) {
    var stats = _a.stats, primaryColor = _a.primaryColor;
    return (<div style={{ background: '#001529' }}>
      <div style={styles.statsRow}>
        {stats.map(function (s, i) { return (<FadeIn key={s.label} delay={i * 100}>
            <div style={{ textAlign: 'center', padding: '0 24px' }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: primaryColor }}>{s.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>{s.label}</div>
            </div>
          </FadeIn>); })}
      </div>
    </div>);
}
/* ============================================================
 * FeatureCard · 能力卡（图标来自配置 icon 名 → ICON_MAP）
 * ============================================================ */
var ICON_MAP = {
    cluster: <icons_1.ClusterOutlined />,
    safety: <icons_1.SafetyCertificateOutlined />,
    team: <icons_1.TeamOutlined />,
    appstore: <icons_1.AppstoreOutlined />,
    folder: <icons_1.FolderOpenOutlined />,
    file: <icons_1.FileTextOutlined />,
    clock: <icons_1.ClockCircleOutlined />,
    audit: <icons_1.AuditOutlined />,
    'user-add': <icons_1.UserAddOutlined />,
    idcard: <icons_1.IdcardOutlined />,
    calendar: <icons_1.CalendarOutlined />,
    'account-book': <icons_1.AccountBookOutlined />,
    database: <icons_1.DatabaseOutlined />,
    swap: <icons_1.SwapOutlined />,
    setting: <icons_1.SettingOutlined />,
    experiment: <icons_1.ExperimentOutlined />,
};
function FeatureCard(_a) {
    var _b;
    var feature = _a.feature, primaryColor = _a.primaryColor;
    var icon = (_b = ICON_MAP[feature.icon]) !== null && _b !== void 0 ? _b : <icons_1.AppstoreOutlined />;
    return (<div style={styles.featureCard}>
      <div style={{ fontSize: 30, color: primaryColor }}>{icon}</div>
      <antd_1.Space style={{ marginTop: 12 }}>
        <Text strong style={{ fontSize: 16 }}>
          {feature.title}
        </Text>
        {feature.done ? <antd_1.Tag color="green">已上线</antd_1.Tag> : <antd_1.Tag>规划中</antd_1.Tag>}
      </antd_1.Space>
      <Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>
        {feature.desc}
      </Paragraph>
    </div>);
}
function PortalFaq(_a) {
    var items = _a.items;
    return (<antd_1.Collapse ghost items={items.map(function (f, i) { return ({ key: String(i), label: f.q, children: f.a }); })}/>);
}
function PortalCta(_a) {
    var cta = _a.cta, primaryColor = _a.primaryColor, onAction = _a.onAction;
    return (<div style={{
            background: "linear-gradient(120deg, ".concat(primaryColor, ", ").concat(primaryColor, "99)"),
            padding: '64px 24px',
        }}>
      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        <Title level={3} style={{ color: '#fff', margin: 0 }}>
          {cta.title}
        </Title>
        <Paragraph style={{ color: 'rgba(255,255,255,0.85)', marginTop: 8 }}>{cta.desc}</Paragraph>
        <antd_1.Button type="primary" size="large" style={{ background: '#fff', borderColor: '#fff' }} onClick={onAction}>
          {cta.buttonText} <icons_1.ArrowRightOutlined />
        </antd_1.Button>
      </div>
    </div>);
}
/* ============================================================
 * 样式
 * ============================================================ */
var styles = {
    nav: {
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        height: 56,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 1px 8px rgba(0,0,0,0.08)',
    },
    navBrand: { display: 'flex', alignItems: 'center', textDecoration: 'none' },
    navLogo: {
        width: 26,
        height: 26,
        borderRadius: 6,
        objectFit: 'contain',
        marginRight: 8,
        background: '#fff',
    },
    navMenu: { display: 'flex', gap: 20 },
    navLink: { color: 'rgba(0,0,0,0.65)', textDecoration: 'none', fontSize: 14 },
    brand: { display: 'flex', alignItems: 'center', marginBottom: 8 },
    logo: {
        width: 28,
        height: 28,
        borderRadius: 6,
        objectFit: 'contain',
        marginRight: 8,
        background: '#fff',
    },
    brandText: { fontSize: 18, fontWeight: 600, color: '#fff' },
    heroBtn: { background: '#fff', color: '#1677ff' },
    footer: { background: '#001529', padding: '24px', textAlign: 'center' },
    statsRow: {
        maxWidth: 1080,
        margin: '0 auto',
        padding: '48px 24px',
        display: 'flex',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        gap: 24,
    },
    featureCard: {
        background: '#fff',
        borderRadius: 8,
        padding: 24,
        height: '100%',
        boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
    },
};
/** Hero 渐变背景（按版别主色生成三档渐变） */
function heroStyle(primary) {
    return {
        background: "linear-gradient(135deg, ".concat(primary, " 0%, ").concat(primary, "cc 55%, ").concat(primary, "66 100%)"),
        padding: '96px 24px',
        display: 'flex',
        justifyContent: 'center',
    };
}
