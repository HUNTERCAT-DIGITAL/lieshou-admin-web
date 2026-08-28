/**
 * BarChart —— 薄壳 re-export.
 * 2026-09 下沉：原本地自绘 SVG 实现迁至共享仓 @lieshoucloud/charts（泛化为 BarDatum，
 * 去 antd Tooltip/getEdition 耦合）。本文件保留以兼容既有 import 路径；
 * 新代码请直接 import '@lieshoucloud/charts'。
 */
export { BarChart as default, type BarChartProps } from "@lieshoucloud/charts";
