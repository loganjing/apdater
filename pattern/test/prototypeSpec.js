describe("prototype", function() {
    it("getName should be Kevin", function() {
        //expect(addition(1, 3)).toBe(4);
        

        function Person(name) {
            this.name = name;
        }

        Person.prototype.getName = function() {
            return this.name;
        }


        var a = ObjectFactory(Person, "Kevin");
        expect(a.name).toEqual("Kevin");
        expect(a.getName()).toEqual("Kevin");
        expect(Object.getPrototypeOf(a) == Person.prototype).toBe(true);
    });
});