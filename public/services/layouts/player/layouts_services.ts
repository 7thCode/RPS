/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

let LayoutServices: angular.IModule = angular.module('LayoutServices', []);

LayoutServices.factory('LayoutCreate', ['$resource',
    ($resource: any): angular.resource.IResource<any> => {
        return $resource('/layouts/layout/create', {}, {});
    }]);

LayoutServices.factory('Layout', ['$resource',
    ($resource: any): angular.resource.IResource<any> => {
        return $resource('/layouts/layout/:id', {id: "@id"}, {
            get: {method: 'GET'},
            put: {method: 'PUT'},
            delete: {method: 'DELETE'}
        });
    }]);

LayoutServices.factory('LayoutPDF', ['$resource',
    ($resource: any): angular.resource.IResource<any> => {
        return $resource('/layouts/layout/pdf', {}, {});
    }]);

LayoutServices.factory('LayoutSVG', ['$resource',
    ($resource: any): angular.resource.IResource<any> => {
        return $resource('/layouts/layout/svg', {}, {});
    }]);

LayoutServices.factory('LayoutQuery', ['$resource',
    ($resource: any): angular.resource.IResource<any> => {
        return $resource("/layouts/layout/query/:query/:option", {query: '@query', option: '@optopn'}, {
            query: {method: 'GET'}
        });
    }]);

LayoutServices.factory('LayoutCount', ['$resource',
    ($resource: any): angular.resource.IResource<any> => {
        return $resource('/layouts/layout/count/:query', {query: '@query'}, {
            get: {method: 'GET'}
        });
    }]);

LayoutServices.service('LayoutService', [ '$log', "LayoutCreate", "Layout", 'LayoutQuery', "LayoutCount", 'LayoutPDF', 'LayoutSVG',
    function ( $log, LayoutCreate: any, Layout: any, LayoutQuery: any, LayoutCount: any, LayoutPDF: any, LayoutSVG: any): void {

        let init = () => {
            this.pagesize = 12;

            this.query = {};
            this.option = {sort: {modify: -1}, limit: this.pagesize, skip: 0};
            this.count = 0;

            this.format = {
                size: [600, 848],
                margins: { // by default, all are 72
                    top: 72,
                    bottom: 72,
                    left: 72,
                    right: 72
                },
                layout: 'portrait',
                info: {
                    Title: 'title',
                    Author: 'pdf_writer',
                    Subject: 'test',
                    Keywords: 'pdf;javascript',
                    CreationDate: '10/10/2016',
                    ModDate: '11/10/2016'
                }
            };
        };

        this.Query = (callback: (result: any) => void, error: (code: number, message: string) => void) => {
            LayoutQuery.query({
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
            LayoutCount.get({
                query: encodeURIComponent(JSON.stringify(this.query)),
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

        this.Create = (name: string, content: any, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            init();
            let layout = new LayoutCreate();
            layout.name = name;
            layout.content = content;
            layout.$save({}, (result: any): void => {
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

        this.Get = (id: any, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            init();
            Layout.get({
                id: id
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

        this.Put = (_layout: any, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            let layout = new Layout();
            layout.content = _layout.content;
            layout.name = _layout.name;
            layout.$put({
                id: this.current_layout._id
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

        this.PutAs = (name:string, _layout: any, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            let layout = new Layout();
            layout.content = _layout.content;
            layout.name = name;
            layout.$put({
                id: this.current_layout._id
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

        this.Delete = (callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            Layout.delete({
                id: this.current_layout._id
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

        this.PrintPDF = (content: any, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            let layout = new LayoutPDF();
            layout.content = content;
            layout.$save({}, (result: any): void => {
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

        this.PrintSVG = (content: any, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            let layout = new LayoutSVG();
            layout.content = content;
            layout.$save({}, (result: any): void => {
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

        init();

    }]);