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
 * @file Functions providing registration and access points for the user defined application types.
 *
 * @author Dave Braines
 **/

import {
    getFirstCallbackFrom,
    listCallbacksFor,
    registerCallback
} from "./callback.js";

const CB_TYPE = 'type';

const CB_ID_NI = 'nodeIcon';
const CB_ID_LT = 'labelText';
const CB_ID_CH = 'canHandle';
const CB_ID_AE = 'addEmpty';
const CB_ID_AF = 'addFull';
const CB_ID_AS = 'addSpecial';
const CB_ID_AX = 'addExisting';
const CB_ID_STP = 'switchToPopulated';
const CB_ID_RF = 'refresh';

export function registerNodeIconCallback(componentId, cbFunc) {
    registerCallback(CB_TYPE, CB_ID_NI, componentId, cbFunc);
}

export function registerLabelTextCallback(componentId, cbFunc) {
    registerCallback(CB_TYPE, CB_ID_LT, componentId, cbFunc);
}

export function registerCanHandleCallback(componentId, cbFunc) {
    registerCallback(CB_TYPE, CB_ID_CH, componentId, cbFunc);
}

export function registerAddEmptyCallback(componentId, cbFunc) {
    registerCallback(CB_TYPE, CB_ID_AE, componentId, cbFunc);
}

export function registerAddFullCallback(componentId, cbFunc) {
    registerCallback(CB_TYPE, CB_ID_AF, componentId, cbFunc);
}

export function registerAddSpecialCallback(componentId, cbFunc) {
    registerCallback(CB_TYPE, CB_ID_AS, componentId, cbFunc);
}

export function registerAddExistingCallback(componentId, cbFunc) {
    registerCallback(CB_TYPE, CB_ID_AX, componentId, cbFunc);
}

export function registerSwitchToPopulatedCallback(componentId, cbFunc) {
    registerCallback(CB_TYPE, CB_ID_STP, componentId, cbFunc);
}

export function registerRefreshCallback(componentId, cbFunc) {
    registerCallback(CB_TYPE, CB_ID_RF, componentId, cbFunc);
}

export function registerStandardNodeCallbacks(componentId, cbFunc) {
    /* register all of the standard callbacks that occur when nodes are creating or refreshed */
    registerAddFullCallback(componentId, cbFunc);
    registerAddExistingCallback(componentId, cbFunc);
    registerSwitchToPopulatedCallback(componentId, cbFunc);
    registerRefreshCallback(componentId, cbFunc);
}

export function listAddEmptyCallbacksFor(key) {
    return listCallbacksFor(CB_TYPE, CB_ID_AE, key);
}

export function firstAddEmptyCallbackFor(key) {
    return getFirstCallbackFrom(CB_TYPE, listAddEmptyCallbacksFor(key), key);
}

export function listNodeIconCallbacksFor(key) {
    return listCallbacksFor(CB_TYPE, CB_ID_NI, key);
}

export function firstNodeIconCallbackFor(key) {
    return getFirstCallbackFrom(CB_TYPE, listNodeIconCallbacksFor(key), key);
}

export function listLabelTextCallbacksFor(key) {
    return listCallbacksFor(CB_TYPE, CB_ID_LT, key);
}

export function firstLabelTextCallbackFor(key) {
    return getFirstCallbackFrom(CB_TYPE, listLabelTextCallbacksFor(key), key);
}

export function listAddFullCallbacksFor(key) {
    return listCallbacksFor(CB_TYPE, CB_ID_AF, key);
}

export function firstAddFullCallbackFor(key) {
    return getFirstCallbackFrom(CB_TYPE, listAddFullCallbacksFor(key), key);
}

export function listAddSpecialCallbacksFor(key) {
    return listCallbacksFor(CB_TYPE, CB_ID_AS, key);
}

export function firstAddSpecialCallbackFor(key) {
    return getFirstCallbackFrom(CB_TYPE, listAddSpecialCallbacksFor(key), key);
}

export function listAddExistingCallbacksFor(key) {
    return listCallbacksFor(CB_TYPE, CB_ID_AX, key);
}

export function firstAddExistingCallbackFor(key) {
    return getFirstCallbackFrom(CB_TYPE, listAddExistingCallbacksFor(key), key);
}

export function listSwitchToPopulatedCallbacksFor(key) {
    return listCallbacksFor(CB_TYPE, CB_ID_STP, key);
}

export function firstSwitchToPopulatedCallbackFor(key) {
    return getFirstCallbackFrom(CB_TYPE, listSwitchToPopulatedCallbacksFor(key), key);
}

export function listRefreshCallbacksFor(key) {
    return listCallbacksFor(CB_TYPE, CB_ID_RF, key);
}

export function firstRefreshCallbackFor(key) {
    return getFirstCallbackFrom(CB_TYPE, listRefreshCallbacksFor(key), key);
}

export function listCanHandleCallbacksFor(key) {
    return listCallbacksFor(CB_TYPE, CB_ID_CH, key);
}

export function firstCanHandleCallbackFor(key) {
    return getFirstCallbackFrom(CB_TYPE, listCanHandleCallbacksFor(key), key);
}
