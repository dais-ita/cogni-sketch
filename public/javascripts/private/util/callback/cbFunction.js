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
 * @file Functions providing registration and access points for the user defined application functions.
 *
 * @author Dave Braines
 **/

import {
    getFirstCallbackFrom,
    listCallbacksFor,
    registerCallback
} from "./callback.js";

const CB_TYPE = 'function';

const CB_ID_EC = 'canvasExecute';
const CB_ID_EN = 'nodeExecute';

export function registerCanvasExecuteCallback(componentId, cbFunc) {
    registerCallback(CB_TYPE, CB_ID_EC, componentId, cbFunc);
}

export function listCanvasExecuteCallbacksFor(key) {
    return listCallbacksFor(CB_TYPE, CB_ID_EC, key);
}

export function firstCanvasExecuteCallbackFor(key) {
    return getFirstCallbackFrom(CB_TYPE, listCanvasExecuteCallbacksFor(key), key);
}

export function registerNodeExecuteCallback(componentId, cbFunc) {
    registerCallback(CB_TYPE, CB_ID_EN, componentId, cbFunc);
}

export function listNodeExecuteCallbacksFor(key) {
    return listCallbacksFor(CB_TYPE, CB_ID_EN, key);
}

export function firstNodeExecuteCallbackFor(key) {
    return getFirstCallbackFrom(CB_TYPE, listNodeExecuteCallbacksFor(key), key);
}
