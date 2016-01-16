describe("getUserInfo", function() {
    it("Should be getUserInfo", function() {
        //expect(addition(1, 3)).toBe(4);
        getUserInfo("KEVIN", function(data) {
            expect(data.name).toBe("王伟");
        });
    });
});

describe("Type Test", function() {
    it("should be right type", function() {
        expect(isNumber(5)).toBe(true);
        expect(isNumber("")).toBe(false);
        expect(isNumber("452d")).toBe(false);
        expect(isNumber([])).toBe(false);
        expect(isString("")).toBe(true);
        expect(isString("22")).toBe(true);
        expect(isString(22)).toBe(false);
        expect(isArray([])).toBe(true);
        expect(isArray(arguments)).toBe(false);
        expect(isArray(22)).toBe(false);
        expect(isArray("test")).toBe(false);
    })
});


describe("Another Type Test", function() {
    it("should be right type another one", function() {
        expect(Type.isNumber(5)).toBe(true);
        expect(Type.isNumber("")).toBe(false);
        expect(Type.isNumber("452d")).toBe(false);
        expect(Type.isNumber([])).toBe(false);
        expect(Type.isString("")).toBe(true);
        expect(Type.isString("22")).toBe(true);
        expect(Type.isString(22)).toBe(false);
        expect(Type.isArray([])).toBe(true);
        expect(Type.isArray(arguments)).toBe(false);
        expect(Type.isArray(22)).toBe(false);
        expect(Type.isArray("test")).toBe(false);
    })
});



describe("AOP Test", function() {
    it("should be AOP function", function() {
        var ret = [];
        var func = function() {
            ret.push("normal");
        }

        func = func.before(function() {
            ret.push("before");
        }).after(function() {
            ret.push("after");
        });


        func();

        expect(ret.join("")).toEqual("beforenormalafter");
    })
});

describe("currying Test", function() {
    it("should be currying function", function() {
        var cost = currying(function() {
            var all = 0;
            for (var i = 0; i < arguments.length; i++) {
                all += arguments[i];
            }
            return all;
        });
        cost(100);
        cost(200);
        cost(300);
        expect(cost()).toEqual(600);
    });
    it("uncurrying function", function() {
        var push = Array.prototype.push.uncurrying();
        (function() {
            push(arguments, 4);
            var ret = [].slice.apply(arguments);
            expect(ret.join("")).toEqual("1234");
        })(1, 2, 3);

        (function() {
            //this =  arguments, push 4，5到arguments这个对象中。
            [].push.apply(arguments, [4, 5]);
            var ret = [].slice.apply(arguments);
            expect(ret.join("")).toEqual("12345");
            //从第三个位置删除一个元素
            [].splice.call(arguments, 3, 1);
            ret = [].slice.apply(arguments);
            expect(ret.join("")).toEqual("1235");
            //arguments被合并到［8，9］
            var a = [].concat.apply([8, 9], arguments);
            expect(a.join("")).toEqual("891235");
        })(1, 2, 3);
    })
});

describe("throttle test", function() {
    it("throttle test for test", function() {
        window.onresize = throttle(function() {
            console.log("resize");
        }, 1000);
    })
});

describe("timeChunk test", function() {
    it("timeChunk test for test", function() {
        var arr = [];
        for (var i = 0; i < 50; i++) {
            arr.push(i);
        }

        var renderList = timeChunk(arr, function(data) {
            // var div = document.createElement("span");
            // div.innerHTML = data;
            // document.body.appendChild(div);
            console.log(data);
        }, 8);

        renderList();
    })
});

describe("addEvent test", function() {
    it("addEvent test for test", function() {
        var n1 = document.createElement("input");
        document.body.appendChild(n1);
        addEvent(n1, "change", function() {
            console.log("text changed");
            n1.setAttribute("event","changed");
        })
        addEvent(n1, "focus", function() {
            console.log("text focus");
            n1.setAttribute("event","focus");
        });
        
        //n1.value = "text";
        //n1.dispatchEvent("change");
        //console.log(n1.getAttribute("event"));
        //expect(n1.getAttribute("event")).toEqual("changed");

        //n1.focus();
        //expect(n1.getAttribute("event")).toEqual("focus");
    })
});