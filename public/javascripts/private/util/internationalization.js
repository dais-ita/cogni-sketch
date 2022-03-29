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
 * @file Functions wrapping the i18next module that is used for internationalization support.
 *
 * @author Dave Braines
 **/

//TODO: Handle language switching

/**
 * Initialise the i18next internationalisation library, enabling text throughout the application to be easily
 * internationalised.
 *
 * @param {function} cb             the callback function to be called when initialisation is complete.
 * @param {boolean} [debug=false]   whether to open i18next in debug mode.
 */
export function initialise(cb, debug) {
    i18next
        .use(i18nextHttpBackend)
        .init({
            "debug": debug,
            "lng": 'en',
            "fallbackLng": 'en',
            "ns": [ 'cs_client'],
            "defaultNS": 'cs_client',
            "backend": {
                "loadPath": '/locales/{{lng}}/{{ns}}.json'
            }
        }, cb);
}

/**
 * Get the internationalised message text and substitute the supplied variable parameters.
 *
 * @param {string} key          the key for the message.
 * @param {object} [params]     the list of key/value parameters to substitute.
 * @return {string}             the internationalised message text with parameters processed.
 */
export function localize(key, params) {
    return i18next.t(key, params || {});
}
