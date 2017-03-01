/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

namespace AccountModule {
    const mongoose = require('mongoose');

    const Schema = mongoose.Schema;

    const passport = require('passport-local-mongoose');
    const timestamp = require('../plugins/timestamp/timestamp');

// Legacy of v1

    const Account = new Schema({
        provider: {type: String, default: "local"},
        type: {type: String, default: "User"},
        userid: {type: String, required: true, sparse: true},
        username: {type: String, required: true, index: {unique: true}},
        password: {type: String},
        passphrase: {type: String, default: ""},
        publickey: {type: String, default: ""},
        enabled: {type: Boolean, default: true},
        local: {}
    });

    Account.plugin(passport);
    Account.plugin(timestamp);

    Account.method("IsSystem", function (): boolean {
        return (this.type === "System");
    });

    module.exports = mongoose.model('Account', Account);
}