/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

// Socket.IO
var socketio = require('socket.io');

function sio(server) {

    var sio = socketio.listen(server);
    //sio.set('transports', ['websocket']);
    sio.sockets.on('connection', (socket) => {
        socket.on('server', (data) => {
            socket.broadcast.emit('client', {
                value: data.value
            });
        });

        socket.on("disconnect", () => {
        });
    });

}

module.exports = sio;
