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
 * @file A collection of server-side functions useful for routes and other server-side processing.
 * This file creates a composite export which integrates the other server-side files into useful groupings.
 * This file must be required with an additional parameter, either the callback function to be called after
 * internationalization initialisation is complete, or an empty parameter set, e.g.:
 *      const cs = require('../cs/cs')(func);
 * or
 *      const cs = require('../cs/cs')();
 *
 * @author Dave Braines
 **/

const settings = require('../settings');
const mod_file = require('./file');
const mod_function = require('./function');
const mod_icon = require('./icon');
const mod_int = require('./internationalization');
const mod_log = require('./log');
const mod_palette = require('./palette');
const mod_project = require('./project');
const response = require('./response');
const mod_security = require('./security');

/**
 * Compute the page title.  If this is not a live environment then the environment name will be prepended to the
 * pageTitle, both are extracted from settings.js.
 *
 * @return {string}     The browser page title.
 */
function pageTitle() {
    let title;

    if ((settings.environment) && (settings.environment !== 'live')) {
        title = `${settings.environment} - ${settings.pageTitle}`;
    } else {
        title = settings.pageTitle;
    }

    return title;
}

/** Module exports */
module.exports = function(cbFunc) {
    // If a callback function is specified then execute the internationalization initialisation, passing the function
    // so that is can be executed upon completion.
    if (cbFunc) {
        mod_int.initialize(settings.locale, cbFunc);
    }

    return Object.freeze({
        "settings": settings,
        "log": mod_log,
        "pageTitle": pageTitle,
        "security": mod_security,
        "palette": mod_palette,
        "project": mod_project,
        "function": mod_function,
        "response": response,
        "file": mod_file,
        "icon": mod_icon
    });
};
