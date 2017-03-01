/**!
 Copyright (c) 2016 7thCode.
 This software is released under the 7thCode.
 */

"use strict";

import forEach = require("lodash/forEach");

export namespace RewritingModule {

    const fs: any = require('graceful-fs');
    const _ = require('lodash');

    const share = require(process.cwd() + '/server/systems/common/share');
    const logger = share.logger;
    const Persistent = share.Persistent;
    const Wrapper = share.Wrapper;
    const file_utility = share.Utility;
    //const map = share.Map;

    //var Q = require('q');

    export class Rewriting {

        public DirectoryQuery(request: any, response: any) {

        //    logger.trace("begin get_file_query_query");
            file_utility.readdir("", (error: any, data: any) => {
                if (!error) {
                    Wrapper.SendSuccess(response, data);
                } else {
                    Wrapper.SendError(response, error.code, error.message, error);
                }
            });
        }


        public rewritingQuery(request: any, response: any) {

            console.log(JSON.parse(decodeURIComponent(request.params.path)));
     //       logger.trace("begin get_rewriting_query");

            let path = JSON.parse(decodeURIComponent(request.params.path));
            let result = [];
            let strage_string = file_utility.readfileSync("./persistent/systems/storege.json");
            let storage_objects = JSON.parse(strage_string);
            _.forEach(storage_objects, (storage_object: any): void => {
                if (storage_object.path == path) {
                    result.push({contents: storage_object});
                }
            });

            Wrapper.SendSuccess(response, result);

        }

        public read_dir(path): any {
//            let path = request.params.path;
            file_utility.readdir(path, (error: any, data: any) => {
                if (!error) {
                    //Wrapper.SendSuccess(response, data);
                    return data;
                } else {
                    //Wrapper.SendError(response, error.code, error.message, error);
                    return error;
                }
            });
        }

        public writing(request: any, response: any): void {
      //      logger.trace("begin put_wrinting_update");
            const number: number = 5000;

            console.log(request.body.discription);

            let map = share.Map;

          //  let results = [];
          //  let result = [];
            let strage_string = file_utility.readfileSync("./persistent/systems/storege.json");
            let storage_objects = JSON.parse(strage_string);


            _.forEach(storage_objects, (storage_object: any, index): void => {
                if (storage_object.path == "/") {

                    storage_objects[index].title = request.body.title[index];
                    storage_objects[index].discription = request.body.discription[index];

                }

            });


            map.SetArrray(storage_objects);
            map.Store();
        }

        public rewritingInit(request: any, response: any): void {
            let strage_string = file_utility.readfileSync("./persistent/systems/storege.json");
            let storage_objects = JSON.parse(strage_string);


// 検索するディレクトリ
//             var _dir = __dirname;
//
//             var walk = function(path, fileCallback, errCallback){
//                 // 指定ディレクトリを検索して一覧を表示
//                 fs.readdir(path, function(err, files){
//
//                     if(err){
//                         errCallback(err);
//                         return;
//                     }
//
//                     // filesの中身を繰り替えして出力
//                     files.forEach(function(file){
//                         var _f = path + "/" + file;
//                         if(fs.statSync(_f).isDirectory()){
//                             fileCallback(_f);
//                             walk(_f, fileCallback);
//                         }else{
//                             fileCallback(_f);
//                         }
//                     });
//
//                 });
//             }
//
//             walk(_dir, function(path){
//                 console.log(path);
//             }, function(err) {
//                 console.log("err");
//             });


            let array = [];
            let path = ['/'];

            var dirc = function (path, fileCallback, errCallback) {
                let arrayMikan = [];


                _.forEach(path, (dir: any, index: any): void => {

                    file_utility.readdir(path, (error: any, data: any) => {
                        _.forEach(data, (dir: any): void => {
                            if (dir.match(/.html/)) {
                                array.push(dir);
                                console.log("dir" + dir);
                            } else {
                                arrayMikan.push(dir);
                                dirc(arrayMikan, fileCallback, errCallback);
                            }
                        });
                    });

                    // let num = dir.length-1;
                    // if(num == index){
                    //     if(arrayMikan.length != 0){
                    //         dirc(arrayMikan, fileCallback, errCallback);
                    //     }
                    // }
                });


            };

            dirc(path, function (path) {
                console.log(path);
            }, function (err) {
                console.log("err");
            });


            // file_utility.readdir("", (error:any, data:any) => {
            //
            //     console.log("object" + data);
            //
            //     _.forEach(data, (dir:any):void => {
            //
            //         if (dir.match(/.html/)) {
            //
            //             array.push(dir);
            //             console.log("dir" + dir);
            //
            //         } else {
            //             if (fs.statSync(dir).isDirectory()) {
            //                 console.log(dir + ' is directory.');
            //             }
            //
            //
            //             file_utility.readdir(dir, (error:any, data2:any) => {
            //                 _.forEach(data2, (dir2:any):void => {
            //                     if (dir2.match(/.html/)) {
            //                         array.push =  dir2;
            //                         console.log("dir" + dir2);
            //                     } else {
            //                         arrayMikan.push(dir + '/' + dir2);
            //                     }
            //                 });
            //
            //             });
            //         }
            //     });

            //});


            //console.log(a);

            //_.forEach(data, (dir:any):void => {
            //console.log("ディレクトリ"+dir);
            // _.forEach(storage_objects, (storage_object:any, value):void => {
            //     if(value == "bower_components"){
            //         console.log("JSON1" + storage_object.bower_components);
            //     }else{
            //         console.log("JSON2" + storage_object.bower_components);
            //     }
            // });
            //});
            //});

        }

    }

}

module.exports = RewritingModule;
