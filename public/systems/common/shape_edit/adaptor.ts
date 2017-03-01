/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

/// <reference path="./shape_edit.ts" />

"use strict";
import {defaultCoreCipherList} from "constants";

const server = (typeof window === 'undefined');

namespace Adaptor {

    if (server) {
        var _: _.LoDashStatic = require('lodash');
        var ShapeEdit: any = require("./shape_edit");
        var PDFDocument = require('pdfkit');
        var http = require('http');
        var request = require('request');
        var url = require('url');
        var fs = require('fs');
        var Q = require('q');
        var crypto = require('crypto');
    }

    export class SVGAdaptor {

        private doc: string;
        private tilesizew: number = 64;
        private tilesizeh: number = 64;
        private width: string;
        private height: string;
        private embedded: boolean;
        private webfonts: any[];

        constructor(width: number, height: number, embedded: boolean, webfonts: any[]) {

            let hoge = width * 0.37125;
            let geho = height * 0.37125;

            this.doc = "";
            this.width = "297mm";
            this.height = "210mm";

            this.embedded = embedded;
            this.webfonts = webfonts;
        }

        static StrokeColor(stroke_width: number, stroke_color: string): string {
            let result = stroke_color;
            if (stroke_width == 0) {
                result = "rgba(0, 0, 0, 0)";
            }
            return result;
        }

        public Bezier(data: any, callback: (error: any) => void): void {

            let bezier: string = '<path id="' + data.ID() + '" stroke="' + SVGAdaptor.StrokeColor(data.property.strokewidth, data.property.strokestyle.ToString()) + '" stroke-width="' + data.property.strokewidth + '" stroke-linecap="round" stroke-miterlimit="2" fill="' + data.property.fillstyle.ToString() + '" fill-opacity="' + data.property.fillstyle.a + '" d="';
            let startpoint: ShapeEdit.Location = null;
            ShapeEdit.CurveShape.Each(data.vertex.list, (vertex) => {
                bezier += " M " + vertex.x + "," + vertex.y;
                startpoint = vertex;
            }, (vertex) => {
                bezier += " C " + vertex.controlPoint0.x + "," + vertex.controlPoint0.y + " " + vertex.controlPoint1.x + "," + vertex.controlPoint1.y + " " + vertex.x + "," + vertex.y;
            }, (vertex) => {
                bezier += " C " + vertex.controlPoint0.x + "," + vertex.controlPoint0.y + " " + vertex.controlPoint1.x + "," + vertex.controlPoint1.y + " " + vertex.x + "," + vertex.y;
                bezier += " C " + startpoint.controlPoint0.x + "," + startpoint.controlPoint0.y + " " + startpoint.controlPoint1.x + "," + startpoint.controlPoint1.y + " " + startpoint.x + "," + startpoint.y;
            });
            bezier += '" />';

            let path = "";
            if (data.property.path) {
                path = data.property.path;
            }

            let defs = '<defs>' +
                '<pattern id="' + data.ID() + '_IMAGE" width="' + this.tilesizew + '" height="' + this.tilesizeh + '" patternUnits="userSpaceOnUse">' +
                '<image x="0" y="0" width="' + this.tilesizew + '" height="' + this.tilesizeh + '" xlink:href="' + path + '"/>' +
                '</pattern>' +
                '</defs>';

            this.doc += bezier + defs;
            callback(null);
        }

