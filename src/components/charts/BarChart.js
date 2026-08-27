"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BarChart;
/**
 * 简单自绘 SVG 柱状图（Phase 9 · BI 看板雏形）.
 *
 * 无第三方图表库依赖（避免拉 ~500KB 的 @ant-design/charts）。
 * 30 天数据 + hover Tooltip，足够 BI 雏形展示。
 */
var antd_1 = require("antd");
var react_1 = require("react");
var analytics_1 = require("../../utils/analytics");
var BAR_GAP = 2;
var PAD_X = 8;
var PAD_TOP = 12;
var PAD_BOTTOM = 18;
/** 单个柱子（不可交互） */
function Bar(_a) {
    var x = _a.x, y = _a.y, w = _a.w, h = _a.h, fill = _a.fill;
    return <rect x={x} y={y} width={w} height={h} fill={fill} rx={2}/>;
}
function BarChart(_a) {
    var data = _a.data, _b = _a.width, width = _b === void 0 ? 560 : _b, _c = _a.height, height = _c === void 0 ? 180 : _c, _d = _a.fill, fill = _d === void 0 ? '#1677ff' : _d;
    var max = (0, react_1.useMemo)(function () { return (0, analytics_1.seriesExtent)(data); }, [data]).max;
    var innerW = width - PAD_X * 2;
    var innerH = height - PAD_TOP - PAD_BOTTOM;
    var slotW = data.length > 0 ? innerW / data.length : 0;
    var barW = Math.max(2, slotW - BAR_GAP);
    // x 轴刻度：显示首 / 中 / 末共 3 个标签
    var tickIdx = data.length > 0 ? [0, Math.floor(data.length / 2), data.length - 1] : [];
    var ticks = tickIdx.map(function (i) { return ({
        x: PAD_X + i * slotW + slotW / 2,
        label: data[i] ? data[i].date.slice(5) : '', // MM-DD
    }); });
    return (<div style={{ width: '100%' }}>
      <svg viewBox={"0 0 ".concat(width, " ").concat(height)} preserveAspectRatio="none" style={{ width: '100%', height: height, display: 'block' }} role="img" aria-label="30 天客户创建趋势">
        {data.map(function (b, i) {
            var h = (b.count / max) * innerH;
            var x = PAD_X + i * slotW + (slotW - barW) / 2;
            var y = PAD_TOP + (innerH - h);
            return (<antd_1.Tooltip key={b.date} title={"".concat(b.date, "\uFF1A").concat(b.count, " \u6761")} mouseEnterDelay={0}>
              <g>
                {/* 透明的 hover 命中区（更宽更好命中） */}
                <rect x={PAD_X + i * slotW} y={PAD_TOP} width={slotW} height={innerH} fill="transparent"/>
                <Bar x={x} y={y} w={barW} h={h} fill={fill}/>
              </g>
            </antd_1.Tooltip>);
        })}
        {/* x 轴 */}
        <line x1={PAD_X} x2={width - PAD_X} y1={PAD_TOP + innerH + 0.5} y2={PAD_TOP + innerH + 0.5} stroke="#e5e7eb" strokeWidth={1}/>
        {ticks.map(function (t) { return (<text key={t.label + t.x} x={t.x} y={height - 4} textAnchor="middle" fontSize={11} fill="#9ca3af">
            {t.label}
          </text>); })}
      </svg>
    </div>);
}
