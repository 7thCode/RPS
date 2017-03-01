/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

let AccountServices: angular.IModule = angular.module('AccountServices', []);

AccountServices.factory('AccountQuery', ['$resource',
    ($resource): angular.resource.IResource<any> => {
        return $resource('/accounts/api/query/:query/:option', {query: '@query', option: '@option'}, {
            query: {method: 'GET'}
        });
    }]);

AccountServices.factory('AccountCount', ['$resource',
    ($resource: any): angular.resource.IResource<any> => {
        return $resource('/accounts/api/count/:query', {query: '@query'}, {
            get: {method: 'GET'}
        });
    }]);

AccountServices.service('AccountService', ['AccountQuery', 'AccountCount', 'CollectionService',
    function (AccountQuery: any, AccountCount: any, CollectionService: any): void {

        this.pagesize = 25;
        this.query = {};
        this.option = {limit: this.pagesize, skip: 0};

        this.Query = (callback: (data) => void, error: (code: number, message: string) => void): void => {
            CollectionService.List(AccountQuery, this.query, this.option, callback, error);
        };

        this.Count = (callback: (data: any) => void, error: (code: number, message: string) => void): void => {
            CollectionService.Count(AccountCount, this.query, callback, error);
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

    }]);