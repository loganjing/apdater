var cid = 0;
//定义组件,所有定义组件的目的是为了生成对应的类，比如
//Button,Container,Panel,Form,Text.每个类都是自有对象
waf.defineComponent("Container",Component,{});
waf.defineComponent("Panel",Container,{});
waf.defineComponent("Form",Component,{});
waf.defineComponent("PromptBox",Form,{});
waf.defineComponent("Text",Form,{});
waf.defineComponent("TextArea",Form,{});
waf.defineComponent("Button",Component,{});
$.extend(waf,{
	defineComponent:function(name,super,options){
		options = options || {};
        super = super || Component;
        options = cid + 1;
        //TODO:要将生成的子类的构造函数在这里缓存下来。
        if(options._Ctor){
        	return options._Ctor;
        }
        var Sub =  function WafComponent(options){
        	this._init(options);
        }
        Sub.prototype = Object.create(Super.prototype);
        Sub.prototype.constructor = Sub;
        Sub.cid = cid++;
        Sub.options = $.extend(Sub.options,options);
        Sub.super = Super;
        Sub.mixins = [];
        waf.register("component",Sub);
        //Cache
	}
});

//如何实例化，采用new的方式
var btn1 = new Button({
	click:alert(1),
	actionBinding:"submit"
});
//不采用new的方式，类似于jquery的方式，这个应该具有较好的兼容性,
//这里存在一个问题就是，如果一个DOM上存在两个实例化对象，如何办？这里返回的是哪个实例呢？
//所以讲这个绑定到DOM上不太合适。
var btn1 = waf("#btn1");
//从DOM进行初始化
//以方法的调用的方式本身就具有动态性
btn1.enable();
btn1.disable();
btn1.show();
btn1.hide();
btn1.option("iconCls","icon-save");
btn1.on();
btn1.off();

//定义普通模块
waf.defineModule({
	//定义普通模块
	//一个普通的module只是注册一个模块而已。
	//怎么加载他依赖的模块呢？
});

//mixins注册完成的结构：
//Component.mixins={} //全局性的混入结构
//Grid.mixins={}  //表格本身的混入结构，包含全局性的混入结构
//混入的初始化有几个点：1. JS文件加载的时候。2. 真正实例化的时候. 
//1. JS文件加载的时候初始化，是对整个类增加mixins
//2. 实例化的时候，是给某个实例增加mixins,大部分应该是后者。
//定义mixins
waf.defineMixin({
	name:"autoComplete",
	options:{
		ds:null,
		delay:300,
		item:null
	},
	//做mixins的使用与注册校验
	_use:function(inst){
		//只能应用于form类控件,只能用于文本框控件
		return inst.ctrlRole == "text";
	}
});

waf.defineMixin({
	namespace:[PromptBox,Grid],
	name:"history",
	options:{
		ds:null,
		delay:300,
		item:null
	},
	//做mixins的使用与注册校验
	_use:function(inst){
		//只能应用于form类控件,只能用于文本框控件
		return inst.ctrlRole == "text";
	}
});
//对于表格增加formatter
Grid.addFormat(["column"],numberFormat); //对表格类增加format，所有实例均可以用。
grid.addFormat(["column"],numberFormat); //仅对当前的表格实例起作用。

//定义plugins
waf.definePlugins({
	//做plugins的校验等
	name:"gridGroupHeader",
	namespace:[Grid],
	option:{
	},
	_use:function(){
	}
});

//定义Page
waf.definePage(name,[deps],{
});

//监听组件的属性的变更记录，有外部属性，也有内部属性，属性与DOM的绑定。如果动态更新方法，如何更新属性的变化呢？
//存在动态的内部属性，也存在动态的外部属性，所有的这些属性可以作为状态来进行处理。
//<waf-datepicker></waf-datepicker>
//如果使用原生的HTML,则使用v-<propName>的形式。

//如何动态创建呢?
//将template返回，并处理静态属性。这个相当于以前的createDOM, 在init方法中进行mount处理。


