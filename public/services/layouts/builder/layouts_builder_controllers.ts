/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

/// <reference path="../../../systems/common/shape_edit/shape_edit.ts" />
/// <reference path="../../../systems/common/shape_edit/server_canvas.ts" />
/// <reference path="../../../systems/common/shape_edit/adaptor.ts" />

"use strict";

let BuilderControllers: angular.IModule = angular.module('BuilderControllers', ['ui.bootstrap', 'ui.ace']);

BuilderControllers.controller('BuilderController', ["$scope", '$document', '$log', '$window', "$compile", '$uibModal', 'ShapeEdit', 'TemplateService',
    ($scope: any, $document: any, $log: any, $window: any, $compile: any, $uibModal: any, ShapeEdit: any, TemplateService: any): void => {

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

        window.addEventListener('beforeunload', (event:any) => {
            if ($scope.opened) {
                event.returnValue = '';
            }
        }, false);

        window.addEventListener("keydown", (event:any) => {
            ShapeEdit.Canvas.onKeyDown(event);
        });

        window.addEventListener("keyup", (event:any) => {
            ShapeEdit.Canvas.onKeyUp(event);
        });

        let EditClear: () => void = (): void => {
            _.each(ShapeEdit.Input, function (element: any, id: any): void {
                ShapeEdit.Wrapper.removeChild(element);
                delete ShapeEdit.Input[id];
            });
        };

        WebFont.load({
            google: {
                families: ['Pacifico::latin']
            },
            loading: function () {
                // ロードが開始されたとき
                let a = 1;
            },
            active: function () {
                // Web Fontが使用可能になったとき
                let a = 1;
            },
            inactive: function () {
                // ブラウザがサポートしていないとき
                let a = 1;
            },
            fontloading: function (fontFamily, fontDescription) {
                // fontFamilyのロードが開始されたとき
                let a = 1;
            },
            fontactive: function (fontFamily, fontDescription) {
                let a = 1;
            },
            fontinactive: function (fontFamily, fontDescription) {
                // fontFamilyをブラウザがサポートしていないとき
                let a = 1;
            }
        });

        let Font_Display: () => void = (): void => {
            $scope.fontfills = ShapeEdit.Canvas.CurrentFillColor().RGB();
            $scope.fontsize = ShapeEdit.Canvas.CurrentFontSize();
            $scope.FontKeyword = ShapeEdit.Canvas.CurrentFontKeyword();
            $scope.FontWeight = ShapeEdit.Canvas.CurrentFontWeight();
            $scope.FontVariant = ShapeEdit.Canvas.CurrentFontVariant();
            $scope.FontStyle = ShapeEdit.Canvas.CurrentFontStyle();
            $scope.FontFamily = ShapeEdit.Canvas.CurrentFontFamily()[0];
            $scope.path = ShapeEdit.Canvas.CurrentPath();
        };

        let Select: (shape: any) => void = (shape: any): void => {
            let loc = shape.Location();
            $scope.x = loc.x;
            $scope.y = loc.y;

            let size = shape.Size();
            $scope.w = size.w;
            $scope.h = size.h;

            let property: any = shape.Property();
            let fields: any = property.description["field"];
            $scope.fields = fields;
            $scope.strokewidth = shape.StrokeWidth();
            $scope.fills = shape.FillColor().RGB();
            $scope.strokefills = shape.StrokeColor().RGB();
            $scope.fontsize = shape.FontSize();
            $scope.FontKeyword = shape.FontKeyword();
            $scope.FontWeight = shape.FontWeight();
            $scope.FontVariant = shape.FontVariant();
            $scope.FontStyle = shape.FontStyle();
            $scope.FontFamily = shape.FontFamily()[0];

            $scope.path = property.path;
        };

        let Deselect: () => void = (): void => {
   /*         $scope.x = 0;
            $scope.y = 0;
            $scope.w = 0;
            $scope.h = 0;

            $scope.fields = null;
            $scope.fills = null;
            $scope.strokewidth = 0;
            $scope.strokefills = null;
            $scope.fontsize = 0;
            $scope.FontKeyword = "";
            $scope.FontWeight = 0;
            $scope.FontVariant = null;
            $scope.FontStyle = 0;
            $scope.path = "";
            */
        };

        let aceOption = {
            onLoad: (_ace) => {
                _ace.setTheme("ace/theme/monokai");
                _ace.getSession().setMode("ace/mode/javascript");
            }
        };

        let changeText = (): void => {
            if (ShapeEdit.Canvas) {
                ShapeEdit.Canvas.SetCurrentText($scope.text);
            }
        };

        let IsOpen = (): boolean => {
            return ShapeEdit.IsOpen;
        };

        let ToTop = () => {
            ShapeEdit.Canvas.ToTop();
        };

        let ToBottom = () => {
            ShapeEdit.Canvas.ToBottom();
        };

        let Lock = () => {
            ShapeEdit.Canvas.Lock();
        };

        let UnLockAll = () => {
            ShapeEdit.Canvas.UnLockAll();
        };

        let Group = () => {
            ShapeEdit.Canvas.Group();
        };

        let Ungroup = () => {
            ShapeEdit.Canvas.Ungroup();
        };

        let Copy = () => {
            ShapeEdit.Canvas.Copy();
        };

        let Paste = () => {
            ShapeEdit.Canvas.Paste();
        };

        let SetAlign = (align:number) => {
            ShapeEdit.Canvas.SetCurrentShapesAlign(align);
        };

        let Create = (): void => {

            let modalRegist: any = $uibModal.open({
                controller: 'BuilderCreateDialogController',
                templateUrl: '/layouts/builder/dialogs/create_dialog',
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

        let Open = () => {
            let modalRegist: any = $uibModal.open({
                controller: 'BuilderOpenDialogController',
                templateUrl: '/layouts/builder/dialogs/open_dialog',
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

        let Update = (): void => {
            if (TemplateService.current_layout) {
                progress(true);
                TemplateService.current_layout.content.text = ShapeEdit.Serialize();
                TemplateService.Put(TemplateService.current_layout, (result: any): void => {
                    progress(false);
                }, error_handler);
            }
        };

        //
        let UpdateAs = (): void => {
            let modalRegist: any = $uibModal.open({
                controller: 'BuilderSaveAsDialogController',
                templateUrl: '/layouts/builder/dialogs/saveas_dialog',
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
            if (TemplateService.current_layout) {
                let modalRegist: any = $uibModal.open({
                    controller: 'BuilderDeleteConfirmController',
                    templateUrl: '/layouts/builder/dialogs/delete_confirm_dialog',
                    resolve: {
                        items: (): any => {
                            return TemplateService.current_layout;
                        }
                    }
                });

                modalRegist.result.then((content): void => {
                    progress(true);
                    TemplateService.Delete((result: any): void => {
                        TemplateService.current_layout = null;
                        progress(false);
                        ShapeEdit.Clear();
                        $scope.opened = true;
                    }, error_handler);
                }, (): void => {
                });
            }
        };

        let PrintPNG = () => {
            let width, height;

            ShapeEdit.Canvas.Snap();

            switch (TemplateService.format.layout) {
                case "portrait":
                    width = TemplateService.format.size[0];
                    height = TemplateService.format.size[1];
                    break;
                case "landscape":
                    width = TemplateService.format.size[1];
                    height = TemplateService.format.size[0];
                    break;
                default:
            }
            Canvas2Image.saveAsPNG(ShapeEdit.CanvasElement, width, height);
        };

        let PrintPDF = () => {
            progress(true);
            TemplateService.current_layout.content.text = ShapeEdit.Serialize();
            TemplateService.current_layout.content.format = TemplateService.format;

            TemplateService.PrintPDF(TemplateService.current_layout, (result: any): void => {
                progress(false);
                $window.location.href = "/layouts/download/pdf"
            }, error_handler);
        };

        let PrintSVG = () => {
            progress(true);
            TemplateService.current_layout.content.text = ShapeEdit.Serialize();
            TemplateService.PrintSVG(TemplateService.current_layout, (result: any): void => {
                progress(false);
                $window.location.href = "/layouts/download/svg"
            }, error_handler);
        };

        let ChangeEditMode = (mode: string): void => {
            switch (mode) {
                case 'move':
                    ShapeEdit.Canvas.SetMode(ShapeEdit.Mode.move);
                    break;
                case 'draw':
                    ShapeEdit.Canvas.SetMode(ShapeEdit.Mode.draw);
                    break;
                case 'bezierdraw':
                    ShapeEdit.Canvas.SetMode(ShapeEdit.Mode.bezierdraw);
                    break;
                default:
                    break;
            }
        };

        let changeLocationX = (x: number): void => {
            let loc = ShapeEdit.Canvas.CurrentLocation();
            loc.x = x;
            ShapeEdit.Canvas.SetCurrentLocation(loc);
        };

        let changeLocationY = (y: number): void => {
            let loc = ShapeEdit.Canvas.CurrentLocation();
            loc.y = y;
            ShapeEdit.Canvas.SetCurrentLocation(loc);
        };

        let changeSizeW = (w: number): void => {
            let size = ShapeEdit.Canvas.CurrentSize();
            size.w = w;
            ShapeEdit.Canvas.SetCurrentSize(size);
        };

        let changeSizeH = (h: number): void => {
            let size = ShapeEdit.Canvas.CurrentSize();
            size.h = h;
            ShapeEdit.Canvas.SetCurrentSize(size);
        };

        let strokewidthChange = (stroke: number): void => {
            let color: ShapeEdit.RGBAColor = null;
                ShapeEdit.Canvas.SetCurrentStrokeWidth(stroke);
        };

        let pathChange = (path: string): void => {
            ShapeEdit.Canvas.SetCurrentPath(path);
        };

        let changeFontStyle = (fontstyle: string): void => {
            if (ShapeEdit.Canvas) {
                ShapeEdit.Canvas.SetCurrentFontStyle(fontstyle);
                Font_Display();
            }
        };

        // 太さ   normal、bold、lighter、bolder、または100〜900の9段階
        let changeFontWeigt = (fontweight: string): void => {
            if (ShapeEdit.Canvas) {
                ShapeEdit.Canvas.SetCurrentFontWeight(fontweight);
                Font_Display();
            }
        };

        // font names
        let changeFontAlign = (FontAlign: string): void => {
            if (ShapeEdit.Canvas) {
                ShapeEdit.Canvas.SetCurrentAlign(FontAlign);
                Font_Display();
            }
        };

        let fontsizeChange = (fontsize: number): void => {
            if (ShapeEdit.Canvas) {
                ShapeEdit.Canvas.SetCurrentFontSize(fontsize);
                Font_Display();
            }
        };

        let labelChange = (label, index) => {
            if (label) {
                let shapes = ShapeEdit.Canvas.Selected();
                if (shapes.length != 0) {
                    shapes[0].Property().description["field"][index].label = label;
                }
            }
        };

        let modeChange = (mode, index) => {
            if (mode) {
                let shapes = ShapeEdit.Canvas.Selected();
                if (shapes.length != 0) {
                    shapes[0].Property().description["field"][index].mode = mode;
                }
            }
        };

        let typeChange = (type, index) => {
            if (type) {
                let shapes = ShapeEdit.Canvas.Selected();
                if (shapes.length != 0) {
                    shapes[0].Property().description["field"][index].type = type;
                }
            }
        };

        let requiredChange = (required, index) => {
            if (required) {
                let shapes = ShapeEdit.Canvas.Selected();
                if (shapes.length != 0) {
                    shapes[0].Property().description["field"][index].validate.required = (required == "true");
                }
            }
        };

        let maxlengthChange = (maxlength, index) => {
            if (maxlength) {
                let shapes = ShapeEdit.Canvas.Selected();
                if (shapes.length != 0) {
                    shapes[0].Property().description["field"][index].validate["ng-maxlength"] = Number(maxlength);
                }
            }
        };

        let minlengthChange = (minlength, index) => {
            if (minlength) {
                let shapes = ShapeEdit.Canvas.Selected();
                if (shapes.length != 0) {
                    shapes[0].Property().description["field"][index].validate["ng-minlength"] = Number(minlength);
                }
            }
        };

        let optionsChange = (options, index) => {
            if (options) {
                let shapes = ShapeEdit.Canvas.Selected();
                if (shapes.length != 0) {
                    shapes[0].Property().description["field"][index].options = options;
                }
            }
        };

        let onChangeChange = (onChange, index) => {
            if (onChange) {
                let shapes = ShapeEdit.Canvas.Selected();
                if (shapes.length != 0) {
                    shapes[0].Property().description["field"][index].events = {onChange: onChange};
                }
            }
        };

        let lookupChange = (lookup, index) => {
            if (lookup) {
                let shapes = ShapeEdit.Canvas.Selected();
                if (shapes.length != 0) {
                    shapes[0].Property().description["field"][index].lookup = lookup;
                }
            }
        };

        let AddText = (): void => {
            var obj = {
                rectangle: new ShapeEdit.Rectangle(200, 200, 100, 30),
                property: new ShapeEdit.ShapeProperty(ShapeEdit.Canvas, 'テキスト', [], '', new ShapeEdit.RGBAColor(80, 80, 80, 1), new ShapeEdit.RGBAColor(80, 80, 80, 1), 0, new ShapeEdit.Font("normal", "normal", "normal", 24, "sans-serif", ["noto"]), "left", "miter", {
                    "category": "",
                    "type": ""
                })
            };
            var text = new ShapeEdit.Text(ShapeEdit.Canvas, obj);
            ShapeEdit.Canvas.Add(text);
        };

        let AddBox = (): void => {
            var obj = {
                rectangle: new ShapeEdit.Rectangle(200, 200, 100, 100),
                property: new ShapeEdit.ShapeProperty(ShapeEdit.Canvas, '', [], '', new ShapeEdit.RGBAColor(0, 0, 0, 1), new ShapeEdit.RGBAColor(80, 80, 80, 1), 0, new ShapeEdit.Font("normal", "normal", "normal", 18, "sans-serif", []), "left", "miter", {
                    "category": "",
                    "type": ""
                })
            };
            var box = new ShapeEdit.Box(ShapeEdit.Canvas, obj);
            ShapeEdit.Canvas.Add(box);
        };

        let AddOval = (): void => {
            var obj = {
                rectangle: new ShapeEdit.Rectangle(200, 200, 100, 100),
                property: new ShapeEdit.ShapeProperty(ShapeEdit.Canvas, '', [], '', new ShapeEdit.RGBAColor(0, 0, 0, 1), new ShapeEdit.RGBAColor(80, 80, 80, 1), 0, new ShapeEdit.Font("normal", "normal", "normal", 18, "sans-serif", []), "left", "miter", {
                    "category": "",
                    "type": ""
                })
            };
            var rect = new ShapeEdit.Oval(ShapeEdit.Canvas, obj);
            ShapeEdit.Canvas.Add(rect);
        };

        let AddBezier = (): void => {
            let obj = {
                rectangle: new ShapeEdit.Rectangle(200, 200, 100, 100),
                property: new ShapeEdit.ShapeProperty(ShapeEdit.Canvas, '', [], '', new ShapeEdit.RGBAColor(0, 0, 0, 1), new ShapeEdit.RGBAColor(0, 0, 0, 1), 1, new ShapeEdit.Font("", "", "", 18, "sans-serif", []), "", "miter", {
                    "category": "",
                    "type": ""
                })
            };
            let context: ShapeEdit.Bezier = new ShapeEdit.Bezier(ShapeEdit.Canvas, obj);

            context.bezierCurveTo(310.17, 147.19, 310.17, 97.81, 271.5, 67.35);
            context.bezierCurveTo(232.84, 36.88, 170.16, 36.88, 131.5, 67.35);
            context.bezierCurveTo(92.83, 97.81, 92.83, 147.19, 131.5, 177.65);
            context.bezierCurveTo(170.16, 208.12, 232.84, 208.12, 271.5, 177.65);

            context.ResizeRectangle();

            ShapeEdit.Canvas.Add(context);
        };

        let AddImage = (): void => {
            var obj = {
                rectangle: new ShapeEdit.Rectangle(200, 200, 200, 200),
                property: new ShapeEdit.ShapeProperty(ShapeEdit.Canvas, '', [], '/systems/resources/files/blank.png', new ShapeEdit.RGBAColor(0, 0, 0, 1), new ShapeEdit.RGBAColor(80, 80, 80, 1), 1, new ShapeEdit.Font("normal", "normal", "normal", 18, "sans-serif", []), "left", "miter", {
                    "category": "",
                    "type": ""
                })
            };
            var image = new ShapeEdit.ImageRect(ShapeEdit.Canvas, obj);
            ShapeEdit.Canvas.Add(image);
        };

        let DeleteSelected = (): void => {
            ShapeEdit.Canvas.DeleteSelected();
        };

        let SelectedCount = (): number => {
            return ShapeEdit.Canvas.SelectedCount();
        };

        ShapeEdit.onTick((shape: ShapeEdit.BaseShape, context: any): any => {
            return context;
        });

        ShapeEdit.onDraw((shape: ShapeEdit.BaseShape, context: any): void => {

        });

        ShapeEdit.onNew((shape: ShapeEdit.BaseShape): void => {
            switch (shape.type) {
                case "Text": {
                    shape.Property().description["field"] = {
                        text: {
                            label: "text",  // shape.ID(),
                            type: "text",
                            mode: "static",
                            validate: {required: true, "ng-maxlength": 50, "ng-minlength": 10},
                            options: [],
                            events: {onChange: ""},
                            lookup: ""
                        },
                        color: {
                            label: "color",
                            type: "color",
                            mode: "static",
                            validate: {required: true, "ng-maxlength": 7, "ng-minlength": 7},
                            options: [],
                            events: {onChange: ""},
                            lookup: ""
                        }
                    };
                }
                    break;
                case "Box":
                case "Oval":
                case "Polygon" :
                case "Bezier" :
                case "Shapes": {
                    shape.Property().description["field"] = {
                        color: {
                            label: "color",
                            type: "color",
                            mode: "static",
                            validate: {required: true, "ng-maxlength": 7, "ng-minlength": 7},
                            options: [],
                            events: {onChange: ""},
                            lookup: ""
                        }
                    };
                }
                    break;
                case "ImageRect": {
                    shape.Property().description["field"] = {
                        text: {
                            label: "text",  // shape.ID(),
                            type: "text",
                            mode: "static",
                            validate: {required: true, "ng-maxlength": 50, "ng-minlength": 10},
                            options: [],
                            events: {onChange: ""},
                            lookup: ""
                        }
                    };
                }
            }
        });

        ShapeEdit.onResizeWindow((wrapper, inner): void => {
        });

        ShapeEdit.onSelect((shape: ShapeEdit.BaseShape, context: any): void => {
            // for inPlace text input

            if (ShapeEdit.Canvas.SelectedCount() === 1) {
                if (shape.Parent().IsRoot()) {

                    switch (shape.type) {
                        case "Text" :                                               //for inPlace Input  only Text
                            $scope.$evalAsync(   // $apply
                                function ($scope) {
                                    let id: any = shape.ID();
                                    $scope.id = id;
                                    $scope.text = shape.Property().text;
                                    Select(shape);
                                    $scope.SelectType = "Text";
                                }
                            );
                            break;
                        case "Box":
                        case "Oval":
                        case "Polygon" :
                        case "Bezier" :
                        case "Shapes": {
                            $scope.$evalAsync(   // $apply
                                function ($scope) {
                                    let id: any = shape.ID();
                                    $scope.id = id;
                                    Select(shape);
                                    $scope.SelectType = "Shape";
                                }
                            );
                        }
                            break;

                        case "ImageRect": {
                            $scope.$evalAsync(   // $apply
                                function ($scope) {
                                    let id: any = shape.ID();
                                    $scope.id = id;
                                    Select(shape);
                                    $scope.SelectType = "Image";
                                }
                            );
                        }
                            break;

                        default:
                    }
                }
            } else {
                EditClear();     // for inPlace text input
            }
        });

        ShapeEdit.onDelete((shape: ShapeEdit.BaseShape): void => {
            $scope.id = null;
            Deselect();
            $scope.SelectType = "";
            $scope.SelectImage = false;
        });

        ShapeEdit.onDeselect((shape: ShapeEdit.BaseShape, context: any): void => {
            $scope.$evalAsync(   // $apply
                function ($scope) {
                    $scope.id = null;
                    Deselect();
                    $scope.SelectType = "";
                    $scope.SelectImage = false;
                }
            );
        });

        ShapeEdit.onMove((shape: ShapeEdit.BaseShape): void => {
            $scope.$evalAsync(   // $apply
                function ($scope) {
                    let loc = shape.Location();
                    $scope.x = loc.x;
                    $scope.y = loc.y;
                }
            );
        });

        ShapeEdit.onResize((shape: ShapeEdit.BaseShape): void => {
            $scope.$evalAsync(   // $apply
                function ($scope) {
                    let size = shape.Size();
                    $scope.w = size.w;
                    $scope.h = size.h;
                }
            );
        });

        ShapeEdit.onDeformation((shape: ShapeEdit.BaseShape): void => {
            $scope.$evalAsync(   // $apply
                function ($scope) {
                    let size = shape.Size();
                    $scope.w = size.w;
                    $scope.h = size.h;
                }
            );
        });

        ShapeEdit.onChange((): void => {

        });

        ShapeEdit.onKeydown((shape: ShapeEdit.BaseShape, e: any): void => {

        });

        ShapeEdit.onDrop((shape: ShapeEdit.BaseShape, e: any): void => {
            if (e.dataTransfer.files.length == 0) {
                var url = e.dataTransfer.getData('url');
                if (url != "") {

                    // to localpath
               //     let parser = document.createElement('a');
               //     parser.href = url;
               //     let localpath = parser.pathname;

                    let image = new Image();
                    image.crossOrigin = 'Anonymous';
                    // for url load error detect.
                    //image.setAttribute('crossOrigin', 'anonymous');
                    image.onload = (ex: any): void => {                            // URLがイメージとしてロード可能
                        let w = ex.target.width;
                        let h = ex.target.height;
                        let obj = {
                            rectangle: new ShapeEdit.Rectangle(e.offsetX - (w / 2), e.offsetY - (h / 2), w, h),
                            property: new ShapeEdit.ShapeProperty(ShapeEdit.Canvas, '', [], url, new ShapeEdit.RGBAColor(255, 255, 255, 1), new ShapeEdit.RGBAColor(0, 0, 0, 1), 9, new ShapeEdit.Font("normal", "normal", "normal", 18, "sans-serif", []), "", "miter", {
                                "category": "",
                                "type": "meter"
                            })
                        };

                        ShapeEdit.Canvas.Add(new ShapeEdit.ImageRect(ShapeEdit.Canvas, obj));
                    };
                    image.onerror = (): void => {                           // URLがイメージとしてロード不可能
                    };
                    image.src = url;
                }
            } else {
                let file: any = e.dataTransfer.files[0];
                let reader: any = new FileReader();
                reader.onload = ((theFile) => {

                    return (ex) => {
                        let img = new Image();
                        img.crossOrigin = 'Anonymous';
                        img.onload = (): void => {
                            let w = img.width;
                            let h = img.height;
                            let url = ex.target.result;
                            let obj = {
                                rectangle: new ShapeEdit.Rectangle(e.offsetX - (w / 2), e.offsetY - (h / 2), w, h),
                                property: new ShapeEdit.ShapeProperty(ShapeEdit.Canvas, '', [], url, new ShapeEdit.RGBAColor(255, 255, 255, 1), new ShapeEdit.RGBAColor(0, 0, 0, 1), 9, new ShapeEdit.Font("normal", "normal", "normal", 18, "sans-serif", []), "", "miter", {
                                    "category": "",
                                    "type": "meter"
                                })
                            };
                            ShapeEdit.Canvas.Add(new ShapeEdit.ImageRect(ShapeEdit.Canvas, obj));
                        };
                        img.src = ex.target.result;
                    };
                })(file);
                reader.readAsDataURL(file);
            }
        });


        $scope.opened = false;
        $scope.IsOpen = IsOpen;
        $scope.editmode = "move";

        $scope.changeText = changeText;
        $scope.aceOption = aceOption;
        $scope.ToTop = ToTop;
        $scope.ToBottom = ToBottom;
        $scope.Lock = Lock;
        $scope.UnLockAll = UnLockAll;
        $scope.Group = Group;
        $scope.Ungroup = Ungroup;
        $scope.Copy = Copy;
        $scope.Paste = Paste;
        $scope.SetAlign = SetAlign;

        $scope.Create = Create;
        $scope.Open = Open;
        $scope.Update = Update;
        $scope.UpdateAs = UpdateAs;
        $scope.Delete = Delete;
        $scope.PrintPNG = PrintPNG;
        $scope.PrintPDF = PrintPDF;
        $scope.PrintSVG = PrintSVG;
        $scope.ChangeEditMode = ChangeEditMode;
        $scope.strokewidthChange = strokewidthChange;
        $scope.pathChange = pathChange;
        $scope.changeLocationX = changeLocationX;
        $scope.changeLocationY = changeLocationY;
        $scope.changeSizeW = changeSizeW;
        $scope.changeSizeH = changeSizeH;
        $scope.changeFontStyle = changeFontStyle;
        $scope.changeFontWeigt = changeFontWeigt;
        $scope.changeFontAlign = changeFontAlign;
        $scope.fontsizeChange = fontsizeChange;
        $scope.labelChange = labelChange;
        $scope.modeChange = modeChange;
        $scope.typeChange = typeChange;
        $scope.requiredChange = requiredChange;
        $scope.maxlengthChange = maxlengthChange;
        $scope.minlengthChange = minlengthChange;
        $scope.optionsChange = optionsChange;
        $scope.onChangeChange = onChangeChange;
        $scope.lookupChange = lookupChange;
        $scope.AddText = AddText;
        $scope.AddBox = AddBox;
        $scope.AddOval = AddOval;
        $scope.AddBezier = AddBezier;
        $scope.AddImage = AddImage;
        $scope.DeleteSelected = DeleteSelected;
        $scope.SelectedCount = SelectedCount;

        $scope.$watch('fills', (color_string: string): void => {
            if (color_string) {
                let color: ShapeEdit.RGBAColor = new ShapeEdit.RGBAColor(0, 0, 0, 1);
                color.SetRGB(color_string);
                ShapeEdit.Canvas.SetCurrentFillColor(color);
                Font_Display();
            }
        });

        $scope.$watch('strokefills', (color_string: string): void => {
            if (color_string) {
                let color: ShapeEdit.RGBAColor = new ShapeEdit.RGBAColor(0, 0, 0, 0);
                color.SetRGB(color_string);
                ShapeEdit.Canvas.SetCurrentStrokeColor(color);
                Font_Display();
            }
        });

        $scope.$watch('FontVariant', (FontVariant): void => {
            if (FontVariant) {
                ShapeEdit.Canvas.SetCurrentFontVariant(FontVariant);
                Font_Display();
            }
        });

        $scope.$watch('FontWeight', (fontweight: string): void => {
            if (fontweight) {
                ShapeEdit.Canvas.SetCurrentFontWeight(fontweight);
                Font_Display();
            }
        });

        $scope.$watch('FontKeyword', (FontKeyword: string): void => {
            if (FontKeyword) {
                ShapeEdit.Canvas.SetCurrentFontKeyword(FontKeyword);
                Font_Display();
            }
        });

        $scope.$watch('FontFamily', (FontFamily: string): void => {
            if (FontFamily) {
                ShapeEdit.Canvas.SetCurrentFontFamily([FontFamily]);
                Font_Display();
            }
        });

        Font_Display();
    }]);

BuilderControllers.controller('BuilderCreateDialogController', ['$scope','$log', '$uibModalInstance', 'TemplateService', 'ShapeEdit', 'items',
    ($scope: any,$log:any, $uibModalInstance: any, TemplateService: any, ShapeEdit: any, items: any): void => {

        $scope.dpi = 800;
        $scope.ratio = 1.414;
        $scope.margintop = 72;
        $scope.marginbottom = 72;
        $scope.marginleft = 72;
        $scope.marginright = 72;
        $scope.layout = "portrait";

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

            let short = $scope.dpi;
            TemplateService.format.size = [short, short * $scope.ratio];
            TemplateService.format.margins.top = $scope.margintop;
            TemplateService.format.margins.bottom = $scope.marginbottom;
            TemplateService.format.margins.left = $scope.marginleft;
            TemplateService.format.margins.right = $scope.marginright;
            TemplateService.format.layout = $scope.layout;
            TemplateService.format.info.Title = $scope.title;
            TemplateService.format.info.Subject = $scope.subject;
            TemplateService.format.info.Author = $scope.author;

            let cover_letter: any = {
                "type": "Canvas",
                "shapes": {
                    "type": "Shapes",
                    "locked": "false",
                    "rectangle": {
                        "type": "Size",
                        "location": {"type": "Location", "x": 0, "y": 0, "miter": 0},
                        "size": {"type": "Size", "w": 0, "h": 0}
                    },
                    "property": {
                        "type": "ShapeProperty",
                        "text": "",
                        "textwidth": [],
                        "path": "",
                        "fillstyle": {"type": "RGBAColor", "r": 0, "g": 0, "b": 0, "a": 0},
                        "strokestyle": {"type": "RGBAColor", "r": 0, "g": 0, "b": 0, "a": 0},
                        "strokewidth": 0,
                        "font": {
                            "style": "",
                            "variant": "",
                            "weight": "",
                            "size": 0,
                            "keyword": "sans-serif",
                            "family": []
                        },
                        "align": "",
                        "linejoin": "miter",
                        "description": {}
                    },
                    "shapes": []
                },
                "width": 0,
                "height": 0
            };

            switch (TemplateService.format.layout) {
                case "portrait":
                    cover_letter.width = TemplateService.format.size[0];
                    cover_letter.height = TemplateService.format.size[1];
                    break;
                case "landscape":
                    cover_letter.width = TemplateService.format.size[1];
                    cover_letter.height = TemplateService.format.size[0];
                    break;
                default:
            }

            let content = {
                title: $scope.title,
                subtitle: $scope.subject,
                text: JSON.stringify(cover_letter),
                format: TemplateService.format,
            };

            TemplateService.Create($scope.title, content, (result: any): void => {
                TemplateService.current_layout = result;
                TemplateService.format = result.content.format;
                ShapeEdit.Load(result.content.text);
                progress(false);
                $uibModalInstance.close(result);
            }, error_handler);
        };

    }]);

BuilderControllers.controller('BuilderOpenDialogController', ['$scope', '$log', '$uibModalInstance', '$uibModal', 'items', 'ShapeEdit', 'TemplateService',
    ($scope: any, $log: any, $uibModalInstance: any, $uibModal: any, items: any, ShapeEdit: any, TemplateService: any): void => {

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

        let EditClear: () => void = (): void => {
            _.each(ShapeEdit.Input, function (element: any, id: any) {
                ShapeEdit.Wrapper.removeChild(element);
                delete ShapeEdit.Input[id];
            });
        };

        let Count: () => void = (): void => {
            TemplateService.Count((result: any): void => {
                $scope.count = result;
            }, error_handler);
        };

        let Query: () => any = (): any => {
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

        let Get = (layout): void => {
            progress(true);
            TemplateService.Get(layout._id, (result: any): void => {
                TemplateService.current_layout = result;
                TemplateService.format = result.content.format;
                ShapeEdit.Load(result.content.text);
                //        EditClear();
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
        $scope.LayoutQuery = (): any => Query;

        Count();
        Query();
    }]);


BuilderControllers.controller('BuilderSaveAsDialogController', ['$scope','$log', '$uibModalInstance', 'TemplateService', 'ShapeEdit', 'items',
    ($scope: any,$log:any, $uibModalInstance: any, TemplateService: any, ShapeEdit: any, items: any): void => {

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
     //       let short = 525;
            progress(true);
            if (TemplateService.current_layout) {
                progress(true);
                TemplateService.current_layout.content.text = ShapeEdit.Serialize();
                TemplateService.PutAs($scope.title, TemplateService.current_layout, (result: any): void => {
                    progress(false);
                    $uibModalInstance.close({});
                }, error_handler);
            }
        };

    }]);

BuilderControllers.controller('BuilderDeleteConfirmController', ['$scope', '$uibModalInstance', 'items',
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