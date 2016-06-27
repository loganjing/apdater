mod.defineModule("waf",['base','map','waf_i18n','util_i18n'],function(){ 
;
;
/**
 * 拷贝所有的wafModule内容到waf上
 */
window.waf = $;
/**
* 描述：WAF命名空间构造器
* @author JASON LIU
* @class 用来构建js 对象的命名空间
* @constructor
* @return 返回构造完成的命名空间(JS对象)
*/
var Namespace = {
	/*
	 * 描述:注册命名空间
	 * @param {String} fullNS 命名空间名称
	 * @return 返回造建完成的命名空间
	 */
	register : function(ns) {
        if (!ns || !ns.length) {
            return null;
        }
        var levels = ns.split(".");
        var nsobj = window;
        //Default namespace is Window.
        for (var i= 0,len=levels.length; i<len; ++i) {
            //如果当前命名空间下不存在，则新建一个关联数组。
            nsobj[levels[i]] = nsobj[levels[i]] || {};
            nsobj = nsobj[levels[i]];
        }
        //返回所申请命名空间的一个引用；
        return nsobj;
	}
};

/**
* 描述：获取js function对象的名称
* @author JASON LIU
* @class 用来构建js 对象的命名空间
* @constructor
* @return 返回js function对象的名称
*/
Function.prototype.GetName = function()
{
      var fnName = this.toString(); 
      fnName = fnName.substr(0, fnName.indexOf('(')); 
      fnName = fnName.replace(/^function/, ''); 
      return fnName.replace(/(^\s+)|(\s+$)/g, '');
};

/**
* 描述：重写namedItem方法，解决IE下由于ID大小写问题导致窜行的问题。
* @author BJJLG
* @class 
* @constructor
* @return 
*/
if (window.HTMLCollection){
	HTMLCollection.prototype.namedItem = function(name){
	    var len = this.length,ret = null;
	    if(len>0){
	        for(var i=0;i<len;i++){
	            if(this[i].id && this[i].id == name){
	                ret = this[i];
	                break;
	            }
	        }
	    }
	    return ret;
	}
}

/**
* 描述：jquery ajax提交前，构建查询字符串
* @author JASON LIU
* @class 用来构建js 对象的命名空间
* @constructor
* @return 返回js function对象的名称
*/
function buildParams( prefix, obj, traditional, add ) {
	if ( jQuery.isArray( obj ) ) {
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {
				add( prefix, v );
			} else {
				buildParams( prefix + "[" + ( typeof v === "object" || jQuery.isArray(v) ? i : "" ) + "]", v, traditional, add );
			}
		});

	} else if ( !traditional && obj != null && typeof obj === "object" ) {
		for ( var name in obj ) {
			buildParams( prefix + "." + name + "", obj[ name ], traditional, add );
		}

	} else {
		add( prefix, obj );
	}
}

/**
* 描述：创建全局对象WAF,扩展自jquery
* @author JASON LIU
* @class 创建全局对象WAF
*/
var waf = $;
waf.crossDomainUtil = waf.crossDomainUtil || {}; //跨域方法
$.extend(waf.crossDomainUtil, {
    isSinglePage:function(){
        return document.referrer && document.referrer.indexOf(location.host) < 0;
    },
    isWafPortal:function () {
        //单页面运行，一般用于集成到跨域的页面中，后续我们需要修改
        if(this.isSinglePage()) return false;
        return top && top.jPortal;
    },
    getParent:function(){
        /*if(this.isSinglePage()) return window;*/
        if(this.isCrossDomain().cparent === true){
            return window;
        }
        return window.parent;
    },
    getTop:function(){
        /*if(this.isSinglePage()) return window;*/
        if(this.isCrossDomain().ctop === true){
            return window;
        }
        return window.top;
    },
    isCrossDomain:function(){
        if(waf.crossDomainUtil.ret) return waf.crossDomainUtil.ret;
		var crossDomainTop = false;
		var crossDomainParent = false;
		var browserName = navigator.userAgent.toLowerCase();
		if(!(/msie/i.test(browserName) && !/opera/.test(browserName)) && window.opener){
			//非IE open窗口方式打开属于非跨域
		}else if (window.sessionStorage) { //localStorage
			var topUrl = window._searchTopUrl? _searchTopUrl(window._identity_):undefined;
			if (topUrl) {					
				if (topUrl.indexOf(location.host) < 0) { //top值不同域
					crossDomainTop = true;
				}
				if (document.referrer && document.referrer.indexOf(location.host) < 0) {
					crossDomainParent = true;
				}
			} else { //跨域
				//crossDomainTop = true;
				//crossDomainParent = true;
			}
		}
		waf.crossDomainUtil.ret = {
			"ctop": crossDomainTop,
			"cparent": crossDomainParent
		}
		return waf.crossDomainUtil.ret;
    }
});

//如果是waf.window.open方式打开的，给body添加样式类
var crossDomain = waf.crossDomainUtil.isCrossDomain();
if(crossDomain.cparent === false && $(window.frameElement).hasClass("InWiniframe")){//跨域方式先不做处理
	$("#mainContent").addClass("in-win-iframe");
}

