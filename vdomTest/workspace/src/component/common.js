var config = {
    baseUrl:"/webviews/",
    paths:{
    },
    shim: {
    },
    waitSeconds:30,
    urlArgs:function(url){
        if(url.indexOf("v=")==-1){
            if(window.pageModule && window.pageModule.pageResVersions){
                var rPath = pageModule.calcRelativePath(url);
                if(rPath.indexOf(".js")>-1 && rPath.lastIndexOf("/")>-1){
                    rPath = rPath.substring(rPath.lastIndexOf("/")+1);
                    var v = window.pageModule.pageResVersions["js_"+rPath];
                    if(v){
                        url = url + (url.indexOf('?') === -1 ? '?' : '&') + "v=" +v;
                        return url;
                    }
                }

            }
        }
        return url;
    }
};


//跨域
//定义页面的identity
window._identity_ = new Date().getTime();
var isSupportSessionStorage = window.sessionStorage!=undefined;
var _topUrlKey = "_WAF2_TOP_URL_";
//判断是否跨域
function _isCrossDomain(referrer){
    if(referrer && referrer.length>0){
        if (referrer.indexOf(location.host) < 0) { //top值不同域
			return true;
		}
    }
    return false;
}

function _searchTopUrl(key){
	//只有在同域的情况下进行查找
	if (isSupportSessionStorage) { 
        var arr = window.sessionStorage.getItem(_topUrlKey);  
        if(arr){
    		arr = JSON.parse(arr);
    	}else{
    		arr = [];
    	}      
        if(arr && arr.length>0){
            for(var i=0,len=arr.length;i<len;i++){
            	if(arr[i] && key === arr[i].timestamp){
            		return arr[i].topUrl;
            	}
            }
        }
	}	
}

function _addTopUrl(topUrl){
    if (isSupportSessionStorage) {
    	var arr = window.sessionStorage.getItem(_topUrlKey);
    	if(arr){
    		arr = JSON.parse(arr);
    	}else{
    		arr = [];
    	}
    	arr.push({
    		timestamp:window._identity_,
    		topUrl:topUrl
    	});
    	window.sessionStorage.setItem(_topUrlKey,JSON.stringify(arr));
    }	
}
function _removeTopUrl(){
	//只有在同域的情况下进行查找
	if (isSupportSessionStorage) { 
        var arr = window.sessionStorage.getItem(_topUrlKey);
        if(arr){
    		arr = JSON.parse(arr);
    	}else{
    		arr = [];
    	}
        var key = window._identity_;
        if(arr && arr.length>0){
            for(var i=0,len=arr.length;i<len;i++){
            	if(arr[i] && key === arr[i].timestamp){
            		arr.splice(i,1);
            		break;
            	}
            }
        }
        window.sessionStorage.setItem(_topUrlKey,JSON.stringify(arr));
	}	
}
if (isSupportSessionStorage) {
    var reg = /^((https|http):\/\/)?([^\/]+)\//i; 
    if(_isCrossDomain(document.referrer)){
        var v = document.referrer.match(reg);
        if(v && v.length>0){               
            _addTopUrl(v[0]);
        }
    }else{
    	//topUrl为undefine有两种情况，一种情况是第一次打开，一种情况是window.open打开    	
        var topUrl = _searchTopUrl(parent._identity_);
        if(topUrl){
        	var v = topUrl.match(reg);
        	if(v && v.length>0){               
               _addTopUrl(v[0]);
        	}        	        	
        }else{
        	var v = location.href.match(reg);
        	if(v && v.length>0){
               _addTopUrl(v[0]);
        	}         	
        }
    }    
}


//前端代码异常监控
window.onerror = function(msg,url,line,col,error){
    window.ErrorData = window.ErrorData||[];
	//没有URL
	if (msg != "Script error." && !url){
        return true;
    }
    //异步收集保存
    setTimeout(function(){
        var data = {};
       //浏览器兼容
        col = col || (window.event && window.event.errorCharacter) || 0;
        data.url = url;
        data.line = line;
        data.col = col;
		data.msg = msg;
        if (!!error && !!error.stack){
            //因为各浏览器差异，现代浏览器才会有五个参数，一般旧一点的浏览器只有三个参数
            data.msg = error.stack.toString();
        }else if (!!arguments.callee){
            //尝试通过callee拿堆栈信息
            var extInfo = [];
            var info = arguments.callee.caller, c = 3;
            while (info && (--c>0)) {
               extInfo.push(info.toString());
               if (info  === info.caller) {
                    break;
               }
               info = info.caller;
            }
            extInfo = extInfo.join(",");
            data.error = extInfo;
			window.ErrorData.push(data);
        }
        /*
			在这儿将data数据保存至数据库形成异常信息库
		*/
		if(window.console&&console.table){
			console.table(window.ErrorData);
		}else if(window.console&&console.log){
			console.log(data);
		}
    },5000);
 
    return false;//通过返回值控制信息是否在浏览器端打印
};
window.onkeypress=function(e){
        if(e.ctrlKey && e.shiftKey && e.which == 17) {
                if(window.ErrorData){waf.msgBox.showError({
                        title:"错误日志",
                        summaryMsg:JSON.stringify(window.ErrorData)});
                        console.log("Page exception："+JSON.stringify(window.ErrorData));
                }
	}	
}


