/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

let AnalysisControllers: angular.IModule = angular.module('AnalysisControllers', ["ngResource"]);

AnalysisControllers.controller('AnalysisController', ['$scope', '$document', '$log', 'AnalysisService',
    ($scope: any, $document: any, $log: any, AnalysisService): void => {

        let progress = (value) => {
            $scope.$emit('progress', value);
        };

        $scope.$on('progress', (event, value) => {
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

        let Draw = () => {
            AnalysisService.Query((data: any): void => {
                $scope.logs = data;
            }, error_handler);
        };

        let AccessLogs = () => {
            AnalysisService.Query((data: any): void => {
                $scope.logs = data;
            }, error_handler);
        };

        $scope.Next = () => {
            AnalysisService.Next((data) => {
                $scope.logs = data;
            }, error_handler);
        };

        $scope.Prev = () => {
            AnalysisService.Prev((data) => {
                $scope.logs = data;
            }, error_handler);
        };

        $scope.Find = (name) => {
            if (!name) {
                AnalysisService.query.key = name;
            }
            Draw();
        };

        AccessLogs();
        Draw();

    }]);