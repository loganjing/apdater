//TODO:后续去掉对jquery的依赖
var $ = require("jquery");

function initFnInvoke(waf) {
    waf.fnUtils = waf.fnUtils || {};
    waf.fnUtils.registerFun = function(elem, eName, fn, params) {
        elem = $(elem);
        elem.unbind(eName).bind(eName, function(e) {
            waf.fnUtils.invokeFun(fn, elem, [e, params]);
        })
    }
    waf.fnUtils.parseFun = function(fn) {
        if (fn) {
            if ($.isFunction(fn)) {
                return fn;
            } else if (typeof fn == "string") {
                if (!fn.length) return null;
                //var levels = fn.split("."), nsobj = window;
                //以前业务代码就有不加_self的，默认加上后业务代码找不到方法出错，ci失败
                var levels = fn.split("."),
                    hasSelf = fn.indexOf("_self"),
                    nsobj;
                if (hasSelf > -1) {
                    nsobj = window;
                } else {
                    //兼容旧版本直接注册在window命名空间下的对象
                    nsobj = window[levels[0]] ? window : (window._self ? window._self : window);
                }
                //nsobj = hasSelf==-1?(window._self?window._self:window):window;                    
                for (var i = 0, len = levels.length; nsobj && i < len; ++i) {
                    nsobj = nsobj[levels[i]];
                }
                return nsobj;
            } else {
                return fn;
            }
        } else {
            return null;
        }
    }
    waf.fnUtils.invokeFun = function(fn, target, args) {
        if (!target) target = this;
        args = args || [];
        fn = waf.fnUtils.parseFun(fn);
        try {
            if (fn) {
                return fn.apply(target, args);
            }
        } catch (e) {
            console.log("Page exception：" + e.message);
            console.log(" Error Js：" + e.stack.split("at")[1]);
            throw e.message + "  Error Js：" + e.stack.split("at")[1];
        }
    },
    waf.fnUtils.invokeAction = function(fn, target, args) {
        waf.fnUtils.invokeFun(fn, target, args);
    }
}

module.exports = initFnInvoke;