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

//一个通用的柯里化函数。部分求值，首先会接收一部分参数，函数并不会理解求值，参数被保存起来，等待真正执行的时候才执行.
//curry()函数就是返回一个新的函数，此新函数能够在传递的参数没有达到length规定的个数时，继续递归调用curry()函数，并且返回的所有新函数的参数最终能够累积连接起来，最后传递给fn函数。
//一个通用的currying
var currying = function(fn) {
    var arr = [];
    return function() {
        if (arguments.length == 0) {
            return fn.apply(this, arr);
        } else {
            arr.push(arguments[0]);
            return arguments.callee;
        }
    }
};

Function.prototype.uncurrying = function() {
    var self = this;
    return function() {
        //从参数中获取第一个对象，之后在调用arguments.
        var obj = Array.prototype.shift.call(arguments);
        self.apply(obj, arguments);
    }
}


//函数节流，对于可能频繁触发的函数的处理方式，如果正在执行，返回。
var threshold = 0;
var actualCount = 0;
var throttle = function(fn, timeout) {
    var __self = fn,
        timer, firstTime = true;
    return function() {
        threshold++;
        console.log("Invoke count:"+threshold+",actualCount:"+actualCount);
        var args = arguments,
            me = this;
        if (firstTime) {
            actualCount++;
            __self.apply(me, args);
            firstTime = false;
        }
        if (timer) {
            //表示定时器还在，还在定时的范围之内，返回
            return false;
        } else {
            timer = setTimeout(function() {
                clearTimeout(timer);
                timer = null;
                actualCount++;
                __self.apply(me, args);
            }, timeout || 500);
        }
    }
}


//分时函数,对于大数据的，分时处理。
var timeChunk = function(data, fn, num) {
    var obj, t;
    var len = data.length;
    var start = function() {
        for (var i = 0; i < Math.min(num || 1, data.length); i++) {
            var obj = data.shift();
            fn(obj);
        }
    }
    return function() {
        if (len == 0) {
            clearInterval(t);
            t = null;
        } else {
            t = setInterval(function() {
                start();
                //必须放在这里判断，否则Interaval一直运行，造成资源浪费。
                if (data.length == 0) {
                    clearInterval(t);
                    t = null;
                }
            }, 500);
        }
    }
}


//惰性加载函数
var addEvent = function(elem, type, handler) {
    if (window.addEventListener) {
        addEvent = function(elem, type, handler) {
            elem.addEventListener(type, handler);
        }
    } else if (window.attachEvent) {
        addEvent = function(elem, type, handler) {
            elem.attachEvent('on' + type, handler);
        }
    }
    addEvent(elem, type, handler);
}