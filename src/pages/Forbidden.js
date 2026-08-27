"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Forbidden;
/**
 * 403 页（Phase 9 · P0 体验硬伤）.
 */
var antd_1 = require("antd");
var react_router_dom_1 = require("react-router-dom");
function Forbidden() {
    var navigate = (0, react_router_dom_1.useNavigate)();
    return (<antd_1.Result status="403" title="403" subTitle="抱歉，你没有权限访问该页面。" extra={[
            <antd_1.Button key="back" onClick={function () { return navigate(-1); }}>
          返回上一页
        </antd_1.Button>,
            <antd_1.Button key="home" type="primary" onClick={function () { return navigate('/welcome'); }}>
          回到工作台
        </antd_1.Button>,
        ]}/>);
}