(function(){
	var top = waf.crossDomainUtil.getTop(),parent = waf.crossDomainUtil.getParent();

	/**
      * 描述：ajax增加error事件，如果登录失效，则调用门户的页面。
      */
	$("body").bind("ajaxError",function(jxhr,s,ret){
	   var responseText = s.responseText;
	   //先判断返回是否为登录页面，如果是登录则刷新当前业务
	   if (responseText&&(responseText.indexOf("logoutHandler()")>0||responseText.indexOf("Please&nbsplogin&nbspfirst")>0)){
			var tip = '当前用户会话已失效，请重新登录！';		
			var hasAlert = top.hasAlert;
			if(hasAlert==undefined){
				alert(tip);    
				top.hasAlert = true;
			}		
			if(top && top.jPortal){
				top.jManager.exit();    
			}else{
				window.history.go(0);
			}                        
			return;
		}
	});

	waf.extend({
			/**
			* 描述:当前页面的conversationid
			* @type {String}
			*/
		 	conversationid:null,
		 	context:null,
		 	localeResourceObj:null,
		 	
		 	/**
		 	 * 描述：页面系统提示信息框
		 	 */
		 	pageMsgAreaBox:null,
		 	
			/**
			 *描述：ajax请求超时时间
			 */
			ajaxTimeout : 600000,
			/**
			*描述：静态框架或动态框架
			*/
			dynamiced : false,
			setDynamic:function(dynamiced){
				this.dynamiced=dynamiced;
			},
			isDynamic:function(){
				return this.dynamiced;
			},
			/**
			 * 描述：设置当前页面异常提示框
			 */
			setPageMsgAreaBox:function(msgAreaBox){
				waf.pageMsgAreaBox=msgAreaBox;
			},
			/**
			 * 描述：获取当前页面异常提示框
			 */
			getPageMsgAreaBox:function(){
				return waf.pageMsgAreaBox;
			},
			/**
			 * 描述:注册命名空间,并返回
			 * @param {String} 名称空间路径
			 */
			registerNamespace : function(ns){
                Namespace.register(ns);
			},
			/**
			 * 描述：waf 的js 类继承
			 * @param {subClass} 当前类
			 * @param {superClass} 需要继承的超类
			 */
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
			/**
			 * 描述：waf 的js 类定义
			 * @param subClassName 当前类
			 * @param superClass   超类
			 * @param prototype 	     当前类体
			 * @return 返回创建好的JS类
			 */
			defineClass:function(subClassName,superClass,prototype){
				/**
                var index = subClassName.lastIndexOf('.'),
                    clzPath=subClassName.substr(0,index),
                    ns=Namespace.register(clzPath),
                    clzName = subClassName.substring(index+1);
                ns[clzName] = function(){};
				var subClass=ns[clzName];

				waf.inherit(subClass,superClass);
                if(prototype) $.extend(subClass.prototype,prototype);**/
                waf.defineCustomeClass(subClassName,superClass,prototype);
			},
            defineCustomeClass:function(subClassName, superClass, prototype){
                var index = subClassName.lastIndexOf('.'),
                    clzPath=subClassName.substr(0,index),
                    ns=Namespace.register(clzPath),
                    clzName = subClassName.substring(index+1),
                    h = prototype.hasOwnProperty("constructor"),str;

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

                waf.inherit(subClass,superClass);
                if(prototype) $.extend(subClass.prototype,prototype);
            },
			/**
			 * 描述: 创建对象
			 * @param {clazz} 创建该类的对象
			 */
			createObject:function(clazz){
				var obj=new clazz();
				if(clazz.superClass!=null){
					obj.superClass=clazz.superClass;
				}
				//对JS类中的方法 作AOP处理
				//waf.aspectClassFun(clazz,obj);
				return obj;
			},
			/**
			 * 描述:对JS类中的方法作AOP处理
			 * @param {} url
			 * @return {}
			 */
			aspectClassFun:function(clazz,object){
				var clazz_temp=clazz,str;
				while(clazz_temp!=null && clazz_temp!=undefined) {
					for(var p in clazz_temp.prototype){
						var methodName=p.toString();
						var beforeMethodFun=methodName + "_before";
						var afterMethodFun=methodName + "_after";
						var aroundMethodFun=methodName + "_replace";
						if(object[beforeMethodFun]!=null) {
							waf.aspectBefore(object,methodName,object[beforeMethodFun]);
						}
						if(object[afterMethodFun]!=null){
							waf.aspectAfter(object,methodName,object[afterMethodFun]);
						}
						if(object[aroundMethodFun]!=null){
							waf.aspectAround(object,methodName,object[aroundMethodFun]);
						}
					}
					clazz_temp=clazz_temp.superClass;
				}
			},
			/**
			 * 描述：获取URL所对应的参数数组
			 * @param {url} url 路径
			 * @return 返回URL后追加的参数数组
			 */
			getUrlParams:function(url){
			  var args=new Object();   
			  var query=location.search.substring(1);//获取查询串   
			  var pairs=query.split("&");//在逗号处断开   
			  for(var i=0;i<pairs.length;i++)   
			  {   
				  var pos=pairs[i].indexOf('=');//查找name=value   
				  if(pos==-1) continue;//如果没有找到就跳过   
				  var argname=pairs[i].substring(0,pos);//提取name   
				  var value=pairs[i].substring(pos+1);//提取value   
				  args[argname]=decodeURIComponent(value);//存为属性   
			  }
			  return args;
			},
			/**
			 * 描述:获取当前页面的conversationid
			 * @return 获取当前页面的conversationid
			 */
			getConversationID:function(){
				return waf.conversationid;
			},
			/**
			 * 描述：设置当前页面的conversationid
			 * @param value of String conversation id
			 */
			setConversationID:function(value){
				waf.conversationid=value;
			},
			/**
			 * 描述:页面重定向，不建议直接使用document.location.href或document.location.replace等进行页面跳转
			 * @param url 重定向的url地址
			 */
			redirect:function(url,caption) {
				var newUrl=url;

				var conversationID=waf.getConversationID();
				if(url.indexOf("conversationid")<0 && conversationID!=null){
					newUrl=newUrl + "&conversationid=" + conversationID;
				}

				document.location.replace(newUrl);
			},
			/**
			 * 描述:获取当前语种标识
			 */
			 getContext:function() {
			 	if(waf.context==null){
			 		waf.context={AIS:null,currentUser:null,currentCallerID:null,currentUserName:null,currentCompanyID:null,currentCompanyName:null,currentCompany:null,contextID:null,locale:null,readAIS:null,solution:null};
			 	}
			 	return waf.context;
			 },
			 /**
			  * 描述:创建上下文对象
			  */
			 createContext:function(contextID,AIS,currentCallID,currentUserName,locale,unknow,local2,readAIS,solution,companyID,companyName) {
			 	waf.getContext().contextID=contextID;
			 	waf.getContext().AIS=AIS;
			 	waf.getContext().currentCallID=currentCallID;
			 	waf.getContext().currentUserName=currentUserName;
			 	waf.getContext().currentUser={id:currentCallID,name:currentUserName};
			 	waf.getContext().currentCompanyID=companyID;
			 	waf.getContext().currentCompanyName=companyName;
			 	waf.getContext().currentCompany={id:companyID,name:companyName};
			 	waf.getContext().locale=locale;
			 	waf.getContext().readAIS=readAIS;
			 	waf.getContext().solution=solution;
			 },
			/**
			 * 描述:判断当前传递的json对象是否为多语种字段
			 */
			isMultiLangValue:function(json){
                if(!json || json == null) return false;
				if(json.l1!==undefined && json.l2!==undefined && json.l3!==undefined){
					return true;
				}
				if(json.L1!==undefined && json.L2!==undefined && json.L3!==undefined){
					return true;
				}
				return false;
			},
			/**
			 * 描述:判断当前传递的json对象是否为枚举类型
			 */
			isEnumValue:function(json){
                if(!json || json == null) return false;
				if(json.isenum!==undefined && json.alias!==undefined && json.value!==undefined){
					return true;
				}
				return false;
			},
			/**
			 * 描述:动态装载JS类库
			 * @param url js 文件 路径
			 */
			loadJSLibrary : function(url) {
				waf.getScript(url);
			},
			/**
			 * 描述：aop-通知类型-之前
			 * @param target 目标对象
			 * @param method 目标对象的类成员方法
			 * @param advice 切入逻辑
			 */
			aspectBefore:function(target,method, advice){
				waf.aop.before({target:target,method:method.toString()},advice);
			},
			/**
			 * 描述： aop-通知类型-之后
			 * @param target 目标对象
			 * @param method 目标对象的类成员方法
			 * @param advice 切入逻辑
			 */
			aspectAfter:function(target,method,advice){
				waf.aop.after({target:target,method:method.toString()},advice);
			},
			/**
			 * 描述： aop-通知类型-重写
			 * @param target 目标对象
			 * @param method 目标对象的类成员方法
			 * @param advice 切入逻辑
			 */
			aspectAround:function(target,method,advice){
				waf.aop.around({target:target,method:method.toString()},advice);
			},
			/**
			 * 描述:JS类方法调用代理
			 * @param method 方法名称
			 * @param clazz  JS类名称
			 * @param obj	 调用对象
			 */
			proxyCall:function(methodName,objectName){
			    var paramArray=[];
				if(arguments.length>2) {
					paramArray=new Array();
					for(var nIndex=2;nIndex<arguments.length;nIndex++) {
						paramArray.push(arguments[nIndex]);
					}
				}
				
				var fun=null;
				if(objectName==null){
					objectName=jsBinder||{};
				}
				if( typeof(methodName)=="object") {
					fun=methodName;
				}
				else {
					if(typeof(objectName)=="object"){
						if (!waf.isDynamic()){
                        	fun=objectName[methodName];
                        }
                        else{ 
                        	fun=objectName["fireEvent"];
                        	fun&&fun.apply(jsBinder,[methodName+"Event"].concat(paramArray));
							return;						
                        }                        
					}
				}
				
				
				fun&&fun.apply(jsBinder,paramArray);
			},
			/**
			 * 描述：用于ajax回调中对界面组件的更新
			 * @param uiItems 界面组件集合
			 */
			updateAjaxUIComponent:function(uiItems) {
				try{
					for (var index in uiItems) {
						var uiItem=uiItems[index],cmpType,cmpID,cmpStatus,properties,events,pIndex,com;
						cmpType=uiItem.componentType;
						cmpID=uiItem.componentID;
                        com = waf("#"+cmpID);
						cmpStatus=uiItem.status;
						if(cmpStatus=="update"){
							//属性赋值
							properties=uiItem.properties;
							for(pIndex in properties){
								var property=properties[pIndex];
								if(typeof(property.value)=="string") {
                                    $.wafutil.invokeMethod(com,cmpType,"option",property.property,""+property.value);
								}
								else {
                                    $.wafutil.invokeMethod(com,cmpType,"option",property.property,property.value);
								}
							}

							//注册事件
							events=uiItem.events;
							for(pIndex in events){
								var event=events[pIndex];
								if(typeof(event.value)=="string") {
                                    $.wafutil.invokeMethod(com,cmpType,"option",event.event,""+event.value);
								}
								else {
                                    $.wafutil.invokeMethod(com,cmpType,"option",event.event,event.value);
								}
							}
						}
					}
				}
				catch(exception){
					alert(exception);
				} 
			},
			/**
			 * 描述：用于ajax回调中对普通脚本的更新
			 */
			executeAjaxScript:function(wafScript){
				if(wafScript.scriptType=="javascript"){
					eval(wafScript.script);
				}
			},
			/**
			 * 描述：调用服务
			 * @param {} option
			 * @return {}
			 */
			invokeService:function(options) {
				if (!waf.isDynamic()){
					options.url=waf.getContextPath() + "/service.do?method=invokeService";
					options.data={service:options.service,serviceMethod:options.serviceMethod,parameters:waf.toJSONString(options.parameters)};
					var urlParam=waf.getUrlParams();
					if(urlParam.mock=="true") {
						if(options.mockdata!=null) {
							options.success(eval("_self.mockdata." + options.mockdata));
							return null;
						}
					}				
					waf.doPost(options);
				}
				else{
					var serviceOptions=options;
					serviceOptions.event="invokeService";
					serviceOptions.data={domain:options.domain,version:options.version,service:options.service,serviceMethod:options.serviceMethod,parameters:waf.toJSONString(options.parameters)};
					waf.doPost(serviceOptions);
				}
			},
			/**
			 * 描述： 用于普通ajax提交 post方式
			 * @param option ajax提交的参数option对象
			 */
			doPost : function(option) {
                if(window.nodeEnv) return;
				if (waf.isDynamic()){
					waf.doPostForDynamic(option);
					return;
				}
				//拼接请求URL
				if(option.url==null){
					if(option.param!=null) {
						option.url="?method=" + option.action + "&" + option.param;
					}
					else {
						option.url="?method=" + option.action;
					}
				}
				
				//追加conversation id
				//option.url= option.url + "&conversationid=" + waf.getConversationID();

				//默认传输格式为json
				if(option.dataType==null){
					option.dataType="json"
				}
				
				//默认请求超时时间为ajaxTimeout
				if(option.timeout==null) {
					option.timeout=this.ajaxTimeout;
				}

				//默认提交方式为异步方式
				if(option.async==null){
					option.async=true;
				}

				//默认阻塞界面
				if(option.showBlock==null){
					option.showBlock=true;
				}
				
				var timer=null;
				var requestOption={
					url:option.url,
					data:option.data,
					/* 默认ajax数据交互格式为json */
					dataType:option.dataType,
					type:'POST',
					async:option.async,
					timeout:option.timeout,
					beforeSend:option.beforeSend,
					success:function(obj,textStatus){
						//解锁BODY
                        if(option.showBlock==true){
                        	clearTimeout(timer);
							waf.block.hide(option.target);
						}
						if(obj==null){
							option.success&&option.success(null);
							return ;
						}
						if(obj.result=="success") {
							if(option.success!=null) {
								//更新界面状态
								if(obj.isAutoExecuteUpdateUIItem==true && (obj.uiItems!=undefined || obj.uiItems!=null)){
									waf.updateAjaxUIComponent(obj.uiItems);
								}

								//执行ajax返回的脚本
								if(obj.isAutoExecuteScript==true && (obj.script!=undefined || obj.script!=null)){
									waf.executeAjaxScript(obj.script);
								}

								//调用回调函数
								option.success(obj.data,obj.uiItems,obj.script);
							}
						}
						else if(obj.result=="error") {
							if(option.error!=null){
								option.error(obj.summary,obj.detailInfo)
							}
							else {
								waf.msgBox.showError({ 		
								        	summaryMsg:obj.summary,
                                            detailMsg:obj.detailInfo
								});
							}
						}
					},
					error:function(response, textStatus, errorThrown) {
						//解锁BODY
                        if(option.showBlock==true){
                        	clearTimeout(timer);
							waf.block.hide(option.target);
						}
						if(textStatus != "abort"){
							//todo:抛出异常处理框alert("出错了，详细如下:");
							//var nExMsgStartIdx=response.responseText.indexOf("<title>");
							//var nExMsgEndIdx=response.responseText.indexOf("</title>");
							//var strErrorSummary=response.responseText.substr(nExMsgStartIdx+7,nExMsgEndIdx-nExMsgStartIdx-7);
							
							var nExMsgStartIdx=response.responseText.indexOf("id=\"msg\" type=\"hidden\" value=");
							var nExMsgEndIdx=response.responseText.indexOf("></input>",nExMsgStartIdx+30);
							var strErrorSummary=response.responseText.substr(nExMsgStartIdx+30,nExMsgEndIdx-nExMsgStartIdx-30-1);						
							
							if(option.error!=null){
								option.error(strErrorSummary,errorThrown);
								return ;
							}
							
							if(response.responseText.indexOf("WafBizException")>=0 || response.responseText.indexOf("EASBizException")>=0){
								waf.msgBox.showError({
									summaryMsg:strErrorSummary
								});
							}
							else {
								if(response.responseText.indexOf("waf error page flag")<=0 && response.responseText.indexOf("loginForm")>0){
									response.responseText="please login first!";
								}
								
								waf.msgBox.showError({
										   title:waf.localeResourceObj.ERROR_MSGBOX_TITLE,   		
										   summaryMsg:waf.localeResourceObj.ERROR_MSGBOX_SUMMARY,				
										   detailMsg:waf.localeResourceObj.ERROR_MSGBOX_DETAILMSG 		
								});
							}
						}
					},
                    complete:function(jqXHR, textStatus){
                        if(option.complete && waf.isFunction(option.complete)){
                            option.complete.call(this, jqXHR, textStatus);
                        }
                        //解锁BODY
                        if(option.showBlock==true){
                        	clearTimeout(timer);
							waf.block.hide(option.target);
						}
                    }
				};
				
				//锁定BODY
				if(option.showBlock==true){
					timer=setTimeout(function(){
						waf.block.show({text:waf.localeResourceObj.LOADING});
					},
					500);
				}
				return waf.ajax(requestOption);
			},
			/**
			 * 描述：用于普通ajax get方式提交
			 * @param option ajax提交的参数option对象
			 */
			doGet : function(option) {
                if(window.nodeEnv) return;
				if (waf.isDynamic()){
					waf.doGetForDynamic(option);
					return;
				}
				//拼接请求URL
				if(option.url==null){
					if(option.param!=null) {
						option.url="?method=" + option.action + "&" + option.param;
					}
					else {
						option.url="?method=" + option.action;
					}
				}
				
				//追加conversation id
				//option.url= option.url + "&conversationid=" + waf.getConversationID();
				
				//默认传输格式为json
				if(option.dataType==null){
					option.dataType="json"
				}

				//默认请求超时时间为ajaxTimeout
				if(option.timeout==null) {
					option.timeout=this.ajaxTimeout;
				}

				//默认提交方式为异步方式
				if(option.async==null){
					option.async=true;
				}

				//默认阻塞界面
				if(option.showBlock==null){
					option.showBlock=true;
				}
				
				var timer=null;
				var requestOption={
					url:option.url,
                    data:option.data,
					/* 默认ajax数据交互格式为json */
					dataType:option.dataType,
					type:'get',
					timeout:option.timeout,
					async:option.async,
					beforeSend:option.beforeSend,
					success:function(obj,textStatus){
						if(obj==null){
							option.success&&option.success(null);
							return ;
						}
						//解锁BODY
                        if(option.showBlock==true){
                        	clearTimeout(timer);
							waf.block.hide(option.target);
						}
						if(obj.result=="success") {
							if(option.success!=null) {
								//更新界面状态
								if(obj.isAutoExecuteUpdateUIItem==true && (obj.uiItems!=undefined || obj.uiItems!=null)){
									waf.updateAjaxUIComponent(obj.uiItems);
								}

								//执行ajax返回的脚本
								if(obj.isAutoExecuteScript==true && (obj.script!=undefined || obj.script!=null)){
									waf.executeAjaxScript(obj.script);
								}

								//调用回调函数
								option.success(obj.data,obj.uiItems,obj.script);
							}
						}
						else if(obj.result=="error") {
							if(option.error!=null){
								option.error(obj.summary,obj.detailInfo)
							}
							else {
								waf.msgBox.showError({ 		
								        	summaryMsg:obj.summary,
                                            detailMsg:obj.detailInfo
								});
							}
						}
					},
					error:function(response, textStatus, errorThrown) {
						//解锁BODY
                        if(option.showBlock==true){
                        	clearTimeout(timer);
							waf.block.hide(option.target);
						}
						if(textStatus != "abort"){
							//todo:抛出异常处理框alert("出错了，详细如下:");
							//var nExMsgStartIdx=response.responseText.indexOf("<title>");
							//var nExMsgEndIdx=response.responseText.indexOf("</title>");
							//var strErrorSummary=response.responseText.substr(nExMsgStartIdx+7,nExMsgEndIdx-nExMsgStartIdx-7);
							
							var nExMsgStartIdx=response.responseText.indexOf("id=\"msg\" type=\"hidden\" value=");
							var nExMsgEndIdx=response.responseText.indexOf("></input>",nExMsgStartIdx+30);
							var strErrorSummary=response.responseText.substr(nExMsgStartIdx+30,nExMsgEndIdx-nExMsgStartIdx-30-1);						
							
							if(option.error!=null){
								option.error(strErrorSummary,errorThrown);
								return ;
							}
							
							if(response.responseText.indexOf("WafBizException")>=0 || response.responseText.indexOf("EASBizException")>=0){
								waf.msgBox.showError({
									summaryMsg:strErrorSummary
								});
							}
							else {
								if(response.responseText.indexOf("waf error page flag")<=0 && response.responseText.indexOf("loginForm")>0){
									response.responseText="please login first!";
								}
								waf.msgBox.showError({
										   title:waf.localeResourceObj.ERROR_MSGBOX_TITLE,   		
										   summaryMsg:waf.localeResourceObj.ERROR_MSGBOX_SUMMARY,				
										   detailMsg:waf.localeResourceObj.ERROR_MSGBOX_DETAILMSG 		
								});
							}
						}
					},
                    complete:function(jqXHR, textStatus){
                        if(option.complete && waf.isFunction(option.complete)){
                            option.complete.call(this, jqXHR, textStatus);
                        }
                        //解锁BODY
                        if(option.showBlock==true){
                        	clearTimeout(timer);
							waf.block.hide(option.target);
						}
                    }
				};
				 
				//锁定BODY
				if(option.showBlock==true){
					timer=setTimeout(function(){
						waf.block.show({text:waf.localeResourceObj.LOADING});
					},
					500);
				}
				/* 提交 */
				return waf.ajax(requestOption);
			},
			/**
			 * 描述：用于表单提交
			 * @param option ajax提交的参数option对象
			 */
			doSubmit : function(option) {
                if(window.nodeEnv) return;
				if (waf.isDynamic()){
					waf.doSubmitForDynamic(option);
					return;
				}
				//拼接请求URL
				if(option.url==null){
					if(option.param!=null) {
						option.url="?method=" + option.action + "&" + option.param;
					}
					else {
						option.url="?method=" + option.action;
					}
				}

				//追加conversation id
				//option.url= option.url + "&conversationid=" + waf.getConversationID();

				//默认传输格式为json
				if(option.dataType==null){
					option.dataType="json";
				}

				//默认请求超时时间为ajaxTimeout
				if(option.timeout==null) {
					option.timeout=this.ajaxTimeout;
				}

				//默认表单名称为form
				if(option.form==null){
					option.form="form";
				}

				//默认提交方式为异步方式
				if(option.async==null){
					option.async=true;
				}
				
				//默认阻塞界面
				if(option.showBlock==null){
					option.showBlock=true;
				}
				
				var timer=null;
				var requestOption={
					url:option.url,
					data:option.data,
					/* 默认ajax数据交互格式为json */
					dataType:option.dataType,
					type:'POST',
					async:option.async,
					timeout:option.timeout,
					beforeSend:option.beforeSend,
					success:function(obj,textStatus){
						if(obj==null){
							option.success(null);
							return ;
						}
						//解锁BODY
                        if(option.showBlock==true){
                        	clearTimeout(timer);
							waf.block.hide(option.target);
						}
						if(obj.result=="success") {
							if(option.success!=null) {
								//更新界面状态
								if(obj.isAutoExecuteUpdateUIItem==true && (obj.uiItems!=undefined || obj.uiItems!=null)){
									waf.updateAjaxUIComponent(obj.uiItems);
								}

								//执行ajax返回的脚本
								if(obj.isAutoExecuteScript==true && (obj.script!=undefined || obj.script!=null)){
									waf.executeAjaxScript(obj.script);
								}

								//调用回调函数
								option.success(obj.data,obj.uiItems,obj.script);
							}
						}
						else if(obj.result=="error") {
                            if(option.error!=null){
                                option.error(obj.summary,obj.detailInfo)
                            }
                            else {
                                waf.msgBox.showError({
                                    summaryMsg:obj.summary,
                                    detailMsg:obj.detailInfo
                                });
                            }
						}
					},
					error:function(response, textStatus, errorThrown) {
						//解锁BODY
                        if(option.showBlock==true){
                        	clearTimeout(timer);
							waf.block.hide(option.target);
						}
						if(textStatus != "abort"){
							//todo:抛出异常处理框alert("出错了，详细如下:");
							//var nExMsgStartIdx=response.responseText.indexOf("<title>");
							//var nExMsgEndIdx=response.responseText.indexOf("</title>");
							//var strErrorSummary=response.responseText.substr(nExMsgStartIdx+7,nExMsgEndIdx-nExMsgStartIdx-7);
							
							var nExMsgStartIdx=response.responseText.indexOf("id=\"msg\" type=\"hidden\" value=");
							var nExMsgEndIdx=response.responseText.indexOf("></input>",nExMsgStartIdx+30);
							var strErrorSummary=response.responseText.substr(nExMsgStartIdx+30,nExMsgEndIdx-nExMsgStartIdx-30-1);						
							
							if(option.error!=null){
								option.error(strErrorSummary,errorThrown);
								return ;
							}
							
							if(response.responseText.indexOf("WafBizException")>=0 || response.responseText.indexOf("EASBizException")>=0){
								waf.msgBox.showError({
									summaryMsg:strErrorSummary
								});
							}
							else {
								if(response.responseText.indexOf("waf error page flag")<=0 && response.responseText.indexOf("loginForm")>0){
									response.responseText="please login first!";
								}
								waf.msgBox.showError({
										   title:waf.localeResourceObj.ERROR_MSGBOX_TITLE,   		
										   summaryMsg:waf.localeResourceObj.ERROR_MSGBOX_SUMMARY,				
										   detailMsg:waf.localeResourceObj.ERROR_MSGBOX_DETAILMSG 	
								});
							}
						}
					},
                    complete:function(jqXHR, textStatus){
                        if(option.complete && waf.isFunction(option.complete)){
                            option.complete.call(this, jqXHR, textStatus);
                        }
                        //解锁BODY
                        if(option.showBlock==true){
                        	clearTimeout(timer);
							waf.block.hide(option.target);
						}
                    }
				};
				
				//锁定BODY
				if(option.showBlock==true){
					timer=setTimeout(function(){
						waf.block.show({text:waf.localeResourceObj.LOADING});
					},
					500);
				}

				/*报出提交事件 */
                $('#' + option.form).trigger("onSubmit");
				/* 提交 */
				$('#' + option.form).ajaxSubmit(requestOption);
			},
			/**
			 * 描述：对URL进行字符编码
			 * @param url url 路径
			 * @return 返回编码后的url串
			 */
			encodeURI: function(url){
				var f1=url.substring(0,url.indexOf("?"));
				if(f1=="")
					f1="?"
				var f2=url.substring(url.indexOf("?")+1);

				return encodeURI(f1) + encodeURIComponent(f2);
			},
			/**
			 * 描述: 对URL组成部门进行字符编码
			 * @param part url 组件/参数
			 * @return 返回编码后的url 组件串
			 */
			encodeURIComponent: function(part){
				var newPart=part.toString();
				newPart=waf.wafutil.replaceAll(newPart,"\\","\\\\");
				newPart=waf.wafutil.replaceAll(newPart,"\"","%22");
				newPart=waf.wafutil.replaceAll(newPart,"\'","%27");
				return encodeURIComponent(newPart);
			},
			/**
			 * 描述: 将字符串转换为JSON
			 * @param jsonStr of String 转换的jsonStr字符串
			 */
			toJSONObject : function(jsonStr){
				if(typeof jsonStr == "string"){
					var ret;
					try{
	                    ret = waf.secureEvalJSON(jsonStr);
					}catch(e){
						//兼容非标准的JSON字符串，比如"{a:1,b:2}"或者"{'a':1,'b':2}"
						eval("ret="+jsonStr);
					}
					return ret;
				}else{
					return jsonStr;
				}				
			},
			/**
			 * 描述: 将字符对象转换为字符串
			 * @param object of object 将要转换的js对象
			 * @return 返回转换后的json字符串
			 */
			toJSONString : function(object) {
				return waf.toJSON(object);
			},
			/**
			 * 描述:普通URL查询字符串转换为JSON
			 * @param tourl 待转换的url路径
			 * @return 返回转换后的JSON串 
			 */
			convertQueryStrToJson:function(tourl){
				if(!tourl)return null;
					var paramsArr=tourl.split('?')[1].split('&');    
				    var args={},argsStr=[],param,name,value;
				   	args['url']=encodeURIComponent(tourl.split('?')[0]); //首先载入url,问号"?"前面的部分
				    for(var i=0;i<paramsArr.length;i++){
					   param=paramsArr[i].split('=');
					   name=param[0],value=param[1];
					   if(name=="")name="unkown";
					   if(typeof args[name]=="undefined"){ //参数尚不存在
					    args[name]=value;
					   }else if(typeof args[name]=="string"){ //参数已经存在则保存为数组
					    args[name]=[args[name]];
					    args[name].push(value);
					   }else{ //已经是数组的
					    args[name].push(value);
					   }
				    }
				    var showArg=function(x){   //转换不同数据的显示方式
				        if(typeof(x)=="string"&&!/\d+/.test(x)) return "'"+x+"'";   //字符串
				        if(x instanceof Array) return "["+x+"]"; //数组
				        return x;   //数字
				    }
				    args.toString=function(){//组装成json格式
				        for(var i in args) argsStr.push(i+':'+showArg(args[i]));
				        return '{'+argsStr.join(',')+'}';
				    }
				    
				    return args; //以json格式返回获取的所有参数
			},
			/**
			 * 描述: conversation处理,拦载所有的http请求，追加当前页面的conversation id
			 * @return 无
			 */
			conversationProcess:function(){
					//静态更新
					waf("iframe").each(function(){
						var url=waf(this).attr("src");
						if(url!=null){
							url=waf.appendConversationToURL(url);
							waf(this).attr("src",url);
						}
					});
			},
			/**
			 * 描述:追加conversationid处理
			 * @param dom attribute对象
			 * @return 无
			 */
			appendConversationToAttr:function(attr){
				if(attr.value!=null){
					if(attr.value.indexOf("conversationid")<0){
						if(attr.value.indexOf("?")<0){
							attr.value=attr.value + "?";
						}
						attr.value = attr.value + "&conversationid=" + conversationid;
					}
				}
			},
			/**
			 * 描述:追加conversationid处理
			 * @param url url路径
			 * @return 无
			 */
			appendConversationToURL:function(url){
				if(waf.conversationid==null) 
					return url;
					
				if(url!=null){
					if(url.indexOf("conversationid")<0){
						if(url.indexOf("?")<0){
							url=url + "?";
							url=url + "conversationid=" + waf.getConversationID();
						}
						else {
							url = url + "&conversationid=" + waf.getConversationID();
						}
					}
				}
				return url;
			},
			/**
			 * 描述：获取页面根路径
			 * @return 返回页面根路径 如:http://{domain}:{port}/{当前应用实例名称}
			 */
			getContextPath:function(){
				var href=window.location.href;
				var host=window.location.host;
				var origin=document.location.origin;
				var f1=href.substring(href.indexOf(host));
				var f2=f1.substring(f1.indexOf("/"));
				var root=f2.split("/");
				return "/" + root[1];
			},
			/**
			 * 描述:打开模态窗口
			 * @param {} url
			 */
			openModalDialog:function(url,arguments,parameter) {
				url=waf.appendConversationToURL(url);
				return window.showModalDialog(url,arguments,parameter);
			},
			/** 
			 * 描述:打开浏览器窗口
			 * @return 无
			 */
			openNativeWindow:function(url,title,height,width,top,left,menubar,toolbar,scrollbars,resizable,location,status){
				//如果未人工指定上左位置,则默认为居中展现
				var param="";

				//设定默认值
				if(height==null) {
					height=600;
				} 
				param=param + "height=" + height + ",";

				if(width==null)
					width=800;
				param=param + "width=" + width + ",";

				if(top==null)
					top=(window.screen.availHeight-30-height)/2 + ","; 
				param=param + "top=" + top + ",";

				if(left==null)
					left=(window.screen.availWidth-30-width)/2 + ",";
				param=param + "left=" + left + ",";

				if(toolbar==null)
					toolbar="no";
				param=param + "toolbar=" + toolbar + ",";

				if(menubar==null)
					menubar="no";
				param=param + "menubar=" + menubar + ","

				if(scrollbars==null)
					scrollbars="no";
				param=param + "scrollbars=" + scrollbars + ",";

				if(resizable==null)
					resizable="no";
				param=param + "resizable=" + resizable + ",";

				if(location==null)
					location="no";
				param=param + "location=" + location + ",";

				if(status==null)
					status="no";
				param=param + "status=" + status + ",";
				
				//追加conversationid处理
				if(url.indexOf("conversationid")<0) {
					if(url.indexOf("?")<0) {
						url = url + "?";
					}
					url = url + "&conversationid=" + waf.getConversationID();
				}

				window.open (url, null,param);	
			},
			/*
			 * 描述：获取组件类型
			 */
			getCmpType:function(ctrlrole) {
	            if ("linkButton" === ctrlrole) {
	                return "wafLinkButton";
	            } else if ("autoComplete" === ctrlrole) {
	                return "autocomplete";
	            } else if ("checkbox" === ctrlrole) {
	                return "wafCheckbox";
	            } else if ("datePicker" === ctrlrole) {
	                return "wafDatePicker";
	            } else if ("promptBox" === ctrlrole) {
	                return "wafPromptBox";
	            } else if ("form" === ctrlrole) {
	                return "wafForm";
	            } else if ("grid" === ctrlrole || "editGrid" === ctrlrole) {
	                return "wafGrid";
	            } else if ("labelContainer" === ctrlrole) {
	                return "labelContainer";
	            } else if ("menuButton" === ctrlrole) {
	                return "wafMenuButton";
	            } else if ("menuItem" === ctrlrole) {
	                return "wafMenuItem";
	            } else if ("msgArea" === ctrlrole) {
	                return "wafMsgArea";
	            } else if ("multiLangArea" === ctrlrole) {
	                return "wafMultiLangArea";
	            } else if ("multiLangBox" === ctrlrole) {
	                return "wafMultiLangBox";
	            } else if ("numberField" === ctrlrole) {
	                return "wafNumberField";
	            } else if ("password" === ctrlrole) {
	                return "wafPassword";
	            } else if ("progressBar" === ctrlrole) {
	                return "wafProgressBar";
	            } else if ("radio" === ctrlrole) {
	                return "wafRadio";
	            } else if ("section" === ctrlrole) {
	                return "wafSection";
	            } else if ("select" === ctrlrole) {
	                return "wafSelect";
	            } else if ("text" === ctrlrole) {
	                return "wafText";
	            } else if ("textarea" === ctrlrole) {
	                return "wafTextarea";
	            } else if ("toolBar" === ctrlrole) {
	                return "wafToolBar";
	            } else if ("tree" === ctrlrole) {
	                return "wafTree";
	            } else if ("columnLayout" === ctrlrole) {
	                return "wafColumnLayout";
	            } else if ("column" === ctrlrole) {
	                return "wafColumn";
	            } else if ("radioGroup" === ctrlrole){
				    return "wafRadioGroup";
				} else if("timePicker" === ctrlrole){
                    return "wafTimePicker";
                } else if("label" === ctrlrole){
                	return "wafLabel";
                } else if("mselect" === ctrlrole){
                	return "wafMultiSelect";
                } else if("splitPanel" === ctrlrole){
                	return "wafSplitPanel";
                } else if("tabPanel" == ctrlrole){
                	return "wafTabs";
                }
	    	},
            formatNumber: function(number, precision){
                if(typeof number === "undefined" || number === null  ) return "";

                if(isNaN( parseFloat(number)) || !isFinite(number)){
                    throw new Error(number+" is not a number.");
                }

                var result = number + "";

                if(typeof precision === "undefined" || precision === null  ) return result;

                if(isNaN( parseInt(precision)) || !isFinite(precision)){
                    throw new Error(precision+" is not a number.");
                }

                precision = parseInt(precision);
                if(precision < 0){
                    precision = 0;
                }

                if(result.indexOf(".") == -1){
                    if(precision === 0) return result;
                    result += ".";
                    for(var i = 0; i < precision; i++){
                        result += "0";
                    }
                }else{
                    var arr = result.split(".");

                    var offset = precision - arr[1].length;
                    if(offset > 0){ //右侧补零
                        for(var j = 0; j < offset; j++){
                            result += "0";
                        }
                    }else{ //截断
                        result = arr[0] + (precision === 0? "" : ".");
                        for(var j = 0; j < precision; j++){
                            result += arr[1][j];
                        }
                    }

                }


                return result;
            },
            
        /**
         * 描述:是在框架页中
         */
        isInFramePage:function (curWin) {
			if (curWin){
				if(curWin.parent.jsBinder){
					return curWin.parent.jsBinder.isInFramePage;
				}
			}
			else{
				if(parent.jsBinder){
					return parent.jsBinder.isInFramePage;
				}
			}
            return false;
        }, 
        showPageOverLay:function(){
        	if(top.portal&&waf.isInFramePage()){
                    parent.$("#overlay").show().css({
                            width: $(window).width(),
                            height: $(parent.$("#breadCrumbs")).height()+10,//10px是mainContent外边框top值
                            margin:"0px 5px"
                    });
            }
            if(!top.portal&&waf.isInFramePage()){
              parent.$("#overlay").show().css({
                      width: $(window).width(),
                      height: $(parent.$("#breadCrumbs")).height()+10,//10px是mainContent外边框top值
                      margin:"0px 39px"
              });
            }
        },
        hidePageOverLay:function(){
        	if(waf.isInFramePage()){
                  parent.$("#overlay").hide();
            }
        }, 
        /**
         * 描述:动态新增wafpage中的iframe
         */
        addPageTab:function (options) {
            if(parent.jsBinder){
                parent.jsBinder.addPageTab(options);
                return;
            }
        },
        /**
         * 描述:动态删除wafpage中的iframe
         */
        removePageTab:function (tabpk) {
            if(parent.jsBinder){
                parent.jsBinder.removePageTab(tabpk);
                return;
            }
        },
        /**
         * 描述:动态删除当前iframe
         */
        closeCurPageTab:function () {
            //返回按钮导致界面崩溃的原因是，closeCurPageTab方法后续还存在逻辑需要执行，而在parent.jsBinder.closeCurPageTab()已经将界面关闭掉了，所以异步执行.
            if(parent.jsBinder){
                setTimeout(function(){
                    parent.jsBinder.closeCurPageTab();
                },10);
            }
        },
        /**
         * 描述:动态修改当前iframe
         */
        updateCurPageTab:function (options) {
            if(parent.jsBinder){
                parent.jsBinder.updateCurPageTab(options);
                return;
            }
        },
        /**
         * 描述:获得iframe的数量
         */
        getFramesLength:function () {
            if(parent.jsBinder){
                return parent.jsBinder.getFramesLength();
            }
        },
        /**
         * 描述:关闭时返回值处理
         */
        returnVal:function (value) {
            if (waf.isInFramePage()) {
				parent.jsBinder.returnVal(value);
			} 
        },
        /**
		 * 描述：对object进行深度克隆
		 * @param {} object
		 */
		cloneObject:function(object){
			var strObject=waf.toJSONString(object);
			return waf.toJSONObject(strObject);
		},
		/**
		 * 描述：用于表单提交
		 * @param option ajax提交的参数option对象
		 */
		doSubmitForDynamic : function(option) {
			if(_self.getCurrentModel){
				//更新数据模型
	 			waf.dataBinder.storeField(_self.getCurrentModel());
	 			if(option.data==undefined || option.data==null){
	 				option.data=new Object();
	 			}
				option.data.model=waf.toJSONString(_self.getCurrentModel());
			}
			waf.doPostForDynamic(option);
		},
		/**
		 * 描述： 用于普通ajax提交 post方式
		 * @param option ajax提交的参数option对象
		 */
		doPostForDynamic : function(option) {
			if (option.action!=null&&option.action!="heartbeat"&&option.action!="close"&&option.action!="destroy"){
				_self._doPostOption = option;
				_self.fireEvent("beforePostEvent");
				if (_self._doPostOption){
					option = _self._doPostOption;
					_self._doPostOption=null;
				}
				if (option.cancel&&option.cancel==true){
					return;
				}
			}	
			//去除form提交方式
			option.form=undefined;
			//拼接请求URL
			if(option.url==null) {
				option.url = _self.getDynamicContextPath() + "?method=doEvent&uipk=" + _self._uipk;
				if(option.action!=null){
					option.url=option.url + "&action=" + option.action;
				}
				if(option.event!=null){
					option.url=option.url + "&event=" + option.event;
				}
				if(option.param!=null) {
					option.url=option.url +  "&" + option.param;
				}
			}
			//追加conversation id
			//option.url= option.url + "&conversationid=" + waf.getConversationID();			
			//默认传输格式为json
			if(option.dataType==null){
				option.dataType="json"
			}			
			//默认请求超时时间为ajaxTimeout
			if(option.timeout==null) {
				option.timeout=this.ajaxTimeout;
			}
			//默认提交方式为同步方式
			if(option.async==null){
				option.async=true;
			}
			//默认阻塞界面
			if(option.showBlock==null){
				option.showBlock=true;
			}
            var data = option.data || {};
            data.fromPost = true;			
			var timer=null;
			var requestOption={
				url:option.url,
				data:data,
				/* 默认ajax数据交互格式为json */
				dataType:option.dataType,
				type:'POST',
				async:option.async,
				timeout:option.timeout,
				beforeSend:option.beforeSend,
				success:function(obj,textStatus){
					if(option.showBlock&&option.async){
			            clearTimeout(timer);
			            waf.block.hide(option.target);                        
		            }
					if(obj==null){
                        option.success&&option.success(null);
						return ;
					}
					if(obj.result=="success") {
						if(option.success!=null) {
							//更新界面状态
							if(obj.isAutoExecuteUpdateUIItem==true && (obj.uiItems!=undefined || obj.uiItems!=null)){
								waf.updateAjaxUIComponent(obj.uiItems);
							}
							//执行ajax返回的脚本
							if(obj.isAutoExecuteScript==true && (obj.script!=undefined || obj.script!=null)){
								waf.executeAjaxScript(obj.script);
							}
							//调用回调函数
							option.success(obj.data,obj.uiItems,obj.script);
							if (option.afterSuccess!=null)
								option.afterSuccess(obj.data,obj.uiItems,obj.script);
						}
					}
					else if(obj.result=="error") {
						if(option.error!=null){
							option.error(obj.summary,obj.detailInfo);							
						}
						else {
							_self.showError(obj.summary,obj.detailInfo);
						}
					}
				},
				error:function(response, textStatus, errorThrown) {
					if(option.showBlock){
			            clearTimeout(timer);
			            waf.block.hide(option.target);                        
		            }
		            //先判断返回是否为登录页面，如果是登录则刷新当前业务
	                if (response.responseText.indexOf("EAS系统登录")>0||response.responseText.indexOf("logoutHandler")>0){
						//因为ajaxError的回调函数中会做处理，这里删除
						return;
	                }
					//解析返回的response中的summary与detailInfo
					var nExMsgStartIdx=response.responseText.indexOf("id=\"msg\" type=\"hidden\" value=");
					var nExMsgEndIdx=response.responseText.indexOf("></input>",nExMsgStartIdx+30);
					var strErrorSummary=response.responseText.substr(nExMsgStartIdx+30,nExMsgEndIdx-nExMsgStartIdx-30-1);						
					var nExDetailStartIdx=response.responseText.indexOf("id=\"detail\" type=\"hidden\" value=");
					var nExDetailEndIdx=response.responseText.indexOf("></input>",nExDetailStartIdx+33);
					var strErrorDetail=response.responseText.substr(nExDetailStartIdx+33,nExDetailEndIdx-nExDetailStartIdx-33-1);
					if(option.beforeError!=null){
						option.beforeError(strErrorSummary,strErrorDetail);
					}
					if(option.error!=null){
						option.error(strErrorSummary,strErrorDetail);
						return ;
					}
					//strErrorSummary = strErrorSummary || waf.localeResourceObj.ERROR_MSGBOX_SUMMARY;
					_self.showError(strErrorSummary,strErrorDetail);
				},
                complete:function(jqXHR, textStatus){
                    if(option.complete && waf.isFunction(option.complete)){
                        option.complete.call(this, jqXHR, textStatus);
                    }  
                    //增加用户行为分析
					var action;
					if(option.action!=null){
						action = option.action;
					}
					else{
						action = _self.getUrlParamsObject(option.url).action;
					}
					if (action)
						_self.sentUserBehavior(action,new Date()-beforeTime);                  
	            },
 			};
 			var beforeTime = new Date();
			//锁定BODY
			if(option.showBlock&&option.async){  
				var title = option.title;
				if (title){
					timer=setTimeout(function(){
						waf.block.show({text:title,target:option.target});
					},
					5);
				}
				else{
					timer=setTimeout(function(){
						waf.block.show({text:waf.waf.info.loading,target:option.target});
					},
					5);
				}
			}
			return waf.ajax(requestOption);
		},
		/**
		 * 描述：用于普通ajax get方式提交
		 * @param option ajax提交的参数option对象
		 */
		doGetForDynamic : function(option,type) {
			//拼接请求URL
			if(option.url==null) {
				option.url = _self.getDynamicContextPath() + "?method=doEvent&uipk=" + _self._uipk;
				if(option.action!=null){
					option.url=option.url + "&action=" + option.action;
				}
				if(option.event!=null){
					option.url=option.url + "&event=" + option.event;
				}
				if(option.param!=null) {
					option.url=option.url +  "&" + option.param;
				}
			}
			//追加conversation id
			//option.url= option.url + "&conversationid=" + waf.getConversationID();
			//默认传输格式为json
			if(option.dataType==null){
				option.dataType="json"
			}
			//默认请求超时时间为ajaxTimeout
			if(option.timeout==null) {
				option.timeout=this.ajaxTimeout;
			}
			//默认提交方式为异步方式
			if(option.async==null){
				option.async=true;
			}
			//默认阻塞界面
			if(option.showBlock==null){
				option.showBlock=true;
			}
			var timer=null;
			var requestOption={
				url:option.url,
                data:option.data,
				/* 默认ajax数据交互格式为json */
				dataType:option.dataType,
				type:'get',
				timeout:option.timeout,
				async:option.async,
				beforeSend:option.beforeSend,
				success:function(obj,textStatus){
					if(option.showBlock){
			            clearTimeout(timer);
			            waf.block.hide(option.target);                        
		            }
					if(obj==null){
						option.success&&option.success(null);
						return ;
					}
					if(obj.result=="success") {
						if(option.success!=null) {
							//更新界面状态
							if(obj.isAutoExecuteUpdateUIItem==true && (obj.uiItems!=undefined || obj.uiItems!=null)){
								waf.updateAjaxUIComponent(obj.uiItems);
							}
							//执行ajax返回的脚本
							if(obj.isAutoExecuteScript==true && (obj.script!=undefined || obj.script!=null)){
								waf.executeAjaxScript(obj.script);
							}
  							//调用回调函数
							option.success(obj.data,obj.uiItems,obj.script);
							if (option.afterSuccess!=null)
								option.afterSuccess(obj.data,obj.uiItems,obj.script);
						}
					}
					else if(obj.result=="error") {
						if(option.error!=null){
							option.error(obj.summary,obj.detailInfo);
						}
						else {
							_self.showError(obj.summary,obj.detailInfo);
						}
					}
				},
				error:function(response, textStatus, errorThrown) {
					if(option.showBlock){
			            clearTimeout(timer);
			            waf.block.hide(option.target);                        
		            }
		            //先判断返回是否为登录页面，如果是登录则刷新当前业务
	                if (response.responseText.indexOf("EAS系统登录")>0){
	                	window.history.go(0);
	                	return;
	                }
					//解析返回的response中的summary与detailInfo
					var nExMsgStartIdx=response.responseText.indexOf("id=\"msg\" type=\"hidden\" value=");
					var nExMsgEndIdx=response.responseText.indexOf("></input>",nExMsgStartIdx+30);
					var strErrorSummary=response.responseText.substr(nExMsgStartIdx+30,nExMsgEndIdx-nExMsgStartIdx-30-1);						
					var nExDetailStartIdx=response.responseText.indexOf("id=\"detail\" type=\"hidden\" value=");
					var nExDetailEndIdx=response.responseText.indexOf("></input>",nExDetailStartIdx+33);
					var strErrorDetail=response.responseText.substr(nExDetailStartIdx+33,nExDetailEndIdx-nExDetailStartIdx-33-1);
					if(option.error!=null){
						option.error(response,strErrorSummary,errorThrown);
						return ;
					}
					//strErrorSummary = strErrorSummary || waf.localeResourceObj.ERROR_MSGBOX_SUMMARY;
					_self.showError(strErrorSummary,strErrorDetail);
				},
                complete:function(jqXHR, textStatus){
                    if(option.complete && waf.isFunction(option.complete)){
                        option.complete.call(this, jqXHR, textStatus);
                    }
                }
			};			 
			//锁定BODY
			if(option.showBlock&&option.async){  
				timer=setTimeout(function(){
						waf.block.show({text:waf.waf.info.loading});
					},
					5);
			}
			return waf.ajax(requestOption);
		},
		/**
		 * 描述：获取自定义页面根地址
		 */
		getDynamicPageContextPath:function () {
        	return waf.getContextPath() + "/dynamicForm.do";
    	},
    	/**
		 * 描述：获取动态化序时薄界面根地址
		 */
		getDynamicListContextPath:function () {
	        return waf.getContextPath() + "/dynamicList.do";
	    },
	    /**
		 * 描述：获取动态化编辑界面根地址
		 */
	    getDynamicEditContextPath:function () {
	        return waf.getContextPath() + "/dynamicForm.do";
	    },
        mergeSelfAndJsBinder:function(jsBinder){
		    if(window._self){
				for(var p in _self){
					jsBinder[p] = _self[p];
				}
		    }
			return jsBinder;
		} 
	});
})();


