/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace FormsModule {

    const fs = require('graceful-fs');
    const _ = require('lodash');

    //const mongoose = require('mongoose');

    const core = require(process.cwd() + '/core');
    const share: any = core.share;
    const config = share.config;
    const Wrapper = share.Wrapper;

   // const builder_userid = config.systems.userid;// template maker user id

    const HtmlEditModule: any = require(share.Server("systems/common/html_edit/html_edit"));

    const FormModel: any = require(share.Models("services/forms/form"));

    export class Form {

        static userid(request: any): string {
            return request.user.userid;
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public create_form(request: any, response: any): void {
            const number: number = 1000;
            let userid = Form.userid(request);
            let name = request.body.name;
            let type = request.body.type;
            Wrapper.FindOne(response, number, FormModel, {$and: [{name: name}, {type: type}, {userid: userid}]}, (response: any, exists: any): void => {
                if (!exists) {
                    let page: any = new FormModel();
                    page.userid = userid;
                    page.name = name;
                    page.type = type;
                    page.content = [];
                    page.open = true;
                    Wrapper.Save(response, number, page, (response: any, object: any): void => {
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
        public put_form(request: any, response: any): void {
            const number: number = 1100;
            let userid = Form.userid(request);
            let id = request.params.id;
            Wrapper.FindOne(response, number, FormModel, {$and: [{_id: id}, {userid: userid}]}, (response: any, page: any): void => {
                if (page) {
                    page.content = request.body.content;
                    page.open = true;
                    Wrapper.Save(response, number, page, (response: any, object: any): void => {
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
        public delete_form(request: any, response: any): void {
            const number: number = 1200;
            let userid = Form.userid(request);
            let id = request.params.id;
            Wrapper.FindOne(response, number, FormModel, {$and: [{_id: id}, {userid: userid}]}, (response: any, page: any): void => {
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
        public get_form(request: any, response: any): void {
            const number: number = 1300;
            let userid = Form.userid(request);
            let id = request.params.id;
            Wrapper.FindOne(response, number, FormModel, {$and: [{_id: id}, {userid: userid}]}, (response: any, page: any): void => {
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
            let userid = Form.userid(request);
            Wrapper.Delete(response, number, FormModel, {userid: userid}, (response: any): void => {
                Wrapper.SendSuccess(response, {});
            });
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public get_form_query(request: any, response: any): void {
            const number: number = 1400;
            let userid = Form.userid(request);
            let query: any = JSON.parse(decodeURIComponent(request.params.query));
            let option: any = JSON.parse(decodeURIComponent(request.params.option));
            Wrapper.Find(response, number, FormModel, {$and: [{userid: userid}, query]}, {}, option, (response: any, pages: any): any => {

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
        public get_form_count(request: any, response: any): void {
            const number: number = 2800;
            let userid = Form.userid(request);
            let query: any = JSON.parse(decodeURIComponent(request.params.query));
            Wrapper.Count(response, number, FormModel, query, (response: any, count: any): any => {
                Wrapper.SendSuccess(response, count);
            });
        }

        /**
         * @param userid
         * @param name
         * @param record
         * @param callback
         * @returns none
         */
        public render(userid: string, name: string, record:any, callback: (error: any, result: string) => void): void {
            FormModel.findOne({$and: [{name: name}, {userid: userid}]}).then((doc: any): void => {
                if (doc) {
                    HtmlEditModule.Render.docToHtml(doc, record, callback);
                } else {
                    callback({code: 10000,message:""}, null);
                }
            }).catch((error: any): void => {
                callback(error, null);
            });
        }

    }
}

module.exports = FormsModule;