        public Polygon(data: any, callback: (error: any) => void): void {

            let lineshape: string = '<path id="' + data.ID() + '" stroke="' + SVGAdaptor.StrokeColor(data.property.strokewidth, data.property.strokestyle.ToString()) + '" stroke-width="' + data.property.strokewidth + '" stroke-linecap="round" stroke-miterlimit="2" fill="' + data.property.fillstyle.ToString() + '" fill-opacity="' + data.property.fillstyle.a + '" d="';
            if (data.property.path != "") {
                lineshape = '<path id="' + data.ID() + '" stroke="' + data.property.strokestyle.ToString() + '" stroke-width="' + data.property.strokewidth + '" stroke-linecap="round" stroke-miterlimit="2" fill="url(#' + data.ID() + '_IMAGE)' + '" fill-opacity="' + data.property.fillstyle.a + '" d="';
            }

            let startpoint: ShapeEdit.Location = null;
            ShapeEdit.LineShape.Each(data.vertex.list, (vertex) => {
                    lineshape += "M " + vertex.x + "," + vertex.y + " L ";
                    startpoint = vertex;
                },
                (vertex) => {
                    lineshape += vertex.x + "," + vertex.y + " ";
                },
                (vertex) => {
                    lineshape += vertex.x + "," + vertex.y + " ";
                    lineshape += startpoint.x + "," + startpoint.y + " ";
                }
            );
            lineshape += "Z M " + startpoint.x + "," + startpoint.y + '" />';


            let path = "";
            if (data.property.path) {
                path = data.property.path;
            }

            let defs = '<defs>' +
                '<pattern id="' + data.ID() + '_IMAGE" width="' + this.tilesizew + '" height="' + this.tilesizeh + '" patternUnits="userSpaceOnUse">' +
                '<image x="0" y="0" width="' + this.tilesizew + '" height="' + this.tilesizeh + '" xlink:href="' + path + '"/>' +
                '</pattern>' +
                '</defs>';

            this.doc += lineshape + defs;
            callback(null);
        }

        public Text(data: any, callback: (error: any) => void): void {
            let text: string = '';
            let defs: string = '';
            let error = null;

            let create_def = (fonts: any[]) => {
                let result: string = '<defs><style type="text/css">';
                _.forEach(fonts, (font) => {
                    result += '@import url(' + font.url + ');'
                });
                result += '</style></defs>';
                return result;
            };

            if (data) {
                if (data.property) {
                    if (data.property.font) {
                        if (data.property.font.keyword) {
                            let urlkeyword = data.property.font.keyword.split(' ').join('+');

                            text = '<text text-rendering="geometricPrecision" id="' + data.ID() + '" fill="' + data.property.fillstyle.ToString() + '" font-weight="' + data.property.font.weight + '" font-family="' + data.property.font.family[0] + "," + data.property.font.keyword + '" font-size="' + (data.property.font.size / 16) + 'rem" x="' + data.rectangle.location.x + '" y="' + data.rectangle.location.y + '">';

                            //    text = '<text text-rendering="geometricPrecision" id="' + data.ID() + '" fill="' + data.property.fillstyle.ToString() + '" font-family="' + "Sawarabi Mincho" + '" font-size="' + (data.property.font.size / 16) + 'rem" x="' + data.rectangle.location.x + '" y="' + data.rectangle.location.y + '">';
                            //  text = '<text id="' + data.ID() + '" fill="' + data.property.fillstyle.ToString() + '" font-family="' + 'NotoSansBlack' + '" font-size="' + (data.property.font.size / 16) + 'rem" x="' + data.rectangle.location.x + '" y="' + data.rectangle.location.y + '">';
                            data.DrawText(1, (line, x, y) => {
                                text += '<tspan x="' + x + '" y="' + y + '">' + line.line + '</tspan>';
                            });
                            text += '</text>';

                            defs = create_def(this.webfonts);

                        } else {
                            error = {code: 1, message: ""};
                        }
                    } else {
                        error = {code: 1, message: ""};
                    }
                } else {
                    error = {code: 1, message: ""};
                }
            } else {
                error = {code: 1, message: ""};
            }

            this.doc += text;// + defs;
            callback(error);
        }

        public Box(data: any, callback: (error: any) => void): void {
            let box = '<rect id="' + data.ID() + '" stroke="' + SVGAdaptor.StrokeColor(data.property.strokewidth, data.property.strokestyle.ToString()) + '" stroke-width="' + data.property.strokewidth + '" fill="' + data.property.fillstyle.ToString() + '" x="' + data.rectangle.location.x + '" y="' + data.rectangle.location.y + '" width="' + data.rectangle.size.w + '" height="' + data.rectangle.size.h + '" />';

            let defs = '<defs>' +
                '<filter id="' + data.ID() + '" x="' + data.rectangle.location.x + '" y="' + (data.rectangle.location.y + data.rectangle.size.h) + '" width="' + data.rectangle.size.w + '" height="' + data.rectangle.size.h + '" patternUnits="userSpaceOnUse" viewBox="0 0 ' + data.rectangle.size.w + ' ' + data.rectangle.size.h + '">' +
                '</filter>' +
                '</defs>';

            this.doc += box + defs;
            callback(null);
        }