/**
 * 描述：WAFII 组件构建器
 */
waf.defineClass("waf.GeneralComponentBuilder",null,{
    /**
     * 描述：控件类型
     */
    componentType:null,

    /**
     * 描述：数据绑定使用属性
     */
    getDataBinderProp:function(){
        return "value";
    },
    /**
     * 描述：值类型
     */
    getComponentValueType:function(){
        return "object";
    },
    /**
     * 描述：允许数据绑定
     */
    getDataBinderEnabled:function(){
        return true;
    },
    /**
     * 描述：根据元数据对属性进行特殊处理
     */
    specialProperty:function(component,parent,parentEl,operateStatus,iteratorKey){
        if(parent!=null && parent.componentType=="com.kingdee.bos.ctrl.web.LabelContainer"){
            component.parentEl=component.parentEl + "_ctrl";
        }
        return component;
    },
    /**
     * 描述：根据元数据构建组件
     */
    render:function(component,parent,parentEl,operateStatus,iteratorKey,domRender,comInit) {
        var parentComponent=waf("#" + parentEl),option = component.properties;
        //构建组件类型
        var cmpType=this.componentType;
        this.escapeSpecialCharOfObject(option);
        this.saveCtrllInitType(cmpType, component.properties);
        var dom = null;

        if(domRender){
            dom=waf.createDOM(cmpType, option);
            waf.appendDOM(parentComponent,dom);
        }

        if(comInit){
            waf.initComponent(cmpType,option,dom);
            //添加验证
            this.appendValidator(component,dom,parent,parentEl,operateStatus,iteratorKey);
        }

        //如果返回值为true,则继续循环普通子代组件元素，如果为false,则终止访问子代元素
        return true;
    },
    /**
     * 描述：是否允许迭代渲染子元素
     * @return {Boolean}
     */
    isIteratorAble:function() {
        return true;
    },
    appendValidator:function(component,component_dom,parent,parentEl,operateStatus,iteratorKey){
        if(component.properties.validator_rules==undefined || component.properties.validator_rules==null){
            return ;
        }
        var validatorProperty={};
        for(var properties in component.properties){
            if(properties.indexOf("_")>0) {
                if(properties.substr(0,properties.indexOf("_"))=="validator") {
                    hasValidator=true;
                    var key=properties.substr(properties.indexOf("_")+1);
                    var value=component.properties[properties];
                    eval("validatorProperty." + key + "=value");
                }
            }
        }

        waf.initComponent("validator",validatorProperty,component_dom);
        waf("#" + parentEl).wafLabelContainer('initRequiredMask');
    },
    /**
     * 描述：组件创建完毕（所有子代控件)事件
     */
    createComplete:function(component,parent,parentEl,operateStatus,iteratorKey){},

    /**
     * 描述：组件创建完毕事件
     */
    createAllComplete:function(component,parent,parentEl,operateStatus,iteratorKey){},

    /**
     * 描述：对JSONObject型值转换为js对象
     */
    checkJSObjectValue:function(value){
        if(value==undefined || value==null){
            return value;
        }

        var nStartPrefix=value.indexof("<jsonobject>");
        var nEndPrefix=value.indexof("</jsonobject>")-13;

        if(value.indexOf("<jsonobject>")==0 && value.indexOf("</jsonobject>")==value.length-13){
            value=value.substr(nStartPrefix,nEndPrefix);
        }

        return eval(value);
    },
    escapeSpecialCharOfObject:function(properties){
        if(properties){
            //TODO:后续尽量从后端处理
//                var regexp = /@(.*?)@/gi;
//                var jsonArr,value,o;
//                for(var p in properties){
//                    value = properties[p];
//                    if(value && $.type.isString(value)){
//                        jsonArr = value.match(regexp);
//                        if(jsonArr && $.isArray(jsonArr) && jsonArr.length>0){
//                            o=value.substring(1,value.length-1);
//                            properties[p] = $.fnUtils.parseFun(o);
//                            properties["_"+p+"_"] = o;
//                        }
//                    }
//                    if($.type.isObject(value) && !$.isFunction(value)){
//                        this.escapeSpecialCharOfObject(value);
//                    }
//                }
        }
    },
    saveCtrllInitType:function(type, option){
        var component = waf.wafPageComponentLib.get(type);
        if(option.id){
            if(component.initType=="lazyInit"){
                waf.lazyOptions[option.id] = {"type":type,"option":$.extend(true,{},option),id:option.id};
            }
            else if(component.initType=="immeInit"){
                waf.immeOptions[option.id] = {"type":type,"option":$.extend(true,{},option),id:option.id};
            }
            else if(component.initType=="clickInit"){
                waf.clickOptions[option.id] = {"type":type,"option":$.extend(true,{},option),id:option.id};
            }
            else if(component.initType=="asyncInit"){
                waf.asynOptions[option.id] = {"type":type,"option":$.extend(true,{},option),id:option.id};
            }
        }
    }
});

