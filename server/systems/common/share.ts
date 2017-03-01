/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace ShareModule {

    const fs = require('graceful-fs');
    export const config = JSON.parse(fs.readFileSync('./config/systems/config.json', 'utf-8'));
    export const services_config = JSON.parse(fs.readFileSync('./config/services/config.json', 'utf-8'));
    export const plugins_config = JSON.parse(fs.readFileSync('./config/plugins/config.json', 'utf-8'));
    export const applications_config = JSON.parse(fs.readFileSync('./config/applications/config.json', 'utf-8'));

    const _ = require("lodash");

    const log4js = require('log4js');
    log4js.configure("./config/systems/logs.json");

    export const logger = log4js.getLogger('request');
    logger.setLevel(config.loglevel);

    const Promised: any = require("./wrapper");
    export const Wrapper = new Promised.Wrapper();

    const CipherModule: any = require('./cipher');
    export const Cipher = CipherModule.Cipher;

    const path: any = require('path');

    const root_path = process.cwd();

    export const Root = (relpath: string): string => {
        return path.join(root_path, relpath);
    };

    export const Config = (relpath: string): string => {
        return path.join(root_path, "config/" + relpath);
    };

    export const Models = (relpath: string): string => {
        return path.join(root_path, "models/" + relpath);
    };

    export const Persistent = (relpath: string): string => {
        return path.join(root_path, "persistent/" + relpath);
    };

    export const Public = (relpath: string): string => {
        return path.join(root_path, "public/" + relpath);
    };

    export const Server = (relpath: string): string => {
        return path.join(root_path, "server/" + relpath);
    };

    export const Views = (relpath: string): string => {
        return path.join(root_path, "views/" + relpath);
    };

    const PersistentModel: any = require("./persistent");
    export const Map = new PersistentModel.Map(Persistent("systems/storege.json"));

    const FileUtility: any = require("./file_utility");
    export const Utility = new FileUtility.Utility(Public(""));

    export let Memory = [];

    export class Share {

    }
}

module.exports = ShareModule;
