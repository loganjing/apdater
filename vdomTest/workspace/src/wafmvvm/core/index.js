var waf = require("./global/index");
var objModule = require("./obj/index");
var Component = objModule.Component;
var FormComponent = objModule.FormComponent;
var ContainerComponent = objModule.ContainerComponent;
var vdom= require("./vdom/index");

var env =  require("./env");
var initCache = require('./cache');
var initCompile = require('./compile/index');
var _ = require('lodash');
var renderChildrenTree = objModule.renderChildrenTree;


initCache(waf);
initCompile(waf);

module.exports = {
	waf:waf,
	Component:Component,
	FormComponent:FormComponent,
	ContainerComponent:ContainerComponent,
	h:vdom.h,
	render:vdom.render,
	env : env,
	_:_,
	renderChildrenTree:renderChildrenTree,
	renderApp:objModule.renderApp
}