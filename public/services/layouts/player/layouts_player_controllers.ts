/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

/// <reference path="../../../systems/common/shape_edit/shape_edit.ts" />
/// <reference path="../../../systems/common/shape_edit/server_canvas.ts" />
/// <reference path="../../../systems/common/shape_edit/adaptor.ts" />

"use strict";

let PlayerControllers: angular.IModule = angular.module('PlayerControllers', ['ui.bootstrap']);

PlayerControllers.controller('PlayerController', ["$scope",'$document', '$log', '$window', "$compile", '$uibModal', 'ShapeEdit', 'HtmlEdit', 'LayoutService', 'ArticleService',
    ($scope: any,$document:any, $log: any, $window: any, $compile: any, $uibModal: any, ShapeEdit: any, HtmlEdit: any, LayoutService: any, ArticleService: any): void => {

     //   let short = 525;

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

        let watchChange = (_scope, $scope, id, events) => {

            $scope.$watch(id, (newValue: string, oldValue: string): void => {
                if (events) {
                    if (events.onChange != "") {
                        try {
                            _scope.document = document;
                            _scope.element = document.getElementById(id);
                            _scope.newValue = newValue;
                            _scope.oldValue = oldValue;

                            new Function("_scope", "with (_scope) {" + events.onChange + "}")(_scope);//scope chainをぶった切る
                        } catch (e) {
                            let a = e;
                        }
                    }
                }
            });
        };

        let create_dynamic_target_elements = (shapes, callbacks: {}): string => {
            let result = "";
            let _scope = {id: "", canvas: ShapeEdit.Canvas, document: null, shapes: shapes, element: null, newValue: "", oldValue: "", setValue: null};
            _.forEach(shapes, (shape: any): void => {
                let id = shape.ID();
                let property = shape.Property();

                _.forEach(property.description["field"], (field_description, key: string): void => {
                    let label = field_description.label;
                    let type = field_description.type;
                    let validate = field_description.validate;
                    let options = field_description.options;
                    let events = field_description.events;
                    let mode = field_description.mode;
                    if (mode == "dynamic") {
                        let callback = callbacks[key];
                        let text = property.text;
                        var field = [];
                        let control_id = id + "A" + key;
                        switch (type) {
                            case "text" :
                                field = [{
                                    "name": "div", "type": "element",
                                    "_$": {"class": "form-group"},
                                    "@": [
                                        {
                                            "name": "label", "type": "element",
                                            "_$": {"for": control_id},
                                            "@": label,
                                        },
                                        {
                                            "name": "span", "type": "element",
                                            "_$": {"ng-messages": "validate." + control_id + ".$error"},
                                            "@": [
                                                {
                                                    "name": "span", "type": "element",
                                                    "_$": {"ng-message": "required", "class": "error-message"},
                                                    "@": "必須です"
                                                },
                                                {
                                                    "name": "span", "type": "element",
                                                    "_$": {"ng-message": "minlength", "class": "error-message"},
                                                    "@": "もう少し長く"
                                                },
                                                {
                                                    "name": "span", "type": "element",
                                                    "_$": {"ng-message": "maxlength", "class": "error-message"},
                                                    "@": "もう少し短く"
                                                }
                                            ]
                                        },
                                        {
                                            "name": "input", "type": "element",
                                            "_$": {"class": "form-control no-zoom", "id": control_id, "ng-model": control_id, "type": "text", "name": control_id, "value": text, "ng-maxlength": validate["ng-maxlength"], "ng-minlength": validate["ng-minlength"], "required": validate["required"]},
                                        }]
                                }];
                                watchChange(_scope, $scope, control_id, events);
                                break;
                            case "textarea" :
                                field = [{
                                    "name": "div", "type": "element",
                                    "_$": {"class": "form-group"},
                                    "@": [
                                        {
                                            "name": "label", "type": "element",
                                            "_$": {"for": control_id},
                                            "@": label,
                                        },
                                        {
                                            "name": "span", "type": "element",
                                            "_$": {"ng-messages": "validate." + control_id + ".$error"},
                                            "@": [
                                                {
                                                    "name": "span", "type": "element",
                                                    "_$": {"ng-message": "required", "class": "error-message"},
                                                    "@": "必須です"
                                                },
                                                {
                                                    "name": "span", "type": "element",
                                                    "_$": {"ng-message": "minlength", "class": "error-message"},
                                                    "@": "もう少し長く"
                                                },
                                                {
                                                    "name": "span", "type": "element",
                                                    "_$": {"ng-message": "maxlength", "class": "error-message"},
                                                    "@": "もう少し短く"
                                                }
                                            ]
                                        },
                                        {
                                            "name": "textarea", "type": "element",
                                            "_$": {"class": "form-control no-zoom", "id": control_id, "ng-model": control_id, "type": "text", "name": control_id, "ng-maxlength": validate["ng-maxlength"], "ng-minlength": validate["ng-minlength"], "required": validate["required"]}
                                        }]
                                }];
                                watchChange(_scope, $scope, control_id, events);
                                break;
                            case "select" :
                                let options_model_name = id + "_options";
                                $scope[options_model_name] = options;
                                field = [{
                                    "name": "div", "type": "element",
                                    "_$": {"class": "form-group"},
                                    "@": [
                                        {
                                            "name": "label", "type": "element",
                                            "_$": {"for": control_id},
                                            "@": label,
                                        },
                                        {
                                            "name": "select", "type": "element",
                                            "_$": {"class": "form-control", "id": control_id, "ng-init": id + " = " + options_model_name + "[0]", "ng-model": control_id, "ng-options": "option for option in " + options_model_name, "name": id, "required": validate["required"]}
                                        }]
                                }];
                                $scope.$watch(id, (newValue: string, oldValue: string): void => {
                                    if (events) {
                                        if (events.onChange != "") {
                                            try {
                                                _scope.id = id;
                                                _scope.document = document;
                                                _scope.element = document.getElementById(id);
                                                _scope.newValue = newValue;
                                                _scope.oldValue = oldValue;
                                                _scope.setValue = (id) => {
                                                    _scope.document.getElementById(id).selectedIndex = _scope.element.selectedIndex;
                                                    var text = _scope.canvas.shapes.getShapeById(id);
                                                    if (text) {
                                                        text.SetText(_scope.document.getElementById(id).childNodes[_scope.element.selectedIndex].outerText);
                                                        _scope.canvas.Draw();
                                                    }
                                                };

                                                new Function("_scope", "with (_scope) {" + events.onChange + "}")(_scope);//scope chainをぶった切る
                                            } catch (e) {
                                                let a = e;
                                            }
                                        }
                                    }
                                });
                                break;
                            case "radio" :
                                let radio_elements = [];
                                _.forEach(options, (label) => {
                                    let radio_element = {
                                        "name": "div", "type": "element",
                                        "_$": {"class": "radio"},
                                        "@": [
                                            {
                                                "name": "label", "type": "element",
                                                "_$": {},
                                                "@": [
                                                    {
                                                        "name": "input", "type": "element",
                                                        "_$": {type: "radio", id: label, "ng-model": control_id, value: label},
                                                        "@": [],
                                                    },
                                                    {
                                                        "name": "label", "type": "element",
                                                        "_$": {for: label},
                                                        "@": label,
                                                    }
                                                ],
                                            }
                                        ]
                                    };
                                    radio_elements.push(radio_element);
                                });
                                field = [{
                                    "name": "div", "type": "element",
                                    "_$": {"class": "form-group"},
                                    "@": radio_elements
                                }];
                                watchChange(_scope, $scope, control_id, events);
                                break;
                            case "checkbox":
                                break;
                            case "color":
                                field = [{
                                    "name": "div", "type": "element",
                                    "_$": {"class": "form-group"},
                                    "@": [
                                        {
                                            "name": "label", "type": "element",
                                            "_$": {"for": control_id},
                                            "@": label,
                                        },
                                        {
                                            "name": "input", "type": "element",
                                            "_$": {"class": "form-control no-zoom", "id": control_id, "ng-model": control_id, "type": "color", "name": control_id, "value": text},
                                        }]
                                }];
                                watchChange(_scope, $scope, control_id, events);
                                break;
                            default:
                        }
                        result += HtmlEdit.toHtml(field, "");
                        $scope.$watch(control_id, (value: string): void => {
                            if (value) {
                                let element = ShapeEdit.Canvas.shapes.getShapeById(id);
                                if (element) {
                                    callback(element, value);
                                    ShapeEdit.Canvas.Draw();
                                }
                            }
                        });
                    }
                })
            });
            return result;
        };

        let lookup_value = (shapes: any, values: any, callbacks: {}): void => {
            if (values) {
                _.forEach(shapes, (shape: any): void => {
                    let id = shape.ID();
                    let property = shape.Property();
                    _.forEach(property.description["field"], (field_description: any, key: string): void => {
                        let lookup = field_description.lookup;
                        let type = field_description.type;
                        //  let validate = field_description.validate;
                        //  let options = field_description.options;
                        let mode = field_description.mode;
                        if (mode == "lookup") {
                            let callback = callbacks[key];
                            switch (type) {
                                case "text" :
                                case "textarea" :
                                    let text = ShapeEdit.Canvas.shapes.getShapeById(id);
                                    if (text) {
                                        let value = values[lookup];
                                        if (value) {
                                            callback(text, value);
                                        }  else {
                                            callback(text, "");
                                        }
                                        ShapeEdit.Canvas.Draw();
                                    }
                                    break;
                                case "select" :
                                case "radio" :
                                case "checkbox":
                                    break;
                                default:
                            }
                        }
                    });
                });
            }
        };

        // dynamic element
        let setup_layout = (layout: any): void => {
            LayoutService.current_layout = layout;

            $scope.current_layout = LayoutService.current_layout;

            let shapes = [];
            ShapeEdit.Canvas.shapes.getShapeByType("Text", shapes);
            let elements_text = create_dynamic_target_elements(shapes,
                {
                    text: (text: any, value: any): void => {
                        text.SetText(value);
                    },
                    color: (shape: any, value: any): void => {
                        let color: ShapeEdit.RGBAColor = new ShapeEdit.RGBAColor(0, 0, 0, 1);
                        color.SetRGB(value);
                        shape.SetFillColor(color);
                    }
                }
            );

            shapes = [];
            ShapeEdit.Canvas.shapes.getShapeByTypes(["Box", "Oval", "Polygon", "Bezier", "Shapes"], shapes);
            elements_text += create_dynamic_target_elements(shapes,
                {
                    color: (shape: any, value: any): void => {
                        let color: ShapeEdit.RGBAColor = new ShapeEdit.RGBAColor(0, 0, 0, 1);
                        color.SetRGB(value);
                        shape.SetFillColor(color);
                    }
                }
            );

            shapes = [];
            ShapeEdit.Canvas.shapes.getShapeByType("ImageRect", shapes);
            elements_text += create_dynamic_target_elements(shapes,
                {
                    text: (image: any, value: any): void => {
                        image.SetPath(value);
                    }
                }
            );

            let elements = angular.element('.input-root').html(elements_text);
            $compile(elements.contents())($scope);


            // lookup
            if (ArticleService.current_article) {
                shapes = [];
                ShapeEdit.Canvas.shapes.getShapeByType("Text", shapes);
                lookup_value(shapes, ArticleService.current_article.content,
                    {
                        text: (text: any, value: any): void => {
                            switch (value.type) {//data type?
                                case "array" :
                                    let s = "";
                                    let delimiter = "";
                                    _.forEach(value.value, (element) => {
                                        s += delimiter + element;
                                        delimiter = ", ";
                                    });
                                    text.SetText(s);
                                    break;
                                case "quoted":
                                    text.SetText(value.value);
                                    break;
                                default:
                                    text.SetText(value.value);
                            }
                        }
                    }
                );

                shapes = [];
                ShapeEdit.Canvas.shapes.getShapeByType("ImageRect", shapes);
                lookup_value(shapes, ArticleService.current_article.content,
                    {
                        text: (image: any, value: any): void => {
                            image.SetPath(value.value);
                        }
                    }
                );
            }

        };

        let clear_layout = () => {
            let elements = angular.element('.input-root').html("");
            $compile(elements.contents())($scope);
        };

        let CreateFromTemplate = (): void => {
            let modalRegist: any = $uibModal.open({
                controller: 'PlayerCreateDialogController',
                templateUrl: '/layouts/player/dialogs/create_dialog',
                resolve: {
                    items: (): any => {
                    }
                }
            });
            modalRegist.result.then((layout: any): void => {
                setup_layout(layout);

                LayoutCount();
                LayoutList();

                $scope.opened = true;

            }, (): void => {
            });
        };

        let ArticleList = (): void => {
            ArticleService.Query((result: any): void => {
                $scope.articles = result;
            }, error_handler);
        };

  //      let EditClear = () => {
  //          _.each(ShapeEdit.Input, function (element: any, id: any) {
  //              ShapeEdit.Wrapper.removeChild(element);
  //              delete ShapeEdit.Input[id];
  //          });
  //      };

        let LayoutCount: () => void = (): void => {
            LayoutService.Count((result: any): void => {
                $scope.count = result;
            }, error_handler);
        };

        let LayoutList = (): any => {
            progress(true);
            LayoutService.Query((result: any): void => {
                if (result) {
                    $scope.layouts = result;
                }
                progress(false);
            }, error_handler);
        };

        // Lookup Text, Image
        let SelectArticle = (id: any): void => {

            ArticleService.Get(id, (result: any): void => {

                ArticleService.current_article = result;

                $scope.current_article = result;

                let shapes = [];
                ShapeEdit.Canvas.shapes.getShapeByType("Text", shapes);
                lookup_value(shapes, result.content,
                    {
                        text: (text: any, value: any): void => {
                            switch (value.type) {//data type?
                                case "array" :
                                    let s = "";
                                    let delimiter = "";
                                    _.forEach(value.value, (element) => {
                                        s += delimiter + element;
                                        delimiter = ", ";
                                    });
                                    text.SetText(s);
                                    break;
                                case "quoted":
                                    text.SetText(value.value);
                                    break;
                                default:
                                    text.SetText(value.value);
                            }
                        }
                    }
                );

                shapes = [];
                ShapeEdit.Canvas.shapes.getShapeByType("ImageRect", shapes);
                lookup_value(shapes, result.content,
                    {
                        text: (image: any, value: any): void => {
                            image.SetPath(value.value);
                        }
                    }
                );

            }, error_handler);

        };

        let SelectedArticle = (id): boolean => {
            let result: boolean = false;
            if (ArticleService.current_article) {
                result = (ArticleService.current_article._id == id);
            }
            return result;
        };

        let SelectLayout = (id: any): void => {

            progress(true);
            LayoutService.Get(id, (result: any): void => {
                LayoutService.format = result.content.format;
                ShapeEdit.Load(result.content.text);
       //         EditClear();

               // $scope.current_layout = LayoutService.current_layout;
                setup_layout(result);
                progress(false);

         //       $scope.name = result.name;
                $scope.userid = result.userid;

                $scope.opened = true;
            }, error_handler);

        };

        let SelectedLayout = (id: any): boolean => {
            let result: boolean = false;
            if (LayoutService.current_layout) {
                result = (LayoutService.current_layout._id == id);
            }
            return result;
        };

        let Update = (): void => {
            if (LayoutService.current_layout) {
                progress(true);
                LayoutService.current_layout.content.text = ShapeEdit.Serialize();
                LayoutService.Put(LayoutService.current_layout, (result: any): void => {
                    $scope.current_layout = LayoutService.current_layout;

                    LayoutCount();
                    LayoutList();

                    progress(false);
                }, error_handler);
            }
        };

        let UpdateAs = (): void => {
            let modalRegist: any = $uibModal.open({
                controller: 'PlayerSaveAsDialogController',
                templateUrl: '/layouts/player/dialogs/saveas_dialog',
                resolve: {
                    items: $scope
                }
            });

            modalRegist.result.then((layout): void => {
                $scope.name = layout.name;
                $scope.userid = layout.userid;
                $scope.opened = true;
            }, (): void => {
            });
        };

        let Delete = (): void => {
            if (LayoutService.current_layout) {
                let modalRegist: any = $uibModal.open({
                    controller: 'PlayerDeleteConfirmController',
                    templateUrl: '/layouts/player/dialogs/delete_confirm_dialog',
                    resolve: {
                        items: (): any => {
                            return LayoutService.current_layout;
                        }
                    }
                });

                modalRegist.result.then((content): void => {
                    progress(true);
                    LayoutService.Delete((result: any): void => {
                        LayoutService.current_layout = null;
                        $scope.current_layout = null;
                        ShapeEdit.Clear();

                        //     Count();
                        //     Query();

                        LayoutCount();
                        LayoutList();

                        clear_layout();

                        $scope.opened = false;
                        progress(false);

                    }, error_handler);
                }, (): void => {
                });
            }
        };

        let PrintPNG = (): void => {
            let width, height;

            ShapeEdit.Canvas.Snap();

            switch (LayoutService.format.layout) {
                case "portrait":
                    width = LayoutService.format.size[0];
                    height = LayoutService.format.size[1];
                    break;
                case "landscape":
                    width = LayoutService.format.size[1];
                    height = LayoutService.format.size[0];
                    break;
                default:
            }
            Canvas2Image.saveAsPNG(ShapeEdit.CanvasElement, width, height);
        };

        let PrintPDF = (): void => {
            progress(true);
            LayoutService.current_layout.content.text = ShapeEdit.Serialize();
            LayoutService.current_layout.content.format = LayoutService.format;
            LayoutService.PrintPDF(LayoutService.current_layout, (result: any): void => {
                progress(false);
                $window.location.href = "/layouts/download/pdf"
            }, error_handler);
        };

        let PrintSVG = (): void => {
            progress(true);
            LayoutService.current_layout.content.text = ShapeEdit.Serialize();
            LayoutService.PrintSVG(LayoutService.current_layout, (result: any): void => {
                progress(false);
                $window.location.href = "/layouts/download/svg"
            }, error_handler);
        };

        let LayoutQuery = (): any => LayoutList;

        ShapeEdit.onResizeWindow((wrapper, inner): void => {

        });

        let direction: number = -1;

        let Find = (newValue: string): void => {
            if (newValue) {
                ArticleService.query = {name: {$regex: newValue}};
            } else {
                ArticleService.query = {};
            }
            ArticleList();
        };

        let Count: () => void = (): void => {
            ArticleService.Count((result: any): void => {
                if (result) {
                    $scope.count = result;
                }
            }, error_handler);
        };

        let Sort = (name: string): void => {
            if (name) {
                direction = -direction;
                ArticleService.option.sort[name] = direction;
            }
            ArticleList();
        };

        let Next = (): void => {
            progress(true);
            ArticleService.Next((result) => {
                if (result) {
                    $scope.articles = result;
                }
                progress(false);
            }, error_handler);
        };

        let Prev = (): void => {
            progress(true);
            ArticleService.Prev((result) => {
                if (result) {
                    $scope.articles = result;
                }
                progress(false);
            }, error_handler);
        };

        $scope.Find = Find;
        $scope.Count = Count;
        $scope.Sort = Sort;
        $scope.Next = Next;
        $scope.Prev = Prev;

        $scope.opened = false;

        $scope.CreateFromTemplate = CreateFromTemplate;

        $scope.SelectArticle = SelectArticle;
        $scope.SelectedArticle = SelectedArticle;

        $scope.SelectLayout = SelectLayout;
        $scope.SelectedLayout = SelectedLayout;

        $scope.Update = Update;
        $scope.UpdateAs = UpdateAs;
        $scope.Delete = Delete;
        $scope.PrintPNG = PrintPNG;
        $scope.PrintPDF = PrintPDF;
        $scope.PrintSVG = PrintSVG;

        $scope.LayoutQuery = LayoutQuery;

        ArticleList();
        LayoutCount();
        LayoutList();

    }]);

