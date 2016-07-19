var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');
var createElement = require('virtual-dom/create-element');
var h = require('virtual-dom/h');


function render(newTree, oldTree,elem) {
	//TODO:如果oldTree是一个DOM，需要自动的从DOM构建Tree
	var ret ;
    if (!oldTree) {
        ret = createElement(newTree);
    } else {
        var patches = diff(oldTree, newTree);
        ret = patch(elem, patches);
    }
    ret.tree = newTree;
    return ret;
}


function innerTransfer(dom){
    var tree;
    //转换
    dom.tree = tree;
    return "";
}

//将dom转换成tree对象
function transfer(dom){
    if(dom.tree) return dom.tree
    else innerTransfer(dom);
}

render.transfer = transfer;

module.exports.render = render;
module.exports.h = h;