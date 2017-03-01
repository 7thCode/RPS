/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

let LayoutsProviders: angular.IModule = angular.module('LayoutsProviders', []);

LayoutsProviders.provider('HtmlEdit', [function (): void {

    this.$get = () => {
        return {
            toHtml: (object: any, init: string): string => {
                return HtmlEdit.Render.toHtml(object, init);
            },
            fromHtml: (html: string, callback: (errors, doc) => void): void => {
                HtmlEdit.Render.fromHtml(html, callback);
            },
        }
    }

}
]);

LayoutsProviders.provider('ShapeEdit', [function ():void {

    let _self:any = this;

    _self.Handlers = new ShapeEdit.EventHandlers();
    _self.Plugins = new ShapeEdit.Plugins();

    _self.pagesize = 25;

    _self.query = {};
    _self.option = {limit: _self.pagesize, skip: 0};
    _self.count = 0;

    _self.IsOpen = false;

    _self.input = {};

    _self.ratio = 1;

    _self.object = null;

    this.configure = (options) => {
        _self.Wrapper = <HTMLCanvasElement>document.getElementById(options.wrapper);
        _self.CanvasElement = <HTMLCanvasElement>document.getElementById(options.canvas);
        if (_self.CanvasElement) {
            _self.CanvasElement.width = options.width;
            _self.CanvasElement.height = options.height;
            _self.Canvas = new ShapeEdit.Canvas(_self.CanvasElement, _self.Handlers, _self.Plugins, new Adaptor.SVGAdaptor(), true);
            //this.adjust(_self.CanvasElement, _self.Wrapper.clientWidth, _self.Wrapper.clientHeight, _self.CanvasElement.width, _self.CanvasElement.height);
        }
    };

    this.adjust = (element: any, outerwidth: number, outerheight: number, innerwidth: number, innerheight: number): void => {
        element.width = innerwidth;
        element.height = innerheight;
        element.style.marginLeft = ((outerwidth - innerwidth) / 2) + "px";
        element.style.marginRight = ((outerwidth - innerwidth) / 2) + "px";
        element.style.marginTop = ((outerheight - innerheight) / 2) + "px";
        element.style.marginBottom = ((outerheight - innerheight) / 2) + "px";

        let width:number = (outerwidth / innerwidth);
        let height:number = (outerheight / innerheight);
        _self.ratio = Math.min(width, height) * 0.9;
        element.style.transform = "scale(" + _self.ratio  + ")";
    };

    this.$get = () => {
        return {
            Canvas: _self.Canvas,
            Wrapper: _self.Wrapper,
            CanvasElement: _self.CanvasElement,
            RGBAColor: ShapeEdit.RGBAColor,
            Font: ShapeEdit.Font,
            ShapeProperty: ShapeEdit.ShapeProperty,
            Rectangle: ShapeEdit.Rectangle,
            Text: ShapeEdit.Text,
            Box: ShapeEdit.Box,
            Oval: ShapeEdit.Oval,
            Bezier: ShapeEdit.Bezier,
            ImageRect: ShapeEdit.ImageRect,
            Location: ShapeEdit.Location,
            Mode: ShapeEdit.Mode,
            IsOpen: _self.IsOpen,
            Input: _self.input,
            Ratio: _self.ratio,

            Serialize: () => {
                return ShapeEdit.Canvas.Serialize(_self.Canvas);
            },

            Load: (value: any) => {
                _self.object = JSON.parse(value);
                _self.adjust(_self.CanvasElement, _self.Wrapper.clientWidth, _self.Wrapper.clientHeight, _self.object.width, _self.object.height);
                ShapeEdit.Canvas.Load(_self.Canvas, _self.object, _self.Handlers);
                _self.IsOpen = true;
                _self.Canvas.Draw();
            },

            Save: (): any => {
                return ShapeEdit.Canvas.Save(_self.Canvas);
            },

            Clear: () => {
                _self.IsOpen = false;
            },

            ToTop: () => {
                _self.Canvas.ToTop();
            },

            ToBottom: () => {
                _self.Canvas.ToBottom();
            },

            Selected: (): any => {
                _self.Canvas.Selected();
            },

            Add: (shape: any): void => {
                _self.Canvas.Add(shape);
            },

            DeleteSelected: (): void => {
                _self.Canvas.DeleteSelected();
            },
            Lock: (): void => {
                _self.Canvas.Lock();
            },
            UnLockAll: (): void => {
                _self.Canvas.UnLockAll();
            },
            Group: (): void => {
                _self.Canvas.Group();
            },
            Ungroup: (): void => {
                _self.Canvas.Ungroup();
            },
            Copy: (): void => {
                _self.Canvas.Copy();
            },
            Paste: (): void => {
                _self.Canvas.Paste();
            },
            SetCurrentFillColor: (color: any): void => {
                _self.Canvas.SetCurrentFillColor(color);
            },
            CurrentFillColor: (): any => {
                return _self.Canvas.CurrentFillColor();
            },
            SetCurrentStrokeColor: (color): void => {
                _self.Canvas.SetCurrentStrokeColor(color);
            },
            CurrentStrokeColor: (): any => {
                return _self.Canvas.CurrentStrokeColor();
            },
            SetCurrentStrokeWidth: (width): void => {
                _self.Canvas.SetCurrentStrokeWidth(width);
            },
            CurrentStrokeWidth: (): number => {
                return _self.Canvas.CurrentStrokeWidth();
            },
            SetCurrentFontStyle: (style: string): void => {
                _self.Canvas.SetCurrentFontStyle(style);
            },
            CurrentFontStyle: (): string => {
                return _self.Canvas.CurrentFontStyle();
            },
            SetCurrentFontVariant(variant: string): void {
                _self.Canvas.SetCurrentFontVariant(variant);
            },
            CurrentFontVariant: (): string => {
                return _self.Canvas.CurrentFontVariant();
            },
            SetCurrentFontWeight: (weight: string): void => {
                _self.Canvas.SetCurrentFontWeight(weight);
            },
            CurrentFontWeight: (): string => {
                return _self.Canvas.CurrentFontWeight();
            },
            SetCurrentFontSize: (size): void => {
                _self.Canvas.SetCurrentFontSize(size);
            },
            CurrentFontSize: (): number => {
                return _self.Canvas.CurrentFontSize();
            },
            SetCurrentFontKeyword: (keyword): void => {
                _self.Canvas.SetCurrentFontKeyword(keyword);
            },
            CurrentFontKeyword: (): string => {
                return _self.Canvas.CurrentFontKeyword();
            },
            SetCurrentFontFamily: (family: string[]): void => {
                _self.Canvas.SetCurrentFontFamily(family);
            },
            CurrentFontFamily: (): string[] => {
                return _self.Canvas.CurrentFontFamily();
            },
            SetCurrentPath: (path: string): void => {
                _self.Canvas.SetCurrentPath(path);
            },
            CurrentPath: (): string => {
                return _self.Canvas.CurrentPath();
            },
            SetCurrentAlign: (align: string): void => {
                _self.Canvas.SetCurrentAlign(align);
            },
            CurrentAlign: (): string => {
                return _self.Canvas.CurrentAlign();
            },
            SetCurrentText: (text: string): void => {
                _self.Canvas.SetCurrentText(text);
            },
            CurrentText: (): string => {
                return _self.Canvas.CurrentText();
            },
            CurrentType: (): string => {
                return _self.Canvas.CurrentType();
            },
            SetCurrentShapesAlign: (align: number): void => {
                _self.Canvas.SetCurrentShapesAlign(align);
            },
            DeselectAll: (): void => {
                _self.Canvas.DeselectAll();
            },
            SelectedCount: (): number => {
                return _self.Canvas.SelectedCount();
            },
            onTick: (callback: (shape: ShapeEdit.BaseShape, context: any) => any) => {
                _self.Plugins.on("tick", callback);
            },
            onDraw: (callback: (shape: ShapeEdit.BaseShape, context: any) => void) => {
                _self.Plugins.on("draw", callback);
            },
            onNew: (callback: (shape: ShapeEdit.BaseShape)=> void) => {
                _self.Handlers.on("new", callback);
            },
            onDelete: (callback: (shape: ShapeEdit.BaseShape)=> void) => {
                _self.Handlers.on("delete", callback);
            },
            onSelect: (callback: (shape: ShapeEdit.BaseShape, context: any)=> void) => {
                _self.Handlers.on("select", callback);
            },
            onDeselect: (callback: (shape: ShapeEdit.BaseShape, context: any)=> void) => {
                _self.Handlers.on("deselect", callback);
            },
            onMove: (callback: (shape: ShapeEdit.BaseShape)=> void) => {
                _self.Handlers.on("move", callback);
            },
            onResize: (callback: (shape: ShapeEdit.BaseShape)=> void) => {
                _self.Handlers.on("resize", callback);
            },
            onDeformation: (callback: (shape: ShapeEdit.BaseShape)=> void) => {
                _self.Handlers.on("deformation", callback);
            },
            onChange: (callback: ()=> void) => {
                _self.Handlers.on("change", callback);
            },
            onKeydown: (callback: (shape: ShapeEdit.BaseShape, e: any)=> void) => {
                _self.Handlers.on("keydown", callback);
            },
            onDrop: (callback: (shape: ShapeEdit.BaseShape, e: any)=> void) => {
                _self.Handlers.on("drop", callback);
            },
            onResizeWindow: (callback: (wrapper:any, inner:any) => void):void => {
                let resizeTimer:any;
                let interval:number = Math.floor(1000 / 60 * 10);
                window.addEventListener('resize', (event:any):void => {
                    if (resizeTimer !== false) {
                        clearTimeout(resizeTimer);
                    }
                    resizeTimer = setTimeout(():void => {
                        if (_self.object) {
                            callback(_self.Wrapper, _self.object);
                            _self.adjust(_self.CanvasElement, _self.Wrapper.clientWidth, _self.Wrapper.clientHeight, _self.object.width, _self.object.height);
                            _self.Canvas.Draw();
                        }
                    }, interval);
                });
            }
        }
    }
}
]);