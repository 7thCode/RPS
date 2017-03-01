/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

var server = (typeof window === 'undefined');

namespace Server {

    export class Context {

        public webkitBackingStorePixelRatio: number;
        public mozBackingStorePixelRatio: number;
        public msBackingStorePixelRatio: number;
        public oBackingStorePixelRatio: number;
        public backingStorePixelRatio: number;
        public fillStyle: string;
        public strokeStyle: string;
        public lineWidth: number;

        constructor() {
            this.webkitBackingStorePixelRatio = 1;
            this.mozBackingStorePixelRatio = 1;
            this.msBackingStorePixelRatio = 1;
            this.oBackingStorePixelRatio = 1;
            this.backingStorePixelRatio = 1;
        }

        public scale(a: number, b: number): void {

        }

        public clearRect(x: number, y: number, width: number, height: number): void {

        }

        public beginPath(): void {

        }

        public stroke(): void {

        }

        public rect(x: number, y: number, w: number, h: number): void {

        }

        public ellipse(cx: number, cy: number, rx: number, ry: number, a: number, b: number, c: number, d: boolean): void {

        }

        public drawImage(image: any, x: number, y: number, w: number, h: number): void {

        }

        public fill(): void {

        }

        public save(): void {

        }

        public restore(): void {

        }

        public measureText(s: string): any {
            return {width: 10};
        }

        public fillText(Line: string, x: number, y: number) {

        }

        public moveTo(x: number, y: number) {

        }

        public lineTo(x: number, y: number) {

        }
    }

    export class Style {
        public cursor: string;

        constructor() {

        }
    }

    export class StubCanvas {

        public context: Context;
        public style: Style;
        public width: number;
        public height: number;
        public webcodePixelRatio: number;

        constructor(width: number, height: number) {
            this.context = new Context();
            this.style = new Style();
            this.width = width;
            this.height = height;
        }

        public getContext(name: string): Context {
            return this.context;
        }

        public addEventListener(name: string, callback: (event) => boolean, boolean): void {

        }

        public focus(): void {

        }

    }

}

if (server) {
    module.exports = Server;
}