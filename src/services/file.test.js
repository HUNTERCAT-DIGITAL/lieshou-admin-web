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
/**
 * core.file 文件服务 wrapper 单测（上传/元数据/强制鉴权 blob 下载）.
 *
 * 验证 URL path / multipart 表单 / blob 通道正确（api 层本身有独立测试）。
 */
var vitest_1 = require("vitest");
var _a = vitest_1.vi.hoisted(function () { return ({
    apiGet: vitest_1.vi.fn(),
    apiPostForm: vitest_1.vi.fn(),
    apiGetBlob: vitest_1.vi.fn(),
}); }), apiGet = _a.apiGet, apiPostForm = _a.apiPostForm, apiGetBlob = _a.apiGetBlob;
vitest_1.vi.mock('./api', function () { return ({
    api: {
        get: apiGet,
        postForm: apiPostForm,
        getBlob: apiGetBlob,
    },
}); });
var file_1 = require("./file");
(0, vitest_1.describe)('file service', function () {
    (0, vitest_1.beforeEach)(function () {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.it)('uploadFile → POST /files（multipart FormData，字段名 file）', function () { return __awaiter(void 0, void 0, void 0, function () {
        var file, _a, path, form;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    apiPostForm.mockResolvedValue({ id: 7, originalName: '证书.pdf' });
                    file = new File(['bytes'], '证书.pdf', { type: 'application/pdf' });
                    return [4 /*yield*/, (0, file_1.uploadFile)(file)];
                case 1:
                    _b.sent();
                    _a = apiPostForm.mock.calls[0], path = _a[0], form = _a[1];
                    (0, vitest_1.expect)(path).toBe('/files');
                    (0, vitest_1.expect)(form.get('file')).toBe(file);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('getFileMeta → GET /files/{id}', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiGet.mockResolvedValue({ id: 7, originalName: '证书.pdf' });
                    return [4 /*yield*/, (0, file_1.getFileMeta)(7)];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(apiGet).toHaveBeenCalledWith('/files/7');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('fetchFileContent → GET /files/{id}/content（强制鉴权 blob）', function () { return __awaiter(void 0, void 0, void 0, function () {
        var fakeBlob, blob;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fakeBlob = { size: 3 };
                    apiGetBlob.mockResolvedValue(fakeBlob);
                    return [4 /*yield*/, (0, file_1.fetchFileContent)(7)];
                case 1:
                    blob = _a.sent();
                    (0, vitest_1.expect)(apiGetBlob).toHaveBeenCalledWith('/files/7/content');
                    (0, vitest_1.expect)(blob).toBe(fakeBlob);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('fileContentUrl 无 BASE → /files/{id}/content', function () {
        (0, vitest_1.expect)((0, file_1.fileContentUrl)(7)).toBe('/files/7/content');
    });
    (0, vitest_1.it)('fileContentUrl 带 VITE_API_BASE_URL=/api → /api/files/{id}/content（BASE 已含 /api 前缀）', function () {
        vitest_1.vi.stubEnv('VITE_API_BASE_URL', '/api');
        (0, vitest_1.expect)((0, file_1.fileContentUrl)(7)).toBe('/api/files/7/content');
        vitest_1.vi.unstubAllEnvs();
    });
});
