var EventEmitter = require("events").EventEmitter;
var util = require("./inherits_mixins");


//Child
function Foo(){
    EventEmitter.call(this);
}

//mixins one
var observableProp = {};
Object.defineProperties(observableProp,{
    "name":{                
        get:function(){
            return this.nm;
        },
        set:function(nameVal){
            var oldVal = this.name;
            this.nm = nameVal;
            this.emit("change",oldVal,this.nm);
        },
        configurable:true,
        enumerable:true
    }
});

var mixinsTwo = {
    number:"This is number!"
}

var mixinsThree = {
    calc:function(n,m){
        return  n * m;
    }
}

//inherit from Parent
util.inheritMixins(Foo,EventEmitter,observableProp,mixinsTwo,mixinsThree);


var foo = new Foo();
foo.name = "Kevin";
console.log(foo.name);

//如果不调用newInherits，直接调用on方法会出错，因为还没有做继承。
foo.on("change",function(oldVal,newVal){
     console.log("name changed: newValue:"+newVal+" oldValue:"+oldVal);
});



foo.name = "Kevin1"; 
console.log(foo.name);
console.log(foo.number);
console.log(foo.calc(4,5));