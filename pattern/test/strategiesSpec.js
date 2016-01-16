describe("Strategies Test", function() {
    it("calcSalary", function() {
        expect(calcSalary("S",4000)).toEqual(16000);
        expect(calcSalary("A",3000)).toEqual(9000);
        expect(calcSalary("B",2000)).toEqual(4000);
    })
});