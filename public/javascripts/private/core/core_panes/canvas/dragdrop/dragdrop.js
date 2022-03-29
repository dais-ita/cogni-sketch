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
 * @file General functions and definitions for drag/drop capabilities.
 *
 * @author Dave Braines
 **/

import {removeSessionValue} from "/javascripts/private/state.js";
import {
    getSessionCurrentDrag,
    setSessionCurrentDrag
} from "/javascripts/private/csData/csDataSession.js";

/**
 * A pre-defined set of options that can be chosen by each node type when a payload is dropped or pasted onto the
 * canvas.  The node type with the highest numeric match will be presented with the payload.
 *
 * Note that this is only used for canvas events.  Node events are always passed directly to the node regardless of
 * type and confidence.
 *
 * @type {csDropConfidence}
 */
export const handle = {
    'CANNOT': 0,
    'BY_DEFAULT': 1,
    'WEAKLY': 2,
    'DEFINITELY': 3
};

/* any dropped functions from within the application will have this prefix in the plain text payload */
export const PREFIX_FUNC = 'function:';

/**
 * Get the current drag object from the session.
 *
 * @return {csDrag}         the current drag object.
 */
export function getCurrentDrag() {
    return getSessionCurrentDrag();
}

/**
 * Set the drag object into the session.
 *
 * @param {csDrag} val      the current drag object.
 */
export function setCurrentDrag(val) {
    setSessionCurrentDrag(val);
}

/**
 * Clear the current drag object for the session (when a drag is no longer in progress).
 */
export function clearCurrentDrag() {
    removeSessionValue('drawing', 'currentDrag');
}
