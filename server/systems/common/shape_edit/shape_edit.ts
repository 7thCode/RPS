/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

var server = (typeof window === 'undefined');

if (server) {
    var _: _.LoDashStatic = require('lodash');
}

namespace ShapeEdit {

    // require lodash 4.X

    // resizehandle Size
    const handlesize: number = 6;

    export const gridsize: number = 1;

    // move shape or free drawing
    export enum Mode {move, draw, bezierdraw}

    // pressed key
    export enum Key {normal = 0, shift = 1, control = 2, alt = 4, meta = 8}

    // shape handle category
    // location             move corner
    // center               move side
    // control0, control1   for Bezier
    // resize               resize shape
    // rotate               rotate shape
    enum HandleCategory {location, center, control0, control1, resize, rotate, crop}
    enum Transform {none, deformation, resize, rotate}

    // for Text Line Break
    enum PrevChar {normal, cr, lf}

    // Event Handler
    export class EventHandlers {

        private handlers: {};

        constructor() {
            this.handlers = {};
        }

        public Free(): void {

        }

        public Exec(name: string, target: ShapeEdit.BaseShape, e: any): void {
            if (this.handlers[name]) {
                this.handlers[name](target, e);
            }
        }

        public on(name: string, handler: (selected: BaseShape, e: any) => void): boolean {
            let result: boolean = false;
            if (!this.handlers[name]) {
                this.handlers[name] = handler;
            }
            return result;
        }
    }

    // Event Handler
    export class Plugins extends EventHandlers {
    }

    // Typed Root Class
    // object type identify
    export class Typed {

        private _type: string;

        public get type(): string {
            return this._type;
        }

        public set type(type: string) {
            this._type = type;
        }

        constructor(type: string) {
            this.type = type;
        }

        public Serialize(): string {
            return "";
        }

        public Free() {

        }
    }

    // Font Class
    export class Font extends Typed {

        private _style: string;
        private _variant: string;
        private _weight: string;
        private _size: number;
        private _keyword: string;
        private _family: string[];

        public get style(): string {
            return this._style;
        }

        public set style(style: string) {
            this._style = style;
        }

        public get variant(): string {
            return this._variant;
        }

        public set variant(variant: string) {
            this._variant = variant;
        }

        public get weight(): string {
            return this._weight;
        }

        public set weight(weight: string) {
            this._weight = weight;
        }

        public get size(): number {
            return this._size;
        }

        public set size(size: number) {
            this._size = size;
        }

        public get keyword(): string {
            return this._keyword;
        }

        public set keyword(keyword: string) {
            this._keyword = keyword;
        }

        public get family(): string[] {
            return this._family;
        }

        public set family(family: string[]) {
            this._family = family;
        }

        constructor(style: string, variant: string, weight: string, size: number, keyword: string, family: string[]) {
            super("Font");
            this._style = style;
            this._variant = variant;
            this._weight = weight;
            this._keyword = "sans-serif";
            if (keyword != "") {
                this._keyword = keyword;
            }
            this._size = size;
            this._family = family;
        }

        public Free() {
            super.Free();
        }

        public Clone(): any {
            let family: string[] = [];
            this.family.forEach((name) => {
                family.push(name);
            });
            return new Font(this.style, this.variant, this.weight, this.size, this.keyword, family);
        }

        public Value(): string {
            let family: string = "";
            let delimmiter: string = "";
            this.family.forEach((name) => {
                family += delimmiter + "'" + name + "'";
                delimmiter = ",";
            });
            return this.style + " " + this.variant + " " + this.weight + " " + this.size + 'px ' + family + delimmiter + this.keyword ;
        }

        public Serialize(): string {
            let family: string = "[";
            let delimmiter: string = "";
            this.family.forEach((name) => {
                family += delimmiter;
                family += '"' + name + '"';
                delimmiter = ",";
            });
            family += "]";
            return '{"style":"' + this.style + '", "variant":"' + this.variant + '", "weight":"' + this.weight + '", "size":' + this.size + ', "keyword":"' + this.keyword + '", "family":' + family + '}';
        }

        public ToString(): string {
            return this.Value();
        }

        static Load(obj: any): Font {
            return new ShapeEdit.Font(obj.style, obj.variant, obj.weight, obj.size, obj.keyword, obj.family);
        }
    }

    // Shape Fill Style
    interface Style {
        Clone(): any;
        Serialize(): string;
        CanvasValue(context: any): string;
        SetPath(path: string, callback: () => void, error: () => void): void;


        RGBA(): string;
        SetRGB(color: string): void;
        Lighten(n: number): RGBAColor;
        Darken(n: number): RGBAColor;
        Invert(): RGBAColor;
        RGB(): string;
        ToString(): string;
    }

    // Color Class
    export class RGBAColor extends Typed implements Style {

        public r: number;
        public g: number;
        public b: number;
        public a: number;

        constructor(r: number, g: number, b: number, a: number) {
            super('RGBAColor');
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = a;
        }

        public Free() {
            super.Free();
        }

