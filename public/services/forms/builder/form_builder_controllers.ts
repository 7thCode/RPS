/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

let FormBuilderControllers: angular.IModule = angular.module('FormBuilderControllers', ['ui.ace']);

class RGBAColor {

    public r: number;
    public g: number;
    public b: number;
    public a: number;

    constructor(r: number, g: number, b: number, a: number) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    public RGB(): string {
        return "#" + ("0" + this.r.toString(16)).slice(-2) + ("0" + this.g.toString(16)).slice(-2) + ("0" + this.b.toString(16)).slice(-2);
    }

    public RGBA(): string {
        return "rgba(" + this.r + ", " + this.g + ", " + this.b + ", " + this.a + ")";
    }

    public SetRGB(color: string): void {
        if (color) {
            if (color.length === 6) {
                this.r = parseInt(color.slice(0, 2), 16);
                this.g = parseInt(color.slice(2, 4), 16);
                this.b = parseInt(color.slice(4, 6), 16);
                //this._a = parseInt(color.slice(6, 8), 16);
            } else if (color[0] === "#") {
                this.r = parseInt(color.slice(1, 3), 16);
                this.g = parseInt(color.slice(3, 5), 16);
                this.b = parseInt(color.slice(5, 7), 16);
                //this._a = parseInt(color.slice(7, 9), 16);
            }
        }
    }

    static Check(a: number): number {
        let result: number = 0;
        if (a > 255) {
            result = 255;
        }
        if (a < 0) {
            result = 0;
        }
        return result;
    };

    public Lighten(n: number): RGBAColor {
        let check = (a: number, b: number): number => {
            let result: number = a + b;
            if (a > 255) {
                result = 255;
            }
            return result;
        };
        return new RGBAColor(check(this.r, n), check(this.g, n), check(this.b, n), this.a);
    }

    public Darken(n: number): RGBAColor {
        let check = (a: number, b: number): number => {
            let result: number = a - b;
            if (a < 0) {
                result = 0;
            }
            return result;
        };
        return new RGBAColor(check(this.r, n), check(this.g, n), check(this.b, n), this.a);
    }

    public Invert(): RGBAColor {
        return new RGBAColor(255 - this.r, 255 - this.g, 255 - this.b, this.a);
    }

}

