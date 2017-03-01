/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

let ResourceBuilderControllers: angular.IModule = angular.module('ResourceBuilderControllers', ['ui.ace']);

ResourceBuilderControllers.controller('ResourceBuilderController', ["$scope", "$document", "$log", "$compile", "$uibModal", "ResourceBuilderService", "ElementsService",
    function ($scope: any, $document: any, $log: any, $compile: any, $uibModal: any, ResourceBuilderService: any, ElementsService: any): void {

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

        window.addEventListener('beforeunload', (e) => {
            if (!editor.session.getUndoManager().isClean()) {
                e.returnValue = '';
            }
        }, false);

        let editor = null;
        let document = null;
        let inner_peview = false;
        let preview_window = null;

        let Draw = (text) => {
            switch (ResourceBuilderService.current.content.type) {
                case "text/html":
                    if (document) {
                        document.open();
                        document.write(text);
                        document.close();
                    }
                    break;
                default:
            }
        };

        $scope.aceOption = {
            theme: "chrome",
            onLoad: (_ace) => {
                editor = _ace;

                let session = _ace.getSession();

          //      let beautify = _ace.require("ace/ext/beautify"); // get reference to extension
          //      beautify.beautify(session);

                editor.$blockScrolling = Infinity;
                editor.setOptions({
                    enableBasicAutocompletion: true,
                    enableSnippets: true,
                    enableLiveAutocompletion: true
                });

                session.setUndoManager(new ace.UndoManager());

                editor.container.addEventListener("drop", function (event) {

            //        let innerHTML = event.dataTransfer.getData('text/html');
            //        let hoge = 1;

                });

            },
            onChange: (e) => {
                Draw($scope.resource);
            }
        };


        $scope.Undo = () => {
            let session = editor.getSession();
            let undo = session.getUndoManager();
            undo.undo(true);
        };

        $scope.Paste = (id) => {
            progress(true);
            let current = ResourceBuilderService.current;
            ResourceBuilderService.Get(id, (result: any): void => {
                progress(false);
                ResourceBuilderService.current = current;
                editor.insert(result.resource);
                Draw(result.resource);
            }, error_handler);
        };

        let OpenPreview = () => {
            $scope.inner_preview = inner_peview;
            if (inner_peview) {
                let preview = window.document.getElementById("view");
                document = preview.contentDocument;
            } else {
                preview_window = window.open("", "", "width=1024,height=800");
                document = preview_window.document;
            }

            Draw(ResourceBuilderService.current.content.resource);
        };

        let ClosePreview = () => {
            if (preview_window) {
                document = preview_window.close();
            }
        };

        let Create = (): void => {

            let modalRegist: any = $uibModal.open({
                controller: 'ResourceBuilderCreateDialogController',
                templateUrl: '/resources/dialogs/create_dialog',
                resolve: {
                    items: $scope
                }
            });

            modalRegist.result.then((resource: any): void => {

                switch (ResourceBuilderService.current.content.type) {
                    case "text/html":
                        editor.getSession().setMode("ace/mode/html");
                        $scope.resource = "";
                        $scope.name = ResourceBuilderService.current.name;
                        $scope.userid = ResourceBuilderService.current.userid;
                        break;
                    case "text/css":
                        editor.getSession().setMode("ace/mode/css");
                        $scope.resource = "";
                        $scope.name = ResourceBuilderService.current.name;
                        $scope.userid = ResourceBuilderService.current.userid;
                        break;
                    case "text/javascript":
                        editor.getSession().setMode("ace/mode/javascript");
                        $scope.resource = "";
                        $scope.name = ResourceBuilderService.current.name;
                        $scope.userid = ResourceBuilderService.current.userid;
                        break;
                    default:
                }

                editor.session.getUndoManager().markClean();
                $scope.opened = true;

            }, (): void => {
            });

        };

        let Open = (): void => {
            let modalRegist: any = $uibModal.open({
                controller: 'ResourceBuilderOpenDialogController',
                templateUrl: '/resources/dialogs/open_dialog',
                resolve: {
                    items: $scope
                }
            });

            modalRegist.result.then((content: any): void => {

                switch (ResourceBuilderService.current.content.type) {
                    case "text/html":
                        editor.getSession().setMode("ace/mode/html");
                        $scope.resource = content.resource;
                        $scope.name = ResourceBuilderService.current.name;
                        $scope.userid = ResourceBuilderService.current.userid;
                        break;
                    case "text/css":
                        editor.getSession().setMode("ace/mode/css");
                        $scope.resource = content.resource;
                        $scope.name = ResourceBuilderService.current.name;
                        $scope.userid = ResourceBuilderService.current.userid;
                        break;
                    case "text/javascript":
                        editor.getSession().setMode("ace/mode/javascript");
                        $scope.resource = content.resource;
                        $scope.name = ResourceBuilderService.current.name;
                        $scope.userid = ResourceBuilderService.current.userid;
                        break;
                    default:
                }

                editor.session.getUndoManager().markClean();
                $scope.opened = true;

            }, (): void => {
            });
        };

        let Update = (): void => {
            if (ResourceBuilderService.current) {
                progress(true);
                ResourceBuilderService.current.content.resource = $scope.resource;
                ResourceBuilderService.Put((result: any): void => {
                    editor.session.getUndoManager().markClean();
                    progress(false);
                }, error_handler);
            }
        };

        let Delete = (): void => {
            if (ResourceBuilderService.current) {
                let modalRegist: any = $uibModal.open({
                    controller: 'ResourceBuilderDeleteConfirmController',
                    templateUrl: '/resources/dialogs/delete_confirm_dialog',
                    resolve: {
                        items: (): any => {
                            return ResourceBuilderService.current;
                        }
                    }
                });

                modalRegist.result.then((content): void => {
                    progress(true);
                    ResourceBuilderService.Delete((result: any): void => {
                        ClosePreview();
                        $scope.name = "";
                        ResourceBuilderService.Draw("");
                        progress(false);
                        $scope.opened = false;
                    }, error_handler);
                }, (): void => {
                });
            }
        };

        let Query = (): any => {
            ResourceBuilderService.query = {type:{$lt:10}};
            ResourceBuilderService.Query((result: any): void => {
                if (result) {
                    $scope.templates = result;
                }
            }, error_handler);
        };

        $scope.opened = false;

        $scope.Create = Create;
        $scope.Open = Open;
        $scope.Update = Update;
        $scope.Delete = Delete;

        $scope.OpenPreview = OpenPreview;

        Query();

    }]);