var Namespace = {
    /*
     * 描述:注册命名空间
     * @param {String} fullNS 命名空间名称
     * @return 返回造建完成的命名空间
     */
    register : function(fullNS) {
        var nsArray = fullNS.split('.');
        var sEval = "";
        var sNS = "";
        for (var i = 0; i < nsArray.length; i++) {
            if (i != 0)
                sNS += ".";
            sNS += nsArray[i];
            sEval += "if (typeof(" + sNS + ") == 'undefined') " + sNS
                + " = new Object();"
        }
        if (sEval != "")
            return eval(sEval);
    }
}



var wafModule = {
    loadJs:function(url,callback){
        var doc = document,head = doc.getElementsByTagName("head")[0];
        var t = doc.createElement("script");
        t.setAttribute("type","text/javascript");
        t.setAttribute("charset","UTF-8");
        t.onreadystatechange = t.onload = t.onerror = function(){
            if(!t.readyState || t.readyState == 'loaded' || t.readyState == 'complete'){
                t.onreadystatechange = t.onload = t.onerror = null;
                t = null;
                setTimeout(function(){
                    callback.apply();
                },0);
            }
        };
        t.src = url;
        head.appendChild(t);
    },
    getContextPath:function(){
        var href=window.location.href;
        var host=window.location.host;
        var origin=document.location.origin;
        var f1=href.substring(href.indexOf(host));
        var f2=f1.substring(f1.indexOf("/"));
        var root=f2.split("/");
        return "/" + root[1];
    },
    inherit : function(subClass, superClass) {
        if(superClass==null) return ;
        var Fun = function(){};//用一个空的函数作为中间缓冲，如果直接用父类的实例作为原型，可能有潜在问题，如计算量超大等
        Fun.prototype = superClass.prototype;
        subClass.prototype = new Fun();
        subClass.prototype.constructor = subClass;

        //提供 superClass 属性，这个属性可以弱化父类子类之间的耦合
        //否则，在子类中调用父类的构造函数就需要指明父类，此时只需调用这个属性即可
        subClass.superClass = superClass.prototype;
        if(superClass.prototype.constructor == Object.prototype.constructor){
            superClass.prototype.constructor = superClass;
        }
    },
    defineClass:function(subClassName,superClass,prototype){
        var clzPath = subClassName.substr(0, subClassName.lastIndexOf('.'));
        Namespace&&clzPath&&clzPath!=""&&Namespace.register(clzPath);
        var h = prototype.hasOwnProperty("constructor"), str;

        if (h) {
            str = subClassName + "=" + prototype.constructor.toString() + ";"
        } else {
            if (superClass != null) {
                str = subClassName + "=" + superClass.prototype.constructor.toString() + ";"
            } else {
                str = subClassName + "=function(){};";
            }
        }

        var subClass = eval(str);
        wafModule.inherit(subClass, superClass);

        for (var p in prototype) {
            eval(subClassName + ".prototype." + p.toString() + "=prototype." + p.toString());
        }
    },
    isArray:function(it){
        return Object.prototype.toString.call(it) === '[object Array]';
    },
    globalMods:[],
    defineModule:function(name,deps,callback){
        //Allow for anonymous modules
        if (typeof name !== 'string') {
            //Adjust args appropriately
            callback = deps;
            deps = name;
            name = null;
        }

        //This module may not have dependencies
        if (!wafModule.isArray(deps)) {
            callback = deps;
            deps = null;
        }

        //whether using publish js.
        if(!!window.modular){
            var module = new Module(name,deps,callback);
            //do save callback coz its size maybe is too large.
            this.globalMods.push({name:name,deps:deps});
            module.make();
        }else{
            if(callback) {
                var args = [window.$||{}],index;
                if(deps.length>1){
                    for(var i=1,len=deps.length;i<len;i++){
                        if(deps[i]){
                            index = deps[i].lastIndexOf("/");
                            if(index>-1){
                                args.push(window[deps[i].substring(index+1)]);
                            }else{
                                args.push(window[deps[i]]);
                            }
                        }else{
                            args.push({});
                        }
                    }
                }
                var index = name.lastIndexOf("/"),tmp = name;
                if(index>-1){
                    tmp = tmp.substring(index+1);
                }
                //ie8下会把窗口window对象清空.因为waf.win的模块名称叫做window
                var  ret = callback.apply(this,args);
                if(tmp!="window" && tmp && ret){
                    window[tmp] = ret;
                }
            }
        }
    },
    definePage:function(name,deps,callback){
        //Allow for anonymous modules
        if (typeof name !== 'string') {
            //Adjust args appropriately
            callback = deps;
            deps = name;
            name = null;
        }

        //This module may not have dependencies
        if (!wafModule.isArray(deps)) {
            callback = deps;
            deps = null;
        }
        //whether using publish js.
        if(!!window.modular){
            if(!window.pageModule || !window.pageModule.isSelf(name)){
                //创建一个新的module，并且增加到rootModule的依赖中.
                var module = new PageModule(name,deps,callback);
                if(!window.pageModule){
                    module.setLazy(true);
                    this.globalMods.push(module);
                }else{
                    //将rootModule的依赖设置到当前Module的依赖中,他们共用相同的依赖.
                    module.setParentModule(window.pageModule);
                    //如果page页面没有定义依赖，一般是从工具上定义的依赖，需要设置父亲页面的依赖，如果定义了，则使用page页面的依赖
                    if(!module.deps){
                        module.deps = module.getParentDeps().concat(module.deps || []);
                        module.usingParentDeps = true;
                    }else{
                        //如果定义为definePage,初始必须进行初始化，如果有多个definePage，由于是异步的，没有固定顺序，因此需要加上下面的依赖。
                        if(module.getRootModule() instanceof ListPageModule){
                            module.deps.push("dynamicList");
                        }else if(module.getRootModule() instanceof EditPageModule){
                            module.deps.push("dynamicEdit");
                        }else{
                            module.deps.push("dynamicForm");
                        }
                        module.usingParentDeps = false;
                    }
                    //非静态化时，需要增加主页面元数据
                    if(window.pageModule&&!window.pageModule.isServerRender()){
                        module.deps.push(window.pageModule.metaName);
                    }
                    module.make();
                }
            }else{
                //主页面的module直接定义执行.
                window.pageModule.callback = callback;
                //handle debug name
                window.pageModule.initPageName();
                //传递自定义的依赖到具体的PageModule
                window.pageModule.make(deps);
            }
        }else{
            //非模块化时直接执行回调函数，并记录返回值到_self,兼容以前的非模块化场景.
            waf(function(){
                var ret = {},arg=[];
                arg.push(waf);
                if(window.importMods){
                    var arr = window.importMods.split(",");
                    if(arr.length>0){
                        for(var i=0,len=arr.length;i<len;i++){
                            arg.push(window[arr[i]]);
                        }
                    }
                }
                if(callback) ret = callback.apply(this,arg);
                callback = null;
                if(window.mainMod && window.mainMod!=name){
                    var index = name.lastIndexOf("/"),tmp = name;
                    if(index>-1){
                        tmp = tmp.substring(index+1);
                    }
                    if(tmp!="window" && tmp && ret){
                        window[tmp] =ret;
                    }
                }
                if(ret){
                    for(var p in ret){
                        if(ret.hasOwnProperty(p)){
                            _self[p] = ret[p];
                        }
                    }
                }
                if(window._trace) _trace("waf.EventBus.fireEvent","waf.EventBus.resolveEventHandlerMethod","_self.initalizeAction");
            })
        }
    },
    useSync:function(deps,callback){
        if(!!window.modular){
            return require(deps,callback);
        }else{
            if(callback) {
                callback.call(this);
            }else{
                if($.type.isString(deps)){
                    var index = deps.lastIndexOf("/"),tmp = deps;
                    if(index>-1){
                        tmp = tmp.substring(index+1);
                    }
                    return window[tmp];
                }
            }
        }
    },
    use:function(deps,callback){
        if(!!window.modular){
            if(typeof deps === "string"){
                deps = [deps];
            }
            return require(deps,callback);
        }else{
            if(callback) callback.call(this);
        }
    },
    config:function(config){
        //set baseUrl.
        config.baseUrl = this.getContextPath() + (config.baseUrl || "/webviews");
        //get language
        var language = window.navigator.language;
        if(window.pageModule && window.pageModule.context && window.pageModule.context.locale){
            switch(window.pageModule.context.locale){
                case "l1":
                    language = "en";
                    break;
                case "l2":
                    language = "zh-CN";
                    break;
                case "l3":
                    language = "zh_TW";
                    break;
            }
        }
        if(config.paths){
            var tmp;
            for(var prop in config.paths){
                tmp = config.paths[prop];
                if(tmp.indexOf("${i18n}")>-1){
                    tmp = tmp.replace("${i18n}",language);
                    config.paths[prop] = tmp;
                }
            }
        }
        requirejs.config(config);
    }
};

