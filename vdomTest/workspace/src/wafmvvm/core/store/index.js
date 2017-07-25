var renderApp = require('../obj/index').renderApp;
var _ = require("../util");
var _ = require("../obj/index");

//保存当前页面中的state，不能直接被外部访问，只能通过commit方法提交
//state的存放结构
/**
 *{
    module1:{},
    module2:{},
    module3:{},
    model:{},//编辑界面对应的数据model，这个model中的值要进行双向绑定
 *}
 * module为为模块id，如果module为组件，默认为组件id
 * 每个页面可以分区，每个区域叫做thunk,每个thunk可以包含多个module,比如界面中包含三个章节，
 * 每个章节对应一个thunk,每个thunk对应多个组件，可支持动态加载thunk，分块状态维护&渲染。
 * 初始化使用时传入页面本身的状态，子module支持动态加入，页面当做一个特殊的module
 * state分为: 界面state,存放在组件中. 数据state:特殊的state
 */
var state = {};


//所有组件的超类
var Store = WafObject.extend({
    initialize: function(options) {
        if (options === void 0) options = {};
        state = options.state;
        if (state === void 0) state = {};
        //监控状态改变的plugins
        var plugins = options.plugins || [];
        if (plugins === void 0) plugins = [];

        // store internal state
        this._options = options;
        this._committing = false;
        //存放修改状态时的订阅者
        this._subscribers = [];
        //存放events对应的所有handler执行情况
        this._actions = Object.create(null);


        // bind commit and dispatch to self
        var store = this
        var ref = this;
        var dispatch = ref.dispatch;
        var commit = ref.commit;
        this.dispatch = function boundDispatch(type, payload) {
            return dispatch.call(store, type, payload)
        }
        this.commit = function boundCommit(type, payload, options) {
            return commit.call(store, type, payload, options)
        }

        // init root module.
        // this also recursively registers all sub-modules
        // and collects all module getters inside this._wrappedGetters
        installModule(this, state, [], options)

        // initialize the store vm, which is responsible for the reactivity
        // (also registers _wrappedGetters as computed properties)
        //resetStoreVM(this, state)

        // apply plugins
        var store = this;
        plugins.forEach(function(plugin) {
            return plugin(store);
        })
    },
    get: function(path) {
        path = (typeof path == "string") ? path.split(".") : path;
        var tmp = state;
        for (var i = 0; i < path.length; i++) {
            if (path[i] == "meta") {
                tmp = tmp[path[i]];
            } else {}
        }
        return tmp;
    },
    commit: function(path, value) {
        path = (typeof path == "string") ? path.split(".") : path;

        var tmp = state.meta;
        // for (var i = 0; i < (path.length - 1); i++) {
        //     tmp = tmp[path[i]];
        // }
        tmp[path[path.length - 1]] = value;
        //处理VNODE渲染
        //获取VNODE
        task.push({
            path: path,
            val: value
        });

        var container = document.getElementById("container");
        //传递页面全局性的状态进去
        renderApp(container, this);



        var this$1 = this;

        // check object-style commit
        // if (isObject(type) && type.type) {
        //     options = payload
        //     payload = type
        //     type = type.type
        // }
        // var mutation = {
        //     type: type,
        //     payload: payload
        // }
        // var entry = this._mutations[type]
        // if (!entry) {
        //     console.error(("[vuex] unknown mutation type: " + type))
        //     return
        // }
        // this._withCommit(function() {
        //     entry.forEach(function commitIterator(handler) {
        //         handler(payload)
        //     })
        // })
        // if (!options || !options.silent) {
        //     this._subscribers.forEach(function(sub) {
        //         return sub(mutation, this$1.state);
        //     })
        // }
    },
    dispatch: function(type, payload) {
        // check object-style dispatch
        // if (isObject(type) && type.type) {
        //   payload = type
        //   type = type.type
        // }
        var entry = this._actions[type]
        if (!entry) {
            console.error(("[vuex] unknown action type: " + type))
            return
        }
        return entry.length > 1 ?
            Promise.all(entry.map(function(handler) {
                return handler(payload);
            })) :
            entry[0](payload)
    },
    _withCommit: function(fn) {
        var committing = this._committing
        this._committing = true
        fn()
        this._committing = committing
    },
    subscribe: function subscribe(type, fn) {
        var subs = this._actions
        if (subs.indexOf(fn) < 0) {
            subs.push(fn)
        }
        return function() {
            var i = subs.indexOf(fn)
            if (i > -1) {
                subs.splice(i, 1)
            }
        }
    }

});



function installModule(store, rootState, path, module, hot) {
    var isRoot = !path.length
    var state = module.state;
    var actions = module.actions;
    var mutations = module.mutations;
    var getters = module.getters;
    var modules = module.modules;

    //获取系统中已经定义的所有的module
    //每个组件有自己默认的内部state,
    //state的来源包括: 元数据、组件内部状态、单据数据、动态规则数据


    // set state
    if (!isRoot && !hot) {
        var parentState = getNestedState(rootState, path.slice(0, -1))
        var moduleName = path[path.length - 1]
        store._withCommit(function() {
            Vue.set(parentState, moduleName, state || {})
        })
    }

    if (mutations) {
        Object.keys(mutations).forEach(function(key) {
            registerMutation(store, key, mutations[key], path)
        })
    }

    if (actions) {
        Object.keys(actions).forEach(function(key) {
            registerAction(store, key, actions[key], path)
        })
    }

    if (getters) {
        wrapGetters(store, getters, path)
    }

    if (modules) {
        Object.keys(modules).forEach(function(key) {
            installModule(store, rootState, path.concat(key), modules[key], hot)
        })
    }
}



module.exports = Store;