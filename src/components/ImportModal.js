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
exports.default = ImportModal;
var react_1 = require("react");
var antd_1 = require("antd");
var icons_1 = require("@ant-design/icons");
var csv_1 = require("../utils/csv");
/**
 * 通用 CSV 导入弹窗（Phase 9 · 数据导入工具）.
 *
 * - 下载模板（浏览器生成，无需后端）
 * - Upload 选择 CSV → 调 onImport → 展示结果（成功/失败 + 错误明细表）
 * - 失败行不阻断成功行（后端部分成功语义）
 */
function ImportModal(_a) {
    var _this = this;
    var open = _a.open, title = _a.title, template = _a.template, onImport = _a.onImport, onClose = _a.onClose;
    var message = antd_1.App.useApp().message;
    var _b = (0, react_1.useState)(false), uploading = _b[0], setUploading = _b[1];
    var _c = (0, react_1.useState)(null), result = _c[0], setResult = _c[1];
    var _d = (0, react_1.useState)([]), fileList = _d[0], setFileList = _d[1];
    var reset = function () {
        setResult(null);
        setFileList([]);
        setUploading(false);
    };
    var handleImport = function () { return __awaiter(_this, void 0, void 0, function () {
        var file, r, _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    file = (_b = fileList[0]) === null || _b === void 0 ? void 0 : _b.originFileObj;
                    if (!file) {
                        message.warning('请先选择 CSV 文件');
                        return [2 /*return*/];
                    }
                    setUploading(true);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, onImport(file)];
                case 2:
                    r = _c.sent();
                    setResult(r);
                    if (r.failed === 0) {
                        message.success("\u5BFC\u5165\u6210\u529F ".concat(r.success, " \u6761"));
                    }
                    else {
                        message.warning("\u5BFC\u5165\u5B8C\u6210\uFF1A\u6210\u529F ".concat(r.success, " \u6761\uFF0C\u5931\u8D25 ").concat(r.failed, " \u6761"));
                    }
                    return [3 /*break*/, 5];
                case 3:
                    _a = _c.sent();
                    return [3 /*break*/, 5];
                case 4:
                    setUploading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (<antd_1.Modal open={open} title={title} width={640} okText="开始导入" okButtonProps={{ loading: uploading, disabled: fileList.length === 0 }} onOk={function () { return void handleImport(); }} onCancel={function () {
            reset();
            onClose();
        }} destroyOnClose>
      <antd_1.Button type="link" icon={<icons_1.DownloadOutlined />} onClick={function () { return (0, csv_1.downloadCsvTemplate)(template.filename, template.header, template.sample); }} style={{ paddingLeft: 0, marginBottom: 8 }}>
        下载 CSV 模板
      </antd_1.Button>
      <antd_1.Upload.Dragger accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" maxCount={1} fileList={fileList} beforeUpload={function (file) {
            setFileList([file]);
            return false; // 不自动上传
        }} onRemove={function () {
            setFileList([]);
            setResult(null);
        }}>
        <p className="ant-upload-drag-icon">
          <icons_1.InboxOutlined />
        </p>
        <p className="ant-upload-text">点击或拖拽 CSV 文件到此处</p>
        <p className="ant-upload-hint">UTF-8 编码，首行为表头（参考模板）</p>
      </antd_1.Upload.Dragger>

      {result && (<div style={{ marginTop: 16 }}>
          <antd_1.Alert type={result.failed === 0 ? 'success' : 'warning'} showIcon message={"\u5171 ".concat(result.total, " \u884C\uFF1A\u6210\u529F ").concat(result.success, " \u6761\uFF0C\u5931\u8D25 ").concat(result.failed, " \u6761")}/>
          {result.failed > 0 && (<antd_1.Table size="small" style={{ marginTop: 8 }} rowKey="row" pagination={false} dataSource={result.errors} columns={[
                    { title: '行号', dataIndex: 'row', width: 80 },
                    { title: '失败原因', dataIndex: 'message' },
                ]}/>)}
        </div>)}
      <antd_1.Typography.Text type="secondary" style={{ display: 'block', marginTop: 12, fontSize: 12 }}>
        字段说明见模板表头；非法行跳过并展示原因，不影响其他行导入。
      </antd_1.Typography.Text>
    </antd_1.Modal>);
}