wafModule.defineClass("Module",null,{
    constructor:function(name,deps,callback){
        this.name = name;
        this.deps = deps;
        this.callback = callback;
        this.baseUrl = window.require.s.contexts._.config.baseUrl||"";
        this.lazy = false;
        this.parentModule = null;
    },
    run:function(){
        //init global modules if exists
        var globalModules=wafModule.globalMods;
        if(globalModules!=null && globalModules.length>0){
            for(var i= 0,len=globalModules.length;i<len;i++){
                if(!!globalModules[i].lazy){
                    if(!this.isSelf(globalModules[i].name)) {
                        globalModules[i].setParentModule(window.pageModule);
                        globalModules[i].deps = globalModules[i].getParentDeps();
                        window.pageModule.addChild(globalModules[i]);
                        globalModules[i].make();
                    }else{
                        this.callback = globalModules[i].callback;
                        this.make();
                    }
                }
            }
            //wafModule.globalMods = [];
        }
        //主页面的执行
        require([this.name],function(init){
            init();
        })
    },
    make:function(){
        //计算所有的依赖项目
        var deps = this.getAllDeps() || [],self=this;
        _startMod("loadModule_"+this.name);
        define(this.name,deps,function(){
            if(self.callback){
                var ret = self.callback.apply(this,arguments);
                _endMod("loadModule_"+self.name);
                return ret;
            }
        });
    },
    getAllDeps:function(){
        var deps = [];
        for(var i=0;this.deps&&i<this.deps.length;i++){
            if(this.deps[i] instanceof Module){
                deps.push(this.deps[i].name);
            }else{
                deps.push(this.deps[i]);
            }
        }
        return deps;
    },
    setLazy:function(lazy){
        this.lazy = lazy;
    },
    getParentDeps:function(){
        //这里必须确保扩展之后的顺序正确，比如A扩展了b扩展了c. js的顺序也应该是A-B-C.
        var sd = [],tmp,deps = this.parentModule?this.parentModule.deps:[];
        for(var i=0,len=deps.length;i<len;i++){
            tmp = deps[i];
            if(tmp!=this.name){
                sd.push(tmp);
            }else{
                break;
            }
        }
        return sd;
    },
    addChild:function(module){
        this.child = this.child || [];
        this.child.push(module);
    },
    setAllPaths:function(path){
        this.allPath = path;
    },
    getAllPaths:function(){
        return this.allPath||(window._rConfig_&&window._rConfig_.paths);
    }
});

