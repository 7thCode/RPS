/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace InstallerModule {

    const fs: any = require('graceful-fs');

    export class Installer {

        public read(request: any, response: any): void {
            let result = "";
            let config_seed_file = fs.openSync(process.cwd() + "/config/systems/config.json", 'r');
            if (config_seed_file) {
                try {
                    result =  JSON.parse(fs.readFileSync(config_seed_file, 'utf8'));
                } catch (e) {
                } finally {
                    fs.closeSync(config_seed_file);
                    response.json({code : 0, message:"", value:result});
                }
            }
        }

        public write(request: any, response: any): void {
            let config_seed = request.body.setting;
            config_seed.installed = true;
            let config_seed_file = fs.openSync(process.cwd() + "/config/systems/config.json", 'w');
            if (config_seed_file) {
                try {
                    fs.writeFileSync(config_seed_file, JSON.stringify(config_seed, null, 1));
                } catch (e) {
                } finally {
                    fs.closeSync(config_seed_file);
                    response.json({code : 0, message:"", value:config_seed});
                }
            }
        }
    }
}

module.exports = InstallerModule;
