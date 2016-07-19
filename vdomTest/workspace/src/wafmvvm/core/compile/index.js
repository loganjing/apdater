function initCompile(waf) {
    waf.compile = function(el) {
        return function(context) {
            //context如果不传递，默认获取顶级的context中的model
            return "( 单据编号：AP2016000010 | 单据日期：2016-07-14 | 单据类型：采购发票 | 往来户： )";
        }

    }
}

module.exports = initCompile;