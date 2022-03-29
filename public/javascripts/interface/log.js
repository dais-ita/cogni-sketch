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
 * @file Public interface functions relating to logging.
 * All methods are simple proxies to relevant private functions.
 *
 * @author Dave Braines
 **/

import {
    debug as doDebug,
    error as doError,
    show as doShow,
    showToast as doShowToast,
    userConfirm as doUserConfirm,
    userMessage as doUserMessage,
    userPrompt as doUserPrompt,
    warn as doWarn
} from "/javascripts/private/util/log.js";

/**
 * Log the specified message as a debug (not alerted to the user).
 * The message will only be logged if in debug mode.
 *
 * @param {string} msg          the message to be reported.
 * @param {object} [object]     any additional material to be reported.
 */
export function debug(msg, object) {
    doDebug(msg, object);
}

/**
 * Log the specified message as a warning (not alerted to the user unless specified).
 *
 * @param {string} msg                  the message to be reported.
 * @param {object} [object]             any additional material to be reported.
 * @param {boolean} [tellUser=false]    whether to also notify the user.
 */
export function warn(msg, object, tellUser) {
    doWarn(msg, object, tellUser);
}

/**
 * Log the specified message as an error (not alerted to the user unless specified).
 *
 * @param {string} msg                  the message to be reported.
 * @param {Event} [e]                   the optional error object to be reported.
 * @param {object} [object]             any additional material to be reported.
 * @param {boolean} [tellUser=false]    whether to also notify the user.
 */
export function error(msg, e, object, tellUser) {
    doError(msg, e, object, tellUser);
}

/**
 * Log the specified message (not alerted to the user).
 *
 * @param {string} msg          the message to be reported.
 * @param {object} [object]     any additional material to be reported.
 */
export function show(msg, object) {
    doShow(msg, object);
}

/**
 * Show the specified message to the user as an alert.
 *
 * @param {string} msg      the message to be alerted.
 */
export function userMessage(msg) {
   doUserMessage(msg);
}

/**
 * Show the specified message to the user as a prompt, returning the response.
 *
 * @param {string} msg              the message to be reported.
 * @param {string} [defaultText]    the default value to be put into the prompt field.
 * @returns {string|null}           the value specified by the user.
 */
export function userPrompt(msg, defaultText) {
    return doUserPrompt(msg, defaultText);
}

/**
 * Show the specified message to the user as a confirm question, returning the response.
 *
 * @param {string} msg          the message to be reported.
 * @returns {boolean}           true if the user confirmed, otherwise false.
 */
export function userConfirm(msg) {
    return doUserConfirm(msg);
}

/**
 * Show the specified message to the user as a toast (a UI element that shows the message and then fades away).
 * A maximum of two toasts can be shown at any one time.
 *
 * @param {string} msg          the message to be reported
 */
export function showToast(msg) {
    doShowToast(msg);
}
