var core = require('../../core/index');
var waf = core.waf;
var Component = core.Component;
var h = core.h;
var _ = core._;

var CTRLROLE = "linkButton",
    MAINCLASS = ".ui-linkbutton";


/**hasClass,closest,delegant,extend**/
function innerClick(event) {
    var target = event.target;
    //TODO:jQuery方法的替换
    var lb = waf(target).closest(".ui-linkbutton")[0];
    var id = lb.id;
    //TODO:绑定的对象,instance本质上可以为Page对象，也可以是linkButton对象,这里为linkButton对象
    //这里可以做改进，dom所绑定的对象可以直接指向Page对象,没有必要每个linkButton等控件都必须有对应的绑定对象
    var options = lb.inst ? lb.inst.options : waf.dom.buildOptionsByDom(lb);
    if (!options.disable) {
        if (options.onclick) {
            waf.fnUtils.invokeFun(options.onclick);
        } else if (options.actionBinding || options.actionbinding) {
            //TODO:这里不应该这样处理，应该在buildOption中就已经做了处理。
            waf.fnUtils.invokeAction(options.actionBinding || options.actionbinding);
        }
    }
}

function LinkButton(options) {
    var attrs = {
        "id": options.id,
        "ctrlrole": CTRLROLE,
        "tabindex": options.tabindex ? options.tabindex : 0
    };
    if (options.onclick) {
        attrs.onclick1 = options.onclick;
    }
    if (options.actionBinding) {
        attrs.actionBinding = options.actionBinding;
    }

    var cls = [];
    cls.push("ui-linkbutton btn");
    cls.push(options.disable ? "ui-lb-disabled.ui-state-disabled" : "");
    cls.push(options.tagClass ? options.tagClass : "");
    attrs.className = cls.join(" ");

    var onclick = function(event) {
        var target = event.target;
        //TODO:jQuery方法的替换
        //TODO:绑定的对象,instance本质上可以为Page对象，也可以是linkButton对象,这里为linkButton对象
        //这里可以做改进，dom所绑定的对象可以直接指向Page对象,没有必要每个linkButton等控件都必须有对应的绑定对象
        if (!options.disable) {
            if (options.onclick) {
                waf.fnUtils.invokeFun(options.onclick);
            } else if (options.actionBinding || options.actionbinding) {
                //TODO:这里不应该这样处理，应该在buildOption中就已经做了处理。
                waf.fnUtils.invokeAction(options.actionBinding || options.actionbinding);
            }
        }
    }

    return h("a", {
        props: attrs,
        on: {
            click: onclick
        }
    }, [h('span', {
            props: {
                className: ' ui-lb-icon ' + options.iconCls
            }
        }),
        h('span', {
            props: {
                className: ' ui-lb-text'
            }
        }, options.caption)
    ]);

}

LinkButton.props = {
    caption: "",
    tabindex: 0,
    onclick: null,
    actionBinding: null,
    id: null,
    tagClass: "",
    style: "",
    iconCls: null
};




var WafLinkButton = Component.extend({
    name: CTRLROLE,
    template: null,
    generateTree: _.bind(generateTreeForInferno, this),
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

function generateTreeForInferno(options) {
    //tag,className,events,children,style,attrs
    var attrs = {
        "id": options.id,
        "ctrlrole": CTRLROLE,
        "tabindex": options.tabindex ? options.tabindex : 0
    };
    if (options.onclick) {
        attrs.onclick1 = options.onclick;
    }
    if (options.actionBinding) {
        attrs.actionBinding = options.actionBinding;
    }

    var cls = [];
    cls.push("ui-linkbutton btn");
    cls.push(options.disable ? "ui-lb-disabled.ui-state-disabled" : "");
    cls.push(options.tagClass ? options.tagClass : "");
    var className = cls.join(" ");

    //TODO:这里需要优化，传递过去的直接就是分离好的attrs,events,className,style等

    // return h("a", {
    //         id: options.id,
    //         ctrlrole: CTRLROLE,
    //         tabindex: options.tabindex ? options.tabindex : 0,
    //         actionBinding:options.actionBinding,
    //         clickMethod: options.onclick,
    //         className: className,
    //         onclick: innerClick,
    //         style:options.style
    //     }, h('span', {
    //         className: ' ui-lb-icon ' + options.iconCls
    //     }),
    //     h('span', {
    //         className: ' ui-lb-text'
    //     }, options.caption))

    return {
        tag: "a",
        attrs: attrs,
        events: {
            onclick: innerClick
        },
        hooks: {
            created: function() {
                console.log("created a");
            },
            attached: function() {
                console.log("attached a");
            }
        },
        className: className,
        style: options.style,
        children: [{
            tag: "span",
            className: "ui-lb-icon " + options.iconCls,
            hooks: {
                created: function() {
                    console.log("created span.ui-icon");
                },
                attached: function() {
                    console.log("attached span.ui-icon");
                }
            }
        }, {
            tag: "span",
            className: "ui-lb-text",
            children: options.caption,
            hooks: {
                created: function() {
                    console.log("created span.text");
                },
                attached: function() {
                    console.log("attached span.text");
                }
            }
        }]
    }
}

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
waf.registerComponent("com.kingdee.bos.ctrl.web.Button", LinkButton);
module.exports = LinkButton;

//exports.generateTree = generateTree;