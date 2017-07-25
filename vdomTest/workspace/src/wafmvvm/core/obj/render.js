var render = require('../vdom/index').render;
var h = require('../vdom/index').h;
var VNode = require('snabbdom/vnode');
var patch =render;
var toHTML = require('snabbdom-to-html');

function initRegister(waf) {
    waf.registerComponent = function(type, fn) {
        components[type] = fn;
    }
}


var components = {};

function isCustomComponent(type) {
    return components[type] != void 0;
}

function isNativeComponent(type) {
    return "span" == type;
}


function renderApp(container, store) {
    var meta = store.get("meta");
    var oldNodes = container._vNode;
    var vNodes = renderChildTree(meta,store);
    if (!oldNodes) {
        var el = document.createElement('div');
        container.appendChild(el);
        var emptyVnode = VNode('div', {
            key: '_init'
        }, [], undefined, el);
        const appNode = render(emptyVnode, vNodes);
        container.appendChild(appNode.elm);
        container._vNode = vNodes;
    } else {
        render(oldNodes, vNodes);
        container._vNode = vNodes;
    }
    //console.log(toHTML(vNodes));
}

function renderChildrenTree(children,store) {
    var vNodes = [];
    for (var i = 0; i < children.length; i++) {
        vNodes.push(renderChildTree(children[i],store));
    }
    return vNodes;
}

function normizeNativeComponent(option) {
    //分离出style、class，on，其他添加到props中
    var type = option.componentType;
    var className = option.tagClass;
    var style = option.style;
    //TODO:他的children中也可能存在自定义组件，后续再拆分
    return h(type, option.children);
}

function view(option, _ref) {
    var render = _ref.render;
    var update = _ref.update;

    var newNode = render(option, function(action,e) {
        var newState = update(option, action,e);
        var tmp = view(newState, _ref);
        patch(newNode,tmp);
    });
    return newNode;
}

function renderChildTree(option,store) {
    var type = option.componentType;
    var tree;
    if (isCustomComponent(type)) {
        var fn = components[type];
        if(fn.functional){
            var com = new fn(store);
            tree = com.render(option);
        }else{
            tree = view(option, fn);
        }
        //TODO:type的融合&校验
        //对childrn的处理,组件内部已经对children做了处理
        return tree;
    } else if (isNativeComponent(type)) {
        return normizeNativeComponent(option);
        return h(type, option.children);
    }
}

module.exports = {
    initRegister: initRegister,
    renderApp: renderApp,
    renderChildrenTree: renderChildrenTree,
    renderChildTree: renderChildTree
}