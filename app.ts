/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

'use strict';

const fs: any = require('graceful-fs');
const path: any = require('path');
const express: any = require('express');

let config_seed = null;
let config_seed_file = fs.openSync(process.cwd() + "/config/systems/config.json", 'r');
if (config_seed_file) {
    try {
        config_seed = JSON.parse(fs.readFileSync(process.cwd() + "/config/systems/config.json", 'utf8'));
    } finally {
        fs.closeSync(config_seed_file);
    }
}

if (config_seed) {
    if (config_seed.installed) {

        const morgan = require('morgan');
        morgan.format("original", "[:date] :method :url :status :response-time ms");

        const compression = require('compression');

        const Q: any = require('q');
        const _ = require("lodash");

        const mongoose: any = require("mongoose");
        mongoose.Promise = Q.Promise;

        const favicon = require('serve-favicon');

        const cookieParser = require('cookie-parser');
        const bodyParser = require('body-parser');

        //passport
        const passport = require('passport');
        const LocalStrategy = require('passport-local').Strategy;
        const FacebookStrategy: any = require('passport-facebook').Strategy;
        const TwitterStrategy: any = require('passport-twitter').Strategy;
        const InstagramStrategy: any = require('passport-instagram').Strategy;
        //const GooglePlusStrategy: any = require('passport-google-plus');

        const app = express();

        const helmet = require('helmet');
        app.use(helmet());
        app.use(helmet.hidePoweredBy({setTo: 'JSF/1.2'})); // Impersonation

        app.use(compression());

        //passport
        const session = require('express-session');

        // view engine setup
        app.set('views', path.join(__dirname, 'views'));
        app.set('view engine', 'pug');

        app.use(bodyParser.json({limit: '50mb'}));
        app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
        app.use(cookieParser());

        const core = require(process.cwd() + '/core');
        const share: any = core.share;
        const config = share.config;
        const Cipher = share.Cipher;

        const services_config = share.services_config;
        const plugins_config = share.plugins_config;
        const applications_config = share.applications_config;

        const logger = share.logger;

        const interceptor = require('express-interceptor');

        app.use(express.static(path.join(__dirname, 'public')));

        let definition = {account_content: {}};
        fs.open(share.Models('applications/accounts/definition.json'), 'ax+', 384, (error, fd) => {
            if (!error) {
                fs.close(fd, (error) => {
                    definition = JSON.parse(fs.readFileSync(share.Models('applications/accounts/definition.json'), 'utf-8'));
                });
            }
        });

        const MongoStore = require('connect-mongo')(session);

        const options = {server: {socketOptions: {connectTimeoutMS: 1000000}}};

        if (config.db.user) {
            mongoose.connect("mongodb://" + config.db.user + ":" + config.db.password + "@" + config.db.address + "/" + config.db.name, options);
        } else {
            mongoose.connect("mongodb://" + config.db.address + "/" + config.db.name, options);
        }

        process.on('uncaughtException', (error: any): void => {
            console.log(error);
            logger.error('Stop.   ' + error);
        });

        process.on('exit', (code: number): void => {
            logger.info('Stop.   ' + code);
        });

        app.use(session({
            name: config.sessionname,
            secret: config.sessionsecret,
            resave: false,
            rolling: true,
            saveUninitialized: true,
            cookie: {
                maxAge: 365 * 24 * 60 * 60 * 1000
            },
            store: new MongoStore({
                mongooseConnection: mongoose.connection,
                ttl: 365 * 24 * 60 * 60,
                clear_interval: 60 * 60
            })
        }));

        //passport
        app.use(passport.initialize());
        app.use(passport.session());
        //passport

        app.use("/auth", require("./server/systems/auth/api"));
        app.use("/auth", require("./server/systems/auth/pages"));

        app.use("/session", require("./server/systems/session/api"));
        app.use("/session", require("./server/systems/session/pages"));

        app.use("/accounts", require("./server/systems/accounts/api"));
        app.use("/accounts", require("./server/systems/accounts/pages"));

        app.use("/setting", require("./server/systems/setting/api"));
        app.use("/setting", require("./server/systems/setting/pages"));

        app.use("/analysis", require("./server/systems/analysis/api"));
        app.use("/analysis", require("./server/systems/analysis/pages"));

        app.use("/rewriting", require("./server/systems/rewriting/api"));
        app.use("/rewriting", require("./server/systems/rewriting/pages"));

        app.use("/publickey", require("./server/systems/publickey/api"));


        app.use("/files", require("./server/systems/files/api"));
        app.use("/files", require("./server/systems/files/pages"));

        app.use("/resources", require("./server/systems/resources/api"));
        app.use("/resources", require("./server/systems/resources/pages"));


        app.use("/forms", require("./server/services/forms/api"));
        app.use("/forms", require("./server/services/forms/pages"));

        app.use("/backoffice", require("./server/services/backoffice/api"));
        app.use("/backoffice", require("./server/services/backoffice/pages"));

        app.use("/articles", require("./server/services/articles/api"));
        app.use("/articles", require("./server/services/articles/pages"));

        app.use("/layouts", require("./server/services/layouts/api"));
        app.use("/layouts", require("./server/services/layouts/pages"));

        app.use("/images", require("./server/services/images/api"));
        app.use("/images", require("./server/services/images/pages"));

        app.use("/groups", require("./server/services/groups/api"));
        app.use("/groups", require("./server/services/groups/pages"));

        app.use("/profile", require("./server/services/profile/api"));
        app.use("/profile", require("./server/services/profile/pages"));

        if (services_config.services) {
            _.forEach(services_config.services, (service) => {
                app.use(service.url, require(service.lib));
            });
        }

        if (plugins_config.services) {
            _.forEach(plugins_config.services, (service) => {
                app.use(service.url, require(service.lib));
            });
        }

        if (applications_config.services) {
            _.forEach(applications_config.services, (service) => {
                app.use(service.url, require(service.lib));
            });
        }

        const InterceptorModule = require("./server/systems/common/interceptor");
        app.use(interceptor(InterceptorModule.Handler));

        const SchedulerModule = require("./server/systems/common/scheduler");
        const Scheduler = new SchedulerModule.Scheduler();

        let schedules = [
            {
                timing: {hour: 16, minute: 27}, job: () => {
                let a = 1;
            }
            }
        ];

        _.forEach(schedules, (schedule) => {
            Scheduler.Add(schedule.timing, schedule.job);
        });

        if (process.env.NODE_ENV !== 'production') {
            app.use(morgan('original', {immediate: true}));
        } else {
            const rotatestream = require('logrotate-stream');
            app.use(morgan('combined', {
                stream: rotatestream({
                    file: __dirname + '/logs/access.log',
                    size: '100k',
                    keep: 3
                })
            }));
        }

        //const Account: any = require("./models/systems/auth/account");

        const Account = core.LocalAccount;
        passport.use(new LocalStrategy(Account.authenticate()));

        passport.serializeUser((user, done): void => {
            switch (user.provider) {
                case "facebook":
                case "twitter":
                case "instagram":
                    let objectid: any = new mongoose.Types.ObjectId; // Create new id
                    user.username = user.id;
                    user.userid = user.id;
                    user.enabled = true;
                    user.passphrase = objectid.toString();
                    user.publickey = Cipher.PublicKey(user.passphrase);
                    user.local = definition.account_content;
                    break;
                case "local":
                    break;
                default:
            }
            done(null, user);
        });

        passport.deserializeUser((obj, done): void => {
            done(null, obj);
        });

        if (applications_config.facebook) {
            passport.use(new FacebookStrategy(applications_config.facebook.key, (accessToken, refreshToken, profile, done): void => {
                    process.nextTick((): void => {
                        done(null, profile);
                    })
                }
            ));
        }

        if (applications_config.twitter) {
            passport.use(new TwitterStrategy(applications_config.twitter.key, (accessToken, refreshToken, profile, done): void => {
                    process.nextTick((): void => {
                        done(null, profile);
                    });
                }
            ));
        }

        if (applications_config.instagram) {
            passport.use(new InstagramStrategy(applications_config.instagram.key, (accessToken, refreshToken, profile, done): void => {
                    process.nextTick((): void => {
                        done(null, profile);
                    });
                }
            ));
        }
        if (applications_config.googleplus) {
  //          passport.use(new GooglePlusStrategy(applications_config.googleplus.key, (accessToken, refreshToken, profile, done): void => {
  //                  process.nextTick((): void => {
  //                      done(null, profile);
  //                  })
  //              }
  //          ));
        }

        const auth: any = core.auth;
        auth.create_init_user();
        auth.create_init_page();

        const file: any = core.file;
        file.create_init_files();


        // DAV
        /*
         let jsDAV = require("cozy-jsdav-fork/lib/jsdav");
         let jsDAV_Locks_Backend_FS = require("cozy-jsdav-fork/lib/DAV/plugins/locks/fs");
         jsDAV.createServer({
         node: path.join(__dirname, 'public'),
         locksBackend: jsDAV_Locks_Backend_FS.new(path.join(__dirname, 'public/lock'))
         }, 8001);
         require('cozy-jsdav-fork/lib/CalDAV/plugin');
         */
        // DAV


        const MailerModule: any = require('./server/systems/common/mailer');
        let receiver = new MailerModule.MailReceiver();
        receiver.connect(applications_config.receiver,
            (error) => {
                let  a = error;
            },
            (message, body) => {
                let a = message;
                let subject = body.subject;
                let text = body.text;
            });

        // catch 404 and forward to error handler
        app.use((req, res, next): void => {
            let err = new Error('Not Found');
            err.status = 404;
            next(err);
        });


        // error handlers

        // development error handler
        // will print stacktrace
        if (app.get('env') === 'development') {
            app.use((err, req, res, next): void => {
                res.status(err.status || 500);
                res.render('error', {
                    message: err.message,
                    status: err.status
                });
            });
        }

        // production error handler
        // no stacktraces leaked to user
        app.use((err, req, res, next): void => {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: {}
            });
        });
        module.exports = app;

    } else {
        const app = express();
        const router = express.Router();

        app.set('views', path.join(__dirname, 'views'));
        app.set('view engine', 'pug');

        const bodyParser = require('body-parser');
        app.use(bodyParser.json({limit: '50mb'}));
        app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

        app.use(express.static(path.join(__dirname, 'public')));

        app.use("/", require("./server/utility/installer/api"));
        app.use("/", require("./server/utility/installer/pages"));

        // catch 404 and forward to error handler
        app.use((req, res, next): void => {
            let err = new Error('Not Found');
            next(err);
        });
        module.exports = app;
    }
}


