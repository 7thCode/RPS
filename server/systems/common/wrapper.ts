/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

/// <reference path="./cipher.ts" />
/// <reference path="./result.ts" />

"use strict";

export namespace Promised {

    const fs = require('graceful-fs');
    const _ = require("lodash");
    const result: any = require("./result");
    const config = JSON.parse(fs.readFileSync("./config/systems/config.json", 'utf-8'));
    const log4js = require('log4js');
    log4js.configure("./config/systems/logs.json");
    const logger = log4js.getLogger('request');
    logger.setLevel(config.loglevel);

    export class Wrapper {

        public BasicHeader(response: any, session: any): any {
            response.header("Access-Control-Allow-Origin", "*");
            response.header("Pragma", "no-cache");
            response.header("Cache-Control", "no-cache");
            response.contentType("application/json");
            return response;
        }

        public Exception(req: any, res: any, callback: (req: any, res: any) => void): void {
            try {
                callback(req, res);
            } catch (e) {
                this.SendFatal(res, 100000, e.message, e);
            }
        }

        public Guard(req: any, res: any, callback: (req: any, res: any) => void): void {
            if (req.headers["x-requested-with"] === "XMLHttpRequest") {
                res = this.BasicHeader(res, "");
                callback(req, res);
            } else {
                this.SendError(res, 1, "", {});
            }
        }

        public Authenticate(req: any, res: any, callback: (req: any, res: any) => void): void {
            if (req.user) {
                if (req.isAuthenticated()) {
                    callback(req, res);
                } else {
                    this.SendError(res, 1, "", {});
                }
            } else {
                this.SendError(res, 1, "", {});
            }
        }

        public FindById(res: any, code: number, model: any, id: any, callback: (res: any, object: any) => void): void {
            model.findById(id).then((object: any): void => {
                callback(res, object);
            }).catch((error: any): void => {
                this.SendError(res, code + 100, "", error);
            });
        }

        public FindOne(res: any, code: number, model: any, query: any, callback: (res: any, object: any) => void): void {
            model.findOne(query).then((doc: any): void => {
                callback(res, doc);
            }).catch((error: any): void => {
                this.SendError(res, code + 100, "", error);
            });
        }

        public Find(res: any, code: number, model: any, query: any, fields: any, option: any, callback: (res: any, object: any) => void): void {
            model.find(query, fields, option).then((docs: any): void => {
                callback(res, docs);
            }).catch((error: any): void => {
                this.SendError(res, code + 100, "", error);
            });
        }

        public Count(response: any, code: number, model: any, query: any, callback: (response: any, object: any) => void): void {
            model.count(query).then((count) => {
                callback(response, count);
            }).catch((error) => {
                this.SendError(response, code + 100, "", error);
            });
        }

        public FindAndModify(res: any, code: number, model: any, query: any, sort: any, update: any, options: any, callback: (res: any, object: any) => void): void {
            model.findAndModify(query, sort, update, options).then((docs: any): void => {
                callback(res, docs);
            }).catch((error: any): void => {
                this.SendError(res, code + 100, "", error);
            });
        }

        public Save(res: any, code: number, instance: any, callback: (res: any, object: any) => void): void {
            instance.save().then(() => {
                callback(res, instance);
            }).catch((error: any): void => {
                this.SendError(res, code + 100, "", error);
            });
        }

        public Update(res: any, code: number, model: any, query: any, update: any, callback: (res: any) => void): void {
            model.findOneAndUpdate(query, update, {upsert: false}).then(() => {
                callback(res);
            }).catch((error: any): void => {
                this.SendError(res, code + 100, "", error);
            });
        }

        public Upsert(res: any, code: number, model: any, query: any, update: any, callback: (res: any) => void): void {
            model.update(query, update, {upsert: true, multi: false}).then(() => {
                callback(res);
            }).catch((error: any): void => {
                this.SendError(res, code + 100, "", error);
            });
        }

        public Remove(res: any, code: number, instance: any, callback: (res: any) => void): void {
            instance.remove().then(() => {
                callback(res);
            }).catch((error: any): void => {
                this.SendError(res, code + 100, "", error);
            });
        }

        public Delete(res: any, code: number, model: any,query:any, callback: (res: any) => void): void {
            model.remove(query).then(() => {
                callback(res);
            }).catch((error: any): void => {
                this.SendError(res, code + 100, "", error);
            });
        }

        public If(res: any, code: number, condition: boolean, callback: (res: any) => void): void {
            if (condition) {
                callback(res);
            } else {
                this.SendWarn(res, code + 100, "", {});
            }
        }

        public SendWarn(response: any, code: number, message: any, object: any): void {
            logger.warn(message + " " + code);
            if (response) {
                response.json(new result(code, message, object));
            }
        }

        public SendError(response: any, code: number, message: any, object: any): void {
            logger.error(message + " " + code);
            if (response) {
                response.json(new result(code, message, object));
            }
        }

        public SendForbidden(response: any): void {
            logger.error("Forbidden");
            if (response) {
                response.status(403).render("error", {message: "Forbidden...", status: 403});
            }
        }

        public SendNotFound(response: any): void {
            logger.error("notfound");
            if (response) {
                response.status(404).render("error", {message: "not found", status: 404});
            }
        }

        public SendFatal(response: any, code: number, message: any, object: any): void {
            logger.fatal(message + " " + code);
            if (response) {
                response.status(500).render("error", {message: message, status: 500});
            }
        }

        public SendSuccess(response: any, object: any): void {
            if (response) {
                response.json(new result(0, "", object));
            }
        }

        //    public SendSuccessList(response: any, code: number, object: any): void {
        //        if (response) {
        //           response.json(new result(code, "", object));
        //        }
        //    }
    }
}

module.exports = Promised;
