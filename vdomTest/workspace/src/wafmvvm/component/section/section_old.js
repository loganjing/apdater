mod.defineModule("section", ["base", "waf", "section_i18n"], function() {
    (function($, undefined) {
        $.wafSection = $.wafSection || {};
        $.widget("ui.wafSection", {
            options: {
                tagClass: '',
                style: '',
                title: '',
                openIconCls: 'ui-section-minus',
                closeIconCls: 'ui-section-plus',
                autoOpen: true,
                hidden: false,
                lazyLoad: false,
                summary: ''
            },
            _create: function() {
                var section = this.element,
                    o = this.options,
                    self = this,
                    layoutName = null;
                this.sheader = section.children("div.sheader").children("span");
                this.arrow = section.children("div.sheader").children("span.arrow");
                this.title = section.children("div.sheader").children("span.title");
                this.summary = section.children("div.sheader").children("span.summary");
                this.content = section.children("div.content");
                this.element.attr('data-domcreated', "true");

                $.each(this.options, function(key, value) {
                    self._setOption(key, value);
                });
                self._toggle(this.options.autoOpen);

                this.sheader.bind("click.section", function(event) {
                    if (!self.title.hasClass(o.openIconCls)) {
                        self._toggle(true);
                    } else {
                        self._toggle(false);
                    }
                });

                //如果是字段布局，需要增加ui-columnLayout样式类
                if (o.customLayout && (layoutName = o.customLayout.split(";")[0]) && /^field-(one|two|three)-col$/.test(layoutName)) {
                    this.content.addClass("ui-columnLayout");
                }
            },
            open: function() {
                if (!this.title.hasClass(this.options.openIconCls)) {
                    this._toggle(true);
                }
            },
            close: function() {
                if (!this.title.hasClass(this.options.closeIconCls)) {
                    this._toggle(false);
                }
            },
            _toggle: function(show) {
                var o = this.options;
                if (show) {
                    $(this.title).removeClass(o.closeIconCls).addClass(o.openIconCls);
                    $(this.arrow).removeClass("ui-section-arrow-close").addClass("ui-section-arrow-open");
                    $(this.title).closest(".sheader").removeClass("headClose");
                    $(this.summary).addClass("ui-section-summary");
                    this.content.show();
                    //TODO:应该通过事件的方式加入到表格中，监听section toggle事件
                    var tables = $(this.content).find(".ui-jqgrid .ui-jqgrid-btable");
                    if (tables && tables.length > 0 && tables.data("lazyResize")) {
                        //只有当浏览器窗口大小改变以后才执行
                        tables.wafGrid("resizeGrid");
                        tables.data("lazyResize", false);
                    }
                    this._trigger("onopen");
                } else {
                    $(this.title).removeClass(o.openIconCls).addClass(o.closeIconCls);
                    $(this.arrow).removeClass("ui-section-arrow-open").addClass("ui-section-arrow-close");
                    $(this.title).closest(".sheader").addClass("headClose");
                    this.content.hide();
                    var html = o.summary;
                    if (html != "") {
                        var results = html.match(/\{\w+\}/g);
                        if (results != null) {
                            for (var i = 0, len = results.length; i < len && results.length > 0; i++) {
                                var property = results[i].substr(1, results[i].length - 2);
                                var component = waf.dataBinder.getComponentByProperty(property);
                                if (component != undefined) {
                                    if (component.attr("ctrlrole") == "select") {
                                        var componentID = component.attr("id");
                                        var componentValue = $("#" + componentID).find("option:selected").text();
                                    } else if (component.attr("ctrlrole") == "checkbox") {
                                        var componentValue = (component.attr("checked") == "checked") ? $.wafSectionUI.value.yes : $.wafSectionUI.value.no;
                                    } else {
                                        var componentValue = component.val();
                                    }
                                    html = html.replace(results[i], componentValue);
                                } else {
                                    html = html.replace(results[i], "");
                                }
                            }
                        }
                        $(this.summary).html(html);
                    }
                    $(this.summary).removeClass("ui-section-summary");
                    this._trigger("onclose");
                }
            },
            _setOption: function(key, value) {
                var section = this.element,
                    o = this.options;
                switch (key) {
                    case "tagClass":
                        section.removeClass(o.tagClass).addClass(value);
                        break;
                    case "style":
                        value && section.attr("style", value);
                        break;
                    case "title":
                        value && this.title.html(value);
                        break;
                    case "hidden":
                        section.toggle(!value);
                        break;
                    case "openIconCls":
                        if (!this.content.is(":hidden")) {
                            this.title.removeClass(o.openIconCls).addClass(value);
                        }
                        this.options.openIconCls = value;
                        break;
                    case "closeIconCls":
                        if (this.content.is(":hidden")) {
                            this.title.removeClass(o.closeIconCls).addClass(value);
                        }
                        this.options.closeIconCls = value;
                        break;
                    case "lazyLoad":
                        !!value ? section.addClass("lazyLoad") : section.removeClass("lazyLoad");
                        break;
                }
                $.Widget.prototype._setOption.apply(this, arguments);
            },
            destroy: function() {
                this.title = null;
                this.content = null;
                this.element.removeClass("ui-section").removeAttr("ctrlrole");
                $.Widget.prototype.destroy.call(this);
            },
            appendChildren: function(source, pos) {
                //pos并且为数字的话
                var content = $(this.element).children("div.content");
                $.dynamicutil.appendChildren(content, source, pos);
            },
            removeChildren: function(source) {
                //如果传递进来的是id，转换source为jquery对象
                if (typeof source == "string") {
                    if (source.substr(0, 1) != "#") {
                        source = "#" + source;
                    }
                    source = $(source);
                }
                var content = $(this.element).children("div.content");
                $.dynamicutil.removeChildren(content, source);
            },
            addHeaderItem: function(source) {
                var header = $(this.element).children("div.sheader");
                header.append(source);
            },
            removeHeaderItem: function() {
                var header = $(this.element).children("div.sheader");
                return header.children("*").not("span.title").remove();
            },
            getHeaderItem: function() {
                var header = $(this.element).children("div.sheader");
                return header.children("*").not("span.title");
            }
        });

        /*
         * 动态创建Section控件
         * author:Zhang yanfang
         * 2012-11-13
         */
        $.extend($.wafSection, {
            createSectionDOM: function(opts) {
                var obj = opts && opts.id && $("#" + opts.id);
                if (!(obj && obj.data("domcreated"))) {
                    var elem = $("<div></div>");
                    elem.addClass("ui-section");
                    elem.attr("id", opts.id);
                    elem.attr("ctrlrole", "section");

                    var head = $("<div></div>");
                    head.addClass("sheader");
                    head.append("<span class='arrow'><i></i></span>");
                    head.append("<span class='title'></span>");
                    if (opts.summary != undefined) {
                        head.append("<span class='summary' summary='" + opts.summary + "'></span>");
                    }
                    elem.append(head);

                    var content = $("<div></div>");
                    content.addClass("content");
                    content.attr("id", opts.id + "_content");
                    elem.append(content);
                    return elem;
                } else {
                    return obj;
                }
            },
            initSection: function(opts, el) {
                if (el && $(el).hasClass("ui-section")) {
                    return $(el).wafSection(opts);
                }
            },
            clickInitSection: function(opts, el) {
                $("body").undelegate("#" + opts.id, "click.lazyInit").delegate("#" + opts.id, "click.lazyInit", function(e) {
                    var section = $(el).closest(".ui-section");
                    if (section.length && !$.data(section[0], "wafSection")) {
                        section.wafSection(opts);
                        $(el).trigger("click.section");
                        $("body").undelegate("#" + opts.id, "click.lazyInit");
                        return false;
                    }

                });
            },
            removeSection: function(opts) {
                $("#" + opts.id).remove();
            },
            modifySection: function(opts) {
                $("#" + opts.id).wafSection("option", opts);
                return $("#" + opts.id);
            },
            setSectionSummary: function(elements) {
                for (var j = 0, len = elements.length; j < len; j++) {
                    var html = $(elements[j]).attr("summary");
                    if (html != "") {
                        var results = html.match(/\{\w+\}/g);
                        if (results != null) {
                            for (var i = 0, lens = results.length; i < lens && results.length > 0; i++) {
                                var property = results[i].substr(1, results[i].length - 2);
                                var ctrlComponent = waf.dataBinder.getComponentByProperty(property);
                                if (ctrlComponent != undefined) {
                                    if (ctrlComponent.attr("ctrlrole") == "select") {
                                        var componentID = ctrlComponent.attr("id");
                                        var componentValue = $("#" + componentID).find("option:selected").text();
                                    } else if (ctrlComponent.attr("ctrlrole") == "checkbox") {
                                        var componentValue = (ctrlComponent.attr("checked") == "checked") ? $.wafSectionUI.value.yes : $.wafSectionUI.value.no;
                                    } else {
                                        var componentValue = ctrlComponent.val();
                                    }
                                    html = html.replace(results[i], componentValue);
                                }
                            }
                        }
                        $(elements[j]).html(html);
                    }
                }
            }
        });
        $(function() {
            if ($.registerComponent)
                $.registerComponent("section", {
                    createDOMFun: $.wafSection.createSectionDOM,
                    initFun: $.wafSection.initSection,
                    deleteFun: $.wafSection.removeSection,
                    modifyFun: $.wafSection.modifySection,
                    initType: "clickInit",
                    invokeType: "wafSection"
                });
        });
        //section delegate
        if ($("#mainContent.staticHtml").length) {
            $("#mainContent.staticHtml").undelegate(".ui-section .sheader", "click.lazyInit").delegate(".ui-section .sheader", "click.lazyInit", function(e) {
                var section = $(e.target).closest(".ui-section");
                if (section.length && !$.data(section[0], "wafSection")) {
                    var id = section.attr("id");
                    var op = $.wafutil.getLazyOption(section);
                    if (op.id) {
                        section.wafSection(op);
                        $(e.target).trigger("click.section");
                    }
                }
            });
        } else {
            $("body").undelegate(".ui-section .sheader", "click.lazyInit").delegate(".ui-section .sheader", "click.lazyInit", function(e) {
                var section = $(e.target).closest(".ui-section");
                if (section.length && !$.data(section[0], "wafSection")) {
                    var id = section.attr("id");
                    var op = $.wafutil.getLazyOption(section);
                    if (op.id) {
                        section.wafSection(op);
                        $(e.target).trigger("click.section");
                    }
                }
            });
        }
    }((jQuery)));
});