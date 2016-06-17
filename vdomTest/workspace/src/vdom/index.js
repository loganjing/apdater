var $ = require('jquery');
var h = require('virtual-dom/h');
var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');
var createElement = require('virtual-dom/create-element');

var model = {
    items: []
};

var $container = $('.container');
var hyperItems = {};

var hyperFooter = h('div.dbl-top-margin', [
    h('input.form-control.item-name', {
        placeholder: '添加新项目',
        type: 'text'
    }),
    h('button.dbl-top-margin.btn.btn-primary.col-xs-12.item-add', '添加'),
    h('button.dbl-top-margin.btn.btn-primary.col-xs-12.batch-add', 'Render100')
]);

function generateTree(model) {
    return h('div', [
        h('span.timeConsumed'),
        h('ul.list-group.dbl-top-margin', model.items.map(function(item, index) {
            hyperItems[item.name] = hyperItems[item.name] || h('li.list-group-item', [
                item.name,
                h('button.item-remove.btn.btn-danger.btn-sm.float-right', {
                    value: item.name
                }, '删除')
            ]);
            return hyperItems[item.name];
        })),
        hyperFooter
    ])
}

var root, tree;

function render(model) {
    var newTree = generateTree(model);
    if (!root) {
        tree = newTree;
        root = createElement(tree);
        $container.append(root);
        return;
    }
    var patches = diff(tree, newTree);
    root = patch(root, patches);
    tree = newTree;
}

$container.delegate('.item-remove', 'click', function(e) {
    var value = $(e.target).val();
    model = $.extend(true, {}, model);
    for (var i = 0; i < model.items.length; i++) {
        if (model.items[i].name === value) {
            model.items.splice(i, 1);
            break;
        }
    }
    render(model);
});

$container.delegate('.item-add', 'click', function() {
    var name = $('.item-name').val();
    model.items.push({
        name: name
    });
    render(model);
    $('.item-name').val("");
});

$container.delegate('.batch-add', 'click', function() {
    renderTest(100);
});

//requestAnimationFrame渲染100个li
var start;
var timeConsumed = 0;

function renderTest(n) {
    if (n === 0) {
        $(".timeConsumed").text("总耗时:" + timeConsumed);
        return;
    }
    model.items.push({
        name: 'item-' + n
    });
    start = Date.now();
    render(model);
    timeConsumed += Date.now() - start;
    requestAnimationFrame(renderTest.bind(undefined, n - 1));
};





render(model);