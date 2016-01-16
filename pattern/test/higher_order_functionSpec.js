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

describe("Singleton Test", function() {
    it("should be same function", function() {
        var getScripts = getSingleton(function() {
            return document.createElement("script");
        });

        var script1 = getScripts();
        var script2 = getScripts();
        expect(script2 == script1).toBe(true);
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