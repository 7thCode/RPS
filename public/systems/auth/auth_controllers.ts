/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

/// <reference path="../common/notify/notify.ts" />

"use strict";

let AuthControllers: angular.IModule = angular.module('AuthControllers', ["ngResource", 'ngMessages', 'ngAnimate']);

AuthControllers.controller('LoginController', ["$scope", "$rootScope", "$document", "$window", "$uibModal", '$log', 'AuthService', 'ProfileService', 'PublicKeyService',
    ($scope: any, $rootScope: any, $document: any, $window: any, $uibModal: any, $log: any, AuthService: any, ProfileService: any, PublicKeyService): void => {

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

        let confirmAccount = () => {
            let modalRegistConfirm = $uibModal.open({
                controller: 'RegisterConfirmDialogController',
                templateUrl: '/auth/dialogs/registerconfirmdialog',
                backdrop: "static",
                targetEvent: null
            });

            modalRegistConfirm.result.then((): void => {
            }, (): void => {
            });
        };

        let confirmMember = () => {
            let modalRegistConfirm = $uibModal.open({
                controller: 'MemberConfirmDialogController',
                templateUrl: '/auth/dialogs/memberconfirmdialog',
                backdrop: "static",
                targetEvent: null
            });

            modalRegistConfirm.result.then((): void => {
            }, (): void => {
            });
        };

        $scope.about = true;

        ProfileService.Get((self) => {
            if (self) {
                $scope.userid = self.userid;
            }
        }, error_handler);

        $scope.showRegisterDialog = (items): void => {
            let modalRegist = $uibModal.open({
                controller: 'RegisterDialogController',
                templateUrl: '/auth/dialogs/registerdialog',
                backdrop: "static",
                resolve: {
                    items: (): any => {
                        return items;
                    }
                }
            });

            modalRegist.result.then((): void => {
                confirmAccount();
            }, (): void => {
            });
        };

        $scope.Regist = (items: any): void => {
            $scope.message = "";
            progress(true);
            AuthService.Regist($scope.items.username, $scope.items.password, $scope.items.displayName, items, (account) => {
                confirmAccount();
                progress(false);
            }, (error, message) => {
                $scope.message = message;
                progress(false);
            });
        };

        $scope.showMemberDialog = (): void => {
            let modalRegist = $uibModal.open({
                controller: 'MemberDialogController',
                templateUrl: '/auth/dialogs/memberdialog',
                backdrop: "static",
                resolve: {
                    items: (): any => {
                        return $scope.items;
                    }
                }
            });

            modalRegist.result.then((): void => {
                confirmMember();
            }, (): void => {
            });
        };

        $scope.showLoginDialog = (): void => {
            let modalInstance = $uibModal.open({
                controller: 'LoginDialogController',
                templateUrl: '/auth/dialogs/logindialog',
                backdrop: "static",
                targetEvent: null
            });

            modalInstance.result.then((member): void => { // Answer
                $rootScope.$broadcast('Login');
            }, (): void => { // Error
            });
        };

        $scope.showPasswordDialog = (): void => {
            let modalInstance = $uibModal.open({
                controller: 'PasswordDialogController',
                templateUrl: '/auth/dialogs/passworddialog',
                backdrop: false,
                targetEvent: null
            });

            modalInstance.result.then((): void => {
                let modalRegistConfirm = $uibModal.open({
                    controller: 'PasswordConfirmDialogController',
                    templateUrl: '/auth/dialogs/passwordconfirmdialog',
                    backdrop: "static",
                    targetEvent: null
                });

                modalRegistConfirm.result.then((): void => {
                }, (): void => {
                });

            }, (): void => {
            });
        };

        $scope.Logout = (): void => {
            AuthService.Logout((account) => {
                $rootScope.$broadcast('Logout');
            });
        };

        $scope.go = (ref: string): void => {
            $window.location.href = ref;
        };

        $scope.$on('Login', (): void => {
            $window.location.href = "//" + $window.location.host + "/";
        });

        $scope.$on('Logout', (): void => {
            $window.location.href = "//" + $window.location.host + "/";
        });

    }]);

//! dialogs

/**
 * ログインダイアログ
 * @param target  Comment for parameter ´target´.
 * @returns       Comment for return value.
 */

