/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace AccountModule {

    const _ = require('lodash');

    const mongoose: any = require('mongoose');
    mongoose.Promise = require('q').Promise;

    const share = require(process.cwd() + '/server/systems/common/share');
    const config = share.config;
    const Wrapper = share.Wrapper;
    const logger = share.logger;

    const LocalAccount: any = require(share.Models("systems/accounts/account"));

    export class Accounts {

        static userid(request: any): string {
            return request.user.userid;
        }

        /**
         * アカウント検索
         * @param request
         * @param response
         * @returns none
         */
        public get_account_query_query(request: any, response: any): void {
            let self: any = request.user;
            Wrapper.If(response, 5000, (self.type == "System"), (response: any): void => {
                let query: any = JSON.parse(decodeURIComponent(request.params.query));
                let option: any = JSON.parse(decodeURIComponent(request.params.option));
                Wrapper.Find(response, 5000, LocalAccount, query, {}, option, (response: any, accounts: any): any => {
                    Wrapper.SendSuccess(response, accounts);
                });
            });
        }

        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        public get_account_count(request: any, response: any): void {
            let query: any = JSON.parse(decodeURIComponent(request.params.query));
            Wrapper.Count(response, 2800, LocalAccount, query, (response: any, count: any): any => {
                Wrapper.SendSuccess(response, count);
            });
        }

        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        public delete_own(request: any, response: any): void {
            let userid = Accounts.userid(request);
            Wrapper.FindOne(response, 5100, LocalAccount, {userid: userid}, (response: any, page: any): void => {
                if (page) {
                    Wrapper.Remove(response, 5100, page, (response: any): void => {
                        Wrapper.SendSuccess(response, {});
                    });
                } else {
                    Wrapper.SendWarn(response, 2, "not found", {});
                }
            });
        }

    }
}

module.exports = AccountModule;
