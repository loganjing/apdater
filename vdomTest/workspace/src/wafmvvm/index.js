var waf = require('./core/index').waf;
var renderApp = require('./core/index').renderApp;
var linkButton = require('./component/linkButton/linkButton');
var section = require('./component/section/section');
var section = require('./component/section/section');
var Store = require('./core/index').Store;


//onclick的模拟处理
window._self = {};
_self.btnClick = function() {
    alert(1);
}
_self.confirm1 = function() {
    alert("confirm1 Action!");
}
_self.confirm2 = function() {
    alert("confirm2 Action!");
}


var meta = {
    componentType: "com.kingdee.bos.ctrl.web.Section",
    id: "section7",
    title: "基本信息",
    autoOpen: true,
    children: [{
        componentType: "com.kingdee.bos.ctrl.web.Button",
        id: "toolBar_submit",
        caption: "提交",
        iconCls: "f-icon-eraser",
        onclick: "btnClick",
        tabindex: 0
    }, {
        componentType: "com.kingdee.bos.ctrl.web.Button",
        id: "toolBar_save",
        caption: "保存",
        iconCls: "f-icon-eraser",
        onclick: "btnClick",
        tabindex: 0
    }, {
        componentType: "span",
        children: ["这是一个span的测试文本"]
    }]
};

var store = new Store({
    state:{meta:meta}
});

var container = document.getElementById("container");
//传递页面全局性的状态进去
renderApp(container,store);


/******************************************
//第一步测试：
var lk1 = {
    caption: "修改2",
    id: "submitBtn2",
    iconCls: "f-icon-eraser",
    onclick: "btnClick",
    tabindex: 0
};
var sec1 = {
    id: "section1",
    title: "基本信息",
    autoOpen: true,
    children: [linkButton(lk1)]
}

var sec = section(sec1);
var container = document.getElementById("container");
render(container, sec);
***/