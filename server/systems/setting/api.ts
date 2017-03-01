/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace SettingApiRouter {

    const express = require('express');
    export const router = express.Router();

    const share = require(process.cwd() + '/server/systems/common/share');

    const SettingModule: any = require("./controllers/setting_controller");
    const setting: any = new SettingModule.Setting();

    const ExceptionController: any = require("../common/controllers/exception_controller");
    const exception: any = new ExceptionController.Exception();

    router.get('/setting/application', [exception.exception, exception.guard, exception.authenticate, setting.read_application]);
    router.put('/setting/application', [exception.exception, exception.guard, exception.authenticate, setting.write_application]);

    router.get('/setting/system', [exception.exception, exception.guard, exception.authenticate, setting.read_system]);
    router.put('/setting/system', [exception.exception, exception.guard, exception.authenticate, setting.write_system]);

}

module.exports = SettingApiRouter.router;

