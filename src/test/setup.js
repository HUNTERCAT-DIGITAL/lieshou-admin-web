"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Vitest 测试全局 setup 文件
// 见 .ai/TESTING.md §2 / §4
require("@testing-library/jest-dom/vitest");
var vitest_1 = require("vitest");
var react_1 = require("@testing-library/react");
// antd / ProLayout 用 window.matchMedia 做响应式检测；jsdom 没实现，mock 之
if (typeof window !== 'undefined' && !window.matchMedia) {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: function (query) { return ({
            matches: false,
            media: query,
            onchange: null,
            addListener: function () { },
            removeListener: function () { },
            addEventListener: function () { },
            removeEventListener: function () { },
            dispatchEvent: function () { return false; },
        }); },
    });
}
// ResizeObserver 一些 antd 组件用，jsdom 也没实现
if (typeof window !== 'undefined' && !window.ResizeObserver) {
    Object.defineProperty(window, 'ResizeObserver', {
        writable: true,
        value: /** @class */ (function () {
            function ResizeObserver() {
            }
            ResizeObserver.prototype.observe = function () { };
            ResizeObserver.prototype.unobserve = function () { };
            ResizeObserver.prototype.disconnect = function () { };
            return ResizeObserver;
        }()),
    });
}
// jsdom 25 不支持 `:has()` 等新选择器；antd/pro-components cssinjs 会生成
// `&:has(+ .ant-select-item-option-selected...)` 规则并做 selector 校验，
// 直接抛 SyntaxError 导致 ProTable 等页面整树崩进 ErrorBoundary。
// 这里仅吞掉“选择器语法不支持”的异常（样式在测试中本就无意义），其余照常抛。
function patchCssSyntaxError(name) {
    var original = window[name];
    if (typeof original !== 'function')
        return;
    window[name] = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        try {
            return original.apply(this, args);
        }
        catch (e) {
            if (e instanceof DOMException && e.name === 'SyntaxError')
                return null;
            throw e;
        }
    };
}
// CSSStyleSheet.insertRule / addRule：不支持的 selector 直接跳过（返回 0）
if (typeof CSSStyleSheet !== 'undefined' && CSSStyleSheet.prototype) {
    var origInsert_1 = CSSStyleSheet.prototype.insertRule;
    CSSStyleSheet.prototype.insertRule = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        try {
            return origInsert_1.apply(this, args);
        }
        catch (e) {
            if (e instanceof DOMException && e.name === 'SyntaxError')
                return 0;
            throw e;
        }
    };
    var origAdd_1 = CSSStyleSheet.prototype.addRule;
    if (origAdd_1) {
        CSSStyleSheet.prototype.addRule = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            try {
                return origAdd_1.apply(this, args);
            }
            catch (e) {
                if (e instanceof DOMException && e.name === 'SyntaxError')
                    return -1;
                throw e;
            }
        };
    }
}
// document.querySelector/querySelectorAll：不支持的选择器返回 null / []
if (typeof document !== 'undefined') {
    patchCssSyntaxError('querySelector');
    patchCssSyntaxError('querySelectorAll');
}
// rc-util 测滚动条宽度会带 pseudoElt 调 getComputedStyle，jsdom 打 "Not implemented" 噪音
// （ProTable 渲染必经路径）。带伪元素的调用返回空样式即可静默。
if (typeof window !== 'undefined' && 'getComputedStyle' in window) {
    var origGCS_1 = window.getComputedStyle.bind(window);
    window.getComputedStyle = function (elt, pseudoElt) {
        if (pseudoElt) {
            var decl = { getPropertyValue: function () { return ''; } };
            return decl;
        }
        return origGCS_1(elt);
    };
}
if (typeof Element !== 'undefined' && Element.prototype) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    var proto_1 = Element.prototype;
    var wrap = function (name, fallback) {
        var original = proto_1[name];
        if (typeof original !== 'function')
            return;
        proto_1[name] = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            try {
                return original.apply(this, args);
            }
            catch (e) {
                if (e instanceof DOMException && e.name === 'SyntaxError')
                    return fallback;
                throw e;
            }
        };
    };
    wrap('querySelector', null);
    wrap('querySelectorAll', []);
    wrap('matches', false);
    wrap('closest', null);
}
// 每个测试后自动 unmount 组件，避免状态污染
(0, vitest_1.afterEach)(function () {
    (0, react_1.cleanup)();
});
