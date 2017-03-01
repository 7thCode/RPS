/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace AnalysisApiRouter {

    const express = require('express');
    export const router = express.Router();

    const share = require(process.cwd() + '/server/systems/common/share');

    const AnalysisModule: any = require(share.Server("systems/analysis/controllers/analysis_controller"));
    const analysis: any = new AnalysisModule.Analysis;

    const AuthController: any = require(share.Server("systems/auth/controllers/auth_controller"));
    const auth: any = new AuthController.Auth;

    const ExceptionController: any = require(share.Server("systems/common/controllers/exception_controller"));
    const exception: any = new ExceptionController.Exception;

    router.get('/api/:id([0-9a-fA-F]{24})', [exception.exception, exception.guard, exception.authenticate, auth.is_system, analysis.get_queue]);
    router.get('/api/query/:query/:option', [exception.exception, exception.guard, exception.authenticate, auth.is_system, analysis.get_queue_query]);
    router.get('/api/count/:query', [exception.exception, exception.guard, exception.authenticate, auth.is_system, analysis.get_queue_count]);


}

module.exports = AnalysisApiRouter.router;