FormBuilderControllers.controller('FormBuilderController', ["$scope","$document", "$log", "$compile", "$uibModal", "FormBuilderService", "ElementsService",
    function ($scope: any,$document:any, $log: any, $compile: any, $uibModal: any, FormBuilderService: any, ElementsService: any): void {

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

        window.addEventListener('beforeunload', (e) => {
            if ($scope.opened) {
                e.returnValue = '';
            }
        }, false);

        //let page_no = 0;

        let pages = [
            {
                contents: []
            }
        ];

        let mark = document.getElementById("mark");
        mark.style.setProperty('display', 'none');
        mark.style.backgroundColor = 'rgba(100,100,100,0.5)';
        mark.style.position = 'absolute';

        window.addEventListener('resize', (event): void => {
            redraw_select();
        });

        let editor = null;
        $scope.aceLoaded =  (_editor:any):void => {
            editor = _editor;
            editor.setTheme("ace/theme/chrome");
            $scope.theme = 'chrome';
            $scope.mode = 'html';
            $scope.source = '';
            editor.setOptions({
                showGutter: true,
                enableBasicAutocompletion: true,
                enableSnippets: true,
                enableLiveAutocompletion: true
            });
        };

        $scope.aceChanged =  (e:any):void => {
            redraw_select();
        };

        let changeElementContents = (contents:any): void => {
            $scope.contents = contents;
            redraw_select();
        };

        let absolute_position = (target_element: any): {left: number, top: number} => {
            let left = 0;
            let top = 0;
            let element = target_element;

            while (element) {
                left += element.offsetLeft;
                top += element.offsetTop;
                element = element.offsetParent;
            }

            return {left: left, top: top};
        };

        let redraw_select: () => void = (): void => {
            if (FormBuilderService.Selected()) {

                let selected_element: any = FormBuilderService.Selected();
                let root_element: any = document.getElementById("box");
                let target_element: any = document.getElementById(selected_element.id);

                if (target_element) {

                    let root_position = absolute_position(root_element);
                    let target_position = absolute_position(target_element);

                    let select_reft: any = target_position.left - root_position.left;
                    let select_top: any = target_position.top - root_position.top;

                    let select_width: any = target_element.offsetWidth;
                    let select_height: any = target_element.offsetHeight;

                    mark.innerHTML = "<div style='float:right'>" + target_element.id + "</div>";

                    mark.style.top = "" + select_top + "px";
                    mark.style.left = "" + select_reft + "px";
                    mark.style.width = "" + select_width + "px";
                    mark.style.height = "" + select_height + "px";

                    mark.style.setProperty('display', 'block');
                }

            } else {
                mark.style.setProperty('display', 'none');
            }
            $scope.current_page = FormBuilderService.current_page;
        };

        let ElementSelect = (id: any): void => {

            FormBuilderService.Select(id,
                (element: any): void => {
                    $scope.selected_element_type = element.type;

                    let selected_element: any = FormBuilderService.Selected();

                    let target_element: any = document.getElementById(selected_element.id);// $event.target;

                    $scope.newid = element.id;

                    let style: any = element.attributes.style;
                    $scope.items = [];
                    if (style) {
                        $scope.items = style;
                    }
                    $scope.tab = {element_contents: element.contents};
                    $scope.attributes = element.attributes;

                    FormBuilderService.Draw((event) => {
                        if (event.name == "exit") {
                            redraw_select();
                        }
                    });
                },
                (element: any): void => {
                    redraw_select();
                    $scope.items = [];
                });

        };

        let ElementSelected = (id: any): boolean => {
            let result = false;
            let selected = FormBuilderService.Selected();
            if (selected) {
                result = (selected.id == id);
            }
            return result;
        };

        let edit = ($event: any, id: string): void => {

            $event.stopPropagation();
            $event.preventDefault();

            ElementSelect(id);
        };

        let deselect = (): void => {
            FormBuilderService.Deselect((selected) => {
            });
            redraw_select();
        };

        let up = (): void => {
            FormBuilderService.UpElement();
            redraw_select();
        };

        let down = (): void => {
            FormBuilderService.DownElement();
            redraw_select();
        };

        let addTag = (): void => {

            let modalRegist: any = $uibModal.open({
                controller: 'FormBuilderAddTagDialogController',
                templateUrl: '/forms/dialogs/elements/add_tag_dialog',
                resolve: {
                    items: null
                }
            });

            modalRegist.result.then((dialog_scope): void => {
                let new_tag = ElementsService.Tag(dialog_scope.tag, {class: "a", style: {"border-style": "solid", "border-color": "black", "border-width": "1px;"}});
                FormBuilderService.AddElement(new_tag);
            }, (): void => {
            });

        };

        let addDiv = (): void => {

            let modalRegist: any = $uibModal.open({
                controller: 'FormBuilderAddDivDialogController',
                templateUrl: '/forms/dialogs/elements/add_div_dialog',
                resolve: {
                    items: null
                }
            });

            modalRegist.result.then((dialog_scope): void => {
                FormBuilderService.AddElement(ElementsService.Div(dialog_scope.klass));
            }, (): void => {
            });

        };

        let addForm = (): void => {

            let add_field = (label: string): void => {
                let parent_id: any = FormBuilderService.ParentId("root");
                let id: any = FormBuilderService.CreateId("root");
                let new_form: any = {
                    kind: "control",
                    type: "form",
                    id: id,
                    elements: [
                        {
                            type: "form",
                            id: "form",
                            parent: "root",
                            label: "",
                            attributes: {name: "validate"},
                            contents: [],
                            events: {}
                        }
                    ]
                };
                FormBuilderService.AddElement(new_form);
            };

            let modalRegist: any = $uibModal.open({
                controller: 'FormBuilderAddStyleDialogController',
                templateUrl: '/forms/dialogs/add_style_dialog',
                resolve: {
                    items: null
                }
            });

            modalRegist.result.then((dialog_scope): void => {
                add_field(dialog_scope.key);
            }, (): void => {

            });
        };

        let addField = (): void => {

            let modalRegist: any = $uibModal.open({
                controller: 'FormBuilderAddFieldDialogController',
                templateUrl: '/forms/dialogs/elements/add_field_dialog',
                resolve: {
                    items: null
                }
            });

            modalRegist.result.then((dialog_scope): void => {
                let validator = {
                    min: {
                        value: dialog_scope.min.value,
                        message: dialog_scope.min.message
                    },
                    max: {
                        value: dialog_scope.max.value,
                        message: dialog_scope.max.message
                    },
                    pattern: {
                        value: dialog_scope.pattern.value,
                        message: dialog_scope.pattern.message
                    },
                    required: {
                        value: dialog_scope.required.value,
                        message: dialog_scope.required.message
                    }
                };

                FormBuilderService.AddElement(ElementsService.Field(dialog_scope.key, validator));
            }, (): void => {
            });
        };

        let addTextArea = (): void => {

            let modalRegist: any = $uibModal.open({
                controller: 'FormBuilderAddTextAreaDialogController',
                templateUrl: '/forms/dialogs/elements/add_textarea_dialog',
                resolve: {
                    items: null
                }
            });

            modalRegist.result.then((dialog_scope): void => {
                let validator = {min: {value: dialog_scope.min.value, message: dialog_scope.min.message}, max: {value: dialog_scope.max.value, message: dialog_scope.max.message}, required: {value: dialog_scope.required.value, message: dialog_scope.required.message}};
                FormBuilderService.AddElement(ElementsService.TextArea(dialog_scope.key, validator));
            }, (): void => {
            });
        };

        let addNumber = (): void => {

            let modalRegist: any = $uibModal.open({
                controller: 'FormBuilderAddNumberDialogController',
                templateUrl: '/forms/dialogs/elements/add_number_dialog',
                resolve: {
                    items: null
                }
            });

            modalRegist.result.then((dialog_scope): void => {
                let validator = {min: {value: dialog_scope.min.value, message: ""}, max: {value: dialog_scope.max.value, message: ""}, step: {value: dialog_scope.step.value, message: ""}};
                FormBuilderService.AddElement(ElementsService.Number(dialog_scope.key, validator));
            }, (): void => {
            });
        };

        let addHtml = (): void => {

            let modalRegist: any = $uibModal.open({
                controller: 'FormBuilderAddTextAreaDialogController',
                templateUrl: '/forms/dialogs/elements/add_textarea_dialog',
                resolve: {
                    items: null
                }
            });

            modalRegist.result.then((dialog_scope): void => {
                let validator = {min: {value: dialog_scope.min.value, message: dialog_scope.min.message}, max: {value: dialog_scope.max.value, message: dialog_scope.max.message}, required: {value: dialog_scope.required.value, message: dialog_scope.required.message}};
                FormBuilderService.AddElement(ElementsService.HtmlElement(dialog_scope.key, validator));
            }, (): void => {
            });
        };

        let addImg = (): void => {

            let modalRegist: any = $uibModal.open({
                controller: 'FormBuilderAddImgDialogController',
                templateUrl: '/forms/dialogs/elements/add_img_dialog',
                resolve: {
                    items: null
                }
            });

            modalRegist.result.then((dialog_scope): void => {
                let property = {};
                FormBuilderService.AddElement(ElementsService.Img(dialog_scope.key, property));
            }, (): void => {
            });
        };

        let addSelect = (): void => {

            let modalRegist: any = $uibModal.open({
                controller: 'FormBuilderAddSelectDialogController',
                templateUrl: '/forms/dialogs/elements/add_select_dialog',
                resolve: {
                    items: null
                }
            });

            modalRegist.result.then((dialog_scope): void => {
               let required = false;
               if (dialog_scope.requiredmessage) {
                   required = true;
               }
                let property = {contents: dialog_scope.contents, required: {value: required, message: dialog_scope.requiredmessage}};
                FormBuilderService.AddElement(ElementsService.Select(dialog_scope.key, property));
            }, (): void => {
            });
        };

        let addChack = (): void => {

            let modalRegist: any = $uibModal.open({
                controller: 'FormBuilderAddImgDialogController',
                templateUrl: '/forms/dialogs/elements/add_img_dialog',
                resolve: {
                    items: null
                }
            });

            modalRegist.result.then((dialog_scope): void => {
                let property = {};
                FormBuilderService.AddElement(ElementsService.Check(dialog_scope.key, property));
            }, (): void => {
            });
        };

        let addRadio = (): void => {

            let parent_id = FormBuilderService.ParentId("root");
            let id = FormBuilderService.CreateId("root");
            let new_field = {
                kind: "control",
                type: "radio",
                id: id,
                elements: [
                    {
                        type: "div",
                        id: id,
                        parent: parent_id,
                        editable: true,

                        label: "",
                        attributes: {style: {}},
                        contents: [],
                        events: {}
                    },

                    // radio element 1
                    {
                        type: "div",
                        id: "zzzz31",
                        parent: id,

                        label: "",
                        attributes: {class: "radio", style: {"margin": "30px"}},
                        contents: [],
                        events: {}
                    },
                    {
                        type: "label",
                        id: "zzzz311",
                        parent: "zzzz31",

                        label: "",
                        attributes: {},
                        contents: [],
                        events: {}
                    },
                    {
                        type: "input",
                        id: "zzzz3111",
                        parent: "zzzz311",

                        label: "zzzz3111" + "radio",
                        attributes: {type: "radio", id: "zzzz31111", "ng-model": "zzzz3", value: "b"},
                        contents: [],
                        events: {}
                    },
                    {
                        type: "label",
                        id: "zzzz3112",
                        parent: "zzzz311",

                        label: "",
                        attributes: {for: "zzzz31111", style: {"font-size": "32px"}},
                        contents: "label 1",
                        events: {}
                    },

                    // radio element 2
                    {
                        type: "div",
                        id: "zzzz32",
                        parent: "zzzz3",

                        label: "",
                        attributes: {class: "radio", style: {"margin": "30px"}},
                        contents: [],
                        events: {}
                    },
                    {
                        type: "label",
                        id: "zzzz321",
                        parent: "zzzz32",

                        label: "",
                        attributes: {},
                        contents: [],
                        events: {}
                    },
                    {
                        type: "input",
                        id: "zzzz3211",
                        parent: "zzzz321",

                        label: id + "zzzz32111",
                        attributes: {type: "radio", id: "zzzz32111", "ng-model": "zzzz3", value: "a"},
                        contents: [],
                        events: {}
                    },
                    {
                        type: "label",
                        id: "zzzz3212",
                        parent: "zzzz321",

                        label: "",
                        attributes: {for: "zzzz32111", style: {"font-size": "32px"}},
                        contents: "label 2",
                        events: {}
                    }
                ]
            };

            FormBuilderService.AddElement(new_field);
        };

        let addButton = (): void => {
            let parent_id = FormBuilderService.ParentId("root");
            let id = FormBuilderService.CreateId("root");

            let new_text = {
                kind: "static",
                type: "text",
                id: id,
                elements: [
                    {
                        type: "div",
                        id: "sssss",
                        parent: parent_id,
                        editable: true,

                        label: "",
                        attributes: {style: {"background-color": "rgba(120,120,120,0.1)"}},
                        contents: "Its New",
                        events: {}
                    }
                ]
            };

            let new_field = {
                kind: "control",
                type: "field",
                id: id,
                elements: [
                    {
                        type: "div",
                        id: id,
                        parent: parent_id,
                        editable: true,

                        label: "",
                        attributes: {class: "form-group", style: {}},
                        contents: [],
                        events: {}
                    },
                    {
                        type: "label",
                        id: "fieldlabel",
                        parent: id,

                        label: "",
                        attributes: {for: "fieldmodel"},
                        contents: "Label",
                        events: {}
                    },
                    {
                        type: "span",
                        id: "fielderrors",
                        parent: id,

                        label: "",
                        attributes: {"ng-messages": "validate." + "fieldmodel" + ".$error"},
                        contents: [],
                        events: {}
                    },
                    {
                        type: "span",
                        id: "fielderror1",
                        parent: "fielderrors",

                        label: "",
                        attributes: {"ng-message": "required", class: "error-message"},
                        contents: "必須です",
                        events: {}
                    },
                    {
                        type: "span",
                        id: "fielderror2",
                        parent: "fielderrors",

                        label: "",
                        attributes: {"ng-message": "minlength", class: "error-message"},
                        contents: "もう少し長く",
                        events: {}
                    },
                    {
                        type: "span",
                        id: "fielderror3",
                        parent: "fielderrors",

                        label: "",
                        attributes: {"ng-message": "maxlength", class: "error-message"},
                        contents: "もう少し短く",
                        events: {}
                    },
                    {
                        type: "input",
                        id: "fieldinput",
                        parent: id,

                        label: id + "button",
                        attributes: {class: "form-control", "ng-model": id, type: "text", name: id, style: {"font-size": "32px"}, "ng-maxlength": "50", "ng-minlength": "0", required: "true"},
                        contents: [],
                        events: {onChange: ""}
                    }
                ]
            };

            let new_div = {
                kind: "control",
                type: "field",
                id: id,
                elements: [
                    {
                        type: "div",
                        id: id,
                        parent: parent_id,
                        editable: true,

                        label: "",
                        attributes: {style: {"border-style": "solid", "border-color": "black", "border-width": "1px;"}},
                        contents: id,
                        events: {}
                    },

                ]
            };

            FormBuilderService.AddElement(new_field);
        };

        let addChips = (): void => {

            let modalRegist: any = $uibModal.open({
                controller: 'FormBuilderAddChipsDialogController',
                templateUrl: '/forms/dialogs/elements/add_chips_dialog',
                resolve: {
                    items: null
                }
            });

            modalRegist.result.then((dialog_scope): void => {
                let property = {contents: []};
                FormBuilderService.AddElement(ElementsService.Chips(dialog_scope.key, property));
            }, (): void => {
            });
        };

        let addAddress = (): void => {

            let modalRegist: any = $uibModal.open({
                controller: 'FormBuilderAddChipsDialogController',
                templateUrl: '/forms/dialogs/elements/add_chips_dialog',
                resolve: {
                    items: null
                }
            });

            modalRegist.result.then((dialog_scope): void => {
                let property = {contents: []};
                let new_address = ElementsService.Address(dialog_scope.key, property);
                FormBuilderService.AddElement(new_address);
            }, (): void => {
            });
        };

        let DeleteElement = (): void => {
            FormBuilderService.DeleteElement();
            redraw_select();
        };

        let setmode = (mode: boolean): void => {
            FormBuilderService.SetEditMode(mode, (element) => {
                redraw_select();
            });
        };

        let redraw = (page_no: number): void => {
            FormBuilderService.current_page = pages[page_no].contents;
            FormBuilderService.Draw((event) => {
                if (event.name == "exit") {
                    redraw_select();
                }
            });
        };

        let contents_update = (value: string): void => {
            let target = FormBuilderService.Selected();
            if (target) {
                target.contents = value;
                FormBuilderService.Draw((event) => {
                    if (event.name == "exit") {
                        redraw_select();
                    }
                });
            }
        };

        let attribute_value_update = (key: string, value: string): void => {
            let target = FormBuilderService.Selected();
            if (target) {
                target.attributes[key] = value;
                FormBuilderService.Draw((event) => {
                    if (event.name == "exit") {
                        redraw_select();
                    }
                });
            }
        };

        let style_value_update = (key: string, value: string): void => {
            let target = FormBuilderService.Selected();
            if (target) {
                target.attributes.style[key] = value;
                FormBuilderService.Draw((event) => {
                    if (event.name == "exit") {
                        redraw_select();
                    }
                });
            }
        };

        let remove_attribute = (key: string): boolean => {
            let result: boolean = false;
            if (key != 'style') {
                let target = FormBuilderService.Selected();
                if (target) {
                    if (key in target.attributes) {
                        delete target.attributes[key];
                        FormBuilderService.Draw((event) => {
                            if (event.name == "exit") {
                                redraw_select();
                            }
                        });
                        result = true;
                    }
                }
            }
            return result;
        };

        let remove_style = (key: string): boolean => {
            let result: boolean = false;
            let target = FormBuilderService.Selected();
            if (target) {
                if (key in target.attributes.style) {
                    delete target.attributes.style[key];
                    FormBuilderService.Draw((event) => {
                        if (event.name == "exit") {
                            redraw_select();
                        }
                    });
                    result = true;
                }
            }
            return result;
        };

        let add_attribute = (): void => {

            let add_attribute = (key: string, value: string): boolean => {
                let result: boolean = false;
                if (key != 'style') {
                    let target = FormBuilderService.Selected();
                    if (target) {
                        if (!(key in target.attributes)) {
                            target.attributes[key] = value;
                            FormBuilderService.Draw((event) => {
                                if (event.name == "exit") {
                                    redraw_select();
                                }
                            });
                            result = true;
                        }
                    }
                }
                return result;
            };

            let modalRegist: any = $uibModal.open({
                controller: 'FormBuilderAddAttributeDialogController as dialog',
                templateUrl: '/forms/dialogs/add_attribute_dialog',
                resolve: {
                    items: null
                }
            });

            modalRegist.result.then((dialog_scope): void => {
                add_attribute(dialog_scope.key, dialog_scope.value);
            }, (): void => {
            });

        };

        let add_style = (): void => {

            let add_style = (key: string, value: string): boolean => {
                let result: boolean = false;
                let target = FormBuilderService.Selected();
                if (target) {

                    if (!target.attributes.style) {
                        target.attributes["style"] = {};
                    }

                    if (!(key in target.attributes.style)) {
                        target.attributes.style[key] = value;
                        FormBuilderService.Draw((event) => {
                            if (event.name == "exit") {
                                redraw_select();
                            }
                        });
                        result = true;
                    }
                }
                return result;
            };

            let modalRegist: any = $uibModal.open({
                controller: 'FormBuilderAddStyleDialogController as dialog',
                templateUrl: '/forms/dialogs/add_style_dialog',
                resolve: {
                    items: null
                }
            });

            modalRegist.result.then((dialog_scope): void => {
                add_style(dialog_scope.key, dialog_scope.value);
            }, (): void => {
            });

        };

        let Create = (): void => {

            let modalRegist: any = $uibModal.open({
                controller: 'FormBuilderCreateDialogController',
                templateUrl: '/forms/dialogs/create_dialog',
                resolve: {
                    items: $scope
                }
            });

            modalRegist.result.then((layout: any): void => {

                $scope.layout = layout;
                $scope.name = layout.name;
                $scope.userid = layout.userid;
                $scope.opened = true;
                FormBuilderService.current_page = layout.content;
                FormBuilderService.Draw((event: any): void => {
                    if (event.name == "exit") {
                        redraw_select();
                    }
                });

            }, (): void => {
            });

        };

        let Open = (): void => {
            let modalRegist: any = $uibModal.open({
                controller: 'FormBuilderOpenDialogController',
                templateUrl: '/forms/dialogs/open_dialog',
                resolve: {
                    items: $scope
                }
            });

            modalRegist.result.then((layout: any): void => {

                $scope.layout = layout;
                $scope.name = layout.name;
                $scope.userid = layout.userid;
                $scope.opened = true;
                FormBuilderService.current_page = layout.content;
                FormBuilderService.Draw((event: any): void => {
                    if (event.name == "exit") {
                        redraw_select();
                    }
                });

            }, (): void => {
            });
        };

        let Update = (): void => {
            if (FormBuilderService.current_page) {
                progress(true);
                FormBuilderService.Put(FormBuilderService.current_page, (result: any): void => {
                    progress(false);
                }, error_handler);
            }
        };

        let Delete = (): void => {
            if (FormBuilderService.current_page) {
                let modalRegist: any = $uibModal.open({
                    controller: 'FormBuilderDeleteConfirmController',
                    templateUrl: '/forms/dialogs/delete_confirm_dialog',
                    resolve: {
                        items: (): any => {
                            return FormBuilderService.current_page;
                        }
                    }
                });

                modalRegist.result.then((content): void => {
                    progress(true);
                    FormBuilderService.Delete((result: any): void => {
                        $scope.name = "";
                        FormBuilderService.current_page = [];
                        FormBuilderService.Draw((event) => {
                            if (event.name == "exit") {
                                redraw_select();
                            }
                        });
                        progress(false);
                        $scope.opened = false;
                    }, error_handler);
                }, (): void => {
                });
            }
        };

        $scope.opened = false;
        $scope.edit_mode = false;

        $scope.changeElementContents = changeElementContents;
        $scope.ElementSelect = ElementSelect;
        $scope.ElementSelected = ElementSelected;
        $scope.edit = edit;
        $scope.up = up;
        $scope.down = down;
        $scope.deselect = deselect;
        $scope.addTag = addTag;
        $scope.addDiv = addDiv;
        $scope.addForm = addForm;
        $scope.addField = addField;
        $scope.addTextArea = addTextArea;
        $scope.addNumber = addNumber;
        $scope.addHtml = addHtml;
        $scope.addImg = addImg;
        $scope.addSelect = addSelect;
        $scope.addChack = addChack;
        $scope.addRadio = addRadio;
        $scope.addButton = addButton;
        $scope.addChips = addChips;
        $scope.delete = DeleteElement;
        $scope.setmode = setmode;
        $scope.redraw = redraw;
        $scope.contents_update = contents_update;
        $scope.attribute_value_update = attribute_value_update;
        $scope.style_value_update = style_value_update;
        $scope.remove_attribute = remove_attribute;
        $scope.remove_style = remove_style;
        $scope.add_attribute = add_attribute;
        $scope.add_style = add_style;
        $scope.Create = Create;
        $scope.Open = Open;
        $scope.Update = Update;
        $scope.Delete = Delete;

        $scope.$watch('class', () => {
            let target = FormBuilderService.Selected();
            if (target) {
                if ($scope.class) {
                    target.attributes.class = $scope.class;
                    FormBuilderService.Draw((event) => {
                        if (event.name == "exit") {
                            redraw_select();
                        }
                    });
                }
            }
        });

        $scope.$watch('contents', () => {
            let target = FormBuilderService.Selected();
            if (target) {
                target.contents = $scope.contents;
                FormBuilderService.Draw((event) => {
                    if (event.name == "exit") {
                        redraw_select();
                    }
                });
            }
        });

        FormBuilderService.$scope = $scope;
        FormBuilderService.$compile = $compile;

    }]);

