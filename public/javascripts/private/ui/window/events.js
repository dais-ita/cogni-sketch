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
 * @file Functions relating to window level events such as cut, paste and copy.
 * @author Dave Braines
 **/

import {copy, cut, paste} from "/javascripts/private/ui/window/clipboard.js";
import {getSessionHasUnsavedChanges} from "/javascripts/private/csData/csDataSession.js";

/**
 * Initialise by registering event handlers.
 */
export function initialise() {
    registerEventHandlers();

    //Set focus to the project list so that the window is "active" and key events can be received
    document.getElementById('cs-project-list').focus();
}

/**
 * Register the relevant window events.
 */
function registerEventHandlers() {
    /* Window events */
    window.addEventListener('copy', windowCopy);
    window.addEventListener('cut', windowCut);
    window.addEventListener('paste', windowPaste);
    window.addEventListener('beforeunload', windowBeforeUnload);
}

/**
 * A copy event has occurred.  Pass it on to the copy handler.
 *
 * @param {ClipboardEvent} cdo      the clipboard event for this copy.
 */
function windowCopy(cdo) {
    copy(cdo);
}

/**
 * A cut event has occurred.  Pass it on to the cut handler.
 *
 * @param {ClipboardEvent} cdo      the clipboard event for this cut.
 */
function windowCut(cdo) {
    cut(cdo);
}

/**
 * A paste event has occurred.  Pass it on to the paste handler.
 *
 * @param {ClipboardEvent} cdo      the clipboard event for this paste.
 */
function windowPaste(cdo) {
    paste(cdo);
}

export function preventDefaultAndStopPropagation(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
}

/**
 * This function is called just before browser refresh or close.
 * If there are unsaved changes prompt the user whether they can to save.
 *
 * @param {BeforeUnloadEvent} e      the before unload event.
 */
function windowBeforeUnload(e) {
    if (getSessionHasUnsavedChanges()) {
        preventDefaultAndStopPropagation(e);
        e.returnValue = '';
    }
}