        public Oval(data: any, callback: (error: any) => void): void {
            let rx = data.rectangle.size.w / 2;
            let ry = data.rectangle.size.h / 2;
            let cx = data.rectangle.location.x + rx;
            let cy = data.rectangle.location.y + ry;
            let ellipse = '<ellipse id="' + data.ID() + '" stroke="' + SVGAdaptor.StrokeColor(data.property.strokewidth, data.property.strokestyle.ToString()) + '" stroke-width="' + data.property.strokewidth + '" fill="' + data.property.fillstyle.ToString() + '" cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" />';

            let defs = '<defs>' +
                '<filter id="' + data.ID() + '" x="' + data.rectangle.location.x + '" y="' + (data.rectangle.location.y + data.rectangle.size.h) + '" width="' + data.rectangle.size.w + '" height="' + data.rectangle.size.h + '" patternUnits="userSpaceOnUse" viewBox="0 0 ' + data.rectangle.size.w + ' ' + data.rectangle.size.h + '">' +
                '</filter>' +
                '</defs>';

            this.doc += ellipse + defs;
            callback(null);
        }

        private get_image(path, callback: (error: any, data) => any): void {

            let pathToExtention = (path: string): string => {
                let _url = url.parse(path);
                let pathname = _url.pathname;
                let split = pathname.split(".");
                let result = split[split.length - 1];
                switch (result) {
                    case 'jpg':
                        result = "jpeg";
                        break;
                    default:
                }
                return result;
            };

            if (this.embedded) {
                let draw = (path: any): any => {
                    return new Promise((resolve: any, reject: any): void => {
                        let _url = url.parse(path);
                        let protocol = _url.protocol;
                        if (protocol == "data:") { // inplace
                            resolve(path);
                        } else {
                            request.get({url: path, encoding: null},
                                (error, response, body): void => {
                                    if (!error) {
                                        if (response) {
                                            if (response.statusCode == 200) {
                                                let data_url = "data:image/" + pathToExtention(path) + ";base64," + new Buffer(body).toString('base64');
                                                resolve(data_url);
                                            } else {
                                                reject({
                                                    code: 10000,
                                                    message: "request.get status " + response.statusCode
                                                });
                                            }
                                        } else {
                                            reject({code: 10000, message: "request.get response is null."});
                                        }
                                    } else {
                                        reject(error);
                                    }
                                });
                        }
                    });
                };

                draw(path).then((value: any): void => {
                    callback(null, value);
                }).catch((error: any): void => {
                    callback(error, null);
                });
            } else {
                callback(null, path);
            }
        }

        public ImageRect(data: any, callback: (error: any) => void): void {

            let rect = '<rect id="' + data.ID() + '" stroke="none" fill="url(#' + data.ID() + ')" x="' + data.rectangle.location.x + '" y="' + data.rectangle.location.y + '" width="' + data.rectangle.size.w + '" height="' + data.rectangle.size.h + '" />';

            let path = "";
            if (data.property.path) {
                path = data.property.path;
            }

            this.get_image(path, (error, image_url) => {

                let defs = '<defs>' +
                    '<pattern id="' + data.ID() + '" x="' + data.rectangle.location.x + '" y="' + (data.rectangle.location.y + data.rectangle.size.h) + '" width="' + data.rectangle.size.w + '" height="' + data.rectangle.size.h + '" patternUnits="userSpaceOnUse" viewBox="0 0 ' + data.rectangle.size.w + ' ' + data.rectangle.size.h + '">' +
                    '<image xlink:href="' + image_url + '" preserveAspectRatio="none" x="0" y="0" width="' + data.rectangle.size.w + '" height="' + data.rectangle.size.h + '" />' +
                    '</pattern>' +
                    '</defs>';

                this.doc += rect + defs;
                callback(null);
            });
        }

