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
 * @file Utility function relating to time-related functions, both for delayed execution of functions and formatting
 * and conversions of date/time values.
 *
 * @author Dave Braines
 */

const MONTHS = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];

/**
 * Wrap the specified function in a delay, returning a wrapper function that can be executed at any subsequent
 * point.  This wrapped function will then pause for the specified number of milliseconds before executing the
 * wrapped function.
 *
 * @param {function} cbFunction - the function to be wrapped and called after a delay.
 * @param {number} delayInMs - the delay (in milliseconds).
 * @returns {function(): void}
 */
export function delayFunction(cbFunction, delayInMs) {
    let timer = 0;

    return function() {
        let t = this;
        let a = arguments;

        clearTimeout(timer);

        timer = setTimeout(function () {
            cbFunction.apply(t, a);
        }, delayInMs || 0);
    };
}

/**
 * Execute the specified function after the specified delay.  Since the function is executed asynchronously, nothing
 * is returned from this function.
 *
 * @param {function} cbFunction - the function to be executed.
 * @param {number} delayInMs - the delay (in milliseconds).
 */
export function executeFunctionAfterDelay(cbFunction, delayInMs) {
    let delayedFunction = delayFunction(cbFunction, delayInMs);

    delayedFunction();
}

/**
 * Format the specified date instance, to dd-MMM-yyyy HH:MM:SS
 *
 * @param {Date} dt - the date instance to be formatted.
 * @param {boolean} [clever] - suppress the date part if the day is today
 * @returns {string}
 */
export function formatDateTime(dt, clever) {
    let result;

    if (clever) {
        if (isToday(dt)) {
            // just use the time part as the date is today
            result = ('0' + dt.getUTCHours()).slice(-2) + ':' +
                ('0' + dt.getUTCMinutes()).slice(-2) + ':' +
                ('0' + dt.getUTCSeconds()).slice(-2);
        }
    }

    if (!result) {
        // use the whole date
        result = ('0' + dt.getUTCDate()).slice(-2) + '-' +
            monthName(dt) +  '-' +
            dt.getUTCFullYear() + ' ' +
            ('0' + dt.getUTCHours()).slice(-2) + ':' +
            ('0' + dt.getUTCMinutes()).slice(-2) + ':' +
            ('0' + dt.getUTCSeconds()).slice(-2);
    }

    return result;
}

function isToday(dt) {
    return dt.getUTCDate() === new Date().getUTCDate();
}

/**
 * Format the current time, as HH:MM
 *
 * @returns {string}
 */
export function timeHhMm() {
    let dt = new Date();
    let hh = dt.getHours();
    let mm = dt.getMinutes();

    if (hh < 10) {
        hh = '0' + hh;
    }

    if (mm < 10) {
        mm = '0' + mm;
    }

    return hh + ':' + mm;
}

/**
 * Format the current time, as HH:MM:SS
 *
 * @returns {string}
 */
export function timeHhMmSs() {
    let dt = new Date();
    let ss = dt.getSeconds();

    if (ss < 10) {
        ss = '0' + ss;
    }

    return timeHhMm() + ':' + ss;
}

/**
 * Converted the specified date string into a different format.
 * The format of the input dateText should be format should be 'dd-MMM-yyyy', e.g. 3-Feb-2020.
 * The format of the response is 'yyyy-mm-dd', e.g. 2020-02-03
 *
 * @param {string} dateText - the formatted string to be converted.
 * @returns {string}
 */
export function convertDate(dateText) {
    let parts = dateText.split('-');
    let result;

    if (parts.length === 3) {
        let monthNum = getMonthNum(parts[1]);

        if (monthNum) {
            result = parts[2] + '-' + monthNum + '-' + parts[0];
        }
    }

    return result;
}

/**
 * Return the month name for the specified date.
 *
 * @param {Date} dt - the date to be used.
 * @returns {string}
 */
function monthName(dt) {
    return MONTHS[dt.getUTCMonth()];
}

/**
 * Return the formatted month number for the specified date, i.e. MM
 *
 * @param {string} monthName - the name of the month to be converted.
 * @returns {string}
 */
 function getMonthNum(monthName) {
    let monthNum = (MONTHS.indexOf(monthName) + 1).toString();

    if (monthNum.length === 1) {
        monthNum = '0' + monthNum;
    }

    return monthNum;
}
