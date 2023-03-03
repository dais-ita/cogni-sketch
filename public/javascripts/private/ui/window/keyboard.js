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
 * @file Generic window level handling for keyboard events - will pass these on to the active pane if key handlers are defined.
 * @author Dave Braines
 */

import {
    closePopup,
    closeSecondPopup,
    isPopupOpen,
    isSecondaryPopupOpen
} from "/javascripts/private/core/core_popups/generalPopup.js";
import {activeTabName} from "/javascripts/private/ui/tabs.js";
import {getPane} from "/javascripts/private/csData/csDataComponents.js";

/**
 * Register the keyup event for the window, so that key presses can be handled.
 */
export function initialise() {
    window.addEventListener('keyup', function(e) { keyup(e); });
}

/**
 * Called whenever the keyup event is received for the window.  Determine if a popup is open, and pass on to the
 * active pane if needed.
 *
 * @param {KeyboardEvent} ev     the keyup event
 */
function keyup(ev) {
    if (isSecondaryPopupOpen()) {
        if (ev.key === 'Escape') {
            closeSecondPopup();
        }
    } else if (isPopupOpen()) {
        if (ev.key === 'Escape') {
            closePopup();
        }
    } else {
        sendKeyupToTab(ev);
    }
}

/**
 * If the active pane has registered a keyup handler then send this event on to that handler.
 *
 * @param {KeyboardEvent} ev     the keyup event
 */
function sendKeyupToTab(ev) {
    let paneName = activeTabName()

    if (paneName) {
        let pane = getPane(paneName);

        if (pane && pane.config && pane.config.callbacks && pane.config.callbacks.keyup) {
            pane.config.callbacks.keyup(ev);
        }
    }
}
