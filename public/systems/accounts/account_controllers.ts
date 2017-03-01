/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

/// <reference path="../../../node_modules/@types/angular/index.d.ts" />

"use strict";

let AccountControllers: angular.IModule = angular.module('AccountControllers', ["ngResource"]);

AccountControllers.controller('AccountController', ['$scope', '$document', '$log', '$uibModal', 'AccountService',
    ($scope: any, $document: any, $log: any, $uibModal: any, AccountService: any): void => {

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
            AccountService.Query((result: any): void => {
                if (result) {
                    $scope.accounts = result;
                }
            }, error_handler);
        };

        let Count = (): void => {
            AccountService.Count((result: any): void => {
                if (result) {
                    $scope.count = result;
                }
            }, error_handler);
        };

        let Next = () => {
            progress(true);
            AccountService.Next((result) => {
                if (result) {
                    $scope.accounts = result;
                }
                progress(false);
            }, error_handler);
        };

        let Prev = () => {
            progress(true);
            AccountService.Prev((result) => {
                if (result) {
                    $scope.accounts = result;
                }
                progress(false);
            }, error_handler);
        };

        let Find = (name) => {
            if (name) {
                AccountService.query = {username: {$regex: name}};
            }
            Draw();
            Count();
        };

        let Open = (acount: any): void => {
            let modalRegist: any = $uibModal.open({
                controller: 'AccountOpenDialogController',
                templateUrl: '/accounts/dialogs/open_dialog',
                resolve: {
                    items: acount
                }
            });

            modalRegist.result.then((group: any): void => {
                $scope.layout = group;
                $scope.name = group.name;
                $scope.opened = true;
            }, (): void => {
            });

        };

        $scope.Next = Next;
        $scope.Prev = Prev;
        $scope.Count = Count;
        $scope.Find = Find;
        $scope.Open = Open;

        Find(null);

    }]);


AccountControllers.controller('AccountOpenDialogController', ['$scope', '$uibModalInstance', 'items',
    ($scope: any, $uibModalInstance: any, items: any): void => {

        $scope.items = items;

        $scope.hide = (): void => {
            $uibModalInstance.close();
        };

        $scope.cancel = (): void => {
            $uibModalInstance.dismiss();
        };

    }]);
