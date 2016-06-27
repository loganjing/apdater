var $ = require('jquery');
var h = require('virtual-dom/h');
var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');
var createElement = require('virtual-dom/create-element');


function generateTree(options) {
    return h("a#" + (options.id) + ".ui-linkbutton.btn" + (options.tagClass ? options.tagClass : ""), {
        "attributes": {
            "ctrlrole": "linkButton",
            "tabindex": options.tabindex ? options.tabindex : 0,
            "actionBinding": options.actionBinding
        }
    }, [
        options.iconCls ? h("span.ui-lb-icon.f-icon-cloud-upload") : "",
        options.caption ? h("span.ui-lb-text", [options.caption]) : ""
    ]);

}


exports.createDOMFun = function(options) {
    var tree = generateTree(options);
    return createElement(tree);
}
exports.initFun = function(dom, options) {
    $("#" + options.id).mount();
}