"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = NotFound;
/**
 * 404 页（Phase 9 · P0 体验硬伤）.
 */
var antd_1 = require("antd");
var react_router_dom_1 = require("react-router-dom");
function NotFound() {
    var navigate = (0, react_router_dom_1.useNavigate)();
    return (<antd_1.Result status="404" title="404" subTitle="页面不存在或已被移除。" extra={[
            <antd_1.Button key="home" type="primary" onClick={function () { return navigate('/welcome'); }}>
          回到工作台
        </antd_1.Button>,
            <antd_1.Button key="back" onClick={function () { return navigate(-1); }}>
          返回上一页
        </antd_1.Button>,
        ]}/>);
}