//兼容性增加
if(jQuery.fn.jquery && jQuery.fn.jquery=="1.6.2"){
    jQuery.fn.on = jQuery.fn.live;
    jQuery.fn.off = jQuery.fn.die;
}
/**
 * 描述：WAF动态化支持之界面组件的动态化支持
 * @author JASON LIU
 * @constructor
 */
waf.extend({
    /**
     * 描述:UI Component注册库
     */
    wafPageComponentLib:new Map(),
    wafCmpTypeLib:new Map(),
    wafInvokeTypeLib:new Map(),
    lazyOptions:{},
    immeOptions:{},
    clickOptions:{},
    asynOptions:{},
    /**
     * 描述:向组件库注册组件
     */
    registerComponent:function (type, options) {
        var component = new Object();
        component.type = type;
        component.createDOMFun = options.createDOMFun;
        component.initFun = options.initFun;
        component.deleteFun = options.deleteFun;
        component.modifyFun = options.modifyFun;
        component.clickInitFun=options.clickInitFun;
        component.initType=options.initType;
        component.initValue=options.initValue;
		component.builder =  options.builder;
		component.metaType = options.metaType; 
        //如果发现重复注册,可能是命名空间重复,也可能是重复引入,在这里作提醒
        if (waf.wafPageComponentLib.get(type) != null) {
            alert(type + "'s namespace already exists!");
        }
        //注册组件
        waf.wafPageComponentLib.put(type, component);

        //如果InvokeType存在，设置进去.
        if(options.invokeType){
            waf.wafCmpTypeLib.put(type,options.invokeType);
            waf.wafInvokeTypeLib.put(options.invokeType,type);
        }
    },
    /**
     * 描述:获取组件
     * @param {} type
     * @param {} option
     * @return {}
     */
    getComponentDef:function(type){
        return waf.wafPageComponentLib.get(type);
    },
    /**
     * 描述:动态创建组件
     */
    createDOM:function (type, option) {
        var component = waf.wafPageComponentLib.get(type);
        var createDOMFun = component.createDOMFun;
        return createDOMFun(option);
    },
    initComponent:function(type,option,el){
        var component = waf.wafPageComponentLib.get(type);
        var initFun = component.initFun;
        var ret;
        if(waf.pageBuilder.beforeInit&&$.isFunction(waf.pageBuilder.beforeInit)){
            ret = waf.pageBuilder.beforeInit.call(this,type,option,el);
            if(ret && typeof ret == "object") option = $.extend(option,ret);
        }
        ret = $("body").triggerHandler("beforeInit.render", [type, option, el]);
        if (ret && typeof ret == "object") option = $.extend(option, ret);
        return initFun(option, el);
    },
    /**
     * 描述:动态删除组件
     *     注:如果给出的id属性为null,
     */
    removeComponent:function (type, option) {
        var component = waf.wafPageComponentLib.get(type);
        /*
         * 如果当前已注册未定义删除方法,则使用默认的id选择器移除dom元素
         * 否则:使用自定义删除函数删除
         */
        if (component.deleteFun == undefined || component.deleteFun == null) {
            if(option.id) waf("#"+option.id).remove();
        }
        else {
            component.deleteFun(option);
        }
    },
    /**
     * 描述:动态更改组件属性
     */
    updateComponent:function (type, option) {
        var component = waf.wafPageComponentLib.get(type);
        /*
         * 如果当前已注册未定义更新方法,则使用默认的id选择器设置属性
         * 否则:使用自定义更新函数设置属性
         */
        if (component.modifyFun == undefined || component.modifyFun == null) {
            if(option.id){
                var wafCmp = waf("#" + option.id);
                var updateScript = "waf('#" + option.id + "')." + waf.getCmpTypeByTag(component.type) + "('option'," + waf.toJSONString(option)+")";
                return eval(updateScript);
            }
        }
        else {
            return component.modifyFun(option);
        }
    },
    appendDOM:function(target,doms){
        if(doms instanceof jQuery && $(doms).data("domcreated")){
             return;
        }
        if($.isArray(doms)){
            for(var i=0;i<doms.length;i++){
                $(target).append(doms[i]);
            }
        }else{            
            $(target).append(doms);
        }
    },
    getCmpTypeByTag:function(tagType){
        if(waf.wafCmpTypeLib){
            return waf.wafCmpTypeLib.get(tagType);
        }
    },
    /**
     * 描述:动态新增组件
     */
    appendWebCom:function (type, parent, option) {
        require([type], function() {
            var comDom = waf.createDOM(type, option);
            waf.appendDOM(parent, comDom);
            waf.initComponent(type, option, comDom);
        });
    }
});

waf(function(){
    //注册tagType到cmpType,兼容静态框架
//    waf.wafCmpTypeLib.put("option","wafSelect");
//    waf.wafCmpTypeLib.put("optGroup","wafSelect");
//    waf.wafCmpTypeLib.put("selectFilter","wafSelect");
//    waf.wafCmpTypeLib.put("editGrid","wafGrid");
//    waf.wafCmpTypeLib.put("gridColumn","wafGrid");
//    waf.wafCmpTypeLib.put("pager","wafGrid");
//    waf.wafCmpTypeLib.put("gridHeaderGroup","wafGrid");
//    waf.wafCmpTypeLib.put("gridDataGroup","wafGrid");

//    waf.wafCmpTypeLib.put("section","wafSection");
//    waf.wafCmpTypeLib.put("tree","wafTree");
//    waf.wafCmpTypeLib.put("tabPanel","wafTabs");
//    waf.wafCmpTypeLib.put("tab","wafTab");
//    waf.wafCmpTypeLib.put("floatBar","wafFloatBar");
//    waf.wafCmpTypeLib.put("outline","wafOutline");
//    waf.wafCmpTypeLib.put("label","wafLabel");
//    waf.wafCmpTypeLib.put("hidden","wafHidden");
//    waf.wafCmpTypeLib.put("multiLangArea","wafMultiLangArea");
//    waf.wafCmpTypeLib.put("multiLangBox","wafMultiLangBox");
//    waf.wafCmpTypeLib.put("fileUpload","wafFileUploadUI");
//    waf.wafCmpTypeLib.put("progressBar","wafProgressBar");
//    waf.wafCmpTypeLib.put("radioGroup","wafRadioGroup");
//    waf.wafCmpTypeLib.put("img","wafImg");
//    waf.wafCmpTypeLib.put("timePicker","wafTimePicker");
//    waf.wafCmpTypeLib.put("infoBlock","wafInfoBlock");
//	waf.wafCmpTypeLib.put("dataView","wafDataView");
});

$.dynamicutil = $.dynamicutil || {};
$.extend($.dynamicutil, {
    removeChildren:function(container, source){
        source = $(source);

        var ctrlrole = source.attr("ctrlrole");
        if(ctrlrole){
            var id=source.attr("id");
            waf.removeComponent(ctrlrole,{id:id})
        }else{
            $(source,container).remove();
        }
    },
    appendChildren:function(container, source, pos){
        if($.type.isString(source)){
            //字符串认为是普通字符
            source = $("<label>"+source+"</label>");
        }else{
            source = $(source);
        }


        //pos并且为数字的话
        if(!$.isNaN(pos)){
            var target = container.children("*").not("script").eq(pos);
            if(target&&target.length>0){
                $.each(source,function(i,v){
                    $(v).insertBefore(target);
                });
                return;
            }
        }
        $.each(source,function(i,v){
            container.append(v);
        });
    },
    addContextPath: function(opts, key, defaultUrl){
        var url = $.trim(opts[key]),
            contextPath = waf.getContextPath();

        if(url){
            if((url.charAt(0) != "?") && (url.indexOf(contextPath) != 0)){
                opts[key] = contextPath + url;
            }
        }else if(defaultUrl){
            opts[key] = contextPath + defaultUrl;
        }
    }
});

