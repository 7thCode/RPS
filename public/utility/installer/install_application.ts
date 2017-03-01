/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";
//import forEach = require("lodash/forEach");

let BackOfficeApplication: any = angular.module('InstallApplication', [
    'ngMessages', "ngResource", 'ui.bootstrap',//'angular-loading-bar',

    "Services",
    'InstallControllers',
    "InstallServices"
]);

BackOfficeApplication.run(['$rootScope',
    function ($rootScope) {
        $rootScope.$on("$routeChangeSuccess", (event: any, current: any, previous: any, rejection: any): void => {

        });
    }
]);

BackOfficeApplication.config(['$compileProvider', '$httpProvider',
    ($compileProvider: any, $httpProvider: any): void => {
        $compileProvider.debugInfoEnabled(false);
        $httpProvider.defaults.headers.common = {'x-requested-with': 'XMLHttpRequest'};
        $httpProvider.defaults.headers.common['If-Modified-Since'] = 'Thu, 01 Jun 1970 00:00:00 GMT'; //マイクロソフトのバグ対応！！！
    }]);
