/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace InterceptorModule {

    const _ = require("lodash");
    //const jsdom = require("node-jsdom");

   // const Persistent: any = require("./persistent");
   /// const map = new Persistent.Map('./config/persistent/storege.json');

    const share = require(process.cwd() + '/server/systems/common/share');

    const AnalysisModule: any = require(share.Server("systems/analysis/controllers/analysis_controller"));
    const analysis: any = new AnalysisModule.Analysis;

   // map.Load();

    export const Handler = (request: any, response: any): any => {
        return {
            isInterceptable: (): boolean => {
                let result: boolean = false;
                let type: string = response.get('Content-Type');
                if (type) {
                    result = /text\/html/.test(type);
                }
                return result;
            },
            intercept: (html: string, send: any): void => {
                analysis.page_view(request, response);
            }
        };
    };
}

module.exports = InterceptorModule;