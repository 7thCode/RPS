/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

module.exports = exports = function UserDataPlugin(schema: any, options: any) {

    schema.add({userid: String});
    schema.add({content: Object});
    schema.add({name: String});
    schema.add({open: Boolean});
    schema.add({type: Number});

    schema.index({name: 1});

    schema.pre('save', function (next: any) {
        if (!this.userid) {
            this.userid = "";
        }
        if (!this.name) {
            this.name = "";
        }
        if (!this.type) {
            this.type = 0;
        }
        if (!this.content) {
            this.content = {};
        }
        next();
    });

};
