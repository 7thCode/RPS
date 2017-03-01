/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

/// <reference path="../../../../typings/index.d.ts" />

module.exports = exports = function lastModifiedPlugin(schema:any, options:any) {

    schema.add({ create: Date });
    schema.add({ modify: Date });

    schema.pre('init', function(next:any) {
        next();
    });

    schema.post('init', function(doc:any) {
    });

    schema.pre('validate', function(next:any) {
        next();
    });

    schema.post('validate', function(doc:any) {
    });

    schema.pre('save', function (next:any) {
        if (!this.create) {
            this.create = new Date;
        }

        this.modify = new Date;
        next();
    });

    schema.post('save', function(doc:any) {
    });

    //triggered at "findOneAndRemove" only.
    schema.pre('remove', function(next:any) {
        next();
    });

    schema.post('remove', function(doc:any) {
    });

    schema.pre('update', function() {
        this.update({},{ $set: { modify: new Date() } });
    });

    if (options) {
        if (options.index) {
            schema.path('create').index(options.index);
            schema.path('modify').index(options.index);
        }
    }

};
