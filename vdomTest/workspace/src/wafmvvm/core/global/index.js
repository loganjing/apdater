//TODO:jquery可以被替换
var waf = require("jquery");

//这里可以动态的增加静态方法

var initDOMAssistant = require("./dom");
var initFnInvoke = require("./fnInvoke");
//var $ = require('jquery');
//TODO:想把组件实例的方法代理到jqeury对象上，可以直接调用，但可能产生冲突。
// var _$ = $;
// var $ = function(selector, context){
// 	var elem = _$(selector,context);
// 	//注入instance的方法到elem对象上，增加proxy
// 	if(elem.length>0 && elem[0].getAttribute("ctrlrole")){
//     }
//     //方法冲突怎么办？
//     return elem;
// }




initDOMAssistant(waf);
initFnInvoke(waf);

module.exports = waf;