        public Clone(): any {
            return new RGBAColor(this.r, this.g, this.b, this.a);
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

        public RGBA(): string {
            return "rgba(" + this.r + ", " + this.g + ", " + this.b + ", " + this.a + ")";
        }

        public CanvasValue(context: any): string {
            return this.RGBA();
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

        public Lighten(n: number): RGBAColor {
            let check = (a: number, b: number): number => {
                let result: number = a + b;
                if (a > 255) {
                    result = 255;
                }
                return result;
            };
            return new ShapeEdit.RGBAColor(check(this.r, n), check(this.g, n), check(this.b, n), this.a);
        }

        public Darken(n: number): RGBAColor {
            let check = (a: number, b: number): number => {
                let result: number = a - b;
                if (a < 0) {
                    result = 0;
                }
                return result;
            };
            return new ShapeEdit.RGBAColor(check(this.r, n), check(this.g, n), check(this.b, n), this.a);
        }

        public Invert(): RGBAColor {
            return new ShapeEdit.RGBAColor(255 - this.r, 255 - this.g, 255 - this.b, this.a);
        }

        public RGB(): string {
            return "#" + ("0" + this.r.toString(16)).slice(-2) + ("0" + this.g.toString(16)).slice(-2) + ("0" + this.b.toString(16)).slice(-2);
        }

        public Serialize(): string {
            return '{"type":"' + this.type + '", "r":' + this.r + ', "g":' + this.g + ', "b":' + this.b + ', "a":' + this.a + '}';
        }

        public ToString(): string {
            return "rgba(" + this.r + ", " + this.g + ", " + this.b + ", " + this.a + ")";
        }

        static Load(obj: any): any {
            return new RGBAColor(obj.r, obj.g, obj.b, obj.a);
        }

        public SetPath(path: string, callback: () => void, error: () => void): void {
            callback();
        }
    }

    //image
    export class ImageStyle extends Typed implements Style {

        private _path: string;
        private image: any;
        private _haserror: boolean;

        constructor(path: string) {
            super("ImageStyle");

            this._path = path;
            this.SetPath(path, () => {
            }, () => {
            });
        }

        public Free() {
            super.Free();
        }

        public Clone(): any {
            return new ImageStyle(this._path);
        }

        public Serialize(): string {
            return '{"type":"' + this.type + '", "path":' + this._path + '}';
        }

        public CanvasValue(context: any): string {
            let result: any = new RGBAColor(255, 255, 255, 1).RGBA();
            if (this.image) {
                if (!this._haserror) {
                    try {
                        result = context.createPattern(this.image, "repeat");
                    }
                    catch (e) {
                        let a = 1;
                    }

                }
            }
            return result;
        }

        public SetPath(path: string, callback: () => void, error: () => void): void {
            this._path = path;
            if (!server) {
                if (this._path != "") {
                    this.image = new Image();
                    this.image.crossOrigin = 'Anonymous';
                    this.image.onload = (e: any): void => {
                        this._haserror = false;

                        callback();
                    };
                    this.image.onerror = (e: any): void => {
                        this._haserror = true;
                        error();
                    };
                    this.image.src = this._path;
                } else {
                    this._haserror = false;
                    this.image = null;
                    callback();
                }
            }
        }

        static Load(obj: any): any {
            return new ImageStyle(obj.path);
        }


        RGBA(): string {
            return "";
        }

        SetRGB(color: string): void {
        }

        Lighten(n: number): RGBAColor {
            return null;
        }

        Darken(n: number): RGBAColor {
            return null;
        }

        Invert(): RGBAColor {
            return null;
        }

        RGB(): string {
            return "";
        }

        ToString(): string {
            return "";
        }


    }

    //グラデーション
    export class GradationStyle extends Typed implements Style {

        public Free() {
            super.Free();
        }

        public Clone(): any {

        }

        public Serialize(): string {
            return "";
        }

        public CanvasValue(context: any): string {
            return "";
        }

        public SetPath(path: string, callback: () => void, error: () => void): void {
            callback();
        }

        static Load(obj: any): any {
            return null;
        }

        RGBA(): string {
            return "";
        }

        SetRGB(color: string): void {
        }

        Lighten(n: number): RGBAColor {
            return null;
        }

        Darken(n: number): RGBAColor {
            return null;
        }

        Invert(): RGBAColor {
            return null;
        }

        RGB(): string {
            return "";
        }

        ToString(): string {
            return "";
        }
    }

    export const guidelinecolor: ShapeEdit.RGBAColor = new ShapeEdit.RGBAColor(120, 160, 200, 1);
    export const rotatehandlecolor: ShapeEdit.RGBAColor = new ShapeEdit.RGBAColor(255, 100, 100, 0.8);
    export const resizehandlecolor: ShapeEdit.RGBAColor = new ShapeEdit.RGBAColor(100, 100, 255, 0.8);

    export const shiftedrotatehandlecolor: ShapeEdit.RGBAColor = new ShapeEdit.RGBAColor(255, 255, 140, 0.9);
    export const shiftedresizehandlecolor: ShapeEdit.RGBAColor = new ShapeEdit.RGBAColor(140, 255, 255, 0.9);

    export const cornerhandlecolor: ShapeEdit.RGBAColor = new ShapeEdit.RGBAColor(255, 255, 255, 0.7);
    export const centerhandlecolor: ShapeEdit.RGBAColor = new ShapeEdit.RGBAColor(200, 200, 200, 0.7);
    export const blackcolor: ShapeEdit.RGBAColor = new ShapeEdit.RGBAColor(0, 0, 0, 1);
    export const whitecolor: ShapeEdit.RGBAColor = new ShapeEdit.RGBAColor(255, 255, 255, 1);

    // Shape Property Class
    export class ShapeProperty extends Typed {

        private canvas: Canvas;
        public fillstyle: Style;
        public strokestyle: Style;
        public strokewidth: number;
        public linejoin: string;
        public font: Font;
        public align: string;
        public description: any;
        private _text: string;
        private _textwidth: number[];
        private _path: string;
        private _image: any;
        private _haserror: boolean;

        public get text(): string {
            return this._text;
        }

        public set text(text: string) {
            this._text = text;
            this.CulcWidth();
        }

        public get textwidth(): number[] {
            return this._textwidth;
        }

        public get path(): string {
            return this._path;
        }

        public get image(): any {
            return this._image;
        }

        public get haserror(): boolean {
            return this._haserror;
        }

        constructor(canvas: Canvas, text: string, textwidth: number[], path: string, fillstyle: Style, strokestyle: Style, strokewidth: number, font: Font, align: string = "", linejoin: string = "miter", description: any = {}) {
            super("ShapeProperty");
            this.canvas = canvas;
            this.fillstyle = fillstyle;
            this.strokestyle = strokestyle;
            this.strokewidth = strokewidth;
            this.linejoin = linejoin;
            this._textwidth = textwidth;
            this._text = text;
            this._path = path;
            this.font = font;
            this.align = align;
            this.description = description;

            this.SetPath(path, () => {
                this.canvas.Draw();
            }, () => {
            });
        }

        public Free() {
            super.Free();
        }

        public FillStyle(context: any): any {
            let result: any = this.fillstyle.CanvasValue(context);
            if (this.image) {
                if (!this.haserror) {
                    try {
                        result = context.createPattern(this.image, "repeat");
                    }
                    catch (e) {
                        let a = 1;
                    }
                }
            }
            return result;
        }

        public SetPath(path: string, callback: () => void, error: () => void): void {
            this._path = path;
            if (!server) {
                if (this._path != "") {
                    this._image = new Image();
                    this._image.crossOrigin = 'Anonymous';
                    this._image.onload = (e: any): void => {
                        this._haserror = false;
                        callback();
                    };

                    this._image.onerror = (e: any): void => {
                        this._haserror = true;
                        error();
                    };

                    this._image.src = this._path;

                } else {
                    this._haserror = false;
                    this._image = null;
                    callback();
                }
            }
        }

        public Clone(): any {

            let description = {};
            _.forEach(this.description, (value, key) => {
                description[key] = value;
            });

            let result: ShapeEdit.ShapeProperty = new ShapeEdit.ShapeProperty(this.canvas, this.text, this._textwidth, this.path, this.fillstyle.Clone(), this.strokestyle.Clone(), this.strokewidth, this.font.Clone(), this.align, this.linejoin, description);
            result._image = this._image;
            return result;
        }

        private CulcWidth(): void {
            if (!server) {
                this._textwidth = [];
                _.forEach(this.text, (char) => {
                    this._textwidth.push(this.canvas.context.measureText(char).width);
                });
            }
        }

        public Serialize(): string {
            let textwidth: string = "[";
            let delimiter: string = "";
            this._textwidth.forEach((width) => {
                textwidth += delimiter + width;
                delimiter = ",";
            });
            textwidth += "]";

            let text: string = "";
            if (this.text) {
                text = this.text.replace(/\r?\n/g, "\\n");
            }

            return '{"type":"' + this.type + '", "text":"' + text + '", "textwidth":' + textwidth + ', "path":"' + this.path +
                '", "fillstyle":' + this.fillstyle.Serialize() +
                ', "strokestyle":' + this.strokestyle.Serialize() +
                ', "strokewidth":' + this.strokewidth +
                ', "font":' + this.font.Serialize() + ', "align":"' + this.align + '", "linejoin":"' + this.linejoin + '", "description":' + JSON.stringify(this.description) +
                '}';
        }

        static Style(canvas: any, obj: any, style: any): Style {
            let result: Style = null;
            switch (style.type) {
                case "RGBAColor":
                    result = RGBAColor.Load(style);
                    break;
                case "ImageStyle":
                    result = ImageStyle.Load(style);
                    break;
                case "GradationStyle":
                    result = GradationStyle.Load(style);
                    break;
            }
            return result;
        }

        static Load(canvas: Canvas, obj: any): ShapeProperty {
            let text: string = "";
            if (obj.text) {
                text = obj.text.replace(/\n/g, "\n");
            }
            let fillstyle: Style = ShapeProperty.Style(canvas, obj, obj.fillstyle);
            let strokestyle: Style = ShapeProperty.Style(canvas, obj, obj.strokestyle);
            return new ShapeEdit.ShapeProperty(canvas, text, obj.textwidth, obj.path, fillstyle, strokestyle, obj.strokewidth, Font.Load(obj.font), obj.align, obj.linejoin, obj.description);
        }
    }

    // Location Class
    export class Location extends Typed {

        public miter: number;
        private _x: number;
        private _y: number;
        private _controlPoint0: Location;
        private _controlPoint1: Location;

        public set x(value: number) {
            if (!isNaN(value)) {
                this._x = value;
            }
        }

        public get x(): number {
            return this._x;
        }

        public set y(value: number) {
            if (!isNaN(value)) {
                this._y = value;
            }
        }

        public get y(): number {
            return this._y;
        }

        public get controlPoint0(): Location {
            return this._controlPoint0;
        }

        public get controlPoint1(): Location {
            return this._controlPoint1;
        }

        constructor(x: number, y: number, cp0?: Location, cp1?: Location, miter?: number) {
            super("Location");

            this.miter = 0;
            if (miter) {
                this.miter = miter;
            }

            this.x = x;
            this.y = y;

            this._controlPoint0 = null;
            if (cp0) {
                this._controlPoint0 = new ShapeEdit.Location(cp0.x, cp0.y, null, null, cp0.miter);
            }

            this._controlPoint1 = null;
            if (cp1) {
                this._controlPoint1 = new ShapeEdit.Location(cp1.x, cp1.y, null, null, cp1.miter);
            }
        }

        public Free() {
            super.Free();
        }

        public Clone(): any {
            let result: Location = null;
            if (this.IsCurve()) {
                result = new Location(this.x, this.y, this._controlPoint0, this._controlPoint1, this.miter);
            } else {
                result = new Location(this.x, this.y, null, null, this.miter);
            }
            return result;
        }

        public IsCurve(): boolean {
            return ((this._controlPoint0 != null) && (this._controlPoint1 != null));
        }

        public Move(delta: Location) {
            this.x = this.x + delta.x;
            this.y = this.y + delta.y;
            if (this.IsCurve()) {
                this.controlPoint0.x += delta.x;
                this.controlPoint0.y += delta.y;
                this.controlPoint1.x += delta.x;
                this.controlPoint1.y += delta.y;
            }
        }

        public Resize(origin: Location, magnify: Size) {
            this.x = ((this.x - origin.x) * magnify.w) + origin.x;
            this.y = ((this.y - origin.y) * magnify.h) + origin.y;
            if (this.IsCurve()) {
                this.controlPoint0.x = ((this.controlPoint0.x - origin.x) * magnify.w) + origin.x;
                this.controlPoint0.y = ((this.controlPoint0.y - origin.y) * magnify.h) + origin.y;
                this.controlPoint1.x = ((this.controlPoint1.x - origin.x) * magnify.w) + origin.x;
                this.controlPoint1.y = ((this.controlPoint1.y - origin.y) * magnify.h) + origin.y;
            }
        }

        public Rotate(center: Location, degree: number): void {
            let newpoint = Location.PointRotate(center, this, degree);
            this.x = newpoint.x;
            this.y = newpoint.y;
            if (this.IsCurve()) {
                newpoint = Location.PointRotate(center, this.controlPoint0, degree);
                this.controlPoint0.x = newpoint.x;
                this.controlPoint0.y = newpoint.y;
                newpoint = Location.PointRotate(center, this.controlPoint1, degree);
                this.controlPoint1.x = newpoint.x;
                this.controlPoint1.y = newpoint.y;
            }
        }

        static PointRotate(center: Location, location: Location, angle: number): Location {
            let rad = angle * 3.14159 / 180;
            let rotatex = (location.x - center.x) * Math.cos(rad) - (location.y - center.y) * Math.sin(rad);
            let rotatey = (location.x - center.x) * Math.sin(rad) + (location.y - center.y) * Math.cos(rad);
            return new ShapeEdit.Location(center.x + rotatex, center.y + rotatey);
        }

        //交差ポイント数
        public CrossingCount(begin: Location, end: Location): number {
            let result: number = 0;
            if (((begin.y <= this.y) && (end.y > this.y)) || ((begin.y > this.y) && (end.y <= this.y))) {
                let vt: number = (this.y - begin.y) / (end.y - begin.y);
                if (this.x < (begin.x + (vt * (end.x - begin.x)))) {
                    result = 1;
                }
            }
            return result;
        }

        /**
         * ベジェ曲線と直線の交点
         * ベジェ曲線：始点p0,終点p1,コントロール点cp
         * 直線:ax+by+c=0
         *
         * @return ベジェ曲線のt値
         */
        static intersection(p0: Location, p1: Location, cp: Location, a: number, b: number, c: number): any {
            let m: number = b * p1.y + b * p0.y + a * p1.x + a * p0.x - 2 * b * cp.y - 2 * a * cp.x;
            let n: number = -2 * b * p0.y - 2 * a * p0.x + 2 * b * cp.y + 2 * a * cp.x;
            let l: number = b * p0.y + a * p0.x + c;

            //判別式
            let D: number = n * n - 4 * m * l;
            if (D > 0) {
                D = Math.sqrt(D);
                let t0: number = 0.5 * (-n + D) / m;
                let t1: number = 0.5 * (-n - D) / m;
                let result: any = [];
                //解が0～1にあれば交点
                if (t0 >= 0 && t0 <= 1) {
                    result.push(t0);
                }
                if (t1 >= 0 && t1 <= 1) {
                    result.push(t1);
                }
                return result;

            } else if (D === 0) {
                let t2: Number = 0.5 * -n / m;
                if (t2 >= 0 && t2 <= 1) {
                    return [t2];
                } else {
                    return []
                }
            } else {
                //交点なし
                return [];
            }
        }

        public Serialize(): string {
            let result: string = "";
            if (this.controlPoint0) {
                let cp0 = this.controlPoint0;
                let cp1 = this.controlPoint1;
                result = '{"type":"' + this.type + '", "x":' + Math.floor(this.x) + ', "y":' + Math.floor(this.y)
                    + ', "cp0":'
                    + '{"type":"' + cp0.type + '", "x":' + Math.floor(cp0.x) + ', "y":' + Math.floor(cp0.y)
                    + ', "miter":' + cp0.miter
                    + '}'
                    + ', "cp1":'
                    + '{"type":"' + cp1.type + '", "x":' + Math.floor(cp1.x) + ', "y":' + Math.floor(cp1.y)
                    + ', "miter":' + cp1.miter
                    + '}'
                    + ', "miter":' + this.miter
                    + '}';

            } else {
                result = '{"type":"' + this.type + '", "x":' + Math.floor(this.x) + ', "y":' + Math.floor(this.y)
                    + ', "miter":' + this.miter
                    + '}';
            }
            return result;
        }

        static Tolerance(value1: number, value2: number, tolerance: number) {
            return (value1 <= (value2 + tolerance)) && (value1 >= (value2 - tolerance));
        }

        public Near(to: Location, tolerance: number): boolean {
            return Location.Tolerance(this.x, to.x, tolerance) && Location.Tolerance(this.y, to.y, tolerance);
        }

        static Plus(from: Location, to: Location): Location {
            let result: Location = new ShapeEdit.Location(from.x + to.x, from.y + to.y);
            if (from.IsCurve()) {
                result = new ShapeEdit.Location(from.x + to.x, from.y + to.y, Location.Plus(from._controlPoint0, to), Location.Plus(from._controlPoint1, to));
            }
            return result;
        }

        static Minus(from: Location, to: Location): Location {
            let result: Location = new ShapeEdit.Location(from.x - to.x, from.y - to.y);
            if (from.IsCurve()) {
                result = new ShapeEdit.Location(from.x - to.x, from.y - to.y, Location.Minus(from._controlPoint0, to), Location.Minus(from._controlPoint1, to));
            }
            return result;
        }

        static Load(obj: any): Location {
            let result: Location = null;
            if (obj.cp0) {
                result = new ShapeEdit.Location(obj.x, obj.y, obj.cp0, obj.cp1, obj.miter);
            } else {
                result = new ShapeEdit.Location(obj.x, obj.y);
            }
            return result;
        }
    }

    export const resizehandleoffset: Location = new ShapeEdit.Location(20, 20);
    export const rotatehandleoffset: Location = new ShapeEdit.Location(0, -20);

    // Size Class
    export class Size extends Typed {

        private _w: number;
        private _h: number;

        public set w(value: number) {

            if (this._w < 1) {
                this._w = 1;
            } else {
                this._w = value;
            }
        }

        public get w(): number {
            return this._w;
        }

        public set h(value: number) {

            if (this._h < 1) {
                this._h = 1;
            } else {
                this._h = value;
            }
        }

        public get h(): number {
            return this._h;
        }

        constructor(w: number, h: number) {
            super("Size");
            this.w = w;
            this.h = h;
        }

        public Free() {
            super.Free();
        }

        public Clone(): any {
            return new Size(this.w, this.h);
        }

        public Serialize(): string {
            return '{"type":"' + this.type + '", "w":' + this.w + ', "h":' + this.h + '}';
        }

        static Multiply(size: Size, n: number): Size {
            return new Size(size.w * n, size.h * n);
        }

        static Load(obj: any): Size {
            return new Size(obj.w, obj.h);
        }
    }

    // Rectangle Class
    export class Rectangle extends Typed {

        private _location: ShapeEdit.Location;
        private _size: Size;

        public get location(): Location {
            return this._location;
        }

        public set location(location: Location) {
            this._location = location;
        }

        public get size(): Size {
            return this._size;
        }

        public set size(size: Size) {
            this._size = size;
        }

        public get topleft(): Location {
            return this.location;
        }

        public get topright(): ShapeEdit.Location {
            return new ShapeEdit.Location(this.location.x + this.size.w, this.location.y);
        }

        public get bottomleft(): ShapeEdit.Location {
            return new ShapeEdit.Location(this.location.x, this.location.y + this.size.h);
        }

        public get bottomright(): ShapeEdit.Location {
            return new ShapeEdit.Location(this.location.x + this.size.w, this.location.y + this.size.h);
        }

        public get topcenter(): ShapeEdit.Location {
            return new ShapeEdit.Location(this.location.x + (this.size.w / 2), this.location.y);
        }

        public get bottomcenter(): ShapeEdit.Location {
            return new ShapeEdit.Location(this.location.x + (this.size.w / 2), this.location.y + this.size.h);
        }

        public get leftcenter(): ShapeEdit.Location {
            return new ShapeEdit.Location(this.location.x, this.location.y + (this.size.h / 2));
        }

        public get rightcenter(): ShapeEdit.Location {
            return new ShapeEdit.Location(this.location.x + this.size.w, this.location.y + (this.size.h / 2));
        }

        constructor(x: number, y: number, w: number, h: number) {
            super("Size");
            this._location = new ShapeEdit.Location(x, y);
            this._size = new Size(w, h);
        }

        public Free() {
            this._location.Free();
            this._size.Free();
            super.Free();
        }

        public Clone(): any {
            return new Rectangle(this._location.x, this._location.y, this._size.w, this._size.h);
        }

        public Center(): ShapeEdit.Location {
            let center = Size.Multiply(this.size, 0.5);
            let x: number = center.w + this.location.x;
            let y: number = center.h + this.location.y;
            return new ShapeEdit.Location(x, y);
        }

        public RectangleIsContain(rectangle: Rectangle): boolean {
            return this.LocationIsContain(rectangle.topleft) ||
                this.LocationIsContain(rectangle.topright) ||
                this.LocationIsContain(rectangle.bottomleft) ||
                this.LocationIsContain(rectangle.bottomright);
        }

        public LocationIsContain(location: Location): boolean {
            let width: number = this.size.w;
            let height: number = this.size.h;
            let left: number = this.location.x;
            let top: number = this.location.y;

            if (width < 0) {
                left = this.location.x + width;
            }

            if (height < 0) {
                top = this.location.y + height;
            }

            let rect = new Rectangle(left, top, Math.abs(width), Math.abs(height));
            return rect.Contains(location);
        }

        public Contains(location: Location): boolean {

            let x = this.location.x;
            let y = this.location.y;
            let lx = location.x;
            let ly = location.y;

            return ((x < lx) && ((x + this.size.w) > lx)) && ((y < ly) && ((y + this.size.h) > ly));
        }

        public Equals(rectangle: Rectangle): number[][] {
            let result: number[][] = [[0, 0, 0, 0], [0, 0, 0, 0]];
            if (this.location.x === rectangle.location.x) {
                result[0][0] = this.location.x;
            }
            if (this.location.x === rectangle.location.x + rectangle.size.w) {
                result[0][1] = rectangle.location.x + rectangle.size.w;
            }
            if (this.location.x + this.size.w === rectangle.location.x) {
                result[0][2] = this.location.x + this.size.w;
            }
            if (this.location.x + this.size.w === rectangle.location.x + rectangle.size.w) {
                result[0][3] = rectangle.location.x + rectangle.size.w;
            }
            if (this.location.y === rectangle.location.y) {
                result[1][0] = this.location.y;
            }
            if (this.location.y === rectangle.location.y + rectangle.size.h) {
                result[1][1] = rectangle.location.y + rectangle.size.h;
            }
            if (this.location.y + this.size.h === rectangle.location.y) {
                result[1][2] = this.location.y + this.size.h;
            }
            if (this.location.y + this.size.h === rectangle.location.y + rectangle.size.h) {
                result[1][3] = rectangle.location.y + rectangle.size.h;
            }
            return result;
        }

        public Serialize(): string {
            return '{"type":"' + this.type + '", "location":' + this.location.Serialize() + ', "size":' + this.size.Serialize() + '}';
        }

        static Load(obj: any): Rectangle {
            return new ShapeEdit.Rectangle(obj.location.x, obj.location.y, obj.size.w, obj.size.h);
        }
    }

    export class Stack<T> extends Typed {
        private max: number;
        private current: number;
        private _list: T[];

        constructor(max: number) {
            super('Stack');
            this.max = max;
            this.current = 0;
            this._list = [];
            for (let index: number = 0; index < max; index++) {
                this._list.push(null);
            }
        }

        public Free() {
            super.Free();
            delete this._list;
        }

        private Shift() {
            for (let index: number = 0; index < this.max; index++) {
                this._list[index - 1] = this._list[index];
            }
        }

        public Push(data: T): void {
            if (this.current < this.max) {
                this._list[this.current] = data;
                this.current++;
            } else {
                this.Shift();
                this._list[this.max - 1] = data;
            }
        }

        public Pop(): T {
            let result = null;
            if (this.current > 0) {
                result = this._list[this.current - 1];
                this._list[this.current - 1] = null;
                this.current--;
            }
            return result;
        }

        public Count(): number {
            return this.current;
        }
    }

    // RingList (Endless List)
    export class RingList extends Typed {

        private _list: any[];

        public get list(): any[] {
            return this._list;
        }

        constructor() {
            super('RingList');
            this._list = [];
        }

        public Free() {
            super.Free();
            delete this._list;
        }

        public Clone(): any {
            let result: RingList = new RingList();
            this._list.forEach((item) => {
                result.list.push(item.Clone());
            });
            return result;
        }

        public Add(node: any): void {
            this._list.push(node);
        }

        public Nth(n: number): any {
            return this.list[(Math.abs(n) % this._list.length)];
        }

        public Each(callback: (shape: BaseShape) => void) {
            this._list.forEach(callback);
        }

        //   public EachPrev(callback:(prev:any, obj:any, index:number) => void) {
        //       let size = this._list.length;
        //       for (let index = 0; index < size; index++) {
        //           callback(this.Nth(index - 1), this.Nth(index), index);
        //       }
        //   }

        public EachNext(callback: (obj: any, next: any, index: number) => void) {
            let size = this._list.length;
            for (let index = 0; index < size; index++) {
                callback(this.Nth(index), this.Nth(index + 1), index);
            }
        }

        public Serialize(): string {
            let liststring: string = "[";
            let delimmiter = "";
            this.Each((node: Typed) => {
                liststring += delimmiter + node.Serialize();
                delimmiter = ",";
            });
            liststring += "]";
            return '{"type":"' + this.type + '", "node":' + liststring + '}';
        }

        static Load(obj: any): RingList {
            let result: RingList = new RingList();
            result.type = obj.type;
            obj.node.forEach((location: any): void => {
                if (location.cp0) {
                    result._list.push(new Location(location.x, location.y, location.cp0, location.cp1));
                } else {
                    result._list.push(new Location(location.x, location.y));
                }
            });
            return result;
        }
    }

    // Base Shape & Shapes
    export class BaseShape extends Typed {

        protected canvas: Canvas;
        protected property: ShapeProperty;
        protected parent: BaseShape;
        protected shapes: BaseShape[];
        public rectangle: Rectangle;
        protected vertex: RingList;
        protected currentHandle: number;
        protected handleCategory: HandleCategory;
        protected locked: boolean;
        protected isSelected: boolean;
        protected isCapture: boolean;

        protected transform: Transform;

        protected animationContext: any;

        public prevlocation: Location;
        public degree: number;
        public center: Location;

        constructor(type: string, canvas: Canvas, obj: any) {
            super(type);
            this.canvas = canvas;

            this.rectangle = new ShapeEdit.Rectangle(0, 0, 0, 0);
            if (obj.rectangle) {
                this.rectangle = Rectangle.Load(obj.rectangle);
            }

            if (obj.property) {
                this.property = ShapeProperty.Load(this.canvas, obj.property);
            } else {
                this.property = new ShapeProperty(this.canvas, "", [], "", new RGBAColor(0, 0, 0, 0), new RGBAColor(0, 0, 0, 0), 0, new Font("", "", "", 0, "", []), "", "miter", {});
            }

            this.vertex = new ShapeEdit.RingList();
            if (obj.vertex) {
                this.vertex = RingList.Load(obj.vertex);
            }

            this.shapes = [];
            if (obj.shapes) {
                obj.shapes.forEach((shape: any) => {
                    this.Add(BaseShape.Load(this.canvas, shape));
                });
            }

            this.locked = (obj.locked === "true");

            this.parent = null;
            this.currentHandle = 0;
            this.isSelected = false;
            this.isCapture = false;
            this.transform = Transform.none;

            this.degree = 0;
            this.center = new ShapeEdit.Location(0, 0);
            this.prevlocation = new ShapeEdit.Location(0, 0);
        }

        public Free() {
            super.Free();
            this.canvas = null;
            this.property.Free();
            this.parent.Free();
            delete this.shapes;
            this.vertex.Free();
        }

        protected CopyContent(result: any): any {
            result.property = this.property.Clone();
            result.parent = this.parent;

            this.shapes.forEach((shape) => {
                result.shapes.push(shape.Clone());
            });

            result.rectangle = this.rectangle.Clone();

            result.animationContext = this.animationContext;
            result.currentHandle = this.currentHandle;
            result.locked = this.locked;
            result.isSelected = false;
            result.isCapture = false;
            result.transform = Transform.none;

            result.degree = 0;
            result.center = new Location(0, 0);
            return result;
        }

        public Clone(): any {
            return this.CopyContent(new BaseShape(this.type, this.canvas, {}));
        }

        public Canvas(): Canvas {
            return this.canvas;
        }

        public SetParent(parent: BaseShape) {
            this.parent = parent;
        }

        public Parent(): BaseShape {
            return this.parent;
        }

        public IsRoot(): boolean {
            return (this.parent === null);
        }

        public IsRotable(): boolean {
            return false;
        }

        public ID(): string {
            let result: string = "_0";
            if (this.parent != null) {
                let no: number = 0;
                this.parent.shapes.forEach((shape, index) => {
                    if (shape === this) {
                        no = index;
                    }
                    result = this.parent.ID() + "_" + no;
                });
            }
            return result;
        }

        // Draw One Resize Handle
        protected DrawHandle(point: Location, fill: RGBAColor): void {
            let context: any = this.canvas.context;
            try {
                context.save();
                context.beginPath();
                context.rect((point.x - handlesize), (point.y - handlesize), handlesize * 2, handlesize * 2);
                context.fillStyle = fill.RGBA();
                context.fill();
                context.strokeStyle = fill.Darken(100).RGBA();
                context.lineWidth = 0.5;

                context.shadowColor = fill.Darken(100).RGBA();
                context.shadowBlur = 2;
                context.shadowOffsetX = 2;
                context.shadowOffsetY = 2;

                context.stroke();
            } finally {
                context.restore();
            }
        }

        protected DrawBorder() {
            let context: any = this.canvas.context;
            try {
                context.save();
                context.beginPath();
                context.rect(this.rectangle.location.x, this.rectangle.location.y, this.rectangle.size.w, this.rectangle.size.h);
                context.strokeStyle = guidelinecolor.Lighten(50).RGB();
                context.lineWidth = 1;
                context.stroke();
            } finally {
                context.restore();
            }
        }

        // Draw One Resize Handle
        protected DrawCircleHandle(point: Location, fill: RGBAColor): void {
            let context: any = this.canvas.context;
            try {
                context.save();
                context.beginPath();
                // context.rect((point.x - handlesize), (point.y - handlesize), handlesize * 2, handlesize * 2);
                context.arc(point.x, point.y, handlesize, 0, 360 * Math.PI / 180, false);
                context.fillStyle = fill.RGBA();
                context.fill();
                context.strokeStyle = fill.Darken(100).RGBA();
                context.lineWidth = 0.5;

                context.shadowColor = fill.Darken(100).RGBA();
                context.shadowBlur = 2;
                context.shadowOffsetX = 2;
                context.shadowOffsetY = 2;

                context.stroke();
            } finally {
                context.restore();
            }
        }

        protected DrawContent(): void {
        }

        public Size(): Size {
            return this.rectangle.size;
        }

        public Location(): Location {
            return this.rectangle.location;
        }

        public Shapes(): BaseShape[] {
            return this.shapes;
        }

        public Area(): number {
            return 0;
        }

        public Vertex(): RingList {
            return this.vertex;
        }

        public Property(): ShapeProperty {
            return this.property;
        }

        public ToSVG(callback: (error: any) => void): void {
            callback(null);
        }

        public ToPDF(callback: (error: any) => void): void {
            callback(null);
        }

        public Serialize(): string {
            return '{"type":"' + this.type + '", "property":' + this.property.Serialize() + '}';
        }

        public getShapeById(id: string): any {
            if (id == this.ID()) {
                return this;
            } else {
                return null;
            }
        }

        public getShapeByType(type: string, result: any[]): void {
            if (this.type == type) {
                result.push(this);
            }
        }

        public getShapeByTypes(types: string[], result: any[]): void {
            if (types.indexOf(this.type) >= 0) {
                result.push(this);
            }
        }

        public Add(shape: BaseShape): void {
        }

        public Group(): void {
        };

        public Ungroup(): void {
        };

        public Lock(): void {
            this.isSelected = false;
            this.locked = true;
        }

        public UnLock(): void {
            this.locked = false;
        }

        public IsLocked(): boolean {
            return this.locked;
        }

        public Select(): void {
            if (!this.isSelected) {
                this.isSelected = true;
                this.canvas.handlers.Exec('select', this, this.canvas.context);
                this.canvas.handlers.Exec('change', this, null);
            }
        }

        public Deselect(): void {
            if (this.isSelected) {
                this.isSelected = false;
                this.canvas.handlers.Exec('deselect', this, this.canvas.context);
                this.canvas.handlers.Exec('change', this, null);
            }
        }

        public SetFillColor(color: Style): void {
            this.property.fillstyle = color;
            this.canvas.handlers.Exec('change', this, null);
        }

        public FillColor(): Style {
            return this.property.fillstyle;
        }

        public SetStrokeColor(color: Style): void {
            this.property.strokestyle = color;
            this.canvas.handlers.Exec('change', this, null);
        }

        public StrokeColor(): Style {
            return this.property.strokestyle;
        }

        public SetStrokeWidth(width: number): void {
            this.property.strokewidth = width;

            if (this.property.strokewidth == 0) {
                this.property.strokestyle.a = 0;
            } else {
                this.property.strokestyle.a = 1;
            }

            this.canvas.handlers.Exec('change', this, null);
        }

        public StrokeWidth(): number {
            return this.property.strokewidth;
        }

        public SetFontStyle(style: string): void {
            this.property.font.style = style;
            this.canvas.handlers.Exec('change', this, null);
        }

        public FontStyle(): string {
            return this.property.font.style;
        }

        public SetFontVariant(variant: string): void {
            this.property.font.variant = variant;
            this.canvas.handlers.Exec('change', this, null);
        }

        public FontVariant(): string {
            return this.property.font.variant;
        }

        public SetFontWeight(weight: string): void {
            this.property.font.weight = weight;
            this.canvas.handlers.Exec('change', this, null);
        }

        public FontWeight(): string {
            return this.property.font.weight;
        }

        public SetFontSize(size: number): void {
            this.property.font.size = size;
            this.canvas.handlers.Exec('change', this, null);
        }

        public FontSize(): number {
            return this.property.font.size;
        }

        public SetFontKeyword(keyword: string): void {
            this.property.font.keyword = keyword;
            this.canvas.handlers.Exec('change', this, null);
        }

        public FontKeyword(): string {
            return this.property.font.keyword;
        }

        public SetFontFamily(family: string[]): void {
            this.property.font.family = family;
            this.canvas.handlers.Exec('change', this, null);
        }

        public FontFamily(): string[] {
            return this.property.font.family;
        }

        public SetPath(path: string): void {
            this.property.SetPath(path, () => {
                this.canvas.Draw();
                this.canvas.handlers.Exec('change', this, null);
            }, () => {
            });
        }

        public Path(): string {
            return this.property.path;
        }

        public SetAlign(align: string): void {
            this.property.align = align;
            this.canvas.handlers.Exec('change', this, null);
        }

        public Align(): string {
            return this.property.align;
        }

        public SetText(text: string): void {
            this.property.text = text;
            this.canvas.handlers.Exec('change', this, null);
        }

        public Text(): string {
            return this.property.text;
        }

        public Transform(): Transform {
            return this.transform;
        }

        public IsCapture(): boolean {
            return this.isCapture;
        }

        public IsSelected(): boolean {
            return this.isSelected;
        }

        public Draw(): void {
            this.DrawContent();
        }

        public ResizeRectangle(): void {
        }

        public DrawAllHandle(): void {
            if (this.parent) {
                if (this.parent.IsRoot()) {
                    this.DrawBorder();

                    //    this.DrawHandle(this.rectangle.topleft, cornerhandlecolor);// corner handle
                    //    this.DrawHandle(this.rectangle.topright, cornerhandlecolor);// corner handle
                    //    this.DrawHandle(this.rectangle.bottomleft, cornerhandlecolor);// corner handle
                    //    this.DrawHandle(this.rectangle.bottomright, cornerhandlecolor);// corner handle

                    if (this.canvas.modifier === Key.shift) {
                        this.DrawHandle(Location.Plus(this.rectangle.bottomright, resizehandleoffset), shiftedresizehandlecolor.Lighten(50));// resize handle
                    } else {
                        this.DrawHandle(Location.Plus(this.rectangle.bottomright, resizehandleoffset), resizehandlecolor.Lighten(50));// resize handle
                    }

                    if (this.IsRotable()) {
                        if (this.canvas.modifier === Key.shift) {
                            this.DrawCircleHandle(Location.Plus(this.rectangle.topcenter, rotatehandleoffset), shiftedrotatehandlecolor.Lighten(50));// rotate handle
                        } else {
                            this.DrawCircleHandle(Location.Plus(this.rectangle.topcenter, rotatehandleoffset), rotatehandlecolor.Lighten(50));// rotate handle
                        }
                    }
                }
            }
        }

        public Tick(): void {
            if (this.canvas.plugins) {
                this.animationContext = this.canvas.plugins.Exec('tick', this, this.animationContext);
            }
            this.ResizeRectangle();
        }

        public Release(): void {
            this.isCapture = false;
        }

        public BeginDeformation(handle_location: number, handleCategory: HandleCategory): void {
            this.transform = Transform.deformation;
            this.currentHandle = handle_location;
            this.handleCategory = handleCategory;
        }

        public Deformation(delta: Location): void {
            this.ResizeRectangle();
            this.canvas.handlers.Exec('deformation', this, null);
        }

        public EndDeformation(): void {
            this.transform = Transform.none;
            this.currentHandle = 0;
            this.handleCategory = HandleCategory.location;
        }

        public BeginResize(handle_location: number, handleCategory: HandleCategory): void {
            this.transform = Transform.resize;
            this.currentHandle = handle_location;
            this.handleCategory = handleCategory;
        }

        public Resize(origin: Location, magnify: Size): void {
            this.ResizeRectangle();
            this.canvas.handlers.Exec('resize', this, null);
        }

        public EndResize(): void {
            this.transform = Transform.none;
            this.currentHandle = 0;
            this.handleCategory = HandleCategory.location;
        }

        public BeginRotate(handle_location: number, handleCategory: HandleCategory, degree: number): void {
            this.transform = Transform.rotate;
            this.center.x = this.rectangle.Center().x;
            this.center.y = this.rectangle.Center().y;
            this.degree = degree;

            this.currentHandle = handle_location;
            this.handleCategory = handleCategory;
        }

        public Rotate(center: Location, angle: number): void {
            this.ResizeRectangle();
            this.canvas.handlers.Exec('rotate', this, null);
        }

        public EndRotate(): void {
            this.transform = Transform.none;
            this.currentHandle = 0;
            this.handleCategory = HandleCategory.location;
        }

        static Degree(center: Location, location: Location): number {
            let dx = center.x - location.x;
            let dy = center.y - location.y;
            let rad = Math.atan2(dy, dx);
            return rad * 180 / 3.14159;
        }

        public Equals(shape: BaseShape): number[][] {
            return this.rectangle.Equals(shape.rectangle);
        }

        public Capture(): void {
            this.isCapture = true;
        }

        public Contains(location: Location): boolean {
            return false;
        }

        public MoveTo(delta: Location): void {
        }

        public HitHandles(location: Location, callback: (handle_location: number, handle_category: HandleCategory) => void): void {
        }

        public HitShapes(location: Location, callback: (shape: BaseShape) => void): void {
        }

        public Intersection(rect: Rectangle): boolean {
            return false;
        }

        public AddVertexAbsolute(vertex: Location): void {
        }

        public AddCurveAbsolute(curve: Location): void {
        }

        static Load(canvas: Canvas, obj: any): BaseShape {
            let result: BaseShape = null;
            let type: string = obj.type;
            switch (type) {
                case "Box":
                    result = new ShapeEdit.Box(canvas, obj);
                    break;
                case "Oval":
                    result = new ShapeEdit.Oval(canvas, obj);
                    break;
                case "Text":
                    result = new ShapeEdit.Text(canvas, obj);
                    break;
                case "ImageRect":
                    result = new ShapeEdit.ImageRect(canvas, obj);
                    break;
                case "Polygon":
                    result = new ShapeEdit.Polygon(canvas, obj);
                    break;
                case "Bezier":
                    result = new ShapeEdit.Bezier(canvas, obj);
                    break;
                case "Shapes":
                    result = Shapes.Load(canvas, obj);
                    break;
            }
            return result;
        }
    }

    // Rectangle base Shape Base
    export class RectShape extends BaseShape {
        // Resize Handles
        protected handletl: Rectangle;
        protected handlebl: Rectangle;
        protected handletr: Rectangle;
        protected handlebr: Rectangle;
        protected handlelc: Rectangle;
        protected handlerc: Rectangle;
        protected handletc: Rectangle;
        protected handlebc: Rectangle;

        protected grid: Location;// Grid用

        constructor(type: string, canvas: Canvas, obj: any) {
            super(type, canvas, obj);
            this.handletl = new ShapeEdit.Rectangle(this.rectangle.location.x - handlesize, this.rectangle.location.y - handlesize, handlesize * 2, handlesize * 2);
            this.handlebl = new ShapeEdit.Rectangle(this.rectangle.location.x - handlesize, this.rectangle.location.y + this.rectangle.size.h - handlesize, handlesize * 2, handlesize * 2);
            this.handletr = new ShapeEdit.Rectangle(this.rectangle.location.x + this.rectangle.size.w - handlesize, this.rectangle.location.y - handlesize, handlesize * 2, handlesize * 2);
            this.handlebr = new ShapeEdit.Rectangle(this.rectangle.location.x + this.rectangle.size.w - handlesize, this.rectangle.location.y + this.rectangle.size.h - handlesize, handlesize * 2, handlesize * 2);
            this.handlelc = new ShapeEdit.Rectangle(this.rectangle.location.x - handlesize, this.rectangle.location.y + (this.rectangle.size.h / 2) - handlesize, handlesize * 2, handlesize * 2);
            this.handlerc = new ShapeEdit.Rectangle(this.rectangle.location.x + this.rectangle.size.w - handlesize, this.rectangle.location.y + (this.rectangle.size.h / 2) - handlesize, handlesize * 2, handlesize * 2);
            this.handletc = new ShapeEdit.Rectangle(this.rectangle.location.x + (this.rectangle.size.w / 2) - handlesize, this.rectangle.location.y - handlesize, handlesize * 2, handlesize * 2);
            this.handlebc = new ShapeEdit.Rectangle(this.rectangle.location.x + (this.rectangle.size.w / 2) - handlesize, this.rectangle.location.y + this.rectangle.size.h - handlesize, handlesize * 2, handlesize * 2);
            this.grid = new ShapeEdit.Location(this.rectangle.location.x, this.rectangle.location.y);
        }

        public Free() {
            super.Free();
            this.handletl.Free();
            this.handlebl.Free();
            this.handletr.Free();
            this.handlebr.Free();
            this.handlelc.Free();
            this.handlerc.Free();
            this.handletc.Free();
            this.handlebc.Free();
        }

        protected CopyContent(result: any): any {
            result = super.CopyContent(result);
            result.handletl = this.handletl.Clone();
            result.handlebl = this.handlebl.Clone();
            result.handletr = this.handletr.Clone();
            result.handlebr = this.handlebr.Clone();
            result.handlelc = this.handlelc.Clone();
            result.handlerc = this.handlerc.Clone();
            result.handletc = this.handletc.Clone();
            result.handlebc = this.handlebc.Clone();
            result.grid = this.grid.Clone();
            return result;
        }

        public Clone(): any {
            return this.CopyContent(new RectShape(this.type, this.canvas, {}));
        }

        private FreeDeformation(delta: Location): void {
            let x: number = delta.x;// this.Grid(delta.x);
            let y: number = delta.y;// this.Grid(delta.y);

            let rectangle = this.rectangle;
            switch (this.currentHandle) {
                case 1: //  top/left
                    rectangle.size.w -= x;
                    rectangle.size.h -= y;
                    rectangle.location.x += x;
                    rectangle.location.y += y;
                    break;
                case 2: //  top/center
                    rectangle.size.h -= y;
                    rectangle.location.y += y;
                    break;
                case 3: //  top/right
                    rectangle.size.w += x;
                    rectangle.size.h -= y;
                    rectangle.location.y += y;
                    break;
                case 4: //  right/middle
                    rectangle.size.w += x;
                    break;
                case 5: //  bottom/right
                    rectangle.size.w += x;
                    rectangle.size.h += y;
                    break;
                case 6: //  bottom/center
                    rectangle.size.h += y;
                    break;
                case 7: //  bottom/left
                    rectangle.size.w -= x;
                    rectangle.size.h += y;
                    rectangle.location.x += x;
                    break;
                case 8: //  left/middle
                    rectangle.size.w -= x;
                    rectangle.location.x += x;
                    break;
                default :
            }
        }

        public ResizeRectangle(): void {
            let locationx: number = this.rectangle.location.x - handlesize;
            let locationy: number = this.rectangle.location.y - handlesize;
            let sizew: number = this.rectangle.size.w;
            let sizeh: number = this.rectangle.size.h;

            this.handletl.location.x = locationx;
            this.handletl.location.y = locationy;

            this.handlebl.location.x = locationx;
            this.handlebl.location.y = locationy + sizeh;

            this.handletr.location.x = locationx + sizew;
            this.handletr.location.y = locationy;

            this.handlebr.location.x = locationx + sizew;
            this.handlebr.location.y = locationy + sizeh;

            this.handlelc.location.x = locationx;
            this.handlelc.location.y = locationy + (sizeh / 2);

            this.handlerc.location.x = locationx + sizew;
            this.handlerc.location.y = locationy + (sizeh / 2);

            this.handletc.location.x = locationx + (sizew / 2);
            this.handletc.location.y = locationy;

            this.handlebc.location.x = locationx + (sizew / 2);
            this.handlebc.location.y = locationy + sizeh;
        }

        public DrawAllHandle(): void {
            if (this.parent) {
                if (this.parent.IsRoot()) {
                    this.DrawHandle(this.handletl.Center(), cornerhandlecolor);
                    this.DrawHandle(this.handlebl.Center(), cornerhandlecolor);
                    this.DrawHandle(this.handletr.Center(), cornerhandlecolor);
                    this.DrawHandle(this.handlebr.Center(), cornerhandlecolor);
                    this.DrawHandle(this.handlelc.Center(), centerhandlecolor);
                    this.DrawHandle(this.handlerc.Center(), centerhandlecolor);
                    this.DrawHandle(this.handletc.Center(), centerhandlecolor);
                    this.DrawHandle(this.handlebc.Center(), centerhandlecolor);

                    if (this.canvas.modifier === Key.shift) {
                        this.DrawHandle(Location.Plus(this.rectangle.bottomright, resizehandleoffset), shiftedresizehandlecolor.Lighten(50));// resize handle
                    } else {
                        this.DrawHandle(Location.Plus(this.rectangle.bottomright, resizehandleoffset), resizehandlecolor.Lighten(50));// resize handle
                    }
                }
            }
        }

        // Serialize Format
        public Serialize(): string {
            return '{"type":"' + this.type + '", "locked":"' + this.locked + '", "rectangle":' + this.rectangle.Serialize() + ', "property":' + this.property.Serialize() + '}';
        }

        // Click is This?
        public Contains(location: Location): boolean {
            return this.rectangle.Contains(location);
        }

        public Area(): number {
            return this.rectangle.size.w * this.rectangle.size.h;
        }

        // Draw This
        public Draw(): void {
            super.Draw();
            if (this.isSelected) {
                this.DrawAllHandle();
            }
        }

        // Mouse Capture for Resize
        public Capture(): void {
            this.isCapture = true;
        }

        static Grid(n: number): number {//グリッドに丸める
            return Math.round(n / gridsize) * gridsize;
        }

        // Move this
        //todo:グリッドについてはあんまりよくない. リファクタするべき
        public MoveTo(delta: Location): void {
            if (this.transform != Transform.deformation) {
                if (this.isSelected) {
                    if (gridsize === 1) {           //グリッド適用しない
                        this.rectangle.location.x += delta.x;
                        this.rectangle.location.y += delta.y;
                    } else {                        //グリッド適用
                        this.grid.x += delta.x;//差分を加算
                        this.grid.y += delta.y;
                        this.rectangle.location.x = RectShape.Grid(this.grid.x);//差分が閾値を超えたら
                        this.rectangle.location.y = RectShape.Grid(this.grid.y);
                    }
                    this.ResizeRectangle();
                    this.canvas.handlers.Exec('move', this, null);
                }
            }
        }

        // Click Where Handle?
        public HitHandles(location: Location, callback: (handle_location: number, handle_category: HandleCategory) => void): void {
            let result: number = 0;
            let handlecategory: HandleCategory = HandleCategory.location;
            switch (this.canvas.modifier) {
                case Key.normal:
                    if (this.handletl.Contains(location)) {
                        result = 1;
                    } else if (this.handletc.Contains(location)) {
                        result = 2;
                    } else if (this.handletr.Contains(location)) {
                        result = 3;
                    } else if (this.handlerc.Contains(location)) {
                        result = 4;
                    } else if (this.handlebr.Contains(location)) {
                        result = 5;
                    } else if (this.handlebc.Contains(location)) {
                        result = 6;
                    } else if (this.handlebl.Contains(location)) {
                        result = 7;
                    } else if (this.handlelc.Contains(location)) {
                        result = 8;
                    } else if (location.Near(Location.Plus(this.rectangle.bottomright, resizehandleoffset), handlesize)) {
                        handlecategory = HandleCategory.resize;
                        result = -1;
                    }
                    break;
                case Key.shift:
                    if (location.Near(Location.Plus(this.rectangle.bottomright, resizehandleoffset), handlesize)) {
                        handlecategory = HandleCategory.resize;
                        result = -1;
                    }
                    break;
            }
            callback(result, handlecategory);
        }

        // Click Where Shape?
        public HitShapes(location: Location, callback: (shape: BaseShape) => void): void {
            this.Shapes().forEach((shape: BaseShape): void => {
                if (shape.type === "Shapes") {
                    shape.HitShapes(location, callback);
                }
                if (shape.Contains(location)) {
                    callback(shape);
                }
            });
        }

        public Deformation(delta: Location): void {
            if (this.transform === Transform.deformation) {
                this.FreeDeformation(delta);
                super.Deformation(delta);
            }
        }

        public Resize(origin: Location, magnify: Size): void {
            this.rectangle.location.x = ((this.rectangle.location.x - origin.x) * magnify.w) + origin.x;
            this.rectangle.location.y = ((this.rectangle.location.y - origin.y) * magnify.h) + origin.y;
            this.rectangle.size.w = this.rectangle.size.w * magnify.w;
            this.rectangle.size.h = this.rectangle.size.h * magnify.h;
            super.Resize(origin, magnify);
        }

        public Intersection(rect: Rectangle): boolean {
            return rect.RectangleIsContain(this.rectangle);
        }
    }

    export class LineShape extends BaseShape {

        protected CopyContent(result: any): any {
            result = super.CopyContent(result);
            result.vertex = this.vertex.Clone();
            return result;
        }

        public Clone(): any {
            return this.CopyContent(new LineShape(this.type, this.canvas, {}));
        }

        private FreeDeformation(delta: Location): void {
            let handle: Location = this.vertex.Nth(this.currentHandle - 2);

            if (Math.abs(delta.x) > Math.abs(delta.y)) { //制限動作
                handle.x += delta.x;
            } else {
                handle.y += delta.y;
            }

            this.ResizeRectangle(); //外接四角形のリサイズ
        }

        public ResizeRectangle(): void {
            let x: number = _.minBy(this.vertex.list, 'x').x;
            let y: number = _.minBy(this.vertex.list, 'y').y;
            this.rectangle.location.x = x;
            this.rectangle.location.y = y;
            this.rectangle.size.w = _.maxBy(this.vertex.list, 'x').x - x;
            this.rectangle.size.h = _.maxBy(this.vertex.list, 'y').y - y;
        }

        public DrawAllHandle(): void {
            super.DrawAllHandle();
            if (this.parent) {
                if (this.parent.IsRoot()) {
                    this.vertex.EachNext((point, next) => {
                        this.DrawHandle(point, cornerhandlecolor);// vertex handle
                        let centerx: number = ((next.x - point.x) / 2) + point.x;
                        let centery: number = ((next.y - point.y) / 2) + point.y;
                        this.DrawHandle(new ShapeEdit.Location(centerx, centery), centerhandlecolor);// center handle
                    });
                }
            }
        }

        /*
         //OOP approach.  simple but more then Memories...
         protected DrawAllHandle():void {
         this.vertex.EachNext((point, next, index) => {
         this.DrawHandle(point);
         var rectangle = new Rectangle(point.x, point.y, next.x - point.x, next.y - point.y);
         this.DrawHandle(rectangle.Center());
         });
         }
         */

        public Property(): ShapeProperty {
            return this.property;
        }

        public AddVertexAbsolute(vertex: Location): void {
            this.vertex.Add(vertex);
        }

        public AddVertex(vertex: Location): void {
            this.vertex.Add(ShapeEdit.Location.Plus(vertex, this.rectangle.location));
        }

        static Each(elements, begin, each, end): void {
            for (let index: number = 0; index < elements.length; index++) {
                if (index === 0) {
                    begin(elements[index]);
                } else if (index >= elements.length - 1) {
                    end(elements[index]);
                } else {
                    each(elements[index]);
                }
            }
        }

        public Area(): number {
            let result: number = 0;
            this.vertex.EachNext((current, next) => {
                result += (current.x - next.x) * (current.y + next.y);
            });
            return Math.abs(Math.round(result / 2));
        }

        //ポイントが図形に含まれるか
        public Contains(inner: Location): boolean {
            let cross: number = 0;
            this.vertex.list.forEach((point, index) => {
                cross += inner.CrossingCount(this.vertex.Nth(index), this.vertex.Nth(index + 1));
            });
            return ((cross % 2) === 1);// 交差ポイント数が奇数なら内側、偶数なら外。
        }

        public Intersection(rect: Rectangle): boolean {
            return (_.filter(this.vertex.list, (location: Location) => {
                return rect.LocationIsContain(location);
            }).length > 0);
        }

        public Serialize(): string {
            return '{"type":"' + this.type + '", "locked":"' + this.locked + '", "rectangle":' + this.rectangle.Serialize() + ', "vertex":' + this.vertex.Serialize() + ', "property":' + this.property.Serialize() + '}';
        }

        public Draw(): void {
            super.Draw();
            if (this.isSelected) {
                this.DrawAllHandle();
            }
        }

        public MoveTo(delta: Location): void {
            if (this.transform != Transform.deformation) {
                if (this.isSelected) {
                    this.vertex.list.forEach((point) => {
                        point.Move(delta);
                    });
                    this.ResizeRectangle();
                    this.canvas.handlers.Exec('move', this, null);
                }
            }
        }

        public HitShapes(location: Location, callback: (shape: BaseShape) => void): void {

        }

        public HitHandles(location: Location, callback: (handle_location: number, handle_category: HandleCategory) => void): void {
            let result: number = 0;
            let handlecategory: HandleCategory = HandleCategory.location;
            switch (this.canvas.modifier) {
                case Key.normal:
                    this.vertex.EachNext((point, next, index) => {
                        if (location.Near(point, handlesize)) {
                            handlecategory = HandleCategory.location;
                            result = index + 2;
                        } else {
                            let center = new ShapeEdit.Location(((next.x - point.x) / 2) + point.x, ((next.y - point.y) / 2) + point.y);
                            if (location.Near(center, handlesize)) {
                                handlecategory = HandleCategory.center;
                                result = index + 2;
                            }
                        }
                    });
                    if (location.Near(Location.Plus(this.rectangle.bottomright, resizehandleoffset), handlesize)) {
                        handlecategory = HandleCategory.resize;
                        result = -1;
                    } else if (location.Near(Location.Plus(this.rectangle.topcenter, rotatehandleoffset), handlesize)) {
                        handlecategory = HandleCategory.rotate;
                        result = -1;
                    }
                    break;
                case Key.shift:
                    if (location.Near(Location.Plus(this.rectangle.bottomright, resizehandleoffset), handlesize)) {
                        handlecategory = HandleCategory.resize;
                        result = -1;
                    } else if (location.Near(Location.Plus(this.rectangle.topcenter, rotatehandleoffset), handlesize)) {
                        handlecategory = HandleCategory.rotate;
                        result = -1;
                    }
                    break;
            }
            callback(result, handlecategory);
        }

        public Deformation(delta: Location): void {
            if (this.transform === Transform.deformation) {
                switch (this.handleCategory) {
                    case HandleCategory.location:
                        this.FreeDeformation(delta);
                        break;
                    case HandleCategory.center:
                        let prevhandle: Location = this.vertex.Nth(this.currentHandle - 2);
                        let nexthandle: Location = this.vertex.Nth(this.currentHandle - 1);
                        if (Math.abs(delta.x) > Math.abs(delta.y)) { //制限動作
                            prevhandle.x += delta.x;
                            nexthandle.x += delta.x;
                        } else {
                            prevhandle.y += delta.y;
                            nexthandle.y += delta.y;
                        }
                        break;
                    default:
                        break;
                }
                super.Deformation(delta);
            }
        }

        public Resize(origin: Location, magnify: Size): void {
            this.vertex.list.forEach((point) => {
                point.Resize(origin, magnify);
            });
            super.Resize(origin, magnify);
        }

        public Rotate(center: Location, degree: number): void {
            this.vertex.list.forEach((point) => {
                point.Rotate(center, degree);
            });
            super.Rotate(center, degree);
        }

        public IsRotable(): boolean {
            return true;
        }

    }

    export class CurveShape extends BaseShape {

        protected CopyContent(result: any): any {
            result = super.CopyContent(result);
            result.vertex = this.vertex.Clone();
            return result;
        }

        public Clone(): any {
            return this.CopyContent(new CurveShape(this.type, this.canvas, {}));
        }

        private FreeDeformation(delta: Location): void {

            // todo: 諸君、私はリファクタリングが好きだ。....分岐が減った時など、絶頂すらおぼえる。。。更なるリファクタを望むか？よろしい、ならばリファクタだ。一心不乱のリファクタを！！

            let point = this.currentHandle - 1;
            let round = (point): number => {
                let result: number = point;
                if (result < 0) {
                    result = this.vertex.list.length - 1;
                } else if (result > this.vertex.list.length - 1) {
                    result = 0;
                }
                return result;
            };

            let nexthandle: Location = this.vertex.list[round(point - 1)];
            let handle: Location = this.vertex.list[round(point)];
            let prevhandle: Location = this.vertex.list[round(point + 1)];

            switch (this.handleCategory) {
                case HandleCategory.location:
                    prevhandle.controlPoint0.x += delta.x;
                    prevhandle.controlPoint0.y += delta.y;
                    handle.controlPoint1.x += delta.x;
                    handle.controlPoint1.y += delta.y;
                    handle.x += delta.x;
                    handle.y += delta.y;
                    break;
                case HandleCategory.control0:
                    if (handle.miter === 0) {
                        nexthandle.controlPoint1.x -= delta.x;
                        nexthandle.controlPoint1.y -= delta.y;
                    }
                    handle.controlPoint0.x += delta.x;
                    handle.controlPoint0.y += delta.y;
                    break;
                case HandleCategory.control1:
                    if (handle.miter === 0) {
                        prevhandle.controlPoint0.x -= delta.x;
                        prevhandle.controlPoint0.y -= delta.y;
                    }
                    handle.controlPoint1.x += delta.x;
                    handle.controlPoint1.y += delta.y;
                    break;
            }
            this.ResizeRectangle(); //外接四角形のリサイズ
        }

        public ResizeRectangle(): void {
            let x: number = _.minBy(this.vertex.list, 'x').x;
            let y: number = _.minBy(this.vertex.list, 'y').y;
            this.rectangle.location.x = x;
            this.rectangle.location.y = y;
            this.rectangle.size.w = _.maxBy(this.vertex.list, 'x').x - x;
            this.rectangle.size.h = _.maxBy(this.vertex.list, 'y').y - y;
        }

        protected DrawCurveHandle(vertex: Location, next: Location): void {
            let context: any = this.canvas.context;
            try {
                context.save();
                context.beginPath();
                context.moveTo(vertex.x, vertex.y);
                context.lineTo(next.controlPoint0.x, next.controlPoint0.y); //control line 0
                context.moveTo(vertex.x, vertex.y);
                context.lineTo(vertex.controlPoint1.x, vertex.controlPoint1.y);//control line 1
                context.rect((vertex.x - handlesize), (vertex.y - handlesize), handlesize * 2, handlesize * 2);
                context.rect((vertex.controlPoint0.x - handlesize), (vertex.controlPoint0.y - handlesize), handlesize * 2, handlesize * 2);
                context.rect((vertex.controlPoint1.x - handlesize), (vertex.controlPoint1.y - handlesize), handlesize * 2, handlesize * 2);
                context.fillStyle = whitecolor.RGBA();
                context.fill();
                context.strokeStyle = blackcolor.RGBA();
                context.lineWidth = 0.5;
                context.stroke();
            } finally {
                context.restore();
            }
        }

        public DrawAllHandle(): void {
            super.DrawAllHandle();
            if (this.parent) {
                if (this.parent.IsRoot()) {
                    this.vertex.EachNext((obj: any, next: any) => {
                        this.DrawCurveHandle(obj, next);
                    });
                }
            }
        }

        public Property(): ShapeProperty {
            return this.property;
        }

        public AddCurveAbsolute(vertex: Location): void {
            this.vertex.Add(vertex);
        }

        public AddCurve(vertex: Location): void {
            this.vertex.Add(ShapeEdit.Location.Plus(vertex, this.rectangle.location));
        }

        static Each(elements, begin, each, end): void {
            for (let index: number = 0; index < elements.length; index++) {
                if (index === 0) {
                    begin(elements[index]);
                } else if (index >= elements.length - 1) {
                    end(elements[index]);
                } else {
                    each(elements[index]);
                }
            }
        }

        public Area(): number {
            return 0;
        }

        //図形にポイントが含まれるか
        public Contains(inner: Location): boolean {
            let cross: number = 0;
            this.vertex.list.forEach((point, index) => {
                cross += inner.CrossingCount(this.vertex.Nth(index), this.vertex.Nth(index + 1));
            });
            return ((cross % 2) === 1);// 交差ポイント数が奇数なら内側、偶数なら外。
        }

        public Serialize(): string {
            return '{"type":"' + this.type + '", "locked":"' + this.locked + '", "rectangle":' + this.rectangle.Serialize() + ', "vertex":' + this.vertex.Serialize() + ', "property":' + this.property.Serialize() + '}';
        }

        public Draw(): void {
            super.Draw();
            if (this.isSelected) {
                this.DrawAllHandle();
            }
        }

        public MoveTo(delta: Location): void {
            if (this.transform != Transform.deformation) {
                if (this.isSelected) {
                    this.vertex.list.forEach((vertex) => {
                        vertex.Move(delta);
                    });
                    this.ResizeRectangle();
                    this.canvas.handlers.Exec('move', this, null);
                }
            }
        }

        public HitShapes(location: Location, callback: (shape: BaseShape) => void): void {
        }

        public HitHandles(location: Location, callback: (handle_location: number, handle_category: HandleCategory) => void): void {
            let result: number = 0;
            let handlecategory: HandleCategory = HandleCategory.location;
            let rectangle: Rectangle = this.rectangle;
            switch (this.canvas.modifier) {
                case Key.normal:
                    let index: number = 0;
                    this.vertex.list.forEach((vertex) => {
                        index++;
                        if (location.Near(vertex, handlesize)) {
                            handlecategory = HandleCategory.location;
                            result = index;
                        } else if (location.Near(vertex.controlPoint0, handlesize)) {
                            handlecategory = HandleCategory.control0;
                            result = index;
                        } else if (location.Near(vertex.controlPoint1, handlesize)) {
                            handlecategory = HandleCategory.control1;
                            result = index;
                        }
                    });
                    if (location.Near(Location.Plus(rectangle.bottomright, resizehandleoffset), handlesize)) {
                        handlecategory = HandleCategory.resize;
                        result = -1;
                    } else if (location.Near(Location.Plus(rectangle.topcenter, rotatehandleoffset), handlesize)) {
                        handlecategory = HandleCategory.rotate;
                        result = -1;
                    }
                    break;
                case Key.shift:
                    if (location.Near(Location.Plus(rectangle.bottomright, resizehandleoffset), handlesize)) {
                        handlecategory = HandleCategory.resize;
                        result = -1;
                    } else if (location.Near(Location.Plus(rectangle.topcenter, rotatehandleoffset), handlesize)) {
                        handlecategory = HandleCategory.rotate;
                        result = -1;
                    }
                    break;
            }
            callback(result, handlecategory);
        }

        public Deformation(delta: Location): void {
            if (this.transform === Transform.deformation) {
                this.FreeDeformation(delta);
                super.Deformation(delta);
            }
        }

        public Resize(origin: Location, magnify: Size): void {
            this.vertex.list.forEach((vertex: Location) => {
                vertex.Resize(origin, magnify);
            });
            super.Resize(origin, magnify);
        }

        public Rotate(center: Location, degree: number): void {
            this.vertex.list.forEach((vertex: Location) => {
                vertex.Rotate(center, degree);
            });
            super.Rotate(center, degree);
        }

        public Intersection(rect: Rectangle): boolean {
            return (_.filter(this.vertex.list, (vertex: Location) => {
                return rect.LocationIsContain(vertex);
            }).length > 0);
        }

        public IsRotable(): boolean {
            return true;
        }
    }

    export class Bezier extends CurveShape {

        constructor(canvas: Canvas, obj: any) {
            super("Bezier", canvas, obj);
        }

        public Free() {
            super.Free();
        }

        public Clone(): any {
            return this.CopyContent(new Bezier(this.canvas, {}));
        }

        protected DrawContent(): void {
            let context: any = this.canvas.context;
            try {
                context.save();
                context.beginPath();
                let startpoint: Location = null;

                CurveShape.Each(this.vertex.list, (vertex) => {
                    context.moveTo(vertex.x, vertex.y);
                    startpoint = vertex;
                }, (vertex) => {
                    context.bezierCurveTo(vertex.controlPoint0.x, vertex.controlPoint0.y, vertex.controlPoint1.x, vertex.controlPoint1.y, vertex.x, vertex.y);
                }, (vertex) => {
                    context.bezierCurveTo(vertex.controlPoint0.x, vertex.controlPoint0.y, vertex.controlPoint1.x, vertex.controlPoint1.y, vertex.x, vertex.y);
                    context.bezierCurveTo(startpoint.controlPoint0.x, startpoint.controlPoint0.y, startpoint.controlPoint1.x, startpoint.controlPoint1.y, startpoint.x, startpoint.y);
                });

                context.closePath();
                context.fillStyle = this.property.FillStyle(context);
                context.fill();
                context.strokeStyle = this.property.strokestyle.CanvasValue(context);
                context.lineWidth = this.property.strokewidth;
                context.lineJoin = this.property.linejoin;//"miter";// bevel, round,

                if (context.lineWidth == 0) {
                    context.strokeStyle = new RGBAColor(255, 255, 255, 0);
                }

                if (this.canvas.plugins) {
                    this.canvas.plugins.Exec('draw', this, context);
                }
                context.stroke();
            } finally {
                context.restore();
            }
        }

        public ToSVG(callback: (error: any) => void): void {
            this.canvas.adaptor.Bezier(this, callback);
        }

        public ToPDF(callback: (error: any) => void): void {
            this.canvas.adaptor.Bezier(this, callback);
        }

        //Helpers
        public lineTo(px: number, py: number): void {
            this.AddCurveAbsolute(new ShapeEdit.Location(
                px, py,
                new ShapeEdit.Location(px, py),
                new ShapeEdit.Location(px, py)));
        };

        public bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, px: number, py: number): void {
            this.AddCurveAbsolute(new ShapeEdit.Location(
                px, py,
                new ShapeEdit.Location(cp1x, cp1y),
                new ShapeEdit.Location(cp2x, cp2y)));
        };
    }

