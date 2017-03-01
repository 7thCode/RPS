/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace ResourcesModule {

    const fs = require('graceful-fs');
    const _ = require('lodash');

    //const mongoose = require('mongoose');

    const core = require(process.cwd() + '/core');
    const share: any = core.share;
    const config = share.config;
    const Wrapper = share.Wrapper;

    const HtmlEditModule: any = require(share.Server("systems/common/html_edit/html_edit"));

    const ResourceModel: any = require(share.Models("systems/resources/resource"));

    export class Resource {

        static userid(request: any): string {
            return request.user.userid;
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public create_resource(request: any, response: any): void {
            const number: number = 1000;
            let userid = Resource.userid(request);
            let name = request.body.name;
            let type = request.body.type;
            let content = request.body.content;
            Wrapper.FindOne(response, number, ResourceModel, {$and: [{name: name}, {type: type}, {userid: userid}]}, (response: any, exists: any): void => {
                if (!exists) {
                    let resource: any = new ResourceModel();
                    resource.userid = userid;
                    resource.name = name;
                    resource.type = type;
                    resource.content = content;
                    resource.open = true;
                    Wrapper.Save(response, number, resource, (response: any, object: any): void => {
                        Wrapper.SendSuccess(response, object);
                    });
                } else {
                    Wrapper.SendWarn(response, 1, "already", {});
                }
            });
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public put_resource(request: any, response: any): void {
            const number: number = 1100;
            let userid = Resource.userid(request);
            let id = request.params.id;
            Wrapper.FindOne(response, number, ResourceModel, {$and: [{_id: id}, {userid: userid}]}, (response: any, page: any): void => {
                if (page) {
                    page.content = request.body.content;
                    page.open = true;
                    Wrapper.Save(response, number, page, (response: any): void => {
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
        public delete_resource(request: any, response: any): void {
            const number: number = 1200;
            let userid = Resource.userid(request);
            let id = request.params.id;
            Wrapper.FindOne(response, number, ResourceModel, {$and: [{_id: id}, {userid: userid}]}, (response: any, page: any): void => {
                if (page) {
                    Wrapper.Remove(response, number, page, (response: any): void => {
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
        public get_resource(request: any, response: any): void {
            const number: number = 1300;
            let userid = Resource.userid(request);
            let id = request.params.id;
            Wrapper.FindOne(response, number, ResourceModel, {$and: [{_id: id}, {userid: userid}]}, (response: any, page: any): void => {
                if (page) {
                    Wrapper.SendSuccess(response, page);
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
            const number: number = 1200;
            let userid = Resource.userid(request);
            Wrapper.Delete(response, number, ResourceModel, {userid: userid}, (response: any): void => {
                Wrapper.SendSuccess(response, {});
            });
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public get_resource_query(request: any, response: any): void {
            const number: number = 1400;
            let userid = Resource.userid(request);
            let query: any = JSON.parse(decodeURIComponent(request.params.query));
            let option: any = JSON.parse(decodeURIComponent(request.params.option));
            Wrapper.Find(response, number, ResourceModel, {$and: [{userid: userid}, query]}, {}, option, (response: any, pages: any): any => {

                _.forEach(pages, (page) => {
                    page.content = null;
                });

                Wrapper.SendSuccess(response, pages);
            });
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public get_resource_count(request: any, response: any): void {
            const number: number = 2800;
            //let userid = Resource.userid(request);
            let query: any = JSON.parse(decodeURIComponent(request.params.query));
            Wrapper.Count(response, number, ResourceModel, query, (response: any, count: any): any => {
                Wrapper.SendSuccess(response, count);
            });
        }

        /**
         * @param userid
         * @param name
         * @param records
         * @param callback
         * @returns none
         */
        public render(userid: string, name: string, records: any, callback: (error: any, result: any) => void): void {
            ResourceModel.findOne({$and: [{name: name}, {userid: userid}]}).then((doc: any): void => {
                if (doc) {
                    let content = doc.content;
                    if (records) {
                        switch (content.type) {
                            case "text/html":
                                HtmlEditModule.Render.ScanHtml(content.resource, records, (error: any, resource: any): void => {
                                    if (!error) {
                                        content.resource = resource;
                                        callback(null, content);
                                    } else {
                                        callback(error, null);
                                    }
                                });
                                break;
                            case "text/css":
                            case "text/javascript":
                                callback(null, content);
                                break;
                            default:
                                callback(null, content);
                                break;
                        }
                    } else {
                        callback(null, content);
                    }
                } else {
                    callback({code: 10000, message: ""}, null);
                }
            }).catch((error: any): void => {
                callback(error, null);
            });
        }


    }
}

module.exports = ResourcesModule;