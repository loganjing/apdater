
function initDOMAssistant(waf) {
    waf.dom = waf.dom || {};
    waf.dom.getOptions = function(elem) {
        //TODO:直接从页面的状态对象中获取，如果获取不到，则从DOM_ATTRIBUTE中获取。
        return void 0;
    }

    waf.dom.buildOptionsByDom = function(elem) {
        var options = waf.dom.getOptions(elem) || {};
        var attrs = elem.attributes;
        for (var i = 0; i < attrs.length; i++) {
            //TODO:这里的属性应该根据组件中的名称过滤下，否则存在大小写之分
            options[attrs[i].name] = elem.getAttribute(attrs[i].name);
        }
        return options;
    }

    waf.dom.buildOptions = function(elem,arg1,arg2,arg3){
        //TODO:暂时这样合并，后续以状态为主
        return waf.extend({},arg1||{},arg2||{},arg3||{});
    }
}
module.exports = initDOMAssistant;