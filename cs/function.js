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
 * @file A collection of server-side functions relating to the processing of palette functions.
 *
 * @author Dave Braines
 **/

const fs = require('fs-extra');
const path = require('path');
const settings = require('../settings');
const csp = require('./cs_private');
const log = require('./log');

const FUNC_FN = path.join(csp.getRootPath(), 'data', 'functions', 'functions.json');

/**
 * List all of the active functions on this server, by reading the global functions file.
 *
 * @return {object}     The list of all active functions.
 */
function listFunctions() {
    let fc;
    let funcObj;

    try {
        fc = fs.readFileSync(FUNC_FN, settings.codepage);

        try {
            funcObj = JSON.parse(fc);
        } catch (e) {
            log.error('messages.function.parse_error', { "fileName": FUNC_FN }, e);
        }
    } catch (e) {
        log.error('messages.function.read_error', { "fileName": FUNC_FN }, e);
    }

    return funcObj;
}

/** Module exports */
module.exports = Object.freeze({
    "listAll": listFunctions
});
