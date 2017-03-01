/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

namespace Setting {

    let SettingControllers: angular.IModule = angular.module('SettingControllers', ["ngResource"]);

    SettingControllers.controller('SettingController', ['$scope', '$document', '$log', 'ApplicationSettingService', 'SystemSettingService',
        ($scope: any, $document: any, $log: any, ApplicationSettingService: any, SystemSettingService: any): void => {

            let progress = (value: any): void => {
                $scope.$emit('progress', value);
            };

            $scope.$on('progress', (event: any, value: any): void => {
                $scope.progress = value;
            });

            let error_handler: (code: number, message: string) => void = (code: number, message: string): void => {
                progress(false);
                $scope.message = message;
                $log.error(message);
            };

            $document.on('drop dragover', (e: any): void => {
                e.stopPropagation();
                e.preventDefault();
            });


            let Draw = (): void => {
                progress(true);
                ApplicationSettingService.Get((application_data: any): void => {
                    $scope.application_setting = application_data;
                    SystemSettingService.Get((system_data: any): void => {
                        $scope.system_setting = system_data;
                        progress(false);
                    }, error_handler);
                }, error_handler);
            };

            let Write = (): void => {
                progress(true);
                ApplicationSettingService.Put($scope.application_setting, (application_data: any): void => {
                    $scope.application_setting = application_data;
                    SystemSettingService.Put($scope.system_setting, (system_data: any): void => {
                        $scope.system_setting = system_data;
                        progress(false);
                    });
                });
            };

            $scope.Write = Write;

            Draw();

        }]);
}