wafModule.defineClass("PageModule",Module,{
    setDynamic:function(dynamic){
        this.dynamic = dynamic;
    },
    setPageComboScripts:function(comboScripts){
        this.comboScripts = comboScripts;
    },
    setPageResVersion:function(pageResVersions){
        this.pageResVersions = pageResVersions;
    },
    setInitServerInfo:function(serverInfo){
        this.serverInfo = serverInfo;
    },
    getInitServerInfo:function(){
        return this.serverInfo;
    },
    setRenderModel:function(renderModel){
        this.renderModel = renderModel;
    },
    setLocaleStr:function(localStr){
        this.localStr = localStr;
    },
    setHeartbeatParams:function(heartbeatParams){
        this._heartbeatParams=heartbeatParams;
    },
    setPageClass:function(pageClass){
        this.pageClass = pageClass;
    },
    setMainEntry:function(main){
        this.mainEntry = true;
    },
    setPath:function(path){
        this.path = path;
    },
    setContext:function(context){
        this.context = context;
        //this.context.currentUser={id:context.currentCallID,name:context.currentUserName};
        //this.context.currentCompany={id:context.companyID,name:context.companyName};
        //this.context.currentCompanyID = context.companyID;
        //this.context.currentCompanyName = context.companyName;
    },
    setUIPk:function(uipk){
        this.uipk = uipk;
    },
    setPageTitle:function(pageTitle){
        this.pageTitle = pageTitle;
    },
    setPageInitData:function(pageInitData){
        this.pageInitData = pageInitData;
    },
    setImportScripts:function(importScripts){
        this.importScripts = importScripts;
    },
    setImportCss:function(importCss){
        this.importCss = importCss;
    },
    calcRelativePath:function(path){
        var self = this;
        var b = self.baseUrl.split("/"),a=path.split("/"),c="";
        if(a&&a.length>0&&b&&b.length>0){
            for(var i=0,len=a.length;i<len;i++){
                if(b.length>=i && a[i] == b[i]){
                    a[i]="";
                }else{
                    c+=a[i]+"/";
                }
            }
            if(c&&c.lastIndexOf("/")) c = c.substring(0,c.length-1);
            return c;
        }
    },
    initMetaName:function(){
        if(!this.isServerRender()){
            //元数据的依赖项单独定义，因为是后台自动生成的。
            if(!this.metaName){
                this.metaName = this._path+"/"+this._name+"_meta";
                this.deps.push(this.metaName);
            }else{
                this.metaName = this.calcRelativePath(this.metaName);
                this.metaName = this.metaName.indexOf(".js")>-1 ? this.metaName.substring(0,this.metaName.indexOf(".js")):this.metaName;
                this.deps.push(this.metaName);
            }
        }
    },
	initPassiveImportScript:function(){
		//初始化被动引入的js脚本，可能是父页面需要子页面加载框架的某个js
		var urlKey = "waf_import_script=",
			index = location.search.indexOf(urlKey),
			tmpStr = null,
			trimReg = /(^\s*)|(\s*$)/g,
			impScripts = null;
		if(index > 0){//location.search : ?xxx
			tmpStr = location.search.substring(index + urlKey.length,location.search.length);
			index = tmpStr.indexOf("&");
			if(index > -1){
				tmpStr = tmpStr.substring(0,index);
			}
			if(tmpStr.replace(trimReg, "") != ""){
				impScripts = tmpStr.split(",");
				for(var i = 0; i < impScripts.length; i++){
					if(impScripts[i].replace(trimReg, "") != ""){
						this.deps.push(impScripts[i]);
					}
				}
			}
		}
	},
    isServerRender:function(){
        return this.renderModel && this.renderModel === "server";
    },
    setMetaName:function(metaName){
        this.metaName = metaName;
    },
    initImportScript:function(){
        //计算ImportScript的路径，并且加入依赖项,ImportScript为工具定义的依赖项.
        var tp,importScripts=this.importScripts,tmp;
        this.importModules = [];
        if(importScripts && wafModule.isArray(importScripts)){
            for(var i=0,len=importScripts.length;i<len;i++){
                tp = this.calcRelativePath(importScripts[i]);
                if(tp){
                    tmp = tp.substring(0,tp.indexOf(".js"));
                    this.importModules.push(tmp);
                    this.deps.push(tmp);
                }
            }
        }
    },
    initPageName:function(){
        this.name = this._path+"/"+this._name;
    },
    isSelf:function(name){
        //if debug, the name is different.
        return name == this._path+"/"+this._name;
    },
    setParentModule:function(module){
        this.parentModule = module;
    },
    pageInited:function(){
        return !!jsBinder;
    },
    getRootModule:function(){
        var module = this;
        while(module!=module.parentModule){
            module = module.parentModule;
        }
        return module;
    },
    initPage:function(){
        this.parentModule&&this.parentModule.init();
    },
    init:function(){
        //初始化页面，初始化框架相关内容.
        var jsBinderClass = eval(this.pageClass);
        jsBinder = $.createObject(jsBinderClass);
        $.context = this.context;
        $.conversationProcess();
        $.setConversationID(conversationid);
        jsBinder.pageModule = this;
        if(_self){
            for(var p in _self){
                jsBinder[p] = _self[p];
            }
        }
        _self = jsBinder;
        _self.setUIPk(this.uipk);
        _self.setPageTitle(this.pageTitle);
        _self.setPageInitData(this.pageInitData);
        _self.setPageOriginMetadata(this.pageMeta);
        //this.localStr&&_self.setLocaleStr(this.localStr);
        this._heartbeatParams&&_self.setHeartbeatParams(this._heartbeatParams);
        this.renderModel&&_self.setRenderModel(this.renderModel);
        $.setDynamic(this.dynamic);
        if(_self.destroyAction){
            window.onbeforeunload = _self.destroyAction;
        }
        if (_self.initalizeEvent) {
            _self.initalizeEvent();
        }
    },
    combineArg:function(arg,module){
        //loop控制在他之后的模块都不需要加入进来，只加载之前的模块.
        var ret = [],loop=true;
        ret = Array.prototype.slice.call(arg);
        if(module.importModules&&module.importModules.length>0){
            for(var i=0,len=module.importModules.length;loop&&i<len;i++){
                if(this.name!=module.importModules[i]){
                    ret.push(mod.useSync(module.importModules[i]));
                }else{
                    loop = false;
                }
            }
        }
        return ret;
    },
    make:function(callback){
        var deps = this.getAllDeps() || [],self=this;
        _startMod("loadPage_"+self.name);
        define(self.name,deps,function(){
            //所有PageModule的定义都会调用这里的回调函数，当前的PageModule可能是当前主页面的，也可能是继承或者扩展或者复制别的PageModule页面。
            //初始化框架内容，框架内容只会被初始化一次，初始化时需要找到主页面进行初始化.初始化内容主要是创建_self,初始化相关参数，事件等。
            if(!self.pageInited()){
                if(arguments[0] && arguments[0].toString().indexOf("jQuery")){
                    window.waf = window.$ = arguments[0];
                }else{
                    var $ = require("jquery");
                    window.waf = window.$ = arguments[0];
                }
                var rootModule = self.getRootModule();
                if(!rootModule.isServerRender()){
                    rootModule.pageMeta = require(rootModule.metaName);
                }
                rootModule.initPage();
            }
            self.executed = true;
            if(!!self.mainEntry){
                //主页面的执行，这里指的是他的所有依赖项都加载完成之后，才会执行到这里，这里的代码一定是最后才执行的。
                if(self.child){
                    for(var i=0,len=self.child.length;i<len;i++){
                        if(!!!self.child[i].executed){
                            self.child[i].callback&&self.child[i].callback.apply(window,arguments);
                            self.child[i].executed=true;
                        }
                    }
                }
                return function(){
                    waf(function () {
                        //构造需要的回调函数执行时需要的参数.
                        var ret = {},args = self.combineArg(arguments,self);
                        if (_self != null) {
                            //initalizeDOM必须放到DOM加载之后执行
                            if (_self.initalizeDOM) {
                                _self.initalizeDOM();
                            }
                            //执行主页面的回调函数.
                            if(typeof self.callback == "function") ret = self.callback.apply(window,args);
                            //register all method to _self.
                            self.regisiterToSelf(ret);
                            _trace("waf.EventBus.fireEvent","waf.EventBus.resolveEventHandlerMethod");
                            if (_self.initalizeAction) {
                                _self.initalizeAction();
                            }
                        }
                        _endMod("loadPage_"+self.name);
                        self = null;
                        if(window.wPerf){
                            window.wPerf.endTime = new Date().getTime();
                        }
                        return ret;
                    });
                }
            }else{
                //被依赖页面的JS代码的执行，执行时需要从RootModule中找到所有的依赖项，作为参数列表，然后执行回调函数作为返回值.
                //他的返回值作为别的RootModule的参数使用.
                if(self.callback){
                    var module = self.getRootModule(),ret;
                    //如果有多个definePage，并且某个definepage不是通过工具生成的，比如ca，此时只能使用自己的参数，不能使用全局性的参数.
                    if(self.usingParentDeps){
                        ret = self.combineArg([arguments[0]],module);
                    }else{
                        ret = arguments;
                    }
                    ret =  self.callback.apply(window,ret);
					//如果不放开，父类页面定义的方法在子页面中无法访问到。
                    self.regisiterToSelf(ret);
                    _endMod("loadPage_"+self.name);
                    return ret;
                }
                self = null;
            }
        });
    },
    regisiterToSelf:function(ret){
        for(var p in ret){
            if(ret.hasOwnProperty(p)){
                _self[p] = ret[p];
            }
        }
    },
    run:function(debug){
        this.debug = debug;
        //配置require js,paths参数和shim参数由所有配置读取。
        config.paths = window._rConfig_&&window._rConfig_.paths;
        config.shim = window._rConfig_&&window._rConfig_.shim;
        wafModule.config(config);
        this.baseUrl = config.baseUrl;
        //save original name
        this._name = this.name;
        this._path = this.calcRelativePath(this.path);


        this.initPageName();
        this.initImportScript();
		this.initPassiveImportScript();
        this.initMetaName();
        this.setParentModule(this);

         
		var self = this;
        if(!debug && this.comboScripts && this.comboScripts.length>0){
            mod.loadJs(this.comboScripts,function(){
                Module.prototype.run.call(self);
            })
        }else{
            Module.prototype.run.call(this);
        }
        window._rConfig_ = undefined;
    }
});


