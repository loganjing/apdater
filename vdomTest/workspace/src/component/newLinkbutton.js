

function init(options){
    //判断是否存在，如果存在，返回waf.vmodels[options.id]
    //modelFactory返回vm对象，vm对象就是组件的实例化对象。
    //options
    //主要处理getter,setter,同时混入一些方法
}

//
var Component = function(elem,options) {
    this.options = options;
    elem.inited = true;
    this.elem = elem;
    this.init();
    //初始化一些prototype的方法
    elem.instance = this;
}

Component.prototype.init = function(){

}

//EventBus:on,off,fire
//option
//disable,enable,hide,show
//watch,unWatch


//兼容
Component.prototype.wafLinkButton = function() {

}

var _self = {};
_self.confirm1 = function() {
    alert("confirm");
}
_self.confirmClick = function() {
    alert("confirmClick");
}


//按钮的统一CLASS标示
var DEFAULTCLASS = ".ui-linkbutton";


(function(waf) {

    function generateTree(option) {
        var id = option.id;

        return h("a#" + id + DEFAULTCLASS + ENTER2TABCLASS + "." + option.tagClass, {
            "attributes": {
                "ctrlrole": "linkButton",
                "tabindex": option.tabindex,
                "@actionBinding": "confirm"
            }
        }, [option.caption]);
    }

    function buildOption(elem) {
        //TODO:直接从LazyOption中获取，如果获取不到，则从DOM ATTRIBUTE中获取。
        var options = {};
        var attrs = elem.attributes;
        for (var i = 0; i < attrs.length; i++) {
            options[attrs[i].name] = elem.getAttribute(attrs[i].name);
        }
        return options;
    }


    function invokeActionBindingOrBinding(actionBinding, onclick) {
        if (actionBinding) {
            requestAnimationFrame(function() {
                waf.fnUtils.invokeFun(actionBinding);
            }, 100);
        } else if (onclick) {
            var temp = o["onclick"];
            requestAnimationFrame(function() {
                waf.fnUtils.invokeFun(click);
            }, 100);
        }
    }

    function linkbutton_click(event) {
        var target = event.target;
        var lb;
        if ($(target).hasClass("ui-linkbutton")) {
            lb = $(target)[0];
        } else {
            lb = $(target).closest(".ui-linkbutton")[0];
        }
        var id = lb.id;
        var instance = lb.instance;
        if (!instance) {
            var options = buildOption(lb);
            instance = new Component(lb,options);
        }
        var o = instance.options;
        if (!o.disabled) {
            invokeActionBindingOrBinding(o.actionbinding, o.onclick);
        }
    }

    function linkbutton_keydown(event) {
        var linkbutton = event.data;
        if (event.keyCode == KEYCODE.ENTER) {
            linkbutton_click(event);
        }
    }


    Component.prototype.render = function(option, parent) {
        var newTree;
        if (!option.template) {
            newTree = generateTree(option);
        } else {
            //使用template来编译或者使用已经传递过来的函数
        }
        if (!this.elem) {
            this.vTree = newTree;
            this.elem = createElement(tree);
            parent.append(root);
            return;
        } else {
            var patches = diff(this.vTree, newTree);
            this.elem = patch(root, patches);
            this.vTree = newTree;
        }
    }

    $("body").undelegate(".ui-linkbutton", "click.lazyInit").delegate(".ui-linkbutton", "click.lazyInit", function(e) {
        linkbutton_click(e);
    });
    $("body").undelegate(".ui-linkbutton", "keydown.lazyInit").delegate(".ui-linkbutton", "keydown.lazyInit", function(e) {
        linkbutton_keydown(e);
    });

    //以前动态创建一个Button

    /**
    var option = {
        caption : "提交",
        disabled: false
    };
    var dom = $.wafLinkButton.createLinkbuttonDOM(option);
    $("#container").append(dom);
    $.wafLinkButton.initLinkbutton(option,dom);**/




    $.extend($.wafLinkButton, {
        createLinkbuttonDOM: function(opts) {
            var div = $("<div></div>");
            Component.prototype.render(opts, div);
        },
        initLinkbutton: function(opts, el) {
            new Component(el,opts);
        }
    });
    $(function() {
        if ($.registerComponent)
            $.registerComponent("linkButton", {
                createDOMFun: $.wafLinkButton.createLinkbuttonDOM,
                initFun: $.wafLinkButton.initLinkbutton,
                deleteFun: $.wafLinkButton.removeLinkbutton,
                modifyFun: $.wafLinkButton.modifyLinkbutton,
                invokeType: "wafLinkButton",
                initType: "clickInit"
            });
    });


})($);