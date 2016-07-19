var core = require('../../core/index');
var waf = core.waf;
var Component = core.Component;
var h = core.h;
var transfer = core.render.transfer;
var _ = core._;

var CTRLROLE = "section",
    MAINCLASS = ".ui-section";

function parseSummary(el, id) {
    var key = id + "_summary",
        fn = waf.elCache.get(key);
    if (!fn) {
        fn = waf.compile(el);
        waf.elCache.put(key, fn);
    }
    fn.call(this, el);
}

function toggle(){
	alert(989);
}

//TODO:这里还存在好多问题，el表达式的绑定，
function generateTree(options) {
    var id = options.id;
    var prop = {};
    //对attr的取值
    var attrs = {
        "ctrlrole": CTRLROLE
    };
    prop.attributes = attrs;
    if (options.style) {
        prop.styles = options.style;
    }
    //对class的取值
    var cls = [];
    cls.push(MAINCLASS);
    cls.push(options.tagClass ? "." + options.tagClass : "");
    //以上部门可以统一提取处理

    //对children的处理,TODO:这里存在问题，为什么是使用两个DOM来控制
    var icon = h("span.arrow" + (options.autoOpen ? ".ui-section-arrow-open" : ".ui-section-arrow-close"), [h("i")]);
    var title = h("span.title" + (options.autoOpen ? ".ui-section-minus" : ".ui-section-plus"), {
    	"ev-click":toggle
    },[options.title]);

    //TODO:这里还是需要表达式引擎来处理这些事情。
    var summary = h("span.summary" + (options.autoOpen ? "" : ".ui-section-summary"), {
        "attributes": {
            "summary": options.summary
        }
    }, [parseSummary(options.summary, id)]);

    //如果是字段布局，需要增加ui-columnLayout样式类
    var ccls = [];
    if (options.customLayout && (layoutName = options.customLayout.split(";")[0]) && /^field-(one|two|three)-col$/.test(layoutName)) {
        ccls.push(".ui-columnLayout");
    }
    ccls.push(options.autoOpen ? "" : "hide");

    var content = h("div#" + id + "_content.content" + ccls.join(""));

    var add = null;
    if (options.additional) {
        add = transfer(options.additional)
    }

    return h("div#" + id + cls.join(""), prop, [h("div.sheader", [icon, title, summary, add]), content]);

}

var WafSection = Component.extend({
    name: CTRLROLE,
    template: null,
    generateTree: _.bind(generateTree,this),
    addHeaderItem: function(source) {
        this.set("additional", source);
    },
    removeHeaderItem: function() {
        this.set("additional", null);
    },
    _toggle: function(show) {
        this.set("autoOpen", show);
        //TODO:暴露事件
        this.emit(show ? "onopen" : "onclose");
    },
});
WafSection.defaultOptions = {
    tagClass: '',
    style: '',
    title: '',
    openIconCls: 'ui-section-minus',
    closeIconCls: 'ui-section-plus',
    autoOpen: true,
    hidden: false,
    lazyLoad: false,
    summary: '',
    additional: null
};

module.exports = WafSection;