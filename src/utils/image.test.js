"use strict";
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 图片压缩工具单测（utils/image.ts）.
 */
var vitest_1 = require("vitest");
var image_1 = require("./image");
function makeFile(size, name, type) {
    if (name === void 0) { name = 'a.jpg'; }
    if (type === void 0) { type = 'image/jpeg'; }
    return new File([new Uint8Array(size)], name, { type: type });
}
(0, vitest_1.beforeEach)(function () {
    // jsdom 无 URL.createObjectURL，mock 掉（压缩路径需要）
    vitest_1.vi.stubGlobal('URL', __assign(__assign({}, globalThis.URL), { createObjectURL: vitest_1.vi.fn(function () { return 'blob:test'; }), revokeObjectURL: vitest_1.vi.fn() }));
});
(0, vitest_1.describe)('compressImage', function () {
    (0, vitest_1.it)('≤1MB 不压缩，原样返回', function () { return __awaiter(void 0, void 0, void 0, function () {
        var small, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    small = makeFile(image_1.SKIP_COMPRESS_BYTES);
                    return [4 /*yield*/, (0, image_1.compressImage)(small)];
                case 1:
                    result = _a.sent();
                    (0, vitest_1.expect)(result).toBe(small);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('>1MB 且环境无法解码（jsdom）→ 超时兜底返回原文件', function () { return __awaiter(void 0, void 0, void 0, function () {
        var big, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    big = makeFile(image_1.SKIP_COMPRESS_BYTES + 100);
                    return [4 /*yield*/, (0, image_1.compressImage)(big, image_1.MAX_SIDE_PX, image_1.JPEG_QUALITY, 50)];
                case 1:
                    result = _a.sent();
                    (0, vitest_1.expect)(result).toBe(big);
                    return [2 /*return*/];
            }
        });
    }); });
});
