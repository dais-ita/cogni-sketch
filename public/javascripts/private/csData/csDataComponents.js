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

import {error} from "/javascripts/private/util/log.js";
import {localize} from "/javascripts/private/util/internationalization.js";

/**
 * @file Provides persistence for the core components of the application (plugins, actions, functions, panes).
 *
 * @author Dave Braines
 **/

let components = {
    "plugins": {},
    "actions": {},
    "functions": {},
    "panes": {}
};

/**
 * Return the list of plugins that have been loaded for this application.
 *
 * @return {csPlugin[]}     the list of loaded plugins.
 */
export function getPlugins() {
    return components.plugins;
}

/**
 * Set the list of plugins that have been loaded for this application.
 *
 * @param {csPlugin[]} plugins      the list of loaded plugins.
 */
export function setPlugins(plugins) {
    components.plugins = plugins;
}

export function getActions() {
    return components.actions;
}

export function getFunctions() {
    return components.functions;
}

export function getPanes() {
    return components.panes;
}

/**
 * Return the pane module that corresponds to the specified pane name, or report an error if it is not found.
 *
 * @param {string} paneName     the name of the pane being sought.
 * @return {csPane}             the pane module.
 */
export function getPane(paneName) {
    let pane = components.panes[paneName.toLowerCase()];

    if (!pane) {
        error(localize('messages.panes.unexpected', { "paneName": paneName }));
    }

    return pane;
}
