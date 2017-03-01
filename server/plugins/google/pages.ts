/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace GooglePageRouter {

    const express = require('express');
    export const router = express.Router();

    const core = require(process.cwd() + '/core');
    const auth: any = core.auth;
    const share: any = core.share;
    const exception: any = core.exception;

    const plugins_config = share.plugins_config;

    const GoogleModule: any = require(share.Server("plugins/google/controllers/google_controller"));
    const google: any = new GoogleModule.Google(plugins_config.google_api.calendar);

    //step1
    router.get('/auth', (request: any, response: any): void => {
        let user: any = request.session.req.user;
        if (user) {
            if (user.tokens) {
                let tokens = user.tokens.google_calendar_token;
                google.authorize(tokens, (client: any, tokens: any): void => {
                    if (client) {
                        google.analytics(client, (error: any, result: string): void => {
                            if (!error) {
                                response.send(result);
                            } else {
                                response.status(500).render('error', {status: 500, message: error.message, url: request.url});
                            }
                        });
                    } else {
                        response.status(403).render('error', {status: 403, message: "Forbidden...", url: request.url});
                    }
                });
            } else {
                let url: string = google.authorize_url(['https://www.googleapis.com/auth/calendar.readonly', 'https://www.googleapis.com/auth/calendar', "https://www.googleapis.com/auth/analytics.readonly"]);
                response.redirect(url);
            }
        } else {
            response.status(403).render('error', {status: 403, message: "Forbidden...", url: request.url});
        }
    });

    //step2
    router.get('/callback', (request: any, response: any): void => {
        let code = request.query.code;
        google.authorize_callback(code, (client: any, tokens: any): void => {
            if (client) {
                let user = request.session.req.user;
                if (user) {
                    user.tokens = {google_calendar_token: tokens};
                    request.session.save();
                    google.analytics(client, (error: any, result: string): void => {
                        if (!error) {
                            response.send(JSON.stringify(result));
                        } else {
                            response.status(500).render('error', {status: 500, message: error.message, url: request.url});
                        }
                    });
                } else {
                    response.status(403).render('error', {status: 403, message: "Forbidden...", url: request.url});
                }
            } else {
                response.status(403).render('error', {status: 403, message: "Forbidden...", url: request.url});
            }
        });
    });

}

module.exports = GooglePageRouter.router;