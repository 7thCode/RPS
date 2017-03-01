/**
 Copyright (c) 2016 7ThCode.
 This software is released under the 7thCode.
 */

'use strict';

const HtmlEdit:any = require('./html_edit');

let items = [
    {"name": "html", "type": "doctypedecl"},
    {
        "name": "html", "type": "element", "_$": {"lang": "ja"}, "@": [
        {
            "name": "head", "type": "element", "@": [
            {"name": "meta", type: "element", "_$": {"charset": "utf-8"}},
            {"name": "meta", type: "element", "_$": {"name": "format-detection", "content": "telephone=no"}},
            {"name": "meta", type: "element", "_$": {"name": "msapplication-tap-highlight", "content": "no"}},
            {
                "name": "meta",
                type: "element",
                "_$": {
                    "name": "viewport",
                    "content": "user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width, height=device-height"
                }
            },
            {"name": "title", type: "element", "@": ["blog2 backend"]},
            {
                "name": "link",
                type: "element",
                "_$": {
                    "rel": "stylesheet",
                    "type": "text/css",
                    "href": "/bower_components/angular-material/angular-material.min.css"
                }
            },
            {
                "name": "link",
                type: "element",
                "_$": {"rel": "stylesheet", "type": "text/css", "href": "/stylesheets/style.css"}
            },
        ]
        },
        {
            "name": "body",
            type: "element",
            "_$": {
                "ng-app": "ViewApplication",
                "style": "padding: 0;",
                "ng-controller": "ViewController",
                "class": "flexbox"
            },
            "@": [
                {
                    "name": "md-content", "type": "element",
                    "_$": {"class": "background"},
                    "@": [
                        {
                            "name": "md-card", "type": "element",
                            "_$": {"class": "box-edge"},
                            "@": [
                                {
                                    "name": "md-grid-list", "type": "element",
                                    "@": [
                                        {
                                            "name": "md-grid-tile", "type": "element",
                                            "@": [
                                                {
                                                    "name": "md-grid-tile-footer", "type": "element",
                                                    "@": [{
                                                        "@": ["#1: (3r x 2c)"],
                                                        "name": "h3",
                                                        "type": "element"
                                                    }]
                                                }
                                            ],
                                            "_$": {
                                                "md-colspan-sm": "1",
                                                "md-colspan": "2",
                                                "md-rowspan": "3",
                                                "style": "background:#123456;"
                                            }
                                        },
                                        {
                                            "name": "md-grid-tile", "type": "element",
                                            "_$": {"style": "background:#123456;"},
                                            "@": [
                                                {
                                                    "name": "md-grid-tile-footer", "type": "element",
                                                    "@": [{
                                                        "@": ["#2: (1r x 1c)"],
                                                        "name": "h3",
                                                        "type": "element"
                                                    }]
                                                }]
                                        },
                                        {
                                            "name": "md-grid-tile", "type": "element",
                                            "_$": {"style": "background:#234567;"},
                                            "@": [
                                                {
                                                    "name": "md-grid-tile-footer", "type": "element",
                                                    "@": [{
                                                        "@": ["#3: (1r x 1c)"],
                                                        "name": "h3",
                                                        "type": "element"
                                                    }],
                                                }]
                                        },
                                        {
                                            "name": "md-grid-tile", "type": "element",
                                            "_$": {"style": "background:#345678;"},
                                            "@": [
                                                {
                                                    "name": "md-grid-tile-footer", "type": "element",
                                                    "@": [
                                                        {
                                                            "@": ["#4: (2r x 1c)"],
                                                            "name": "h3",
                                                            "type": "element"
                                                        }
                                                    ],
                                                }],
                                        },
                                        {
                                            "name": "md-grid-tile", "type": "element",
                                            "_$": {
                                                "md-colspan-sm": "1",
                                                "md-colspan": "2",
                                                "md-rowspan": "2",
                                                "style": "background:#456789;"
                                            },
                                            "@": [
                                                {
                                                    "name": "md-grid-tile-footer", "type": "element",
                                                    "@": [
                                                        {
                                                            "name": "h3",
                                                            "type": "element",
                                                            "@": ["#5: (2r x 2c)"]
                                                        }
                                                    ]
                                                }
                                            ]
                                        },
                                        {
                                            "name": "md-grid-tile", "type": "element",
                                            "_$": {"md-rowspan": "2", "style": "background:#890abc;"},
                                            "@": [
                                                {
                                                    "name": "md-grid-tile-footer", "type": "element",
                                                    "@": [{
                                                        "@": ["#5: (2r x 2c)"],
                                                        "name": "h3",
                                                        "type": "element"
                                                    }]
                                                }
                                            ]
                                        }
                                    ],
                                    "_$": {
                                        "md-gutter-gt-sm": "8px",
                                        "md-gutter": "12px",
                                        "md-row-height": "2:2",
                                        "md-row-height-gt-md": "1:1",
                                        "md-cols-gt-md": "6",
                                        "md-cols-md": "4",
                                        "md-cols-sm": "2",
                                        "md-cols-xs": "1"
                                    }
                                }]
                        }
                    ]
                }
            ]
        }
    ]
    },
    {
        "name": "script",
        "type": "element",
        "_$": {"type": "text/javascript", "src": "/bower_components/lodash/dist/lodash.min.js"},
        "@": []
    },
    {
        "name": "script",
        "type": "element",
        "_$": {"type": "text/javascript", "src": "/bower_components/jquery/dist/jquery.min.js"},
        "@": []
    },
    {
        "name": "script",
        "type": "element",
        "_$": {"type": "text/javascript", "src": "/bower_components/angular/angular.min.js"},
        "@": []
    },
    {
        "name": "script",
        "type": "element",
        "_$": {"type": "text/javascript", "src": "/bower_components/angular-animate/angular-animate.min.js"},
        "@": []
    },
    {
        "name": "script",
        "type": "element",
        "_$": {"type": "text/javascript", "src": "/bower_components/angular-messages/angular-messages.min.js"},
        "@": []
    },
    {
        "name": "script",
        "type": "element",
        "_$": {"type": "text/javascript", "src": "/bower_components/angular-aria/angular-aria.min.js"},
        "@": []
    },
    {
        "name": "script",
        "type": "element",
        "_$": {"type": "text/javascript", "src": "/bower_components/angular-resource/angular-resource.min.js"},
        "@": []
    },
    {
        "name": "script",
        "type": "element",
        "_$": {"type": "text/javascript", "src": "/bower_components/angular-sanitize/angular-sanitize.min.js"},
        "@": []
    },
    {
        "name": "script",
        "type": "element",
        "_$": {"type": "text/javascript", "src": "/bower_components/ng-flow/dist/ng-flow-standalone.min.js"},
        "@": []
    },
    {
        "name": "script",
        "type": "element",
        "_$": {"type": "text/javascript", "src": "/bower_components/angular-material/angular-material.min.js"},
        "@": []
    },
    {
        "name": "script",
        "type": "element",
        "_$": {
            "type": "text/javascript",
            "src": "/bower_components/angular-material-icons/angular-material-icons.min.js"
        },
        "@": []
    },
    {
        "name": "script",
        "type": "element",
        "_$": {"type": "text/javascript", "src": "https://js.webpay.jp/v1/"},
        "@": []
    },
    {
        "name": "script",
        "type": "element",
        "_$": {"type": "text/javascript", "src": "/javascripts/ShapeEdit/ShapeEdit.js"},
        "@": []
    },
    {
        "name": "script",
        "type": "element",
        "_$": {"type": "text/javascript", "src": "/javascripts/ShapeEdit/Adaptor.js"},
        "@": []
    },
    {
        "name": "script",
        "type": "element",
        "_$": {"type": "text/javascript", "src": "/javascripts/HtmlEdit/HtmlEdit.js"},
        "@": []
    },
    {
        "name": "script",
        "type": "element",
        "_$": {"type": "text/javascript", "src": "/javascripts/ViewApplication.js"},
        "@": []
    },
    {
        "name": "script",
        "type": "element",
        "_$": {"type": "text/javascript", "src": "/javascripts/backend/AuthControllers.js"},
        "@": []
    },
    {
        "name": "script",
        "type": "element",
        "_$": {"type": "text/javascript", "src": "/javascripts/backend/ExperimentQueryControllers.js"},
        "@": []
    },
    {
        "name": "script",
        "type": "element",
        "_$": {"type": "text/javascript", "src": "/javascripts/backend/FileControllers.js"},
        "@": []
    },
    {
        "name": "script",
        "type": "element",
        "_$": {"type": "text/javascript", "src": "/javascripts/backend/ShapesControllers.js"},
        "@": []
    },
    {
        "name": "script",
        "type": "element",
        "_$": {"type": "text/javascript", "src": "/javascripts/backend/PageControllers.js"},
        "@": []
    },
    {
        "name": "script",
        "type": "element",
        "_$": {"type": "text/javascript", "src": "/javascripts/controllers/ViewControllers.js"},
        "@": []
    },
    {
        "name": "script",
        "type": "element",
        "_$": {"type": "text/javascript", "src": "/javascripts/controllers/WebPayControllers.js"},
        "@": []
    }
];


let a =   [{
    "name": "div", "type": "element",
    "_$": {"class": "form-group"},
    "@": [
        {
            "name": "label", "type": "element",
            "_$": {"for": "id" },
            "@": "label",
        },
        {
            "name": "input", "type": "element",
            "_$": {"class": "form-control no-zoom", "id": "id", "ng-model":  "id", "type":"text", "name": "id"}
        }]
}];

console.log(HtmlEdit.Render.toHtml(a, ""));
HtmlEdit.Render.fromHtml(HtmlEdit.Render.toHtml(a, ""),{content:null}, (error,data) => {
   if (!error) {
       let a = data;
   }
});