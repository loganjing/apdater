var core = require('../../core/index');
var waf = core.waf;
var Component = core.Component;
var h = core.h;
var _ = core._;

var CTRLROLE = "linkButton",
    MAINCLASS = ".ui-linkbutton";


function bind(fn) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
    }

    return function() {
        for (var _len2 = arguments.length, args2 = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args2[_key2] = arguments[_key2];
        }

        return fn.apply(undefined, [].concat(args, args2));
    };
}

function LinkButton(options, handler) {
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



    return h("a", {
        props: attrs,
        on: {
            click: bind(handler, "click")
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

function innerClick(options,event) {
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
    options.caption = "test111";
    return options;
}



function update(option, action,e) {
    if (action == "click") {
        return innerClick(option,e);
    }
    return option;
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



//TODO:createDOM && initFun只是为了兼容之前的方式所做的处理,更好的方式应该是直接通过DOM来创建
//<linkButton id='save' tagClass='aa' caption='Save'/>
//$("<linkButton id='save' tagClass='aa' caption='Save'/>").appendTo($("body"));
//$("#save").disable();
waf.registerComponent("com.kingdee.bos.ctrl.web.Button", {
    render: LinkButton,
    update: update
});
module.exports = LinkButton;

//exports.generateTree = generateTree;