    export class Polygon extends LineShape {

        constructor(canvas: Canvas, obj: any) {
            super("Polygon", canvas, obj);
        }

        public Free() {
            super.Free();
        }

        public Clone(): any {
            return this.CopyContent(new Polygon(this.canvas, {}));
        }

        protected DrawContent(): void {
            let context: any = this.canvas.context;
            try {
                context.save();
                context.beginPath();
                let startpoint: Location = null;

                LineShape.Each(this.vertex.list, (vertex) => {
                    context.moveTo(vertex.x, vertex.y);
                    startpoint = vertex;
                }, (vertex) => {
                    context.lineTo(vertex.x, vertex.y);
                }, (vertex) => {
                    context.lineTo(vertex.x, vertex.y);
                });

                context.closePath();
                context.fillStyle = this.property.FillStyle(context);
                context.fill();
                context.strokeStyle = this.property.strokestyle.CanvasValue(context);
                context.lineWidth = this.property.strokewidth;
                context.lineJoin = this.property.linejoin;//"miter";// bevel, round,

                if (context.lineWidth == 0) {
                    context.strokeStyle = new RGBAColor(255, 255, 255, 0);
                }

                if (this.canvas.plugins) {
                    this.canvas.plugins.Exec('draw', this, context);
                }
                context.stroke();
            } finally {
                context.restore();
            }
        }

