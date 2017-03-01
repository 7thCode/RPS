/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

namespace FormModule {
    const mongoose = require('mongoose');
    const Schema = mongoose.Schema;
    const timestamp: any = require('../../systems/plugins/timestamp/timestamp');
    const userdata: any = require('../../systems/plugins/userdata/userdata');

    const Form = new Schema({});

    Form.plugin(timestamp);
    Form.plugin(userdata, {});

    module.exports = mongoose.model('Page', Form);
}