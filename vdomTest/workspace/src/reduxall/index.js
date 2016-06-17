var $ = require('jquery');
var h = require('virtual-dom/h');
var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');
var createElement = require('virtual-dom/create-element');
var redux = require("redux");

var $container = $('.container');

var hyperItems = {};

var hyperFooter = h('div.dbl-top-margin', [
    h('input.form-control.item-name', {
        placeholder: '添加新项目',
        type: 'text'
    }),
    h('button.dbl-top-margin.btn.btn-primary.col-xs-12.item-add', '添加'),
    // h('button.dbl-top-margin.btn.btn-primary.col-xs-12.batch-add', 'Render100'),
    h('button.dbl-top-margin.btn.btn-primary.col-xs-12.batch-add1', 'Render100WithRequestAnitimate')
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

var root;
var tree;

function render(model) {
    var newTree = generateTree(model);
    if (!root) {
        tree = newTree;
        root = createElement(tree);
        $container.append(root);
        return;
    }
    var patches = diff(tree, newTree);
    root = patch(root, patches)
    tree = newTree;
}

$container.delegate('.item-remove', 'click', function(e) {
    var name = $(e.target).val();
    store.dispatch(removeItem(name));
});

$container.delegate('.item-add', 'click', function() {
    var name = $('.item-name').val();
    store.dispatch(addItem(name));
});

$container.delegate('.batch-add', 'click', function() {
    store.dispatch(addBatchItem(100));
     $(".timeConsumed").text("总耗时:" + timeConsumed);
});

$container.delegate('.batch-add1', 'click', function() {
    batchAdd(100);
});


// action types
var ADD_ITEM = 'ADD_ITEM';
var REMOVE_ITEM = 'REMOVE_ITEM';
var BATCHADD_ITEM = 'BATCHADD_ITEM';

// action creators
function addItem(name) {
    return {
        type: ADD_ITEM,
        name: name
    };
}

function removeItem(name) {
    return {
        type: REMOVE_ITEM,
        name: name
    };
}

function addBatchItem(n){
    start = Date.now();
    var arr = [];
    for(var i=0;i<n;i++){
        arr.push({
            name:"Item-Arr-"+i
        });
    }
    return {
        type: BATCHADD_ITEM,
        name: arr
    }

}

var start;
var timeConsumed = 0;

function batchAdd(n) {
    if (n === 0) {
        $(".timeConsumed").text("总耗时:" + timeConsumed);
        return;
    }
    start = Date.now();
    store.dispatch({
        type: ADD_ITEM,
        name: "item-" + n
    });
    requestAnimationFrame(batchAdd.bind(undefined, n - 1));
}



// reducers
var listApp = function(state, action) {
    // deep copy当前state，类似于前面的model
    state = $.extend(true, {}, state);

    switch (action.type) {
        case ADD_ITEM:
            (function() {
                state.items.push({
                    name: action.name
                })
            })();
            break;
        case REMOVE_ITEM:
            (function() {
                var items = state.items;
                for (var i = 0; i < items.length; i++) {
                    if (items[i].name === action.name) {
                        items.splice(i, 1);
                        break;
                    }
                }
            })();
            break;
        case BATCHADD_ITEM:
            (function() {
                state.items = action.name;
            })();
            break;
    }

    // 总是返回一个新的state
    return state;
};


var initState = {
    items: []
};

// store
var store = redux.createStore(listApp, initState);

render(initState);

// 监听store变化
store.subscribe(function() {
    render(store.getState());
    timeConsumed += Date.now() - start;
});