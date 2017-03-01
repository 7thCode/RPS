/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

namespace Install {

    let InstallControllers: angular.IModule = angular.module('InstallControllers', ["ngResource"]);

    InstallControllers.controller('InstallController', ['$scope', '$log', 'InstallService',
        ($scope: any, $log: any, InstallService: any): void => {

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

            let Draw = (): void => {
                progress(true);
                InstallService.Get((system_data: any): void => {
                    $scope.setting = system_data;
                    progress(false);
                }, error_handler);
            };

            let Write = (): void => {
                progress(true);
                InstallService.Put($scope.setting, (system_data: any): void => {
                        $scope.setting = system_data;
                        progress(false);
                    });
            };

            $scope.Write = Write;

            Draw();

        }]);
}