        public ToSVG(callback: (error: any) => void): void {
            this.canvas.adaptor.Polygon(this, callback);

        }

        public ToPDF(callback: (error: any) => void): void {
            this.canvas.adaptor.Polygon(this, callback);
        }


        //Helper
        public lineTo(px: number, py: number): void {
            this.AddVertex(new ShapeEdit.Location(px, py));
        };

    }

    export class Text extends RectShape {

        constructor(canvas: Canvas, obj: any) {
            super("Text", canvas, obj);
            this.canvas.context.font = this.property.font.Value();
            this.ResizeRectangle();
        }

        public Free() {
            super.Free();
        }

        public Clone(): any {
            return this.CopyContent(new Text(this.canvas, {}));
        }

        static CRLF(char: string, prevchar: PrevChar, addline: () => void, addchar: () => void): PrevChar {
            let result: PrevChar = prevchar;
            switch (prevchar) {
                case PrevChar.normal:
                    switch (char.charCodeAt(0)) {
                        case 0x0D: //CR
                            result = PrevChar.cr;
                            addline();
                            break;
                        case 0x0A: //LF
                            result = PrevChar.lf;
                            addline();
                            break;
                        default:
                            addchar();
                            break;
                    }
                    break;
                case PrevChar.cr:
                    switch (char.charCodeAt(0)) {
                        case 0x0D: //CR
                            addline();
                            break;
                        case 0x0A: //LF
                            result = PrevChar.lf;
                            break;
                        default:
                            result = PrevChar.normal;
                            addchar();
                            break;
                    }
                    break;
                case PrevChar.lf:
                    switch (char.charCodeAt(0)) {
                        case 0x0D: //CR
                            result = PrevChar.cr;
                            break;
                        case 0x0A: //LF
                            addline();
                            break;
                        default:
                            result = PrevChar.normal;
                            addchar();
                            break;
                    }
                    break;
            }
            return result;
        }

