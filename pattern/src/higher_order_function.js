//函数作为参数传递
var getUserInfo = function(userId, callback) {
    if (userId == "KEVIN") {
        callback({
            number: "KEVIN",
            name: "王伟"
        });
    }
}


//函数作为返回值
var isType = function(type) {
    return function(obj) {
        return Object.prototype.toString.call(obj) == '[object ' + type + ']';
    }
}
var isNumber = isType("Number");
var isString = isType("String");
var isArray = isType("Array");

//类型判断的另外一种写法
var Type = {};
for (var i = 0, types = ['Number', 'String', 'Array']; i < types.length; i++) {
    (function(type) {
        Type["is" + type] = function(obj) {
            return Object.prototype.toString.call(obj) == '[object ' + type + ']';
        }
    })(types[i]);
}

//单例模式
var getSingleton = function(fn) {
    var v;
    return function() {
        return v || (v = fn.apply(this, arguments));
    }
}

//AOP(before&after)
Function.prototype.before = function(fn) {
    var __self = this; //保留原函数的引用
    return function() {
        fn.apply(this, arguments);
        return __self.apply(this, arguments);
    }
}

Function.prototype.after = function(fn) {
    var __self = this; //保留原函数的引用
    return function() {
        var ret = __self.apply(this, arguments);
        fn.apply(this, arguments);
        return ret;
    }
}