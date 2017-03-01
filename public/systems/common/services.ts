/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */


/// <reference path="./shape_edit/shape_edit.ts" />
/// <reference path="./shape_edit/server_canvas.ts" />
/// <reference path="./shape_edit/adaptor.ts" />
/// <reference path="./html_edit/html_edit.ts" />

"use strict";

let Services = angular.module('Services', []);

Services.factory('Socket', ["$rootScope", ($rootScope: any): any => {
    let socket: any = io.connect();
    return {
        on: (eventName: any, callback: any): void => {
            socket.on(eventName, (data): void => {
                let args: any = [data];
                $rootScope.$apply((): void => {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            });
        },
        emit: (eventName, data, callback): void => {
            socket.emit(eventName, data, (ee): void => {
                let args: any = [data];
                $rootScope.$apply((): void => {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            })
        }
    };
}]);

Services.factory('Session', ['$resource',
    ($resource: any): angular.resource.IResource<any> => {
        return $resource('/session/api', {}, {
            get: {method: 'GET'},
            put: {method: 'PUT'},
        });
    }]);

Services.service("BrowserService", [function () {

    this.UserAgent = "";

    this.IsIE = (): boolean => {
        return (this.UserAgent.indexOf('msie') >= 0 || this.UserAgent.indexOf('trident') >= 0 || this.UserAgent.indexOf('edge/') >= 0);
    };

    this.IsEdge = (): boolean => {
        return this.UserAgent.indexOf('edge/') >= 0;
    };

    this.IsChrome = (): boolean => {
        let result: boolean = false;
        if (!this.IsIE()) {
            result = this.UserAgent.indexOf('chrome/') >= 0;
        }
        return result;
    };

    this.IsSafari = (): boolean => {
        let result: boolean = false;
        if (!this.IsIE()) {
            if (!this.IsChrome()) {
                result = this.UserAgent.indexOf('safari/') >= 0;
            }
        }
        return result;
    };

    this.IsiPhone = (): boolean => {
        return this.UserAgent.indexOf('iphone') >= 0;
    };

    this.IsiPod = (): boolean => {
        return this.UserAgent.indexOf('ipod') >= 0;
    };

    this.IsiPad = (): boolean => {
        return this.UserAgent.indexOf('ipad') >= 0;
    };

    this.IsiOS = (): boolean => {
        return (this.IsiPhone() || this.IsiPod() || this.IsiPad());
    };

    this.IsAndroid = (): boolean => {
        return this.UserAgent.indexOf('android') >= 0;
    };

    this.IsPhone = (): boolean => {
        return (this.IsiOS() || this.IsAndroid());
    };

    this.IsTablet = (): boolean => {
        return (this.IsiPad() || (this.IsAndroid() && this.UserAgent.indexOf('mobile') < 0));
    };

    this.Version = (): number => {
        let result: number = 0;
        if (this.IsIE()) {
            let verArray = /(msie|rv:?)\s?([0-9]{1,})([\.0-9]{1,})/.exec(this.UserAgent);
            if (verArray) {
                result = parseInt(verArray[2], 10);
            }
        } else if (this.IsiOS()) {
            let verArray = /(os)\s([0-9]{1,})([\_0-9]{1,})/.exec(this.UserAgent);
            if (verArray) {
                result = parseInt(verArray[2], 10);
            }
        } else if (this.IsAndroid()) {
            let verArray = /(android)\s([0-9]{1,})([\.0-9]{1,})/.exec(this.UserAgent);
            if (verArray) {
                result = parseInt(verArray[2], 10);
            }
        }
        return result;
    };

    this.UserAgent = window.navigator.userAgent.toLowerCase();

}]);

Services.service("CollectionService", [function () {

    this.Get = (model: any, param: any, callback: (data: any) => void, error: (code: number, message: string) => void): void => {
        let instance = new model();
        instance.$get(param, (result: any) => {
            if (result) {
                if (result.code == 0) {
                    callback(result.value);
                } else {
                    error(result.code, result.message);
                }
            } else {
                error(10000, "network error");
            }
        });
    };

    this.List = (resource: any, query: any, option: any, success: (value: any) => void, error: (code: number, message: string) => void): void => {
        resource.query({
            query: encodeURIComponent(JSON.stringify(query)),
            option: encodeURIComponent(JSON.stringify(option))
        }, (data: any): void => {
            if (data) {
                if (data.code === 0) {
                    success(data.value);
                } else {
                    error(data.code, data.message);
                }
            } else {
                error(data.code, data.message);
            }
        });
    };

    this.Count = (resource: any, query: any, success: (value: any) => void, error: (code: number, message: string) => void): void => {
        resource.get({
            query: encodeURIComponent(JSON.stringify(query))
        }, (data: any): void => {
            if (data) {
                if (data.code === 0) {
                    success(data.value);
                } else {
                    error(data.code, data.message);
                }
            } else {
                error(data.code, data.message);
            }
        });
    };

}]);

Services.service("SessionService", ['Session', function (Session: any): void {

    this.Get = (callback: (result: any) => void, error: (code: number, message: string) => void): void => {
        Session.get({}, (result: any): void => {
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

    this.Put = (content: any, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
        let self = new Session();
        self.data = content;
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

Services.service("GuidanceService", ['Session', function (Session) {

}]);

Services.directive("compareTo", (): any => {
    return {
        require: "ngModel",
        scope: {
            otherModelValue: "=compareTo"
        },
        link: (scope: any, element: any, attributes: any, ngModel: any): void => {

            ngModel.$validators.compareTo = (modelValue: any): any => {
                return modelValue === scope.otherModelValue;
            };

            scope.$watch("otherModelValue", (): void => {
                ngModel.$validate();
            });
        }
    };
});

Services.directive("guidance", ['$compile', '$parse',
    ($compile: any, $parse: any): any => {
        return (scope: any, element: any, attrs: any): void => {
            let scenario = $parse(attrs.scenario)(scope);

            let result = '<section>';
            _.forEach(scenario, (act: any, index: number): void => {

                let target = act.outer.target;

                let target_element = document.getElementById(target);
                if (target_element) {

                    let rect = target_element.getBoundingClientRect();
                    let position_x = rect.left + window.pageXOffset;
                    let position_y = rect.top + window.pageYOffset;

                    let padding_x = Math.round(act.outer.width / 8);
                    let padding_y = Math.round(act.outer.height / 8);

                    let top = act.outer.top + position_y;
                    let left = act.outer.left + position_x;

                    result +=
                        '<div ng-show="step == ' + index + '">' +
                        '<div style="position:absolute;z-index:10000;top:' + top + 'px' + ';left:' + left + 'px' + ';' + act.style + '" class="' + act._class + '">' +
                        '<div style="position:absolute;top:' + act.inner.top + 'px' + ';left:' + act.inner.left + 'px' + ';width:' + act.inner.width + 'px' + ';height:' + act.inner.height + 'px' + ';word-wrap: break-word;padding:' + padding_x + 'px' + ' ' + padding_y + 'px' + ';">' + act.inner.content + '</div>' +
                        '<img src="' + act.outer.background + '" style="object-fit:fill;width:' + act.outer.width + 'px' + ';height:' + act.outer.height + 'px' + ';"/>' +
                        '</div>' +
                        '</div>';
                }
            });
            result += '</section>';

            element.append(result);
            $compile(element.contents())(scope);
        }
    }
]);

Services.directive('draggablepane', ['$document', ($document: any): any => {
    return {
        restrict: 'A',
        link: (scope: any, element: any, attribute: any): void => {

            let style = element[0].style;
            if (style) {
                let name: string;

                element.css({position: 'fixed'});

                name = attribute.draggablepane;

                if (name) {
                    let start_x: number;
                    let start_y: number;
                    let clicked_x: number;
                    let clicked_y: number;
                    let location_x: string;
                    let location_y: string;

                    let left = localStorage.getItem(name + '_left');
                    if (left) {
                        location_x = left;
                    } else {
                        location_x = element[0].style.left;
                    }

                    let top = localStorage.getItem(name + '_top');
                    if (top) {
                        location_y = top;
                    } else {
                        location_y = element[0].style.top;
                    }

                    element.css({
                        width: element[0].style.width,
                        height: element[0].style.height,
                        top: location_y,
                        left: location_x
                    });

                    element.bind('mousedown', ($event: any): boolean => {
                        let result = false;

                        start_x = element.prop('offsetLeft');
                        start_y = element.prop('offsetTop');
                        clicked_x = $event.clientX;
                        clicked_y = $event.clientY;

                        let handle_y = clicked_y - start_y;
                        if (handle_y < 30) {
                            $document.bind('mousemove', mousemove);
                            $document.bind('mouseup', mouseup);
                        } else {
                            result = true;
                        }
                        return result;
                    });

                    let mousemove: ($event: any) => boolean = ($event: any): boolean => {

                        let target = angular.element("#draggable_area");

                        if (target) {
                            let target_x_min = target[0].offsetLeft;
                            let target_y_min = target[0].offsetTop;
                            let target_width = target[0].offsetWidth;
                            let target_height = target[0].offsetHeight;
                            let target_x_max = target_x_min + target_width;
                            let target_y_max = target_y_min + target_height;


                            let delta_x: number = $event.clientX - clicked_x;
                            let delta_y: number = $event.clientY - clicked_y;
                            let position_x = start_x + delta_x;
                            let position_y = start_y + delta_y;

                            if (position_x < target_x_min) {
                                position_x = target_x_min;
                            }
                            if (position_y < target_y_min) {
                                position_y = target_y_min;
                            }

                            if (position_x > target_x_max) {
                                position_x = target_x_max;
                            }
                            if (position_y > target_y_max) {
                                position_y = target_y_max;
                            }

                            location_x = position_x + "px";
                            location_y = position_y + "px";
                        }

                        element.css({
                            top: location_y,
                            left: location_x
                        });

                        return false;
                    };

                    let mouseup: () => void = (): void => {

                        if (('localStorage' in window) && (window.localStorage !== null)) {
                            localStorage.setItem(name + '_left', location_x);
                            localStorage.setItem(name + '_top', location_y);
                        }

                        $document.unbind('mousemove', mousemove);
                        $document.unbind('mouseup', mouseup);
                    }

                }
            }
        }
    };
}]);

Services.filter('length', [(): any => {
    return (s: string, limit: number): string => {
        let result = s;
            if (s) {
                if (s.length > limit) {
                    result = s.slice(0, limit) + "...";
                }
            }
        return result;
    };
}]);