AuthControllers.controller('LoginDialogController', ['$scope', '$window', '$uibModalInstance', 'AuthService',
    ($scope: any, $window: any, $uibModalInstance: any, AuthService: any): void => {

        let progress = (value) => {
            $scope.$emit('progress', value);
        };

        $scope.$on('progress', (event, value) => {
            $scope.progress = value;
        });

        $scope.hide = (): void => {
            $uibModalInstance.close();
        };

        $scope.cancel = (): void => {
            $uibModalInstance.dismiss();
        };

        $scope.go = (ref: string): void => {
            $window.location.href = ref;
        };

        $scope.answer = (items: any): void => {
            $scope.message = "";
            progress(true);
            AuthService.Login($scope.items.username, $scope.items.password, (account) => {
                $uibModalInstance.close(account);
                progress(false);
            }, (error, message) => {
                $scope.message = message;
                progress(false);
            });
        };
    }]);

/**
 * レジスターダイアログ
 * @param target  Comment for parameter ´target´.
 * @returns       Comment for return value.
 */
AuthControllers.controller('RegisterDialogController', ['$scope', '$uibModalInstance', 'AuthService','items',
    ($scope: any, $uibModalInstance: any, AuthService: any, items): void => {

        let progress = (value) => {
            $scope.$emit('progress', value);
        };

        $scope.$on('progress', (event, value) => {
            $scope.progress = value;
        });

        $scope.hide = (): void => {
            $uibModalInstance.close();
        };

        $scope.cancel = (): void => {
            $uibModalInstance.dismiss();
        };

        $scope.answer = (scope: any): void => {
            $scope.message = "";
            progress(true);
            AuthService.Regist($scope.items.username, $scope.items.password, $scope.items.displayName, items, (account) => {
                $uibModalInstance.close(account);
                progress(false);
            }, (error, message) => {
                $scope.message = message;
                progress(false);
            });
        };
    }]);

AuthControllers.controller('RegisterConfirmDialogController', ['$scope', '$uibModalInstance',
    ($scope: any, $uibModalInstance: any): void => {

        $scope.hide = (): void => {
            $uibModalInstance.close();
        };

        $scope.cancel = (): void => {
            $uibModalInstance.dismiss();
        };

        $scope.answer = (answer): void => {
            $uibModalInstance.close($scope);
        };

    }]);

AuthControllers.controller('MemberDialogController', ['$scope', '$uibModalInstance', 'AuthService',
    ($scope: any, $uibModalInstance: any, AuthService: any): void => {

        let progress = (value) => {
            $scope.$emit('progress', value);
        };

        $scope.$on('progress', (event, value) => {
            $scope.progress = value;
        });

        $scope.hide = (): void => {
            $uibModalInstance.close();
        };

        $scope.cancel = (): void => {
            $uibModalInstance.dismiss();
        };

        $scope.answer = (items: any): void => {
            $scope.message = "";
            progress(true);
            AuthService.Member($scope.items.username, $scope.items.password, $scope.items.displayName, items, (account) => {
                $uibModalInstance.close(account);
                progress(false);
            }, (error, message) => {
                $scope.message = message;
                progress(false);
            });

        };
    }]);

AuthControllers.controller('MemberConfirmDialogController', ['$scope', '$uibModalInstance',
    ($scope: any, $uibModalInstance: any): void => {

        $scope.hide = (): void => {
            $uibModalInstance.close();
        };

        $scope.cancel = (): void => {
            $uibModalInstance.dismiss();
        };

        $scope.answer = (answer): void => {
            $uibModalInstance.close($scope);
        };

    }]);

/**
 * パスワード変更ダイアログ
 * @param target  Comment for parameter ´target´.
 * @returns       Comment for return value.
 */

AuthControllers.controller('PasswordDialogController', ['$scope', '$uibModalInstance', 'AuthService',
    ($scope: any, $uibModalInstance: any, AuthService: any): void => {

        let progress = (value) => {
            $scope.$emit('progress', value);
        };

        $scope.hide = (): void => {
            $uibModalInstance.close();
        };

        $scope.cancel = (): void => {
            $uibModalInstance.dismiss();
        };

        $scope.answer = (answer: any): void => {
            AuthService.Password($scope.items.username, $scope.items.password, (account) => {
                $uibModalInstance.close(account);
                progress(false);
            }, (error, message) => {
                $scope.message = message;
                progress(false);
            });
        };

    }]);

AuthControllers.controller('PasswordConfirmDialogController', ['$scope', '$uibModalInstance',
    ($scope: any, $uibModalInstance: any): void => {

        $scope.hide = (): void => {
            $uibModalInstance.close();
        };

        $scope.cancel = (): void => {
            $uibModalInstance.dismiss();
        };

        $scope.answer = (answer: any): void => {
            $uibModalInstance.close($scope);
        };

    }]);