        public Shapes(data: any, callback: (error: any) => void): void {
            let draw = (shape: any): any => {
                return (): any => {
                    return new Promise((resolve: any, reject: any): void => {
                        shape.ToSVG((error): void => {
                            if (!error) {
                                resolve(null);
                            } else {
                                reject(error);
                            }
                        });
                    });
                };
            };

            let promises = [];
            this.doc += '<g id="' + data.ID() + '">';
            _.forEach(data.Shapes(), (shape: ShapeEdit.BaseShape) => {
                promises.push(draw(shape));
            });

            promises.reduce((prev, current, index, array): any => {
                return prev.then(current);
            }, Promise.resolve()).then(() => {

                let defs = '<defs>' +
                    '<filter id="' + data.ID() + '" x="' + data.rectangle.location.x + '" y="' + (data.rectangle.location.y + data.rectangle.size.h) + '" width="' + data.rectangle.size.w + '" height="' + data.rectangle.size.h + '" patternUnits="userSpaceOnUse" viewBox="0 0 ' + data.rectangle.size.w + ' ' + data.rectangle.size.h + '">' +
                    '</filter>' +
                    '</defs>';

                this.doc += "</g>";
                this.doc += defs;

                callback(null);
            }).catch((error) => {
                callback(error);
            });
        }

        public Canvas(canvas: any, callback: (error: any) => void): void {

            let create_def = (fonts: any[]) => {
                let result: string = '<defs><style type="text/css">';
                _.forEach(fonts, (font) => {
                    result += '@import url(' + font.url + ');'
                });
                result += '</style></defs>';
                return result;
            };

            canvas.shapes.ToSVG((error) => {
                let defs = create_def(this.webfonts);
                let result: string = '<?xml version="1.0" encoding="UTF-8"?>' +
                    '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">' +
                    //     '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="' + canvas.canvas.width + '" height="' + canvas.canvas.height + '"  xml:space="preserve">' +
                    //    '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ' + canvas.canvas.width + ' ' + canvas.canvas.height + '"  xml:space="preserve">' +
                    '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="' + this.width + '" height="' + this.height + '" xml:space="preserve">' +
                    defs +
                    this.doc +
                    '</svg>';
                this.doc = result;
                callback(null);
            });
        }

        public Write(): any {
            return this.doc;
        }
    }

    export class PDFAdaptor {

        private path: string;
        private doc = null;
        private serif = "";
        private sans_serif = "";
        private pagehight = 0;
        private originx = 40;
        private originy = 40;
        private nameboxwidth = 250;
        private valueboxwidth = 250;
        private boxhight = 20;
        private stringoffsetx = 3;
        private stringoffsety = 2;

        private tilesizew = 64;
        private tilesizeh = 64;

        constructor(work_path: string, paper: any) {
            this.path = work_path;

            this.serif = "public/fonts/ttf/ipaexm.ttf";
            this.sans_serif = "public/fonts/ttf/ipaexg.ttf";

            this.doc = new PDFDocument(paper);
            this.doc.registerFont('serif', this.serif, '');
            this.doc.registerFont('sans-serif', this.sans_serif, '');
            this.pagehight = 660;
            this.originx = 40;
            this.originy = 40;
            this.boxhight = 20;
            this.stringoffsetx = 3;
            this.stringoffsety = 2;
        }

        static StrokeColor(stroke_width: number, fill_color: any, stroke_color: any): any {
            let result: any = stroke_color;
            if (stroke_width == 0) {
                result = fill_color;
            }
            return result;
        }

