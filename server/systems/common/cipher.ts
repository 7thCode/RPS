/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace CipherModule {

    const cipher_crypto: any = require('crypto');
    const cipher_cryptico: any = require('cryptico');

    export class Cipher {

        static FixedCrypt(name: string, password: string): string {
            let cipher: any = cipher_crypto.createCipher('aes192', password);
            try {
                let crypted: string = cipher.update(name, 'utf8', 'hex');
                crypted += cipher.final('hex');
                return crypted;
            } catch (ex) {

            }
        }

        static FixedDecrypt(name: string, password: string): string {
            let decipher: any = cipher_crypto.createDecipher('aes192', password);
            try {
                let decrypted: string = decipher.update(name, 'hex', 'utf8');
                decrypted += decipher.final('utf8');
                return decrypted;
            } catch (ex) {

            }
        }

        static PublicKey(passphrase: string): string {
            let secretkey: any = cipher_cryptico.generateRSAKey(passphrase, 1024);
            return cipher_cryptico.publicKeyString(secretkey);
        }

        static PublicKeyDecrypt(passphrase: string, crypted: string): string {
            let secretkey: any = cipher_cryptico.generateRSAKey(passphrase, 1024);
            return cipher_cryptico.decrypt(crypted, secretkey);
        }
    }
}
module.exports = CipherModule;
