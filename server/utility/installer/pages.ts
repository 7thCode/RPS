/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace InstallerPageRouter {

    const express = require('express');
    export const router = express.Router();

    const share = require(process.cwd() + '/server/systems/common/share');

    const services_config = share.services_config;
    const webfonts:any[] = services_config.webfonts;

    router.get("/", [(request: any, response: any): void => {
        response.render("utility/installer/index", {user: null, message: "Installer", status: 200, fonts:webfonts});
    }]);
}

module.exports = InstallerPageRouter.router;