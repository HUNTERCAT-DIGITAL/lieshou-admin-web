"use strict";
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
exports.SKIP_COMPRESS_BYTES = exports.JPEG_QUALITY = exports.MAX_SIDE_PX = void 0;
exports.compressImage = compressImage;
/**
 * 图片压缩（设备照片上传前 · 移动端大图 → <1MB）.
 *
 * 手机照片普遍 5~12MB，直接上传会超后端限制；压缩到最大边 1600px + JPEG 0.82
 * 后通常 <500KB。≤1MB 或解码/画布不可用（jsdom 无 canvas）时原样返回（兜底）。
 */
exports.MAX_SIDE_PX = 1600;
exports.JPEG_QUALITY = 0.82;
exports.SKIP_COMPRESS_BYTES = 1024 * 1024;
/** 图片文件压缩 → 新 File（jpeg）；≤1MB 或解码失败/环境不支持时返回原文件（后端校验兜底） */
function compressImage(file_1) {
    return __awaiter(this, arguments, void 0, function (file, maxSide, quality, timeoutMs) {
        var url, img, scale, w, h, canvas, ctx, blob, name_1, _a;
        if (maxSide === void 0) { maxSide = exports.MAX_SIDE_PX; }
        if (quality === void 0) { quality = exports.JPEG_QUALITY; }
        if (timeoutMs === void 0) { timeoutMs = 8000; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (file.size <= exports.SKIP_COMPRESS_BYTES)
                        return [2 /*return*/, file];
                    url = URL.createObjectURL(file);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, loadImage(url, timeoutMs)];
                case 2:
                    img = _b.sent();
                    scale = Math.min(1, maxSide / Math.max(img.width, img.height));
                    w = Math.max(1, Math.round(img.width * scale));
                    h = Math.max(1, Math.round(img.height * scale));
                    canvas = document.createElement('canvas');
                    canvas.width = w;
                    canvas.height = h;
                    ctx = canvas.getContext('2d');
                    if (!ctx)
                        return [2 /*return*/, file]; // 环境不支持 canvas（如 jsdom）→ 原样上传
                    ctx.drawImage(img, 0, 0, w, h);
                    return [4 /*yield*/, toBlob(canvas, quality)];
                case 3:
                    blob = _b.sent();
                    if (!blob)
                        return [2 /*return*/, file];
                    name_1 = file.name.replace(/\.\w+$/, '') + '.jpg';
                    return [2 /*return*/, new File([blob], name_1, { type: 'image/jpeg' })];
                case 4:
                    _a = _b.sent();
                    // 解码失败/超时 → 原样上传（后端做类型/大小校验）
                    return [2 /*return*/, file];
                case 5:
                    URL.revokeObjectURL(url);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function loadImage(url, timeoutMs) {
    return new Promise(function (resolve, reject) {
        var img = new Image();
        var timer = setTimeout(function () {
            img.src = '';
            reject(new Error('图片解码超时'));
        }, timeoutMs);
        img.onload = function () {
            clearTimeout(timer);
            resolve(img);
        };
        img.onerror = function () {
            clearTimeout(timer);
            reject(new Error('图片解码失败'));
        };
        img.src = url;
    });
}
function toBlob(canvas, quality) {
    return new Promise(function (resolve) { return canvas.toBlob(resolve, 'image/jpeg', quality); });
}
