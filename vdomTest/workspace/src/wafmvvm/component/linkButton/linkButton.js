var core = require('../../core/index');
var waf = core.waf;
var Component = core.Component;
var h = core.h;
var _ = core._;

var CTRLROLE = "linkButton",
    MAINCLASS = ".ui-linkbutton";


/*所使用的jquery方法一览*/
/**hasClass,closest,delegant,extend**/
function innerClick(event) {
    var target = event.target;
    //TODO:jQuery方法的替换
    var lb = waf(target).closest(".ui-linkbutton")[0];
    var id = lb.id;
    //TODO:绑定的对象,instance本质上可以为Page对象，也可以是linkButton对象,这里为linkButton对象
    //这里可以做改进，dom所绑定的对象可以直接指向Page对象,没有必要每个linkButton等控件都必须有对应的绑定对象
    var options = lb.inst ? lb.inst.options : waf.dom.buildOptions(lb);
    if (!options.disable) {
        if (options.onclick) {
            waf.fnUtils.invokeFun(options.onclick);
        } else if (options.actionBinding || options.actionbinding) {
            //TODO:这里不应该这样处理，应该在buildOption中就已经做了处理。
            waf.fnUtils.invokeAction(options.actionBinding || options.actionbinding);
        }
    }
}

//以代理的方式定义按钮的事件
waf("body").delegate(MAINCLASS, 'keydown', function(e) {
    if (e.keyCode == 13) {
        innerClick(e);
    }
});
waf("body").delegate(MAINCLASS, 'click', function(e) {
    innerClick(e);
});


var WafLinkButton = Component.extend({
    name: CTRLROLE,
    template: null,
    generateTree: _.bind(generateTree,this),
    disable: function() {
        this.set("disable", true);
    },
    enable: function() {
        this.set("disable", false);
    }
});
WafLinkButton.defaultOptions = {
    caption: "",
    tabindex: 0,
    onclick: null,
    actionBinding: null,
    id: null,
    tagClass: "",
    style: "",
    iconCls: null
};



//从DOM来的话，结构是由DOM定义的，这里的结构是定义在方法generateTree方法中的。
function generateTree(options) {
    var attrs = {
        "ctrlrole": CTRLROLE,
        "tabindex": options.tabindex ? options.tabindex : 0,
    };
    if (options.onclick) {
        attrs.onclick1 = options.onclick;
    }
    if (options.actionBinding) {
        attrs.actionBinding = options.actionBinding;
    }


    var cls = [];
    cls.push(MAINCLASS + ".btn");
    cls.push(options.disable ? ".ui-lb-disabled.ui-state-disabled" : "");
    cls.push(options.tagClass ? "." + options.tagClass : "");

    return h("a#" + (options.id) + " " + cls.join(""), {
        "attributes": attrs
    }, [
        options.iconCls ? h("span.ui-lb-icon.f-icon-cloud-upload") : "",
        options.caption ? h("span.ui-lb-text", [options.caption]) : ""
    ]);
}

//TODO:createDOM && initFun只是为了兼容之前的方式所做的处理,更好的方式应该是直接通过DOM来创建
//<linkButton id='save' tagClass='aa' caption='Save'/>
//$("<linkButton id='save' tagClass='aa' caption='Save'/>").appendTo($("body"));
//$("#save").disable();

module.exports = WafLinkButton;
//exports.generateTree = generateTree;