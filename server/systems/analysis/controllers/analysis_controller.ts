/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace AnalysisModule {

    const _ = require("lodash");

    const share = require(process.cwd() + '/server/systems/common/share');
    const config = share.config;
    const Wrapper = share.Wrapper;
    const Memory = share.Memory;
  //  const logger = share.logger;

    const QueueModel: any = require(share.Models("systems/queues/queue"));

    export class Analysis {

        constructor() {
        }

        static process_queue(queue, callback:(error) => void) {

            let promises = [];
            let write = (data: any): any => {
                return (): any => {
                    return new Promise((resolve: any, reject: any): void => {
                        let element: any = new QueueModel();
                        element.content = data;
                        element.save((error) => {
                            if (!error) {
                                resolve(null);
                            } else {
                                reject(error);
                            }
                        });
                    });
                };
            };

            _.forEach(queue, (data:any):void => {
                promises.push(write(data));
            });

            promises.reduce((prev:any, current:any): any => {
                return prev.then(current);
            }, Promise.resolve()).then(() => {
                callback(null);
            }).catch((error) => {
                callback(error);
            });
        }

        /**
         * @param data
         * @returns none
         */
        public event(data: any): void {
            Memory.push(data);
            if (Memory.length > config.analysis.count) {
                Analysis.process_queue(Memory, ():void => {
                    Memory.splice(0, Memory.length);
                })
            }
        }

        /**
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        public page_view(request: any, response: any, next: any): void {

            let data = {
                type:"pv",
                time: new Date(),
                address: request.connection.remoteAddress,
                headers: request.headers['user-agent'],
                referer: request.headers.referer
            };

            Memory.push(data);
            if (Memory.length > config.analysis.count) {
                Analysis.process_queue(Memory, ():void => {
                    Memory.splice(0, Memory.length);
                })
            }

            next();
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public get_queue(request: any, response: any): void {
            const number: number = 1300;
            let id = request.params.id;
            Wrapper.FindOne(response, number, QueueModel, {_id: id}, (response: any, page: any): void => {
                if (page) {
                    Wrapper.SendSuccess(response, page);
                } else {
                    Wrapper.SendWarn(response, 2, "not found", {});
                }
            });
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public get_queue_query(request: any, response: any): void {
            const number: number = 1400;
            let query: any = JSON.parse(decodeURIComponent(request.params.query));
            let option: any = JSON.parse(decodeURIComponent(request.params.option));
            Wrapper.Find(response, number, QueueModel,  query, {}, option, (response: any, pages: any): any => {
                Wrapper.SendSuccess(response, pages);
            });
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public get_queue_count(request: any, response: any): void {
            const number: number = 2800;
            let query: any = JSON.parse(decodeURIComponent(request.params.query));
            Wrapper.Count(response, number, QueueModel, query, (response: any, count: any): any => {
                Wrapper.SendSuccess(response, count);
            });
        }

    }
}

module.exports = AnalysisModule;