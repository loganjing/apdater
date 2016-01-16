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