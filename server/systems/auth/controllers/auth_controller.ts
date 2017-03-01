/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace AuthModule {

    const _ = require('lodash');

    const fs = require('graceful-fs');

    const mongoose: any = require('mongoose');
    mongoose.Promise = require('q').Promise;

    const passport: any = require('passport');

    const pug = require('pug');
    const path = require('path');

    const share = require('../../common/share');
    const config = share.config;
    const applications_config = share.applications_config;

    const Wrapper = share.Wrapper;
    const logger = share.logger;
    const Cipher = share.Cipher;

    const MailerModule: any = require('../../common/mailer');

    const HtmlEditModule: any = require("../../common/html_edit/html_edit");

    let _mailer = null;
    switch (applications_config.mailer.type) {
        case "mail":
            _mailer = new MailerModule.Mailer(applications_config.mailer.setting, applications_config.mailer.account);
            break;
        case "gmail":
            _mailer = new MailerModule.Mailer2(applications_config.mailer.setting, applications_config.mailer.account);
            break;
        case "mailgun":
            _mailer = new MailerModule.MailGun(applications_config.mailer.setting, applications_config.mailer.account);
            break;
        default:
    }

    const LocalAccount: any = require(share.Models("systems/accounts/account"));

    const ResourceModel: any = require(share.Models("systems/resources/resource"));

    interface PasswordToken {
        username: string;
        password: string;
        displayName: string;
        metadata: {},
        timestamp: any;
    }

    interface UserToken {
        username: string;
        password: string;
        newusername: string;
        timestamp: any;
    }

    let definition = {account_content: {mails: [], nickname: "", tokens: {}}};
    fs.open(share.Models('applications/accounts/definition.json'), 'ax+', 384, (error, fd) => {
        if (!error) {
            fs.close(fd, () => {
                let addition = JSON.parse(fs.readFileSync(share.Models('applications/accounts/definition.json'), 'utf-8'));
                definition = _.merge(definition, addition.account_content);
            });
        }
    });

    const use_publickey = config.use_publickey;

    //const builder_userid = config.systems.userid;

    export class Auth {

        constructor() {

        }

        public create_init_user(): void {
            _.forEach(config.initusers, (user) => {
                let type = user.type;
                let username: string = user.username;
                let userid = user.userid;
                let passphrase: string = Cipher.FixedCrypt(userid, config.key2);

                let rootpassword: string = user.password;
                Wrapper.FindOne(null, 1000, LocalAccount, {username: username}, (response: any, account: any): void => {
                    if (!account) {

                        let content: any = definition.account_content;
                        content.mails.push(username);
                        content.nickname = user.displayName;

                        LocalAccount.register(new LocalAccount({
                                userid: userid,
                                username: username,
                                type: type,
                                passphrase: passphrase,
                                publickey: Cipher.PublicKey(passphrase),
                                local: content
                            }),
                            rootpassword,
                            (error: any) => {
                                if (error) {
                                    logger.error(error.message);
                                }
                            });
                    }
                });
            });
        }

        public create_init_page(): void {
            _.forEach(config.initpages, (page) => {
                let name: string = page.name;
                let userid = page.userid;
                let type: string = page.type;
                let content: any = page.content;
                Wrapper.FindOne(null, 1000, ResourceModel, {$and: [{userid: userid}, {type: type}, {name: name}]}, (response: any, page: any): void => {
                    if (!page) {
                        let page: any = new ResourceModel();
                        page.userid = userid;
                        page.name = name;
                        page.type = type;
                        page.content = content;
                        page.open = true;
                        page.save().then(() => {
                        }).catch((): void => {
                        });
                    }
                });
            });
        }

        static auth_event(crypted_token: any): void {
           // let save = crypted_token;
        };

        /**
         *
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        public page_valid(request: any, response: any, next: any): void {
            let user = request.user;
            if (user) {
                if (user.enabled) {
                    next();
                } else {
                    response.status(403).render('error', {status: 403, message: "Forbidden...", url: request.url});
                }
            } else {
                response.status(403).render('error', {status: 403, message: "Forbidden...", url: request.url});
            }
        }

        /**
         *
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        public page_is_system(request: any, response: any, next: any): void {
            let user = request.user;
            if (user) {
                if (user.type == "System") {
                    next();
                } else {
                    response.status(403).render('error', {status: 403, message: "Forbidden...", url: request.url});
                }
            } else {
                response.status(403).render('error', {status: 403, message: "Forbidden...", url: request.url});
            }
        }

        /**
         *
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        public is_system(request: any, response: any, next: any): void {
            let user = request.user;
            if (user) {
                if (user.type == "System") {
                    next();
                } else {
                    Wrapper.SendError(response, 403, "Forbidden.", {});
                }
            } else {
                Wrapper.SendError(response, 403, "Forbidden.", {});
            }
        }

        /**
         * アカウント作成
         * @param request
         * @param response
         * @returns none
         */
        public post_local_register(request: any, response: any): void {
            const number: number = 15000;
            let username: string = request.body.username;
            let password: string = request.body.password;
            let systempassphrase: string = request.session.id;

            if (use_publickey) {
                username = Cipher.PublicKeyDecrypt(systempassphrase, username).plaintext;
                password = Cipher.PublicKeyDecrypt(systempassphrase, password).plaintext;
            }

            Wrapper.FindOne(response, 100, LocalAccount, {$and: [{provider: "local"}, {username: username}]},
                (response: any, account: any): void => {
                    if (!account) {
                        try {

                            let metadata = {};
                            if (request.body.metadata) {
                                metadata = request.body.metadata;
                            }

                            let tokenValue: PasswordToken = {
                                username: username,
                                password: password,
                                displayName: request.body.displayName,
                                metadata: metadata,
                                timestamp: Date.now()
                            };

                            let token: string = Cipher.FixedCrypt(JSON.stringify(tokenValue), config.tokensecret);
                            let link = "//" + config.domain + "/auth/register/" + token;
                            let beacon = "http://" + config.domain + "/beacon/api/" + token;
                            ResourceModel.findOne({name: "regist_mail"}).then((record: any): void => {
                                if (record) {
                                    HtmlEditModule.Render.ScanHtml(record.content.resource, {
                                        create: "",
                                        modify: "",
                                        content: {link:{ "value" : link, "type" : "quoted" }, beacon:{ "value" : beacon, "type" : "quoted" }}
                                    }, (error: any, doc: any) => {
                                        _mailer.send(username, applications_config.messages.mail.regist.subject, doc, (error: any) => {
                                            if (!error) {
                                                Wrapper.SendSuccess(response, {code: 0, message: ""});
                                            } else {
                                                Wrapper.SendError(response, number + 200, error.message, error);
                                            }
                                        });
                                    });
                                } else {
                                    Wrapper.SendError(response, number + 200, "not found.", {});
                                }
                            }).catch((error: any): void => {
                                Wrapper.SendFatal(response, number + 100, error.message, error);
                            });

                        } catch (e) {
                            Wrapper.SendFatal(response, number + 100, e.message, e);
                        }
                    } else {
                        Wrapper.SendWarn(response, number + 1, applications_config.usernamealreadyregist, {});
                    }
                }
            );
        }

        /**
         * レジスタートークンでユーザ登録
         * @param request
         * @param response
         * @returns none
         */
        public get_register_token(request: any, response: any): void {
            Wrapper.Exception(request, response, (request: any, response: any): void => {
                let token: any = JSON.parse(Cipher.FixedDecrypt(request.params.token, config.tokensecret));
                let tokenDateTime: any = token.timestamp;
                let nowDate: any = Date.now();
                if ((tokenDateTime - nowDate) < (60 * 60 * 1000)) {
                    LocalAccount.findOne({username: token.username}, (error: any, account_data: any): void => {
                        if (!error) {
                            if (!account_data) {
                                let objectid: any = new mongoose.Types.ObjectId; // Create new id
                                let userid: string = objectid.toString();
                                let passphrase: string = Cipher.FixedCrypt(userid, config.key2);

                                let content: any = definition.account_content;
                                content.mails.push(token.username);
                                content.nickname = token.displayName;

                                if (token.metadata.userid) {
                                    userid = token.metadata.userid;
                                }

                                LocalAccount.register(new LocalAccount({
                                        userid: userid,
                                        username: token.username,
                                        passphrase: passphrase,
                                        publickey: Cipher.PublicKey(passphrase),
                                        local: content
                                    }),
                                    token.password,
                                    (error: any): void => {
                                        if (!error) {
                                            let user: {username: string;password: string} = request.body;
                                            user.username = token.username;
                                            user.password = token.password;
                                            passport.authenticate('local', (error: any, user: any): void => {
                                                if (!error) {
                                                    if (user) {
                                                        request.login(user, (error: any): void => {
                                                            if (!error) {
                                                                Auth.auth_event(request.params.token);
                                                                response.redirect("/");
                                                            } else {
                                                                response.status(500).render('error', {
                                                                    status: 500,
                                                                    message: ""
                                                                });
                                                            }
                                                        });
                                                    } else {
                                                        response.status(500).render('error', {
                                                            status: 500,
                                                            message: ""
                                                        });
                                                    }
                                                } else {
                                                    response.status(500).render('error', {status: 500, message: ""});
                                                }
                                            })(request, response);
                                        } else {
                                            response.status(500).render('error', {
                                                status: 500,
                                                message: "unknown error."
                                            });
                                        }
                                    });
                            } else {
                                response.redirect("/");
                            }
                        } else {
                            response.status(500).render('error', {status: 500, message: "unknown error"});
                        }
                    });
                } else {
                    response.status(500).render('error', {status: 500, message: "timeout"});
                }
            });
        }

        /**
         * アカウント作成
         * @param request
         * @param response
         * @returns none
         */
        public post_member_register(request: any, response: any): void {
            const number: number = 15000;
            let username: string = request.body.username;
            let password: string = request.body.password;
            let systempassphrase: string = request.session.id;

            if (use_publickey) {
                username = Cipher.PublicKeyDecrypt(systempassphrase, username).plaintext;
                password = Cipher.PublicKeyDecrypt(systempassphrase, password).plaintext;
            }

            Wrapper.FindOne(response, 100, LocalAccount, {$and: [{provider: "local"}, {username: username}]},
                (response: any, account: any): void => {
                    if (!account) {
                        try {

                            let tokenValue = {
                                userid: request.user.userid,
                                username: username,
                                password: password,
                                type: request.user.type,
                                displayName: request.body.displayName,
                                timestamp: Date.now()
                            };

                            let token: string = Cipher.FixedCrypt(JSON.stringify(tokenValue), config.tokensecret);
                            let link = "//" + config.domain + "/auth/member/" + token;
                            let beacon = "http://" + config.domain + "/beacon/api/" + token;
                            ResourceModel.findOne({name: "regist_member_mail"}).then((record: any): void => {
                                if (record) {
                                    HtmlEditModule.Render.ScanHtml(record.content.resource, {
                                        create: "",
                                        modify: "",
                                        content: {link:{ "value" : link, "type" : "quoted" }, beacon:{ "value" : beacon, "type" : "quoted" }}
                                    }, (error: any, doc: any) => {
                                        _mailer.send(username, applications_config.messages.mail.regist.subject, doc, (error: any) => {
                                            if (!error) {
                                                Wrapper.SendSuccess(response, {code: 0, message: ""});
                                            } else {
                                                Wrapper.SendError(response, number + 200, error.message, error);
                                            }
                                        });
                                    });
                                } else {
                                    Wrapper.SendError(response, number + 200, "not found.", {});
                                }
                            }).catch((error: any): void => {
                                Wrapper.SendFatal(response, number + 100, error.message, error);
                            });
                        } catch (e) {
                            Wrapper.SendFatal(response, number + 100, e.message, e);
                        }
                    } else {
                        Wrapper.SendWarn(response, number + 1, applications_config.usernamealreadyregist, {});
                    }
                }
            );
        }

        /**
         * レジスタートークンでユーザ登録
         * @param request
         * @param response
         * @returns none
         */
        public get_member_token(request: any, response: any): void {
            Wrapper.Exception(request, response, (request: any, response: any): void => {
                let token: any = JSON.parse(Cipher.FixedDecrypt(request.params.token, config.tokensecret));
                let tokenDateTime: any = token.timestamp;
                let nowDate: any = Date.now();
                if ((tokenDateTime - nowDate) < (60 * 60 * 1000)) {
                    LocalAccount.findOne({username: token.username}, (error: any, account_data: any): void => {
                        if (!error) {
                            if (!account_data) {
                                let objectid: any = new mongoose.Types.ObjectId; // Create new id
                                let userid: string = objectid.toString();
                                let passphrase: string = Cipher.FixedCrypt(userid, config.key2);

                                let content = definition.account_content;
                                content.mails.push(token.username);
                                content.nickname = token.displayName;

                                LocalAccount.register(new LocalAccount({
                                        userid: token.userid,
                                        type: token.type,
                                        username: token.username,
                                        passphrase: passphrase,
                                        publickey: Cipher.PublicKey(passphrase),
                                        local: content
                                    }),
                                    token.password,
                                    (error: any): void => {
                                        if (!error) {
                                            let user: {username: string;password: string} = request.body;
                                            user.username = token.username;
                                            user.password = token.password;
                                            passport.authenticate('local', (error: any, user: any): void => {
                                                if (!error) {
                                                    if (user) {
                                                        request.login(user, (error: any): void => {
                                                            if (!error) {
                                                                Auth.auth_event(request.params.token);
                                                                response.redirect("/");
                                                            } else {
                                                                response.status(500).render('error', {
                                                                    status: 500,
                                                                    message: ""
                                                                });
                                                            }
                                                        });
                                                    } else {
                                                        response.status(500).render('error', {
                                                            status: 500,
                                                            message: ""
                                                        });
                                                    }
                                                } else {
                                                    response.status(500).render('error', {status: 500, message: ""});
                                                }
                                            })(request, response);
                                        } else {
                                            response.status(500).render('error', {
                                                status: 500,
                                                message: "unknown error."
                                            });
                                        }
                                    });
                            } else {
                                response.redirect("/");
                            }
                        } else {
                            response.status(500).render('error', {status: 500, message: "unknown error"});
                        }
                    });
                } else {
                    response.status(500).render('error', {status: 500, message: "timeout"});
                }
            });
        }

        /**
         * レジスタートークン発行
         * @param request
         * @param response
         * @returns none
         */
        public post_local_username(request: any, response: any): void {
            const number: number = 19000;
            let username: string = request.body.username;
            let password: string = request.body.password;
            let newusername: string = request.body.newusername;
            let systempassphrase: string = request.session.id;

            if (use_publickey) {
                username = Cipher.PublicKeyDecrypt(systempassphrase, username).plaintext;
                password = Cipher.PublicKeyDecrypt(systempassphrase, password).plaintext;
            }

            Wrapper.FindOne(response, number, LocalAccount, {$and: [{provider: "local"}, {username: username}]}, (response: any, account: any): void => {
                if (account) {
                    Wrapper.FindOne(response, number, LocalAccount, {$and: [{provider: "local"}, {username: newusername}]}, (response: any, account: any): void => {
                        if (!account) {
                            try {

                                let tokenValue: UserToken = {
                                    username: username,
                                    password: password,
                                    newusername: newusername,
                                    timestamp: Date.now()
                                };

                                let token: string = Cipher.FixedCrypt(JSON.stringify(tokenValue), config.tokensecret);
                                let link = "//" + config.domain + "/auth/username/" + token;
                                let beacon = "http://" + config.domain + "/beacon/api/" + token;
                                ResourceModel.findOne({name: "username_mail"}).then((record: any): void => {
                                    if (record) {
                                        HtmlEditModule.Render.ScanHtml(record.content.resource, {
                                            create: "",
                                            modify: "",
                                            content: {link:{ "value" : link, "type" : "quoted" }, beacon:{ "value" : beacon, "type" : "quoted" }}
                                        }, (error: any, doc: any) => {
                                            _mailer.send(username, applications_config.messages.mail.regist.subject, doc, (error: any) => {
                                                if (!error) {
                                                    Wrapper.SendSuccess(response, {code: 0, message: ""});
                                                } else {
                                                    Wrapper.SendError(response, number + 200, error.message, error);
                                                }
                                            });
                                        });
                                    } else {
                                        Wrapper.SendError(response, number + 200, "not found.", {});
                                    }
                                }).catch((error: any): void => {
                                    Wrapper.SendFatal(response, number + 100, error.message, error);
                                });
                            } catch (e) {
                                Wrapper.SendFatal(response, number + 100, e.message, e);
                            }
                        } else {
                            Wrapper.SendWarn(response, number + 2, applications_config.usernamealreadyregist, {});
                        }
                    });
                } else {
                    Wrapper.SendWarn(response, number + 3, applications_config.usernamenotfound, {});
                }
            });
        }

        /**
         * ユーザ名トークンでユーザ名変更（多分使用しない)
         * @param request
         * @param response
         * @returns none
         */
        public get_username_token(request: any, response: any): void {
            Wrapper.Exception(request, response, (request: any, response: any): void => {
                let token: any = JSON.parse(Cipher.FixedDecrypt(request.params.token, config.tokensecret));
                let tokenDateTime: any = token.timestamp;
                let nowDate: any = Date.now();
                if ((tokenDateTime - nowDate) < (60 * 60 * 1000)) {
                    LocalAccount.findOne({username: token.username}, (error: any, account: any): void => {
                        if (!error) {
                            if (account) {
                                let number: number = 83000;
                                account.username = token.newusername;
                                if (!error) {
                                    Wrapper.Save(response, number, account, (): void => {
                                        response.redirect("/");
                                    });
                                } else {
                                    response.status(400).render("error", {message: "unknown error", status: 400}); // already
                                }
                            } else {
                                response.status(400).render("error", {message: "already", status: 400}); // already
                            }
                        } else {
                            response.status(500).render("error", {message: "unknown error", status: 500}); // timeout
                        }
                    })
                } else {
                    response.status(400).render("error", {message: "timeout", status: 400}); // timeout
                }
            });
        }

        /**
         * パスワードトークン発行
         * @param request
         * @param response
         * @returns none
         */
        public post_local_password(request: any, response: any): void {
            const number: number = 21000;
            let username: string = request.body.username;
            let password: string = request.body.password;
            let systempassphrase: string = request.session.id;

            if (use_publickey) {
                username = Cipher.PublicKeyDecrypt(systempassphrase, username).plaintext;
                password = Cipher.PublicKeyDecrypt(systempassphrase, password).plaintext;
            }

            Wrapper.FindOne(response, number, LocalAccount, {$and: [{provider: "local"}, {username: username}]}, (response: any, account: any): void => {
                if (account) {
                    try {

                        let tokenValue = {
                            username: username,
                            password: password,
                            timestamp: Date.now()
                        };

                        let token: any = Cipher.FixedCrypt(JSON.stringify(tokenValue), config.tokensecret);
                        let link = "//" + config.domain + "/auth/password/" + token;
                        let beacon = "http://" + config.domain + "/beacon/api/" + token;
                        ResourceModel.findOne({name: "password_mail"}).then((record: any): void => {
                            if (record) {
                                HtmlEditModule.Render.ScanHtml(record.content.resource, {
                                    create: "",
                                    modify: "",
                                    content: {link:{ "value" : link, "type" : "quoted" }, beacon:{ "value" : beacon, "type" : "quoted" }}
                                }, (error: any, doc: any) => {
                                    _mailer.send(username, applications_config.messages.mail.regist.subject, doc, (error: any) => {
                                        if (!error) {
                                            Wrapper.SendSuccess(response, {code: 0, message: ""});
                                        } else {
                                            Wrapper.SendError(response, number + 200, error.message, error);
                                        }
                                    });
                                });
                            } else {
                                Wrapper.SendError(response, number + 200, "not found.", {});
                            }
                        }).catch((error: any): void => {
                            Wrapper.SendFatal(response, number + 100, error.message, error);
                        });
                    } catch (e) {
                        Wrapper.SendFatal(response, number + 100, e.message, e);
                    }
                } else {
                    Wrapper.SendWarn(response, number + 1, applications_config.usernamenotfound, {});
                }
            });
        }

        /**
         * パスワードトークンからパスワード変更
         * @param request
         * @param response
         * @returns none
         */
        public get_password_token(request: any, response: any): void {
            const number: number = 22000;
            Wrapper.Exception(request, response, (request: any, response: any): void => {
                let token: any = JSON.parse(Cipher.FixedDecrypt(request.params.token, config.tokensecret));
                let tokenDateTime: any = token.timestamp;
                let nowDate: any = Date.now();
                if ((tokenDateTime - nowDate) < (60 * 60 * 1000)) {
                    LocalAccount.findOne({username: token.username}, (error: any, account: any): void => {
                        if (!error) {
                            if (account) {
                                account.setPassword(token.password, (error: any): void => {
                                    if (!error) {
                                        Wrapper.Save(response, number, account, (): void => {
                                            response.redirect("/");
                                        });
                                    } else {
                                        response.status(400).render("error", {message: "unknown", status: 400}); // already
                                    }
                                });
                            } else {
                                response.status(400).render("error", {message: "already", status: 400}); // already
                            }
                        } else {
                            response.status(500).render("error", {message: "unknown error", status: 500}); // timeout
                        }
                    });
                } else {
                    response.status(400).render("error", {message: "timeout", status: 400}); // timeout
                }
            });
        }

        /**
         * ログイン
         * @param request
         * @param response
         * @returns none
         */
        public post_local_login(request: any, response: any): void {
            const number: number = 23000;
            let systempassphrase: string = request.session.id;
            if (request.body.username) {
                if (request.body.password) {

                    if (use_publickey) {
                        request.body.username = Cipher.PublicKeyDecrypt(systempassphrase, request.body.username).plaintext;
                        request.body.password = Cipher.PublicKeyDecrypt(systempassphrase, request.body.password).plaintext;
                    }

                    passport.authenticate("local", (error: any, user: any): void => {
                        if (!error) {
                            if (user) {
                                Wrapper.Guard(request, response, (request: any, response: any): void => {
                                    request.login(user, (error: any): void => {
                                        if (!error) {
                                            Wrapper.SendSuccess(response, {});
                                        } else {
                                            Wrapper.SendError(response, number + 1, error.message, error);
                                        }
                                    });
                                });
                            } else {
                                Wrapper.SendError(response, number + 2, applications_config.wrongusername, {});
                            }
                        } else {
                            Wrapper.SendError(response, number + 3, "", error);
                        }
                    })(request, response);
                } else {
                    Wrapper.SendError(response, number + 4, "", {});
                }
            } else {
                Wrapper.SendError(response, number + 5, "", {});
            }
        }

        /**
         * ログイン（facebook)
         * @param request
         * @param response
         * @returns none
         */
        public auth_facebook_callback(request: any, response: any): void {
            Wrapper.FindOne(response, 1000, LocalAccount, {userid: request.user.username}, (response: any, account: any): void => {
                if (!account) {
                    let userid = request.user.id;  //facebook
                    let passphrase: string = Cipher.FixedCrypt(userid, config.key2);

                    let new_account: any = new LocalAccount();
                    new_account.provider = "facebook";
                    new_account.userid = userid;
                    new_account.username = request.user.username;
                    new_account.passphrase = passphrase;
                    new_account.publickey = Cipher.PublicKey(passphrase);
                    new_account.local = definition.account_content;
                    new_account.registerDate = Date.now();
                    new_account.save((error:any): void => {
                        if (!error) {
                            response.redirect("/");
                        }
                    });
                } else {
                    response.redirect("/");
                }
            });
        }

        /**
         * ログイン（twitter)
         * @param request
         * @param response
         * @returns none
         */
        public auth_twitter_callback(request: any, response: any): void {
            Wrapper.FindOne(response, 1000, LocalAccount, {userid: request.user.username}, (response: any, account: any): void => {
                if (!account) {
                    let userid = request.user.id;  //facebook
                    let passphrase: string = Cipher.FixedCrypt(userid, config.key2);

                    let new_account: any = new LocalAccount();
                    new_account.provider = "twitter";
                    new_account.userid = userid;
                    new_account.username = request.user.username;
                    new_account.passphrase = passphrase;
                    new_account.publickey = Cipher.PublicKey(passphrase);
                    new_account.local = definition.account_content;
                    new_account.registerDate = Date.now();              // Legacy of v1
                    new_account.save((error:any): void => {
                        if (!error) {
                            response.redirect("/");
                        }
                    });
                } else {
                    response.redirect("/");
                }
            });
        }

        /**
         * ログイン（instagram)
         * @param request
         * @param response
         * @returns none
         */
        public auth_instagram_callback(request: any, response: any): void {
            Wrapper.FindOne(response, 1000, LocalAccount, {userid: request.user.username}, (response: any, account: any): void => {
                if (!account) {
                    let userid = request.user.id;
                    let passphrase: string = Cipher.FixedCrypt(userid, config.key2);

                    let new_account: any = new LocalAccount();
                    new_account.provider = "instagram";
                    new_account.userid = userid;
                    new_account.username = request.user.username;
                    new_account.passphrase = passphrase;
                    new_account.publickey = Cipher.PublicKey(passphrase);
                    new_account.local = definition.account_content;
                    new_account.registerDate = Date.now();              // Legacy of v1
                    new_account.save((error:any): void => {
                        if (!error) {
                            response.redirect("/");
                        }
                    });
                } else {
                    response.redirect("/");
                }
            });
        }

        /**
         * ログアウト
         * @param request
         * @param response
         * @returns none
         */
        public logout(request: any, response: any): void {
            request.logout();
            Wrapper.SendSuccess(response, {code: 0, message: ""});
        }

        /**
         * サーバ時間
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        public get_server_date(request:any, response:any, next:any): void {
            Wrapper.SendSuccess(response, new Date());
        }
    }
}

module.exports = AuthModule;
