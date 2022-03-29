/**
 * MIT License
 *
 * Copyright (c) 2022 International Business Machines
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
 * Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 * WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
 * OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

/**
 * @file A Small collection of functions to manage the starting and reporting of a server.
 *
 * @author Dave Braines
 **/

const cs = require('../cs/cs')(performServerStart); // The method is called when initialisation is complete.
const app = require('../app');
const http = require('http');

let port;

/**
 * Store the port on which the server will be started.  This function does not start the server, but the require
 * of the 'cs' module above initialises the internationalization package and once the language libraries are loaded
 * the specified method will be run as a callback which actually starts the server.
 *
 * @param {number} p    The port on which to start the server
 */
function start(p) {
    port = p;
}

/**
 * Start the server on the previously specified port.
 */
function performServerStart() {
    let thisApp = app.startApp();

    thisApp.set('port', port);

    let server = http.createServer(thisApp);

    server.listen(port);
    server.on('error', onError);
    server.on('listening', function() { onListening(server); });
}

/**
 * Handle any server errors.
 *
 * @param {object} error     The express server error.
 */
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            cs.log.error(`${port} requires elevated privileges`);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            cs.log.error(`${port} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Handle the onListening event after the server is started.
 *
 * @param {object} server   The express server that has been started.
 */
function onListening(server) {
    const address = server.address();

    if (address && address.port) {
        cs.log.debug('messages.general.server_listening', { "port": address.port });
    }
}

/** Module exports */
module.exports = Object.freeze({
    "start": start
});
