/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace FileModule {

    const _ = require('lodash');

    const fs = require('fs');

    const mongoose = require('mongoose');
    const Grid = require('gridfs-stream');

    const share = require(process.cwd() + '/server/systems/common/share');
    const config = share.config;
    const Wrapper = share.Wrapper;
    const logger = share.logger;

    const result = require(share.Server('systems/common/result'));

    export class Files {

        constructor() {
        }

        static to_mime(request) {
            let type = "image/octet-stream";
            let index = request.body.url.indexOf(";");
            if (index > 0) {
                let types = request.body.url.substring(0, index).split(":");
                if (types.length == 2) {
                    type = types[1];
                }
            }
            return type;
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

        static userid(request): string {
            return request.user.userid;
        }

        static username(request): string {
            return request.user.username;
        }

        static from_local(gfs:any, path_from: string, filename: string, mimetype: string, callback: (error:any, file:any) => void): void {
            try {
                let readstream = fs.createReadStream(path_from + '/' + filename, {encoding: null, bufferSize: 1});
                let writestream = gfs.createWriteStream({filename: filename, metadata: {userid: config.systems.userid, key: 0, type: mimetype, parent:null}});

                readstream.on('data', (chunk: any): void => {
                    writestream.write(chunk);
                    writestream.end();
                });

                writestream.on('close', (file: any): void => {
                    callback(null, file);
                });

                readstream.on('error',(error:any): void => {
                    callback(error, null);
                });

                writestream.on('error',(error:any): void => {
                    callback(error, null);
                });

            } catch (e) {
            }
        }

        static result_file(conn, gfs, collection, filename, userid, response, next, not_found: () => void) {
            collection.findOne({$and: [{filename: filename}, {"metadata.userid": userid}]}, (error: any, item: any): void => {
                if (!error) {
                    if (item) {
                        let readstream = gfs.createReadStream({_id: item._id});
                        if (readstream) {
                            response.setHeader('Content-Type', item.metadata.type);
                            readstream.pipe(response);
                            readstream.on('close', (): void => {
                                conn.db.close();
                            });
                        } else {
                            conn.db.close();
                            next();
                        }
                    } else {
                        not_found();
                    }
                } else {
                    conn.db.close();
                    next();
                }
            });
        }

        /**
         *
         * @returns none
         */
        public create_init_files():void {
            let conn = Files.connect(config.db.user);
            if (conn) {
                conn.once('open', (error: any): void => {
                    if (!error) {
                        let gfs = Grid(conn.db, mongoose.mongo); //missing parameter
                        if (gfs) {
                            conn.db.collection('fs.files', (error: any, collection: any): void => {
                                if (!error) {
                                    if (collection) {
                                        collection.ensureIndex({"filename": 1,"metadata.userid":1}, (error) => {
                                            if (!error) {
                                                let path = process.cwd() + '/public/systems/resources/files/';
                                                let filename = "blank.png";
                                                let mimetype = "image/png";
                                                collection.findOne({$and: [{filename: filename}, {"metadata.userid": config.systems.userid}]}, (error: any, item: any): void => {
                                                    if (!error) {
                                                        if (!item) {
                                                            Files.from_local(gfs, path, filename, mimetype, ():void => {
                                                                conn.db.close();
                                                            });
                                                        }
                                                    }
                                                });
                                            }
                                        } );
                                    } else {
                                        conn.db.close();
                                    }
                                } else {
                                    conn.db.close();
                                }
                            });
                        } else {
                            conn.db.close();
                        }
                    } else {
                        conn.db.close();
                    }
                });
            }
        }

        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        public get_file_query_query(request: any, response: any): void {
            let number: number = 27000;
            let conn = Files.connect(config.db.user);
            let userid = Files.userid(request);
          //  let username = Files.username(request);

            if (conn) {
                conn.once('open', (error: any): void => {
                    if (!error) {
                        let gfs = Grid(conn.db, mongoose.mongo); //missing parameter
                        if (gfs) {
                            conn.db.collection('fs.files', (error: any, collection: any): void => {
                                if (!error) {
                                    if (collection) {
                                        let query: any = JSON.parse(decodeURIComponent(request.params.query));
                                        let option: any = JSON.parse(decodeURIComponent(request.params.option));

                                        let limit = 10;
                                        if (option.limit) {
                                            limit = option.limit;
                                        }

                                        let skip = 0;
                                        if (option.skip) {
                                            skip = option.skip;
                                        }

                                        collection.find({$and: [query, {"metadata.userid": userid}]}).limit(limit).skip(skip).toArray((error: any, docs: any): void => {
                                            if (!error) {
                                                conn.db.close();
                                                Wrapper.SendSuccess(response, docs);
                                            } else {
                                                conn.db.close();
                                                Wrapper.SendError(response, number + 100, error.message, error);
                                            }
                                        });
                                    } else {
                                        conn.db.close();
                                        Wrapper.SendFatal(response, number + 30, "no collection", {});
                                    }
                                } else {
                                    conn.db.close();
                                    Wrapper.SendError(response, number + 100, error.message, error);
                                }
                            });
                        } else {
                            conn.db.close();
                            Wrapper.SendFatal(response, number + 20, "gfs error", {});
                        }
                    } else {
                        conn.db.close();
                        Wrapper.SendError(response, number + 100, error.message, error);
                    }
                });
            } else {
                Wrapper.SendError(response, number + 10, "connection error", {});
            }
        }

        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        public get_file_query_count(request: any, response: any): void {
            let number: number = 27000;
            let conn = Files.connect(config.db.user);
            let userid = Files.userid(request);
            //let username = Files.username(request);

            if (conn) {
                conn.once('open', (error: any): void => {
                    if (!error) {
                        let gfs = Grid(conn.db, mongoose.mongo); //missing parameter
                        if (gfs) {
                            conn.db.collection('fs.files', (error: any, collection: any): void => {
                                if (!error) {
                                    if (collection) {
                                        let query: any = JSON.parse(decodeURIComponent(request.params.query));
                                        collection.find({$and: [query, {"metadata.userid": userid}]}).count((error: any, count: any): void => {
                                            if (!error) {
                                                conn.db.close();
                                                Wrapper.SendSuccess(response, count);
                                            } else {
                                                conn.db.close();
                                                Wrapper.SendError(response, number + 100, error.message, error);
                                            }
                                        });
                                    } else {
                                        conn.db.close();
                                        Wrapper.SendFatal(response, number + 30, "no collection", {});
                                    }
                                } else {
                                    conn.db.close();
                                    Wrapper.SendError(response, number + 100, error.message, error);
                                }
                            });
                        } else {
                            conn.db.close();
                            Wrapper.SendFatal(response, number + 20, "gfs error", {});
                        }
                    } else {
                        conn.db.close();
                        Wrapper.SendError(response, number + 100, error.message, error);
                    }
                });
            } else {
                Wrapper.SendError(response, number + 10, "connection error", {});
            }
        }

        /**
         *
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        public get_file_name(request: any, response: any, next: any): void {
            try {
                let conn = Files.connect(config.db.user);
                let name = request.params.name;
                let userid = request.params.userid;

                conn.once('open', (error: any): void => {
                    if (!error) {
                        let gfs = Grid(conn.db, mongoose.mongo); //missing parameter
                        if (gfs) {
                            conn.db.collection('fs.files', (error: any, collection: any): void => {
                                if (!error) {
                                    if (collection) {
                                        collection.findOne({$and: [{filename: name}, {"metadata.userid": userid}]}, (error: any, item: any): void => {
                                            if (!error) {
                                                if (item) {
                                                    let readstream = gfs.createReadStream({_id: item._id});
                                                    if (readstream) {
                                                        response.setHeader('Content-Type', item.metadata.type);
                                                        readstream.pipe(response);
                                                        readstream.on('close', (): void => {
                                                            conn.db.close();
                                                        });
                                                    } else {
                                                        conn.db.close();
                                                        next();
                                                    }
                                                } else {
                                                    // NOT FOUND IMAGE.
                                                    Files.result_file(conn, gfs, collection, "blank.png", config.systems.userid, response, next, () => {
                                                        conn.db.close();
                                                        next();
                                                    });
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
                            conn.db.close();
                            next();
                        }
                    } else {
                        conn.db.close();
                        next();
                    }
                });
            } catch (e) {
                next();
            }
        }

        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        public post_file_name(request: any, response: any): void {
            let number: number = 24000;
            let conn = Files.connect(config.db.user);
            let name = request.params.name;
            let key = request.params.key;
            let userid = Files.userid(request);
            let username = Files.username(request);

            if (conn) {
                conn.once('open', (error: any): void => {
                    if (!error) {
                        let gfs = Grid(conn.db, mongoose.mongo); //missing parameter
                        if (gfs) {
                            conn.db.collection('fs.files', (error: any, collection: any): void => {
                                if (!error) {
                                    if (collection) {
                                        collection.findOne({$and: [{filename: name}, {"metadata.userid": userid}]}, (error: any, item: any): void => {
                                            if (!error) {
                                                if (!item) {

                                                    let parseDataURL = (dataURL: any): any => {
                                                        let result = {
                                                            mediaType: null,
                                                            encoding: null,
                                                            isBase64: null,
                                                            data: null
                                                        };
                                                        if (/^data:([^;]+)(;charset=([^,;]+))?(;base64)?,(.*)/.test(dataURL)) {
                                                            result.mediaType = RegExp.$1 || 'text/plain';
                                                            result.encoding = RegExp.$3 || 'US-ASCII';
                                                            result.isBase64 = String(RegExp.$4) === ';base64';
                                                            result.data = RegExp.$5;
                                                        }
                                                        return result;
                                                    };

                                                    let info = parseDataURL(request.body.url);
                                                    let chunk = info.isBase64 ? new Buffer(info.data, 'base64') : new Buffer(unescape(info.data), 'binary');

                                                    let writestream = gfs.createWriteStream({filename: name, metadata: {userid: userid,username: username, key: key * 1, type: Files.to_mime(request), parent:null}});
                                                    if (writestream) {
                                                        writestream.write(chunk);
                                                        writestream.on('close', (file: any): void => {
                                                            conn.db.close();
                                                            Wrapper.SendSuccess(response, file);
                                                        });
                                                        writestream.end();
                                                    } else {
                                                        conn.db.close();
                                                        Wrapper.SendFatal(response, number + 40, "stream not open", {});
                                                    }
                                                } else {
                                                    conn.db.close();
                                                    Wrapper.SendWarn(response, number + 1, "already found", {});
                                                }
                                            } else {
                                                conn.db.close();
                                                Wrapper.SendError(response, number + 100, error.message, error);
                                            }
                                        });
                                    } else {
                                        conn.db.close();
                                        Wrapper.SendFatal(response, number + 30, "no collection", {});
                                    }
                                } else {
                                    conn.db.close();
                                    Wrapper.SendError(response, number + 100, error.message, error);
                                }
                            });
                        } else {
                            conn.db.close();
                            Wrapper.SendFatal(response, number + 20, "no gfs", {});
                        }
                    } else {
                        conn.db.close();
                        Wrapper.SendError(response, number + 100, error.message, error);
                    }
                });
            } else {
                Wrapper.SendError(response, number + 10, "connection error", {});
            }
        }

        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        public put_file_name(request: any, response: any): void {
            let number: number = 25000;
            let conn = Files.connect(config.db.user);
            let name = request.params.name;
            let key = request.params.key;
            let userid = Files.userid(request);
            let username = Files.username(request);

            let parseDataURL = (dataURL: any): any => {
                let result = {
                    mediaType: null,
                    encoding: null,
                    isBase64: null,
                    data: null
                };
                if (/^data:([^;]+)(;charset=([^,;]+))?(;base64)?,(.*)/.test(dataURL)) {
                    result.mediaType = RegExp.$1 || 'text/plain';
                    result.encoding = RegExp.$3 || 'US-ASCII';
                    result.isBase64 = String(RegExp.$4) === ';base64';
                    result.data = RegExp.$5;
                }
                return result;
            };

            if (conn) {
                conn.once('open', (error: any): void => {
                    if (!error) {
                        let gfs = Grid(conn.db, mongoose.mongo); //missing parameter
                        if (gfs) {
                            conn.db.collection('fs.files', (error: any, collection: any): void => {
                                if (!error) {
                                    if (collection) {
                                        collection.findOne({$and: [{filename: name}, {"metadata.userid": userid}]}, (error: any, item: any): void => {
                                            if (!error) {
                                                if (item) {
                                                    collection.remove({_id: item._id}, (error) => {
                                                        if (!error) {
                                                            let info = parseDataURL(request.body.url);
                                                            let chunk = info.isBase64 ? new Buffer(info.data, 'base64') : new Buffer(unescape(info.data), 'binary');
                                                            let writestream = gfs.createWriteStream({filename: name,username: username, metadata: {userid: userid, key: key * 1, type:Files.to_mime(request), parent:null}});
                                                            if (writestream) {
                                                                writestream.write(chunk);
                                                                writestream.on('close', (file: any): void => {
                                                                    conn.db.close();
                                                                    Wrapper.SendSuccess(response, file);
                                                                });
                                                                writestream.end();
                                                            } else {
                                                                conn.db.close();
                                                                Wrapper.SendFatal(response, number + 40, "stream not open", {});
                                                            }
                                                        }
                                                    });
                                                } else {

                                                    let info = parseDataURL(request.body.url);
                                                    let chunk = info.isBase64 ? new Buffer(info.data, 'base64') : new Buffer(unescape(info.data), 'binary');
                                                    let writestream = gfs.createWriteStream({filename: name,username: username, metadata: {userid: userid, key: key * 1, type:Files.to_mime(request), parent:null}});
                                                    if (writestream) {
                                                        writestream.write(chunk);
                                                        writestream.on('close', (file: any): void => {
                                                            conn.db.close();
                                                            Wrapper.SendSuccess(response, file);
                                                        });
                                                        writestream.end();
                                                    } else {
                                                        conn.db.close();
                                                        Wrapper.SendFatal(response, number + 40, "stream not open", {});
                                                    }

                                                }
                                            } else {
                                                conn.db.close();
                                                Wrapper.SendError(response, number + 100, error.message, error);
                                            }
                                        });
                                    } else {
                                        Wrapper.SendFatal(response, number + 30, "no collection", {});
                                    }
                                } else {
                                    conn.db.close();
                                    Wrapper.SendError(response, number + 100, error.message, error);
                                }
                            });
                        } else {
                            conn.db.close();
                            Wrapper.SendFatal(response, number + 20, "no gfs", {});
                        }
                    } else {
                        conn.db.close();
                        Wrapper.SendError(response, number + 100, error.message, error);
                    }
                });
            } else {
                Wrapper.SendError(response, number + 10, "connection error", {});
            }
        }

        /*
        public put_file_name(request: any, response: any): void {
            let number: number = 25000;
            let conn = Files.connect(config.db.user);
            let name = request.params.name;
            let key = request.params.key;
            let userid = Files.userid(request);
            let username = Files.username(request);

            if (conn) {
                conn.once('open', (error: any): void => {
                    if (!error) {
                        let gfs = Grid(conn.db, mongoose.mongo); //missing parameter
                        if (gfs) {
                            conn.db.collection('fs.files', (error: any, collection: any): void => {
                                if (!error) {
                                    if (collection) {
                                        collection.findOne({$and: [{filename: name}, {"metadata.userid": userid}]}, (error: any, item: any): void => {
                                            if (!error) {
                                                if (item) {
                                                    collection.remove({filename: name, metadata: {userid: userid, type: Files.to_mime(request)}}, () => {
                                                        let parseDataURL = (dataURL: any): any => {
                                                            let result = {
                                                                mediaType: null,
                                                                encoding: null,
                                                                isBase64: null,
                                                                data: null
                                                            };
                                                            if (/^data:([^;]+)(;charset=([^,;]+))?(;base64)?,(.*)/.test(dataURL)) {
                                                                result.mediaType = RegExp.$1 || 'text/plain';
                                                                result.encoding = RegExp.$3 || 'US-ASCII';
                                                                result.isBase64 = String(RegExp.$4) === ';base64';
                                                                result.data = RegExp.$5;
                                                            }
                                                            return result;
                                                        };

                                                        let info = parseDataURL(request.body.url);
                                                        let chunk = info.isBase64 ? new Buffer(info.data, 'base64') : new Buffer(unescape(info.data), 'binary');
                                                        let writestream = gfs.createWriteStream({filename: name,username: username, metadata: {userid: userid, key: key * 1, type: Files.to_mime(request), parent:null}});
                                                        if (writestream) {
                                                            writestream.write(chunk);
                                                            writestream.on('close', (file: any): void => {
                                                                conn.db.close();
                                                                Wrapper.SendSuccess(response, file);
                                                            });
                                                            writestream.end();
                                                        } else {
                                                            conn.db.close();
                                                            Wrapper.SendFatal(response, number + 40, "stream not open", {});
                                                        }
                                                    });
                                                } else {
                                                    conn.db.close();
                                                    Wrapper.SendWarn(response, number + 1, "not found", {});
                                                }
                                            } else {
                                                conn.db.close();
                                                Wrapper.SendError(response, number + 100, error.message, error);
                                            }
                                        });
                                    } else {
                                        Wrapper.SendFatal(response, number + 30, "no collection", {});
                                    }
                                } else {
                                    conn.db.close();
                                    Wrapper.SendError(response, number + 100, error.message, error);
                                }
                            });
                        } else {
                            conn.db.close();
                            Wrapper.SendFatal(response, number + 20, "no gfs", {});
                        }
                    } else {
                        conn.db.close();
                        Wrapper.SendError(response, number + 100, error.message, error);
                    }
                });
            } else {
                Wrapper.SendError(response, number + 10, "connection error", {});
            }
        }
        */

        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        public delete_file_name(request: any, response: any): void {
            let number: number = 26000;
            let conn = Files.connect(config.db.user);
            let name = request.params.name;
            //let key = request.params.key;
            let userid = Files.userid(request);
            //let username = Files.username(request);

            if (conn) {
                conn.once('open', (error: any): void => {
                    if (!error) {
                        let gfs = Grid(conn.db, mongoose.mongo); //missing parameter
                        if (gfs) {
                            conn.db.collection('fs.files', (error: any, collection: any): void => {
                                if (!error) {
                                    if (collection) {
                                        collection.findOne({$and: [{filename: name}, {"metadata.userid": userid}]}, (error: any, item: any): void => {
                                            if (!error) {
                                                if (item) {
                                                    collection.remove({_id: item._id}, (error): void => {
                                                        if (!error) {
                                                            conn.db.close();
                                                            Wrapper.SendSuccess(response, {});
                                                        } else {
                                                            conn.db.close();
                                                            Wrapper.SendError(response, number + 100, error.message, error);
                                                        }
                                                    });
                                                } else {
                                                    conn.db.close();
                                                    Wrapper.SendWarn(response, number + 1, "not found", {});
                                                }
                                            } else {
                                                conn.db.close();
                                                Wrapper.SendError(response, number + 100, error.message, error);
                                            }
                                        });
                                    } else {
                                        conn.db.close();
                                        Wrapper.SendFatal(response, number + 30, "no collection", {});
                                    }
                                } else {
                                    conn.db.close();
                                    Wrapper.SendError(response, number + 100, error.message, error);
                                }
                            });
                        } else {
                            conn.db.close();
                            Wrapper.SendFatal(response, number + 20, "gfs error", {});
                        }
                    } else {
                        conn.db.close();
                        Wrapper.SendError(response, number + 100, error.message, error);
                    }
                });
            } else {
                Wrapper.SendError(response, number + 10, "connection error", {});
            }
        }

        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        public delete_own(request: any, response: any): void {
            let number: number = 26000;
            let conn: any = Files.connect(config.db.user);
            let userid: string = Files.userid(request);
            //let username = Files.username(request);

            if (conn) {
                conn.once('open', (error: any): void => {
                    if (!error) {
                        let gfs = Grid(conn.db, mongoose.mongo); //missing parameter
                        if (gfs) {
                            conn.db.collection('fs.files', (error: any, collection: any): void => {
                                if (!error) {
                                    if (collection) {
                                        collection.remove({"metadata.userid": userid}, (error: any): void => {
                                            if (!error) {
                                                conn.db.close();
                                                Wrapper.SendSuccess(response, {});
                                            } else {
                                                conn.db.close();
                                                Wrapper.SendError(response, number + 100, error.message, error);
                                            }
                                        });
                                    } else {
                                        conn.db.close();
                                        Wrapper.SendFatal(response, number + 30, "no collection", {});
                                    }
                                } else {
                                    conn.db.close();
                                    Wrapper.SendError(response, number + 100, error.message, error);
                                }
                            });
                        } else {
                            conn.db.close();
                            Wrapper.SendFatal(response, number + 20, "gfs error", {});
                        }
                    } else {
                        conn.db.close();
                        Wrapper.SendError(response, number + 100, error.message, error);
                    }
                });
            } else {
                Wrapper.SendError(response, number + 10, "connection error", {});
            }
        }
    }
}

module.exports = FileModule;