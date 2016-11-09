{
    "type": "scroller",
    "children": [{
        "type": "wxc-panel",
        "attr": {
            "title": "input",
            "type": "primary"
        },
        "children": [{
            "type": "input",
            "attr": {
                "type": "text",
                "placeholder": "Text Input",
                "autofocus": "true",
                "value": ""
            },
            "classList": [
                "input"
            ],
            "events": {
                "change": "onchange",
                "input": "oninput"
            }
        }, {
            "type": "text",
            "attr": {
                "value": function() {
                    return 'oninput: ' + (this.txtInput)
                }
            }
        }, {
            "type": "text",
            "attr": {
                "value": function() {
                    return 'onchange: ' + (this.txtChange)
                }
            }
        }]
    }]
}