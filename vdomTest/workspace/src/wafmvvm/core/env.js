exports.inBrowser = typeof window !== 'undefined' && Object.prototype.toString.call(window) !== '[object Object]';
var UA = exports.inBrowser && window.navigator.userAgent.toLowerCase();
exports.isIos = UA && /(iphone|ipad|ipod|ios)/i.test(UA);
exports.isWechat = UA && UA.indexOf('micromessenger') > 0;
exports.svg = (function(){
  return typeof document !== "undefined" && document.implementation.hasFeature( "http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1" );
})();