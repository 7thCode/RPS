/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace LayoutsApiRouter {

    const express = require('express');
    export const router: any = express.Router();

    const core = require(process.cwd() + '/core');
    const share: any = core.share;
    const exception: any = core.exception;

    const LayoutsModule: any = require(share.Server("services/layouts/controllers/layouts_controller"));
    const layout: any = new LayoutsModule.Layout();

    // for template
    router.post("/template/create", [exception.exception, exception.guard, exception.authenticate, layout.create_template]);
    router.get("/template/query/:query/:option", [layout.get_template_query]);
    router.get("/template/count/:query", [layout.get_template_count]);
    router.post("/template/svg", [layout.layout_svg]);
    router.post("/template/pdf", [layout.layout_pdf]);

    router.get("/template/:id([0-9a-fA-F]{24})", [layout.get_template]);
    router.put("/template/:id([0-9a-fA-F]{24})", [exception.exception, exception.guard, exception.authenticate, layout.put_template]);
    router.delete("/template/:id([0-9a-fA-F]{24})", [exception.exception, exception.guard, exception.authenticate, layout.delete_template]);

    router.get("/template/svg/:name", [layout.get_template_svg]);

    // for layout
    router.post("/layout/create", [exception.exception, exception.guard, exception.authenticate, layout.create_layout]);
    router.get("/layout/query/:query/:option", [layout.get_layout_query]);
    router.get("/layout/count/:query", [layout.get_layout_count]);
    router.post("/layout/svg", [layout.layout_svg]);
    router.post("/layout/pdf", [layout.layout_pdf]);

    router.get("/layout/:id([0-9a-fA-F]{24})", [layout.get_layout]);
    router.put("/layout/:id([0-9a-fA-F]{24})", [exception.exception, exception.guard, exception.authenticate, layout.put_layout]);
    router.delete("/layout/:id([0-9a-fA-F]{24})", [exception.exception, exception.guard, exception.authenticate, layout.delete_layout]);

    router.get("/layout/svg/:name", [layout.get_layout_svg]);

    router.get("/download/pdf", [layout.download_pdf]);
    router.get("/download/svg", [layout.download_svg]);

    router.delete('/api/own', [exception.exception, exception.guard, exception.authenticate, layout.delete_own]);

}

module.exports = LayoutsApiRouter.router;


