/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

namespace PublicKeyServicesModule {

    let PublicKeyServices: angular.IModule = angular.module('PublicKeyServices', []);

    PublicKeyServices.factory('FixedPublicKey', ['$resource',
        ($resource: any): angular.resource.IResource<any> => {
            return $resource('/publickey/fixed', {}, {
                get: {method: 'GET'}
            });
        }]);

    PublicKeyServices.factory('DynamicPublicKey', ['$resource',
        ($resource: any): angular.resource.IResource<any> => {
            return $resource('/publickey/dynamic', {}, {
                get: {method: 'GET'}
            });
        }]);

    PublicKeyServices.factory('Token', ['$resource',
        ($resource: any): angular.resource.IResource<any> => {
            return $resource('/publickey/token', {}, {
                get: {method: 'GET'}
            });
        }]);

    PublicKeyServices.service('PublicKeyService', ["FixedPublicKey", "DynamicPublicKey", "Token",
        function (FixedPublicKey: any, DynamicPublicKey, Token): void {

            this.Fixed = (callback: (result: any) => void, error: (code: number, message: string) => void): void => {
                FixedPublicKey.get({}, (result: any): void => {
                    if (result) {
                        switch (result.code) {
                            case 0:
                                callback(result.value);
                                break;
                            case 1:
                                callback(null);
                                break;
                            default:
                                error(result.code, result.message);
                        }
                    } else {
                        error(10000, "network error");
                    }
                });
            };

            this.Dynamic = (callback: (result: any) => void, error: (code: number, message: string) => void): void => {
                DynamicPublicKey.get({}, (result: any): void => {
                    if (result) {
                        switch (result.code) {
                            case 0:
                                callback(result.value);
                                break;
                            case 1:
                                callback(null);
                                break;
                            default:
                                error(result.code, result.message);
                        }
                    } else {
                        error(10000, "network error");
                    }
                });
            };

            this.Token = (callback: (result: any) => void, error: (code: number, message: string) => void): void => {
                Token.get({}, (result: any): void => {
                    if (result) {
                        switch (result.code) {
                            case 0:
                                callback(result.value);
                                break;
                            case 1:
                                callback(null);
                                break;
                            default:
                                error(result.code, result.message);
                        }
                    } else {
                        error(10000, "network error");
                    }
                });
            };

        }]);

}