wafModule.defineClass("ListPageModule",PageModule,{
    setEditUrl:function(editUrl){
        this.editUrl = editUrl;
    },
    setViewUrl:function(viewUrl){
        this.viewUrl = viewUrl;
    },
    init:function(){
        PageModule.prototype.init.call(this);
        _self.setEditUrl(this.editUrl);
        _self.setViewUrl(this.viewUrl);
    }
});

wafModule.defineClass("EditPageModule",PageModule,{
    setEditUrl:function(editUrl){
        this.editUrl = editUrl;
    },
    setViewUrl:function(viewUrl){
        this.viewUrl = viewUrl;
    },
    setOperateState:function(operateState){
        this.operateState = operateState;
    },
    setCurrentModel:function(currentModel){
        this.currentModel = currentModel;
    },
    init:function(){
        PageModule.prototype.init.call(this);
        _self.setEditUrl&&_self.setEditUrl(this.editUrl);
        this.currentModel&&_self.setCurrentModel(this.currentModel);
        _self.operateState = this.operateState;
    }
});

wafModule.defineClass("StaticPageModule",PageModule,{
    make:function(custDeps){
        //TODO: StaticPageModule & DynamicPageModule都可以接受自定义的依赖
        //目前来看，DynamicPageModule中的deps是无用的
        var deps = this.getAllDeps() || [],self=this;
        if(custDeps && deps instanceof Array){
            deps = deps.concat(custDeps);
        }
        _startMod("loadPage_"+self.name);
        define(self.name,deps,function(){
            return function(){
                waf(function () {
                    //构造需要的回调函数执行时需要的参数.
                    var ret = {},args = self.combineArg(arguments,self);
                    if (_self != null) {
                        //执行主页面的回调函数.
                        if(typeof self.callback == "function") self.callback.apply(window,args);
                        if(arguments[0] && arguments[0].toString().indexOf("jQuery")){
		                    window.waf = window.$ = arguments[0];
		                }else{
		                    var $ = require("jquery");
		                    window.waf = window.$ = arguments[0];
		                }
		                var rootModule = self.getRootModule();
		                rootModule.initPage();
                    }
                    _endMod("loadPage_"+self.name);
                    self = null;
                    if(window.wPerf){
                        window.wPerf.endTime = new Date().getTime();
                    }
                    return ret;
                });
            }
        });
    },
    run:function(debug){
        this.debug = debug;
        //配置require js,paths参数和shim参数由所有配置读取。
        config.paths = window._rConfig_&&window._rConfig_.paths;
        config.shim = window._rConfig_&&window._rConfig_.shim;
        wafModule.config(config);
        this.baseUrl = config.baseUrl;
        //save original name
        this._name = this.name;
        this._path = this.calcRelativePath(this.path);


        this.initPageName();
        this.initImportScript();
        this.setParentModule(this);

		var self = this;
        if(!debug && this.comboScripts && this.comboScripts.length>0){
            mod.loadJs(this.comboScripts,function(){
                Module.prototype.run.call(self);
            })
        }else{
            Module.prototype.run.call(this);
        }
        window._rConfig_ = undefined;
    },
    init:function(){
        //初始化页面
        var jsBinderClass = eval(this.pageClass);
        jsBinder = $.createObject(jsBinderClass);
        jsBinder.pageModule = this;

        if(_self){
            for(var p in _self){
                jsBinder[p] = _self[p];
            }
        }
        _self = jsBinder;

        if(_self!=null) {
            if(this.initScriptCallBack){
                this.initScriptCallBack.call(_self);
            }
            if(_self.initalizeDOM){_self.initalizeDOM();}
            if(_self.initalizeEvent){_self.initalizeEvent();}
            if(_self.initalizeAction){_self.initalizeAction();}
            $("#mainContent").css("visibility","visible");
        }
        if(_self.destroyAction){
            window.onbeforeunload = _self.destroyAction;
        }
        
        //统一注册resize函数，避免ie8下的频繁计算。
        $(window).unbind("resize");
        $(window).resize(function(){
            $.ieHack.resize();
        });
        if(waf.enter2tab && 'view'!='') waf.enter2tab.initFocus();
        window.setTimeout(function(){$('body').trigger('afterLoadAllJS');},100);
    },
    setInitScriptCallBack:function(fn){
        this.initScriptCallBack = fn;
    }
});

