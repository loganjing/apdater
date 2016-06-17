var $ = require("jquery");
var Handlebars = require('handlebars');
var template = $('.template').text();

template = ['<div>', template, '</div>'].join('');
template = Handlebars.compile(template);

var model = {
    items: [{
        name: 'item-1'
    }, {
        name: 'item-2'
    }]
};

var $container = $('.container');

function render(model) {
    $container[0].innerHTML = template(model);
}

$container.delegate('.item-remove', 'click', function(e) {
    var index = $(e.target).attr('data-index');
    index = parseInt(index, 10);
    model = $.extend(true, {}, model);
    model.items.splice(index, 1);
    render(model);
});

$container.delegate('.item-add', 'click', function() {
    var name = $('.item-name').val();
    model = $.extend(true, {}, model);
    model.items.push({
        name: name
    });
    render(model);
});




$container.delegate('.batch-add1', 'click', function() {
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