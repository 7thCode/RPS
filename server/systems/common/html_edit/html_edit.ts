/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

var server = (typeof window === 'undefined');

if (server) {
    var _: _.LoDashStatic = require('lodash');
    var jsdom = require("node-jsdom");
    var moment = require("moment");
}

namespace HtmlEdit {

    export class Render {

        constructor() {
        }

        //let v = {x: 100};
        //let format_string = 'a|{"name": "x", "type": "number", "option": {"style": "currency", "currency": "JPY"}}|c';
        // {"name": "x", "type": "formula"}

        static Format(values: any, format_string: string): string {
            let result = "";

            let tell_format = (record: any, format: any): string => {
                let result = "";

                let separate_format = (type, value, option): string => {
                    let result = "";

                    let locale = "ja-JP";
                    if (option.locale) {
                        locale = option.locale;
                    }
                    switch (type) {
                        case "formula":
                            result = new Function("return " + value)();
                            break;
                        case "function":
                            result = new Function("value", "with (value) {" + option.function + "}")(value);//scope chainをぶった切る(for Security)
                            //result = new Function("value", option.function)(value);//scope chainをぶった切る(for Security)
                            break;
                        case "number":
                            result = new Intl.NumberFormat(locale, option).format(value);
                            break;
                        case "date":
                            result = new Intl.DateTimeFormat(locale, option).format(value);
                            break;
                        default:
                            result = "" + value;
                    }
                    return result;
                };

                let cell: any = {};
                let name = format.name;
                if (name) {

                            cell = record[name];
                            if (cell.value) {
                                let value = cell.value;

                                let option: any = {};
                                if (format.option) {
                                    option = format.option;
                                }

                                let _type: string = "";
                                if (format.type) {
                                    _type = format.type;
                                }

                                try {
                                    result = separate_format(_type, value, option);
                                } catch (e) {
                                }
                            }
                }
                return "" + result;
            };

            if (format_string) {

                _.forEach(format_string.split("|"), (fragment) => {
                    if (fragment[0] == "{") {
                        if (fragment[fragment.length - 1] == "}") {
                            try {
                                switch (fragment) {
                                    case "{create}" :
                                        result += new Intl.DateTimeFormat().format(values.create);
                                        break;
                                    case "{modify}" :
                                        result += new Intl.DateTimeFormat().format(values.modify);
                                        break;
                                    case "{userid}" :
                                        result += values.userid;
                                        break;
                                    case "{name}" :
                                        result += values.name;
                                        break;
                                    default:
                                        result += tell_format(values.content, JSON.parse(fragment));
                                }
                            }
                            catch (e) {
                                result += fragment;
                            }
                        } else {
                            result += fragment;
                        }
                    } else {
                        result += fragment;
                    }
                });
            }
            return result;
        };

        static ScanElement(node: any, content: any, contents: any[]): any {
            let result = "";

            result += "<" + node.nodeName;
            _.forEach(node.attributes, (value: any): void => {
                result += " ";

                let attributevalue = "";
                if (contents.length > 0) {
                    attributevalue = Render.Format(content, value.nodeValue);
                }

                result += value.localName + "=\"" + attributevalue + "\"";
                result += " ";
            });
            result += ">";

            let children = [];
            _.forEach(node.childNodes, (node: any): void => {
                result += this.ScanNode(node, contents);
            });

            result += "</" + node.nodeName + ">";

            return result;
        }

        static ScanText(node: any, content: any): any {
            let result = node.data;
            if (content) {
                result = Render.Format(content, node.data);
            }
            return result;
        }

        static ScanNode(node: any, contents: any[]): any {
            let result = "";
            switch (node.nodeType) {
                case 1:
                    switch (node.localName) {
                        case "repeat":
                            _.forEach(contents, (content: any): void => {
                                _.forEach(node.childNodes, (node: any): void => {
                                    result += this.ScanNode(node, [content]);
                                });
                            });
                            break;
                        case "if":

                            break;
                        default:
                            result = this.ScanElement(node, contents[0], contents);
                            break;
                    }
                    break;
                case 3:
                    result = this.ScanText(node, contents[0]);
                    break;
                case 8:
                    break;
                case 10:
                    result = "<!DOCTYPE " + node.nodeName + ">";
                    break;

                /*
                 case 1:  //  "element";
                 case 2:  //  "attribute";
                 case 4:  //  "cdata";
                 case 5:  //  "entity_ref";
                 case 6:  //  "entity";
                 case 7:  //  "pi";
                 case 8:  //  "comment";
                 case 9:  //  "document";
                 case 10: //  "document_type";
                 case 11: //  "document_fragment";
                 case 12: //  "notation";
                 */

                default:
                    result = this.ScanElement(node, contents[0], contents);
            }
            return result;
        }