ResourceBuilderControllers.controller('ResourceBuilderCreateDialogController', ['$scope', '$log', '$uibModalInstance', 'ResourceBuilderService', 'items',
    ($scope: any, $log: any, $uibModalInstance: any, ResourceBuilderService: any, items: any): void => {

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

        $scope.type = 20;

        $scope.hide = (): void => {
            $uibModalInstance.close();
        };

        $scope.cancel = (): void => {
            $uibModalInstance.dismiss();
        };

        $scope.answer = (): void => {
            progress(true);
            ResourceBuilderService.Init();
            //ResourceBuilderService.current.content.resource = $scope.resource;
            ResourceBuilderService.current.content.type = $scope.mimetype;
            ResourceBuilderService.Create($scope.title, $scope.type, (result: any): void => {
                progress(false);
                $scope.message = "";
                $uibModalInstance.close(result);
            }, error_handler);
        };

    }]);

ResourceBuilderControllers.controller('ResourceBuilderOpenDialogController', ['$scope', '$log', '$uibModalInstance', '$uibModal', 'items', 'ResourceBuilderService',
    ($scope: any, $log: any, $uibModalInstance: any, $uibModal: any, items: any, ResourceBuilderService: any): void => {

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

        let Query = (): any => {
            progress(true);
            ResourceBuilderService.query = {type:{$gte:10}};
            ResourceBuilderService.Query((result: any): void => {
                if (result) {
                    $scope.pages = result;
                }
                progress(false);
            }, error_handler);
        };

        let Find = (name: string): any => {
            progress(true);
            ResourceBuilderService.query = {};
            if (name) {
                ResourceBuilderService.query = {name: name};
            }
            ResourceBuilderService.Query((result: any): void => {
                if (result) {
                    $scope.pages = result;
                }
                progress(false);
            }, error_handler);
        };

        let Count = (): void => {
            ResourceBuilderService.Count((result: any): void => {
                if (result) {
                    $scope.count = result;
                }
            }, error_handler);
        };

        let Next = (): void => {
            progress(true);
            ResourceBuilderService.Next((result: any): void => {
                if (result) {
                    $scope.pages = result;
                }
                progress(false);
            }, error_handler);
        };

        let Prev = (): void => {
            progress(true);
            ResourceBuilderService.Prev((result: any): void => {
                if (result) {
                    $scope.pages = result;
                }
                progress(false);
            }, error_handler);
        };

        let Get = (resource: any): void => {
            progress(true);
            ResourceBuilderService.Get(resource._id, (result: any): void => {
                progress(false);
                $scope.message = "";
                $uibModalInstance.close(result);
            }, error_handler);
        };

        let hide = (): void => {
            $uibModalInstance.close();
        };

        let cancel = (): void => {
            $uibModalInstance.dismiss();
        };

        let LayoutQuery = (): any => Query;

        $scope.Count = Count;
        $scope.Next = Next;
        $scope.Prev = Prev;
        $scope.Find = Find;
        $scope.Get = Get;
        $scope.hide = hide;
        $scope.cancel = cancel;
        $scope.LayoutQuery = (): any => Query;

        Query();

    }]);

ResourceBuilderControllers.controller('ResourceBuilderDeleteConfirmController', ['$scope', '$uibModalInstance', 'items',
    ($scope: any, $uibModalInstance: any, items: any): void => {

        $scope.title = items.name;

        $scope.hide = (): void => {
            $uibModalInstance.close();
        };

        $scope.cancel = (): void => {
            $uibModalInstance.dismiss();
        };

        $scope.answer = (): void => {
            $uibModalInstance.close({});
        };

    }]);