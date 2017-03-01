/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

let AnalysisServices: angular.IModule = angular.module('AnalysisServices', []);

AnalysisServices.factory('Analysis', ['$resource',
    ($resource: any): angular.resource.IResource<any> => {
        return $resource('/analysis/api/:id', {id: "@id"}, {
            get: {method: 'GET'},
            put: {method: 'PUT'},
            delete: {method: 'DELETE'}
        });
    }]);

AnalysisServices.factory('AnalysisQuery', ['$resource',
    ($resource: any): angular.resource.IResource<any> => {
        return $resource("/analysis/api/query/:query/:option", {query: '@query', option: '@optopn'}, {
            query: {method: 'GET'}
        });
    }]);

AnalysisServices.factory('AnalysisCount', ['$resource',
    ($resource: any): angular.resource.IResource<any> => {
        return $resource('/analysis/api/count/:query', {query: '@query'}, {
            get: {method: 'GET'}
        });
    }]);

AnalysisServices.service('AnalysisService', [ "Analysis", "AnalysisQuery", "AnalysisCount",
    function (Analysis: any, AnalysisQuery: any, AnalysisCount: any): void {

        this.Init = () => {
            this.pagesize = 15;
            this.query = {};
            this.option = {limit: this.pagesize, skip: 0};
            this.current = {content:{}};
        };

        this.Query = (callback: (result: any) => void, error: (code: number, message: string) => void) => {
            AnalysisQuery.query({
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
            AnalysisCount.get({
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

        this.Get = (id: any, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            this.Init();
            Analysis.get({
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

        this.Init();

    }]);