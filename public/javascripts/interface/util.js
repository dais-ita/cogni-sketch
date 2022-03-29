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
 * @file Public interface functions with various useful utility functions.
 * All methods are simple proxies to relevant private functions.
 *
 * @author Dave Braines
 **/

import {stripHtml as doStripHtml} from "/javascripts/private/util/misc.js";
import {
    delayFunction as doDelayFunction,
    executeFunctionAfterDelay as doExecuteFunctionAfterDelay,
    formatDateTime as doFormatDateTime,
    timeHhMm as doTimeHhMm,
    timeHhMmSs as doTimeHhMmSs
} from "/javascripts/private/util/timing.js";
import {reportFunctionExecution, reportStats} from "/javascripts/private/ui/ui.js";

/**
 * Strip any html markup from the specified text, returning any text within that html.
 *
 * @param {string} originalText     the html text to be processed.
 * @returns {string}                the inner text after stripping of html markup.
 */
export function stripHtml(originalText) {
    return doStripHtml(originalText);
}

/**
 * Report the start of execution for the specified function name, using the status area.
 *
 * @param {string} funcName     the name of the function to be shown.
 */
export function reportFunctionExecutionStart(funcName) {
    reportFunctionExecution(funcName);
}

/**
 * Report the end of function execution, using the status area.
 */
export function reportFunctionExecutionEnd() {
    reportStats();
}

/**
 * Wrap the specified function in a delay, returning a wrapper function that can be executed at any subsequent
 * point.  This wrapped function will then pause for the specified number of milliseconds before executing the
 * wrapped function.
 *
 * @param {function} cbFunction       the function to be wrapped and called after a delay.
 * @param {number} delayInMs            the delay (in milliseconds).
 * @returns {function(): void}
 */
export function delayFunction(cbFunction, delayInMs) {
    return doDelayFunction(cbFunction, delayInMs);
}

/**
 * Execute the specified function after the specified delay.  Since the function is executed asynchronously, nothing
 * is returned from this function.
 *
 * @param {function} cbFunction     the function to be executed.
 * @param {number} delayInMs        the delay (in milliseconds).
 */
export function executeFunctionAfterDelay(cbFunction, delayInMs) {
    doExecuteFunctionAfterDelay(cbFunction, delayInMs)
}

/**
 * Format the specified date instance, to dd-MMM-yyyy HH:MM:SS
 *
 * @param {Date} dt     the date instance to be formatted.
 * @returns {string}    the formatted date string.
 */
export function formatDateTime(dt) {
    return doFormatDateTime(dt);
}

/**
 * Format the current time, as HH:MM
 *
 * @returns {string}    the formatted date string.
 */
export function timeHhMm() {
    return doTimeHhMm();
}

/**
 * Format the current time, as HH:MM:SS
 *
 * @returns {string}    the formatted date string.
 */
export function timeHhMmSs() {
    return doTimeHhMmSs();
}
