//模拟NEW对象具体如何操作
function ObjectFactory() {
    var obj = new Object();
    //取出第一个参数作为构造器
    var Contructor = [].shift.call(arguments);
    //构造器的原型就是对象的原型
    obj.__proto__ = Contructor.prototype;
    //执行构造器函数
    var ret = Contructor.apply(obj, arguments);
    return typeof ret === "object" ? ret : obj;
}

