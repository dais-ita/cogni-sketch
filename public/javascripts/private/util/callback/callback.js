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
 * @file Functions defining the overall framework for the implementation of user defined callback functions.
 *
 * @author Dave Braines
 **/

import {debug, warn} from "/javascripts/private/util/log.js";

let callbacks = {
    'type': {},
    'function': {}
};

export function registerCallback(cbType, cbName, componentId, cbFunc) {
    debug(`registerCallback: ${cbType}:${cbName}:${componentId}`);

    if (!callbacks[cbType]) {
        callbacks[cbType] = {};
    }

    if (!callbacks[cbType][cbName]) {
        callbacks[cbType][cbName] = {};
    }

    if (!callbacks[cbType][cbName][componentId]) {
        callbacks[cbType][cbName][componentId] = [];
    }

    if (callbacks[cbType][cbName][componentId].indexOf(cbFunc) === -1) {
        callbacks[cbType][cbName][componentId].push(cbFunc);
    }
}

export function getFirstCallbackFrom(cbType, cbList, key) {
    let result;

    if (cbList && cbList.length > 0) {
        if (cbList.length === 1) {
            result = cbList[0];
        } else {
            warn(`More than one ${cbType} callback not yet supported.  For '${key}' there are ${cbList.length} callbacks`);
        }
    }

    return result;
}

export function listCallbacksFor(cbType, cbName, key) {
    let result;

    if (key) {
        if (callbacks[cbType] && callbacks[cbType][cbName]) {
            result = callbacks[cbType][cbName][key];
        }
    } else {
        if (callbacks[cbType] && callbacks[cbType][cbName]) {
            result = [];

            for (let cbList of Object.values(callbacks[cbType][cbName])) {
                for (let cb of cbList) {
                    result.push(cb);
                }
            }
        }
    }

    return result || [];
}