        static ScanHtml(html: string, records: [{create: any, modify: any, content: any}], callback: (error: any, doc: any) => void): any {
            if (server) {
                jsdom.env(
                    html,
                    [],
                    (errors, window) => {
                        if (!errors) {
                            let result = "";

                            _.forEach(window.document.childNodes, (element) => {
                                result += this.ScanNode(element, records);
                            });

                            callback(null, result);
                        } else {
                            callback(errors, null);
                        }
                    }
                );
            } else {
                let root = document.createElement('html');
                root.innerHTML = html;
                let result = this.ScanNode(root, records);
                callback(null, result);
            }
        }

        static MakeElement(node): any {
            let result = {"name": "", "type": "", "_$": {}, "@": []};
            result.name = node.nodeName;
            result["_$"] = node.attributes;
            let children = [];
            _.forEach(node.childNodes, (node) => {
                children.push(this.MakeNode(node));
            });
            result["@"] = children;
            return result;
        }

        static MakeText(node): any {
            let result = "";
            result = node.nodeValue;
            return result;
        }

        static MakeNode(node): any {
            let result = null;
            switch (node.nodeType) {
                case 1:
                    result = this.MakeElement(node);
                    result.type = "element";
                    break;
                case 2:
                    result = this.MakeElement(node);
                    result.type = "attribute";
                    break;
                case 3:
                    result = this.MakeText(node);
                    break;
                case 4:
                    result = this.MakeElement(node);
                    result.type = "cdata";
                    break;
                case 5:
                    result = this.MakeElement(node);
                    result.type = "entity_ref";
                    break;
                case 6:
                    result = this.MakeElement(node);
                    result.type = "entity";
                    break;
                case 7:
                    result = this.MakeElement(node);
                    result.type = "pi";
                    break;
                case 8:
                    result = this.MakeElement(node);
                    result.type = "comment";
                    break;
                case 9:
                    result = this.MakeElement(node);
                    result.type = "document";
                    break;
                case 10:
                    result = this.MakeElement(node);
                    result.type = "document_type";
                    break;
                case 11:
                    result = this.MakeElement(node);
                    result.type = "document_fragment";
                    break;
                case 12:
                    result = this.MakeElement(node);
                    result.type = "notation";
                    break;
                default:
            }
            return result;
        }

        static fromHtml(html: string, callback: (error: any, doc: any) => void): any {
            if (server) {
                jsdom.env(
                    html,
                    [],
                    (errors, window) => {
                        if (!errors) {
                            let root = window.document;
                            let result = this.MakeNode(root);
                            callback(null, [result]);
                        } else {
                            callback(errors, []);
                        }
                    }
                );
            } else {
                let root = document.createElement('html');
                root.innerHTML = html;
                let result = this.MakeNode(root);
                callback(null, [result]);
            }

        }

        // json to html
        static toHtml(object: any, html: string): string {
            _.each(object, (element, name) => {
                if (typeof element === 'object') {

                    switch (element["type"]) {
                        case "element": {
                            html += "<" + element["name"];
                            let attributes = element["_$"];
                            if (attributes) {
                                html += " ";
                                _.each(attributes, (value, name) => {
                                    html += name + "=" + "'" + value + "' ";
                                });
                            }
                            let child = element["@"];
                            if (child) {
                                if (child.length == 0) {
                                    html += "></" + element["name"] + ">";
                                } else {
                                    html += ">" + Render.toHtml(child, "") + "</" + element["name"] + ">";
                                }
                            } else {
                                html += "/>";
                            }
                            break;
                        }
                        case "doctypedecl": {
                            html += "<!DOCTYPE " + element["name"] + ">";
                            break;
                        }
                    }
                } else {
                    html += element;
                }

            });
            return html;
        };