wafModule.defineClass("WafPageModule",StaticPageModule,{
    init:function(){
        //初始化页面，初始化框架相关内容.
        var jsBinderClass = eval(this.pageClass);
        jsBinder = $.createObject(jsBinderClass);
        $.context = this.context;
        $.conversationProcess();
        $.setConversationID(conversationid);

        jsBinder.pageModule = this;
        if(_self){
            for(var p in _self){
                jsBinder[p] = _self[p];
            }
        }
        _self = jsBinder;
        this.localStr&&_self.setLocaleStr(this.localStr);
        this._heartbeatParams&&_self.setHeartbeatParams(this._heartbeatParams);
        $.setDynamic(this.dynamic);

        var wafpageparams_f7_json = {hidden:true,name:"wafpageparams",id:"wafpageparams"};
		wafpageparams_f7_json.subWidgetName = 'wafPromptQuick';
		wafpageparams_f7_json.subWidgetOptions = {dataUrl:waf.getContextPath()+"/component/F7Quick.do?method=initalize"};
		wafpageparams_f7_json.value = this.pageInitData;
		waf('#wafpageparams').wafPromptBox(wafpageparams_f7_json);
		var jsonStr = {id:'breadCrumbs_crumbs'};
		waf('#breadCrumbs').breadCrumbs(jsonStr);
		waf('#msgArea').wafMsgArea({id:"msgArea"});
		
		if(_self!=null) {
			if(_self.initalizeDOM){_self.initalizeDOM();}
			if(_self.initalizeEvent){_self.initalizeEvent();}
			if(_self.initalizeAction){_self.initalizeAction();}
		}
		if(_self.destroyAction){
            window.onbeforeunload = _self.destroyAction;
        }
		
        //统一注册resize函数，避免ie8下的频繁计算。
        $(window).unbind("resize");
        $(window).resize(function(){
            $.ieHack.resize();
        });
        if(waf.enter2tab && 'view'!='') waf.enter2tab.initFocus();
        window.setTimeout(function(){$('body').trigger('afterLoadAllJS');},100);
    }
});

