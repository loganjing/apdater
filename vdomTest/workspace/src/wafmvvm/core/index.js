var waf = require("./global/index");
var Component = require("./obj/index").Component;
var FormComponent = require("./obj/index").FormComponent;
var ContainerComponent = require("./obj/index").ContainerComponent;
var vdom= require("./vdom/index");

var env =  require("./env");
var initCache = require('./cache');
var initCompile = require('./compile/index');
var _ = require('./util');


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
	_:_
}