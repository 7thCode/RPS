/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace LayoutsModule {

    const fs = require('graceful-fs');
    const _ = require('lodash');

    const mongoose = require('mongoose');

    const core = require(process.cwd() + '/core');
    const share: any = core.share;
    const config = share.config;
    const Wrapper = share.Wrapper;
    const ShapeEditModule: any = core.ShapeEditModule;
    const ServerModule: any = core.ServerModule;
    const AdaptorModule: any = core.AdaptorModule;

    const services_config = share.services_config;

    const LayoutModel: any = require(share.Models("/services/layouts/layout"));

    const builder_userid = config.systems.userid;// template maker user id

    const webfonts: any[] = services_config.webfonts;

    export class Layout {

        constructor() {
        }

        /**
         * @param request
         * @returns userid
         */
        static userid(request): string {
            return request.user.userid;
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public create_template(request: any, response: any): void {
            Layout.create(request, response, 1);
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public create_layout(request: any, response: any): void {
            Layout.create(request, response, 2);
        }

        /**
         * @param request
         * @param response
         * @param layout_type
         * @returns none。
         *
         * nameがキー
         */
        static create(request: any, response: any, layout_type: number): void {
            const number: number = 2000;
            let userid = Layout.userid(request);
            let name = request.body.name;
            if (name) {
                Wrapper.FindOne(response, number, LayoutModel, {$and: [{name: name}, {type: layout_type}, {userid: userid}]}, (response: any, exists: any): void => {
                    if (!exists) {
                        let layout: any = new LayoutModel();
                        layout.userid = userid;
                        layout.name = name;
                        layout.content = request.body.content;
                        layout.open = true;
                        layout.type = layout_type;
                        Wrapper.Save(response, number, layout, (response: any, object: any): void => {
                            Wrapper.SendSuccess(response, object);
                        });
                    } else {
                        Wrapper.SendWarn(response, 1, "already", {});
                    }
                });
            } else {
                Wrapper.SendWarn(response, 1, "no name", {});
            }
        }

        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        public put_template(request: any, response: any): void {
            Layout.put(request, response, 1);
        }

        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        public put_layout(request: any, response: any): void {
            Layout.put(request, response, 2);
        }

        /**
         * @param request
         * @param response
         * @param layout_type
         * @returns none
         *
         * nameが同じレイアウトがなければ新規。
         * あれば更新。
         */
        static put(request: any, response: any, layout_type: number): void {
            const number: number = 2000;
            let userid = Layout.userid(request);
            let name = request.body.name;
            if (name) {
                Wrapper.FindOne(response, number, LayoutModel, {$and: [{name: name}, {type: layout_type}, {userid: userid}]}, (response: any, exists: any): void => {
                    if (!exists) {
                        let layout: any = new LayoutModel();
                        layout.userid = userid;
                        layout.name = name;
                        layout.content = request.body.content;
                        layout.open = true;
                        layout.type = layout_type;
                        Wrapper.Save(response, number, layout, (response: any, object: any): void => {
                            Wrapper.SendSuccess(response, object);
                        });
                    } else {
                        let id = request.params.id;
                        Wrapper.FindOne(response, number, LayoutModel, {$and: [{_id: id}, {type: layout_type}, {userid: userid}]}, (response: any, layout: any): void => {
                            if (layout) {
                                layout.content = request.body.content;
                                layout.open = true;
                                layout.type = layout_type;
                                Wrapper.Save(response, number, layout, (response: any, object: any): void => {
                                    Wrapper.SendSuccess(response, object);
                                });
                            } else {
                                Wrapper.SendWarn(response, 2, "not found", {});
                            }
                        });
                    }
                });
            }
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public delete_template(request: any, response: any): void {
            Layout.delete(request, response, 1);
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public delete_layout(request: any, response: any): void {
            Layout.delete(request, response, 2);
        }

        /**
         * @param request
         * @param response
         * @param layout_type
         * @returns none
         */
        static delete(request: any, response: any, layout_type: number): void {
            const number: number = 2200;
            let userid = Layout.userid(request);
            let id = request.params.id;
            Wrapper.FindOne(response, number, LayoutModel, {$and: [{_id: id}, {type: layout_type}, {userid: userid}]}, (response: any, layout: any): void => {
                if (layout) {
                    Wrapper.Remove(response, number, layout, (response: any): void => {
                        Wrapper.SendSuccess(response, {});
                    });
                } else {
                    Wrapper.SendWarn(response, 2, "not found", {});
                }
            });
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public delete_own(request: any, response: any): void {
            const number: number = 2300;
            let userid = Layout.userid(request);
            Wrapper.Delete(response, number, LayoutModel, {userid: userid}, (response: any): void => {
                Wrapper.SendSuccess(response, {});
            });
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public get_template(request: any, response: any): void {
            const number: number = 2400;
            let userid = Layout.userid(request);
            let id = request.params.id;
            Wrapper.FindOne(response, number, LayoutModel, {$and: [{_id: id}, {type: 1}, {$or: [{userid: userid}, {userid: builder_userid}]}]}, (response: any, layout: any): void => {
                if (layout) {
                    Wrapper.SendSuccess(response, layout);
                } else {
                    Wrapper.SendWarn(response, 2, "not found", {});
                }
            });
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public get_layout(request: any, response: any): void {
            const number: number = 2500;
            let userid = Layout.userid(request);
            let id = request.params.id;
            Wrapper.FindOne(response, number, LayoutModel, {$and: [{_id: id}, {type: 2}, {userid: userid}]}, (response: any, layout: any): void => {
                if (layout) {
                    Wrapper.SendSuccess(response, layout);
                } else {
                    Wrapper.SendWarn(response, 2, "not found", {});
                }
            });
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public get_template_query(request: any, response: any): void {
            const number: number = 2600;
            let userid = Layout.userid(request);
            let query: any = JSON.parse(decodeURIComponent(request.params.query));
            let option: any = JSON.parse(decodeURIComponent(request.params.option));
            Wrapper.Find(response, number, LayoutModel, {$and: [{type: 1}, {$or: [{userid: userid}, {userid: builder_userid}]}, query]}, {}, option, (response: any, layouts: any): any => {

                let _layouts = [];
                _.forEach(layouts, (layout) => {
                    if (layout.content) {
                        layout.content.text = "";
                        layout.content.format = {};
                        _layouts.push(layout);
                    }
                });

                Wrapper.SendSuccess(response, _layouts);
            });
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public get_layout_query(request: any, response: any): void {
            const number: number = 2700;
            let userid = Layout.userid(request);
            let query: any = JSON.parse(decodeURIComponent(request.params.query));
            let option: any = JSON.parse(decodeURIComponent(request.params.option));
            Wrapper.Find(response, number, LayoutModel, {$and: [{type: 2}, {userid: userid}, query]}, {}, option, (response: any, layouts: any): any => {

                let _layouts = [];
                _.forEach(layouts, (layout) => {
                    if (layout.content) {
                        layout.content.text = "";
                        layout.content.format = {};
                        _layouts.push(layout);
                    }
                });

                Wrapper.SendSuccess(response, _layouts);
            });
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public get_template_count(request: any, response: any): void {
            const number: number = 2800;
            let userid = Layout.userid(request);
            let query: any = JSON.parse(decodeURIComponent(request.params.query));
            Wrapper.Count(response, number, LayoutModel, {$and: [{type: 1}, {$or: [{userid: userid}, {userid: builder_userid}]}, query]}, (response: any, count: any): any => {
                Wrapper.SendSuccess(response, count);
            });
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public get_layout_count(request: any, response: any): void {
            const number: number = 2900;
            let userid = Layout.userid(request);
            let query: any = JSON.parse(decodeURIComponent(request.params.query));
            Wrapper.Count(response, number, LayoutModel, {$and: [{type: 2}, {userid: userid}, query]}, (response: any, count: any): any => {
                Wrapper.SendSuccess(response, count);
            });
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public get_template_svg(request: any, response: any): void {
            let userid = Layout.userid(request);
            let name = request.params.name;
            Layout.get_svg(request, response, userid, name, 1);
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public get_layout_svg(request: any, response: any): void {
            let userid = Layout.userid(request);
            let name = request.params.name;
            Layout.get_svg(request, response, userid, name, 2);
        }

        /**
         * @param request
         * @param response
         * @param userid
         * @param name
         * @param layout_type
         * @returns none
         */
        static get_svg(request: any, response: any, userid: string, name: string, layout_type: number): void {
            const number: number = 3000;
            // layout_type
            //     1   --- system template
            //   other --- own

            let query: any = {$and: [{name: name}, {type: layout_type}, {userid: userid}]};
            switch (layout_type) {
                case 1:
                    query = {$and: [{name: name}, {type: layout_type}, {$or: [{userid: userid}, {userid: builder_userid}]}]};
                    break;
                default :
            }

            Wrapper.FindOne(response, number, LayoutModel, query, (response: any, layout: any): void => {
                if (layout) {
                    let document: any = JSON.parse(layout.content.text);
                    let handlers: ShapeEdit.EventHandlers = new ShapeEditModule.EventHandlers();
                    let plugins: ShapeEdit.Plugins = new ShapeEditModule.Plugins();
                    let servercanvas = new ServerModule.StubCanvas(document.width, document.height);
                    let adaptor = new AdaptorModule.SVGAdaptor(document.width, document.height, false, webfonts);
                    let canvas: ShapeEdit.Canvas = new ShapeEditModule.Canvas(servercanvas, null, plugins, adaptor, false);
                    ShapeEditModule.Canvas.Load(canvas, document, handlers);
                    response.contentType('image/svg+xml');
                    canvas.ToSVG((error: any): void => {
                        response.send(adaptor.Write());
                    });
                } else {
                    response.status(404).send("");
                }
            });
        };

        /**
         * @param request
         * @param response
         * @returns none
         */
        public layout_svg(request: any, response: any): void {
            //const number: number = 3100;
            let tmp_path = '/tmp/' + request.sessionID;
            let tmp_file = '/noname.svg';
            let layout = request.body.content;
            if (layout) {
                let handlers: ShapeEdit.EventHandlers = new ShapeEditModule.EventHandlers();
                let plugins: ShapeEdit.Plugins = new ShapeEditModule.Plugins();
                let document: any = JSON.parse(layout.content.text);
                let servercanvas = new ServerModule.StubCanvas(document.width, document.height);
                fs.mkdir(tmp_path, () => {
                    let adaptor = new AdaptorModule.SVGAdaptor(document.width, document.height, true, webfonts);
                    let canvas: ShapeEdit.Canvas = new ShapeEditModule.Canvas(servercanvas, null, plugins, adaptor, false);
                    ShapeEditModule.Canvas.Load(canvas, document, handlers);
                    canvas.ToSVG((error: any): void => {
                        if (!error) {
                            fs.writeFile(tmp_path + tmp_file, adaptor.Write(), (error) => {
                                Wrapper.SendSuccess(response, {});
                            });
                        } else {
                            Wrapper.SendError(response, error.code, error.message, error);
                        }
                    });
                });
            } else {
                response.status(404).send("");
            }
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public layout_pdf(request: any, response: any): void {
            //const number: number = 3200;
            let tmp_path = '/tmp/' + request.sessionID;
            let tmp_file = '/noname.pdf';
            let layout = request.body.content;
            let format = request.body.content.content.format;
            if (layout) {
                let handlers: ShapeEdit.EventHandlers = new ShapeEditModule.EventHandlers();
                let plugins: ShapeEdit.Plugins = new ShapeEditModule.Plugins();
                let document: any = JSON.parse(layout.content.text);
                let servercanvas = new ServerModule.StubCanvas(document.width, document.height);
                fs.mkdir(tmp_path, () => {
                    //{size: 'A4', margin: 0, layout: 'portrait'}
                    let adaptor = new AdaptorModule.PDFAdaptor(tmp_path, format);
                    let canvas: ShapeEdit.Canvas = new ShapeEditModule.Canvas(servercanvas, null, plugins, adaptor, false);
                    ShapeEditModule.Canvas.Load(canvas, document, handlers);
                    canvas.ToPDF((error: any): void => {
                        if (!error) {
                            let writer = fs.createWriteStream(tmp_path + tmp_file);
                            doc.pipe(writer);
                            writer.on('finish', (): void => {
                                Wrapper.SendSuccess(response, {});
                            });
                            doc.end();
                        } else {
                            Wrapper.SendError(response, error.code, error.message, error);
                        }
                    });
                    let doc = adaptor.Write();
                });
            } else {
                response.status(404).send("");
            }
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public download_pdf(request: any, response: any): void {

            let delete_folder_recursive = function (path) {
                fs.readdirSync(path).forEach(function (file) {
                    let curPath = path + "/" + file;
                    if (fs.lstatSync(curPath).isDirectory()) { // recurse
                        delete_folder_recursive(curPath);
                    } else {
                        fs.unlinkSync(curPath);
                    }
                });
                fs.rmdirSync(path);
            };

            let tmp_path = '/tmp/' + request.sessionID;
            let tmp_file = '/noname.pdf';
            response.download(tmp_path + tmp_file, (error: any): void => {
                if (!error) {
                    fs.unlink(tmp_path + tmp_file, (error: any): void => {
                        if (!error) {
                            delete_folder_recursive(tmp_path);
                        }
                    });
                }
            });
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public download_svg(request: any, response: any): void {

            let delete_folder_recursive = function (path) {
                fs.readdirSync(path).forEach(function (file) {
                    let curPath = path + "/" + file;
                    if (fs.lstatSync(curPath).isDirectory()) { // recurse
                        delete_folder_recursive(curPath);
                    } else {
                        fs.unlinkSync(curPath);
                    }
                });
                fs.rmdirSync(path);
            };

            let tmp_path = '/tmp/' + request.sessionID;
            let tmp_file = '/noname.svg';
            response.download(tmp_path + tmp_file, (error: any): void => {
                if (!error) {
                    fs.unlink(tmp_path + tmp_file, (error: any): void => {
                        if (!error) {
                            delete_folder_recursive(tmp_path);
                        }
                    });
                }
            });
        }
    }
}

module.exports = LayoutsModule;
