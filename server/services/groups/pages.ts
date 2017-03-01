/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace GroupPageRouter {

    const express = require('express');
    export const router = express.Router();

    const core = require(process.cwd() + '/core');
    const auth: any = core.auth;
    const share: any = core.share;
    const exception: any = core.exception;

    const services_config = share.services_config;
    const webfonts:any[] = services_config.webfonts;

    const dialog_message = {long: "too long", short: "Too Short", required: "Required"};

    router.get("/", [exception.page_guard, auth.page_valid, auth.page_is_system, (request: any, response: any): void => {
        response.render("services/groups/index", {user: request.user, message: "Groups", status: 200, fonts:webfonts});
    }]);

    router.get('/dialogs/create_dialog', [exception.page_guard, auth.page_valid, (request: any, response: any, next: any) => {
        response.render("services/groups/dialogs/create_dialog", {messages: dialog_message});
    }]);

    router.get('/dialogs/open_dialog', [exception.page_guard, auth.page_valid, (request: any, response: any, next: any) => {
        response.render("services/groups/dialogs/open_dialog", {messages: dialog_message});
    }]);

    router.get('/dialogs/delete_confirm_dialog', [exception.page_guard, auth.page_valid, (request: any, response: any, next: any) => {
        response.render('services/groups/dialogs/delete_confirm_dialog', {messages: dialog_message});
    }]);
}

module.exports = GroupPageRouter.router;