FormBuilderControllers.controller('FormBuilderAddStyleDialogController', ['$uibModalInstance', 'items',
    function ($uibModalInstance: any, items: any): void {

        this.hide = (): void => {
            $uibModalInstance.close();
        };

        this.cancel = (): void => {
            $uibModalInstance.dismiss();
        };

        this.answer = (): void => {
            $uibModalInstance.close(this);
        };

    }]);

FormBuilderControllers.controller('FormBuilderAddAttributeDialogController', ['$uibModalInstance', 'items',
    function ($uibModalInstance: any, items: any): void {

        this.hide = (): void => {
            $uibModalInstance.close();
        };

        this.cancel = (): void => {
            $uibModalInstance.dismiss();
        };

        this.answer = (): void => {
            $uibModalInstance.close(this);
        };

    }]);

FormBuilderControllers.controller('FormBuilderAddTagDialogController', ['$scope', '$uibModalInstance', 'items',
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

FormBuilderControllers.controller('FormBuilderAddDivDialogController', ['$scope', '$uibModalInstance', 'items',
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

FormBuilderControllers.controller('FormBuilderAddFieldDialogController', ['$scope', '$uibModalInstance', 'items',
    ($scope: any, $uibModalInstance: any, items: any): void => {

        $scope.min = {value: 5, message: 'もう少し長く'};
        $scope.max = {value: 100, message: 'もう少し短く'};
        $scope.required = {value: false, message: '必須です'};

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

FormBuilderControllers.controller('FormBuilderAddNumberDialogController', ['$scope', '$uibModalInstance', 'items',
    ($scope: any, $uibModalInstance: any, items: any): void => {

        $scope.min = {value: 0, message: ''};
        $scope.max = {value: 100, message: ''};
        $scope.step = {value: 1, message: ''};

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

FormBuilderControllers.controller('FormBuilderAddTextAreaDialogController', ['$scope', '$uibModalInstance', 'items',
    ($scope: any, $uibModalInstance: any, items: any): void => {

        $scope.min = {value: 5, message: 'もう少し長く'};
        $scope.max = {value: 100, message: 'もう少し短く'};
        $scope.required = {value: false, message: '必須です'};

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

FormBuilderControllers.controller('FormBuilderAddImgDialogController', ['$scope', '$uibModalInstance', 'items',
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

FormBuilderControllers.controller('FormBuilderAddSelectDialogController', ['$scope', '$uibModalInstance', 'items',
    ($scope: any, $uibModalInstance: any, items: any): void => {

        $scope.contents = [];

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

FormBuilderControllers.controller('FormBuilderAddChipsDialogController', ['$scope', '$uibModalInstance', 'items',
    ($scope: any, $uibModalInstance: any, items: any): void => {

        $scope.contents = [];

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

FormBuilderControllers.controller('FormBuilderAddElementDialogController', ['$scope', '$uibModalInstance', 'items',
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

FormBuilderControllers.controller('FormBuilderCreateDialogController', ['$scope', '$log', '$uibModalInstance', 'FormBuilderService', 'items',
    ($scope: any, $log: any, $uibModalInstance: any, FormBuilderService: any, items: any): void => {

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

        $scope.type = 1;

        $scope.hide = (): void => {
            $uibModalInstance.close();
        };

        $scope.cancel = (): void => {
            $uibModalInstance.dismiss();
        };

        $scope.answer = (): void => {
            progress(true);
            FormBuilderService.Create($scope.title, $scope.type, (result: any): void => {
                progress(false);
                $scope.message = "";
                $uibModalInstance.close(result);
            }, error_handler);
        };

    }]);

FormBuilderControllers.controller('FormBuilderOpenDialogController', ['$scope', '$log', '$uibModalInstance', '$uibModal', 'items', 'FormBuilderService',
    ($scope: any, $log: any, $uibModalInstance: any, $uibModal: any, items: any, FormBuilderService: any): void => {

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
            FormBuilderService.query = {};
            FormBuilderService.Query((result: any): void => {
                if (result) {
                    $scope.pages = result;
                }
                progress(false);
            }, error_handler);
        };

        let Find = (name: string): any => {
            progress(true);
            FormBuilderService.query = {};
            if (name) {
                FormBuilderService.query = {name: name};
            }
            FormBuilderService.Query((result: any): void => {
                if (result) {
                    $scope.pages = result;
                }
                progress(false);
            }, error_handler);
        };

        let Count = (): void => {
            FormBuilderService.Count((result: any): void => {
                if (result) {
                    $scope.count = result;
                }
            }, error_handler);
        };

        let Next = (): void => {
            progress(true);
            FormBuilderService.Next((result: any): void => {
                if (result) {
                    $scope.pages = result;
                }
                progress(false);
            }, error_handler);
        };

        let Prev = (): void => {
            progress(true);
            FormBuilderService.Prev((result: any): void => {
                if (result) {
                    $scope.pages = result;
                }
                progress(false);
            }, error_handler);
        };

        let Get = (layout: any): void => {
            progress(true);
            FormBuilderService.Get(layout._id, (result: any): void => {
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

FormBuilderControllers.controller('FormBuilderDeleteConfirmController', ['$scope', '$uibModalInstance', 'items',
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