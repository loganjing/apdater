mod.defineModule("linkButton", ["base","waf"], function() {
    /*
     * author: Zhang Yanfang
     * date: 2012-2-3
     */

    (function ($, undefined) {
        function linkbutton_click(event) {
            var self = event.data,
                o = self.options;
            if (!o.disabled) {
                if (o["actionBinding"]) {
                    setTimeout(function () {
                    	event.actionBinding=o["actionBinding"];
                        waf.proxyCall.call(this, o["actionBinding"], undefined, event);
                    }, 100);
                } else if (o["onclick"]) {
                    var temp = o["onclick"];
                    setTimeout(function () {
                        if ($.isFunction(temp)) {
                            self._trigger("onclick", event);
                        } else if ($.type.isString(temp)) {
                            if (temp.indexOf("(") > -1) {
                                eval(o["onclick"]);
                            } else {
                                var fun = eval(temp);
                                if ($.isFunction(fun)) {
                                    o["onclick"] = fun;
                                    self._trigger("onclick", event);
                                }
                            }
                        }
                    }, 100);
                }
            }
        }
        function linkbutton_keydown(event){
            var linkbutton = event.data;
            if(event.keyCode == 13){
                linkbutton.trigger("click.wafLinkButton");
            }
        }

        function linkbutton_lazyInit(target){
            var lb,op;
            if($(target).hasClass("ui-linkbutton")){
                lb = $(target);
            }else{
                lb = $(target).closest(".ui-linkbutton");
            }
            if(lb.attr("ctrlrole")=="linkButton"){
                if(!$.data(lb[0],"wafLinkButton")){
                    var id = lb;
                    if(lb.hasClass("lb_grid")){
                        id = lb.attr("btnid");
                    }
                    op = $.wafutil.getLazyOption(id);
                    if(op.id){
                        $(lb).wafLinkButton(op);
                        $(lb).find(".ui-lb-text").attr("rowid",lb.attr("rowid"));
                        $(lb).trigger("click.wafLinkButton");
                    }
                    return false;
                }
            }
        }

        var template ="<a class='ui-linkbutton enter2tab {{tagClass}}' id='lb_{{id}}' ctrlrole='linkButton' data-domcreated='true'><span class='ui-lb-text'>{{caption}}</span></a>";

        var te,btnRender;

        $.wafLinkButton = $.wafLinkButton || {};
        $.widget("ui.wafLinkButton", {
            options:{
                caption:null,
                iconCls:null,
                text:true,
                style:null,
                tagClass:null,
                disabled:false,
                hidden:false,
                tabindex:0,
                onclick:null,
                position:null,
				accesskey:null//快捷键
            },
            _create:function () {
                var linkbutton = this.element,
                        o = this.options, self = this;
                if (!this.element.data('domcreated')) {
                    linkbutton.attr("ctrlrole", "linkButton").addClass("ui-linkbutton");
                    linkbutton.append("<span class='ui-lb-text'></span>");
                    linkbutton.attr("data-domcreated", "true");
					linkbutton.attr("accesskey",o.accesskey ? o.accesskey : "");//快捷键
                }
                //屏蔽事件的前缀，否则onclick会存在问题。
                this.widgetEventPrefix = "";
                if (!linkbutton.hasClass("ui-a-menuitem")) {
                    this._enter2tab();
                }
                this._setOptions(o);
                linkbutton.bind("click.wafLinkButton",self,linkbutton_click);
                //if ($.browser.msie) {
                    linkbutton.bind("keydown",linkbutton,linkbutton_keydown);
                    //修改为####，javascript:void(null)会触发beforeunload事件.
                   // linkbutton.attr("href", "javascript:void(null)");
                //}
            },
            _setOption:function (key, value) {
                if (value === undefined) {
                    return;
                }
                var linkbutton = this.element, o = this.options,
                        captionSpan = linkbutton.find("span.ui-lb-text");
                switch (key) {
                    case "iconCls":
                        var iconSpan = linkbutton.find("span.ui-lb-icon");
                        if (value == null || value.length == 0) {
                            if (iconSpan.length > 0) {
                                iconSpan.remove();
                            }
                        } else {
                            if (iconSpan.length == 0) {
                                iconSpan = $("<span class='ui-lb-icon'></span>");
                                linkbutton.prepend(iconSpan);
                            }
                            iconSpan.removeClass(o.iconCls).addClass(value);
                        }
                        break;
                    case "caption":
                        value&&captionSpan.text(value);
                        break;
                    case "text":
                        captionSpan[value ? "show" : "hide"]();
                        break;
                    case "style":
                        value&&linkbutton.attr(key, value);
                        break;
                    case "tagClass":
                        value&&linkbutton.removeClass(o.tagClass).addClass(value);
                        break;
                    case "disabled":
                        linkbutton[value ? "addClass" : "removeClass"]("ui-lb-disabled ui-state-disabled");
                        break;
                    case "hidden":
                        linkbutton[value ? "hide" : "show"]();
                        break;
                    case "tabindex":
                        linkbutton.attr(key, value);
                        break;
                    case "position":
                        if (value) {
                            var li = this.element.parent("li");
                            if (value == "right") {
                                value = "pull-right";
                            } else if (value == "left") {
                                value = "pull-left";
                            } else {
                                value = null;
                            }
                            if (li.length > 0 && value != null && !li.hasClass(value)) {
                                li.addClass(value);
                            }
                        }
                        break;
					case "accesskey"://快捷键
						if($.enter2tab.accesskeyRegex.test(value)){
							linkbutton.attr(key, value);
							$.enter2tab.refreshAccesskeyTip();
						}
						break;
						
                }
                this.options[key] = value;
            },
            _enter2tab:function () {
                if ($.fn.enter2tab) {
                    this.element.enter2tab();
                }
            }
        });

        /*动态生成linkbutton控件
         author: Zhang yanfang
         date:2012-11-28
         */
        $.extend($.wafLinkButton, {
            createLinkbuttonDOM:function (opts) {
                var obj = opts && opts.id && $("#" + opts.id);
                if (!(obj && obj.data("domcreated"))) {
                    var a = $("<a id='" + opts.id + "' ctrlrole='linkButton'></a>");
                    return a;
                }else{
                    return obj;
                }

            },
            initLinkbutton:function (opts, el) {
                if (el && opts) {
                    el.wafLinkButton(opts);
                    return el;
                }
            },
            clickInitbutton:function(opts, el){
                $("body").undelegate("#"+opts.id,"click.lazyInit")
                         .delegate("#"+opts.id,"click.lazyInit",function(e){
                if(el.attr("ctrlrole")=="linkButton"){
                        $(el).wafLinkButton(opts);
                        $(el).trigger("click.wafLinkButton");
                        $("body").undelegate("#"+opts.id,"click.lazyInit");
                        return false;
                }
                });
            },
            modifyLinkbutton:function (opts) {
                var el = $("#" + opts.id);
                el.wafLinkButton("option", opts);
                return el;
            },
            removeLinkbutton:function (opts) {
                var el = $("#" + opts.id);
                el.remove();
            },
            renderDOM:function(option,attrOption){
                if(!btnRender){
                    te = $.wafutil.getTemplateEngine();
                    btnRender = te.compile(template);
                }
                var dom = te.render(btnRender,option);
                if(attrOption){
                    dom = $(dom).attr(attrOption);
                }
                if(option.iconCls){
                    dom.find(".ui-lb-text").before("<span class='ui-lb-icon "+option.iconCls+"'></span>");
                }
                return dom.outerHTML();
            }
        });
        $(function () {
            if ($.registerComponent)
                $.registerComponent("linkButton",
                {createDOMFun:$.wafLinkButton.createLinkbuttonDOM,
                    initFun:$.wafLinkButton.initLinkbutton,
                    deleteFun:$.wafLinkButton.removeLinkbutton,
                    modifyFun:$.wafLinkButton.modifyLinkbutton,
                    invokeType:"wafLinkButton",
                    initType:"clickInit"});
        });
        //bind linkbutton
        if($("#mainContent.staticHtml").length){
            $("#mainContent.staticHtml").undelegate("[ctrlrole=linkButton].ui-linkbutton","click.lazyInit").delegate("[ctrlrole=linkButton].ui-linkbutton","click.lazyInit",function(e){
                linkbutton_lazyInit(e.target);
            });
            $("#mainContent.staticHtml").undelegate("[ctrlrole=linkButton].ui-linkbutton","keydown.lazyInit").delegate("[ctrlrole=linkButton].ui-linkbutton","keydown.lazyInit",function(e){
                if(e.keyCode==13){//enter 键
                  linkbutton_lazyInit(e.target);
                } 
            });            
        }else{
			if($("#mainContent").length){
                $("#mainContent").undelegate("[ctrlrole=linkButton].lb_grid", "click.lazyInit").delegate("[ctrlrole=linkButton].lb_grid", "click.lazyInit", function(e) {
                    linkbutton_lazyInit(e.target);
                });
            }else{
                $("body").undelegate("[ctrlrole=linkButton].ui-linkbutton", "click.lazyInit").delegate("[ctrlrole=linkButton].ui-linkbutton", "click.lazyInit", function(e) {
                    linkbutton_lazyInit(e.target);
                });
            }
        }

    }(jQuery));
});