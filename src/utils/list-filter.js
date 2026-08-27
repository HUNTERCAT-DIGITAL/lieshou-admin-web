"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterByKeywordAndStatus = filterByKeywordAndStatus;
/** 关键字命中：把每行的多个可搜字段拼成一个串，判断 keyword 是否是子串 */
function matchKeyword(row, keyword, fields) {
    if (!keyword)
        return true;
    var hay = fields
        .map(function (f) { return row[f]; })
        .filter(function (v) { return v !== undefined && v !== null; })
        .map(function (v) { return String(v).toLowerCase(); })
        .join(' ');
    return hay.includes(keyword);
}
/** 状态精确匹配（未传 / 不匹配都返回 true 表示不过滤） */
function matchStatus(row, status) {
    if (!status)
        return true;
    return row.status === status;
}
/** 按 keyword（多字段拼接）+ status 过滤列表；保留原数组顺序 */
function filterByKeywordAndStatus(rows, params, searchFields) {
    var _a;
    var keyword = (_a = params.keyword) === null || _a === void 0 ? void 0 : _a.toLowerCase().trim();
    if (!keyword && !params.status)
        return rows;
    return rows.filter(function (row) { return matchKeyword(row, keyword !== null && keyword !== void 0 ? keyword : '', searchFields) && matchStatus(row, params.status); });
}
