/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace AuthPageRouter {

    const express = require('express');
    export const router = express.Router();

    const share = require('../common/share');
    const config = share.config;

    const services_config = share.services_config;
    const applications_config = share.applications_config;

    const webfonts: any[] = services_config.webfonts;
    const message:any = applications_config.messages.auth_dialogs;

    const AuthController: any = require(share.Server("systems/auth/controllers/auth_controller"));
    const auth: any = new AuthController.Auth;

    const ExceptionController: any = require(share.Server("systems/common/controllers/exception_controller"));
    const exception: any = new ExceptionController.Exception;

    router.get('/dialogs/registerdialog', [exception.page_catch, (request: any, response: any): void => {
        response.render('systems/auth/dialogs/registerdialog', {messages: message.regist_dialog});
    }]);

    router.get("/dialogs/registerconfirmdialog", [exception.page_catch, (request: any, response: any): void => {
        response.render("systems/auth/dialogs/registerconfirmdialog", {messages: message.regist_confirm_dialog});
    }]);

    router.get('/dialogs/memberdialog', [exception.page_guard, (request: any, response: any): void => {
        response.render('systems/auth/dialogs/memberdialog', {messages: message.member_dialog});
    }]);

    router.get("/dialogs/memberconfirmdialog", [exception.page_guard, (request: any, response: any): void => {
        response.render("systems/auth/dialogs/memberconfirmdialog", {messages: message.member_confirm_dialog});
    }]);

    router.get("/dialogs/logindialog", [exception.page_catch, (request: any, response: any): void => {
        response.render("systems/auth/dialogs/logindialog", {
            config: applications_config, messages: message.login_dialog
        });
    }]);

    router.get("/dialogs/passworddialog", [exception.page_catch, (request: any, response: any): void => {
        response.render("systems/auth/dialogs/passworddialog", {user: request.user, messages: message.password_dialog});
    }]);

    router.get("/dialogs/passwordconfirmdialog", [exception.page_catch, (request: any, response: any): void => {
        response.render("systems/auth/dialogs/passwordconfirmdialog", {messages: message.password_confirm_dialog});
    }]);

}

module.exports = AuthPageRouter.router;