/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

let FileServices: angular.IModule = angular.module('FileServices', []);

FileServices.filter('filename', [(): any => {
    return (filename: string, limit: number): string => {
        let result = filename;
        let nameparts: string[] = filename.split(".");
        if (nameparts.length == 2) {
            let name = nameparts[0];
            let type = nameparts[1];
            if (name) {
                if (name.length > limit) {
                    result = name.slice(0, limit) + "..." + type;
                }
            }
        }
        return result;
    };
}]);

FileServices.filter('icon', [(): any => {
    return (mimetype: string): string => {
        let result = "";
        switch (mimetype) {
            case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                result = "/systems/resources/files/xls.svg";
                break;
            case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                result = "/systems/resources/files/doc.svg";
                break;
            case "application/pdf":
                result = "/systems/resources/files/pdf.svg";
                break;
            case "text/plain":
                result = "/systems/resources/files/txt.svg";
                break;
            default:
                result = "/systems/resources/files/default.svg";
        }
        return result;
    };
}]);

FileServices.factory('File', ['$resource',
    ($resource): angular.resource.IResource<any> => {
        return $resource('/files/api/:name/:key', {name: '@name', key: '@key'}, {
            send: {method: 'POST'},
            update: {method: 'PUT'}
        });
    }]);

FileServices.factory('FileQuery', ['$resource',
    ($resource): angular.resource.IResource<any> => {
        return $resource('/files/api/query/:query/:option', {query: '@query', option: '@option'}, {
            query: {method: 'GET'}
        });
    }]);


FileServices.factory('FileCount', ['$resource',
    ($resource: any): angular.resource.IResource<any> => {
        return $resource('/files/api/count/:query', {query: '@query'}, {
            get: {method: 'GET'}
        });
    }]);

//FileServices.value("CurrentFileQuery", {query: {filename: {$regex: ""}}, option: {limit: 10, skip: 0}});

FileServices.service('FileService', ["File", "FileQuery", "FileCount",
    function (File: any, FileQuery: any, FileCount: any): void {

        this.pagesize = 30;
        this.query = {};
        this.option = {limit: this.pagesize, skip: 0};

        this.Query = (callback: (result: any) => void, error: (code: number, message: string) => void) => {
            FileQuery.query({
                query: encodeURIComponent(JSON.stringify(this.query)),
                option: encodeURIComponent(JSON.stringify(this.option))
            }, (result: any): void => {
                if (result) {
                    if (result.code === 0) {
                        callback(result.value);
                    } else {
                        error(result.code, result.message);
                    }
                } else {
                    error(10000, "network error");
                }
            });
        };

        this.Count = (callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            FileCount.get({
                query: encodeURIComponent(JSON.stringify(this.query))
            }, (result: any): void => {
                if (result) {
                    if (result.code === 0) {
                        callback(result.value);
                    } else {
                        error(result.code, result.message);
                    }
                } else {
                    error(10000, "network error");
                }
            });
        };

        this.Over = (callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            this.Count((count) => {
                callback((this.option.skip + this.pagesize) < count);
            }, error);
        };

        this.Under = (callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            callback(this.option.skip >= this.pagesize);
        };

        this.Next = (callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            this.Over((hasnext) => {
                if (hasnext) {
                    this.option.skip = this.option.skip + this.pagesize;
                    this.Query(callback, error);
                } else {
                    callback(null);
                }
            });
        };

        this.Prev = (callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            this.Under((hasprev) => {
                if (hasprev) {
                    this.option.skip = this.option.skip - this.pagesize;
                    this.Query(callback, error);
                } else {
                    callback(null);
                }
            });
        };

        this.Create = (url: string, filename: string, key: number, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            let remote_file: any = new File();
            remote_file.url = url;
            let promise = remote_file.$send({name: filename, key: key}, (value: any, responseHeaders: any): void => {
                callback(value);
            }, (httpResponse: any): void => {
                error(1, "");
            });
        };

        this.Delete = (filename: string, key: number, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            let file: any = new File();
            file.$delete({name: filename, key: key}, (result, responseHeaders) => {
                if (result) {
                    switch (result.code) {
                        case 0:
                            callback(result);
                            break;
                        default:
                    }
                }
            }, (httpResponse) => {
                error(1, "")
            });
        };

    }]);