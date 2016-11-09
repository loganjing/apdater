var snabbdom = require('snabbdom');
var h = require('snabbdom/h');



var patch;

function init(snabbdomModule) {
    snabbdomModule = snabbdomModule || [];
    patch = snabbdom.init([
        require('snabbdom/modules/class'),
        require('snabbdom/modules/props'),
        require('snabbdom/modules/style'),
        require('snabbdom/modules/eventlisteners'),
    ].concat(snabbdomModule));
}

function render(oldTree, newTree) {
    //TODO:如果oldTree是一个DOM，需要自动的从DOM构建Tree
    // if(!oldTree){
    //     return patch(parent,newTree);
    // }
    return patch(oldTree, newTree);
}




init();
module.exports.render = render;
module.exports.h = h;