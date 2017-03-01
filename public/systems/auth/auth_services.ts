/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

namespace AuthServicesModule {

    let AuthServices: angular.IModule = angular.module('AuthServices', []);

    AuthServices.factory('Profile', ['$resource',
        ($resource: any): angular.resource.IResource<any> => {
            return $resource('/profile/api', {}, {
                get: {method: 'GET'},
                put: {method: 'PUT'},
            });
        }]);

    AuthServices.factory('Register', ['$resource',
        ($resource: any): angular.resource.IResource<any> => {
            return $resource('/auth/local/register', {}, {
                regist: {method: 'POST'}
            });
        }]);

    AuthServices.factory('Member', ['$resource',
        ($resource: any): angular.resource.IResource<any> => {
            return $resource('/auth/local/member', {}, {
                regist: {method: 'POST'}
            });
        }]);

    AuthServices.factory('Login', ['$resource',
        ($resource: any): angular.resource.IResource<any> => {
            return $resource('/auth/local/login', {}, {
                login: {method: 'POST'}
            });
        }]);

    AuthServices.factory('Password', ['$resource',
        ($resource: any): angular.resource.IResource<any> => {
            return $resource('/auth/local/password', {}, {
                change: {method: 'POST'}
            });
        }]);

    AuthServices.factory('Logout', ['$resource',
        ($resource: any): angular.resource.IResource<any> => {
            return $resource('/auth/logout', {}, {
                logout: {method: 'POST'}
            });
        }]);

    AuthServices.service('AuthService', ["Register", "Login", "Logout", "Password", "Member", "PublicKeyService",
        function (Register: any, Login: any, Logout: any, Password: any, Member: any, PublicKeyService): void {

            this.Regist = (username: string, password: string, displayName: string, metadata: any, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
                PublicKeyService.Fixed((key) => {
                    let regist: any = new Register();

                    if (key) {
                        regist.username = cryptico.encrypt(username, key).cipher;
                        regist.password = cryptico.encrypt(password, key).cipher;
                    } else {
                        regist.username = username;
                        regist.password = password;
                    }

                    regist.displayName = displayName;
                    regist.metadata = metadata;
                    regist.$regist((account: any): void => {
                        if (account) {
                            if (account.code === 0) {
                                callback(account.value);
                            } else {
                                error(account.code, account.message);
                            }
                        } else {
                            error(10000, "network error");
                        }
                    });
                });

            };

            this.Member = (username: string, password: string, displayName: string, metadata: any, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
                PublicKeyService.Fixed((key) => {
                    let regist: any = new Member();

                    if (key) {
                        regist.username = cryptico.encrypt(username, key).cipher;
                        regist.password = cryptico.encrypt(password, key).cipher;
                    } else {
                        regist.username = username;
                        regist.password = password;
                    }

                    regist.displayName = displayName;
                    regist.metadata = metadata;
                    regist.$regist((account: any): void => {
                        if (account) {
                            if (account.code === 0) {
                                callback(account.value);
                            } else {
                                error(account.code, account.message);
                            }
                        } else {
                            error(10000, "network error");
                        }
                    });
                });
            };

            this.Login = (username: string, password: string, callback: (result: any) => void, error: (code: number, message: string) => void): void => {

                PublicKeyService.Fixed((key) => {
                    let login = new Login();

                    if (key) {
                        login.username = cryptico.encrypt(username, key).cipher;
                        login.password = cryptico.encrypt(password, key).cipher;
                    } else {
                        login.username = username;
                        login.password = password;
                    }

                    login.$login((account: any): void => {  //ログイン
                        if (account) {
                            if (account.code === 0) {
                                callback(account.value);
                            } else {
                                error(account.code, account.message);
                            }
                        } else {
                            error(10000, "network error");
                        }
                    });
                });
            };

            this.Logout = (callback: (result: any) => void): void => {
                let logout: any = new Logout();
                logout.$logout((account: any): void => {
                    if (account) {
                        if (account.code === 0) {
                            callback(account.value);
                        }
                    }
                });
            };

            this.Password = (username: string, password: string, callback: (result: any) => void, error: (code: number, message: string) => void): void => {

                PublicKeyService.Fixed((key) => {
                    let pass: any = new Password();

                    if (key) {
                        pass.username = cryptico.encrypt(username, key).cipher;
                        pass.password = cryptico.encrypt(password, key).cipher;
                    } else {
                        pass.username = username;
                        pass.password = password;
                    }

                    pass.$change((account: any): void => {
                        if (account) {
                            if (account.code === 0) {
                                callback(account.value);
                            } else {
                                error(account.code, account.message);
                            }
                        } else {
                            error(10000, "network error");
                        }
                    });

                });
            };

        }]);

    /*
     PublicKeyService.Fixed((key) => {
     let a = key;
     });

     PublicKeyService.Dynamic((key) => {
     let a = key;
     });

     PublicKeyService.Token((key) => {
     let a = key;
     });
     */

    AuthServices.service('ProfileService', ["Profile",
        function (Self: any): void {

            this.Get = (callback: (result: any) => void, error: (code: number, message: string) => void): void => {
                Self.get({}, (result: any): void => {
                    if (result) {
                        switch (result.code) {
                            case 0:
                                callback(result.value);
                                break;
                            case 1:
                                callback(null);
                                break;
                            default:
                                error(result.code, result.message);
                        }
                    } else {
                        error(10000, "network error");
                    }
                });
            };

            this.Put = (content: any, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
                let self = new Self();
                self.local = content;
                self.$put({}, (result: any): void => {
                    if (result) {
                        if (result.code === 0) {
                            callback(result.value);
                        } else {
                            error(result.code, result.message);
                        }
                    } else {
                        error(10000, "network error");
                    }
                });
            };

        }]);
}