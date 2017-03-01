/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

namespace QueueModule {
    const mongoose = require('mongoose');
    const Schema = mongoose.Schema;
    const Queue = new Schema({content:{type: Object}}, { capped: { size: 102400, max: 100000, autoIndexId: true } });
    module.exports = mongoose.model('Queue', Queue);
}