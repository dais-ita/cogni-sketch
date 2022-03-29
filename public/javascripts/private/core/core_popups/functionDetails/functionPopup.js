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
 * @file Functions relating to the core function popup window.
 * @author Dave Braines
 **/

import {closePopup as actionClosePopup, popupFrom} from "/javascripts/private/core/core_popups/generalPopup.js";
import {mainTemplate} from "./templates/functionDetailsTemplates.js";
import {getElement} from "/javascripts/private/util/dom.js";
import {httpGet} from "/javascripts/interface/http.js";

const ELEM_BUTTON_HELP = 'button-help';
const ELEM_BUTTON_CANCEL = 'button-cancel';
const ELEM_HELP = 'help-text';

/**
 * Create the configuration for this function details popup window.
 *
 * @param {string} funcName     the name of the function.
 * @return {csTemplateConfig}   the template configuration.
 */
function calculateFunctionConfig(funcName) {
    let config = {
        'events': []
    };

    config.events.push({ 'elemId': ELEM_BUTTON_HELP, 'event': 'click', 'function': function() { actionShowHelp(funcName); }});
    config.events.push({ 'elemId': ELEM_BUTTON_CANCEL, 'event': 'click', 'function': actionClosePopup });

    return config;
}

/**
 * Open this popup window to show the function configuration details.
 *
 * @param {string} funcName     the name of the function being opened.
 */
export function openPopup(funcName) {
    let config = calculateFunctionConfig(funcName);

    popupFrom(funcName, mainTemplate, config);
}

/**
 * Show the help for this function - request the contents from the help file via http request.
 *
 * @param {string} funcName     the name of the function.
 */
function actionShowHelp(funcName) {
    /* Load the help homepage for the specified function */
    httpGet(`./javascripts/private/core/core_functions/${funcName}/content/help.html`, cbLoadHelpPage, null, false, '', 'text/html');
}

/**
 * Render the response (text/html) as the templates of the help element.
 *
 * @param {string} response     the help text for this function.
 */
function cbLoadHelpPage(response) {
    let elem = getElement(ELEM_HELP);

    if (elem) {
        elem.innerHTML = response;
    }
}
