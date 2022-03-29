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
 * @file Functions relating to the rendering of the main admin pane.
 * This pane is shown only to administrator users.
 *
 * @author Dave Braines
 **/

import {render as renderUsers} from "./users.js";
import {createHtmlUsing} from "../../../util/dom.js";
import {adminTemplate} from "./templates/adminTemplate.js";
import {getPaneElement} from "../../../ui/tabs.js";

/**
 * The standard definition for this pane.
 *
 * @type {csPaneDefinition}
 */
export const config = {
    "paneName": 'Admin',
    "adminOnly": true,
    "callbacks": {
        "render": render,
        "refresh": refresh
    }
};

/**
 * Render this pane - list the users.
 */
function render() {
    let elem = getPaneElement(config.paneName);

    if (elem) {
        createHtmlUsing(elem, adminTemplate, createConfigForAdminPane());
    }

    //Now render each of the sections
    renderUsers();
}

/**
 * Refresh this pane.
 */
export function refresh() {
    render();
}

/**
 * Create the configuration for this admin pane.
 *
 * @return {csTemplateConfig}       the template configuration.
 */
function createConfigForAdminPane() {
    return {
        "html": {},
        "events": []
    };
}
