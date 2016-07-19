var waf = require('./core/index').waf;
var WafLinkButton = require('./component/linkButton/linkButton');
var WafSection = require('./component/section/section');


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


var options = {
        caption: "修改2",
        id: "submitBtn2",
        iconCls: "f-icon-eraser",
        onclick: "btnClick",
        tabindex: 0
    };

var $container = waf('.container');

var btn = new WafLinkButton(options);
btn.appendTo($container[0]);

//旧方法的兼容性处理
waf("#createBtn").click(function() {
    var $container = waf('.container');

    options = {
        caption: "修改3",
        id: "submitBtn3",
        actionBinding: "confirm1",
        disable: true
    };
    dom = waf.createDOM("linkButton", options);
    $container.append(dom);
    lk1 = waf.initFun("linkButton", options, dom);
    lk1.enable();
})

//section
options = {
    id:"section1",
    title:"基本信息",
    autoOpen:true
}
var sec = new WafSection(options);
sec.appendTo($container[0]);