        private FitText(textContent: string, textwidth: number[], hint: number): {line; length}[] {//Fontの幅から行オーバーフローを判定し、改行
            let result: {line; length}[] = [];
            let linewidth: number = 0;
            let line: string = "";
            let prevchar: PrevChar = PrevChar.normal;

            let index: number = 0;
            _.forEach(textContent, (char) => {//Textの一文字をとって
                linewidth += textwidth[index] * hint;// 現在までの行長さにfont幅を加算（textwidth=すでにとっておいた一文字ごとのFont幅）
                // linewidth += this.canvas.context.measureText(char).width;//クライアントの場合、measureTextが使用できるが。。
                if (linewidth > this.rectangle.size.w) {       // サイズオーバー、改行必要
                    result.push({line: line, length: linewidth});//現在までの業を行に追加
                    linewidth = 0;//次の行のための初期化
                    line = "";//次の行のための初期化
                }

                prevchar = Text.CRLF(char, prevchar,
                    () => {
                        result.push({line: line, length: linewidth});
                        linewidth = 0;
                        line = "";
                    },
                    () => {
                        line += char;
                    });
                index++;

            });
            result.push({line: line, length: linewidth});
            return result;
        }

        private DrawText(hint: number, draw: (line: any, x: number, y: number) => void): void {
            let lineheight: number = this.property.font.size * 1.2;
            let lineoffset: number = this.rectangle.location.y + lineheight;
            let height: number = lineheight;
            let textContent: string = this.property.text;
            this.property.text = this.property.text;    //  reculc! (ignore warning please.)
            let textwidth: number[] = this.property.textwidth;

            let align: string = this.property.align;
            _.forEach(this.FitText(textContent, textwidth, hint), (line) => {   // line : 一行分の長さ
                let offset: number = 0;
                switch (align) {
                    case "left":
                        offset = 0;
                        break;
                    case "right":
                        offset = Math.abs(this.rectangle.size.w - line.length);
                        break;
                    case "center":
                        offset = Math.abs(this.rectangle.size.w - line.length) / 2;
                        break;
                }
                draw(line, this.rectangle.location.x + offset, lineoffset);
                lineoffset += lineheight;
                height += lineheight;
            });
            //  this.rectangle.size.h = height;
        }

        protected DrawContent(): void {
            let context: any = this.canvas.context;
            try {
                context.save();

                context.fillStyle = this.property.FillStyle(context);
                //this.property.font.size = (this.property.font.size);

                context.font = this.property.font.Value();

                let hoge = this.property.font.Value();

                //   context.font = "normal normal normal 100px 'Nico Moji',sans-serif";

                context.textAlign = "left";
                this.DrawText(1, (line, x, y) => {
                    context.fillText(line.line, x, y);
                });

                if (this.canvas.plugins) {
                    this.canvas.plugins.Exec('draw', this, context);
                }

            } finally {
                context.restore();
            }
        }

        public Text(): string {
            return this.property.text;
        }

        public Resize(origin: Location, magnify: Size): void {
            this.property.font.size *= magnify.w;
            super.Resize(origin, magnify);
        }

        public SetText(text: string): void {  // todo : timing measure text
            this.property.text = text;
            this.canvas.context.font = this.property.font.Value();
            this.DrawText(1, (line, x, y) => {
                this.canvas.context.fillText(line.line, x, y);
            });
            this.ResizeRectangle();
        }

        public ToSVG(callback: (error: any) => void): void {
            this.canvas.adaptor.Text(this, callback);
        }

        public ToPDF(callback: (error: any) => void): void {
            this.canvas.adaptor.Text(this, callback);
        }

    }

    export class Box extends RectShape {

        constructor(canvas: Canvas, obj: any) {
            super("Box", canvas, obj);
        }

        public Free() {
            super.Free();
        }

        public Clone(): any {
            return this.CopyContent(new Box(this.canvas, {}));
        }

        protected DrawContent(): void {
            let context: any = this.canvas.context;
            try {
                context.save();
                context.beginPath();
                context.rect(this.rectangle.location.x, this.rectangle.location.y, this.rectangle.size.w, this.rectangle.size.h);
                context.fillStyle = this.property.FillStyle(context);
                context.fill();
                context.strokeStyle = this.property.strokestyle.CanvasValue(context);
                context.lineWidth = this.property.strokewidth;

                if (context.lineWidth == 0) {
                    context.strokeStyle = new RGBAColor(255, 255, 255, 0);
                }

                if (this.canvas.plugins) {
                    this.canvas.plugins.Exec('draw', this, context);
                }
                context.stroke();
            } finally {
                context.restore();
            }
        }

        public ToSVG(callback: (error: any) => void): void {
            this.canvas.adaptor.Box(this, callback);
        }

        public ToPDF(callback: (error: any) => void): void {
            this.canvas.adaptor.Box(this, callback);
        }
    }

    export class Oval extends RectShape {

        constructor(canvas: Canvas, obj: any) {
            super("Oval", canvas, obj);
        }

        public Free() {
            super.Free();
        }

        protected DrawContent(): void {
            let context: any = this.canvas.context;
            try {
                context.save();
                context.beginPath();
                let rx: number = this.rectangle.size.w / 2;
                let ry: number = this.rectangle.size.h / 2;
                let cx: number = this.rectangle.location.x + rx;
                let cy: number = this.rectangle.location.y + ry;
                context.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI, false);
                context.fillStyle = this.property.FillStyle(context);
                context.fill();
                context.lineWidth = this.property.strokewidth;
                context.strokeStyle = this.property.strokestyle.CanvasValue(context);

                if (context.lineWidth == 0) {
                    context.strokeStyle = new RGBAColor(255, 255, 255, 0);
                }

                if (this.canvas.plugins) {
                    this.canvas.plugins.Exec('draw', this, context);
                }
                context.stroke();
            } finally {
                context.restore();
            }
        }

        public Clone(): any {
            return this.CopyContent(new Oval(this.canvas, {}));
        }

        public Area(): number {
            return Math.round(3.14 * (this.rectangle.size.w / 2) * (this.rectangle.size.h / 2));
        }

        public ToSVG(callback: (error: any) => void): void {
            this.canvas.adaptor.Oval(this, callback);
        }

        public ToPDF(callback: (error: any) => void): void {
            this.canvas.adaptor.Oval(this, callback);
        }

    }

    export class ImageRect extends RectShape {

        constructor(canvas: Canvas, obj: any) {
            super("ImageRect", canvas, obj);
        }

        public Free() {
            super.Free();
        }

        public Clone(): any {
            return this.CopyContent(new ImageRect(this.canvas, {}));
        }

        protected DrawContent(): void {
            let context: any = this.canvas.context;
            try {
                context.save();
                if (this.property.image) {
                    if (!this.property.haserror) {
                        context.drawImage(this.property.image, this.rectangle.location.x, this.rectangle.location.y, this.rectangle.size.w, this.rectangle.size.h);
                    }
                    if (this.canvas.plugins) {
                        this.canvas.plugins.Exec('draw', this, context);
                    }
                }
            } finally {
                context.restore();
            }
        }

        // Click Where Handle?
        public HitHandles(location: Location, callback: (handle_location: number, handle_category: HandleCategory) => void): void {
            let result: number = 0;
            let handlecategory: HandleCategory = HandleCategory.location;
            switch (this.canvas.modifier) {
                case Key.normal:
                    if (this.handletl.Contains(location)) {
                        result = 1;
                    } else if (this.handletc.Contains(location)) {
                        result = 2;
                    } else if (this.handletr.Contains(location)) {
                        result = 3;
                    } else if (this.handlerc.Contains(location)) {
                        result = 4;
                    } else if (this.handlebr.Contains(location)) {
                        result = 5;
                    } else if (this.handlebc.Contains(location)) {
                        result = 6;
                    } else if (this.handlebl.Contains(location)) {
                        result = 7;
                    } else if (this.handlelc.Contains(location)) {
                        result = 8;
                    } else if (location.Near(Location.Plus(this.rectangle.bottomright, resizehandleoffset), handlesize)) {
                        handlecategory = HandleCategory.resize;
                        result = -1;
                    }
                    break;
                case Key.shift:
                    if (location.Near(Location.Plus(this.rectangle.bottomright, resizehandleoffset), handlesize)) {
                        handlecategory = HandleCategory.resize;
                        result = -1;
                    }
                    break;
            }
            callback(result, handlecategory);
        }

        public ToSVG(callback: (error: any) => void): void {
            this.canvas.adaptor.ImageRect(this, callback);

        }

        public ToPDF(callback: (error: any) => void): void {
            this.canvas.adaptor.ImageRect(this, callback);
        }

    }

    // Root Shapes
    export class Shapes extends BaseShape {

        constructor(canvas: Canvas, obj: any) {
            super("Shapes", canvas, obj);
            this.ClearSelected();
        }

        public Free() {
            super.Free();
        }

        public Clone(): any {
            return this.CopyContent(new Shapes(this.canvas, {}));
        }

        protected DrawContent(): void {
            let context: any = this.canvas.context;
            try {
                context.save();
                if (this.isSelected) {
                    this.DrawAllHandle();
                }
                if (this.canvas.plugins) {
                    this.canvas.plugins.Exec('draw', this, context);
                }
            } finally {
                context.restore();
            }
        }

        public SetFillColor(color: Style): void {
            this.property.fillstyle = color;
            this.canvas.handlers.Exec('change', this, null);
            //      this.property.fillstyle = color;
            //      this.canvas.handlers.Exec('change', this, null);
            //      this.Shapes().forEach((shape: BaseShape): void => {
            //          shape.SetFillColor(color);
            //      });
        }

        public FillColor(): Style {
            return this.property.fillstyle;
        }

        public SetStrokeColor(color: Style): void {
            this.property.strokestyle = color;
            this.canvas.handlers.Exec('change', this, null);
            //       this.property.strokestyle = color;
            //       this.canvas.handlers.Exec('change', this, null);
            //       this.Shapes().forEach((shape: BaseShape): void => {
            //           shape.SetStrokeColor(color);
            //       });
        }

        public StrokeColor(): Style {
            return this.property.strokestyle;
        }

        public SetStrokeWidth(width: number): void {
            this.property.strokewidth = width;
            this.canvas.handlers.Exec('change', this, null);
            //       this.property.strokewidth = width;
            //       this.canvas.handlers.Exec('change', this, null);
            //       this.Shapes().forEach((shape: BaseShape): void => {
            //           shape.SetStrokeWidth(width);
            //       });
        }

        public StrokeWidth(): number {
            return this.property.strokewidth;
        }

        public Select(): void {
            super.Select();
            this.Shapes().forEach((shape: BaseShape): void => {
                shape.Select();
            });
        }

        public Deselect(): void {
            super.Deselect();
            this.Shapes().forEach((shape: BaseShape): void => {
                shape.Deselect();
            });
        }

        public Capture(): void {
            super.Capture();
            this.Shapes().forEach((shape: BaseShape): void => {
                shape.Capture();
            });
        }

        public Release(): void {
            super.Release();
            this.Shapes().forEach((shape: BaseShape): void => {
                shape.Release();
            });
        }

        public Group(): void {
        }

        public Ungroup(): void {
            if (this.parent) {
                this.Shapes().forEach((shape: BaseShape): void => {
                    this.parent.Add(shape);
                });
                this.shapes = [];
            }
        }

        public MoveTo(delta: Location): void {
            if (this.transform != Transform.deformation) {
                if (this.isSelected) {
                    this.rectangle.location.x += delta.x;
                    this.rectangle.location.y += delta.y;
                    this.canvas.handlers.Exec('move', this, null);
                    this.Shapes().forEach((shape: BaseShape): void => {
                        shape.MoveTo(delta);
                        this.canvas.handlers.Exec('move', shape, null);
                    });
                }
            }
        }

