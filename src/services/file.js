"use strict";
/**
 * File 服务 API 封装（core.file · 上传/下载/预览/回收站 · ADR-0025）.
 *
 * - 强制 X-Tenant-Id：gateway 从 JWT 注入，前端无需传
 * - 上传返回文件元数据（FileEntity），certAttach 等业务字段存 fileId
 * - 下载/预览：GET /api/files/{id}/content 强制鉴权 → 走 api.getBlob（带 Authorization），
 *   拿到 Blob 后由调用方生成 objectURL 预览/下载（<a href> 直接打开无法带 header，会 401）
 */
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
exports.uploadFile = uploadFile;
exports.fileContentUrl = fileContentUrl;
exports.getFileMeta = getFileMeta;
exports.fetchFileContent = fetchFileContent;
var api_1 = require("./api");
/**
 * 上传文件（multipart · ≤20MB · 字段名 file）。
 * @returns 文件元数据（含 id）
 */
function uploadFile(file) {
    return __awaiter(this, void 0, void 0, function () {
        var form;
        return __generator(this, function (_a) {
            form = new FormData();
            form.append('file', file);
            return [2 /*return*/, api_1.api.postForm('/files', form)];
        });
    });
}
/** 文件下载/预览地址（inline；跨域走 gateway /api/files/{id}/content，BASE 已含 /api 前缀） */
function fileContentUrl(id) {
    var _a;
    var base = (_a = import.meta.env.VITE_API_BASE_URL) !== null && _a !== void 0 ? _a : '';
    return "".concat(base, "/files/").concat(id, "/content");
}
/** 通过 id 查询文件元数据（租户内） */
function getFileMeta(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.get("/files/".concat(id))];
        });
    });
}
/**
 * 下载/预览文件内容（强制鉴权 · 自动带 Authorization）。
 * @returns Blob（调用方 `URL.createObjectURL(blob)` 后预览或触发下载）
 */
function fetchFileContent(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.getBlob("/files/".concat(id, "/content"))];
        });
    });
}
