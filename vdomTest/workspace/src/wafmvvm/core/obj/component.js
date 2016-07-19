var WafObject = require('./classInherit');
var render = require('../vdom/index').render;
var waf = require('../global/index');

//所有组件的超类
var WafComponent = WafObject.extend({
    template: "",
    initialize: function(options, elem) {
        //TODO:对状态的处理如何办？
        this.options = waf.dom.buildOptions(elem, this.constructor.defaultOptions, options);
        this.supr(options, elem);
        this.options = options;
        if (!elem) {
            var tree = this.generateTree(options);
            elem = render(tree);
        }
        this.elem = elem;
        this.tree = this.elem.tree;
        //cache
        this.elem.inst = this;
    }
});

waf.extend(WafComponent, {
    register: function(meta, fn) {
        this.components = this.components || {};
        this.components[meta.name] = {
            constructor: fn,
            generateTree: meta.generateTree
        };
    },
    afterDef: function(supr, o) {
        this.afterDef = supr.afterDef;
        //加载完JS执行之后就直接注册
        if (o.name) {
            WafComponent.register(o, this);
        }
        //template的解析
        if (o.template && typeof o.template == "string") {
            //TODO:动态生成一个generateTree的函数，并且将此函数注册到原型中
            //这个template的解析实际上可以放在构建的时候直接解析完成
            //运行期拿到的直接就是完整的generateTree.
        }
    }
});

WafComponent.mix({
    generateTree: function(options) {
        //子类覆盖的方法
    },
    set: function(key, value) {
        var oldTree = this.elem.tree;
        var options = this.options;
        var elem = this.elem;
        options[key] = value;
        var newTree = this.generateTree(this.options);
        this.elem = render(newTree, oldTree, elem);
        this.tree = newTree;
    },
    get: function(key) {
        return this.options[key];
    },
    hide: function() {
        this.set("hidden", true);
    },
    show: function() {
        this.set("hidden", false);
    }
});

//Form组件超类
var WafFormComponent = WafComponent.extend({
    enable: function() {
        this.set("disable", false);
    },
    disable: function() {
        this.set("disable", true);
    }
});

//Container组件超类
var WafContainerComponent = WafComponent.extend({
    appendChildren: function(source, pos) {
        //pos并且为数字的话
        //var content = $(this.element).children("div.content");
        //$.dynamicutil.appendChildren(content, source, pos);
    },
    removeChildren: function(source) {
        //如果传递进来的是id，转换source为jquery对象
        // if (typeof source == "string") {
        //     if (source.substr(0, 1) != "#") {
        //         source = "#" + source;
        //     }
        //     source = $(source);
        // }
        // var content = $(this.element).children("div.content");
        // $.dynamicutil.removeChildren(content, source);
    }

});

//注册函数
//initRegister(WafComponent);

module.exports.WafComponent = WafComponent;
module.exports.WafFormComponent = WafFormComponent;
module.exports.WafContainerComponent = WafContainerComponent;