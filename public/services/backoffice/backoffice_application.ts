/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";
//import forEach = require("lodash/forEach");

let BackOfficeApplication: any = angular.module('BackOfficeApplication', [
    'ngMessages', "ngResource", 'ui.bootstrap', 'angular.chips', 'ui.ace', 'ngDraggable', 'angular-loading-bar',

    "Services",
    "TemplateServices",
    "LayoutServices",
    "LayoutsProviders",
    'ImageControllers',
    'BuilderControllers',
    'PlayerControllers',
    "BackOfficeControllers",
    'FileServices',
    'FileControllers',
    "RewritingControllers",
    "AuthServices",
    'AuthControllers',
    "ResourcesProviders",
    "ResourceBuilderServices",
    'ResourceBuilderControllers',
    'ResourcePlayerServices',
    'ResourcePlayerControllers',
    "GroupControllers",
    "GroupServices",
    "FormsProviders",
    "FormBuilderServices",
    'FormBuilderControllers',
    'FormPlayerServices',
    'FormPlayerControllers',
    'AccountServices',
    'AccountControllers',
    'AnalysisServices',
    'AnalysisControllers',
    'ArticleServices',
    'ArticleControllers',
    'ProfileControllers',
    'SettingControllers',
    "SettingServices",
    "GoogleServices",
    "YahooServices",
    "PublicKeyServices"
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


BackOfficeApplication.config(['cfpLoadingBarProvider', function (cfpLoadingBarProvider) {
    cfpLoadingBarProvider.parentSelector = '#body';
    cfpLoadingBarProvider.spinnerTemplate = '<div style="z-index:20000;position:fixed;top:50%;left:50%;margin-top:-70px;margin-left:-75px;"><div id="progress"><div id="rond"><div id="test"></div></div><div id="load"></div></div></div>';
    cfpLoadingBarProvider.latencyThreshold = 500;
}]);

BackOfficeApplication.config(['ShapeEditProvider', function (ShapeEditProvider: any): void {
    ShapeEditProvider.configure({
        wrapper: 'wrapper',
        canvas: 'canvas',
        width: 600,
        height: 600
    });
}]);

BackOfficeApplication.config(['$sceDelegateProvider', function ($sceDelegateProvider: any): void {
    $sceDelegateProvider.resourceUrlWhitelist(['**']);
}]);

BackOfficeApplication.filter('limit', [(): any => {
    return (text: string, limit: number): string => {
        let result = "";
        if (text) {
            result = text;
            if (text.length > limit) {
                result = text.slice(0, limit) + "...";
            }
        }
        return result;
    };
}]);
