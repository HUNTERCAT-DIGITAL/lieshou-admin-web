"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = App;
var react_router_dom_1 = require("react-router-dom");
var ui_1 = require("@lieshoucloud/ui");
var routes_1 = require("./routes");
function App() {
    return (<ui_1.ErrorBoundary>
      <react_router_dom_1.BrowserRouter>{routes_1.routes}</react_router_dom_1.BrowserRouter>
    </ui_1.ErrorBoundary>);
}
