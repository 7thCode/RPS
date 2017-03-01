/**!
 Copyright (c) 2016 Naoma Matsumoto.
 */

"use strict";

namespace Rewriting {

    let RewritingControllers: angular.IModule = angular.module('RewritingControllers', []);

    RewritingControllers.factory('RewritingQuery', ['$resource',
        ($resource): angular.resource.IResource<any> => {
            return $resource('/rewriting/query/:query', {}, {
                query: {method: 'GET'}
            });
        }]);

    RewritingControllers.factory('MetadataUpdate', ['$resource',
        ($resource): angular.resource.IResource<any> => {
            return $resource('/rewriting/update', {}, {
                update: {method: 'PUT'}
            });
        }]);

    RewritingControllers.factory('RewritingInit', ['$resource',
        ($resource): angular.resource.IResource<any> => {
            return $resource('rewriting/init', {}, {
                update: {method: 'GET'}
            });
        }]);

    RewritingControllers.controller('RewritingController', ['$scope', '$q', 'MetadataUpdate', 'CollectionService', 'RewritingQuery', 'RewritingInit',
        ($scope: any, $q, MetadataUpdate: any, CollectionService: any, RewritingQuery: any, RewritingInit: any): void => {

            let path = '';
            $scope.title = [];
            $scope.discription = [];


            let init = () => {
                CollectionService.List(RewritingInit, path, {}, (objects: any): void => {
                    $scope.objects = objects;
                    $scope.title = '';
                    $scope.discription = "";
                }, (e) => {
                });
            };


            let query = (path) => {
                CollectionService.List(RewritingQuery, path, {}, (objects: any): void => {
                    $scope.objects = objects;
                    let title = [];
                    let discription = [];
                    _.forEach(objects, (object) => {
                        title.push(object.contents.title);
                        discription.push(object.contents.discription);
                    });
                    $scope.title = title;
                    $scope.discription = discription;
                    //$scope.file_names = JSON.parse(data.file);
                    //finePathMatch();
                }, (e) => {
                });
            };

            $scope.chencge_path = (url) => {
                console.log(url);
                query(url + '');

            };

            $scope.register = () => {
                let title2 = $scope.data;

                let title = $scope.title;
                let discription = $scope.discription;

                let item = new MetadataUpdate();
                item.title = $scope.title;
                item.discription = discription;
                item.$update((data): void => {
                    if (data == 0) {
                        let a = 1;
                    }
                });
            };

            if (path) {
                query(path);
            } else {
                query('/');
            }
            init();

        }]);

}