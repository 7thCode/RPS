/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

let BackOfficeControllers: angular.IModule = angular.module('BackOfficeControllers', []);

BackOfficeControllers.controller('BackOfficeController', ['$scope', '$document','LocationService','Socket',
    ($scope: any, $document: any, LocationService:any, Socket:any): void => {

        let map;

        /*
        LocationService.Get((location) => {
            if (location.coords) {

                let map_element = document.getElementById('map');
                if (map_element) {
                    map = new google.maps.Map(map_element, {
                        center: {lat: location.coords.latitude, lng: location.coords.longitude},
                        scrollwheel: false,
                        zoom: 18
                    });

                    let marker = new google.maps.Marker({
                        map: map,
                        position: {lat: location.coords.latitude, lng: location.coords.longitude}
                    });
                }

                $scope.$evalAsync(   // $apply
                    function ($scope) {
                        $scope.accuracy = location.coords.accuracy;
                        $scope.altitude = location.coords.altitude;
                        $scope.altitudeAccuracy = location.coords.altitudeAccuracy;
                        $scope.heading = location.coords.heading;
                        $scope.latitude = location.coords.latitude;
                        $scope.longitude = location.coords.longitude;
                        $scope.speed = location.coords.speed;
                    }
                );

            }
        }, (error) => {
            $scope.message = error.message;
        });
        */

        $scope.Notify = (message: any): void => {
            Socket.emit("server", {value: message}, (): void => {
                let hoge = 1;
            });
        };

        Socket.on("client", (data: any): void => {
            let notifier = new NotifierModule.Notifier();
            notifier.Pass(data);
        });

        $scope.update_site = (message: string): void => {
            Socket.emit("server", {value: message}, (): void => {

            });
        };

        $document.on('drop dragover', (e: any): void => {
            e.stopPropagation();
            e.preventDefault();
        });

        let progress = (value) => {
            $scope.$emit('progress', value);
        };

        $scope.$on('progress', (event, value) => {
            $scope.progress = value;
        });

    }]);