/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace FormPageRouter {

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

    const FormsModule = require(share.Server("services/forms/controllers/forms_controller"));
    const form = new FormsModule.Form;

    const dialog_message = {long: "too long", short: "Too Short", required: "Required"};

    router.get("/", [exception.page_guard, auth.page_valid, (request: any, response: any): void => {
        response.render("services/forms/player/index", {
            user: request.user,
            message: "Pages",
            status: 200,
            fonts: webfonts
        });
    }]);

    router.get("/builder", [exception.page_guard, auth.page_valid, (request: any, response: any): void => {
        response.render("services/forms/builder/index", {
            domain: share.config.domain,
            user: request.user,
            message: "Pages",
            status: 200,
            fonts: webfonts
        });
    }]);

    router.get('/dialogs/add_style_dialog', [exception.page_guard, auth.page_valid, (req: any, result: any, next: any) => {
        result.render('services/forms/builder/dialogs/add_style_dialog', {messages: dialog_message});
    }]);

    router.get('/dialogs/add_attribute_dialog', [exception.page_guard, auth.page_valid, (req: any, result: any, next: any) => {
        result.render('services/forms/builder/dialogs/add_attribute_dialog', {messages: dialog_message});
    }]);

    router.get('/dialogs/elements/add_tag_dialog', [exception.page_guard, auth.page_valid, (req: any, result: any, next: any) => {
        result.render('services/forms/builder/dialogs/elements/add_tag_dialog', {messages: dialog_message});
    }]);

    router.get('/dialogs/elements/add_div_dialog', [exception.page_guard, auth.page_valid, (req: any, result: any, next: any) => {
        result.render('services/forms/builder/dialogs/elements/add_div_dialog', {messages: dialog_message});
    }]);

    router.get('/dialogs/elements/add_field_dialog', [exception.page_guard, auth.page_valid, (req: any, result: any, next: any) => {
        result.render('services/forms/builder/dialogs/elements/add_field_dialog', {messages: dialog_message});
    }]);

    router.get('/dialogs/elements/add_textarea_dialog', [exception.page_guard, auth.page_valid, (req: any, result: any, next: any) => {
        result.render('services/forms/builder/dialogs/elements/add_textarea_dialog', {messages: dialog_message});
    }]);

    router.get('/dialogs/elements/add_number_dialog', [exception.page_guard, auth.page_valid, (req: any, result: any, next: any) => {
        result.render('services/forms/builder/dialogs/elements/add_number_dialog', {messages: dialog_message});
    }]);

    router.get('/dialogs/elements/add_img_dialog', [exception.page_guard, auth.page_valid, (req: any, result: any, next: any) => {
        result.render('services/forms/builder/dialogs/elements/add_img_dialog', {messages: dialog_message});
    }]);

    router.get('/dialogs/elements/add_select_dialog', [exception.page_guard, auth.page_valid, (req: any, result: any, next: any) => {
        result.render('services/forms/builder/dialogs/elements/add_select_dialog', {messages: dialog_message});
    }]);

    router.get('/dialogs/elements/add_chips_dialog', [exception.page_guard, auth.page_valid, (req: any, result: any, next: any) => {
        result.render('services/forms/builder/dialogs/elements/add_chips_dialog', {messages: dialog_message});
    }]);

    router.get('/dialogs/create_dialog', [exception.page_guard, auth.page_valid, (req: any, result: any, next: any) => {
        result.render('services/forms/builder/dialogs/create_dialog', {messages: dialog_message});
    }]);

    router.get('/dialogs/open_dialog', [exception.page_guard, auth.page_valid, (req: any, result: any, next: any) => {
        result.render('services/forms/builder/dialogs/open_dialog', {messages: dialog_message});
    }]);

    router.get('/dialogs/delete_confirm_dialog', [exception.page_guard, auth.page_valid, (req: any, result: any, next: any) => {
        result.render('services/forms/builder/dialogs/delete_confirm_dialog', {messages: dialog_message});
    }]);

    // localhost:8000/forms/render/000000000000000000000000/test1
    router.get("/render/:userid/:name", [exception.page_catch,analysis.page_view, (request: any, response: any): void => {
        form.render(request.params.userid, request.params.name, {}, (error: any, result: string): void => {
            if (!error) {
                response.render("services/forms/render", {html: result, fonts: webfonts});
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

module.exports = FormPageRouter.router;