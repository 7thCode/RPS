/// <reference path="./typings/index.d.ts" />

'use strict';

//var fs = require('fs');
//var text = fs.readFileSync('config/systems/config.json', 'utf-8');
//var config = JSON.parse(text);
//
//const log4js = require('log4js');
//log4js.configure("config/systems/logs.json");
//const logger = log4js.getLogger('request');
//logger.setLevel(config.loglevel);
//
//var request = require('request');
////var async = require('async');
//
////request.cookie('connect.sid=3AaOpcFBpSartfOjYmZn79Zth_KKyCiVwG');
//
//function Get(url, body, code, callback) {
//    request.get(url, body, (error, response, body) => {
//        if (response.statusCode != code) {
//            console.log('GET  ERROR:     ' + response.statusCode + "  " + url);
//        } else {
//            //     console.log("OK:        " +  url);
//        }
//        callback();
//    });
//}
//
//function Post(url, body, code, callback) {
//    request.post(url, body, (error, response, body) => {
//        if (response.statusCode != code) {
//            console.log('POST ERROR:     ' + response.statusCode + "  " + url);
//        } else {
//            //  console.log("OK:        " +  url);
//        }
//        callback();
//    });
//}
//
//function Put(url, body, code, callback) {
//    request.put(url, body, (error, response, body) => {
//        if (response.statusCode != code) {
//            console.log('PUT  ERROR:     ' + response.statusCode + "  " + url);
//        } else {
//            //    console.log("OK:        " +  url);
//        }
//        callback();
//    });
//}
//
//function Delete(url, body, code, callback) {
//    request.del(url, body, (error, response, body) => {
//        if (response.statusCode != code) {
//            console.log('DEL  ERROR:     ' + response.statusCode + "  " + url);
//        } else {
//            //      console.log("OK:        " + url);
//        }
//        callback();
//    });
//}
//
//let urls = [
//    ["post", '/auth/local/login', {form: {username: 'oda.mikio@gmail.com', password: 'mitana'}}, 403]
//];
//
//let server = "http://localhost:8000";
//
////let server = "http://133.242.22.100:2001";
//
//let funcs = [];
//
//urls.forEach((url) => {
//
//    let func:(callback:(a:any, b:string)=> void) => void = null;
//    switch (url[0]) {
//        case "get":
//            func = (callback) => {
//                Get(server + url[1], url[2], url[3], () => {
//                    callback(null, "");
//                });
//            };
//            break;
//        case "put":
//            func = (callback) => {
//                Put(server + url[1], url[2], url[3], () => {
//                    callback(null, "");
//                });
//            };
//            break;
//        case "post":
//            func = (callback) => {
//                Post(server + url[1], url[2], url[3], () => {
//                    callback(null, "");
//                });
//            };
//            break;
//        case "delete":
//            func = (callback) => {
//                Delete(server + url[1], url[2], url[3], () => {
//                    callback(null, "");
//                });
//            };
//            break;
//    }
//    funcs.push(func);
//});
//
//console.time("time");
//for (var index = 0; index < 10; index++) {
////async.series(funcs, function (err, results) {
////async.parallel(funcs, function (err, results) {
////    console.timeEnd("time");
////   });
////});
//}
//

/*
 var inbox = require('inbox');

 var imap = inbox.createConnection(false, 'imap.gmail.com', {
 secureConnection: true,
 auth: {
 user: "inbox.7thcode@gmail.com",
 pass: "33550336"
 }
 }
 );

 imap.on('connect', function () {
 console.log('connected');
 imap.openMailbox('INBOX', function (error) {
 if (error) throw error;
 });
 });

 imap.on('new', function (message) {

 let a = message;

 console.log(message.from);
 console.log(message.date);
 });

 imap.connect();
 */

/*
 function sum(s) {
 let result = 0;
 for (var index = 1 ; index < s.length + 1; index++) {
 let code_num = s.charCodeAt(index - 1);
 result += Math.pow(code_num, index);
 }
 return result % 1000000;
 }


 let r1 = sum("ほげげげ");
 let r2 = sum("ほげげげrrrr");

 let r3 = sum("4321");
 let r4 = sum("1234");

 let r5 = sum("1235");
 let r6 = sum("1224");

 let r7 = sum("1111");
 let r8 = sum("2222");

 let r9 = sum("2222");
 */

//function format(f:string, values:any):string {
//  let result = "";


//  return result:
//}

//let value = {x:1};
//let format_string = "a|{value:x.value, type:number, formet:'YYYY-MM-DD HH:mm:ss'}|c";
//let format_string = "a|{value:x.value, type:date, formet:'YYYY-MM-DD HH:mm:ss'}|c";
//let format_string = "a|{value:x.value, type:date, formet:'YYYY-MM-DD HH:mm:ss'}|c";

//const _ = require("lodash");




//let a = format({a:100}, {name: "a", type: "number", locale: "ja-JP", option: {style: 'currency', currency: 'JPY'}});
//let b = format({a:100}, {name: "a", type: "number", locale: "ja-JP"});
//let c = format({a:100}, {name: "a", type: "number", option: {style: 'currency', currency: 'JPY'}});
//let d = format({a:100}, {name: "a", type: "number"});
//let e = format({a:100}, {name: "a"});
/*
let v = {x:100};

let format_string = '{"name": "x", "type": "number", "option": {"style": "currency", "currency": "JPY"}}';

let format = (values, format_string):string => {
    let result = "";

    let _format = (values:any, format: any): string  => {
        let result = "";

        let value = "";
        let name = format.name;
        if (name) {
            value = values[name];
        }

        let locale = "ja-JP";
        if (format.locale) {
            locale = format.locale;
        }

        let option = {};
        if (format.option) {
            option = format.option;
        }

        switch (format.type) {
            case "number":
                result = new Intl.NumberFormat(locale, option).format(value);
                break;
            case "date":
                result = new Intl.DateTimeFormat(locale, option).format(value);
                break;
            default:
                result = "" + value;
        }
        return result;
    };

    _.forEach(format_string.split("|"), (fragment) => {
        if (fragment[0] == "{") {
            if (fragment[fragment.length -1] == "}") {
                try {
                    result += _format(values, JSON.parse(fragment));
                }
                catch (e) {
                    result += fragment;
                }
            } else {
                result += fragment;
            }
        } else {
            result += fragment;
        }
    });

    return result;
};


let r = format(v,format_string);


let a = 1;

*/

let expr = "return a + b;";

let f = new Function ("a", "b", expr);

let geho = f(1,2);

let hoge = geho;

//loadtest http://localhost:8000/forms/builder -n 10 -c 2  -C base1=s%3AEOG4RmkcNzFgduXn3Y_IX6Udmkx1k6T5.AyH7MvPMLgCUsJvDIat0YlZUIsh2MtTyqMHdfBuI0IA
