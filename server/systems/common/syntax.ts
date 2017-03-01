/**!
 Copyright (c) 2016 7thCode.
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export module Syntax {

    const _:_.LoDashStatic = require("lodash");

    export class Mecab {

        private mecab:any;

        constractor() {
            let MeCab = require('mecab-async');
            this.mecab = new MeCab();
        }

        public Parse(findtext, callback:(queries) => void):void {
            this.mecab.parse(findtext, (error:any, elements:any):any => {
                if (!error) {
                    let queries:any = [{type: 100}];
                    _.forEach(elements, (element) => {

                        let 表層形 = element[0];
                        let 品詞 = element[1];
                        let 品詞細分類1 = element[2];
                        let 品詞細分類2 = element[3];
                        let 品詞細分類3 = element[4];
                        let 活用形 = element[5];
                        let 活用型 = element[6];
                        let 原形 = element[7];
                        let 読み = element[8];
                        let 発音 = element[9];

                    });
                    callback(queries);
                }
            });
        }
    }
}

module.exports = Syntax;
