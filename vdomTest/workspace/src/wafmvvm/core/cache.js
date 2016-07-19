function cacheFactory(name, max) {
    var cachePool = {};
    return function() {
        max = max || 1000;
        var keys = [],
            cache = cachePool[name] ? (cachePool[name]) : (cachePool[name] = {});
        return {
            put: function(key, value) {
                if (keys.length > this.max) {
                    cache[keys.shift()] = undefined;
                }
                if (cache[key] === undefined) {
                    keys.push(key);
                }
                cache[key] = value;
                return value;
            },
            get: function(key) {
                if (key === undefined) return cache;
                return cache[key];
            },
            len: function() {
                return keys.length;
            }
        };

    }();
}

function initCache(waf) {
    waf.elCache = cacheFactory("el");
}

module.exports = initCache;