(function ($) {
    $.type = $.type || {};
    //跨域top、parent
    var top = waf.crossDomainUtil.getTop(),parent = waf.crossDomainUtil.getParent();
    $.extend($.type, {
        isBoolean:function (o) {
            return typeof o === 'boolean';
        },
        isObject:function (o) {
            return (o && (typeof o === 'object' || $.isFunction(o))) || false;
        },
        isString:function (o) {
            return typeof o === 'string';
        },
        isNumber:function (o) {
            return typeof o === 'number' && isFinite(o);
        },
        isNull:function (o) {
            return o === null;
        },
        isUndefined:function (o) {
            return typeof o === 'undefined';
        },
        isValue:function (o) {
            return (this.isObject(o) || this.isString(o) || this.isNumber(o) || this.isBoolean(o));
        },
        isEmpty:function (o) {
            if (!this.isString(o) && this.isValue(o)) {
                return false;
            } else if (!this.isValue(o)) {
                return true;
            }
            o = $.trim(o).replace(/\&nbsp\;/ig, '').replace(/\&#160\;/ig, '');
            return o === "";
        },
        isJson:function (o) {
            var isJson = o != null && typeof(o) == "object" && Object.prototype.toString.call(o).toLowerCase() == "[object object]" && !o.length;
            return isJson;
        },
        isEquals:function (x, y) {
            var seen = [];

            return (function equals(x, y) {
                // If both x and y are null or undefined and exactly the same
                if (x === y) {
                    return true;
                }

                // If they are not strictly equal, they both need to be Objects
                if (!( x instanceof Object ) || !( y instanceof Object )) {
                    return false;
                }

                // They must have the exact same prototype chain, the closest we can do is
                // test the constructor.
                if (x.constructor !== y.constructor) {
                    return false;
                }

                for (var p in x) {
                    // Inherited properties were tested using x.constructor === y.constructor
                    if (x.hasOwnProperty(p)) {
                        // Allows comparing x[ p ] and y[ p ] when set to undefined
                        if (!y.hasOwnProperty(p)) {
                            return false;
                        }

                        // If they have the same strict value or identity then they are equal
                        if (x[ p ] === y[ p ]) {
                            continue;
                        }

                        // Numbers, Strings, Functions, Booleans must be strictly equal
                        if (typeof( x[ p ] ) !== "object") {
                            return false;
                        }

                        //date比较
                        if ($.type(x[p]) === "date" && $.type(y[p]) === "date") {
                            if (x[p].getTime() != y[p].getTime()) {
                                return false;
                            }
                        }

                        // Test cyclicality                        
                        if ($.inArray(x[ p ], seen) >= 0) {
                            throw new Error("Cannot compare some cyclical objects");
                        }
                        seen.push(x[ p ]);

                        // Objects and Arrays must be tested recursively
                        if (!equals(x[ p ], y[ p ])) {
                            return false;
                        }
                    }
                }

                for (p in y) {
                    // allows x[ p ] to be set to undefined
                    if (y.hasOwnProperty(p) && !x.hasOwnProperty(p)) {
                        return false;
                    }
                }
                return true;
            })(x, y);
        },
        isDynamic:function () {
            return waf.dynamiced;
        }
    });


    $.colorutil = $.colorutil || {};

    $.extend($.colorutil, {
        rgbToHex:function (rgbString) {
            var parts = rgbString.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),(\d+)\)$/);

            delete (parts[0]);
            for (var i = 1; i <= 3; ++i) {
                parts[i] = parseInt(parts[i]).toString(16);
                if (parts[i].length == 1) parts[i] = '0' + parts[i];
            }
            return '#' + parts.join('').toUpperCase(); // "#0070FF"
        }
    });


    $.keyutil = $.keyutil || {};
    $.extend($.keyutil, {
        getKeyCodeArr:function () {
            var arr = [];
            for (var p in $.ui.keyCode) {
                arr.push($.ui.keyCode[p]);
            }
            return arr;
        }
    });

    $.wafutil = $.wafutil || {};
    $.extend($.wafutil, {
        scrollWid:undefined,
        getMultiValue:function (value) {
            if (typeof value === "object") {
                if (waf.isMultiLangValue && waf.isMultiLangValue(value)) {
                    var local = "l2" || (waf.getContext().locale ? waf.getContext().locale : "l2");
                    return value[local]
                } else {
                    return value;
                }
            } else {
                return value;
            }
        },
        getValueByPath:function (data, path) {
            var paths = path.split("."),
                current = data;
            for (var i = 0, length = paths.length; i < length; i++) {
                if (i == length - 1) {
                    return current[paths[i]];
                } else {
                    if (current[paths[i]] == null) {
                        return null;
                    }
                    current = current[paths[i]];
                }
            }
            return null;
        },
        replaceSpecialChar:function (str, dest) {
            return String(str).replace(/[!"#$%&'()*+,.\/:;<=>?@\[\\\]\^`{|}~]/g, dest);
        },
        isViewOperateState:function (opts) {
            if (opts && opts["operateState"]) {
                if (opts["operateState"].toUpperCase() === "view".toUpperCase()) {
                    return true;
                } else if (opts["operateState"].toUpperCase() === "edit".toUpperCase()) {
                    return false;
                }
            }
            var params = waf.getUrlParams();
            return params && params["operateState"] && (params["operateState"].toUpperCase() == "view".toUpperCase());
        },
        getViewDisplayType:function (opts) {
            var viewDisplayType = "wordonly";
            if (opts && opts["viewDisplayType"]) {
                viewDisplayType = opts["viewDisplayType"];
            } else {
                var params = waf.getUrlParams();
                if (params && params["viewDisplayType"]) {
                    viewDisplayType = params["viewDisplayType"];
                }
            }
            return viewDisplayType;
        },
        htmlDecode:function (value) {
            if (value && (value == '&nbsp;' || value == '&#160;' || (value.length === 1 && value.charCodeAt(0) === 160))) {
                return "";
            }
            return !value ? value : String(value).replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&#39;/g, "'");
        },
        htmlEncode:function (value) {
            return !value ? value : String(value).replace(/&/g, "&amp;").replace(/\"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\'/g, "&#39;");
        },
        getVerticalScrollBarWidth:function () {
            if ($.wafutil.scrollWid === undefined) {
                var scrollBarHelper = document.createElement("div");
                // if MSIE
                // 如此设置的话，scroll bar的最大宽度不能大于100px（通常不会）。
                scrollBarHelper.style.cssText = "overflow:scroll;width:100px;height:100px;";
                // else OTHER Browsers:
                // scrollBarHelper.style.cssText = "overflow:scroll;";
                document.body.appendChild(scrollBarHelper);
                if (scrollBarHelper) {
                    $.wafutil.scrollWid = {
                        horizontal:scrollBarHelper.offsetHeight - scrollBarHelper.clientHeight,
                        vertical:scrollBarHelper.offsetWidth - scrollBarHelper.clientWidth
                    }
                }
                document.body.removeChild(scrollBarHelper);
            }
            return $.wafutil.scrollWid.vertical;
        },
        getHorizontalScrollBarHeight:function () {
            if ($.wafutil.scrollWid === undefined) {
                var scrollBarHelper = document.createElement("div");
                // if MSIE
                // 如此设置的话，scroll bar的最大宽度不能大于100px（通常不会）。
                scrollBarHelper.style.cssText = "overflow:scroll;width:100px;height:100px;";
                // else OTHER Browsers:
                // scrollBarHelper.style.cssText = "overflow:scroll;";
                document.body.appendChild(scrollBarHelper);
                if (scrollBarHelper) {
                    $.wafutil.scrollWid = {
                        horizontal:scrollBarHelper.offsetHeight - scrollBarHelper.clientHeight,
                        vertical:scrollBarHelper.offsetWidth - scrollBarHelper.clientWidth
                    }
                }
                document.body.removeChild(scrollBarHelper);
            }
            return $.wafutil.scrollWid.horizontal;
        },
        replaceAll:function (str, source, target) {
            if (str) {
                while (str.indexOf(source) > -1) {
                    str = str.replace(source, target);
                }
            }
            return str;
        },
        replace:function (str, source) {
            if (str || source) {
                var args = [].slice.call(arguments);
                for (n = 2, len = args.length; n < len; n++) {
                    if (str.indexOf(source) <= 0) break;
                    str = str.replace(source, args[n]);
                }
                return str;
            }
            return str;
        },
        format:function (format) {
            var args = $.makeArray(arguments).slice(1);
            if (format === undefined) {
                format = "";
            }
            return format.replace(/\{(\d+)\}/g, function (m, i) {
                return args[i];
            });
        },
        compatibleWithOnchange:function () {
            waf.aspectAfter($.Widget, "_createWidget", function () {
                if (this.options.onchange && this.options.value != undefined) {
                    var value = this.options.value;
                    if (this.element.attr("ctrlrole") === "numberField") {
                        value = $.wafNumberField.format(this.options.value, this.options);
                    }
                    this._trigger("onchange", "onchange", {"previous":null, "current":value})
                }
            });
            waf.aspectAfter($.datepicker, "_attachDatepicker", function (target) {
                var inst = target;
                var onChange = $.datepicker._get(inst, 'onchange')
                if (onChange) {
                    onChange.apply((inst.input ? inst.input[0] : null), [
                        {"previous":null, "current":inst.defaultValue},
                        inst
                    ])
                }
            });
        },
        disableAll:function () {
            waf("input.ui-numberfield").wafNumberField("disable");
            waf("input.ui-text").wafText("disable");
            waf("textarea.ui-multiLangArea-input").wafMultiLangArea("disable");
            waf("input.ui-multiLangBox-input").wafMultiLangBox("disable");
            waf("div.ui-radiogroup-div").wafRadioGroup("disable");
            waf("input.ui-wafcheckbox").wafCheckbox("disable");
            waf("input.ui-radio").wafRadio("disable");
            waf("select.ui-select").wafSelect("disable");
            waf("input.hasDatepicker").wafDatePicker("disable");
            waf("input.ui-f7").wafPromptBox("disable");
            waf("input.ui-timepicker").wafTimePicker("disable");
            waf("textarea.ui-textarea").wafTextarea("disable");
            waf("table.ui-jqgrid-btable").wafGrid("option", "editable", false);
        },
        clear:function (arr) {
            arr.length = 0;
        },
        insertAt:function (arr, index, obj) {
            arr.splice(index, 0, obj);
        },
        removeAt:function (arr, index) {
            arr.splice(index, 1);
        },
        remove:function (arr, obj) {
            var index = $.inArray(obj, arr);
            if (index >= 0) {
                $.wafutil.removeAt(arr, index);
            }
        },
        namedItem:function (arr, value, prop) {
            //必须保证arr中属于html 元素
            prop = prop || "id";
            if (arr.length > 0) {
                var len = arr.length, elem;
                for (var i = 0; i < len; i++) {
                    if ($(arr[i]).attr(prop) == value) {
                        return arr[i];
                    }
                }
            }
        },
        parseDate:function (format, date) {
            var tsp = {m:1, d:1, y:1970, h:0, i:0, s:0, u:0}, k, hl, dM, regdate = /[\\\/:_;.,\t\T\s-]/;
            if (date && date !== null && date !== undefined) {
                date = $.trim(date);
                date = date.split(regdate);
                if ($.jgrid.formatter.date.masks[format] !== undefined) {
                    format = $.jgrid.formatter.date.masks[format];
                }
                format = format.split(regdate);
                var dfmt = $.jgrid.formatter.date.monthNames;
                var afmt = $.jgrid.formatter.date.AmPm;
                var h12to24 = function (ampm, h) {
                    if (ampm === 0) {
                        if (h === 12) {
                            h = 0;
                        }
                    }
                    else {
                        if (h !== 12) {
                            h += 12;
                        }
                    }
                    return h;
                };
                for (k = 0, hl = format.length; k < hl; k++) {
                    if (format[k] == 'M') {
                        dM = $.inArray(date[k], dfmt);
                        if (dM !== -1 && dM < 12) {
                            date[k] = dM + 1;
                            tsp.m = date[k];
                        }
                    }
                    if (format[k] == 'F') {
                        dM = $.inArray(date[k], dfmt);
                        if (dM !== -1 && dM > 11) {
                            date[k] = dM + 1 - 12;
                            tsp.m = date[k];
                        }
                    }
                    if (format[k] == 'a') {
                        dM = $.inArray(date[k], afmt);
                        if (dM !== -1 && dM < 2 && date[k] == afmt[dM]) {
                            date[k] = dM;
                            tsp.h = h12to24(date[k], tsp.h);
                        }
                    }
                    if (format[k] == 'A') {
                        dM = $.inArray(date[k], afmt);
                        if (dM !== -1 && dM > 1 && date[k] == afmt[dM]) {
                            date[k] = dM - 2;
                            tsp.h = h12to24(date[k], tsp.h);
                        }
                    }
                    if (date[k] !== undefined) {
                        tsp[format[k].toLowerCase()] = parseInt(date[k], 10);
                    }
                }
                tsp.m = parseInt(tsp.m, 10) - 1;
                var ty = tsp.y;
                if (ty >= 70 && ty <= 99) {
                    tsp.y = 1900 + tsp.y;
                }
                else if (ty >= 0 && ty <= 69) {
                    tsp.y = 2000 + tsp.y;
                }
                if (tsp.j !== undefined) {
                    tsp.d = tsp.j;
                }
                if (tsp.n !== undefined) {
                    tsp.m = parseInt(tsp.n, 10) - 1;
                }
            }
            return new Date(tsp.y, tsp.m, tsp.d, tsp.h, tsp.i, tsp.s, tsp.u);
        },
//		parseFunction:function(ns){
//            if(typeof ns == "string"){
//				var obj = /^[\[\{]|[\}\]]$/ig.test(ns);
//				if(obj){
//					return eval(ns);
//				}else{
//				    if (!ns || !ns.length) {
//                       return null;
//					}
//					var levels = ns.split(".");
//					var nsobj = window;
//					for (var i= 0,len=levels.length;nsobj && i<len; ++i) {
//						nsobj = nsobj[levels[i]];
//					}
//					return nsobj;
//				}
//            }
//            return ns;
//        },
        arrayFilter:function (fn, array, thisObj) {
            var l = array.length, res = [], resLength = 0;
            for (var i = 0; i < l; i++) {
                if (i in array) {
                    var val = array[i];
                    if (fn.call(thisObj, val, i, array)) {
                        res[resLength++] = val;
                    }
                }
            }
            return res;
        },
        setCenter:function (elem, options, opts) {
            var curElem = $(elem), props = {}, openFromParent;
            if (options && options.top && options.top != null) {
                props.top = options.top;
            }
            if (options && options.left && options.left != null) {
                props.left = options.left;
            }
            if (top.portal || (top == parent && $(parent.document.body).hasClass("wafPage"))) {
                //在门户或者只有wafPage的页面
                openFromParent = true;
            }
            if ($(window.document.body).hasClass("InWiniframe") || window == parent) {
                //msgbox在iframe window中弹出  浏览器的window=parent
                openFromParent = false;
            }
            var opt = {
					my:'center',
					at:'center',
					collision:'fit',
					of:$(top)
					// ensure that the titlebar is never outside the document
				};
			$.isPlainObject(opts) && (opt = $.extend(opt, opts));
            if (openFromParent) {
                opt.using = function (pos) {
                    $(this).css(pos);
                    // $(this).css('top',$(top).height()/2-$(this).height());
                    var width = $(window).width();
                    if (!$.isNaN(width)) {
                        $(this).css("left", Math.round((width - $(this).width()) / 2));
                    }
                    var msgtop = $(this).offset().top, msgleft = $(this).offset().left, msgheight = $(this).height();
                    msgtop = msgtop-waf.wafutil.getPortalHeadHight()-msgheight/3;
                    $(this).css('top', msgtop > 0 ? msgtop : 10);
                }
            }
            if (jQuery.isFunction(options)) {
                opt.using = options;
            }
            if (props && props.length > 0) {
                opt.offset = props;
            }
            curElem.position(opt);
        },
        getPortalHeadHight:function(){
            //获取门户head高度
            var portalHight=0;
            if(top.portal){
                portalHight=$("#header",$(top.document.body)).outerHeight()+$("#tabbar",$(top.document.body)).outerHeight();
            }
            if(waf.isInFramePage()&&!(window.jsBinder&&window.jsBinder.isInFramePage)){
                portalHight=portalHight+parent.$("#mainContent").outerHeight()-parent.$("#wafpagemain").outerHeight();
            }
            return   portalHight;
        },
        stringAppender:function () {
            if (arguments.length > 0) {
                return $.makeArray(arguments).join("");
            } else {
                return "";
            }
        },
        //可以从一个对象中获取子对象的值，也就是支持createor.name这样的取值方式
        getAccessor:function (obj, expr) {
            var ret, p, prm = [], i,rets="";
			function getObjPrm(expr,obj){
					var prm = [],p,ret;
					prm = expr.split('.');
							i = prm.length;
							if (i) {
								ret = obj;
								var j=i;
								while (ret && j--) {
									p = prm.shift();
									ret = ret[p];
								}
							}
				return ret;
			}
            if (typeof expr === 'function') {
                return expr(obj);
            }
            ret = obj[expr];
            if (ret === undefined) {
					try {
						if (typeof expr === 'string') {
							prm = expr.split(',');
						}
						i = prm.length;
						if (i>1) {//expr格式为“id,time,,,”
							var j=i;
							while (obj && j--) {
								p = prm.shift();
								if(obj[p]==undefined){//p格式类型为createor.name
									if (getObjPrm(p,obj)!=undefined)
										rets=rets+getObjPrm(p,obj);
								}
								else{
									rets = rets+obj[p];
								}
							}
							ret = rets;
						}else if (typeof expr === 'string') {//expr格式类型为createor.name
							ret=getObjPrm(expr,obj);
							}
						} 
					catch (e) {
						console.log(e);
					}
					}
            return ret;
        },
        addContextPath:function (opts, key, defaultUrl) {
            var url = $.trim(opts[key]),
                contextPath = waf.getContextPath();
            if (url.indexOf("//") > -1) {
                url = url.substring(1);
            }
            if (url) {
                if ((url.charAt(0) != "?") && (url.indexOf(contextPath) != 0)) {
                    opts[key] = contextPath + url;
                }
            } else if (defaultUrl) {
                opts[key] = contextPath + defaultUrl;
            }
            return opts;
        },
        getTemplateEngine:function (engine, engineName) {
            return new TemplateEngine(engine || Hogan, engineName || "Hogan");
        },
        getQueryObject:function (source) {
            return new QueryObject(source, null);
        },
        handleUrl:function (url) {
            if (url.indexOf("?") == 0) return url;
            if (url.indexOf("//") > -1) {
                url = url.substring(1);
            }
            return waf.getContextPath() + url;
        },
        getLazyOption:function (element) {
            var option = $(element).data("_OPTIONS_"), id = $.type.isString(element)?element:$(element).attr("id"), type;
            if (!option && id && (window._asynOptions||window._lazyOptions||window._clickOptions)) {
                var op = window._asynOptions[id] || window._lazyOptions[id] || window._clickOptions[id] ||  window._immeOptions[id];
                if (op && op.option) {
                    option = $.extend(true, {}, op.option ? op.option : {});
                    type = op.type;
                }
            }
            if(!option && waf.clickOptions){
                //renderModel=client时，按钮也支持点击时初始化.
                var op =  waf.clickOptions[id];
                if (op && op.option) {
                    option = $.extend(true, {}, op.option ? op.option : {});
                    type = op.type;
                }
            }
            if (option) {
                if (option._dataBinder) {
                    var fieldValue = $.wafutil.getFieldValue(option._dataBinder.field);
                    if(fieldValue){
					    if (type == "grid") {
                            option["data"] = fieldValue;
                        } else {
                            option[(option._dataBinder&&option._dataBinder.bindProp)?option._dataBinder.bindProp:"value"] = fieldValue;
                        } 
                    }
                }
                var ret;
                if (waf.pageBuilder && waf.pageBuilder.beforeInit && $.isFunction(waf.pageBuilder.beforeInit)) {
                    ret = waf.pageBuilder.beforeInit.call(this, type, option, element);
                    if (ret && typeof ret == "object") option = $.extend(option, ret);
                }

                ret = $("body").triggerHandler("beforeInit.render", [type, option, element]);
                if (ret && typeof ret == "object") option = $.extend(option, ret);
            }

            return option || {};
        },

        setLazyOption:function (comId, prop, value) {
            if(window._asynOptions||window._lazyOptions||window._clickOptions){
                var tmp = window._asynOptions[comId] || window._lazyOptions[comId] || window._clickOptions[comId] ||  window._immeOptions[comId], propArr, i = 0;
                if (tmp && tmp.option) {
                    tmp = tmp.option;
                    propArr = prop.split(".");
                    while (propArr.length > 1 && i < (propArr.length - 1)) {
                        tmp = tmp[propArr[i]];
                        i++;
                    }
                    tmp[propArr[i]] = value;
                }
            }
        },
        getFieldValue:function (field) {
            if ((window._self && waf.framework.WafEdit && window._self instanceof waf.framework.WafEdit)
            	||(window._self && waf.framework.DynamicEdit && window._self instanceof waf.framework.DynamicEdit)) {
                var model = _self.getCurrentModel();
                return $.wafutil.getAccessor(model, field);
            }
        },
        lazyLoadField:function () {
            //数据的绑定放置到业务的初始化代码之后，所以单独独立一个方法，这里只是注册。
            var model, tmp, len;
            if (window._self && _self.getCurrentModel) {
                model = _self.getCurrentModel();
            }
            if (window._dataBinders_) {
                len = window._dataBinders_.length;
                var value,opt,com;
                for (var i = 0; i < len; i++) {
                    tmp = window._dataBinders_[i];
                    value = model && $.wafutil.getAccessor(model, tmp.field);
                    if (value === null || value === "" || value === undefined) {
                        continue;
                    }
                    com = $("#" + tmp.componentID);
                    opt = $.wafutil.getLazyOption(com);
                    var component = waf.wafPageComponentLib.get(waf.wafInvokeTypeLib.get(tmp.componentType));
                    var initValue = component.initValue;
                    //处理国际化信息
                    if($.inArray(tmp.componentType,$.nationalFormat.getFormatType()) != -1){
                        $.nationalFormat.setNationalFormat(opt,tmp.componentType);
                    }
                    initValue && initValue(com,value,opt);
                }
            }
        },
        initLazyOptions:function () {
            //async init
            window._as_ && _as_();
            window._asynOptions = window._asynOptions || {};
            //lazy init
            window._lzo_ && _lzo_();
            window._lazyOptions = window._lazyOptions || {};
            //click init
            window._ck_ && _ck_();
            window._clickOptions=window._clickOptions || {};

            //注册绑定，数据的绑定放置到业务的初始化代码之后，所以单独独立一个方法，这里只是注册。
            if (waf.dataBinder) {
                window._db_ && _db_();
                if (window._dataBinders_) {
                    var tmp, len;
                    len = window._dataBinders_.length;
                    for (var i = 0; i < len; i++) {
                        tmp = window._dataBinders_[i];
                        waf.dataBinder._dataBinder.put(tmp.field, tmp);
                    }
                }
            }

            // Init ctrll when click it

            if (window._clickOptions) {
                //this.initComponent(window._clickOptions, "clickInit-");
            }

            $("body").bind("beforeInit.render", function(e,type, op, com){
                if("grid"==type){
                    //为修改BUG暂时这么加，处于金盘封盘期间，后期这个代码应该放在表格设置的模块中。pagerBuilder中不能放动态性的内容，否则静态化期间可能存在错误。
                    if(_self&&_self.getPageInitData() && _self.getPageInitData().customGridConfigMap){
                        op.customGridConfig=_self.getPageInitData().customGridConfigMap[op.id];
                    }else{
                        op.customGridConfig={};
                    }                    
                    return op;
                }else if("form"==type&&"form"==op.id){
                    //TODO:这种方式后续要改造，应该与form没有关系才对。
                    //如果某个页面即在面包屑中打开，也在别的地方打开，这里会报错。
                    if (waf.isInFramePage()) {
                        op.validateOptions = "{errorContainer:parent.waf('#msgArea')}";
                    } else {
                        op.validateOptions = "{errorContainer:waf('#msgArea1')}";
                    }         
                    return op;                       
                }
            });

            //immediate init ctrll
            window._imo_ && _imo_();
            if (window._immeOptions) {
                this.initComponent(window._immeOptions, "immediate-");
            }else{
                window._immeOptions = {};
            }

        },
        initComponentById:function(com){
            var id = $(com).attr("id");
            if (id && (window._asynOptions||window._lazyOptions||window._clickOptions||window._immeOptions)) {
                var op = window._asynOptions[id] || window._lazyOptions[id] || window._clickOptions[id] || window._immeOptions[id]|| {};
                if(op){
                    var tmp = {};
                    tmp[id] = op;
                    this.initComponent(tmp,"lazy-");
                }
            }
        },
        initComponent:function (options, cType) {
            var tmp, component, com, initFun, op, type, id, instance;
            cType = cType || "";
            for (tmp in options) {
                type = options[tmp].type;
                id = options[tmp].id;
                op = options[tmp].option;
                waf.dynamicCache = waf.dynamicCache || {};
                if (id && id != "") {
                    com = $(document.getElementById(id));
                    if (com.data("inited"+type)) {
                        continue;
                    }
                    _start(cType + "serverRender", type + "_" + id);
                    if (waf.dynamicCache[type]) {
                        component = waf.dynamicCache[type];
                    } else {
                        component = waf.wafPageComponentLib.get(type);
                        waf.dynamicCache[type] = component;
                    }

                    if (cType == "immediate-" || cType == "async-" || cType == "lazy-") {
                        initFun = component.initFun;
                        var ret;
                        if (waf.pageBuilder && waf.pageBuilder.beforeInit && $.isFunction(waf.pageBuilder.beforeInit)) {
                            ret = waf.pageBuilder.beforeInit.call(this, type, op, com);
                            if (ret && typeof ret == "object") op = $.extend(op, ret);
                        }
                        ret = $("body").triggerHandler("beforeInit.render", [type, op, com]);
                        if (ret && typeof ret == "object") op = $.extend(op, ret);

                        if (op._dataBinder) {
                            var fieldValue = $.wafutil.getFieldValue(op._dataBinder.field);
                            if (fieldValue || fieldValue==0) {
                                if (type == "grid" && cType != "immediate-") {
									//初始化执行时如果设置data，loadInit时会执行，放在lazyLoadField中执行
                                    op["data"] = fieldValue;
                                } else {
                                    op[(op._dataBinder&&op._dataBinder.bindProp)?op._dataBinder.bindProp:"value"] = fieldValue;
                                }
                            }
                        }
                        initFun && initFun(op, com);
                        com.data("inited"+type, true);
						//field控件都应该执行initRequireMask方法， select的enter2tab操作在div上，此处加特殊判断 TODO
                        if (com.hasClass("waf2_field") || com.attr("ctrlrole") === "select") {//op._dataBinder && op._dataBinder.field  
                            $.wafLabelContainer.initRequireMask(com);
                        }

                    }
                    _end(cType + "serverRender", type + "_" + id);
                }
            }
            delete waf.dynamicCache;
        },
        invokeMethod:function (element, widgetName, methodName) {
            var paramArray = [], ret;
            if (arguments.length > 3) {
                for (var nIndex = 3; nIndex < arguments.length; nIndex++) {
                    paramArray.push(arguments[nIndex]);
                }
            }
            $(element).each(function () {
                var instance;
                if ("wafDatePicker" == widgetName) {
                    instance = $(this).data("datepicker");
                } else if ("wafGrid" == widgetName || "jqGrid" == widgetName) {
                    instance = this.grid;
                } else {
                    instance = $.data(this, widgetName);
                }
                if (!instance) {
                    var option = $.wafutil.getLazyOption(this);
                    if (option) {
                        if ("wafDatePicker" == widgetName) {
                            if (option.type == "datetime") {
                                $(this).datetimepicker(option);
                            } else {
                                $(this).datepicker(option);
                            }
                            instance = $(this).data("datepicker");
                        } else {
                            var object = $.ui[widgetName];
                            $.data(this, widgetName, new object(option, this));
                            instance = $.data(this, widgetName)
                        }
						$(this).data("inited"+$(this).attr("ctrlrole"), true);
                    }
                }
                if (instance) {
                    if ("wafDatePicker" == widgetName) {
                        paramArray.splice(0, 0, methodName);
                        ret = $(this).datepicker.apply($(this), paramArray);
                    } else if ("wafGrid" == widgetName || "jqGrid" == widgetName) {
                        var fn = $.jgrid.getAccessor($.fn.jqGrid, methodName);
                        ret = fn && $.isFunction(fn) && fn.apply($(this), paramArray);
                    } else {
                        ret = instance[methodName] && $.isFunction(instance[methodName]) && instance[methodName].apply(instance, paramArray);
                    }
                }
            });
            return ret;
        }
    });


    waf.pageStatuControl = waf.pageStatuControl || {};
    $.extend(waf.pageStatuControl,{
        operateState:function(option,element,view){
            var isView = waf.wafutil.isViewOperateState(option),
                displayType = waf.wafutil.getViewDisplayType(option);
            this.displayTypeCancel(option,element,view);
            if(isView) {
                this[displayType + "DisplayTypeOK"](element,view,option);
            }
        },
        displayTypeCancel:function(option,element,view){
            this.wordonlyDisplayTypeCancel(option,element,view);
            this.disableDisplayTypeCancel(element,option.disabled);
        },
        wordonlyDisplayTypeCancel: function(option,element,view) {
            element[option.hidden ? 'hide' : 'show']();
            view.hide();
        },
        wordonlyDisplayTypeOK: function(element,view,option) {
            element.hide();
            view[option.hidden ? 'hide' : 'show']();
        },
        disableDisplayTypeCancel: function(element,isDisable) {
            this.viewDisable(element,isDisable);
        },
        disableDisplayTypeOK: function(element) {
            this.viewDisable(element,true);
        },
        viewDisable: function(element,isDisable) {
            element[ isDisable ? "addClass" : "removeClass"]
                ("ui-state-disabled" );
            if(isDisable){
               element.attr( "aria-disabled", isDisable )
                    .attr('disabled', isDisable);
            }else{
                element.removeAttr( "aria-disabled" )
                    .attr('disabled');
            }

        }


    });


    /*waf.inteUtil = waf.inteUtil || {};
    $.extend(waf.inteUtil, {
        isSinglePage:function(){
            return document.referrer && document.referrer.indexOf(location.host) < 0;
        },
        isWafPortal:function () {
            //单页面运行，一般用于集成到跨域的页面中，后续我们需要修改
            if(this.isSinglePage()) return false;
            return top && top.jPortal;
        },
        getParent:function(){
            if(this.isSinglePage()) return null;
            return parent;
        },
        getTop:function(){
            if(this.isSinglePage()) return null;
            return this.isWafPortal()?top:null;
        }
    });*/

    waf.ctrls = waf.ctrls || {};
    $.extend(waf.ctrls, {
        setF7Filter:function (promptBoxId, filter) {
            if (_self && _self.isServerRender()) {
                $.wafutil.setLazyOption(promptBoxId, "subWidgetOptions.filteritem", filter);
            } else {
                var promptBox = waf("#" + promptBoxId);
                var type = promptBox.wafPromptBox("option", "subWidgetName");  // F7类型
                $.wafutil.invokeMethod(promptBox, type, "option", "filteritem", filter);
            }
        }
    });

    waf.fnUtils = waf.fnUtils || {};
    $.extend(waf.fnUtils, {
        registerFun:function (elem, eName, fn, params) {
            //register event in jquery model
            elem = $(elem);
            elem.unbind(eName).bind(eName, function (e) {
                waf.fnUtils.invokeFun(fn, elem, [e, params]);
            })
        },
        parseFun:function (fn) {
            if (fn) {
                if ($.isFunction(fn)) {
                    return fn;
                } else if ($.type.isString(fn)) {
                    if (!fn.length) return null;
                    //var levels = fn.split("."), nsobj = window;
                    //以前业务代码就有不加_self的，默认加上后业务代码找不到方法出错，ci失败
                    var levels = fn.split("."), 
						hasSelf=fn.indexOf("_self"),nsobj;
                    if(hasSelf>-1){
                        nsobj = window;
                    }else{
                        //兼容旧版本直接注册在window命名空间下的对象
                        nsobj = window[levels[0]]?window:(window._self?window._self:window);
                    }
					//nsobj = hasSelf==-1?(window._self?window._self:window):window;                    
                    for (var i = 0, len = levels.length; nsobj && i < len; ++i) {
                        nsobj = nsobj[levels[i]];
                    }
                    return nsobj;
                } else {
                    return fn;
                }
            } else {
                return null;
            }
        },
        invokeFun:function (fn, target, args) {
            if (!target) target = this;
            args = args || [];
            fn = waf.fnUtils.parseFun(fn);
                try{
                 if (fn) {
                   return fn.apply(target, args);
                 }}catch(e){
                  console.log("Page exception："+e.message);
                  console.log(" Error Js："+e.stack.split("at")[1]);
                        throw e.message+"  Error Js："+e.stack.split("at")[1];
                 }
        },
        parseObject:function(meta){
            if(meta && $.type.isString(meta)){
                //尝试使用JSON来解析
                var ret ;
                try{
                   ret = waf.toJSONObject(meta);
                }catch(e){
                   //如果出错，使用函数解析
                   meta = "var _tmp_ = "+ meta;
                   (function(){meta})();
                   ret = _tmp_;
                }
                return ret;
            }
            return meta;
        }
    });


//    $.fn.handleFunction = function (eventName, eventFunction) {
//        var tag = $(this);
//        tag.unbind(eventName);
//        if (eventFunction && eventFunction != null) {
//            if ($.isFunction(eventFunction)) {
//                tag.bind(eventName, eventFunction);
//            } else if (typeof eventFunction === "string") {
//                if (eventFunction.indexOf("(") > -1) {
//                    tag.bind(eventName, function () {
//                        return eval(eventFunction);
//                    });
//                } else {
//                    var fun = eval(eventFunction);
//                    if ($.isFunction(fun)) {
//                        tag.bind(eventName, fun);
//                    }
//                }
//            }
//        }
//    }

    jQuery.fn.outerHTML = function () {
        return $("<div></div>").append(this.eq(0).clone()).html();
    };

    var _submit = $.fn.submit; 
	$.fn.submit = function(){
	    _submit.apply(this,arguments);
		if(arguments.length<=0 && this.length>0 && 
			this[0].tagName === "FORM" && 
			this.attr("ctrlrole") === "form" &&
			this.attr("onsubmit") === "return false"){
				this[0].submit();
		}
	}

    $.browserUtil = $.browserUtil || {};
    $.extend($.browserUtil, {
        getIEVersion:function () {
            var ie = /MSIE (\d+)/.exec(navigator.userAgent);
            if (ie && ie != null && $.isArray(ie)) {
                return ie[1];
            }
        },
        userBrowser:function () {
            var browserName = navigator.userAgent.toLowerCase();
            if (/msie/i.test(browserName) && !/opera/.test(browserName)) {
                return "ie";
            } else if (/firefox/i.test(browserName)) {
                return "firefox";
            } else if (/chrome/i.test(browserName) && /webkit/i.test(browserName) && /mozilla/i.test(browserName)) {
                return "chrome";
            } else if (/opera/i.test(browserName)) {
                return "opera";
            } else if (/webkit/i.test(browserName) && !(/chrome/i.test(browserName) && /webkit/i.test(browserName) && /mozilla/i.test(browserName))) {
                return "webkit";
            } else {
                return "unknow";
            }
        }
    });

    $.ieHack = $.ieHack || {};
    $.ieHack.resizeFunctions = [];
    var widthVar = "resize$Width",
        heightVar = "resize$Height",
		reasonVar = "resize$Reason";;
    $.extend($.ieHack, {
        //屏蔽ie下无限制的resize循环问题
        hackResize:function (srcFun, elem) {
            $.ieHack.resizeFunctions.push(srcFun);
        },
        resize:function () {
            var elem = $("body");
            var winNewWidth = $(window).width(), winNewHeight = $(window).height(), resizeTimeout;
            var win$Width = elem.data(widthVar) || -1, win$Height = elem.data(heightVar) || -1;
            if (win$Width != winNewWidth || (win$Height != winNewHeight && !waf.crossDomainUtil.isWafPortal())) {
				//记录引起resize的原因，拖动表格列（列标题较长，缩小时列高度发生变化，会触发resizeGrid，但此时不需要setGridWidth）
				elem.data(reasonVar,win$Width != winNewWidth ? "width" : "height");
                window.clearTimeout(resizeTimeout);
                resizeTimeout = window.setTimeout(function () {
                    if ($.ieHack.resizeFunctions.length > 0) {
                        for (var i = 0; i < $.ieHack.resizeFunctions.length; i++) {
                            $.ieHack.resizeFunctions[i].call(elem);
                        }
                    }
					elem.data(reasonVar,null);//清除reason
                }, 10);
            }
            //Update the width and height
            $(elem).data(widthVar, winNewWidth);
            $(elem).data(heightVar, winNewHeight);
        }
    });

    /*$.defineCustomeClass = function (subClassName, superClass, prototype) {
     var clzPath = subClassName.substr(0, subClassName.lastIndexOf('.'));
     var ns = Namespace.register(clzPath);
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
     waf.inherit(subClass, superClass);

     for (var p in prototype) {
     eval(subClassName + ".prototype." + p.toString() + "=prototype." + p.toString());
     }
     };*/


    var QueryObject = (function () {
        function QueryObject(d, q) {
            if (typeof(d) == "string") {
                d = $.data(d);
            }
            var self = this,
                _data = d,
                _usecase = true,
                _trim = false,
                _query = q,
                _stripNum = /[\$,%]/g,
                _lastCommand = null,
                _lastField = null,
                _orDepth = 0,
                _negate = false,
                _queuedOperator = "",
                _sorting = [],
                _useProperties = true;
            if (typeof(d) == "object" && d.push) {
                if (d.length > 0) {
                    if (typeof(d[0]) != "object") {
                        _useProperties = false;
                    } else {
                        _useProperties = true;
                    }
                }
            } else {
                throw "data provides is not an array";
            }
            this._hasData = function () {
                return _data === null ? false : _data.length === 0 ? false : true;
            };
            this._getStr = function (s) {
                var phrase = [];
                if (_trim) {
                    phrase.push("jQuery.trim(");
                }
                phrase.push("String(" + s + ")");
                if (_trim) {
                    phrase.push(")");
                }
                if (!_usecase) {
                    phrase.push(".toLowerCase()");
                }
                return phrase.join("");
            };
            this._strComp = function (val) {
                if (typeof(val) == "string") {
                    return".toString()";
                } else {
                    return"";
                }
            };
            this._group = function (f, u) {
                return({field:f.toString(), unique:u, items:[]});
            };
            this._toStr = function (phrase) {
                if (_trim) {
                    phrase = $.trim(phrase);
                }
                phrase = phrase.toString().replace(/\\/g, '\\\\').replace(/\"/g, '\\"');
                return _usecase ? phrase : phrase.toLowerCase();
            };
            this._funcLoop = function (func) {
                var results = [];
                $.each(_data, function (i, v) {
                    results.push(func(v));
                });
                return results;
            };
            this._append = function (s) {
                var i;
                if (_query === null) {
                    _query = "";
                } else {
                    _query += _queuedOperator === "" ? " && " : _queuedOperator;
                }
                for (i = 0; i < _orDepth; i++) {
                    _query += "(";
                }
                if (_negate) {
                    _query += "!";
                }
                _query += "(" + s + ")";
                _negate = false;
                _queuedOperator = "";
                _orDepth = 0;
            };
            this._setCommand = function (f, c) {
                _lastCommand = f;
                _lastField = c;
            };
            this._resetNegate = function () {
                _negate = false;
            };
            this._repeatCommand = function (f, v) {
                if (_lastCommand === null) {
                    return self;
                }
                if (f !== null && v !== null) {
                    return _lastCommand(f, v);
                }
                if (_lastField === null) {
                    return _lastCommand(f);
                }
                if (!_useProperties) {
                    return _lastCommand(f);
                }
                return _lastCommand(_lastField, f);
            };
            this._equals = function (a, b) {
                return(self._compare(a, b, 1) === 0);
            };
            this._compare = function (a, b, d) {
                var toString = Object.prototype.toString;
                if (d === undefined) {
                    d = 1;
                }
                if (a === undefined) {
                    a = null;
                }
                if (b === undefined) {
                    b = null;
                }
                if (a === null && b === null) {
                    return 0;
                }
                if (a === null && b !== null) {
                    return 1;
                }
                if (a !== null && b === null) {
                    return -1;
                }
                if (toString.call(a) === '[object Date]' && toString.call(b) === '[object Date]') {
                    if (a < b) {
                        return -d;
                    }
                    if (a > b) {
                        return d;
                    }
                    return 0;
                }
                if (!_usecase && typeof(a) !== "number" && typeof(b) !== "number") {
                    a = String(a).toLowerCase();
                    b = String(b).toLowerCase();
                }
                if (a < b) {
                    return -d;
                }
                if (a > b) {
                    return d;
                }
                return 0;
            };
            this._performSort = function () {
                if (_sorting.length === 0) {
                    return;
                }
                _data = self._doSort(_data, 0);
            };
            this._doSort = function (d, q) {
                var by = _sorting[q].by,
                    dir = _sorting[q].dir,
                    type = _sorting[q].type,
                    dfmt = _sorting[q].datefmt;
                if (q == _sorting.length - 1) {
                    return self._getOrder(d, by, dir, type, dfmt);
                }
                q++;
                var values = self._getGroup(d, by, dir, type, dfmt);
                var results = [];
                for (var i = 0; i < values.length; i++) {
                    var sorted = self._doSort(values[i].items, q);
                    for (var j = 0; j < sorted.length; j++) {
                        results.push(sorted[j]);
                    }
                }
                return results;
            };
            this._getOrder = function (data, by, dir, type, dfmt) {
                var sortData = [], _sortData = [], newDir = dir == "a" ? 1 : -1, i, ab, j,
                    findSortKey;

                if (type === undefined) {
                    type = "text";
                }
                if (type == 'float' || type == 'number' || type == 'currency' || type == 'numeric') {
                    findSortKey = function ($cell) {
                        var key = parseFloat(String($cell).replace(_stripNum, ''));
                        return isNaN(key) ? 0.00 : key;
                    };
                } else if (type == 'int' || type == 'integer') {
                    findSortKey = function ($cell) {
                        return $cell ? parseFloat(String($cell).replace(_stripNum, '')) : 0;
                    };
                } else if (type == 'date' || type == 'datetime') {
                    findSortKey = function ($cell) {
                        return $.wafutil.parseDate(dfmt, $cell).getTime();
                    };
                } else if ($.isFunction(type)) {
                    findSortKey = type;
                } else {
                    findSortKey = function ($cell) {
                        if (!$cell) {
                            $cell = "";
                        }
                        return $.trim(String($cell).toUpperCase());
                    };
                }
                $.each(data, function (i, v) {
                    ab = by !== "" ? $.jgrid.getAccessor(v, by) : v;
                    if (ab === undefined) {
                        ab = "";
                    }
                    ab = findSortKey(ab, v);
                    _sortData.push({ 'vSort':ab, 'index':i});
                });

                _sortData.sort(function (a, b) {
                    a = a.vSort;
                    b = b.vSort;
                    return self._compare(a, b, newDir);
                });
                j = 0;
                var nrec = data.length;
                // overhead, but we do not change the original data.
                while (j < nrec) {
                    i = _sortData[j].index;
                    sortData.push(data[i]);
                    j++;
                }
                return sortData;
            };
            this._getGroup = function (data, by, dir, type, dfmt) {
                var results = [],
                    group = null,
                    last = null, val;
                $.each(self._getOrder(data, by, dir, type, dfmt), function (i, v) {
                    val = $.jgrid.getAccessor(v, by);
                    if (val === undefined) {
                        val = "";
                    }
                    if (!self._equals(last, val)) {
                        last = val;
                        if (group !== null) {
                            results.push(group);
                        }
                        group = self._group(by, val);
                    }
                    group.items.push(v);
                });
                if (group !== null) {
                    results.push(group);
                }
                return results;
            };
            this.ignoreCase = function () {
                _usecase = false;
                return self;
            };
            this.useCase = function () {
                _usecase = true;
                return self;
            };
            this.trim = function () {
                _trim = true;
                return self;
            };
            this.noTrim = function () {
                _trim = false;
                return self;
            };
            this.execute = function () {
                var match = _query, results = [];
                if (match === null) {
                    return self;
                }
                $.each(_data, function () {
                    if (eval(match)) {
                        results.push(this);
                    }
                });
                _data = results;
                return self;
            };
            this.data = function () {
                return _data;
            };
            this.select = function (f) {
                self._performSort();
                if (!self._hasData()) {
                    return[];
                }
                self.execute();
                if ($.isFunction(f)) {
                    var results = [];
                    $.each(_data, function (i, v) {
                        results.push(f(v));
                    });
                    return results;
                }
                return _data;
            };
            this.hasMatch = function () {
                if (!self._hasData()) {
                    return false;
                }
                self.execute();
                return _data.length > 0;
            };
            this.andNot = function (f, v, x) {
                _negate = !_negate;
                return self.and(f, v, x);
            };
            this.orNot = function (f, v, x) {
                _negate = !_negate;
                return self.or(f, v, x);
            };
            this.not = function (f, v, x) {
                return self.andNot(f, v, x);
            };
            this.and = function (f, v, x) {
                _queuedOperator = " && ";
                if (f === undefined) {
                    return self;
                }
                return self._repeatCommand(f, v, x);
            };
            this.or = function (f, v, x) {
                _queuedOperator = " || ";
                if (f === undefined) {
                    return self;
                }
                return self._repeatCommand(f, v, x);
            };
            this.orBegin = function () {
                _orDepth++;
                return self;
            };
            this.orEnd = function () {
                if (_query !== null) {
                    _query += ")";
                }
                return self;
            };
            this.isNot = function (f) {
                _negate = !_negate;
                return self.is(f);
            };
            this.is = function (f) {
                self._append('this.' + f);
                self._resetNegate();
                return self;
            };
            this._compareValues = function (func, f, v, how, t) {
                var fld;
                if (_useProperties) {
                    fld = 'jQuery.jgrid.getAccessor(this,\'' + f + '\')';
                } else {
                    fld = 'this';
                }
                if (v === undefined) {
                    v = null;
                }
                //var val=v===null?f:v,
                var val = v,
                    swst = t.stype === undefined ? "text" : t.stype;
                if (v !== null) {
                    switch (swst) {
                        case 'int':
                        case 'integer':
                            val = (isNaN(Number(val)) || val === "") ? '0' : val; // To be fixed with more inteligent code
                            fld = 'parseInt(' + fld + ',10)';
                            val = 'parseInt(' + val + ',10)';
                            break;
                        case 'float':
                        case 'number':
                        case 'numeric':
                            val = String(val).replace(_stripNum, '');
                            val = (isNaN(Number(val)) || val === "") ? '0' : val; // To be fixed with more inteligent code
                            fld = 'parseFloat(' + fld + ')';
                            val = 'parseFloat(' + val + ')';
                            break;
                        case 'date':
                        case 'datetime':
                            val = String($.jgrid.parseDate(t.newfmt || 'Y-m-d', val).getTime());
                            fld = 'jQuery.jgrid.parseDate("' + t.srcfmt + '",' + fld + ').getTime()';
                            break;
                        default :
                            fld = self._getStr(fld);
                            val = self._getStr('"' + self._toStr(val) + '"');
                    }
                }
                self._append(fld + ' ' + how + ' ' + val);
                self._setCommand(func, f);
                self._resetNegate();
                return self;
            };
            this.equals = function (f, v, t) {
                return self._compareValues(self.equals, f, v, "==", t);
            };
            this.notEquals = function (f, v, t) {
                return self._compareValues(self.equals, f, v, "!==", t);
            };
            this.isNull = function (f, v, t) {
                return self._compareValues(self.equals, f, null, "===", t);
            };
            this.greater = function (f, v, t) {
                return self._compareValues(self.greater, f, v, ">", t);
            };
            this.less = function (f, v, t) {
                return self._compareValues(self.less, f, v, "<", t);
            };
            this.greaterOrEquals = function (f, v, t) {
                return self._compareValues(self.greaterOrEquals, f, v, ">=", t);
            };
            this.lessOrEquals = function (f, v, t) {
                return self._compareValues(self.lessOrEquals, f, v, "<=", t);
            };
            this.startsWith = function (f, v) {
                var val = (v === undefined || v === null) ? f : v,
                    length = _trim ? $.trim(val.toString()).length : val.toString().length;
                if (_useProperties) {
                    self._append(self._getStr('jQuery.jgrid.getAccessor(this,\'' + f + '\')') + '.substr(0,' + length + ') == ' + self._getStr('"' + self._toStr(v) + '"'));
                } else {
                    length = _trim ? $.trim(v.toString()).length : v.toString().length;
                    self._append(self._getStr('this') + '.substr(0,' + length + ') == ' + self._getStr('"' + self._toStr(f) + '"'));
                }
                self._setCommand(self.startsWith, f);
                self._resetNegate();
                return self;
            };
            this.endsWith = function (f, v) {
                var val = (v === undefined || v === null) ? f : v,
                    length = _trim ? $.trim(val.toString()).length : val.toString().length;
                if (_useProperties) {
                    self._append(self._getStr('jQuery.jgrid.getAccessor(this,\'' + f + '\')') + '.substr(' + self._getStr('jQuery.jgrid.getAccessor(this,\'' + f + '\')') + '.length-' + length + ',' + length + ') == "' + self._toStr(v) + '"');
                } else {
                    self._append(self._getStr('this') + '.substr(' + self._getStr('this') + '.length-"' + self._toStr(f) + '".length,"' + self._toStr(f) + '".length) == "' + self._toStr(f) + '"');
                }
                self._setCommand(self.endsWith, f);
                self._resetNegate();
                return self;
            };
            this.contains = function (f, v) {
                if (_useProperties) {
                    self._append(self._getStr('jQuery.jgrid.getAccessor(this,\'' + f + '\')') + '.indexOf("' + self._toStr(v) + '",0) > -1');
                } else {
                    self._append(self._getStr('this') + '.indexOf("' + self._toStr(f) + '",0) > -1');
                }
                self._setCommand(self.contains, f);
                self._resetNegate();
                return self;
            };
            this.groupBy = function (by, dir, type, datefmt) {
                if (!self._hasData()) {
                    return null;
                }
                return self._getGroup(_data, by, dir, type, datefmt);
            };
            this.orderBy = function (by, dir, stype, dfmt) {
                dir = dir === undefined || dir === null ? "a" : $.trim(dir.toString().toLowerCase());
                if (stype === null || stype === undefined) {
                    stype = "text";
                }
                if (dfmt === null || dfmt === undefined) {
                    dfmt = "Y-m-d";
                }
                if (dir == "desc" || dir == "descending") {
                    dir = "d";
                }
                if (dir == "asc" || dir == "ascending") {
                    dir = "a";
                }
                _sorting.push({by:by, dir:dir, type:stype, datefmt:dfmt});
                return self;
            };
        }

        return QueryObject;
    })();

    var TemplateEngine = (function () {
        function TemplateEngine(engine, engineName) {
            this.name = engineName;
            this.engine = engine;
        }

        $.extend(TemplateEngine.prototype, {
            compile:function (t) {
                switch (this.name) {
                    case "Hogan":
                        return this.engine.compile(t);
                }
            },
            render:function (cr, values) {
                switch (this.name) {
                    case "Hogan":
                        return cr.render(values);
                }
            }
        });
        return TemplateEngine;
    })();

    $.popup = $.popup || {};
    $.extend($.popup, {
        showRemind:function (target, msg) {
            $(target).powerFloat({
                targetMode:"remind",
                eventType:"none",
                target:msg,
                zIndex:$(target).zIndex() + 10,
                position:'1-4',
                offsets:{x:20, y:0}
            });
        }
    });

    $.log = $.log || {};
    $.extend($.log, {
        debugMsg:[],
        lazyInits:[],
        start:function () {
            return new Date().getTime();
        },
        end:function (start, msg) {
            var end = new Date().getTime(), span = end - start;
            try {
                var info = {msg:msg, time:span};
                $.log.debugMsg.push(info);
            } catch (e) {
            }
        },
        lazyLog:function (p) {
            $.log.lazyInits.push(p);
        }
    });

    // 对Date的扩展，将 Date 转化为指定格式的String
    // 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
    // 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
    // 例子：
    // (new Date()).format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
    // (new Date()).format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
    Date.prototype.format = function (fmt) {
        var o = {
            "M+":this.getMonth() + 1, //月份
            "d+":this.getDate(), //日
            "h+":this.getHours(), //小时
            "m+":this.getMinutes(), //分
            "s+":this.getSeconds(), //秒
            "q+":Math.floor((this.getMonth() + 3) / 3), //季度
            "S":this.getMilliseconds()             //毫秒
        };
        if (/(y+)/.test(fmt))
            fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    };


    String.prototype.endWith = function (str) {
        if (str == null || str == "" || this.length == 0 || str.length > this.length)
            return false;
        if (this.substring(this.length - str.length) == str)
            return true;
        else
            return false;
        return true;
    };

    String.prototype.startWith = function (str) {
        if (str == null || str == "" || this.length == 0 || str.length > this.length)
            return false;
        if (this.substr(0, str.length) == str)
            return true;
        else
            return false;
        return true;
    };


    $.placeholder = $.placeholder || {};
    $.extend($.placeholder, {
        addPlaceHolder:function (input, ph) {
            if (this.isSupportPlaceHolder()) {
                input.attr("placeholder", ph);
                input.removeAttr();
                input.focus();
            } else {
//              if (input.val() === "") {
                    input.val(ph);
                    input.addClass("placeholder");
					input.attr("ph",ph);
//              }

                input.focus(function () {
                    if (input.hasClass("placeholder")) {
                        input.removeClass("placeholder");
                        input.val('');
                    }
                });
                input.blur(function () {
                    if (input.val() === "") {
                        input.val(input.attr("ph"));
                        input.addClass("placeholder");
                    }
                });
            }
        },
        removePlaceHolder:function (input, ph) {
            if (this.isSupportPlaceHolder()) {
                input.removeAttr("placeholder");
            } else {
                if (input.hasClass("placeholder")) {
                    input.removeClass("placeholder");
                }
            }
        },
        isSupportPlaceHolder:function () {
            return !!('placeholder' in document.createElement('input'));
        }
    });
    
    $.nationalFormat = $.nationalFormat || {};
    $.extend($.nationalFormat, {
        getFormatType:function(){
                return ['wafTimePicker','wafDatePicker','wafDatetimePicker','wafNumberField','datepicker',
                'timepicker','date','datetime','time','float','number','numeric','int','integer','currency'];
        },
        //处理国际化信息，优先级：元数据》gui客启端》控件
        setNationalFormat:function (options,type) {
            if(typeof(_self)=="undefined" || !(_self && _self._pageInitData && _self._pageInitData.nationalFormat)){
                return;
            }
            var timeFormat = _self._pageInitData.nationalFormat.timeFormat,
                dateFormat = _self._pageInitData.nationalFormat.dateFormat,
                numberFormat = JSON.parse(_self._pageInitData.nationalFormat.numberFormat),
                //{"thousandsSeparator":",","decimalSeparator":"."}
                currencyFormat = JSON.parse(_self._pageInitData.nationalFormat.currencyFormat);
                //{"thousandsSeparator":",","decimalSeparator":".","currencyPrefix":"￥"}
            
            options = options || {};
            switch (type) {
                case 'wafTimePicker':
                case 'timepicker':
                    if(timeFormat && options.timeFormat == undefined){
                        options.timeFormat = timeFormat;
                    }
                    break;
                case 'wafDatePicker': 
                    if(dateFormat && options.dateFormat == undefined){
                        options.dateFormat = dateFormat;
                    }
                    break;
                case 'datepicker': 
                    if(dateFormat && options.dateFormat == undefined){
                        options.dateFormat = dateFormat;
                    }
                    if(timeFormat && options.timeFormat == undefined){
                        $.nationalFormat.setFormatForDatetime(options,timeFormat);
                    }
                    break;
                case 'wafDatetimePicker':
                    if(dateFormat && options.dateFormat == undefined){
                        options.dateFormat = dateFormat;
                    }
                    if(timeFormat && options.timeFormat == undefined){
                        $.nationalFormat.setFormatForDatetime(options,timeFormat);
                    }
                    break;
                case 'wafNumberField':
                    //数字,formatType默认值number
                    if((options.formatType == undefined ||options.formatType == "number") && numberFormat
                        && options.groupSymbol == undefined){
                        options.groupSymbol = numberFormat.thousandsSeparator;
                    }
                    //货币
                    else if(options.formatType == "currency" && currencyFormat){
                        if(options.currencySymbol == undefined){
                            options.currencySymbol = currencyFormat.currencyPrefix; 
                        }
                        if(options.groupSymbol == undefined){
                            options.groupSymbol = currencyFormat.thousandsSeparator;    
                        }
                    }
                    break;
                case 'date':
                    if(options.newformat == undefined && dateFormat){
                        options.newformat = dateFormat;
                    }
                    break;
                case 'datetime':
                    if(options.dateFormat == undefined && dateFormat){
                        options.dateFormat = dateFormat;
                    }
                    if(options.timeFormat == undefined && timeFormat){
                        $.nationalFormat.setFormatForDatetime(options,timeFormat);
                    }
                    break;
                case 'time':
                    if(options.timeFormat == undefined && timeFormat){
                        options.timeFormat = timeFormat;
                    }
                    break;
                case 'float':
                case 'number':
                case 'numeric':
                    if(options.thousandsSeparator == undefined && numberFormat){
                        options.thousandsSeparator = numberFormat.thousandsSeparator;
                    }
                    if(options.decimalSeparator == undefined && numberFormat){
                        options.decimalSeparator = numberFormat.decimalSeparator;
                    }
                    break;
                case 'int':
                case 'integer':
                    if(options.thousandsSeparator == undefined && numberFormat){
                        options.thousandsSeparator = numberFormat.thousandsSeparator;
                    }
                    break;
                case 'currency':
                    if(options.thousandsSeparator == undefined && currencyFormat){
                        options.thousandsSeparator = currencyFormat.thousandsSeparator; 
                    }
                    if(options.decimalSeparator == undefined && currencyFormat){
                        options.decimalSeparator = currencyFormat.decimalSeparator; 
                    }
                    if(options.prefix == undefined && currencyFormat){
                        options.prefix = currencyFormat.currencyPrefix;
                    }
                    break;
                default :
            }
        },
        setFormatForDatetime:function(options,timeFormat){
            //暂不考虑格式化带a的，因为时间日期控件暂不支持(改动量较大)
            if(timeFormat.startWith("a") || timeFormat.endWith("a")){
                options.timeFormat = $.trim(timeFormat.replace("a",""));
            }else{
                options.timeFormat = timeFormat;
            }
        }
    });

    //表格列格式化时，未引入相应控件的方法，做抽取出来，形成通用方法
    $.formatter = $.formatter || {};
    $.extend($.formatter, {
        formatTime:function(value, opt){
            if(opt && opt.timeFormat == undefined || value == undefined){
                return;
            }
            var time = value.split(":"),showMeridian,showMeridianPosition;
            var completion = function completion(val,isneedAddZero){
                return val < 10 && isneedAddZero ? '0' + val : "" + val;
            }
            //用于控制时间是否显示小时位前面的0，如可以控显示这两种格式：07:25:36与7:25:36
            var isneedAddZero = (opt.timeFormat.toLowerCase().split("h").length-1)==1 ? false : true;
            //用于控件时间下午或下午是否显示，以及它的位置
            if(opt.timeFormat.toLowerCase().indexOf("a") != -1){
                showMeridian = true;
                if(opt.timeFormat.toLowerCase().indexOf("a") == 0){
                    showMeridianPosition = true;
                }else{
                    showMeridianPosition = false;
                }
            }
            var text,
                hour = completion(parseInt(time[0]).toString(),isneedAddZero),
                minute = completion(time[1],true),
                second = completion(time[2],true),
                meridian = $.util.meridian[(time[0] < 12 ? 'am' : 'pm')];

            text = hour + ":" + minute + ":" + second;
            if(showMeridian){
                if(showMeridianPosition){
                    text = (" " + meridian) + text;
                }else{
                    text = text + (" " + meridian);
                }
            }
            return text;
        }
    });
    
    //文本框、文本区、多语言文本框、多语言文本区、数字框、密码框的最小(大)长度校验
    $.validateTips = $.validateTips || {};
    $.extend($.validateTips, {
        showTips:function(input,maxlength,type){
            var info;
            switch(type){
                case "maxlength": info = $.util.info.maxlength; break;
                case "minlength": info = $.util.info.minlength; break;
                case "max": info = $.util.info.max; break;
                case "min": info = $.util.info.min; break;
            }
            waf.popMsg.show(input,{content:info+maxlength});
            this.hideTips(2000);
        },
        hideTips:function(time){
            if(time){
                setTimeout("$('body').find('div.popover').remove()",time);
            }else{
                $('body').find('div.popover').remove();
            }
        },
        validateLengthRules:function(event,input){
            var options = event.data.options,
                maxlength = options.maxlength,
                minlength = options.minlength,
                inputByteLength = input.value.replace(/[^\x00-\xff]/g, 'xx').length;
            if(maxlength && maxlength == inputByteLength){
                if(event.keyCode == 8){
                    this.hideTips();
                }else{
                    this.showTips(input,maxlength,"maxlength");
                }
            }else if(minlength && (minlength-1 == inputByteLength || minlength == inputByteLength)){
                if(event.keyCode == 8){
                    this.showTips(input,minlength,"minlength");
                }else{
                    this.hideTips();
                }
            }else if (maxlength && maxlength < inputByteLength) {
                this.showTips(input,maxlength,"maxlength");
            }else if(minlength && minlength > inputByteLength){
                this.showTips(input,minlength,"minlength");
            }else{
                this.hideTips();
            }
        }
    });


})(jQuery);

(function ($) {
	var enter2tabClass = "enter2tab",
		dataFlg = "enter2tab.data",
		stableSortKey = "enter2tabSortKey";
	
	var keyCodeMap = {};
		keyCodeMap["16"] = "shift";
		keyCodeMap["17"] = "ctrl";
		keyCodeMap["18"] = "alt";
		keyCodeMap["48"] = "0";
		keyCodeMap["49"] = "1";
		keyCodeMap["50"] = "2";
		keyCodeMap["51"] = "3";
		keyCodeMap["52"] = "4";
		keyCodeMap["53"] = "5";
		keyCodeMap["54"] = "6";
		keyCodeMap["55"] = "7";
		keyCodeMap["56"] = "8";
		keyCodeMap["57"] = "9";
		keyCodeMap["65"] = "a";
		keyCodeMap["66"] = "b";
		keyCodeMap["67"] = "c";
		keyCodeMap["68"] = "d";
		keyCodeMap["69"] = "e";
		keyCodeMap["70"] = "f";
		keyCodeMap["71"] = "g";
		keyCodeMap["72"] = "h";
		keyCodeMap["73"] = "i";
		keyCodeMap["74"] = "j";
		keyCodeMap["75"] = "k";
		keyCodeMap["76"] = "l";
		keyCodeMap["77"] = "m";
		keyCodeMap["78"] = "n";
		keyCodeMap["79"] = "o";
		keyCodeMap["80"] = "p";
		keyCodeMap["81"] = "q";
		keyCodeMap["82"] = "r";
		keyCodeMap["83"] = "s";
		keyCodeMap["84"] = "t";
		keyCodeMap["85"] = "u";
		keyCodeMap["86"] = "v";
		keyCodeMap["87"] = "w";
		keyCodeMap["88"] = "x";
		keyCodeMap["89"] = "y";
		keyCodeMap["90"] = "z";
	var regex = /(^ctrl\+([a-eg-mq-suvx-z0-9])$)|(^shift\+([a-z0-9])$)/;//除去ctrl+f、ctrl+t、ctrl+o、ctrl+p、ctrl+n、ctrl+w
	
    $.fn.enter2tab = function(options){
    	return this.each(function(){
    		if(!$(this).hasClass(enter2tabClass)){
				options = $.extend(true, {}, {beforeFocus:null, onFocus:null}, options);
				$(this).addClass(enter2tabClass).data(dataFlg, options);
    		} else {
                var opts = $(this).data(dataFlg);
                options = $.extend(true, {}, opts, options);
                $(this).data(dataFlg, options);
            }
			//给Field控件增加标识样式类，在waf.util.js initComponent中判断是否需要调用initRequireMask  TODO: 代码整理
			var ctrlrole = $(this).attr("ctrlrole"),
				waf2FieldCls = "waf2_field",
				excludes = "editGrid,linkButton,menuButton";//enter2tab的控件排除编辑表格、按钮和菜单
			if(excludes.indexOf(ctrlrole) < 0 && !$(this).hasClass(waf2FieldCls)){
				$(this).addClass(waf2FieldCls);
			}
    	});
    }

	$.enter2tab = $.enter2tab || {};
	
	$.extend($.enter2tab, {
		accesskeyRegex : regex,//快捷键格式正则表达式，方便在其它文件中验证的时候用
		enter : function(id, isPrev) {
			var self = $("#"+id),
				isPrev = !!isPrev;
				
			if(self[0]){
				_goAfter(self, isPrev);
			}
		},
		bindAccesskey:function(){
			//快捷键
			$(document).bind("keydown",function(event){
				if(event.ctrlKey && event.altKey && event.shiftKey && event.keyCode == 80){//ctrl+alt+shift+p
					waf.msgBox.showConfirm({
						summaryMsg:"是否删除当前页面的缓存内容？",
						buttonType:"ok-cancel",
						buttonCallBack:[
							function(){
								waf.doPost({
									url:waf.getContextPath() + "/tool/st.do?method=remove",
									data:{uipk:waf.getUrlParams().uipk},
									success:function(){
										location.reload();
									},
									error:function(){
										waf.msgBox.showWarning("清除缓存失败!");
									}
								});
							}
						]
					});
				}else if(event.keyCode === 8 && event.target.isContentEditable === false){
					//如果在页面不可编辑元素上按下退格键，阻止浏览器默认的goBack操作
					var target = event.target;
					if(target.tagName !== "INPUT" && target.tagName !== "TEXTAREA" || (target.tagName === "INPUT" && "text;password;file".indexOf(target.type) < 0) ||
						($(target).attr("disabled") !== undefined || $(target).attr("readonly") !== undefined)){//不论值如何有这两个属性即生效
						event.preventDefault();
					}
				}
				var key = keyCodeMap[event.keyCode];
				if(key){
					if(event.ctrlKey && key != 'ctrl'){
						key = "ctrl+" + key;
					}else if(event.shiftKey && key != 'shift'){
						key = "shift+" + key;
					}else if(event.altKey && key != 'alt'){
						key = "alt+" + key;
					}
					if(regex.test(key)){//快捷键格式正确而且是在显示的toolBar中
						var accessKeyBtn = _getAccesskeyArr(key).eq(0);
						if(accessKeyBtn.length > 0){
							event.preventDefault();
							setTimeout(function(){
								accessKeyBtn.trigger("click");
							},0);
							return false;
						}
					}
				}
			});
		},
		createAccesskeyTip:function(options){
			//options{top:工具栏的偏移坐标top值,left:工具栏的偏移坐标left值,width:工具栏的宽度,height:工具栏的高度}
			var numRegex = /^\d+(\.\d+)?$/;
			if(options && numRegex.test(options.top) && numRegex.test(options.left)){
				var tipTable = $("<table id='accesskeyTipTab' align='center'></table>");
				_getAccesskeyArr().each(function(index,value){
					if(regex.test($(value).attr("accesskey"))){
						tipTable.append("<tr><td style='min-width:100px;'>" + $(value).text() + "</td><td style='max-width:85px;'>" + $(value).attr("accesskey") + "</td></tr>");
					}
				});
				if(tipTable.find("td").length > 1){//存在正确格式的accessKey时才显示
					var tipImg = $("<img id='accesskeyTipImg' class='accessKeyTipImg'/>");
					var tipDiv = $("<div style='position:absolute;background-color:white;display:none;min-width:250px;max-width:500px;border:1px solid gray;' id='accesskeyTipDiv'><p style='text-align:center;'>快捷键说明</p></div>");
					tipDiv.append(tipTable);
					$("body").append(tipImg).append(tipDiv);
					tipImg.offset({
						top : options.top + (options.height - tipImg.height())/2,
						left : options.left + options.width - tipImg.width()
					});
					tipDiv.offset({
						top : tipImg.offset().top + tipImg.height(),
						left : tipImg.offset().left + tipImg.width() - tipDiv.width()
					});
					tipImg.hover(function(){$("#accesskeyTipDiv").show();},function(){$("#accesskeyTipDiv").hide();});
				}
			}
		},
		refreshAccesskeyTip:function(){
			var tipTable = $("#accesskeyTipTab");
			tipTable.children().remove();
			_getAccesskeyArr().each(function(index,value){
				if(regex.test($(value).attr("accesskey"))){
					tipTable.append("<tr><td style='min-width:100px;'>" + $(value).text() + "</td><td style='max-width:85px;'>" + $(value).attr("accesskey") + "</td></tr>");
				}
			});
		},
		initFocus : function() {
			var list = _getKeyboardList(),
				initFocusEle = list[0];
			
			list.each(function(idx, v){
				if(v.tabIndex > 0){
					initFocusEle = v;
					return false;
				}
				return true;
			});
			
            if(initFocusEle && initFocusEle.tabIndex == 0 && $(initFocusEle).hasClass('ui-linkbutton')){
               list.each(function(idx, v){
                    if(!$(v).hasClass('ui-linkbutton')){
                        initFocusEle = v;
                        return false;
                    }
                    return true;
                }); 
            }
			
			setTimeout(function(){
				//设置快捷键提示图片的显示位置
				var toolBar = $("div[ctrlrole='toolBar']:visible").eq(0);
				if(toolBar.length > 0){
					$.enter2tab.createAccesskeyTip({
						"width" : toolBar.width(),
						"height" : toolBar.height(),
						"top" : toolBar.offset().top,
						"left" : toolBar.offset().left
					});
				}
			},100);
            
			$.enter2tab.bindAccesskey();//绑定快捷键事件
			if(initFocusEle){				
				setTimeout(function(){
                    $(initFocusEle).focus();
                    $(initFocusEle).select();
                },0);
			}
		}
	});
 
	$("." + enter2tabClass).live("keydown", function(event){
		if(event.keyCode == 13 || event.keyCode == 9){
			var self = $(this);
			if((self.is("textarea") || self.is("table")) && !event.ctrlKey && !event.shiftKey && event.keyCode !== 9){
				return true;
			}
            if(self.is(".ui-linkbutton") && event.keyCode == 13){
                return true;
            }
		 	_goAfter(self, (event.shiftKey));
		 	return false;
		}
	});
		
	function _goAfter(self, isPrev){
		var isPrev = !!isPrev,
			after = _getAfter(self, isPrev);
	 	
	 	if(after){
	 		/*var options = after.data(dataFlg);
            if(options){
                if(!options.beforeFocus || options.beforeFocus.apply(this) !== false){ -- 
                    if(options.onFocus) options.onFocus.call(this,event);
                }
            }*/
            after.focus();
            if(after[0].tagName === 'TEXTAREA'){
                //如果是文本区则使光标到内容的最后
                var pos = $.trim(after.val()).length;
                var textarea = after[0];
                if (document.selection) {// IE
                    var r = textarea.createTextRange();
                    r.collapse(true);
                    r.moveStart('character',pos);
                    r.select();
                }else{
                    textarea.selectionStart = pos;
                    textarea.selectionEnd = pos;
                }
            }else{
                after.select();
            }
            var event = jQuery.Event("focus");
            event.target = after;
	 	}
	}
	
	function _getAfter(self, isPrev){
		isPrev = !!isPrev;
		var list = _getKeyboardList(),
			afterIdx = list.index(self),
			isRadio = self.is(":radio"),
			name = self.attr("name"),
			after;
			
		while(true){
			if(isPrev){
				afterIdx--;
				afterIdx = afterIdx >= 0 ? afterIdx : (list.length - 1);
			}else{
				afterIdx++;
				afterIdx = afterIdx > (list.length - 1) ? 0 : afterIdx;
			}
			
			after = list.eq(afterIdx);
			if(after[0] == self[0]){
				after = null;
				break;
			}
			if(isRadio && after.is(":radio") && name == after.attr("name")){
				continue;
			}
			break;
		}
		
		if(after && after.is(":radio")){
	 		var afterRadioName = after.attr("name"),
	 			afterCheckedRadio;
	 		if(afterRadioName){
	 			afterCheckedRadio = list.filter(':radio:checked[name="'+afterRadioName+'"]:eq(0)');
	 			after = afterCheckedRadio[0] ? afterCheckedRadio : after;
	 		}
	 	}
	 	return after;
	}
	
	function _getKeyboardList(){
		return $("." + enter2tabClass + ":visible:not(.ui-state-disabled):not(:disabled)").filter(function(idx){
			return this.tabIndex >= 0;	
		})
		.each(function(i, v){
			v[stableSortKey] = i;
		})
		.sort(function(a, b){
			if(a.tabIndex == b.tabIndex){
				return a[stableSortKey] - b[stableSortKey];
			}
			return a.tabIndex - b.tabIndex;
		});
	}
			
	function log(lg){
		if(console){
			console.log(lg);
		}
	}
	
	//快捷键
	function _getAccesskeyArr(key){
		//由于menuItem不在ToolBar下，所以要特殊处理
		var key = key ? "='" + key + "'" : "";
		//使用工具设置menuItem隐藏--li(display:none)，在页面的js设置menuItem隐藏--a(display:none)
		//由于父节点ul为display:none，子节点使用:visible判断在不全面，所以子节点还需要根据css属性值判断
		var menuItemAcckeys = $("[role='menu'] [ctrlrole='menuItem'][accesskey" + key + "]").filter(function(index){
			return $(this).css("display") != "none" && 
				   $(this).closest("li").eq(0).css("display") != "none" &&
				   $("#" + $("[ctrlrole='toolBar']:visible").eq(0).attr("id") + " #" + $(this).closest("[role='menu']").eq(0).attr("belong") + ":visible").length > 0;
		});
		return $.merge($("[ctrlrole='toolBar']:visible [accesskey" + key + "]:visible"),menuItemAcckeys);
	}
})(jQuery);
/**
 * jQuery JSON Plugin
 * version: 2.3 (2011-09-17)
 *
 * This document is licensed as free software under the terms of the
 * MIT License: http://www.opensource.org/licenses/mit-license.php
 *
 * Brantley Harris wrote this plugin. It is based somewhat on the JSON.org
 * website's http://www.json.org/json2.js, which proclaims:
 * "NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.", a sentiment that
 * I uphold.
 *
 * It is also influenced heavily by MochiKit's serializeJSON, which is
 * copyrighted 2005 by Bob Ippolito.
 */

(function( $ ) {

	var	escapeable = /["\\\x00-\x1f\x7f-\x9f]/g,
		meta = {
			'\b': '\\b',
			'\t': '\\t',
			'\n': '\\n',
			'\f': '\\f',
			'\r': '\\r',
			'"' : '\\"',
			'\\': '\\\\'
		};

	/**
	 * jQuery.toJSON
	 * Converts the given argument into a JSON respresentation.
	 *
	 * @param o {Mixed} The json-serializble *thing* to be converted
	 *
	 * If an object has a toJSON prototype, that will be used to get the representation.
	 * Non-integer/string keys are skipped in the object, as are keys that point to a
	 * function.
	 *
	 */
	$.toJSON = typeof JSON === 'object' && JSON.stringify
		? JSON.stringify
		: function( o ) {

		if ( o === null ) {
			return 'null';
		}

		var type = typeof o;

		if ( type === 'undefined' ) {
			return undefined;
		}
		if ( type === 'number' || type === 'boolean' ) {
			return '' + o;
		}
		if ( type === 'string') {
			return $.quoteString( o );
		}
		if ( type === 'object' ) {
			if ( typeof o.toJSON === 'function' ) {
				return $.toJSON( o.toJSON() );
			}
			if ( o.constructor === Date ) {
				var	month = o.getUTCMonth() + 1,
					day = o.getUTCDate(),
					year = o.getUTCFullYear(),
					hours = o.getUTCHours(),
					minutes = o.getUTCMinutes(),
					seconds = o.getUTCSeconds(),
					milli = o.getUTCMilliseconds();

				if ( month < 10 ) {
					month = '0' + month;
				}
				if ( day < 10 ) {
					day = '0' + day;
				}
				if ( hours < 10 ) {
					hours = '0' + hours;
				}
				if ( minutes < 10 ) {
					minutes = '0' + minutes;
				}
				if ( seconds < 10 ) {
					seconds = '0' + seconds;
				}
				if ( milli < 100 ) {
					milli = '0' + milli;
				}
				if ( milli < 10 ) {
					milli = '0' + milli;
				}
				return '"' + year + '-' + month + '-' + day + 'T' +
					hours + ':' + minutes + ':' + seconds +
					'.' + milli + 'Z"';
			}
			if ( o.constructor === Array ) {
				var ret = [];
				for ( var i = 0; i < o.length; i++ ) {
					ret.push( $.toJSON( o[i] ) || 'null' );
				}
				return '[' + ret.join(',') + ']';
			}
			var	name,
				val,
				pairs = [];
			for ( var k in o ) {
				type = typeof k;
				if ( type === 'number' ) {
					name = '"' + k + '"';
				} else if (type === 'string') {
					name = $.quoteString(k);
				} else {
					// Keys must be numerical or string. Skip others
					continue;
				}
				type = typeof o[k];

				if ( type === 'function' || type === 'undefined' ) {
					// Invalid values like these return undefined
					// from toJSON, however those object members
					// shouldn't be included in the JSON string at all.
					continue;
				}
				val = $.toJSON( o[k] );
				pairs.push( name + ':' + val );
			}
			return '{' + pairs.join( ',' ) + '}';
		}
	};

	/**
	 * jQuery.evalJSON
	 * Evaluates a given piece of json source.
	 *
	 * @param src {String}
	 */
	$.evalJSON = typeof JSON === 'object' && JSON.parse
		? JSON.parse
		: function( src ) {
		return eval('(' + src + ')');
	};

	/**
	 * jQuery.secureEvalJSON
	 * Evals JSON in a way that is *more* secure.
	 *
	 * @param src {String}
	 */
	$.secureEvalJSON = typeof JSON === 'object' && JSON.parse
		? JSON.parse
		: function( src ) {

		var filtered = 
			src
			.replace( /\\["\\\/bfnrtu]/g, '@' )
			.replace( /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
			.replace( /(?:^|:|,)(?:\s*\[)+/g, '');

		if ( /^[\],:{}\s]*$/.test( filtered ) ) {
			return eval( '(' + src + ')' );
		} else {
			throw new SyntaxError( 'Error parsing JSON, source is not valid.' );
		}
	};

	/**
	 * jQuery.quoteString
	 * Returns a string-repr of a string, escaping quotes intelligently.
	 * Mostly a support function for toJSON.
	 * Examples:
	 * >>> jQuery.quoteString('apple')
	 * "apple"
	 *
	 * >>> jQuery.quoteString('"Where are we going?", she asked.')
	 * "\"Where are we going?\", she asked."
	 */
	$.quoteString = function( string ) {
		if ( string.match( escapeable ) ) {
			return '"' + string.replace( escapeable, function( a ) {
				var c = meta[a];
				if ( typeof c === 'string' ) {
					return c;
				}
				c = a.charCodeAt();
				return '\\u00' + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
			}) + '"';
		}
		return '"' + string + '"';
	};

})( jQuery );
$.widget("ui.wafctrl", {
    options: {
        hidden: false,
        displayField: null,
        operateState: null,
        viewDisplayType: null
    },
    _create: function(){        
        this.options.displayField = this.options.displayField || "#" + this.element.attr('id') + '_view';
    },
    _setOptions: function(options) {
        var self = this;
        $.each(options, function(key, value) {
            self._setOption(key, value);
        });

        this._operateState();
        return this;
    },
    _operateState: function() {
        var isView = waf.wafutil.isViewOperateState(this.options),
            displayType = waf.wafutil.getViewDisplayType(this.options);
        this._displayTypeCancel();
        if(isView) {
            this["_" + displayType + "DisplayTypeOK"]();
        }
    },
    _displayTypeCancel: function() {
        this._wordonlyDisplayTypeCancel();
        this._disableDisplayTypeCancel();
    },
    _wordonlyDisplayTypeCancel: function() {
        var isHidden = this.options.hidden,
            view = $(this.options.displayField);
        this.widget()[isHidden ? 'hide' : 'show']();
        view.hide();
    },
    _wordonlyDisplayTypeOK: function() {
        var isHidden = this.options.hidden,
            view = $(this.options.displayField);
        this.widget().hide();
        view[isHidden ? 'hide' : 'show']();
    },
    _disableDisplayTypeCancel: function() {
        this._viewDisable(this.options.disabled);
    },
    _disableDisplayTypeOK: function() {
        this._viewDisable(true);
    },
    _viewDisable: function(isDisable) {
        this.widget()[ isDisable ? "addClass" : "removeClass"]
                (this.widgetBaseClass + "-disabled" + " " + "ui-state-disabled" )
                .attr( "aria-disabled", isDisable );
    },
    _setDisplayValue: function(value, isHtml) {
        isHtml = !! isHtml;
        $(this.options.displayField)[isHtml ? 'html' : 'text'](value);
    },
    _getTemplateEngine:function(engine,engineName){
        return $.wafutil.getTemplateEngine(engine,engineName);
    },
    _callWidgetFunction:function(methodName){
        return $.wafutil.invokeMethod($(this.element),this.widgetName,methodName);
    }
});

/**
 * web组件最高超类,利用widget
 */
$.widget("waf.WebComponent",{
	options:{
		id:null,
		ownerUI:null
	},
	setId:function(value) {
		this.option.id = value;
	},
	getId:function() {
		return this.option.id;
	},
	getLocaleResourceObject:function(localeClassName){
		return waf.createObject(eval(localeClassName + "_LocaleStr_" + waf.getContext().locale.toLowerCase()));
	},
	option: function( key, value ) {
		var options = key;

		if ( arguments.length === 0 ) {
			// don't return a reference to the internal hash
			return $.extend( {}, this.options );
		}

		if  (typeof key === "string" ) {
			if ( value === undefined ) {
				if(this.options.hasOwnProperty(key)) {
					return this.options[ key ];
				}
				else {
					var method=key.charAt(0).toUpperCase() + key.substr(1);
					return eval("this._get" + method + "();");
				}
			}
			options = {};
			options[ key ] = value;
		}

		this._setOptions( options );

		return this;
	},
	_setOptions: function( options ) {
		var self = this;
		$.each( options, function( key, value ) {
			if(self.options.hasOwnProperty(key)) {
				self._setOption( key, value );
			}
			else {
				var method=key.charAt(0).toUpperCase() + key.substr(1);
				return eval("self._set" + method + "(value);");
			}
		});

		return this;
	},
	pingPostData:function(postData){
		var ajaxPostData = postData;
		ajaxPostData.componentID = this.getID();
		return ajaxPostData;
	}
});
$.boxLayoutUtil = $.boxLayoutUtil || {};
$.extend($.boxLayoutUtil,{
    getBorderWidth:function(elem){
        var leftwidth =parseInt($(elem).css('borderLeftWidth'),10);
        if($.isNaN(leftwidth)) leftwidth = 0;
        var rightwidth =parseInt($(elem).css('borderRightWidth'),10);
        if($.isNaN(rightwidth)) rightwidth = 0;
        return (leftwidth + rightwidth);
    },
    getPaddingWidth:function(elem){
        var leftwidth =parseInt($(elem).css('paddingLeft'),10);
        if($.isNaN(leftwidth)) leftwidth = 0;
        var rightwidth =parseInt($(elem).css('paddingRight'),10);
        if($.isNaN(rightwidth)) rightwidth = 0;
        return (leftwidth + rightwidth);
    },
    getMarginWidth:function(elem){
        var leftwidth =parseInt($(elem).css('marginLeft'),10);
        if($.isNaN(leftwidth)) leftwidth = 0;
        var rightwidth =parseInt($(elem).css('marginRight'),10);
        if($.isNaN(rightwidth)) rightwidth = 0;
        return (leftwidth + rightwidth);
    },
    getElementWidth:function(elem){
        if($.browser.msie&&($.browser.version == "6.0"||$.browser.version == "7.0")&&!$.support.style){
            return $(elem).width();
        }else{
            if($(elem).width()==0) return 0;
            return $(elem).width() +
                $.boxLayoutUtil.getBorderWidth(elem) +
                $.boxLayoutUtil.getPaddingWidth(elem) +
                $.boxLayoutUtil.getMarginWidth(elem);
        }
    },
    getBorderHeight:function(elem){
        var topHeight =parseInt($(elem).css('borderTopWidth'),10);
        if($.isNaN(topHeight)) topHeight = 0;
        var bottomHeight =parseInt($(elem).css('borderBottomWidth'),10);
        if($.isNaN(bottomHeight)) bottomHeight = 0;
        return (topHeight + bottomHeight);
    },
    getPaddingHeight:function(elem){
        var topHeight =parseInt($(elem).css('paddingTop'),10);
        if($.isNaN(topHeight)) topHeight = 0;
        var bottomHeight =parseInt($(elem).css('paddingBottom'),10);
        if($.isNaN(bottomHeight)) bottomHeight = 0;
        return (topHeight + bottomHeight);
    },
    getMarginHeight:function(elem){
        var top = $(elem).css('marginTop');
        var bottom = $(elem).css('marginBottom');
        top = $.isNaN(top)?0:parseInt(top,10);
        bottom = $.isNaN(bottom)?0:parseInt(bottom,10);
        return (top + bottom);
    },
    getElementHeight:function(elem){
        if($.browser.msie&&($.browser.version == "6.0"||$.browser.version == "7.0")&&!$.support.style){
            return $(elem).height();
        }else{
            if($(elem).height()==0) return 0;
            return $(elem).height() +
                $.boxLayoutUtil.getBorderHeight(elem) +
                $.boxLayoutUtil.getPaddingHeight(elem) +
                $.boxLayoutUtil.getMarginHeight(elem);
        }
    },
    userBrowser:function () {
        return $.browserUtil.userBrowser();
    },
    getContentHeight:function(elem){
        var browser = $.boxLayoutUtil.userBrowser();
        if("ie"===browser || "opera"===browser){
            return elem.scrollHeight;
        }else if("firefox"===browser || "chrome"===browser ||"webkit"===browser){
            return elem.offsetHeight();
        }
    }
});

;
window.ajaxs = 0;
waf("body").bind("ajaxSend",
    function (e, xhr, s) {
        window.ajaxs++;
    }).bind("ajaxComplete", function (e, xhr, s) {
        window.ajaxs--;
    });
return window.$; 
 });