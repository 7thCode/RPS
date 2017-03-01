/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace AuthApiRouter {

    const express = require('express');
    export const router = express.Router();

    const passport: any = require("passport");

    const share = require('../common/share');

    const AuthController: any = require(share.Server("systems/auth/controllers/auth_controller"));
    const auth: any = new AuthController.Auth;

    const ExceptionController: any = require(share.Server("systems/common/controllers/exception_controller"));
    const exception: any = new ExceptionController.Exception();

    router.post("/local/register", [exception.exception, exception.guard, auth.post_local_register]);
    router.get("/register/:token", auth.get_register_token);

    router.post("/local/member", [exception.exception, exception.guard, exception.authenticate, auth.post_member_register]);
    router.get("/member/:token", auth.get_member_token);

    router.post("/local/username", [exception.exception, exception.guard, exception.authenticate, auth.post_local_username]);
    router.get("/username/:token", auth.get_username_token);

    router.post("/local/password", [exception.exception, exception.guard, auth.post_local_password]);
    router.get("/password/:token", auth.get_password_token);

    router.post("/local/login", [exception.exception, exception.guard, auth.post_local_login]);
    router.post("/logout", [exception.exception, exception.guard, exception.authenticate, auth.logout]);

    // facebook
    router.get("/facebook", passport.authenticate("facebook", {scope: ["email"], session: true}));
    router.get("/facebook/callback", passport.authenticate("facebook", {failureRedirect: "/"}), auth.auth_facebook_callback);

    // twitter
    router.get('/twitter', passport.authenticate('twitter'));
    router.get('/twitter/callback', passport.authenticate('twitter', {failureRedirect: '/'}), auth.auth_twitter_callback);

    // instagram
    router.get('/instagram', passport.authenticate("instagram"));
    router.get('/instagram/callback', passport.authenticate("instagram", {failureRedirect: '/'}), auth.auth_instagram_callback);

}

module.exports = AuthApiRouter.router;

