//特权方法&对象
function A(){
	var count = 0;
	this.aa = "aa";
	this.method = function(){
		return count;
	}
	this.obj = {};
}

A.prototype = {
	aa:"aa",
	method :function(){}
}

var a = new A();
var b = new A();
console.log(a.aa == b.aa); //true
console.log(a.method == b.method); //false
console.log(a.obj == b.obj); //false

delete a.method;
delete b.method;
console.log(a.method == b.method); //true

//类方法
A.baba = function(){consloe.log(1);}
try{
	a.baba();
}catch(e){
	console.log("error visit!");
}
var c = new A();
try{
	c.baba(); //无法访问，因为baba是类方法，不是实例方法。
}catch(e){
	console.log("error visit!");
}

//继承
function A(){}
A.prototype = {
	aaa:1
}
function B(){}
B.prototype = A.prototype;
var b = new B;
console.log(b.aaa);

A.prototype.aaa = 2;
console.log(b.aaa);
//问题就是不能将同一个对象赋给两个类，否则就是重复的了。

//B是A的子类，将父类A的原型赋值给一个函数，然后将函数的实例作为子类的原型。
//这里的原理就是实例都是独一无二的，但是指向的原型却是同一个。
function bridge(){};
bridge.prototype = A.prototype;

function B(){};
B.prototype = new bridge();

var a = new A;
var b = new B;
console.log(A.prototype == B.prototype);
//因为a的原型指向A.prototype,b的原型也是指向这个。
console.log(a.aaa == b.aaa);
A.prototype.bb = function(){
	console.log(2);
}
//父类添加的方法，子类的实例也可以共享到
console.log(a.bb == b.bb);

B.prototype.cc = function(){
	console.log(3);
}

console.log(b.cc == a.cc);
console.log(b instanceof B);
console.log(b instanceof A);

function extend(dest,src){
	for(var prop in src){
		dest[prop] = src[prop];
	}
	return dest;
}

//原型继承无法让子类继承父类的类成员与特权成员。
function inherit(init,Parent,proto){
	function Son(){
		//父类构造器执行，这样会得到父类的特权成员等
		Parent.apply(this,arguments);
		//执行自己的构造器，获取自己的特权成员
		init.apply(this,arguments);
	}
	//子类的原型是父类的桥接函数实例
	Son.prototype = Object.create(Parent.prototype,{});
    Son.prototype.toString = Parent.prototype.toString;
    Son.prototype.valueOf = Parent.prototype.valueOf;
    Son.prototype.constructor = Son;
    extend(Son.prototype,proto);
    extend(Son,Parent);
    return Son;
}


