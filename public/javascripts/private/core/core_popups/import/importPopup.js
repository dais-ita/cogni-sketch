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
 * @file Functions relating to the core import popup window.
 * @author Dave Braines
 **/

import {importProjectFrom} from "/javascripts/private/ui/project/project.js";
import {importPaletteFrom} from "/javascripts/private/ui/palette/types.js";
import {mainTemplate} from "./templates/importTemplates.js";
import {getElemValById} from "/javascripts/private/util/dom.js";
import {isValidProjectJson, isValidPaletteJson} from "/javascripts/private/util/misc.js";
import {closePopup as actionClosePopup, popupFrom} from "/javascripts/private/core/core_popups/generalPopup.js";
import {warn} from "/javascripts/private/util/log.js";
import {saveActionMisc} from "/javascripts/private/csData/change/csDataChanges.js";
import {getPalette, getProject} from "/javascripts/private/state.js";

const MODE_PROJ = 'project';
const MODE_PAL = 'palette';

const ELEM_IMPORT_TEXT = 'input-import-text';
const ELEM_BUTTON_CANCEL = 'button-cancel';
const ELEM_BUTTON_IMPORT = 'button-import';

/**
 * Open the import window in 'palette' mode.
 */
export function openPaletteImport() {
    openImport(MODE_PAL);
}

/**
 * Open the import window in 'project' mode.
 */
export function openProjectImport() {
    openImport(MODE_PROJ);
}

/**
 * Create the import window with the relevant contents.
 *
 * @param {string} objectType       the name of the object type being exported (project or palette).
 */
function openImport(objectType) {
    let config = calculateImportConfig(objectType);

    popupFrom('${objectType}-import', mainTemplate, config);
}

/**
 * Create the configuration for this import popup window.
 *
 * @param {string} objectType       the name of the object type being exported (project or palette).
 * @return {csTemplateConfig}       the template configuration.
 */
function calculateImportConfig(objectType) {
    let config = {
        'modalFocus': ELEM_BUTTON_CANCEL,
        'html': {
            'info1': `Paste ${objectType} json from your clipboard into the field above and click on the import button.`,
            'info2': `This will overwrite any existing information in your current ${objectType}.`
        },
        'events': []
    };

    config.events.push({ 'elemId': ELEM_BUTTON_IMPORT, 'event': 'click', 'function': function() { actionDoImport(objectType); }});
    config.events.push({ 'elemId': ELEM_BUTTON_CANCEL, 'event': 'click', 'function': function() { actionClosePopup(); }});

    return config;
}

/**
 * Perform the input.  Check the JSON is valid, then check it is valid project or palette JSON, finally replacing the
 * current project or palette if it is valid.
 *
 * @param {string} objectType       the name of the object type being exported (project or palette).
 */
function actionDoImport(objectType) {
    let jsonText = getElemValById(ELEM_IMPORT_TEXT);

    if (jsonText) {
        let oldPalName = getPalette().getName();
        let oldProjName = getProject().getName();
        let obj;

        try {
            obj = JSON.parse(jsonText);
        } catch(e) {
            if (objectType === MODE_PROJ) {
                let msg = 'Project JSON was not valid';

                saveActionMisc('project:importProject(fail)', null, { "error": msg });
                warn(msg, obj, true);
            } else {
                let msg = 'Palette JSON was not valid';

                saveActionMisc('palette:importPalette(fail)', null, { "palette": oldPalName, "error": msg });
                warn(msg, jsonText, true);
            }
        }

        if (obj) {
            if (objectType === MODE_PROJ) {
                if (isValidProjectJson(obj)) {

                    importProjectFrom(obj);
                    saveActionMisc('project:importProject', null, { "oldProject": oldProjName, "newProject": obj.project });
                } else {
                    let msg = `Wrong kind of JSON. That was not a valid ${objectType} export`;

                    saveActionMisc('project:importProject(fail)', null, { "project": oldProjName, "error": msg });
                    warn(msg, obj, true);
                }
            } else {
                if (isValidPaletteJson(obj)) {
                    importPaletteFrom(obj);
                    saveActionMisc('palette:importPalette', null, { "oldPalette": oldPalName, "newPalette": obj.name });
                } else {
                    let msg = `Wrong kind of JSON. That was not a valid ${objectType} export`;

                    saveActionMisc('palette:importPalette(fail)', null, { "palette": oldPalName, "error": msg });
                    warn(msg, obj, true);
                }
            }
        }
    } else {
        warn('Nothing to be imported', jsonText, true);
    }

    actionClosePopup(true);
}
