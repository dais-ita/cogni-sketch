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
 * @file Functions relating to logging of debug, warning and error information as well as alerts and
 * prompts for the users.
 *
 * @author Dave Braines
 **/

import {getSessionDebug} from "/javascripts/private/csData/csDataSession.js";
import {localize} from "/javascripts/private/util/internationalization.js";

const TAG_EVENT = 'event';
const TAG_CALLBACK = 'callback';

/**
 * Log the specified message as a debug (not alerted to the user).  This will only be logged if in debug mode.
 *
 * @param {string} msg          the message to be reported.
 * @param {object} [object]     any additional material to be reported.
 */
export function debug(msg, object) {
    if (getSessionDebug()) {
        console.log(msg);

        if (object) {
            console.log(object);
        }
    }
}

/**
 * Convenience function to allow logging of a general event.
 *
 * @param {string} name     the name to be reported
 */
export function debugEvent(name) {
    debug(name + ' (' + TAG_EVENT + ')');
}

/**
 * Convenience function to allow logging of a callback function.
 *
 * @param {string} type     the name of the type/component that is reporting this event
 * @param {string} method   the name of the method
 */
export function debugCallback(type, method) {
    debug(type + '.' + TAG_CALLBACK + '.' + method);
}

/**
 * Convenience function to allow reporting of code that is not yet implemented.
 *
 * @param {string} type             the name of the type/component that is reporting this issue
 * @param {string} method           the name of the method
 * @param {string} [userMessage]    an optional message to be shown to the user
 */
export function notYetImplemented(type, method, userMessage) {
    warn(`${localize('messages.log.not_yet_implemented')}: ${type}.${method}`);

    if (userMessage) {
        showToast(userMessage);
    }
}

/**
 * Log the specified message as a warning (not alerted to the user).
 *
 * @param {string} msg                  the message to be reported.
 * @param {object} [object]             any additional material to be reported.
 * @param {boolean} [tellUser=false]    whether to also notify the user
 */
export function warn(msg, object, tellUser) {
    console.warn(msg);

    if (object) {
        console.log(object);
    }

    if (tellUser) {
        showToast(msg);
    }
}

/**
 * Log the specified message as an error (not alerted to the user).
 *
 * @param {string} msg                  the message to be reported.
 * @param {Event} [error]               the optional error object to be reported.
 * @param {object} [details]            any additional material to be reported.
 * @param {boolean} [tellUser=false]    whether to also notify the user
 */
export function error(msg, error, details, tellUser) {
    console.error(msg);

    if (error) {
        console.error(error);
    }

    if (details) {
        console.error(details);
    }

    if (tellUser) {
        showToast(msg);
    }
}

/**
 * Log the specified message (not alerted to the user).
 *
 * @param {string} msg          the message to be reported.
 * @param {object} [object]     any additional material to be reported.
 */
export function show(msg, object) {
    console.log(msg);

    if (object) {
        console.log(object);
    }
}

/**
 * Show the specified message to the user as an alert.
 *
 * @param {string} msg  the message to be reported.
 */
export function userMessage(msg) {
    alert(msg);
}

/**
 * Show the specified message to the user as a prompt, returning the response.
 *
 * @param {string} msg              the message to be reported
 * @param {string} [defaultText]    the default value to be put into the prompt field
 * @returns {string}                the value specified by the user
 */
export function userPrompt(msg, defaultText) {
    return prompt(msg, defaultText);
}

/**
 * Show the specified message to the user as a confirm question, returning the response.
 *
 * @param {string} msg      the message to be reported
 * @returns {boolean}       whether the user confirmed the prompt
 */
export function userConfirm(msg) {
    return confirm(msg);
}

/**
 * Show the specified message to the user as a toast (a UI element that shows the message and then fades away).
 * A maximum of two toasts can be shown at any one time.
 *
 * @param {string} msg  the message to be reported
 */
export function showToast(msg) {
    if (msg) {
        if (isShowing(1)) {
            showSpecificToast(2, msg);
        } else {
            showSpecificToast(1, msg);
        }
    }
}

/**
 * Returns true if the specified toast number is showing.  Allows the use of a small number of toasts to be used
 * to handle multiple concurrent messages.
 *
 * @param {number} toastNum     the toast number to be tested
 * @returns {boolean}           returns true if the specified toast is still visible
 */
function isShowing(toastNum) {
    return $('#cs-toast-' + toastNum).attr('class').indexOf('showing') > -1;
}

/**
 * Show a toast based on the specified toastNum, containing the specified message.  A small number of toasts can be
 * displayed concurrently to handle multiple concurrent messages.
 *
 * @param {number} toastNum     the toast number to be shown
 * @param {string} msg          the message to be shown
 */
function showSpecificToast(toastNum, msg) {
    let eMsg = $('#cs-toast-message-' + toastNum);
    let eToast = $('#cs-toast-' + toastNum);

    eMsg.html(msg);
    eToast.addClass('cs-toast');   /* Bring the z-order forward */
    eToast.toast('show');
}

/**
 * A useful function at design/development time to show the memory usage of the environment.
 */
export function reportMemoryUsage() {
    if (getSessionDebug()) {
        show('all done');

        if (performance && performance.memory) {
            let perfMem = /** @type {csMemory} */ performance.memory;
            show(`jsHeapSizeLimit (MB): ${parseInt((perfMem.jsHeapSizeLimit/(1024*1024)).toString())}`);
            show(`totalJSHeapSize (MB): ${parseInt((perfMem.totalJSHeapSize/(1024*1024)).toString())}`);
            show(`usedJSHeapSize (MB): ${parseInt((perfMem.usedJSHeapSize/(1024*1024)).toString())}`);
        }
    }
}
