var core = require('../../core/index');
var waf = core.waf;
var h = core.h;
var renderChildrenTree = core.renderChildrenTree;

var CTRLROLE = "section",
    MAINCLASS = "ui-section";


function Section(options) {
    var id = options.id;
    //对attr的取值
    var sdiv = {
        props: {
            "ctrlrole": CTRLROLE,
            "id": id,
            className: [MAINCLASS, options.tagClass ? options.tagClass : ""].join(" ")
        }
    };

    //对children的处理
    var icon = h("span.arrow" + (options.autoOpen ? ".ui-section-arrow-open" : ".ui-section-arrow-close"), [h("i")]);
    var title = h("span.title" + (options.autoOpen ? ".ui-section-minus" : ".ui-section-plus"), {
        on: {
            click: toggle.bind(null,{type:"toggle"})
        }
    }, [options.title]);

    //TODO:这里还是需要表达式引擎来处理这些事情。
    var summContent = parseSummary(options.summary, id);
    var summary = h("span.summary" + (options.autoOpen ? "" : ".ui-section-summary"), {
        "props": {
            "summary": options.summary
        }
    }, summContent ? [summContent] : null);

    //如果是字段布局，需要增加ui-columnLayout样式类
    var ccls = [];
    if (options.customLayout && (layoutName = options.customLayout.split(";")[0]) && /^field-(one|two|three)-col$/.test(layoutName)) {
        ccls.push("ui-columnLayout");
    }
    ccls.push(options.autoOpen ? "" : "hide");

    var content = null;
    if (options.children) {
        content = h("div#" + id + "_content", {
            props: {
                className: "content " + ccls.join("")
            }
        }, renderChildrenTree(options.children));
    } else {
        content = h("div#" + id + "_content", {
            props: {
                className: "content " + ccls.join("")
            }
        })
    }
    return h("div", sdiv, [h("div.sheader", [icon, title, summary]), content]);
}

function update(state,action){
    if(action == "toggle"){
        state.autoOpen = false;
        return state;
    }
}

Section.defaultOptions = {
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

function parseSummary(el, id) {
    var key = id + "_summary",
        fn = waf.elCache.get(key);
    if (!fn) {
        fn = waf.compile(el);
        waf.elCache.put(key, fn);
    }
    fn.call(this, el);
}

function toggle() {
    //
    alert(989);
}

module.exports = Section;
waf.registerComponent("com.kingdee.bos.ctrl.web.Section", Section);