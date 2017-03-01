/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace PageRouter {

    const express = require('express');
    export const router = express.Router();

    const _: _.LoDashStatic = require('lodash');

    const core = require(process.cwd() + '/core');
    const share: any = core.share;
    const config: any = share.config;
    const auth: any = core.auth;
    const exception: any = core.exception;
    const analysis: any = core.analysis;

    const services_config = share.services_config;
    const webfonts: any[] = services_config.webfonts;

    const dialog_message = {long: "too long", short: "Too Short", required: "Required"};

    const LocalAccount: any = require(share.Models("systems/accounts/account"));
    const FormModel: any = require(share.Models("services/forms/form"));
    const ArticleModel: any = require(share.Models("services/articles/article"));

    router.get("/", [analysis.page_view, (request: any, response: any): void => {
        response.render("services/front/index", {user: request.user, message: "Welcome", status: 200, fonts: webfonts});
    }]);

    router.get("/sitemap.xml", [(request: any, response: any): void => {

        LocalAccount.find({}).then((accounts: any): void => {

            FormModel.find({}).then((pages: any): void => {

                ArticleModel.find({}).then((docs: any): void => {
/*
                    let result = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">';
                    _.forEach(docs, (doc) => {
                        let a = doc.content;

                        let name = doc.name;

                        let url ="http://" + config.domain + "/render/000000000000000000000000/a/" + name;
                        let priority = "1.0";

                        result += '<url><loc>' + url + '</loc><priority>' + priority + '</priority></url>';
                    });

                    result += '</urlset>';
                    response.send(result);
*/
                }).catch((error: any): void => {
                });
            }).catch((error: any): void => {
            });
        }).catch((error: any): void => {
        });

    }]);

    router.get("/robots.txt", [(request: any, response: any): void => {
        let robots = "User-agent: *\n\nSitemap: http://" + config.domain + "/sitemap.xml";
        response.set('Content-Type', 'text/plain');
        response.send(robots);
    }]);

    //router.get("/test", [analysis.page_view, (request: any, response: any): void => {
    //    response.render("test", {user: request.user, message: "Welcome", status: 200});
    //}]);

}

module.exports = PageRouter.router;