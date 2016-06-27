var $ = require('jquery');
var h = require('virtual-dom/h');
var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');
var createElement = require('virtual-dom/create-element');
var linkbutton = require('./newLinkbutton');



var $container = $('.container');

function generateTree(options) {
    return h("a#" + (options.id) + ".ui-linkbutton.btn" + (options.tagClass ? options.tagClass : ""), {
        "attributes": {
            "ctrlrole": "linkButton",
            "tabindex": options.tabindex ? options.tabindex : 0
        }
    }, [
        options.iconCls ? h("span.ui-lb-icon.f-icon-cloud-upload") : "",
        options.caption ? h("span.ui-lb-text", [options.caption]) : ""
    ]);

}
var submitBtn = generateTree({
    caption: "修改",
    id: "submitBtn",
    iconCls: "f-icon-eraser"
});
submitBtn = createElement(submitBtn);
$container.append(submitBtn);

//动态的创建btn
var options = {
    caption: "修改1",
    id: "submitBtn1",
    iconCls: "f-icon-eraser"
};
var dom = linkbutton.createDOMFun(options);
$container.append(dom);
linkbutton.initFun(dom, options);