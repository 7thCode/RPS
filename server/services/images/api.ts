/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace ImageApiRouter {

    const express = require('express');
    export const router = express.Router();

    const core = require(process.cwd() + '/core');
    const share: any = core.share;

    const FileModule: any = require(share.Server("systems/files/controllers/file_controller"));
    const file: any = new FileModule.Files();

    router.get('/api/:userid([0-9a-fA-F]{24})/:name', file.get_file_name);
    router.get('/api/:userid([0-9]{17})/:name', file.get_file_name);  //facebook

}

module.exports = ImageApiRouter.router;

