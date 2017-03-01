/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace Persistent {

    const fs = require('graceful-fs');

    export class Map {

        private filename: string;
        private map: {};

        constructor(filename: string) {
            this.filename = filename;
            this.map = {};
        }

        public Load(): void {
            try {
                let file = fs.openSync(this.filename, 'r');
                if (file) {
                    try {
                        this.map = JSON.parse(fs.readFileSync(this.filename, 'utf8'));
                    } finally {
                        fs.closeSync(file);
                    }
                } else {
                    this.Init();
                }
            } catch (e) {
            }

        }

        public Store(): void {
            try {
                let file = fs.openSync(this.filename, 'w');
                if (file) {
                    try {
                        fs.writeFile(this.filename, JSON.stringify(this.map));
                    } finally {
                        fs.closeSync(file);
                    }
                }
            } catch (e) {
            }
        }

        private Init(): void {
            this.map = {};
            this.Store();
        }

        public Set(key: string, value: string): void {
            this.map[key] = value;
        }

        public SetArrray(array): void {
            this.map = array;
        }

        public Get(key: string): string {
            return this.map[key];
        }
    }
}

module.exports = Persistent;