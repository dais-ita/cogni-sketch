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
 * @file Public interface functions enabling the registration of function callback functions.  These are executed
 * whenever a palette function is dropped onto the canvas or onto a node.
 * All methods are simple proxies to relevant private functions.
 *
 * @author Dave Braines
 **/

import {
    registerCanvasExecuteCallback as doRegisterCanvasExecuteCallback,
    registerNodeExecuteCallback as doRegisterNodeExecuteCallback
} from "/javascripts/private/util/callback/cbFunction.js";

/**
 * Register a callback for execution when a palette function that matches this name is dropped onto the canvas.
 *
 * @param {string} funcName         the name of the function against which this callback is registered
 * @param {function} cbFunction     the callback function to be executed when this event fires
 */
export function registerCanvasExecuteCallback(funcName, cbFunction) {
    doRegisterCanvasExecuteCallback(funcName, cbFunction);
}

/**
 * Register a callback for execution when a palette function that matches this name is dropped onto any node.
 *
 * @param {string} funcName         the name of the function against which this callback is registered
 * @param {function} cbFunction     the callback function to be executed when this event fires
 */
export function registerNodeExecuteCallback(funcName, cbFunction) {
    doRegisterNodeExecuteCallback(funcName, cbFunction);
}
