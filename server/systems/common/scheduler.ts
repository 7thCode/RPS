/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace SchedulerModule {

    let schedule = require("node-schedule");

    export class Scheduler {

        private Scheduled_jobs: any;

        constructor() {
            this.Scheduled_jobs = [];
        }

        public Add(timing, callback: () => void) {
            this.Scheduled_jobs.push(schedule.scheduleJob(timing, callback));
        }
    }
}

module.exports = SchedulerModule;