        public HitHandles(location: Location, callback: (handle_location: number, handle_category: HandleCategory) => void): void {
            let result: number = 0;
            let handlecategory: HandleCategory = HandleCategory.location;
            let rectangle = this.rectangle;
            switch (this.canvas.modifier) {
                case Key.normal: //deformation
                    if (location.Near(rectangle.topleft, handlesize)) {
                        result = 1;
                    } else if (location.Near(rectangle.topright, handlesize)) {
                        result = 3;
                    } else if (location.Near(rectangle.bottomleft, handlesize)) {
                        result = 5;
                    } else if (location.Near(rectangle.bottomright, handlesize)) {
                        result = 7;
                    } else if (location.Near(Location.Plus(rectangle.bottomright, resizehandleoffset), handlesize)) {
                        handlecategory = HandleCategory.resize;
                        result = -1;
                    } else if (location.Near(Location.Plus(rectangle.topcenter, rotatehandleoffset), handlesize)) {
                        handlecategory = HandleCategory.rotate;
                        result = -1;
                    }
                    break;
                case Key.shift:
                    if (location.Near(Location.Plus(rectangle.bottomright, resizehandleoffset), handlesize)) {
                        handlecategory = HandleCategory.resize;
                        result = -1;
                    } else if (location.Near(Location.Plus(rectangle.topcenter, rotatehandleoffset), handlesize)) {
                        handlecategory = HandleCategory.rotate;
                        result = -1;
                    }
                    break;
            }
            callback(result, handlecategory);
        }

        public HitShapes(location: Location, callback: (shape: BaseShape) => void): void {
            let stack = [];
            this.Shapes().forEach((shape: BaseShape): void => {
                if (shape.Contains(location)) {
                    stack.push(shape);
                }
            });
            stack.reverse();
            if (stack.length > 0) {
                let top_shape = stack[0];
                if (top_shape.type === "Shapes") {
                    top_shape.HitShapes(location, callback);
                }
                callback(top_shape);
            }
        }

        public Deformation(delta: Location): void {

        }

        public Resize(origin: Location, magnify: Size): void {
            this.shapes.forEach((shape: BaseShape) => {
                shape.Resize(origin, magnify);
            });
            super.Resize(origin, magnify);
        }

        public Rotate(center: Location, degree: number): void {
            this.shapes.forEach((shape: BaseShape) => {
                shape.Rotate(center, degree);
            });
            super.Rotate(center, degree);
        }

        public IsRotable(): boolean {
            return (_.filter(this.shapes, (shape: BaseShape) => {
                return !shape.IsRotable();
            }).length === 0);
        }

        public ResizeRectangle(): void {
            let x: number = _.minBy(this.Shapes(), 'rectangle.topleft.x').rectangle.topleft.x;
            let y: number = _.minBy(this.Shapes(), 'rectangle.topleft.y').rectangle.topleft.y;
            this.rectangle.location.x = x;
            this.rectangle.location.y = y;
            this.rectangle.size.w = _.maxBy(this.Shapes(), 'rectangle.bottomright.x').rectangle.bottomright.x - x;
            this.rectangle.size.h = _.maxBy(this.Shapes(), 'rectangle.bottomright.y').rectangle.bottomright.y - y;
        }

        public Location(): Location {
            return this.rectangle.location;
        }

        public Size(): Size {
            return this.rectangle.size;
        }

        public Contains(location: Location): boolean {
            return (_.filter<BaseShape>(this.Shapes(), (shape: BaseShape): boolean => {
                return shape.Contains(location);
            }).length != 0);
        }

        public Equals(shape: BaseShape): number[][] {
            return this.rectangle.Equals(shape.rectangle);
        }

        public Property(): ShapeProperty {
            return this.property;
        }

        public Serialize(): string {
            let result: string = "[";
            let dellimitter: string = "";
            this.Shapes().forEach((shape: BaseShape) => {
                result += dellimitter + shape.Serialize();
                dellimitter = ",";
            });
            return '{"type":"' + this.type + '", "locked":"' + this.locked + '", "rectangle":' + this.rectangle.Serialize() + ', "property":' + this.property.Serialize() + ', "shapes":' + result + ']}';
        }

        public getShapeById(id: string): string {
            let result = null;
            if (this.parent) {
                if (id == this.ID()) {
                    result = this;
                }
            }
            this.Shapes().forEach((shape: BaseShape): void => {
                result = result || shape.getShapeById(id);
            });
            return result;
        }

        public getShapeByType(type: string, result: any[]): void {
            if (this.parent) {
                if (this.type == type) {
                    result.push(this);
                }
            }
            this.Shapes().forEach((shape: BaseShape): void => {
                shape.getShapeByType(type, result);
            });
        }

        public getShapeByTypes(types: string[], result: any[]): void {
            if (this.parent) {
                if (types.indexOf(this.type) >= 0) {
                    result.push(this);
                }
            }
            this.Shapes().forEach((shape: BaseShape): void => {
                shape.getShapeByTypes(types, result);
            });
        }

        public ToSVG(callback: (error: any) => void): void {
            this.canvas.adaptor.Shapes(this, callback);
        }

        public ToPDF(callback: (error: any) => void): void {
            this.canvas.adaptor.Shapes(this, callback);
        }

        public Add(shape: BaseShape): void {
            shape.SetParent(this);
            this.Shapes().push(shape);
            if (this.parent) {
                this.ResizeRectangle();
            }
        }

        public Remove(shape: BaseShape): void {
            _.pull(this.Shapes(), shape);
            if (this.parent) {
                this.ResizeRectangle();
            }
        }

        public Draw(): void {
            this.DrawContent();
            this.Shapes().forEach((shape: BaseShape): void => {
                shape.Draw();
            });
        }

        public Tick(): void {
            this.Shapes().forEach((shape: BaseShape): void => {
                shape.Tick();
            });
        }

        public Each(callback: (shape: BaseShape) => void): void {
            this.Shapes().forEach(callback);
        }

        public ClearSelected(): void {
            this.Shapes().forEach((shape: BaseShape): void => {
                shape.EndDeformation();
                shape.EndResize();
                shape.Deselect();
                shape.Release();
            });
        }

        public Selected(): BaseShape[] {
            return _.filter<BaseShape>(this.Shapes(), (shape: BaseShape): boolean => {
                return (shape.IsSelected());
            });
        }

        public Pull(callback: (shape) => void): BaseShape[] {
            //   let result:BaseShape[] = _.filter<BaseShape>(this.Shapes(), (shape:BaseShape):boolean => {
            //       return shape.IsSelected();
            //   });

            let result: BaseShape[] = this.Selected();
            result.forEach((selected: BaseShape) => {
                callback(selected);
                _.pull<BaseShape>(this.Shapes(), selected);
            });
            return result;
        }

        public ToTop(): void {
            _.forEach(this.Pull((shape) => {
            }), (shape: BaseShape) => {
                this.shapes.push(shape);
            });
            this.canvas.handlers.Exec('change', this, null);
        }

        public ToBottom(): void {
            _.forEach(this.Pull((shape) => {
            }), (shape: BaseShape) => {
                this.shapes.unshift(shape);
            });
            this.canvas.handlers.Exec('change', this, null);
        }

        public Lock(): void {
            this.isSelected = false;
            this.locked = true;
            this.Shapes().forEach((shape: BaseShape): void => {
                shape.Lock();
            });
        }

        public UnLock(): void {
            this.locked = false;
            this.Shapes().forEach((shape: BaseShape): void => {
                shape.UnLock();
            });
        }

        public Intersection(rect: Rectangle): boolean {
            return (_.filter<BaseShape>(this.shapes, (shape: BaseShape) => {
                return shape.Intersection(rect);
            }).length > 0);
        }

        public Clear(): void {
            delete this.shapes;
            this.shapes = [];
        }

        static Load(canvas: Canvas, shapes: any): Shapes {
            return new ShapeEdit.Shapes(canvas, shapes);
        }
    }

    // Canvas Object
    export class Canvas extends Typed {

        public canvas: any;
        public context: any;
        public handlers: EventHandlers;// event handler
        public plugins: Plugins;// event handler
        public adaptor: any;
        public shapes: Shapes;// All shapes root
        public pixelRatio: number;
        //  public shift:boolean;// is Shift Key
        public modifier: Key;
        private mode: Mode;//Drwwing mode
        private newshape: BaseShape;// On the way Polygon
        private newcurve: Location;
        private selectrect: Rectangle;// for multiselect lasso
        private copybuffer: BaseShape;// for copy/paste
        //  private undobuffer:Stack<any>;
        private undoheap: any;
        private isdrag: boolean;

        get Mode(): Mode {
            return this.mode;
        }

        static Grid(n: number): number {
            return Math.round(n / gridsize) * gridsize;
        }

