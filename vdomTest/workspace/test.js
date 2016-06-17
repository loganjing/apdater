h("div.ui-multiLangBox.supportMultiLang", {
    "style": {
        "width": "300px",
        "height": "28px"
    },
    "attributes": {
        "aria-disabled": "false"
    }
}, [h("div.ui-multiLangBox-layout", [h("input#layoutColumn11_name.ui-multiLangBox-input.enter2tab.waf2_field", {
    "attributes": {
        "name": "name_el",
        "type": "text",
        "ctrlrole": "multiLangBox",
        "tabindex": "0",
        "validate": "required:true,maxlength:80",
        "errmsg": "required:'名称不能为空。',maxlength:'名称最大长度不能超过80'",
        "validatetrigger": "focus",
        "errorlabelposition": "bottom",
        "errorshowmode": "float"
    },
    "dataset": {
        "domcreated": "true"
    }
})]), h("em.ui-multiLangBox-trigger", {
    "style": {
        "line-height": "24px"
    },
    "attributes": {
        "aria-disabled": "false"
    }
}, ["CN"]), h("input#layoutColumn11_name_el", {
    "value": "{\"l1\":null,\"l2\":null,\"l3\":null}",
    "attributes": {
        "type": "hidden",
        "name": "name"
    }
})])