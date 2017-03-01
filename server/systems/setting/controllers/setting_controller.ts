/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace SettingModule {

    //const fs: any = require('graceful-fs');
    //const _ = require('lodash');

    const share = require(process.cwd() + '/server/systems/common/share');
    const logger = share.logger;
    const Persistent = share.Persistent;
    const Wrapper = share.Wrapper;
    const file_utility = share.Utility;

    export class Setting {

        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        public read_application(request: any, response: any): void {
            let self: any = request.user;
            Wrapper.If(response, 1000, (self.type == "System"), (response: any): void => {
                let string = file_utility.readfileSync(share.Config("applications/config.json"));
                let setting: any = JSON.parse(string);
                Wrapper.SendSuccess(response, setting);
            });
        }

        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        public write_application(request: any, response: any): void {
            let self: any = request.user;
            Wrapper.If(response, 1000, (self.type == "System"), (response: any): void => {
                let data: string = JSON.stringify(request.body.setting, null, 1);
                if (file_utility.writefileSync(share.Config("applications/config.json"), data)) {
                    Wrapper.SendSuccess(response, request.body.setting);
                }
            });
        }

        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        public read_system(request: any, response: any): void {
            let self: any = request.user;
            Wrapper.If(response, 1000, (self.type == "System"), (response: any): void => {
                let string = file_utility.readfileSync(share.Config("systems/config.json"));
                let setting: any = JSON.parse(string);
                Wrapper.SendSuccess(response, setting);
            });
        }

        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        public write_system(request: any, response: any): void {
            let self: any = request.user;
            Wrapper.If(response, 1000, (self.type == "System"), (response: any): void => {
                let data: string = JSON.stringify(request.body.setting, null, 1);
                if (file_utility.writefileSync(share.Config("systems/config.json"), data)) {
                    Wrapper.SendSuccess(response, request.body.setting);
                }
            });
        }


    }
}

module.exports = SettingModule;
