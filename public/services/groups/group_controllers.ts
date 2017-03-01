/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

let GroupControllers: angular.IModule = angular.module('GroupControllers', ["ngResource"]);

GroupControllers.controller('GroupController', ['$scope','$document', '$log', "$uibModal", 'GroupService',
    ($scope: any,$document:any, $log: any, $uibModal: any, GroupService: any): void => {

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
            GroupService.Query((data) => {
                $scope.groups = data;
            }, error_handler);
        };

        let Count: () => void = (): void => {
            GroupService.Count((result: any): void => {
                if (result) {
                    $scope.count = result;
                }
            }, error_handler);
        };

        let Own = (): void => {
            let modalRegist: any = $uibModal.open({
                controller: 'GroupOwnDialogController',
                templateUrl: '/groups/dialogs/create_dialog',
                resolve: {
                    items: $scope
                }
            });

            modalRegist.result.then((group: any): void => {
                $scope.layout = group;
                $scope.name = group.name;
                $scope.opened = true;
                Draw();
            }, (): void => {
            });

        };

        let Create = (): void => {
            let modalRegist: any = $uibModal.open({
                controller: 'GroupCreateDialogController',
                templateUrl: '/groups/dialogs/create_dialog',
                resolve: {
                    items: $scope
                }
            });

            modalRegist.result.then((group: any): void => {
                $scope.layout = group;
                $scope.name = group.name;
                $scope.opened = true;
                Draw();
            }, (): void => {
            });

        };

        let Open = (group: any): void => {
            let modalRegist: any = $uibModal.open({
                controller: 'GroupOpenDialogController',
                templateUrl: '/groups/dialogs/open_dialog',
                resolve: {
                    items: group
                }
            });

            modalRegist.result.then((group: any): void => {
                $scope.layout = group;
                $scope.name = group.name;
                $scope.opened = true;
            }, (): void => {
            });

        };

        let Delete = (group: any): void => {
            let modalRegist: any = $uibModal.open({
                controller: 'GroupDeleteConfirmController',
                templateUrl: '/groups/dialogs/delete_confirm_dialog',
                resolve: {
                    items: group
                }
            });

            modalRegist.result.then((content: any): void => {
                $scope.name = "";
                $scope.opened = false;
                Draw();
            }, (): void => {
            });

        };

        let Next = ():void => {
            progress(true);
            GroupService.Next((result) => {
                if (result) {
                    $scope.groups = result;
                }
                progress(false);
            }, error_handler);
        };

        let Prev = ():void => {
            progress(true);
            GroupService.Prev((result) => {
                if (result) {
                    $scope.groups = result;
                }
                progress(false);
            }, error_handler);
        };

        let Find = (name:string):void => {
            GroupService.query = {};
            if (name) {
                GroupService.query = {name: {$regex: name}};
            }
            Draw();
        };

        $scope.Own = Own;
        $scope.Create = Create;
        $scope.Open = Open;
        $scope.Delete = Delete;
        $scope.Next = Next;
        $scope.Prev = Prev;
        $scope.Find = Find;

        Draw();

    }]);

GroupControllers.controller('GroupOwnDialogController', ['$scope', '$log', '$uibModalInstance', 'GroupService', 'items',
    ($scope: any, $log: any, $uibModalInstance: any, GroupService: any, items: any): void => {

        let progress = (value) => {
            $scope.$emit('progress', value);
        };

        $scope.$on('progress', (event, value) => {
            items.progress = value;
        });

        let error_handler: (code: number, message: string) => void = (code: number, message: string): void => {
            progress(false);
            $scope.message = message;
            $log.error(message);
        };

        $scope.hide = (): void => {
            $uibModalInstance.close();
        };

        $scope.cancel = (): void => {
            $uibModalInstance.dismiss();
        };

        $scope.answer = (): void => {
            progress(true);
            GroupService.Own($scope.title, $scope.content, (result: any): void => {
                progress(false);
                $scope.title = result.name;
                $scope.message = "";
                $uibModalInstance.close(result);
            }, error_handler);

        };

    }]);


GroupControllers.controller('GroupCreateDialogController', ['$scope', '$log', '$uibModalInstance', 'GroupService', 'items',
    ($scope: any, $log: any, $uibModalInstance: any, GroupService: any, items: any): void => {

        let progress = (value) => {
            $scope.$emit('progress', value);
        };

        $scope.$on('progress', (event, value) => {
            items.progress = value;
        });

        let error_handler: (code: number, message: string) => void = (code: number, message: string): void => {
            progress(false);
            $scope.message = message;
            $log.error(message);
        };

        $scope.hide = (): void => {
            $uibModalInstance.close();
        };

        $scope.cancel = (): void => {
            $uibModalInstance.dismiss();
        };

        $scope.answer = (): void => {
            progress(true);
            GroupService.Create($scope.title, $scope.content, (result: any): void => {
                progress(false);
                $scope.title = result.name;
                $scope.message = "";
                $uibModalInstance.close(result);
            }, error_handler);

        };

    }]);

GroupControllers.controller('GroupOpenDialogController', ['$scope', '$log', '$uibModalInstance', 'GroupService', 'items',
    ($scope: any, $log: any, $uibModalInstance: any, GroupService: any, items: any): void => {

        let progress = (value) => {
            $scope.$emit('progress', value);
        };

        $scope.$on('progress', (event, value) => {
      //      items.progress = value;
        });

        let error_handler: (code: number, message: string) => void = (code: number, message: string): void => {
            progress(false);
            $scope.message = message;
            $log.error(message);
        };

        $scope.hide = (): void => {
            $uibModalInstance.close();
        };

        $scope.cancel = (): void => {
            $uibModalInstance.dismiss();
        };

        progress(true);
        GroupService.Get(items._id, (result: any): void => {
            $scope.message = "";
            progress(false);
            $scope.title = result.name;
        }, error_handler);

        $scope.answer = (): void => {
            progress(true);
            GroupService.Put(items._id, {}, (result: any): void => {
                $scope.message = "";
                progress(false);
                $uibModalInstance.close(result);
            }, error_handler);
        };
    }]);

GroupControllers.controller('GroupDeleteConfirmController', ['$scope', '$log', '$uibModalInstance', 'GroupService', 'items',
    ($scope: any, $log: any, $uibModalInstance: any, GroupService: any, items: any): void => {

        let progress = (value) => {
            $scope.$emit('progress', value);
        };

        $scope.$on('progress', (event, value) => {
      //      items.progress = value;
        });

        let error_handler: (code: number, message: string) => void = (code: number, message: string): void => {
            progress(false);
            $scope.message = message;
            $log.error(message);
        };

        $scope.title = items.name;

        $scope.hide = (): void => {
            $uibModalInstance.close();
        };

        $scope.cancel = (): void => {
            $uibModalInstance.dismiss();
        };

        $scope.answer = (): void => {
            progress(true);
            GroupService.Delete(items._id, (result: any): void => {
                progress(false);
                $uibModalInstance.close({});
            }, error_handler);
        };

    }]);