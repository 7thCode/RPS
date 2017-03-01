/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace ExceptionModule {

    const share = require(process.cwd() + '/server/systems/common/share');
    const config = share.config;
    const Wrapper = share.Wrapper;
    const logger = share.logger;

    export class Exception {

        public exception(request: any, response: any, next: any): void {
            Wrapper.Exception(request, response, (request: any, response: any) => {
                next();
            });
        }

        public guard(request: any, response: any, next: any): void {
            Wrapper.Guard(request, response, (request: any, response: any) => {
                next();
            });
        }

        public authenticate(request: any, response: any, next: any): void {
            Wrapper.Authenticate(request, response, (request: any, response: any): void => {
                next();
            });
        }

        public page_catch(request: any, response: any, next: any): void {
            try {
                next();
            } catch (e) {
                response.status(500).render('error', {status: 500, message: "Internal Server Error...", url: request.url});
            }
        }

        public page_guard(request: any, response: any, next: any): void {
            try {
                if (request.user) {
                    if (request.isAuthenticated()) {
                        next();
                    } else {
                        response.status(403).render('error', {status: 403, message: "Forbidden...", url: request.url});
                    }
                } else {
                    response.status(403).render('error', {status: 403, message: "Forbidden...", url: request.url});
                }
            } catch (e) {
                response.status(500).render('error', {status: 500, message: "Internal Server Error...", url: request.url});
            }
        }
    }
}

module.exports = ExceptionModule;
