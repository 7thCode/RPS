/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

let GoogleServices = angular.module('GoogleServices', []);

GoogleServices.service("LocationService", [function () {

    let id, target, options;

    this.Get = (callback: (results: any) => void, error: (error) => void): void => {

        target = {
            latitude: 0,
            longitude: 0,
        };

        options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        };

        if (navigator.geolocation) {
            id = navigator.geolocation.watchPosition(callback, error, options);
        } else {
            error({code: 1, message: "There is no GPS."});
        }
    }

}]);

