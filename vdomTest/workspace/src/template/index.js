var $ = require('jquery');
var Handlebars = require('handlebars');

var template = $('.template').text();

// 用一组div标签将template包裹起来
template = ['<div>', template, '</div>'].join('');

// 初次渲染模板时所用到的数据
var model = {
    items: [{
        name: '项目1'
    }, {
        name: '项目2'
    }, {
        name: '项目3'
    }]
};




// Handlebars.compile方法返回编译后的模块方法，调用这个模板方法并传入数据，即可得到渲染后的模板
var html = Handlebars.compile(template)(model);


var $container = $('.container');
$container.html(html);

var $ul = $container.find('ul');
var $itemName = $container.find('.item-name');

var liTemplate = '' + '<li class="list-group-item">' + '<span>{{name}}</span>' + '<button class="item-remove btn btn-danger btn-sm float-right">删除</button>' + '</li>';

$container.delegate('.item-remove', 'click', function(e) {
    var $li = $(e.target).parents('li');
    $li.remove();
});

$container.delegate('.item-add', 'click', function() {
    var name = $itemName.val();
    // 清空输入框
    $itemName.val('');
    // 渲染新项目并插入
    $ul.append(Handlebars.compile(liTemplate)({
        name: name
    }));
});

function render(model) {
    $ul.append(Handlebars.compile(liTemplate)(model));
}

var start;
var timeConsumed = 0;

function renderTest(n) {
    if (n === 0) {
        $(".timeConsumed").text("总耗时:" + timeConsumed);
        return;
    }
    start = Date.now();
    render({
        name: 'item-' + n
    });
    timeConsumed += Date.now() - start;
    requestAnimationFrame(renderTest.bind(undefined, n - 1));
};


$container.delegate('.batch-add1', 'click', function() {
    renderTest(100);
});