        constructor(canvas: any, handlers: EventHandlers, plugins: Plugins, adaptor: any, editmode: boolean) {
            super("Canvas");

            this.canvas = canvas;

            this.context = this.canvas.getContext('2d');

            this.adaptor = adaptor;

            this.handlers = handlers;
            this.plugins = plugins;
            this.mode = Mode.move;
            this.copybuffer = null;
            // this.undobuffer = new Stack<string>(1);
            this.undoheap = null;
            this.isdrag = false;

            this.selectrect = null;

            this.newshape = null;
            this.newcurve = null;

            this.modifier = Key.normal;

            if (editmode) {
                this.canvas.style.cursor = "pointer";

                //リサイズなど
                let ModifyShape = (offsetX: number, offsetY: number): boolean => {
                    let result: boolean = false;
                    this.shapes.Selected().forEach((shape: BaseShape) => {                               //すべての選択されたShapeを
                        if (!shape.IsLocked()) {                                                        //lockされていれば何もしない
                            shape.HitHandles(new ShapeEdit.Location(offsetX, offsetY), (handle_location: number, handle_category: HandleCategory): void => {//選択されたShapeのハンドルクリックなら
                                if (handle_location != 0) {
                                    switch (handle_category) {
                                        case HandleCategory.resize:
                                            shape.BeginResize(handle_location, handle_category);      //リサイズ開始
                                            this.canvas.style.cursor = "url('/systems/common/shape_edit/image/scale.png'), auto";
                                            break;
                                        case HandleCategory.rotate:
                                            //   let degree = shape.Degree(shape.rectangle.Center(), new Location(offsetX, offsetY));
                                            let degree = BaseShape.Degree(shape.rectangle.Center(), Location.Plus(shape.rectangle.topcenter, rotatehandleoffset));
                                            shape.BeginRotate(handle_location, handle_category, degree);      //回転開始
                                            this.canvas.style.cursor = "url('/systems/common/shape_edit/image/blue.png'), auto";//crosshair
                                            break;
                                        default:
                                            shape.BeginDeformation(handle_location, handle_category); //変形開始
                                            if ((shape.type === "Polygon") || (shape.type === "Bezier")) {
                                                this.canvas.style.cursor = "move";
                                            } else {
                                                this.SetCursor(handle_location);
                                            }
                                            break;
                                    }
                                    //      this.SavePoint();
                                    result = true;
                                }
                            });
                        }
                    });
                    return result;
                };

                let MoveShape = (offsetX: number, offsetY: number): boolean => {
                    let result: boolean = false;
                    this.shapes.HitShapes(new ShapeEdit.Location(offsetX, offsetY), (hitshape: BaseShape): void => {//クリックされたShapeについて
                        if (!hitshape.IsLocked()) {                                         //lockされていれば何もしない
                            this.SavePoint();
                            if (this.modifier != Key.shift) {                                              //Shiftキー押下なら多重選択。
                                this.shapes.ClearSelected();                                //そうでなければ全てのShapeの選択を解除。
                            }
                            this.shapes.Selected().forEach((selectshape: BaseShape) => {     //すべての選択されたShapeを
                                selectshape.Capture();                                      //キャプチャ
                            });

                            hitshape.Select();                                              //自分もセレクト
                            hitshape.Capture();                                             //自分もキャプチャ
                            this.canvas.style.cursor = "move";                              //カーソル変えて
                            result = true;                                                    //移動開始
                        }
                    });
                    return result;
                };

                let SelectStart = (offsetX: number, offsetY: number): void => {

                    this.shapes.Shapes().forEach((shape: BaseShape): void => {
                        shape.prevlocation.x = offsetX;
                        shape.prevlocation.y = offsetY;
                    });

                    switch (this.Mode) {
                        case Mode.move:
                            if (!ModifyShape(offsetX, offsetY)) {
                                if (!MoveShape(offsetX, offsetY)) {
                                    this.ClearSelected();
                                    this.BeginSelect(offsetX, offsetY);
                                }
                            }
                            break;
                        case Mode.draw:
                            if (!this.newshape) {
                                let property: ShapeProperty = new ShapeProperty(this, '', [], '', new RGBAColor(255, 255, 255, 1), new RGBAColor(0, 0, 0, 1), 0, new Font("", "", "", 0, "", []), "", "miter", {});
                                this.newshape = new Polygon(this, {property: property});
                                this.newshape.Select();
                            } else {
                                let firstlocation: Location = this.newshape.Vertex().list[0]; // 先頭
                                let lastlocation: Location = new ShapeEdit.Location(offsetX, offsetY); //最後
                                if (firstlocation.Near(lastlocation, handlesize)) {
                                    this.ClosePath();
                                    this.mode = Mode.move;
                                }
                            }
                            break;
                        case Mode.bezierdraw://a  //start
                            if (!this.newshape) {
                                let property: ShapeProperty = new ShapeProperty(this, '', [], '', new RGBAColor(255, 255, 255, 1), new RGBAColor(0, 0, 0, 1), 0, new Font("", "", "", 0, "", []), "", "miter", {});
                                this.newshape = new Bezier(this, {property: property});
                                this.newcurve = new Location(offsetX, offsetY, new ShapeEdit.Location(offsetX, offsetY), new Location(offsetX, offsetY));
                                this.newshape.AddCurveAbsolute(this.newcurve);
                                this.newshape.ResizeRectangle(); //外接四角形のリサイズ
                                this.newshape.Select();
                            } else {
                                let firstlocation: Location = this.newshape.Vertex().list[0]; // 先頭
                                let lastlocation: Location = new ShapeEdit.Location(offsetX, offsetY); //最後
                                if (firstlocation.Near(lastlocation, handlesize)) {
                                    this.ClosePath();
                                    this.mode = Mode.move;
                                } else {
                                    this.newcurve = new ShapeEdit.Location(offsetX, offsetY, new ShapeEdit.Location(offsetX, offsetY), new ShapeEdit.Location(offsetX, offsetY), 1);
                                    this.newshape.AddCurveAbsolute(this.newcurve);
                                    this.newshape.ResizeRectangle(); //外接四角形のリサイズ
                                }
                            }
                            break;
                    }
                };

                let SelectEnd = (offsetX: number, offsetY: number): void => {
                    this.Draw(() => {
                        switch (this.Mode) {
                            case Mode.move:
                                this.EndSelect();
                                this.shapes.Selected().forEach((shape: BaseShape) => {

                                    if (!shape.IsLocked()) {
                                        switch (shape.Transform()) {
                                            case Transform.deformation:
                                                shape.EndDeformation();
                                                break;
                                            case Transform.resize:
                                                shape.EndResize();
                                                break;
                                            case Transform.rotate:
                                                shape.EndRotate();
                                                break;
                                            case Transform.none:
                                                break;
                                        }
                                        shape.Release();
                                        this.canvas.style.cursor = "pointer";
                                    }
                                });

                                //  this.SavePoint();

                                break;
                            case Mode.draw:
                                if (this.newshape) {
                                    this.newshape.AddVertexAbsolute(new ShapeEdit.Location(offsetX, offsetY));
                                    this.newshape.ResizeRectangle(); //外接四角形のリサイズ
                                }
                                break;
                            case Mode.bezierdraw://b //end
                                this.newcurve = new Location(offsetX, offsetY, new ShapeEdit.Location(offsetX, offsetY), new ShapeEdit.Location(offsetX, offsetY));
                                break;
                        }
                    });
                };

                let DrawPolygon = (offsetX: number, offsetY: number): void => {
                    let context: any = this.context;
                    try {
                        context.save();
                        context.beginPath();
                        LineShape.Each(this.newshape.Vertex().list, (vertex) => {
                            context.moveTo(vertex.x, vertex.y);
                        }, (vertex) => {
                            context.lineTo(vertex.x, vertex.y);
                        }, (vertex) => {
                            context.lineTo(vertex.x, vertex.y);
                        });
                        context.lineTo(offsetX, offsetY);
                        context.fillStyle = blackcolor;// new RGBAColor(0, 0, 0, 1);
                        context.fill();
                        context.strokeStyle = blackcolor;//= new RGBAColor(0, 0, 0, 1);
                        context.lineWidth = 3;
                        context.stroke();
                    } finally {
                        context.restore();
                    }
                };

                let DrawBezier = (offsetX: number, offsetY: number, cp0: Location, cp1: Location): void => {
                    let vertex: RingList = this.newshape.Vertex();
                    let context: any = this.context;
                    try {
                        context.save();
                        context.beginPath();
                        let startpoint: Location = vertex.list[0];
                        CurveShape.Each(this.newshape.Vertex().list, (curve) => {
                            context.moveTo(curve.x, curve.y);
                            startpoint = curve;
                        }, (curve) => {
                            context.bezierCurveTo(curve.controlPoint0.x, curve.controlPoint0.y, curve.controlPoint1.x, curve.controlPoint1.y, curve.x, curve.y);
                        }, (curve) => {
                            context.bezierCurveTo(curve.controlPoint0.x, curve.controlPoint0.y, curve.controlPoint1.x, curve.controlPoint1.y, curve.x, curve.y);
                        });
                        context.bezierCurveTo(cp0.x, cp0.y, cp1.x, cp1.y, offsetX, offsetY);
                        context.fillStyle = blackcolor;// new RGBAColor(0, 0, 0, 1);
                        context.fill();
                        context.strokeStyle = blackcolor;//new RGBAColor(0, 0, 0, 1);
                        context.lineWidth = 3;
                        context.stroke();
                    } finally {
                        context.restore();
                    }
                };

                let onDown = (e: MouseEvent): void => {
                    this.isdrag = true;
                    SelectStart(e.offsetX, e.offsetY);
                };

                let onUp = (e: MouseEvent): void => {
                    SelectEnd(e.offsetX, e.offsetY);
                    this.isdrag = false;
                };

                let onMove = (e: MouseEvent): void => {
                    this.Draw(() => {
                        switch (this.Mode) {
                            case Mode.move:
                                this.LassoSelect(e.offsetX, e.offsetY);
                                this.shapes.Selected().forEach((shape: BaseShape) => {
                                    if (!shape.IsLocked()) {
                                        switch (shape.Transform()) {
                                            case Transform.deformation:
                                                shape.Deformation(new ShapeEdit.Location(e.offsetX - shape.prevlocation.x, e.offsetY - shape.prevlocation.y));
                                                shape.prevlocation.x = e.offsetX;
                                                shape.prevlocation.y = e.offsetY;
                                                break;
                                            case Transform.resize:
                                                let magnifyw = (e.offsetX - shape.rectangle.location.x - resizehandleoffset.x) / (shape.rectangle.bottomright.x - shape.rectangle.location.x);
                                                let magnifyh = (e.offsetY - shape.rectangle.location.y - resizehandleoffset.y) / (shape.rectangle.bottomright.y - shape.rectangle.location.y);
                                                if ((magnifyw > 0) && (magnifyh > 0)) {
                                                    if (this.modifier === Key.shift) { //等比率拡大縮小
                                                        magnifyw = Math.max(magnifyw, magnifyh);
                                                        magnifyh = magnifyw;
                                                    }
                                                    shape.Resize(shape.rectangle.location, new Size(magnifyw, magnifyh));
                                                }
                                                break;
                                            case Transform.rotate:
                                                if (shape.IsRotable()) {
                                                    let context: any = this.context;
                                                    try {// Guideline
                                                        context.save();
                                                        context.beginPath();
                                                        context.moveTo(shape.center.x, shape.center.y);
                                                        context.lineTo(e.offsetX, e.offsetY);
                                                        context.strokeStyle = guidelinecolor.Lighten(50).RGB();
                                                        context.lineWidth = 1;
                                                        context.stroke();
                                                    } finally {
                                                        context.restore();
                                                    }

                                                    let current = null;
                                                    if (this.modifier === Key.shift) { //制限回転
                                                        current = BaseShape.Degree(shape.center, new ShapeEdit.Location(e.offsetX, e.offsetY));
                                                    } else {
                                                        current = Math.round(Math.round(Math.round(BaseShape.Degree(shape.center, new ShapeEdit.Location(e.offsetX, e.offsetY))) / 15) * 15);
                                                    }
                                                    shape.Rotate(shape.center, current - shape.degree);
                                                    shape.degree = current;
                                                }
                                                break;
                                            default:
                                                if (shape.IsCapture()) {
                                                    shape.MoveTo(new ShapeEdit.Location(e.offsetX - shape.prevlocation.x, e.offsetY - shape.prevlocation.y));
                                                    shape.prevlocation.x = e.offsetX;
                                                    shape.prevlocation.y = e.offsetY;
                                                    this.DrawGrid(shape);
                                                }
                                                break;
                                        }
                                    }
                                });
                                break;
                            case Mode.draw:
                                if (this.newshape) {
                                    DrawPolygon(e.offsetX, e.offsetY);
                                }
                                break;
                            case Mode.bezierdraw://c1 //move
                                if (this.newshape) {
                                    if (this.newcurve) {
                                        let curve = this.newcurve;
                                        if (this.isdrag) {
                                            curve.controlPoint0.x = curve.x;
                                            curve.controlPoint0.y = curve.y;
                                            curve.controlPoint1.x = curve.x;
                                            curve.controlPoint1.y = curve.y;
                                            DrawBezier(curve.x, curve.y, curve.controlPoint0, curve.controlPoint1);
                                        } else {
                                            curve.x = e.offsetX;
                                            curve.y = e.offsetY;
                                            curve.controlPoint0.x = curve.x;
                                            curve.controlPoint0.y = curve.y;
                                            curve.controlPoint1.x = curve.x;
                                            curve.controlPoint1.y = curve.y;
                                            DrawBezier(curve.x, curve.y, curve.controlPoint0, curve.controlPoint1);
                                            this.newshape.DrawAllHandle();
                                        }
                                    }
                                }
                                break;
                            default:
                                let a = 1;
                                break;
                        }
                    });
                };

                let onContextMenu = (e: MouseEvent): void => {
                    this.shapes.Selected().forEach((shape: BaseShape) => {
                        this.handlers.Exec('contextmenu', shape, e);
                    });
                };

                /////// todo
                let onTouchStart = (e: TouchEvent): void => {
                    _.forEach(e.changedTouches, (t) => {
                        let pointx = t.pageX - this.canvas.offsetLeft;
                        let pointy = t.pageY - this.canvas.offsetTop;
                        SelectStart(pointx, pointy);
                    });
                };

                let onTouchEnd = (e: TouchEvent): void => {
                    _.forEach(e.changedTouches, (t) => {
                        let pointx = t.pageX - this.canvas.offsetLeft;
                        let pointy = t.pageY - this.canvas.offsetTop;
                        SelectEnd(pointx, pointy);
                    });
                };

                let onTouchMove = (e: TouchEvent): void => {
                    _.forEach(e.changedTouches, (t) => {

                        let pointx = t.pageX - this.canvas.offsetLeft;
                        let pointy = t.pageY - this.canvas.offsetTop;

                        this.Draw(() => {
                            switch (this.Mode) {
                                case Mode.move:
                                    this.LassoSelect(pointx, pointy);
                                    this.shapes.Selected().forEach((shape: BaseShape) => {
                                        if (!shape.IsLocked()) {
                                            switch (shape.Transform()) {
                                                case Transform.deformation:

                                                    shape.Deformation(new ShapeEdit.Location(pointx - shape.prevlocation.x, pointy - shape.prevlocation.y));
                                                    shape.prevlocation.x = pointx;
                                                    shape.prevlocation.y = pointy;
                                                    break;
                                                case Transform.resize:
                                                    let magnifyw = (pointx - shape.rectangle.location.x) / (shape.rectangle.bottomright.x - shape.rectangle.location.x);
                                                    let magnifyh = (pointy - shape.rectangle.location.y) / (shape.rectangle.bottomright.y - shape.rectangle.location.y);
                                                    if ((magnifyw > 0) && (magnifyh > 0)) {
                                                        shape.Resize(shape.rectangle.location, new Size(magnifyw, magnifyh));
                                                    }
                                                    break;
                                                case Transform.rotate:
                                                    if (shape.IsRotable()) {
                                                        let context: any = this.context;
                                                        try {
                                                            context.save();
                                                            context.beginPath();
                                                            context.moveTo(shape.center.x, shape.center.y);
                                                            context.lineTo(pointx, pointy);
                                                            context.strokeStyle = guidelinecolor.Lighten(50).RGB();
                                                            context.lineWidth = 1;
                                                            context.stroke();
                                                        } finally {
                                                            context.restore();
                                                        }

                                                        let current = null;
                                                        if (this.modifier === Key.shift) {
                                                            current = BaseShape.Degree(shape.center, new ShapeEdit.Location(pointx, pointy));
                                                        } else {
                                                            current = Math.round(Math.round(Math.round(BaseShape.Degree(shape.center, new ShapeEdit.Location(pointx, pointy))) / 15) * 15);
                                                        }
                                                        shape.Rotate(shape.center, current - shape.degree);
                                                        shape.degree = current;
                                                    }
                                                    break;
                                                default:
                                                    if (shape.IsCapture()) {
                                                        shape.MoveTo(new ShapeEdit.Location(pointx - shape.prevlocation.x, pointy - shape.prevlocation.y));
                                                        shape.prevlocation.x = pointx;
                                                        shape.prevlocation.y = pointy;
                                                        this.DrawGrid(shape);
                                                    }
                                                    break;
                                            }
                                        }
                                    });

                                    break;
                                case Mode.draw:
                                    if (this.newshape) {
                                        DrawPolygon(pointx, pointy);
                                    }
                                    break;
                                case Mode.bezierdraw://c1 //move
                                    if (this.newshape) {
                                        if (this.newcurve) {
                                            if (this.isdrag) {
                                                this.newcurve.controlPoint1.x = pointx - this.newcurve.x;
                                                this.newcurve.controlPoint1.y = pointy - this.newcurve.y;
                                                this.newcurve.controlPoint0.x = pointx;
                                                this.newcurve.controlPoint0.y = pointy;
                                                DrawBezier(this.newcurve.x, this.newcurve.y, this.newcurve.controlPoint0, this.newcurve.controlPoint1);
                                            } else {
                                                this.newcurve.x = pointx;
                                                this.newcurve.y = pointy;
                                                this.newcurve.controlPoint0.x = pointx;
                                                this.newcurve.controlPoint0.y = pointy;
                                                this.newcurve.controlPoint1.x = pointx;
                                                this.newcurve.controlPoint1.y = pointy;

                                                DrawBezier(this.newcurve.x, this.newcurve.y, this.newcurve.controlPoint0, this.newcurve.controlPoint1);
                                                //     DrawBezier(this.newcurve.x, this.newcurve.y, this.newcurve.controlPoint0, lastcurve.controlPoint1);
                                                this.newshape.DrawAllHandle();
                                            }
                                        }
                                    }
                                    break;
                            }
                        });
                    });
                };

                /////// todo

                this.canvas.addEventListener("dragover", (e: any) => {// cancel default behavior
                    if (e.preventDefault) {
                        e.preventDefault();
                    }
                    return false;
                }, false);

                this.canvas.addEventListener("dragenter", (e: any) => {// cancel default behavior
                    if (e.preventDefault) {
                        e.preventDefault();
                    }
                    return false;
                }, false);

                this.canvas.addEventListener("drop", (e: any) => {
                    this.handlers.Exec('drop', null, e);
                    if (e.preventDefault) {
                        e.preventDefault();
                    }
                    return false;
                }, false);

                this.canvas.addEventListener("click", (e) => {
                    this.handlers.Exec('click', this.shapes, e);
                }, false);

                this.canvas.addEventListener("dblclick", () => {
                }, false);

                this.canvas.addEventListener("contextmenu", onContextMenu, false);

                this.canvas.addEventListener("mouseout", () => {
                }, false);

                this.canvas.addEventListener("mouseover", () => {
                }, false);

                this.canvas.addEventListener("mousedown", onDown, false);

                this.canvas.addEventListener("mouseup", onUp, false);

                this.canvas.addEventListener("mousemove", onMove, false);

                if (!server) {
                    if (window.TouchEvent) {
                        this.canvas.addEventListener("touchstart", onTouchStart, false); // touchstart – to toggle drawing mode “on”
                        this.canvas.addEventListener("touchend", onTouchEnd, false); // touchend – to toggle drawing mode “off”
                        this.canvas.addEventListener("touchmove", onTouchMove, false); // touchmove – to track finger position, used in drawing
                    }
                }

                this.canvas.addEventListener("DOMMouseScroll", () => {
                }, false);

                this.canvas.addEventListener("mousewheel", () => {
                }, false);

            } else {

                this.canvas.addEventListener("click", (e) => {
                    this.handlers.Exec('click', this.shapes, e);
                }, false);

                this.canvas.addEventListener("mousedown", (e: MouseEvent): void => {

                }, false);

                this.canvas.addEventListener("mouseup", (e: MouseEvent): void => {

                }, false);

                this.canvas.addEventListener("mousemove", (e: MouseEvent): void => {

                }, false);

                if (!server) {
                    if (window.TouchEvent) {
                        this.canvas.addEventListener("touchstart", (e: MouseEvent): void => {
                            this.shapes.HitShapes(new ShapeEdit.Location(e.offsetX, e.offsetY), (hitshape: BaseShape): void => {//クリックされたShapeについて
                                this.handlers.Exec('click', hitshape, null);
                            });
                        }, false); // touchstart – to toggle drawing mode “on”

                        this.canvas.addEventListener("touchend", (e: MouseEvent): void => {
                            this.shapes.HitShapes(new ShapeEdit.Location(e.offsetX, e.offsetY), (hitshape: BaseShape): void => {//クリックされたShapeについて
                                this.handlers.Exec('click', hitshape, null);
                            });

                        }, false); // touchend – to toggle drawing mode “off”

                        this.canvas.addEventListener("touchmove", (e: MouseEvent): void => {
                            this.shapes.HitShapes(new ShapeEdit.Location(e.offsetX, e.offsetY), (hitshape: BaseShape): void => {//クリックされたShapeについて
                                this.handlers.Exec('click', hitshape, null);
                            });

                        }, false); // touchmove – to track finger position, used in drawing
                    }
                }

            }

            if (!server) {
                let devicePixelRatio: any = window.devicePixelRatio || 1;
                let backingStorePixelRatio: number = this.context.webkitBackingStorePixelRatio
                    || this.context.mozBackingStorePixelRatio
                    || this.context.msBackingStorePixelRatio
                    || this.context.oBackingStorePixelRatio
                    || this.context.backingStorePixelRatio
                    || 1;

                this.pixelRatio = 1;// devicePixelRatio / backingStorePixelRatio;

                let requestAnimationFrame = window.requestAnimationFrame ||
                    window.mozRequestAnimationFrame ||
                    window.webkitRequestAnimationFrame ||
                    window.msRequestAnimationFrame;
                window.requestAnimationFrame = requestAnimationFrame;
            }

            this.shapes = new Shapes(this, {});
            this.shapes.SetParent(null);
        }

        public Free():void {
            super.Free();
        }

        private BeginSelect(x: number, y: number) {
            this.selectrect = new ShapeEdit.Rectangle(x, y, 0, 0);
        }

        private LassoSelect(x: number, y: number):void {
            if (this.selectrect) {
                this.selectrect.size._w = x - this.selectrect.location.x;
                this.selectrect.size._h = y - this.selectrect.location.y;

                // todo: リファクタ
                let context: any = this.context;
                try {
                    context.save();
                    context.beginPath();
                    context.rect(this.selectrect.location.x, this.selectrect.location.y, this.selectrect.size._w, this.selectrect.size._h);
                    context.strokeStyle = guidelinecolor.RGB();
                    context.lineWidth = 1;
                    context.stroke();
                } finally {
                    context.restore();
                }
                this.shapes.Shapes().forEach((shape: BaseShape):void => {
                    if (!shape.IsLocked()) {
                        if (shape.Intersection(this.selectrect)) {
                            shape.Select();
                        } else {
                            shape.Deselect();
                        }
                    }
                });
            }
        }

        private EndSelect():void {
            this.selectrect = null;
        }

        private ClosePath():void {
            this.handlers.Exec('new', this.newshape, null);
            this.Add(this.newshape);
            this.newshape = null;
            this.newcurve = null;
        }

        private DrawGrid(selected_shape: BaseShape): void {
            this.shapes.Each((compareshape: BaseShape): void => {
                if (selected_shape != compareshape) {
                    let lines: number[][] = selected_shape.Equals(compareshape);
                    _.forEach<number>(lines[0], (line) => {
                        if (line != 0) {
                            this.VLine(line);
                        }
                    });
                    _.forEach<number>(lines[1], (line) => {
                        if (line != 0) {
                            this.HLine(line);
                        }
                    });
                }
            });
        }

        private HLine(y: number): void {
            try {
                this.context.save();
                this.context.beginPath();
                this.context.moveTo(0, y);
                this.context.lineTo(this.canvas.width, y);
                this.context.strokeStyle = guidelinecolor.RGBA();
                this.context.lineWidth = 1;
                this.context.stroke();
            } finally {
                this.context.restore();
            }
        }

        private VLine(x: number): void {
            try {
                this.context.save();
                this.context.beginPath();
                this.context.moveTo(x, 0);
                this.context.lineTo(x, this.canvas.height);
                this.context.strokeStyle = guidelinecolor.RGBA();
                this.context.lineWidth = 1;
                this.context.stroke();
            } finally {
                this.context.restore();
            }
        }

        private SetCursor(handle_location: number): void {
            switch (handle_location) {
                case 1:
                    this.canvas.style.cursor = "nw-resize";//   左上リサイズ
                    break;
                case 2:
                    this.canvas.style.cursor = "n-resize";//		上リサイズ
                    break;
                case 3:
                    this.canvas.style.cursor = "ne-resize";//		右上リサイズ
                    break;
                case 4:
                    this.canvas.style.cursor = "e-resize";//		右リサイズ
                    break;
                case 5:
                    this.canvas.style.cursor = "se-resize";//		右下リサイズ
                    break;
                case 6:
                    this.canvas.style.cursor = "s-resize";//		下リサイズ
                    break;
                case 7:
                    this.canvas.style.cursor = "sw-resize";//	左下リサイズ
                    break;
                case 8:
                    this.canvas.style.cursor = "w-resize";//		左リサイズ
                    break;
                default:
                    break;
            }
        }

        private Exception(e): void {

        }

        private ClearSelected(): void {
            this.shapes.ClearSelected();
        }

        public SetMode(mode: Mode): void {
            try {
                if (mode != Mode.draw) {
                    if (this.newshape) {
                        this.ClosePath();
                    }
                }
                this.ClearSelected();
                this.mode = mode;
            } catch (e) {
                this.Exception(e);
            }
        }

        public ToTop(): void {
            try {
                this.Draw(() => {
                    this.shapes.ToTop();
                });
            } catch (e) {
                this.Exception(e);
            }
        }

        public ToBottom(): void {
            try {
                this.Draw(() => {
                    this.shapes.ToBottom();
                });
            } catch (e) {
                this.Exception(e);
            }
        }

        public Selected(): BaseShape[] {
            return this.shapes.Selected();
        }

        public Add(shape: BaseShape): void {
            try {
                this.Draw(() => {
                    this.shapes.Add(shape);
                    shape.ResizeRectangle(); //外接四角形のリサイズ
                });
                this.handlers.Exec('new', shape, null);
                this.handlers.Exec('change', shape, null);
            } catch (e) {
                this.Exception(e);
            }
        }

