/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace BeaconApiRouter {

    const express = require('express');
    export const router = express.Router();

    const core = require(process.cwd() + '/core');
    const share: any = core.share;
    const exception: any = core.exception;

    const BeaconModule: any = require(share.Server("plugins/beacon/controllers/beacon_controller"));
    const beacon: any = new BeaconModule.Beacon;

    router.get("/api/:token", [exception.exception, beacon.get_beacon]);
}

module.exports = BeaconApiRouter.router;

