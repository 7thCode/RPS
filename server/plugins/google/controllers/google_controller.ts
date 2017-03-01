/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace GoogleModule {

    const _: _.LoDashStatic = require('lodash');

    const mongoose: any = require('mongoose');
    mongoose.Promise = require('q').Promise;

    const google: any = require('googleapis');
    const googleAuth: any = require('google-auth-library');

    const core = require(process.cwd() + '/core');
    const share: any = core.share;
    const config = share.config;
    const Wrapper = share.Wrapper;
    const logger = share.logger;

    export class Google {

        private auth: any;
        private oauth2Client: any;

        // plugins_config.google_api.
        constructor(calendar) {
            let clientSecret = calendar.client_secret;
            let clientId = calendar.client_id;
            let redirectUrl = calendar.redirect_uris[1];
            this.auth = new googleAuth();
            this.oauth2Client = new this.auth.OAuth2(clientId, clientSecret, redirectUrl);
        }

        // already auth
        public authorize(tokens: any, callback: (client: any, tokens: any) => void): void {
            if (tokens) {
                this.oauth2Client.credentials = tokens;
                callback(this.oauth2Client, tokens);
            } else {
                callback(null, null);   // not auth etc...
            }
        }

        // new auth step1
        public authorize_url(scopes: string[]): string {
            let authUrl: any = this.oauth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: scopes
            });
            return authUrl;
        }

        // new auth step2
        public authorize_callback(code: any, callback: (client: any, tokens: any) => void): void {
            this.oauth2Client.getToken(code, (error: any, tokens: any): void => {
                if (!error) {
                    this.oauth2Client.credentials = tokens;
                    callback(this.oauth2Client, tokens);
                } else {
                    callback(null, null);   // not auth etc...
                }
            });
        }

        // etc etc...
        public calendar(auth: any, callback: (error: any, result: string) => void): void {
            let result = "";
            let calendar: any = google.calendar({auth: auth, version: "v3"});

            calendar.events.list({
                calendarId: 'primary',
                timeMin: (new Date()).toISOString(),
                maxResults: 10,
                singleEvents: true,
                orderBy: 'startTime'
            }, (error: any, response: any): void => {

                if (!error) {
                    let events: any = response.items;

                    for (var i = 0; i < events.length; i++) {
                        let event: any = events[i];
                        let start: any = event.start.dateTime || event.start.date;
                        result += start + "-" + event.summary;
                    }
                    callback(null, result);
                } else {
                    callback(error, null);
                }

            });
        }

        // etc etc...
        public insert_calendar(auth: any, callback: (error: any, result: string) => void): void {

            let event = {
                'summary': 'Google I/O 2015',
                'location': '800 Howard St., San Francisco, CA 94103',
                'description': 'A chance to hear more about Google\'s developer products.',
                'start': {
                    'dateTime': '2017-05-28T09:00:00-07:00',
                    'timeZone': 'America/Los_Angeles'
                },
                'end': {
                    'dateTime': '2017-05-28T17:00:00-07:00',
                    'timeZone': 'America/Los_Angeles'
                },
                'recurrence': [
                    'RRULE:FREQ=DAILY;COUNT=2'
                ],
                'attendees': [
                    {'email': 'lpage@example.com'},
                    {'email': 'sbrin@example.com'}
                ],
                'reminders': {
                    'useDefault': false,
                    'overrides': [
                        {'method': 'email', 'minutes': 24 * 60},
                        {'method': 'popup', 'minutes': 10}
                    ]
                },
            };

            let calendar: any = google.calendar({auth: auth, version: "v3"});

            calendar.events.insert({
                calendarId: 'primary',
                resource: event,
            }, (error: any, response: any): void => {

                if (!error) {
                    callback(null, response.htmlLink);
                } else {
                    callback(error, null);
                }

            });
        }

        // etc etc...
        public analytics(auth: any, callback: (error: any, result: string) => void): void {
            let result = "";
            let analytics = google.analytics({auth: auth, version: "v3"});

            analytics.data.ga.get({
                ids: "ga:" + "76780519",
                "start-date": "30daysAgo",
                "end-date": "yesterday",
                metrics: "ga:users,ga:percentNewSessions,ga:bounceRate",
                dimensions: "ga:userType"
            }, (error, rows): void => {

                if (!error) {
                    callback(null, rows);
                } else {
                    callback(error, null);
                }

            });
        }
    }
}

module.exports = GoogleModule;
