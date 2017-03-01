/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

let ProfileControllers: angular.IModule = angular.module('ProfileControllers', ['ui.bootstrap', 'flow']);

//Self

ProfileControllers.controller('ProfileController', ['$scope','$document', '$log', "ProfileService", 'SessionService', 'FileService',
    ($scope: any,$document:any, $log: any, ProfileService: any, SessionService: any, FileService): void => {

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

        $scope.opened = false;

        $scope.Save = (): void => {
            ProfileService.Put({}, (result: any): void => {
            }, error_handler);
        };

        $scope.CreateProfilePicture = (files: any): void => {

            progress(true);
            let local_file = files[0];
            let fileReader: any = new FileReader();
            let image: any = new Image();
            image.crossOrigin = 'Anonymous';
            $scope.userid = "";     // $scope trick for redraw

            fileReader.onload = (event: any): void => {
                let uri: any = event.target.result;
                image.src = uri;
                image.onload = (): void => {
                    ProfileService.Get((self: any): void => {
                        if (self) {
                            FileService.Delete(self.username, 1999, (result: any) => {
                                    FileService.Create(event.target.result, self.username, 1999, (result: any) => {
                                        ProfileService.Get((self: any): void => {
                                            if (self) {
                                                $scope.$evalAsync(      // $apply
                                                    ($scope: any): void => {
                                                        $scope.userid = self.userid; // $scope trick for redraw
                                                        progress(false);
                                                    }
                                                );
                                            }
                                        }, error_handler);
                                    }, error_handler);
                                },
                                FileService.Create(event.target.result, self.username, 1999, (result: any) => {
                                    ProfileService.Get((self: any): void => {
                                        if (self) {
                                            $scope.$evalAsync(      // $apply
                                                ($scope: any): void => {
                                                    $scope.userid = self.userid; // $scope trick for redraw
                                                    progress(false);
                                                }
                                            );
                                        }
                                    }, error_handler);
                                }, error_handler)
                            );
                        }
                    }, error_handler);
                };
            };
            fileReader.readAsDataURL(local_file.file);
        };

        ProfileService.Get((self: any): void => {
            if (self) {
                $scope.userid = self.userid;
                $scope.provider = self.provider;
                $scope.type = self.type;
                $scope.username = self.username;
                $scope.opened = true;
            }
        }, error_handler);

        // Guidance
        /*
         let session_data: any = {guidance: {self: {step: 0}}};

         $scope.next = (): void => {
         $scope.step++;
         session_data.guidance.self.step = $scope.step;
         SessionService.Put(session_data, (data: any): void => {
         if (data) {
         session_data = data;
         }
         }, error_handler);
         };

         $scope.prev = (): void => {
         $scope.step--;
         session_data.guidance.self.step = $scope.step;
         SessionService.Put(session_data, (data: any): void => {
         if (data) {
         session_data = data;
         }
         }, error_handler);
         };

         $scope.to = (step: number): void => {
         $scope.step = step;
         session_data.guidance.self.step = $scope.step;
         SessionService.Put(session_data, (data: any): void => {
         if (data) {
         session_data = data;
         }
         }, error_handler);
         };

         SessionService.Get((data: any): void => {
         if (data) {
         session_data = data;
         if (!session_data.guidance.self) {
         session_data.guidance = {self: {step: 0}};
         }
         $scope.step = session_data.guidance.self.step;
         }
         }, error_handler);

         $scope.scenario = [
         {
         outer: {
         top: -210, left: 80, width: 400, height: 400,
         background: "/applications/img/balloon/right.svg",
         target: "profile"
         },
         inner: {
         top: 0, left: 100, width: 300, height: 350,
         content: "<h3>プロファイル画像</h3>" +
         "<br>" +
         "<p>プロファイル画像をドロップしてください</p>" +
         "<button class='btn btn-warning' type='button' ng-click='next();' aria-label=''>次へ</button>"
         },
         _class: "tada",
         style: "animation-duration:1s;animation-delay:0.3s;"
         },
         {
         outer: {
         top: -250, left: 360, width: 500, height: 500,
         background: "/applications/img/balloon/right.svg",
         target: "nickname"
         },
         inner: {
         top: 50, left: 150, width: 300, height: 300,
         content: "<h3>ニックネーム</h3>" +
         "<br>" +
         "<p>ニックネームを入力してください</p>" +
         "<button class='btn btn-info' type='button' ng-click='next();' aria-label=''>次へ</button>"
         },
         _class: "shake",
         style: "animation-duration:1s;animation-delay:0.3s;"
         },
         {
         outer: {
         top: -120, left: -470, width: 500, height: 500,
         background: "/applications/img/balloon/left.svg",
         target: "address"
         },
         inner: {
         top: 30, left: 0, width: 300, height: 300,
         content: "<h3>アドレス</h3>" +
         "<br>" +
         "<p class='text-center'>アドレスを入力してください</p>" +
         "<img class='img-responsive center-block' src='http://localhost:8000/files/api/000000000000000000000000/profile'/>" +
         "<div class='text-center'>" +
         "<button class='btn btn-success' style='margin:5px' type='button' ng-click='next();' aria-label=''>次へ</button>" +
         "</div>"
         },
         _class: "zoomIn",
         style: "animation-duration:1s;"
         },
         {
         outer: {
         top: 40, left: 30, width: 400, height: 400,
         background: "/applications/img/balloon/bottom.svg",
         target: "category"
         },
         inner: {
         top: 100, left: 10, width: 300, height: 300,
         content: "<h3>カテゴリー</h3>" +
         "<br>" +
         "<p class='text-center'>カテゴリーを入力してください</p>" +
         "<button class='btn btn-warning' type='button' ng-click='next()', aria-label=''>次へ</button>"
         },
         _class: "jello",
         style: "animation-duration:1s;"
         },
         {
         outer: {
         top: -400, left: -160, width: 400, height: 400,
         background: "/applications/img/balloon/top.svg",
         target: "group"
         },
         inner: {
         top: 20, left: 20, width: 300, height: 300,
         content: "<h3>グループ</h3>" +
         "<br>" +
         "<p class='text-center'>グループを入力してください</p>" +
         "<button class='btn btn-warning' type='button' ng-click='next();' aria-label=''>次へ</button>"
         },
         _class: "rubberBand",
         style: "animation-duration:1s;"
         },
         {
         outer: {
         top: 10, left: 100, width: 500, height: 500,
         background: "/applications/img/balloon/bottom.svg",
         target: "mails"
         },
         inner: {
         top: 150, left: 20, width: 300, height: 300,
         content: "<h3>メール</h3>" +
         "<br>" +
         "<p class='text-center'>メールを入力してください</p>" +
         "<button class='btn btn-primary' type='button' ng-click='next();' aria-label=''>次へ</button>"
         },
         _class: "shake",
         style: "animation-duration:1s;"
         },
         {
         outer: {
         top: -170, left: 115, width: 400, height: 400,
         background: "/applications/img/balloon/right.svg",
         target: "save"
         },
         inner: {
         top: 10, left: 160, width: 300, height: 300,
         content: "<h3>保存</h3>" +
         "<br>" +
         "<button class='btn btn-danger' type='button' ng-click='to(-1);' aria-label=''>おわり</button>"
         },
         _class: "bounceInDown",
         style: "animation-duration:2s;"
         }
         ];
         */

    }]);

