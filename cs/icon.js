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
 * @file A collection of server-side functions relating to the processing of icon files.
 *
 * @author Dave Braines
 **/

const fs = require('fs-extra');
const path = require('path');
const csp = require('./cs_private');

const ICON_FN = path.join(csp.getRootPath(), 'public', 'images', 'palette');

//TODO: Look in plugin image folders for icons too...

/**
 * List all of the (short, not fully qualified) icon file names for all icons in the shared icon folder on this server.
 *
 * @return {string[]}       The list of all icon file names.
 */
function listIcons() {
    const iList = fs.readdirSync(ICON_FN);
    let result = [];

    for (let fn of iList) {
        const fullFileName = path.join(ICON_FN, fn);
        const stat = fs.statSync(fullFileName);

        if (stat && stat.isDirectory()) {
            //TODO: Handle sub-folders when needed
        } else {
            if (!csp.isExcluded(fn)) {
                result.push(fn);
            }
        }
    }

    return result;
}

/** Module exports */
module.exports = Object.freeze({
    "listIcons": listIcons
});
