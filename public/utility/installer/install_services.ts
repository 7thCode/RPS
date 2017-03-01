/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

namespace Install {

    let InstallServices: angular.IModule = angular.module('InstallServices', []);

    InstallServices.factory('InstallSetting', ['$resource',
        ($resource): angular.resource.IResource<any> => {
            return $resource('/install', {}, {
                get: {method: 'GET'},
                put: {method: 'PUT'}
            });
        }]);

    InstallServices.service('InstallService', ['$location', 'InstallSetting',
        function ($location: any, InstallSetting: any): void {

            this.Get = (callback: (result: any) => void, error: (code: number, message: string) => void): void => {
                InstallSetting.get({}, (result: any): void => {
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

            this.Put = (setting: any, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
                let data = new InstallSetting();
                data.setting = setting;
                data.$put({}, (result: any): void => {
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

        }]);
}