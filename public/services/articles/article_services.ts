/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

let ArticleServices: angular.IModule = angular.module('ArticleServices', []);

ArticleServices.factory('ArticleCreate', ['$resource',
    ($resource: any): angular.resource.IResource<any> => {
        return $resource('/articles/api/create', {}, {});
    }]);

ArticleServices.factory('Article', ['$resource',
    ($resource: any): angular.resource.IResource<any> => {
        return $resource('/articles/api/:id', {id: "@id"}, {
            get: {method: 'GET'},
            put: {method: 'PUT'},
            delete: {method: 'DELETE'}
        });
    }]);

ArticleServices.factory('ArticleQuery', ['$resource',
    ($resource: any): angular.resource.IResource<any> => {
        return $resource("/articles/api/query/:query/:option", {query: '@query', option: '@optopn'}, {
            query: {method: 'GET'}
        });
    }]);

ArticleServices.factory('ArticleCount', ['$resource',
    ($resource: any): angular.resource.IResource<any> => {
        return $resource('/articles/api/count/:query', {query: '@query'}, {
            get: {method: 'GET'}
        });
    }]);

ArticleServices.service('ArticleService', ["ArticleCreate", "Article", "ArticleQuery", "ArticleCount",
    function (ArticleCreate: any, Article: any, ArticleQuery: any, ArticleCount: any): void {

        let init = () => {
            this.pagesize = 10;
            this.query = {};
            this.option = {sort: {create: -1}, limit: this.pagesize, skip: 0};
            this.current_article = null;
        };

        this.Query = (callback: (result: any) => void, error: (code: number, message: string) => void) => {
            ArticleQuery.query({
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
            ArticleCount.get({
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

        this.CreateWith = (name: string, initial: (article: any) => any, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            init();
            let article = new ArticleCreate();
            article.name = name;
            article = initial(article);
            article.$save({}, (result: any): void => {
                if (result) {
                    if (result.code === 0) {
                        this.current_article = result.value;
                        callback(result.value);
                    } else {
                        error(result.code, result.message);
                    }
                } else {
                    error(10000, "network error");
                }
            });
        };

        this.Create = (name: string, content: any, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            init();
            let article = new ArticleCreate();
            article.name = name;
            article.content = content;
            article.$save({}, (result: any): void => {
                if (result) {
                    if (result.code === 0) {
                        this.current_article = result.value;
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
            Article.get({
                id: id
            }, (result: any): void => {
                if (result) {
                    if (result.code === 0) {
                        this.current_article = result.value;
                        callback(result.value);
                    } else {
                        error(result.code, result.message);
                    }
                } else {
                    error(10000, "network error");
                }
            });
        };

        this.Put = (id: any, content: any, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            let article = new Article();
            article.content = content;
            article.$put({
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

        this.Delete = (id: any, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            Article.delete({
                id: id
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

        init();

    }]);