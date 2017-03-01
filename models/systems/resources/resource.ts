/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

namespace ResourceModule {
    const mongoose = require('mongoose');
    const Schema = mongoose.Schema;
    const timestamp: any = require('../../systems/plugins/timestamp/timestamp');
    const userdata: any = require('../../systems/plugins/userdata/userdata');

    const Resource = new Schema({});

    Resource.plugin(timestamp);
    Resource.plugin(userdata, {});

    module.exports = mongoose.model('Resource', Resource);
}