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
 * @file Functions relating to the export popup window.
 * @author Dave Braines
 **/

import {getProject} from "/javascripts/private/state.js";
import {mainTemplate} from "./templates/exportTemplates.js";
import {
    httpPostZip,
    saveZipFile
} from "/javascripts/private/util/http.js";
import {showToast} from "/javascripts/interface/log.js";
import {
    closePopup as actionClosePopup,
    popupFrom
} from "/javascripts/private/core/core_popups/generalPopup.js";
import {saveActionMisc} from "/javascripts/private/csData/change/csDataChanges.js";

const MODE_PAL = 'palette';
const MODE_PROJ = 'project';
const URL_EXPORT = '/project/export/';

const ELEM_BUTTON_CANCEL = 'button-cancel';
const ELEM_BUTTON_EXPORT = 'button-full-export';

/**
 * Open the export window in 'palette' mode.
 *
 * @param {string} jsonText     the json text for the palette to be exported.
 */
export function openPaletteExport(jsonText) {
    openExport(MODE_PAL, jsonText);
}

/**
 * Open the export window in 'project' mode.
 *
 * @param {string} jsonText     the json text for the project to be exported.
 */
export function openProjectExport(jsonText) {
    openExport(MODE_PROJ, jsonText);
}

/**
 * Create the export window with the relevant contents.
 *
 * @param {string} objectType       the name of the object type being exported (project or palette).
 * @param {string} jsonText         the json text for the object being exported.
 */
function openExport(objectType, jsonText) {
    let config = calculateExportConfig(objectType, jsonText);

    popupFrom(`${objectType}-export`, mainTemplate, config);
}

/**
 * Create the configuration for this export popup window.
 *
 * @param {string} objectType       the name of the object type being exported (project or palette).
 * @param {string} jsonText         the json text for the object being exported.
 * @return {csTemplateConfig}       the template configuration.
 */
function calculateExportConfig(objectType, jsonText) {
    let config = {
        'modalFocus': ELEM_BUTTON_CANCEL,
        'html': {
            'isProject': (objectType === MODE_PROJ),
            'objectType': objectType,
            'jsonText': jsonText
        },
        'events': []
    };

    if (objectType === MODE_PROJ) {
        config.html.warningText = '<br/><br/>Or click on "full export" to create a zip file of the whole project (including images and files).';
        config.events.push({ 'elemId': ELEM_BUTTON_EXPORT, 'event': 'click', 'function': actionDoFullExport });
    }

    config.events.push({ 'elemId': ELEM_BUTTON_CANCEL, 'event': 'click', 'function': function() { actionClosePopup(); }});

    return config;
}

/**
 * Create and download a zip file of the entire project, including file and images.
 */
function actionDoFullExport() {
    let url = URL_EXPORT + getProject().getName();

    httpPostZip(url, callbackFullExport);
}

/**
 * The full export zip file has been returned.  Save the binary data as a file, inform the user and close the popup.
 *
 * @param {XMLHttpRequest} xhr      the response from the server, containing the binary zip file data.
 */
function callbackFullExport(xhr) {
    saveZipFile(xhr);

    saveActionMisc('project:fullExport');

    actionClosePopup();

    showToast(`<b>${getProject().getName()}</b> project has been successfully exported as a zip file.  Check your downloads.`);
}
