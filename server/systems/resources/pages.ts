/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace ResourcePageRouter {

    const express = require('express');
    export let router = express.Router();

    const core = require(process.cwd() + '/core');
    const share: any = core.share;
    const exception: any = core.exception;

    const services_config = share.services_config;
    const webfonts: any[] = services_config.webfonts;

    const AuthController: any = require(share.Server("systems/auth/controllers/auth_controller"));
    export const auth: any = new AuthController.Auth();

    const AnalysisModule: any = require(share.Server("systems/analysis/controllers/analysis_controller"));
    const analysis: any = new AnalysisModule.Analysis;

    const ResourcesModule = require(share.Server("systems/resources/controllers/resource_controller"));
    const resource = new ResourcesModule.Resource;

    const dialog_message = {long: "too long", short: "Too Short", required: "Required"};

    router.get("/", [exception.page_guard, auth.page_valid, (request: any, response: any): void => {
        response.render("systems/resources/player/index", {
            user: request.user,
            message: "Pages",
            status: 200,
            fonts: webfonts
        });
    }]);

    router.get("/builder", [exception.page_guard, auth.page_valid, (request: any, response: any): void => {
        response.render("systems/resources/builder/index", {
            domain: share.config.domain,
            user: request.user,
            message: "Pages",
            status: 200,
            fonts: webfonts
        });
    }]);


    router.get('/dialogs/create_dialog', [exception.page_guard, auth.page_valid, (req: any, result: any, next: any) => {
        result.render('systems/resources/builder/dialogs/create_dialog', {messages: dialog_message});
    }]);

    router.get('/dialogs/open_dialog', [exception.page_guard, auth.page_valid, (req: any, result: any, next: any) => {
        result.render('systems/resources/builder/dialogs/open_dialog', {messages: dialog_message});
    }]);

    router.get('/dialogs/delete_confirm_dialog', [exception.page_guard, auth.page_valid, (req: any, result: any, next: any) => {
        result.render('systems/resources/builder/dialogs/delete_confirm_dialog', {messages: dialog_message});
    }]);

    //http://localhost:8000/resources/render/000000000000000000000000/words_index
    router.get("/render/:userid/:name", [exception.page_catch,analysis.page_view,  (request: any, response: any): void => {
        resource.render(request.params.userid, request.params.name, {}, (error: any, result: any): void => {
            if (!error) {
                response.writeHead(200, {'Content-Type': result.type});
                response.write(result.resource);
                response.end();
            } else {
                switch (error.code) {
                    case 10000:
                        response.status(404).render('error', {status: 404, message: "not found...", url: request.url});
                        break;
                    default:
                        response.status(500).render('error', {status: 500, message: error.message, url: request.url});
                }
            }
        });
    }]);



}

module.exports = ResourcePageRouter.router;