/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace SessionModule {

    const _ = require('lodash');

    const share = require(process.cwd() + '/server/systems/common/share');
    const Wrapper = share.Wrapper;

    export class Session {

        /**
         * @param request
         * @param response
         * @returns none
         */
        public get(request: any, response: any): void {
            let user = request.session.req.user;
            if (user) {
                let result = {
                    create:user.create,
                    modify:user.modify,
                    provider:user.provider,
                    type:user.type,
                    userid:user.userid,
                    username:user.username,
                    enabled:user.enabled,
                    local:user.local,
                    data:user.data
                };
                Wrapper.SendSuccess(response, result);
            } else {
                Wrapper.SendError(response, 2, "not found", {});
            }
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public put(request: any, response: any): void {
            let user = request.session.req.user;
            if (user) {
                if (!user.data) {
                    user.data = {}
                }
                user.data =_.merge(user.data,request.body.data);
                request.session.save();
                Wrapper.SendSuccess(response, user.data);
            } else {
                Wrapper.SendError(response, 2, "not found", {});
            }
        }
    }
}

module.exports = SessionModule;
