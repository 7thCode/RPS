/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

let FormPlayerControllers: angular.IModule = angular.module('FormPlayerControllers', []);

FormPlayerControllers.controller('FormPlayerController', ["$scope","$document", "$log", "$compile", "$uibModal", "FormPlayerService", "ArticleService",
    function ($scope: any,$document:any, $log: any, $compile: any, $uibModal: any, FormPlayerService: any, ArticleService: any): void {

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


        let page_no = 0;

        let pages = [
            {
                contents: []
            }
        ];

        let current_id = null;

        let Init = () => {
            $scope.opened = false;
             page_no = 0;
             pages = [{contents: []}];
        };

        let Open = (): void => {
            Init();
            let modalRegist: any = $uibModal.open({
                controller: 'FormPlayerOpenDialogController',
                templateUrl: '/forms/dialogs/open_dialog',
                resolve: {
                    items: (): any => {
                    }
                }
            });

            modalRegist.result.then((layout: any): void => {
                $scope.name = layout.name;
                FormPlayerService.current_page = layout.content;
                FormPlayerService.Draw();
                $scope.opened = true;
            }, (): void => {
            });

        };

        let Draw = () => {
            FormPlayerService.current_page = pages[page_no].contents;
            FormPlayerService.Draw();
        };

        let Clear = (): void => {
            let page = FormPlayerService.current_page;
            _.forEach(page, (control): void => {
                _.forEach(control.elements, (element: any): void => {
                    let attributes = element.attributes;
                    if (attributes["ng-model"]) {
                        let name = attributes["ng-model"];
                        $scope[name] = "";
                    }
                })
            });
            Draw();
        };

        let Map = (result: any): void => {
            let page = FormPlayerService.current_page;
            _.forEach(page, (control): void => {
                _.forEach(control.elements, (element: any): void => {
                    let attributes = element.attributes;
                    if (attributes["ng-model"]) {
                        let name = attributes["ng-model"];
                        $scope[name] = result[element.label];

                    }
                })
            });
            Draw();
        };

        let Reduce = (result) => {
            let page = FormPlayerService.current_page;
            _.forEach(page, (control): void => {
                _.forEach(control.elements, (element: any): void => {
                    let attributes = element.attributes;
                    if (attributes["ng-model"]) {
                        let name = attributes["ng-model"];
                        if ($scope[name]) {
                            result[element.label] = $scope[name];
                        }
                    }
                })
            });
            return result;
        };

        let CreateArticle = (): void => {

            let modalRegist: any = $uibModal.open({
                controller: 'FormPlayerCreateDialogController',
                templateUrl: '/forms/dialogs/create_dialog',
                resolve: {
                    items: null
                }
            });

            modalRegist.result.then((dialog_scope: any): void => {
                progress(true);
                let name = dialog_scope.title;
                ArticleService.Create(name, {}, (result: any): void => {
                    current_id = result._id;
                    progress(false);
                }, error_handler);
            }, (): void => {
            });
        };

        let LoadArticle = (id): void => {
            progress(true);
            ArticleService.Get(id, (result: any): void => {
                $scope.current_article = result;
                current_id = id;
                if (result.content) {
                    Map(result.content);
                }
                $scope.opened = true;
                progress(false);
            }, error_handler);

        };

        let SaveArticle = (): void => {

            progress(true);
            let new_record = Reduce({});
            ArticleService.Put(current_id, new_record, (result: any): void => {
                progress(false);
            }, error_handler);

        };

        $scope.opened = false;

        $scope.Open = Open;
        $scope.CreateArticle = CreateArticle;
        $scope.LoadArticle = LoadArticle;
        $scope.SaveArticle = SaveArticle;

        FormPlayerService.$scope = $scope;
        FormPlayerService.$compile = $compile;

   //     Draw();

    }]);

FormPlayerControllers.controller('FormPlayerCreateDialogController', ['$scope', '$uibModalInstance', 'items',
    ($scope: any, $uibModalInstance: any, items: any): void => {

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


FormPlayerControllers.controller('FormPlayerOpenDialogController', ['$scope', '$log', '$uibModalInstance', '$uibModal', 'items', 'FormPlayerService',
    ($scope: any, $log: any, $uibModalInstance: any, $uibModal: any, items: any, FormPlayerService: any): void => {

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

        let Query = (): any => {
            progress(true);
            FormPlayerService.query = {};
            FormPlayerService.Query((value: any): void => {
                $scope.pages = value;
                progress(false);
            }, error_handler);
        };

        let Find = (name:string): any => {
            progress(true);
            FormPlayerService.query = {};
            if (name) {
                FormPlayerService.query = {name:name};
            }
            FormPlayerService.Query((result: any): void => {
                if (result) {
                    $scope.pages = result;
                }
                progress(false);
            }, error_handler);
        };

        let Next = (): void => {
            progress(true);
            FormPlayerService.Next((result: any): void => {
                if (result) {
                    $scope.pages = result;
                }
                progress(false);
            }, error_handler);
        };

        let Prev = (): void => {
            progress(true);
            FormPlayerService.Prev((result: any): void => {
                if (result) {
                    $scope.pages = result;
                }
                progress(false);
            }, error_handler);
        };

        let Get = (layout): void => {
            progress(true);
            FormPlayerService.Get(layout._id, (result: any): void => {
                progress(false);
                $uibModalInstance.close(layout);
            }, error_handler);
        };

        let hide = (): void => {
            $uibModalInstance.close();
        };

        let cancel = (): void => {
            $uibModalInstance.dismiss();
        };

        $scope.Next = Next;
        $scope.Prev = Prev;
        $scope.Find = Find;
        $scope.Get = Get;
        $scope.hide = hide;
        $scope.cancel = cancel;

        Query();

    }]);
