/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace ProfileApiRouter {

    const express = require('express');
    export const router = express.Router();

    const core = require(process.cwd() + '/core');
    const share: any = core.share;
    const exception: any = core.exception;

    const ProfileModule: any = require(share.Server("services/profile/controllers/profile_controller"));
    const profile: any = new ProfileModule.Profile;

    router.get("/api", [exception.exception, exception.guard, exception.authenticate, profile.get_profile]);
    router.put("/api", [exception.exception, exception.guard, exception.authenticate, profile.put_profile]);

}

module.exports = ProfileApiRouter.router;