ProfileControllers.controller('ProfileUpdateDialogController', ['$scope', '$uibModalInstance', 'items', 'ZipService',
    ($scope: any, $uibModalInstance: any, items: any, ZipService: any): void => {

        let progress = (value) => {
            $scope.$emit('progress', value);
        };

        $scope.$on('progress', (event, value) => {
            $scope.progress = value;
        });

        $scope.magazine = true;

        $scope.Zip = (zip:any):void => {
            if (zip) {
                if (zip.length > 6) {
                    progress(true);
                    ZipService.Zip(zip, (error: any, result: any): void => {
                        if (!error) {
                            if (result) {
                                if (result.results) {
                                    if (result.results.length > 0) {
                                        let address = result.results[0];
                                        $scope.address = address.address1;
                                        $scope.city = address.address2;
                                        $scope.street = address.address3;
                                    }
                                }
                            }
                        }
                        progress(false);
                    });
                } else {
                    $scope.address = "";
                    $scope.city = "";
                    $scope.street = "";
                }
            }
        };

        $scope.hide = (): void => {
            $uibModalInstance.close();
        };

        $scope.cancel = (): void => {
            $uibModalInstance.dismiss();
        };

        $scope.answer = (): void => {
            $uibModalInstance.close($scope);
        };

    }]);
