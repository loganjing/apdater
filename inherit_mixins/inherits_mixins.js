var util = require('util');


module.exports = {	
	inheritMixins:function(sub,sup){
        util.inherits(sub,sup);
        if(arguments.length>2){
        	var args = [].slice.call(arguments,2);
        	for(var i=0,len=args.length;i<len;i++){
        		Object.keys(args[i]).forEach(function(key){
        			Object.defineProperty(sub.prototype,key,Object.getOwnPropertyDescriptor(args[i],key));
        		})                
            } 
        }
	}
}