/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace ArticleModule {
    const mongoose = require('mongoose');
    const Schema = mongoose.Schema;
    const timestamp: any = require('../../systems/plugins/timestamp/timestamp');
    const userdata: any = require('../../systems/plugins/userdata/userdata');

    const Article = new Schema({
        version:{type: Number, default:1},
        status: {type: Number, default:10},
        from: {type: Date},
        to: {type: Date}
    });

    Article.plugin(timestamp);
    Article.plugin(userdata, {});

    module.exports = mongoose.model('Article', Article);
}