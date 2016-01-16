var strategies = {
	"S":function(salary){
        return salary * 4;
	},
	"A":function(salary){
		return salary * 3;
	},
	"B":function(salary){
        return salary * 2;
	}
}

var calcSalary = function(level,salary){
    return strategies[level](salary);
}