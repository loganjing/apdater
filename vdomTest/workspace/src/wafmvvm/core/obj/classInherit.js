/**
 ** https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/super
 ** 不能使用super, super是EMCSCRIPT6关键字，只能使用supr
 ** inherit from kclass
 **/
var f = 'function',
    fnTest = /xyz/.test(function() {
        xyz
    }) ? /\bsupr\b/ : /.*/,
    proto = 'prototype';

function isFn(o) {
    return typeof o === f
}

function klass(o) {
    return extend.call(isFn(o) ? o : function() {}, o, 1)
}

function wrap(k, fn, supr) {
    return function() {
        var tmp = this.supr
        this.supr = supr[proto][k]
        var undef = {}.fabricatedUndefined
        var ret = undef
        try {
            ret = fn.apply(this, arguments)
        } finally {
            this.supr = tmp
        }
        return ret
    }
}

function process(what, o, supr) {
    for (var k in o) {
        if (o.hasOwnProperty(k)) {
            what[k] = isFn(o[k]) && isFn(supr[proto][k]) && fnTest.test(o[k]) ? wrap(k, o[k], supr) : o[k]
        }
    }
}

function extend(o, fromSub) {
    // must redefine noop each time so it doesn't inherit from previous arbitrary classes
    function noop() {}
    noop[proto] = this[proto]
    var supr = this,
        prototype = new noop(),
        isFunction = isFn(o),
        _constructor = isFunction ? o : this,
        _methods = isFunction ? {} : o

    function fn() {
        if (this.initialize) this.initialize.apply(this, arguments)
        else {
            fromSub || isFunction && supr.apply(this, arguments)
            _constructor.apply(this, arguments)
        }
    }

    fn.mix = function(o) {
        process(prototype, o, supr)
        fn[proto] = prototype
        return this
    }

    fn.mix.call(fn, _methods).prototype.constructor = fn

    fn.extend = arguments.callee
    fn[proto].implement = function(o, optFn) {
        o = typeof o == 'string' ? (function() {
            var obj = {}
            obj[o] = optFn
            return obj
        }()) : o
        process(this, o, supr)
        return this
    }
    supr.afterDef && supr.afterDef.call(fn,supr,o);
    return fn;
}


//顶级命名空间
var WafObject = klass({
    initialize:function(options,elem){
        this.version = "8.3.0";
    }
});

module.exports = WafObject;