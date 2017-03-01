/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace BeaconModule {

    const _: _.LoDashStatic = require('lodash');

    const mongoose = require('mongoose');
    const Grid = require('gridfs-stream');

    const core = require(process.cwd() + '/core');
    const share: any = core.share;

    const config = share.config;
    const Cipher = share.Cipher;
    const Wrapper = share.Wrapper;
    const logger = share.logger;

    export class Beacon {

        constructor() {

        }

        static connect(user): any {
            let result = null;
            if (user) {
                result = mongoose.createConnection("mongodb://" + config.db.user + ":" + config.db.password + "@" + config.db.address + "/" + config.db.name);
            } else {
                result = mongoose.createConnection("mongodb://" + config.db.address + "/" + config.db.name);
            }
            return result;
        }


        /*

         let data = {
         time: now,
         address: request.connection.remoteAddress,
         user: "",
         headers: request.headers['user-agent'],
         referer: ""
         };

         */

        /**
         * @param request
         * @param response
         * @returns none
         */
        public get_beacon(request: any, response: any, next: any): void {
            try {

                let token: any = JSON.parse(Cipher.FixedDecrypt(request.params.token, config.tokensecret));

                let conn = Beacon.connect(config.db.user);

                conn.once('open', (error: any): void => {
                    if (!error) {
                        let gfs = Grid(conn.db, mongoose.mongo); //missing parameter
                        if (gfs) {
                            conn.db.collection('fs.files', (error: any, collection: any): void => {
                                if (!error) {
                                    if (collection) {
                                        collection.findOne({filename: "blank.png"}, (error: any, item: any): void => {
                                            if (!error) {
                                                if (item) {
                                                    let readstream = gfs.createReadStream({_id: item._id});
                                                    if (readstream) {
                                                        response.setHeader('Content-Type', item.metadata.type);
                                                        readstream.pipe(response);
                                                        readstream.on('close', (file: any): void => {
                                                            conn.db.close();
                                                        });
                                                    } else {
                                                        conn.db.close();
                                                        next();
                                                    }
                                                } else {
                                                    conn.db.close();
                                                    next();
                                                }
                                            } else {
                                                conn.db.close();
                                                next();
                                            }
                                        });
                                    } else {
                                        conn.db.close();
                                        next();
                                    }
                                } else {
                                    conn.db.close();
                                    next();
                                }
                            });
                        } else {
                            next();
                        }
                    } else {
                        next();
                    }
                });
            } catch (e) {
                next();
            }
        }


    }
}

module.exports = BeaconModule;
