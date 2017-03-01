/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export module PublicKeyModule {

    const share = require('../../common/share');
    const Config = share.config;
    const Wrapper = share.Wrapper;
    const logger = share.logger;
    const Cipher = share.Cipher;

    export class PublicKey {

        public get_fixed_public_key(request: any, response: any): void {

            // const cryptico: any = require('cryptico');
            // let SecretKey = cryptico.generateRSAKey(systempassphrase, 1024);  //秘密鍵
            // let publickey = Cipher.PublicKey(systempassphrase);
            // let CipherText = cryptico.encrypt("hoge", publickey);
            // let Decryption = cryptico.decrypt(CipherText.cipher, SecretKey); // 復号
            // let textForm = Decryption.plaintext;

            if (Config.use_publickey) {
                let systempassphrase: string = request.session.id;
                Wrapper.SendSuccess(response, Cipher.PublicKey(systempassphrase));
            } else {
                Wrapper.SendError(response, 1, "", null);
            }
        }

        public get_public_key(request: any, response: any): void {
            if (Config.use_publickey) {
                Wrapper.SendSuccess(response, Cipher.PublicKey(request.user.passphrase));
            } else {
                Wrapper.SendError(response, 1, "", null);
            }
        }

        public get_access_token(request: any, response: any): void {
            if (Config.use_publickey) {
                Wrapper.SendSuccess(response, Cipher.FixedCrypt(request.session.id, request.user.passphrase));
            } else {
                Wrapper.SendError(response, 1, "", null);
            }
        }

        public decrypt_test(req, res) {
            Wrapper.Authenticate(req, res, (req: any, res: any): void => {
                let passphrase: string = req.user.passphrase;
                let CipherText = req.params.text;
                let SecretKey = cryptico.generateRSAKey(passphrase, 1024);  //秘密鍵
                let Decryption = cryptico.decrypt(CipherText, SecretKey); // 復号
                let textForm = Decryption.plaintext;
                res.send(textForm);
            });
        }
    }
}

module.exports = PublicKeyModule;
