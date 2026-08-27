"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessGuard = AccessGuard;
var access_1 = require("../access");
var Forbidden_1 = require("../pages/Forbidden");
var auth_1 = require("../stores/auth");
function AccessGuard(_a) {
    var required = _a.access, children = _a.children;
    var user = (0, auth_1.useAuthStore)(function (s) { return s.user; });
    var granted = Boolean((0, access_1.createAccess)(user)[required]);
    return granted ? <>{children}</> : <Forbidden_1.default />;
}