PlayerControllers.controller('PlayerCreateDialogController', ['$scope', '$log', '$uibModalInstance', '$uibModal', 'items', 'ShapeEdit', 'TemplateService', 'LayoutService',
    ($scope: any, $log: any, $uibModalInstance: any, $uibModal: any, items: any, ShapeEdit: any, TemplateService: any, LayoutService: any): void => {

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

        let Count: () => void = (): void => {
            TemplateService.Count((result: any): void => {
                $scope.count = result;
            }, error_handler);
        };

        let Query = (): any => {
            TemplateService.Query((value: any): void => {
                $scope.layouts = value;
            }, error_handler);
        };

        let Next = (): void => {
            progress(true);
            TemplateService.Next((result: any): void => {
                if (result) {
                    $scope.layouts = result;
                }
                progress(false);
            }, error_handler);

        };

        let Prev = (): void => {
            progress(true);
            TemplateService.Prev((result: any): void => {
                if (result) {
                    $scope.layouts = result;
                }
                progress(false);
            }, error_handler);
        };

        let Create = (): void => {
            progress(true);
            let name = $scope.name;
            let content = TemplateService.current_layout.content;
            LayoutService.Create(name, content, (new_layout: any): void => {
                LayoutService.format = new_layout.content.format;
                ShapeEdit.Load(new_layout.content.text);
                progress(false);
                $uibModalInstance.close(new_layout);
            }, error_handler);
        };

        let SelectTemplate = (id: any): void => {
            progress(true);
            TemplateService.Get(id, (new_layout: any): void => {
                let name = $scope.name;
                TemplateService.current_layout = new_layout;
                progress(false);
            }, error_handler);
        };

        let SelectedTemplate = (id: any): boolean => {
            let result: boolean = false;
            if (TemplateService.current_layout) {
                result = (TemplateService.current_layout._id == id);
            }
            return result;
        };

        let HasSelectedTemplate = (): boolean => {
            return (TemplateService.current_layout);
        };

        let hide = (): void => {
            $uibModalInstance.close();
        };

        let cancel = (): void => {
            $uibModalInstance.dismiss();
        };

        let LayoutQuery = (): any => Query;

        $scope.Next = Next;
        $scope.Prev = Prev;
        $scope.Create = Create;
        $scope.SelectTemplate = SelectTemplate;
        $scope.SelectedTemplate = SelectedTemplate;
        $scope.HasSelectedTemplate = HasSelectedTemplate;
        $scope.hide = hide;
        $scope.cancel = cancel;
        $scope.LayoutQuery = (): any => Query;

        Count();
        Query();
    }]);

