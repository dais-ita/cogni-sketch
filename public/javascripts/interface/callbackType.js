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
 * @file Public interface functions enabling the registration of type callback functions.  These are executed whenever
 * a node on the canvas is added, expanded, refreshed etc.
 * All methods are simple proxies to relevant private functions.
 *
 * @author Dave Braines
 **/

import {
    registerAddEmptyCallback as doRegisterAddEmptyCallback,
    registerAddExistingCallback as doRegisterAddExistingCallback,
    registerAddFullCallback as doRegisterAddFullCallback,
    registerCanHandleCallback as doRegisterCanHandleCallback,
    registerLabelTextCallback as doRegisterLabelTextCallback,
    registerNodeIconCallback as doRegisterNodeIconCallback,
    registerRefreshCallback as doRegisterRefreshCallback,
    registerStandardNodeCallbacks as doRegisterStandardNodeCallbacks,
    registerSwitchToPopulatedCallback as doRegisterSwitchToPopulatedCallback
} from "/javascripts/private/util/callback/cbType.js";

/**
 * Register all the standard node callbacks.  This is the equivalent of separately calling these functions:
 *   registerAddEmptyCallback
 *   registerAddFullCallback
 *   registerAddExistingCallback
 *   registerSwitchToPopulatedCallback
 *   registerRefreshCallback
 *
 * @param {string} typeName         the name of the nodeType to which this callback will be registered.
 * @param {function} cbFunction     the callback function to be executed when any of these events fire.
 */
export function registerStandardNodeCallbacks(typeName, cbFunction) {
    doRegisterStandardNodeCallbacks(typeName, cbFunction);
}

/**
 * Register the 'addEmptyNode' callback.
 * This event is fired whenever a new 'empty' node is added to the canvas, for example by dragging a node from the
 * palette and dropping onto the canvas.  Any nodes that match the specified type name will cause the specified
 * callback function to be executed.
 *
 * @param {string} typeName         the name of the nodeType to which this callback will be registered.
 * @param {function} cbFunction     the callback function to be executed when this event fires
 */
export function registerAddEmptyCallback(typeName, cbFunction) {
    doRegisterAddEmptyCallback(typeName, cbFunction);
}

/**
 * Register the 'addFullNode' callback.
 * This event is fired whenever a new 'full' node is added to the canvas, for example by dropping or pasting
 * templates on to the canvas which is then matched to a specific node type.  Any nodes that match the specified type
 * name will cause the specified callback function to be executed.
 *
 * @param {string} typeName         the name of the nodeType to which this callback will be registered.
 * @param {function} cbFunction     the callback function to be executed when this event fires
 */
export function registerAddFullCallback(typeName, cbFunction) {
    doRegisterAddFullCallback(typeName, cbFunction);
}

/**
 * Register the 'addExistingNode' callback.
 * This event is fired whenever an existing node is added to the canvas, usually as a result of reloading a project.
 * Any nodes that match the specified type name will cause the specified callback function to be executed.
 *
 * @param {string} typeName         the name of the nodeType to which this callback will be registered.
 * @param {function} cbFunction     the callback function to be executed when this event fires
 */
export function registerAddExistingCallback(typeName, cbFunction) {
    doRegisterAddExistingCallback(typeName, cbFunction);
}

/**
 * Register the 'switchToPopulated' callback.
 * This event is fired whenever an 'empty' node has templates added, thereby switching it to a 'full' node.  The most
 * common case is when material is dropped or pasted onto an empty node.
 *
 * @param {string} typeName         the name of the nodeType to which this callback will be registered.
 * @param {function} cbFunction     the callback function to be executed when this event fires
 */
export function registerSwitchToPopulatedCallback(typeName, cbFunction) {
    doRegisterSwitchToPopulatedCallback(typeName, cbFunction);
}

/**
 * Register the 'refreshNode' callback.
 * This event is fired whenever a node is refreshed, e.g. because of a palette or templates change, or because a
 * refresh has been requested by plugin code.
 *
 * @param {string} typeName         the name of the nodeType to which this callback will be registered.
 * @param {function} cbFunction     the callback function to be executed when this event fires
 */
export function registerRefreshCallback(typeName, cbFunction) {
    doRegisterRefreshCallback(typeName, cbFunction);
}

/**
 * Register the 'canHandle' callback.
 * This event is fired whenever new templates is pasted or dropped onto the canvas. All registered 'canHandle' callback
 * functions will be executed and the one which returns the highest match will be used to create a 'full' node of that
 * type with the pasted/dropped data as the contents.
 *
 * The callback function (cbFunc) must return a valid value from the list provided in the context parameter.
 *
 * @param {string} typeName         the name of the nodeType to which this callback will be registered.
 * @param {function} cbFunction     the callback function to be executed when this event fires
 */
export function registerCanHandleCallback(typeName, cbFunction) {
    doRegisterCanHandleCallback(typeName, cbFunction);
}

/**
 * Register the 'nodeIcon' callback.
 * This event is fired whenever the node icon is needed, i.e. every time the node is rendered.  This callback can
 * be used to dynamically determine the icon to be used and the bode color, for example by checking the templates of
 * the node.
 *
 * @param {string} typeName         the name of the nodeType to which this callback will be registered.
 * @param {function} cbFunction     the callback function to be executed when this event fires
 */
export function registerNodeIconCallback(typeName, cbFunction) {
    doRegisterNodeIconCallback(typeName, cbFunction);
}

/**
 * Register the 'labelText' callback.
 * This event is fired whenever the label text is needed for the node, i.e. every time the node is rendered.  This
 * callback can be used to dynamically determine the icon to be used and the bode color, for example by checking the
 * templates of the node.
 *
 * @param {string} typeName         the name of the nodeType to which this callback will be registered.
 * @param {function} cbFunction     the callback function to be executed when this event fires
 */
export function registerLabelTextCallback(typeName, cbFunction) {
    doRegisterLabelTextCallback(typeName, cbFunction);
}
