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
 * @file A collection of simple server-side logging functions.  The logging is toggled by the DEBUG environment
 * variable since the standard 'debug' module is used.
 *
 * If the generic parameter object contains an 'extra' property then the value of that property will be logged in
 * its entirety as a separate log line.
 *
 * The log-levels can be configured via npm start, and different log-level examples are found in package.json.
 *
 * @author Dave Braines
 **/

const i18next = require("i18next");
const settings = require('../settings');
const mod_debug = require('debug')('cogni-sketch:debug');
const mod_warn = require('debug')('cogni-sketch:warn');
const mod_error = require('debug')('cogni-sketch:error');

/**
 * Log the specified debug message if the log-level allows, using a specified key and optional parameters for
 * internationalization.
 * .
 * @param {string} msgKey       The internationalization key that identifies the message text.
 * @param {object} [params]     An optional set of parameters that can be included in the message text.
 * @return {string}             The extracted and substituted message text.
 */
function debug(msgKey, params) {
    let msgText;

    if (settings.debug) {
        msgText = localize(msgKey, params);

        // If 'extra' data is included in the parameters then it will added to the log line
        if (params && params.extra) {
            mod_debug(msgText, '-', params.extra);
        } else {
            mod_debug(msgText);
        }

    }

    return msgText;
}

/**
 * Log the specified error message if the log-level allows, using a specified key and optional parameters for
 * internationalization.
 * .
 * @param {string} msgKey       The internationalization key that identifies the message text.
 * @param {object} [params]     An optional set of parameters that can be included in the message text.
 * @param {object} [err]        An optional error object that will be logged as a separate line if present.
 * @return {string}             The extracted and substituted message text.
 */
function error(msgKey, params, err) {
    let msgText = localize(msgKey, params);

    console.error(msgText);

    // If 'extra' data is included in the parameters then it will be logged as a pure object
    if (params && params.extra) {
        console.error(params.extra);
    }

    if (err) {
        console.error(err);
    }

    return msgText;
}

/**
 * Log the specified warning message if the log-level allows, using a specified key and optional parameters for
 * internationalization.
 * .
 * @param {string} msgKey       The internationalization key that identifies the message text.
 * @param {object} [params]     An optional set of parameters that can be included in the message text.
 * @return {string}             The extracted and substituted message text.
 */
function warn(msgKey, params) {
    let msgText = localize(msgKey, params);

    mod_warn(msgText);

    // If 'extra' data is included in the parameters then it will be logged as a pure object
    if (params && params.extra) {
        mod_warn(params.extra);
    }

    return msgText;
}

/**
 * Perform the localization function, using the specified key and any parameters.
 *
 * @param {string} msgKey       The internationalization key that identifies the message text.
 * @param {object} [params]     An optional set of parameters that can be included in the message text.
 * @return {string}             The extracted and substituted message text.
 */
function localize(msgKey, params) {
    return i18next.t(msgKey, params || {});
}

/** Module exports */
module.exports = Object.freeze({
    "debug": debug,
    "error": error,
    "warn": warn,
    "localize": localize
});
