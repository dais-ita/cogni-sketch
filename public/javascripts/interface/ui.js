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
 * @file Public interface functions relating to user interface interactions.
 * All methods are simple proxies to relevant private functions.
 *
 * @author Dave Braines
 **/

import {
    getPaneElement as doGetPaneElement,
    hideTab,
    switchToPane as doSwitchToPane
} from "/javascripts/private/ui/tabs.js";

/**
 * Close the specified tab (hide it in the tab ribbon so that the corresponding pane cannot be shown).
 *
 * @param {string} tabName      the name of the tab to be closed (hidden).
 */
export function closeTab(tabName) {
    return hideTab(tabName);
}

/**
 * Switch to the specified pane, selecting the tab and showing the pane contents.
 *
 * @param {string} paneName     the name of the pane to be switched to.
 */
export function switchToPane(paneName) {
    return doSwitchToPane(paneName);
}

/**
 * Return the pane element.  The contents of the pane can be created inside this.
 *
 * @param {string} paneName     the name of the pane who's element should be returned.
 * @return {HTMLDivElement}     the pane element for the specified pane.
 */
export function getPaneElement(paneName) {
    return doGetPaneElement(paneName);
}