wafModule.defineClass("ErrorPageModule",StaticPageModule,{
    init:function(){
        //初始化页面，初始化框架相关内容.
        var jsBinderClass = eval(this.pageClass);
        jsBinder = $.createObject(jsBinderClass);
        $.context = this.context;
        $.conversationProcess();
        $.setConversationID(conversationid);

        jsBinder.pageModule = this;
        if(_self){
            for(var p in _self){
                jsBinder[p] = _self[p];
            }
        }
        _self = jsBinder;
        this.localStr&&_self.setLocaleStr(this.localStr);
        this._heartbeatParams&&_self.setHeartbeatParams(this._heartbeatParams);
        $.setDynamic(this.dynamic);

        waf('#columnPanel2').data('_OPTIONS_',{id:"columnPanel2",lazyCreate:"true",layout:"column",tagClass:" errorContainer"});
		waf('#cellCenter').data('_OPTIONS_',{id:"cellCenter",lazyCreate:"true",tagClass:" errorMsg"});
		if (this.pageInitData.type=="Biz")
			waf('#img').wafImg({id:"img",tagClass:"sorryImg",src:"/webviews/webframework/styles/pages/standard/skin/easbase/images/bizerror.png",type:"string"});
		else
			waf('#img').wafImg({id:"img",tagClass:"sorryImg",src:"/webviews/webframework/styles/pages/standard/skin/easbase/images/errorSorry.jpg",type:"string"});
		waf('#columnPanel2').data('_OPTIONS_',{});
		var msg_json = {hidden:true}, msg_onchange = msg_json.onchange;
		msg_json.value = this.pageInitData.message;
		waf('#msg').wafText(msg_json);
		var detail_json = {hidden:true}, detail_onchange = detail_json.onchange;
		detail_json.value = this.pageInitData.detail;
		waf('#detail').wafText(detail_json);
		
		if(_self!=null) {
			if(_self.initalizeDOM){_self.initalizeDOM();}
			if(_self.initalizeEvent){_self.initalizeEvent();}
			if(_self.initalizeAction){_self.initalizeAction();}
		}
		if(_self.destroyAction){
            window.onbeforeunload = _self.destroyAction;
        }
		
        //统一注册resize函数，避免ie8下的频繁计算。
        $(window).unbind("resize");
        $(window).resize(function(){
            $.ieHack.resize();
        });
        if(waf.enter2tab && 'view'!='') waf.enter2tab.initFocus();
        window.setTimeout(function(){$('body').trigger('afterLoadAllJS');},100);
    }
});

var mod = wafModule,
    _trace = (window.wPerf && window.wPerf.plugins.actions.traceFn) || function(){},
    _startMod = (window.wPerf && window.wPerf.utils.startMod) || function(){},
    _endMod = (window.wPerf && window.wPerf.utils.endMod) || function(){},
    _start = (window.wPerf && window.wPerf.start)|| function(){},
    _end = (window.wPerf && window.wPerf.end) || function(){};


