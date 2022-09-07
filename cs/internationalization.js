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
 * @file A small wrapper for internationalization provided by the i18next library.
 *
 * @author Dave Braines
 **/

const settings = require('../settings');
const log = require('./log');
const path = require('path');
const i18next = require('i18next');
const backend = require('i18next-fs-backend');

/**
 * Initialise the server-side internationalization library, and continue with the server side startup by executing
 * the specified callback function once initialisation is completed.
 *
 * If an error is encountered during initialisation a hardcoded error message will be reported in English, and the
 * server-side startup will continue (by executing the callback function).
 *
 * @param {string} localeName   The name of the locale to be used.
 * @param {function} cbFunc     The function to be executed when initialisation is completed.
 */
function initialize(localeName, cbFunc) {
    let filePath = path.join(__dirname, '..', 'locales', localeName, 'cs_server.json');

    i18next
        .use(backend)
        .init({
            "debug": settings.debug,
            "backend": {
                "loadPath": filePath
            }
        }).then(function () {
            if (cbFunc) {
                cbFunc();
            }
        });

    i18next.on('failedLoading', function (lng, ns, msg) {
        // This message is hardcoded as the internationalization failed to load.
        console.error(`Failed to load locale text: language='${lng}', namespace='${ns}'`);
        console.error(msg);
    })
    i18next.on('loaded', function () {
        log.debug('messages.general.internationalization_loaded');
    });
}

/** Module exports */
module.exports = Object.freeze({
    "initialize": initialize
});
