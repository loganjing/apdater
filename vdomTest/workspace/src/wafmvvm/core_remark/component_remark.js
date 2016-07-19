function Component(options){
	this._init(options);
}

// VUE增加对象方法
initMix(); //add prototy method;
mixState(); //set,get,addWatch,btnSave.set();btn.get;waf.set,waf.get. add prototy method;
mixEvents(); //on,off,once,fire
mixLifeCycle();//mount,update,updateFromParent,destroy,
mixRender();//nextTick,render,renderElementWithChildren,renderElement,renderText,renderStatic,renderString

//VUE增加静态方法,当模块JS运行的时候，自动的merge原型对象和全局性对象
//对于某个模块也是一样的，比如waf.grid,给予他扩展静态方法，而所有的这些方法都可以做代理或者插入点控制。
//如果这样的话，config是否也可以采取同样的策略？多语言文件资源呢？混入呢？
//这种方式可以向所有的VUE,VUE.prototy扩展方法，配置属性等。包括混入，插件等都可以。
//这种结构性的东西非常重要,混入，插件等可以只对某些模块起作用。比如，对于所有的F7增加本地历史的功能。
initGlobalAPI(VUE);
//include: util,config,set,get,extend,class inheritance,
//资源的注册方法，assetTypes,否则只是定义.
//服务器端返回的内容放到注册混入到一个单独的模块。可以直接通过VUE变量获取。

//Web模块的处理,Web模块的单独处理。
//install platform specific utils
//install platform runtime directives
//install platform patch function
//install plugins: 插件可以对某个部分起作用。全局性plugin或者局部性的plugin.
//

//对于表格来说，表格的格式化可以注册某列的内容。core

//jQuery对象和组件实例之间的转换，给予一个普通的jQuery对象，也能将其转成我们的组件实例对象，从而享有标准组件
//才有的一些方法，比如转成容器组件，转成form组件，因此要定义好各个组件的能力。