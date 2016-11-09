//这里可以动态的增加静态方法
var Component = require("./component").WafComponent;
var FormComponent = require("./component").WafFormComponent;
var ContainerComponent = require("./component").WafContainerComponent;

var waf = require("../global/index");



//var initRegister = require("./register");
var initDynamic = require("./dynaInit");
var renderModel = require("./render");
var initRegister = renderModel.initRegister;
var renderChildrenTree = renderModel.renderChildrenTree;

//var initObjectDOM = require("./dom");
var initEvent = require("./event");
var version = Component.version;

//注册全局类方法
//if (!(version && version >= "8.3.0")) {
//兼容性考虑的
initDynamic(waf, Component);
initRegister(waf);
//}

var dom = require("../dom");
Component.mix({
	appendTo:function(parent){
       dom.inject(this.elem,parent);
	}
})

//initRegister(Component);


//注册全局实例方法
//initObjectDOM(Component);
//initEvent(Component);


module.exports.Component = Component;
module.exports.FormComponent = FormComponent;
module.exports.ContainerComponent = ContainerComponent;
module.exports.renderChildrenTree = renderModel.renderChildrenTree;
module.exports.renderApp = renderModel.renderApp;
module.exports.renderChildTree = renderModel.renderChildTree;
