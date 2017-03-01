/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace SessionApiRouter {

    const express = require('express');
    export const router = express.Router();

    const core = require(process.cwd() + '/core');
    const share: any = core.share;
    const exception: any = core.exception;

    const SessionModule: any = require(share.Server("systems/session/controllers/session_controller"));
    const session: any = new SessionModule.Session;

    router.get("/api", [exception.exception, exception.guard, exception.authenticate, session.get]);
    router.put("/api", [exception.exception, exception.guard, exception.authenticate, session.put]);


}

module.exports = SessionApiRouter.router;

