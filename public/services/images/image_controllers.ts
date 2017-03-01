/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

/**
 0 - ok
 1 - rights
 2 - auth
 3 - user already found
 10 - db
 20 - session
 100 - auth

 Init
 Accepted
 Done

 */

"use strict";

let ImageControllers: angular.IModule = angular.module('ImageControllers', ["ngResource", 'ngMessages', 'flow']);

/*! Controllers  */

ImageControllers.controller('ImageController', ['$scope', '$q', '$document', '$uibModal', '$log', 'FileService',
    ($scope: any, $q: any, $document: any, $uibModal: any, $log: any, FileService: any): void => {

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

        $document.on('drop dragover', (e) => {
            e.stopPropagation();
            e.preventDefault();
        });

        let to_mime: (filename: string) => string = (filename: string): string => {
            let mime: string = "";
            let nameparts: string[] = filename.split(".");
            if (nameparts.length == 2) {
                let filetype = nameparts[1].toLowerCase();
                switch (filetype) {
                    case "txt":
                        mime = "text/plain";
                        break;
                    case "htm":
                    case "html":
                        mime = "text/html";
                        break;
                    case "xml":
                        mime = "text/xml";
                        break;
                    case "js":
                        mime = "text/javascript";
                        break;
                    case "vbs":
                        mime = "text/vbscript";
                        break;
                    case "css":
                        mime = "text/css";
                        break;
                    case "gif":
                        mime = "image/gif";
                        break;
                    case "jpg":
                    case "jpeg":
                        mime = "image/jpeg";
                        break;
                    case "png":
                        mime = "image/png";
                        break;
                    case "doc":
                        mime = "application/msword";
                        break;
                    case "pdf":
                        mime = "application/pdf";
                        break;
                }
            }
            return mime;
        };

        let Type = (mimetype): string => {
            let result = "";
            let nameparts: string[] = mimetype.split("/");
            if (nameparts.length == 2) {
                result = nameparts[0].toLowerCase();
            }
            return result;
        };

        let Draw = () => {
            FileService.Query((result: any) => {
                if (result) {
                    $scope.files = result;
                }
            }, error_handler);
        };

        let Count = (): void => {
            FileService.Count((result: any): void => {
                if (result) {
                    $scope.count = result;
                }
            }, error_handler);
        };

        let Next = () => {
            progress(true);
            FileService.Next((result) => {
                if (result) {
                    $scope.files = result;
                }
                progress(false);
            }, error_handler);
        };

        let Prev = () => {
            progress(true);
            FileService.Prev((result) => {
                if (result) {
                    $scope.files = result;
                }
                progress(false);
            }, error_handler);
        };

        let createImage = (files: any): void => {
            progress(true);
            let promises = [];
            _.forEach(files, (local_file) => {
                let deferred = $q.defer();
                let fileReader: any = new FileReader();
                fileReader.onload = (event: any): void => {
                    FileService.Create(event.target.result, local_file.name, 1000, (result: any) => {
                        deferred.resolve(true);
                    }, (code: number, message: string) => {
                        deferred.reject(false);
                    });
                };

                fileReader.readAsDataURL(local_file.file);
                promises.push(deferred.promise);
            });

            $q.all(promises).then(function (result) {
                progress(false);
                Draw();
            }).finally(() => {
            });
        };

        let showImage = (url: any): void => {
            let modalInstance: any = $uibModal.open({
                controller: 'ImageShowDialogController',
                templateUrl: '/images/dialogs/image_show_dialog',
                resolve: {
                    items: (): any => {
                        return url;
                    }
                }
            });

            modalInstance.result.then((answer: any): void => { // Answer
            }, (): void => { // Error
            });
        };

        let deleteImage = (filename: any): void => {

            let modalInstance = $uibModal.open({
                controller: 'FileDeleteDialogController',
                templateUrl: '/files/dialogs/file_delete_dialog',
            });

            modalInstance.result.then((answer: any): void => { // Answer
                FileService.Delete(filename, 1000, (result: any) => {
                    Draw();
                }, error_handler);
            }, (): void => { // Error
            });
        };

        FileService.query = {"metadata.key": {$gte: 1000}};
        let Find = (name: string): void => {
            if (!name) {
                name = "";
            }
            FileService.query = {$and: [{"metadata.key": {$gte: 1000}}, {filename: {$regex: name}}]};
            Draw();
        };

        $scope.Type = Type;
        $scope.Next = Next;
        $scope.Prev = Prev;
        $scope.createImage = createImage;
        $scope.showImage = showImage;
        $scope.deleteImage = deleteImage;
        $scope.Find = Find;

        Draw();
    }]);

ImageControllers.controller('ImageShowDialogController', ['$scope', '$uibModalInstance', 'items',
    ($scope: any, $uibModalInstance: any, items: any): void => {

        $scope.image = items;

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

ImageControllers.controller('ImageDeleteDialogController', ['$scope', '$uibModalInstance',
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