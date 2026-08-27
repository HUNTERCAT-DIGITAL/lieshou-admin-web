"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditionGuard = EditionGuard;
var react_router_dom_1 = require("react-router-dom");
var editions_1 = require("../config/editions");
var NotFound_1 = require("../pages/NotFound");
function EditionGuard(_a) {
    var _b;
    var children = _a.children;
    var pathname = (0, react_router_dom_1.useLocation)().pathname;
    var edition = (0, editions_1.getEdition)();
    var hiddenMenus = (0, editions_1.getEditionHiddenMenus)(edition);
    var hidden = hiddenMenus.some(function (h) { return pathname === h || pathname.startsWith(h + '/') || pathname.startsWith(h + '?'); });
    // 法律能力域（ADR-0036）：仅 showLegal 版别（layer/legalmind）可访问 /legal/**
    var legalHidden = pathname.startsWith('/legal') && !((_b = edition.showLegal) !== null && _b !== void 0 ? _b : false);
    return hidden || legalHidden ? <NotFound_1.default /> : <>{children}</>;
}
