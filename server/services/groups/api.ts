/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace GroupApiRouter {

    const express = require('express');
    export const router = express.Router();

    const core = require(process.cwd() + '/core');
    const share: any = core.share;
    const exception: any = core.exception;

    const GroupModule: any = require(share.Server("services/groups/controllers/group_controller"));
    const group: any = new GroupModule.Group;

    router.post("/api/own", [exception.exception, exception.guard, exception.authenticate, group.own_group]);
    router.post("/api/create", [exception.exception, exception.guard, exception.authenticate, group.create_group]);
    router.get("/api/:id([0-9a-fA-F]{24})", [group.get_group]);
    router.put("/api/:id([0-9a-fA-F]{24})", [exception.exception, exception.guard, exception.authenticate, group.put_group]);
    router.delete("/api/:id([0-9a-fA-F]{24})", [exception.exception, exception.guard, exception.authenticate, group.delete_group]);

    router.get('/api/query/:query/:option', [group.get_group_query_query]);
    router.get("/api/count/:query", [group.get_group_count]);

    router.delete('/api/own', [exception.exception, exception.guard, exception.authenticate, group.delete_own]);
}

module.exports = GroupApiRouter.router;

