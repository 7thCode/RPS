/**!
 Copyright (c) 2016 Naoma Matsumoto.
 */

"use strict";

export namespace RewritingPageRouter {

    const express = require('express');
    export const router = express.Router();

    const share = require(process.cwd() + '/server/systems/common/share');

    const services_config = share.services_config;
    const webfonts:any[] = services_config.webfonts;

    const AuthController: any = require(share.Server("systems/auth/controllers/auth_controller"));
    const auth: any = new AuthController.Auth();

    const ExceptionController: any = require(share.Server("systems/common/controllers/exception_controller"));
    const exception: any = new ExceptionController.Exception();

    router.get("/", [exception.page_guard, auth.page_valid, auth.page_is_system, (request: any, response: any): void => {
        response.render("systems/rewriting/index", {user: request.user, message: "Back", status: 200, fonts:webfonts});
    }]);
}

module.exports = RewritingPageRouter.router;