/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

let FormsProviders: angular.IModule = angular.module('FormsProviders', []);

FormsProviders.provider('HtmlEdit', [function():void {

    this.$get = ():any => {
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
