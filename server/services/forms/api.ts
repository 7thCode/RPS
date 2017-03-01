/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace FormApiRouter {

    const express = require('express');
    export const router = express.Router();

    const core = require(process.cwd() + '/core');
    const share: any = core.share;
    const exception: any = core.exception;

    const FormsModule = require(share.Server("services/forms/controllers/forms_controller"));
    const form = new FormsModule.Form;

    router.post("/api/create", [exception.exception, exception.guard, exception.authenticate, form.create_form]);
    router.get("/api/query/:query/:option", [form.get_form_query]);
    router.get('/api/count/:query', [form.get_form_count]);

    router.get("/api/:id([0-9a-fA-F]{24})", [form.get_form]);
    router.put("/api/:id([0-9a-fA-F]{24})", [exception.exception, exception.guard, exception.authenticate, form.put_form]);
    router.delete("/api/:id([0-9a-fA-F]{24})", [exception.exception, exception.guard, exception.authenticate, form.delete_form]);

    router.delete('/api/own', [exception.exception, exception.guard, exception.authenticate, form.delete_own]);
}

module.exports = FormApiRouter.router;

