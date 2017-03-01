/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace AccountPageRouter {

    const express = require('express');
    export const router = express.Router();
    const share = require(process.cwd() + '/server/systems/common/share');
    const AuthController: any = require(share.Server("systems/auth/controllers/auth_controller"));
    const auth: any = new AuthController.Auth;
    const ExceptionController: any = require(share.Server("systems/common/controllers/exception_controller"));
    const exception: any = new ExceptionController.Exception;

    const services_config = share.services_config;
    const webfonts:any[] = services_config.webfonts;

    const dialog_message = {long: "too long", short: "Too Short", required: "Required"};

    router.get("/", [exception.page_guard, auth.page_valid, auth.page_is_system, (request: any, response: any): void => {
        response.render("systems/accounts/index", {user: request.user, message: "Accounts", status: 200, fonts:webfonts});
    }]);

    router.get('/dialogs/open_dialog', [exception.page_guard, auth.page_valid, (request: any, response: any, next: any) => {
        response.render("systems/accounts/dialogs/open_dialog", {messages: dialog_message});
    }]);

}

module.exports = AccountPageRouter.router;