        public DeleteSelected(): void {
            try {
                this.Draw(() => {
                    if (this.Selected().length > 0) {
                        this.shapes.Pull((shape) => {
                            this.handlers.Exec('delete', shape, null);
                        });
                    }
                });
            } catch (e) {
                this.Exception(e);
            }
        }

        public Lock(): void {
            try {
                this.Draw(() => {
                    this.Selected().forEach((shape: BaseShape) => {
                        shape.Lock();
                    });
                });
            } catch (e) {
                this.Exception(e);
            }
        }

        public UnLockAll(): void {
            try {
                this.shapes.UnLock();
            } catch (e) {
                this.Exception(e);
            }
        }

        public Group(): void {
            try {
                this.Draw(() => {
                    if (this.Selected().length > 1) { // grouping?
                        let subgroup: Shapes = new Shapes(this, {});
                        this.shapes.Add(subgroup);// add subgroup root
                        this.Selected().forEach((shape: BaseShape) => {
                            subgroup.Release();
                            subgroup.Add(shape);// add to subgroup
                        });
                        subgroup.Shapes().forEach((shape: BaseShape) => {
                            this.shapes.Remove(shape); //remove subgrouped member
                        });

                        this.handlers.Exec('new', subgroup, null);
                        subgroup.Select();
                    }
                });
            } catch (e) {
                this.Exception(e);
            }
        }

        public Ungroup(): void {
            try {
                this.Draw(() => {
                    this.Selected().forEach((shape: BaseShape) => {
                        shape.Ungroup();// move group member to parent
                        if (shape.type === "Shapes") {
                            if (shape.Shapes().length === 0) {
                                this.handlers.Exec('delete', shape, null);
                                this.shapes.Remove(shape); // remove group root;
                            }
                        }
                    });
                });
            } catch (e) {
                this.Exception(e);
            }
        }

        public Copy(): void {
            try {
                this.Draw(() => {
                    _.forEach(this.Selected(), (shape: BaseShape) => {
                        this.copybuffer = shape.Clone();
                    });
                });
            } catch (e) {
                this.Exception(e);
            }
        }

        public Paste(): void {
            try {
                this.Draw(() => {
                    if (this.copybuffer) {
                        this.Add(this.copybuffer.Clone());
                        this.handlers.Exec('change', this.copybuffer, null);
                        this.copybuffer = null;
                    }
                });
            } catch (e) {
                this.Exception(e);
            }
        }

        public onKeyDown(e: KeyboardEvent): void {
            if (e.altKey) {
                switch (e.keyCode) {
                    case 67:
                        this.Copy();
                        break;
                    case 86:
                        this.Paste();
                        break;
                    case 71:    // group
                        this.Group();
                        break;
                    default:
                }
            } else {
                this.modifier = Key.normal;
                if (e.shiftKey) {
                    this.modifier = Key.shift;
                }

                this.Draw(() => {
                    switch (this.Mode) {
                        case Mode.move:
                            if (this.shapes.Selected().length > 0) {
                                this.shapes.Selected().forEach((shape: BaseShape) => {
                                    if (!shape.IsLocked()) {
                                        this.handlers.Exec('keydown', shape, e);
                                        this.DrawGrid(shape);
                                        if (this.modifier) {
                                            switch (e.key) {
                                                case "ArrowDown":
                                                    shape.MoveTo(new ShapeEdit.Location(0, ShapeEdit.gridsize));
                                                    e.returnValue = false;
                                                    break;
                                                case "ArrowUp":
                                                    shape.MoveTo(new ShapeEdit.Location(0, -ShapeEdit.gridsize));
                                                    e.returnValue = false;
                                                    break;
                                                case "ArrowRight":
                                                    shape.MoveTo(new ShapeEdit.Location(ShapeEdit.gridsize, 0));
                                                    e.returnValue = false;
                                                    break;
                                                case "ArrowLeft":
                                                    shape.MoveTo(new ShapeEdit.Location(-ShapeEdit.gridsize, 0));
                                                    e.returnValue = false;
                                                    break;
                                                default:
                                            }
                                        }
                                    }
                                });
                            } else {
                                this.handlers.Exec('keydown', null, e);
                            }
                            break;
                        case Mode.draw:
                            break;
                        case Mode.bezierdraw:
                            break;
                    }
                });
            }
        };

        public onKeyUp(e: KeyboardEvent): void {
            this.modifier = Key.normal;
            this.Draw(() => {
                this.shapes.Selected().forEach((shape: BaseShape) => {
                    this.handlers.Exec('keyup', shape, e);
                });
            })
        };

        public SetCurrentLocation(new_location: Location): void {
            try {
                this.Draw(() => {
                    this.Selected().forEach((shape: BaseShape) => {
                        let current_location = shape.Location();
                        current_location.x = new_location.x;
                        current_location.y = new_location.y;
                        shape.ResizeRectangle();
                    });
                });
            } catch (e) {
                this.Exception(e);
            }
        }

        public CurrentLocation(): Location {
            let result: Location;
            if (this.Selected().length > 0) {
                result = this.Selected()[0].Location();
            }
            return result;
        }

        public SetCurrentSize(new_size: Size): void {
            try {
                this.Draw(() => {
                    this.Selected().forEach((shape: BaseShape) => {
                        let current_size = shape.Size();
                        current_size.w = new_size.w;
                        current_size.h = new_size.h;
                        shape.ResizeRectangle();
                    });
                });
            } catch (e) {
                this.Exception(e);
            }
        }

        public CurrentSize(): Size {
            let result: Size;
            if (this.Selected().length > 0) {
                result = this.Selected()[0].Size();
            }
            return result;
        }

        public SetCurrentFillColor(color: Style): void {
            try {
                this.Draw(() => {
                    this.Selected().forEach((shape: BaseShape) => {
                        shape.SetFillColor(color);
                    });
                });
            } catch (e) {
                this.Exception(e);
            }
        }

        public CurrentFillColor(): Style {
            let result: Style = new RGBAColor(0, 0, 0, 1);
            if (this.Selected().length > 0) {
                result = this.Selected()[0].FillColor();
            }
            return result;
        }

        public SetCurrentStrokeColor(color: Style): void {
            try {
                this.Draw(() => {
                    this.Selected().forEach((shape: BaseShape) => {
                        shape.SetStrokeColor(color);
                    });
                });
            } catch (e) {
                this.Exception(e);
            }
        }

        public CurrentStrokeColor(): Style {
            let result: Style = new RGBAColor(0, 0, 0, 1);
            if (this.Selected().length > 0) {
                result = this.Selected()[0].StrokeColor();
            }
            return result;
        }

        public SetCurrentStrokeWidth(width: number): void {
            try {
                this.Draw(() => {
                    this.Selected().forEach((shape: BaseShape) => {
                        shape.SetStrokeWidth(width);
                    });
                });
            } catch (e) {
                this.Exception(e);
            }
        }

        public CurrentStrokeWidth(): number {
            let result: number = 0;
            if (this.Selected().length > 0) {
                result = this.Selected()[0].StrokeWidth();
            }
            return result;
        }

        public SetCurrentFontStyle(style: string): void {
            try {
                this.Draw(() => {
                    this.Selected().forEach((shape: BaseShape) => {
                        shape.SetFontStyle(style);
                    });
                });
            } catch (e) {
                this.Exception(e);
            }
        }

        public CurrentFontStyle(): string {
            let result: string = "";
            if (this.Selected().length > 0) {
                result = this.Selected()[0].FontStyle();
            }
            return result;
        }

        public SetCurrentFontVariant(variant: string): void {
            try {
                this.Draw(() => {
                    this.Selected().forEach((shape: BaseShape) => {
                        shape.SetFontVariant(variant);
                    });
                });
            } catch (e) {
                this.Exception(e);
            }
        }

        public CurrentFontVariant(): string {
            let result: string = "";
            if (this.Selected().length > 0) {
                result = this.Selected()[0].FontVariant();
            }
            return result;
        }

        public SetCurrentFontWeight(weight: string): void {
            try {
                this.Draw(() => {
                    this.Selected().forEach((shape: BaseShape) => {
                        shape.SetFontWeight(weight);
                    });
                });
            } catch (e) {
                this.Exception(e);
            }
        }

        public CurrentFontWeight(): string {
            let result: string = "";
            if (this.Selected().length > 0) {
                result = this.Selected()[0].FontWeight();
            }
            return result;
        }

        public SetCurrentFontSize(size: number): void {
            try {
                this.Draw(() => {
                    this.Selected().forEach((shape: BaseShape) => {
                        shape.SetFontSize(size);
                    });
                });
            } catch (e) {
                this.Exception(e);
            }
        }

        public CurrentFontSize(): number {
            let result: number = 10;
            if (this.Selected().length > 0) {
                result = this.Selected()[0].FontSize();
            }
            return result;
        }

        public SetCurrentFontKeyword(keyword: string): void {
            try {
                this.Draw(() => {
                    this.Selected().forEach((shape: BaseShape) => {
                        shape.SetFontKeyword(keyword);
                    });
                });
            } catch (e) {
                this.Exception(e);
            }
        }

        public CurrentFontKeyword(): string {
            let result: string = "";
            if (this.Selected().length > 0) {
                result = this.Selected()[0].FontKeyword();
            }
            return result;
        }

        public SetCurrentFontFamily(family: string[]): void {
            try {
                this.Draw(() => {
                    this.Selected().forEach((shape: BaseShape) => {
                        shape.SetFontFamily(family);
                    });
                });
            } catch (e) {
                this.Exception(e);
            }
        }

        public CurrentFontFamily(): string[] {
            let result: string[] = [];
            if (this.Selected().length > 0) {
                result = this.Selected()[0].FontFamily();
            }
            return result;
        }

        public SetCurrentPath(path: string): void {
            try {
                this.Draw(() => {
                    this.Selected().forEach((shape: BaseShape) => {
                        shape.SetPath(path);
                    });
                });
            } catch (e) {
                this.Exception(e);
            }
        }

        public CurrentPath(): string {
            let result: string = "";
            if (this.Selected().length > 0) {
                result = this.Selected()[0].Path();
            }
            return result;
        }

        public SetCurrentAlign(align: string): void {
            try {
                this.Draw(() => {
                    this.Selected().forEach((shape: BaseShape) => {
                        shape.SetAlign(align);
                    });
                });
            } catch (e) {
                this.Exception(e);
            }
        }

        public CurrentAlign(): string {
            let result: string = "";
            if (this.Selected().length > 0) {
                result = this.Selected()[0].Align();
            }
            return result;
        }

        public SetCurrentText(text: string): void {
            try {
                this.Draw(() => {
                    this.Selected().forEach((shape: BaseShape) => {
                        shape.SetText(text);
                    });
                });
            } catch (e) {
                this.Exception(e);
            }
        }

        public CurrentText(): string {
            let result: string = "";
            if (this.Selected().length > 0) {
                result = this.Selected()[0].Text();
            }
            return result;
        }

        public CurrentType(): string {
            let result: string = "";
            if (this.Selected().length > 0) {
                result = this.Selected()[0].type;
            }
            return result;
        }

        public SetCurrentShapesAlign(align: number): void {
            try {
                this.Draw(() => {
                    switch (align) {
                        case 0:// align top
                        {
                            let rectangle: Rectangle = _.minBy(this.Selected(), 'rectangle.topleft.y').rectangle;
                            this.Selected().forEach((shape: BaseShape) => {
                                shape.MoveTo(new ShapeEdit.Location(0, rectangle.topleft.y - shape.rectangle.topleft.y));
                            });
                        }
                            break;
                        case 1: // align right
                        {
                            let rectangle: Rectangle = _.maxBy(this.Selected(), 'rectangle.topright.x').rectangle;
                            this.Selected().forEach((shape: BaseShape) => {
                                shape.MoveTo(new ShapeEdit.Location(rectangle.topright.x - shape.rectangle.topright.x, 0));
                            });
                        }
                            break;
                        case 2: // align bottom
                        {
                            let rectangle: Rectangle = _.maxBy(this.Selected(), 'rectangle.bottomright.y').rectangle;
                            this.Selected().forEach((shape: BaseShape) => {
                                shape.MoveTo(new ShapeEdit.Location(0, rectangle.bottomright.y - shape.rectangle.bottomright.y));
                            });
                        }
                            break;
                        case 3: // align left
                        {
                            let rectangle: Rectangle = _.minBy(this.Selected(), 'rectangle.bottomleft.x').rectangle;
                            this.Selected().forEach((shape: BaseShape) => {
                                shape.MoveTo(new ShapeEdit.Location(rectangle.bottomleft.x - shape.rectangle.bottomleft.x, 0));
                            });
                        }
                            break;
                        case 4: // contact top
                        {
                            let rectangle: Rectangle = _.minBy(this.Selected(), 'rectangle.bottomleft.y').rectangle;
                            this.Selected().forEach((shape: BaseShape) => {
                                if (rectangle != shape.rectangle) { // ignore self
                                    shape.MoveTo(new ShapeEdit.Location(0, rectangle.bottomleft.y - shape.rectangle.topleft.y));
                                }
                            });
                        }
                            break;
                        case 5: // contact left
                        {
                            let rectangle: Rectangle = _.minBy(this.Selected(), 'rectangle.bottomright.x').rectangle;
                            this.Selected().forEach((shape: BaseShape) => {
                                if (rectangle != shape.rectangle) { // ignore self
                                    shape.MoveTo(new ShapeEdit.Location(rectangle.bottomright.x - shape.rectangle.topleft.x, 0));
                                }
                            });
                        }
                            break;
                        case 6: // contact bottom
                        {
                            let rectangle: Rectangle = _.maxBy(this.Selected(), 'rectangle.topright.y').rectangle;
                            this.Selected().forEach((shape: BaseShape) => {
                                if (rectangle != shape.rectangle) { // ignore self
                                    shape.MoveTo(new ShapeEdit.Location(0, rectangle.topright.y - shape.rectangle.bottomleft.y));
                                }
                            });
                        }
                            break;
                        case 7: // contact right
                        {
                            let rectangle: Rectangle = _.maxBy(this.Selected(), 'rectangle.topleft.x').rectangle;
                            this.Selected().forEach((shape: BaseShape) => {
                                if (rectangle != shape.rectangle) { // ignore self
                                    shape.MoveTo(new ShapeEdit.Location(rectangle.topleft.x - shape.rectangle.topright.x, 0));
                                }
                            });
                        }
                            break;
                        /*     case 8: // size top
                         {
                         let rect:Rectangle = _.minBy(this.Selected(), 'rectangle.topleft.x').rectangle;
                         _.forEach<BaseShape>(this.Selected(), (shape:BaseShape) => {
                         if (rect != shape.rectangle) { // ignore self
                         shape.Resize(shape.rectangle.location, new Size(2 ,1));
                         }
                         });
                         }
                         break; */
                    }

                });
            } catch (e) {
                this.Exception(e);
            }
        }

        public DeselectAll(): void {
            this.Draw(() => {
                this.shapes.Deselect();
            });
        }

        public Clear(): void {
            try {
                this.Draw(() => {
                    this.shapes.Clear();
                });
            } catch (e) {
                this.Exception(e);
            }
        }

        public Snap(callback: () => void = null): void {
            this.context.fillStyle = '#ffffff';
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

            if (callback) {
                callback();
            }

            if (this.canvas.plugins) {
                this.plugins.Exec('draw', this.shapes, null);
            }

            if (this.shapes) {
                this.shapes.Draw();
            }

            if (this.newshape) {
                this.newshape.Draw();
            }
        }

        public Draw(callback: () => void = null): void {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

            if (callback) {
                callback();
            }

            if (this.canvas.plugins) {
                this.plugins.Exec('draw', this.shapes, null);
            }

            if (this.shapes) {
                this.shapes.Draw();
            }

            if (this.newshape) {
                this.newshape.Draw();
            }
        }

        public Tick(): void {
            this.shapes.Tick();
            this.Draw();
        }

        public Animate(): void {
            if (!server) {
                let loop = () => {
                    window.requestAnimationFrame(loop);
                    this.Tick();
                };
                loop();
            }
        }

        public Undo(): void {
            try {
                if (this.undoheap != null) {
                    this.Draw(() => {
                        this.shapes = this.undoheap;
                        this.undoheap = null;
                    });
                }
            } catch (e) {
                this.Exception(e);
            }
        }

        private SavePoint(): void {
            this.undoheap = null;
            this.undoheap = _.cloneDeep(this.shapes);
        }

        public IsUndoable(): boolean {
            return (this.undoheap != null);

            //   return (this.undobuffer.Count() > 0);
        }

        public IsPastable(): boolean {
            return (this.copybuffer != null);
        }

        public SelectedCount(): number {
            return this.shapes.Selected().length;
        }

        static Serialize(canvas: Canvas): string {
            let result = "";
            try {
                result = '{"type":"' + canvas.type + '", "shapes":' + canvas.shapes.Serialize() + ', "width":' + canvas.canvas.width + ', "height":' + canvas.canvas.height + '}';
            } catch (e) {
                let a = e;
            }
            return result;
        }

        public Resize(x, y): void {

        }

        public ToSVG(callback: (error: any) => void): void {
            this.adaptor.Canvas(this, callback);
        }

        public ToPDF(callback: (error: any) => void): void {
            this.adaptor.Canvas(this, callback);
        }

        static Load(canvas: Canvas, data: any, handlers: EventHandlers): Canvas {
            let result: Canvas = null;
            try {
                canvas.Clear();
                canvas.canvas.style.width = data.width + "px";
                canvas.canvas.style.height = data.height + "px";
                canvas.shapes = Shapes.Load(canvas, data.shapes);
                result = canvas;
            } catch (e) {

            }
            return result;
        }

        static Save(canvas: Canvas): any {
            let result = {};
            try {
                result = {
                    type: canvas.type,
                    shapes: canvas.shapes,
                    width: canvas.canvas.width,
                    height: canvas.canvas.height
                };
            } catch (e) {
                let a = e;
            }
            return result;
        }

    }
}

if (server) {
    module.exports = ShapeEdit;
}