        // components type document to html
        static docToHtml(doc: any, record: {create: any, modify: any, name:string, content: any}, callback: (error: any, result: string) => void): void {

            let flatten_collection = (a: any, b: any): any => {

                let flatten_style = (a: any): string => {
                    let result: string = "";
                    _.forEach(a, (v: any, k: any): void => {
                        result += k + ":" + v + ";";
                    });
                    return result;
                };

                _.forEach(b, (v: any, k: any): void => {
                    if (k == "style") {
                        a[k] = flatten_style(v);
                    } else {
                        a[k] = v;
                    }
                });
                return a;
            };

            let mould = (document, parent, field, type) => {
                let element = Render.toHtml(field, "");
                let moulding = document.createElement(parent_restricted(type));      //　展開用型枠
                moulding.innerHTML = element;                      // pour it up
                let parent_node = document.getElementById(parent);
                if (parent_node) {
                    parent_node.appendChild(moulding.firstChild);  // Take out
                } else {
                    let a = parent;
                }
            };

            let parent_restricted = (type: string): string => {
                let restricted: any = {
                    "li": "ol",
                    "dt": "dl",
                    "dd": "dl",
                    "caption": "table",
                    "thead": "table",
                    "tbody": "table",
                    "tfoot": "table",
                    "colgroup": "table",
                    "col": "table",
                    "tr": "table",
                    "td": "tr",
                    "th": "tr",
                    "option": "select",
                    "legend": "fieldset",
                    "optgroup": "select"
                };

                let result: string = restricted[type];
                if (!result) {
                    result = "div";
                }
                return result;
            };

            let elements = (page, callback: (control: any, element: any) => boolean): void => {
                let _continue = true;
                _.forEach(page, (control: any): boolean => {
                    _.forEach(control.elements, (element: any): boolean => {
                        _continue = callback(control, element);
                        return _continue;
                    });
                    return _continue;
                });
            };

            jsdom.env(
                "<html><head></head><body><div id='root'/></body></html>",
                [],
                function (errors: any, window: any): void {
                    if (!errors) {
                        let document = window.document;
                        elements(doc.content, (control, _element: any): boolean => {
                            let field = [];
                            let id = _element.id;
                            let parent = _element.parent;
                            let label = _element.label;
                            let type = _element.type;
                            let attributes = _element.attributes;
                            let contents = _element.contents;

                            let events = _element.events;

                            switch (type) {
                                case "img": {
                                    if (record) {
                                        if (record.content) {
                                            let name = attributes["src"];
                                            if (name) {
                                                let replaceive = record.content[name];
                                                if (replaceive) {
                                                    attributes["src"] = "" + replaceive.value;
                                                }
                                            }
                                        }
                                    }

                                    field = [{
                                        "name": type, "type": "element",
                                        "_$": flatten_collection({"id": id}, attributes),
                                        "@": contents
                                    }];
                                    mould(document, parent, field, type);

                                    break;
                                }
                                case "div": {
                                    if (record) {
                                        if (record.content) {
                                            if (contents) {
                                                if (typeof contents == "string") {
                                                    contents = Render.Format(record, contents);
                                                }
                                            }
                                        }
                                    }
                                    field = [{
                                        "name": type, "type": "element",
                                        "_$": flatten_collection({"id": id}, attributes),
                                        "@": contents
                                    }];
                                    mould(document, parent, field, type);

                                    break;
                                }

                                case "form":
                                case "span":
                                case "label":
                                case "input":
                                case "textarea": {

                                    field = [{
                                        "name": type, "type": "element",
                                        "_$": flatten_collection({"id": id}, attributes),
                                        "@": contents
                                    }];
                                    mould(document, parent, field, type);

                                    break;
                                }
                                case "select":// for bootstrap 3
                                {
                                    let contents_model_name = id + "_contents";
                                    field = [{
                                        "name": "div", "type": "element",
                                        "_$": {"class": "form-group"},
                                        "@": [
                                            {
                                                "name": "label", "type": "element",
                                                "_$": {"for": id},
                                                "@": label,
                                            },
                                            {
                                                "name": "select", "type": "element",
                                                "_$": flatten_collection({
                                                    id: id,
                                                    "class": "form-control",
                                                    "ng-init": id + " = " + contents_model_name + "[0]",
                                                    "ng-model": id,
                                                    "ng-options": "option for option in " + contents_model_name,
                                                    "name": id
                                                }, attributes)
                                            }]
                                    }];
                                    mould(document, parent, field, type);
                                    break;
                                }
                                case "button":// for bootstrap 3
                                {
                                    field = [
                                        {
                                            "name": "button", "type": "element",
                                            "_$": flatten_collection({
                                                id: id,
                                                "class": "form-control",
                                                "ng-click": "click_" + id + "()"
                                            }, attributes),
                                            "@": label
                                        }
                                    ];
                                    mould(document, parent, field, type);

                                    break;
                                }

                                case "table": {
                                    field = [{
                                        "name": type, "type": "element",
                                        "_$": flatten_collection({"id": id}, attributes),
                                        "@": contents
                                    }];

                                    // "table"Tag  is restricted parent

                                    let element = Render.toHtml(field, "");
                                    let moulding = document.createElement(parent_restricted(type));      //　展開用型枠
                                    moulding.innerHTML = element;                      // pour it up
                                    let parent_node = document.getElementById(parent);
                                    parent_node.appendChild(moulding);  // Take out

                                    break;
                                }

                                case "tr": {

                                    field = [{
                                        "name": type, "type": "element",
                                        "_$": flatten_collection({"id": id}, attributes),
                                        "@": contents
                                    }];
                                    mould(document, parent, field, type);

                                    break;
                                }

                                case "td": {

                                    field = [{
                                        "name": type, "type": "element",
                                        "_$": flatten_collection({"id": id}, attributes),
                                        "@": contents
                                    }];
                                    mould(document, parent, field, type);

                                    break;
                                }
                                default: {

                                    field = [{
                                        "name": type, "type": "element",
                                        "_$": flatten_collection({"id": id}, attributes),
                                        "@": contents
                                    }];
                                    mould(document, parent, field, type);

                                    break;
                                }
                            }

                            return true;
                        });

                        let the_thing_itself = document.getElementById("root");
                        callback(null, the_thing_itself.innerHTML);
                        window.close();
                    } else {
                        callback({code: 20000, message: ""}, null);
                    }
                }
            );
        };

        // html to components type document
        static fromHtmltoDoc(html: string, callback: (error: any, doc: any) => void): void {
            if (server) {

            } else {

            }

        }

    }
}

if (server) {
    module.exports = HtmlEdit;
}