PlayerControllers.controller('PlayerOpenDialogController', ['$scope', '$log', '$uibModalInstance', '$uibModal', 'items', 'ShapeEdit', 'LayoutService',
    ($scope: any, $log: any, $uibModalInstance: any, $uibModal: any, items: any, ShapeEdit: any, LayoutService: any): void => {

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

        let Count: () => void = (): void => {
            LayoutService.Count((result: any): void => {
                if (result) {
                    $scope.count = result;
                }
            }, error_handler);
        };

        let Query = (): any => {
            progress(true);
            LayoutService.Query((result: any): void => {
                if (result) {
                    $scope.layouts = result;
                }
                progress(false);
            }, error_handler);
        };

        let Next = (): void => {
            if (!$scope.progress) {
                progress(true);
                LayoutService.Next((result: any): void => {
                    if (result) {
                        $scope.layouts = result;
                    }
                    progress(false);
                }, error_handler);
            }
        };

        let Prev = (): void => {

            progress(true);
            LayoutService.Prev((result: any): void => {
                if (result) {
                    $scope.layouts = result;
                }
                progress(false);
            }, error_handler);

        };

        let Get = (layout): void => {

            progress(true);
            LayoutService.Get(layout._id, (result: any): void => {
                LayoutService.format = result.content.format;
                ShapeEdit.Load(result.content.text);
                progress(false);
                $uibModalInstance.close(result);
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
        $scope.Get = Get;
        $scope.hide = hide;
        $scope.cancel = cancel;
        $scope.LayoutQuery = Query;

        Count();
        Query();
    }]);

PlayerControllers.controller('PlayerSaveAsDialogController', ['$scope','$log', '$uibModalInstance', 'LayoutService', 'ShapeEdit', 'items',
    ($scope: any,$log:any, $uibModalInstance: any, LayoutService: any, ShapeEdit: any, items: any): void => {

        let error_handler: (code: number, message: string) => void = (code: number, message: string): void => {
            progress(false);
            $scope.message = message;
            $log.error(message);
        };

        let progress = (value) => {
            $scope.$emit('progress', value);
        };

        $scope.$on('progress', (event, value) => {
            items.progress = value;
        });

        $scope.hide = (): void => {
            $uibModalInstance.close();
        };

        $scope.cancel = (): void => {
            $uibModalInstance.dismiss();
        };

        $scope.answer = (): void => {
            progress(true);
            if (LayoutService.current_layout) {
                progress(true);
                LayoutService.current_layout.content.text = ShapeEdit.Serialize();
                LayoutService.PutAs($scope.title, LayoutService.current_layout, (result: any): void => {
                    progress(false);
                    $uibModalInstance.close({});
                }, error_handler);
            }
        };

    }]);

PlayerControllers.controller('PlayerDeleteConfirmController', ['$scope', '$uibModalInstance', 'items',
    ($scope: any, $uibModalInstance: any, items: any): void => {

        $scope.title = items.content.title;

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