        public Bezier(data: any, callback: (error: any) => void): void {
            let startpoint: ShapeEdit.Location = null;
            ShapeEdit.CurveShape.Each(data.vertex.list, (vertex) => {
                this.doc.moveTo(vertex.x, vertex.y);
                startpoint = vertex;
            }, (vertex) => {
                this.doc.bezierCurveTo(vertex.controlPoint0.x, vertex.controlPoint0.y, vertex.controlPoint1.x, vertex.controlPoint1.y, vertex.x, vertex.y);
            }, (vertex) => {
                this.doc.bezierCurveTo(vertex.controlPoint0.x, vertex.controlPoint0.y, vertex.controlPoint1.x, vertex.controlPoint1.y, vertex.x, vertex.y);
            });

            this.doc.bezierCurveTo(startpoint.controlPoint0.x, startpoint.controlPoint0.y, startpoint.controlPoint1.x, startpoint.controlPoint1.y, startpoint.x, startpoint.y);
            this.doc.lineWidth(data.property.strokewidth);

            this.doc.fillAndStroke(data.property.fillstyle.RGB(), PDFAdaptor.StrokeColor(data.property.strokewidth, data.property.fillstyle.RGB(), data.property.strokestyle.RGB()));
            callback(null);
        }

        public Polygon(data: any, callback: (error: any) => void): void {
            let startpoint: ShapeEdit.Location = null;
            ShapeEdit.LineShape.Each(data.vertex.list, (vertex) => {
                    this.doc.moveTo(vertex.x, vertex.y);
                    startpoint = vertex;
                },
                (vertex) => {
                    this.doc.lineTo(vertex.x, vertex.y);
                },
                (vertex) => {
                    this.doc.lineTo(vertex.x, vertex.y);
                }
            );

            this.doc.lineTo(startpoint.x, startpoint.y);
            this.doc.lineWidth(data.property.strokewidth);
            this.doc.fillAndStroke(data.property.fillstyle.RGB(), PDFAdaptor.StrokeColor(data.property.strokewidth, data.property.fillstyle.RGB(), data.property.strokestyle.RGB()));
            callback(null);
        }

        public Text(data: any, callback: (error: any) => void): void {
            let text: string = '';
            let defs: string = '';

            if (data) {
                if (data.property) {
                    if (data.property.font) {
                        if (data.property.font.keyword) {
                            let urlkeyword = data.property.font.keyword.split(' ').join('+');
                            let lineheight = data.property.font.size * 1.2;

                            this.doc.fillAndStroke(data.property.fillstyle.RGB(), data.property.strokestyle.RGB());
                            data.DrawText(1, (line, x, y) => {
                                try {
                                    let page_width = this.doc.page.width;
                                    let line_end = x + line.length;
                                    let gap = page_width - line_end;
                                    if (gap > 27) {
                                        this.doc.font(data.property.font.keyword).fontSize(data.property.font.size).text(line.line, x, y - lineheight);
                                    }
                                    callback(null);
                                } catch (e) {
                                    callback(e);
                                }
                            });
                        } else {
                            callback({code: 100, message: "no keyword"});
                        }
                    } else {
                        callback({code: 200, message: "no font"});
                    }
                } else {
                    callback({code: 300, message: "no property"});
                }
            } else {
                callback({code: 400, message: "no data"});
            }
        }

        public Box(data: any, callback: (error: any) => void): void {
            this.doc.rect(data.rectangle.location.x, data.rectangle.location.y, data.rectangle.size.w, data.rectangle.size.h);
            this.doc.lineWidth(data.property.strokewidth);
            this.doc.fillAndStroke(data.property.fillstyle.RGB(), PDFAdaptor.StrokeColor(data.property.strokewidth, data.property.fillstyle.RGB(), data.property.strokestyle.RGB()));
            callback(null);
        }

        public Oval(data: any, callback: (error: any) => void): void {
            let rx = data.rectangle.size.w / 2;
            let ry = data.rectangle.size.h / 2;
            let cx = data.rectangle.location.x + rx;
            let cy = data.rectangle.location.y + ry;

            this.doc.ellipse(cx, cy, rx, ry);
            this.doc.lineWidth(data.property.strokewidth);
            this.doc.fillAndStroke(data.property.fillstyle.RGB(), PDFAdaptor.StrokeColor(data.property.strokewidth, data.property.fillstyle.RGB(), data.property.strokestyle.RGB()));
            callback(null);
        }

