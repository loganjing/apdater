var render = require('../vdom/index');
/**
 ** 兼容旧的版本增加的内容
 **/
function initDynamic(waf, Component) {
    waf.createDOM = function(type, options) {
        var meta = Component.components[type];
        if (meta.generateTree && meta.constructor) {
        	//TODO:为DOM生成唯一ID,缓存使用
            var tree = meta.generateTree(waf.dom.buildOptions(null,meta.constructor.defaultOptions,options));
            var elem = render(tree);
            return elem;
        }
    }
    waf.initFun = function(type, options, dom) {
        var meta = Component.components[type];
        if (meta.constructor) {
        	options = waf.dom.buildOptions(dom,meta.constructor.defaultOptions,options);
            return new meta.constructor(options, dom);
        }
    }
}

module.exports = initDynamic;