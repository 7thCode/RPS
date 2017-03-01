/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace GoogleApiRouter {

    const express: any = require("express");
    export const router = express.Router();

    const core = require(process.cwd() + "/core");
    const share: any = core.share;

}

module.exports = GoogleApiRouter.router;
