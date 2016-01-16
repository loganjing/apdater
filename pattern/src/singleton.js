//单例模式
var getSingleton = function(fn) {
    var v;
    return function() {
        return v || (v = fn.apply(this, arguments));
    }
}