        public ImageRect(data: any, callback: (error: any) => void): void {

            let _doc = this.doc;

            let path = "";
            if (data.property.path) {
                path = data.property.path;
            }

            let _url = url.parse(path);
            let protocol = _url.protocol;
            let temp_path = this.path;
            if (protocol == "data:") { // inplace

                let md5hash = crypto.createHash('md5');
                md5hash.update(path, 'binary');
                let file_name = md5hash.digest('hex');  // generate unique filename.

                let regex = /^data:.+\/(.+);base64,(.*)$/;
                let matches = path.match(regex);
                let ext = matches[1];

                switch (ext) {
                    case "jpg": // for pdfkit
                    case "jpeg":
                    case "png": {
                        // dataToImage
                        let content = matches[2];
                        let buffer = new Buffer(content, 'base64');
                        let target_file_path = temp_path + "/" + file_name;
                        fs.writeFile(target_file_path, buffer, 'binary', (error: any): void => {
                            if (!error) {
                                try {
                                    _doc.image(target_file_path, data.rectangle.location.x, data.rectangle.location.y, {
                                        width: data.rectangle.size.w,
                                        height: data.rectangle.size.h
                                    });
                                    fs.unlink(target_file_path, (error: any): void => {
                                        if (!error) {
                                            callback(null);
                                        } else {
                                            callback(error);
                                        }
                                    });
                                } catch (e) {
                                    callback(e);
                                }
                            } else {
                                callback(error);
                            }
                        });
                        break;
                    }
                    default:
                        callback({code: 10000, message: "image format not support for PDF :" + ext});
                }
            } else { // remote file
                let split_path = _url.pathname.split("/");
                let file_name = split_path[split_path.length - 1];
                let split_filename = file_name.split(/\.(?=[^.]+$)/);
                let ext = split_filename[split_filename.length - 1];

                switch (ext) {
                    case "jpg": // for pdfkit
                    case "jpeg":
                    case "png": {
                        let buffer = [];
                        request.get(path, {timeout: 5000}, (error: any): void => { //Only for timeout check
                            if (!error) {
                                let innner_req = http.get(path, (res: any): void => {
                                    res.setEncoding('binary');
                                    res.on('data', (chunk: any): void => {
                                        buffer += chunk;
                                    });

                                    res.on('end', () => {
                                        let target_file_path = temp_path + "/" + file_name;
                                        fs.writeFile(target_file_path, buffer, 'binary', (error: any): void => {
                                            if (!error) {
                                                try {
                                                    _doc.image(target_file_path, data.rectangle.location.x, data.rectangle.location.y, {
                                                        width: data.rectangle.size.w,
                                                        height: data.rectangle.size.h
                                                    });
                                                    callback(null);
                                                } catch (e) {
                                                    callback(e);
                                                }
                                            } else {
                                                callback(error);
                                            }
                                        })
                                    })
                                });

                                innner_req.on('error', (e: any): void => {
                                    callback(e);
                                })
                            } else {
                                callback({code: 100000, message: error.message});  //Because timeout occurs temporarily, it is not an error.
                            }
                        });
                        break;
                    }
                    default:
                        callback({code: 100000, message: "image format not support for PDF :" + ext});
                }
            }
        }

        public Shapes(data: any, callback: (error: any) => void): void {

            let draw = (shape: any): any => {
                return (): any => {
                    return new Promise((resolve: any, reject: any): void => {

                        shape.ToPDF((error): void => {
                            if (!error) {
                                resolve(null);
                            } else {
                                reject(error);
                            }
                        });

                    });
                };
            };

            let promises = [];

            _.forEach(data.Shapes(), (shape) => {
                promises.push(draw(shape));
            });

            promises.reduce((prev, current, index, array): any => {
                return prev.then(current);
            }, Promise.resolve()).then(() => {
                callback(null);
            }).catch((error) => {
                callback(error);
            });

        }

        public Canvas(canvas: any, callback: (error: any) => void): void {
            canvas.shapes.ToPDF(callback);
        }

        public Write(): any {
            this.doc.stroke();
            return this.doc;
        }
    }

}

if (server) {
    module.exports = Adaptor;
}
