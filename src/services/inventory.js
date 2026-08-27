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
exports.listProducts = listProducts;
exports.countProducts = countProducts;
exports.getProduct = getProduct;
exports.createProduct = createProduct;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
exports.stockIn = stockIn;
exports.stockOut = stockOut;
exports.listMovements = listMovements;
exports.importProducts = importProducts;
/**
 * 进销存 API service（Phase 9 · inventory-service，走统一 api 封装）.
 */
var api_1 = require("./api");
/** GET /api/products — 租户内商品列表（可选 keyword） */
function listProducts(keyword) {
    return __awaiter(this, void 0, void 0, function () {
        var qs;
        return __generator(this, function (_a) {
            qs = keyword ? "?keyword=".concat(encodeURIComponent(keyword)) : '';
            return [2 /*return*/, api_1.api.get("/products".concat(qs))];
        });
    });
}
/** GET /api/products/count */
function countProducts() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.get('/products/count')];
        });
    });
}
/** GET /api/products/{id} */
function getProduct(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.get("/products/".concat(id))];
        });
    });
}
/** POST /api/products */
function createProduct(body) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.post('/products', body)];
        });
    });
}
/** PUT /api/products/{id} */
function updateProduct(id, body) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.put("/products/".concat(id), body)];
        });
    });
}
/** DELETE /api/products/{id} */
function deleteProduct(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.delete("/products/".concat(id))];
        });
    });
}
/** POST /api/products/{id}/stock-in — 入库（库存 +） */
function stockIn(id, body) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.post("/products/".concat(id, "/stock-in"), body)];
        });
    });
}
/** POST /api/products/{id}/stock-out — 出库（库存 -） */
function stockOut(id, body) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.api.post("/products/".concat(id, "/stock-out"), body)];
        });
    });
}
/** GET /api/products/{id}/movements — 某商品出入库流水 */
function listMovements(id, type) {
    return __awaiter(this, void 0, void 0, function () {
        var qs;
        return __generator(this, function (_a) {
            qs = type ? "?type=".concat(type) : '';
            return [2 /*return*/, api_1.api.get("/products/".concat(id, "/movements").concat(qs))];
        });
    });
}
/** POST /api/products/import — CSV 批量导入（multipart） */
function importProducts(file) {
    return __awaiter(this, void 0, void 0, function () {
        var form;
        return __generator(this, function (_a) {
            form = new FormData();
            form.append('file', file);
            return [2 /*return*/, api_1.api.postForm('/products/import', form)];
        });
    });
}
