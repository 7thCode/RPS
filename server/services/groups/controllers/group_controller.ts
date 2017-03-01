/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace GroupModule {

    const fs = require('graceful-fs');

    const Validator = require('jsonschema').Validator;
    const validator = new Validator();

    const _ = require('lodash');

    const mongoose: any = require('mongoose');
    mongoose.Promise = require('q').Promise;

    const core = require(process.cwd() + '/core');
    const share: any = core.share;
    const config = share.config;
    const Wrapper = share.Wrapper;
    const logger = share.logger;

    const GroupModel: any = require(share.Models("services/groups/group"));

    let group_local_schema = {};
    fs.open(share.Models('applications/groups/schema.json'), 'ax+', 384, (error, fd) => {
        if (!error) {
            fs.close(fd, () => {
                 group_local_schema = JSON.parse(fs.readFileSync(share.Models('applications/groups/schema.json'), 'utf-8'));
            });
        }
    });

    let definition = {group_content: {}};
    fs.open(share.Models('applications/groups/definition.json'), 'ax+', 384, (error, fd) => {
        if (!error) {
            fs.close(fd, () => {
                 definition = JSON.parse(fs.readFileSync(share.Models('applications/groups/definition.json'), 'utf-8'));
            });
        }
    });


    export class Group {

        /**
         * @param request
         * @returns userid
         */
        static userid(request): string {
            return request.user.userid;
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public own_group(request: any, response: any): void {
            const number: number = 1000;
            let userid = Group.userid(request);
            let name = request.body.name;
            Wrapper.FindOne(response, number, GroupModel, {$and: [{name: name}, {userid: userid}]}, (response: any, group: any): void => {
                if (!group) {
                    let group: any = new GroupModel();
                    group.userid = userid;
                    group.name = name;
                    group.content = request.body.content;
                    group.open = true;
                    Wrapper.Save(response, number, group, (response: any, object: any): void => {
                        Wrapper.SendSuccess(response, object);
                    });
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
        public create_group(request: any, response: any): void {
            const number: number = 1000;
            let objectid: any = new mongoose.Types.ObjectId; // Create new id
            let userid: string = objectid.toString();
            let name = request.body.name;
            Wrapper.FindOne(response, number, GroupModel, {$and: [{name: name}, {userid: userid}]}, (response: any, group: any): void => {
                if (!group) {
                    let group: any = new GroupModel();
                    group.userid = userid;
                    group.name = name;
                    group.content = request.body.content;
                    group.open = true;
                    Wrapper.Save(response, number, group, (response: any, object: any): void => {
                        Wrapper.SendSuccess(response, object);
                    });
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
        public put_group(request: any, response: any): void {
            const number: number = 1100;
            let userid = Group.userid(request);
            let id = request.params.id;
            Wrapper.FindOne(response, number, GroupModel, {$and: [{_id: id}, {userid: userid}]}, (response: any, group: any): void => {
                if (group) {
                    let validate_result = validator.validate(request.body.local, group_local_schema);
                    if (validate_result.errors.length === 0) {
                        group.content = request.body.content;
                        group.open = true;
                        Wrapper.Save(response, number, group, (response: any, object: any): void => {
                            Wrapper.SendSuccess(response, object);
                        });
                    } else {
                        Wrapper.SendError(response, 3, "not valid", validate_result);
                    }
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
        public delete_group(request: any, response: any): void {
            const number: number = 1200;
            let userid = Group.userid(request);
            let id = request.params.id;
            Wrapper.FindOne(response, number, GroupModel, {$and: [{_id: id}, {userid: userid}]}, (response: any, group: any): void => {
                if (group) {
                    Wrapper.Remove(response, number, group, (response: any): void => {
                        Wrapper.SendSuccess(response, {});
                    });
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
        public delete_own(request: any, response: any): void {
            const number: number = 1300;
            let userid = Group.userid(request);
            Wrapper.Delete(response, number, GroupModel, {userid: userid}, (response: any): void => {
                Wrapper.SendSuccess(response, {});
            });
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public get_group(request: any, response: any): void {
            const number: number = 1400;
            //let userid = Group.userid(request);
            let id = request.params.id;
            Wrapper.FindOne(response, number, GroupModel, {_id: id}, (response: any, group: any): void => {
                if (group) {
                    Wrapper.SendSuccess(response, group);
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
        public get_group_query_query(request: any, response: any): void {
            let userid = Group.userid(request);
            //let self: any = request.user;
            let query: any = JSON.parse(decodeURIComponent(request.params.query));
            let option: any = JSON.parse(decodeURIComponent(request.params.option));
            Wrapper.Find(response, 1500, GroupModel, {$and: [{userid: userid}, query]}, {}, option, (response: any, groups: any): any => {
                Wrapper.SendSuccess(response, groups);
            });
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public get_group_count(request: any, response: any): void {
            let userid = Group.userid(request);
            let query: any = JSON.parse(decodeURIComponent(request.params.query));
            Wrapper.Count(response, 2800, GroupModel, {$and: [{userid: userid}, query]}, (response: any, count: any): any => {
                Wrapper.SendSuccess(response, count);
            });
        }

    }
}

module.exports = GroupModule;
