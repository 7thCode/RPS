/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";
//import {version} from "punycode";

let ResourceBuilderServices: angular.IModule = angular.module('ResourceBuilderServices', []);

ResourceBuilderServices.factory('ResourceCreate', ['$resource',
    ($resource: any): angular.resource.IResource<any> => {
        return $resource('/resources/api/create', {}, {});
    }]);

ResourceBuilderServices.factory('Resource', ['$resource',
    ($resource: any): angular.resource.IResource<any> => {
        return $resource('/resources/api/:id', {id: "@id"}, {
            get: {method: 'GET'},
            put: {method: 'PUT'},
            delete: {method: 'DELETE'}
        });
    }]);

ResourceBuilderServices.factory('ResourceQuery', ['$resource',
    ($resource: any): angular.resource.IResource<any> => {
        return $resource("/resources/api/query/:query/:option", {query: '@query', option: '@optopn'}, {
            query: {method: 'GET'}
        });
    }]);

ResourceBuilderServices.factory('ResourceCount', ['$resource',
    ($resource: any): angular.resource.IResource<any> => {
        return $resource('/resources/api/count/:query', {query: '@query'}, {
            get: {method: 'GET'}
        });
    }]);

ResourceBuilderServices.service('ResourceBuilderService', ["HtmlEdit", "ResourceCreate", "Resource", "ResourceQuery", "ResourceCount",
    function (HtmlEdit: any, ResourceCreate: any, Resource: any, ResourceQuery: any, ResourceCount: any): void {

        let init = () => {
            this.pagesize = 10;
            this.query = {};
            this.option = {limit: this.pagesize, skip: 0};
            this.current = {content:{}};
        };

        this.Init = () => {
            init();
        };

        this.Query = (callback: (result: any) => void, error: (code: number, message: string) => void) => {
            ResourceQuery.query({
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
            ResourceCount.get({
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

        this.Create = (name: string, type: number, callback: (result: any) => void, error: (code: number, message: string) => void): void => {

            let resource = new ResourceCreate();
            resource.name = name;
            resource.type = type;
            resource.content = this.current.content;
            resource.$save({}, (result: any): void => {
                if (result) {
                    if (result.code === 0) {
                        this.current = result.value;
                        callback(this.current.content);
                    } else {
                        error(result.code, result.message);
                    }
                } else {
                    error(10000, "network error");
                }
            });
        };

        this.Get = (id: any, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            init();
            Resource.get({
                id: id
            }, (result: any): void => {
                if (result) {
                    if (result.code === 0) {
                        this.current = result.value;
                        callback(this.current.content);
                    } else {
                        error(result.code, result.message);
                    }
                } else {
                    error(10000, "network error");
                }
            });
        };

        this.Put = (callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            let resource = new Resource();
            resource.content = this.current.content;
            resource.$put({
                id: this.current._id,
            }, (result: any): void => {
                if (result) {
                    if (result.code === 0) {
                        callback(result.value.content);
                    } else {
                        error(result.code, result.message);
                    }
                } else {
                    error(10000, "network error");
                }
            });
        };

        this.Delete = (callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            Resource.delete({
                id: this.current._id
            }, (result: any): void => {
                if (result) {
                    if (result.code === 0) {
                        init();
                        callback(result.value);
                    } else {
                        error(result.code, result.message);
                    }
                } else {
                    error(10000, "network error");
                }
            });
        };

        this.preview = document.getElementById("view");

        init();

    }]);