if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  window.inherits = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  window.inherits = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}


if(!Object.defineProperties){     
    Object.defineProperties = function(obj, properties)
    {
      function convertToDescriptor(desc)
      {
        function hasProperty(obj, prop)
        {
          return Object.prototype.hasOwnProperty.call(obj, prop);
        }

        function isCallable(v)
        {
          // 如果除函数以外,还有其他类型的值也可以被调用,则可以修改下面的语句
          return typeof v === "function";
        }

        if (typeof desc !== "object" || desc === null)
          throw new TypeError("不是正规的对象");

        var d = {};
        if (hasProperty(desc, "enumerable"))
          d.enumerable = !!obj.enumerable;
        if (hasProperty(desc, "configurable"))
          d.configurable = !!obj.configurable;
        if (hasProperty(desc, "value"))
          d.value = obj.value;
        if (hasProperty(desc, "writable"))
          d.writable = !!desc.writable;
        if (hasProperty(desc, "get"))
        {
          var g = desc.get;
          if (!isCallable(g) && g !== "undefined")
            throw new TypeError("bad get");
          d.get = g;
        }
        if (hasProperty(desc, "set"))
        {
          var s = desc.set;
          if (!isCallable(s) && s !== "undefined")
            throw new TypeError("bad set");
          d.set = s;
        }

        if (("get" in d || "set" in d) && ("value" in d || "writable" in d))
          throw new TypeError("identity-confused descriptor");

        return d;
      }

      if (typeof obj !== "object" || obj === null)
        throw new TypeError("不是正规的对象");

      properties = Object(properties);
      var keys = Object.keys(properties);
      var descs = [];
      for (var i = 0; i < keys.length; i++)
        descs.push([keys[i], convertToDescriptor(properties[keys[i]])]);
      for (var i = 0; i < descs.length; i++)
        Object.defineProperty(obj, descs[i][0], descs[i][1]);

      return obj;
    };
}



if (!Object.keys) {
  Object.keys = (function () {
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
        dontEnums = [
          'toString',
          'toLocaleString',
          'valueOf',
          'hasOwnProperty',
          'isPrototypeOf',
          'propertyIsEnumerable',
          'constructor'
        ],
        dontEnumsLength = dontEnums.length;

    return function (obj) {
      if (typeof obj !== 'object' && typeof obj !== 'function' || obj === null) throw new TypeError('Object.keys called on non-object');

      var result = [];

      for (var prop in obj) {
        if (hasOwnProperty.call(obj, prop)) result.push(prop);
      }

      if (hasDontEnumBug) {
        for (var i=0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) result.push(dontEnums[i]);
        }
      }
      return result;
    }
  })()
};



function inheritsMixins(sub,sup){
    inherits(sub,sup);
    if(arguments.length>2){
      var args = [].slice.call(arguments,2);
      for(var i=0,len=args.length;i<len;i++){
        Object.keys(args[i]).forEach(function(key){
          Object.defineProperty(sub.prototype,key,Object.getOwnPropertyDescriptor(args[i],key));
        })                
        } 
    }            
}   



