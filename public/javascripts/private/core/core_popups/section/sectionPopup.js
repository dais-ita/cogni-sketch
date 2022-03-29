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
 * @file Functions relating to the section popup window.
 * @author Dave Braines
 **/

import {getPalette} from "/javascripts/private/state.js";
import {
    showToast,
    warn,
    userConfirm
} from "/javascripts/interface/log.js";
import {
    createNewSection,
    refresh as refreshPalette,
    renameSection
} from "/javascripts/private/ui/palette/types.js";
import {
    closePopup,
    popupFrom
} from "/javascripts/private/core/core_popups/generalPopup.js";
import {mainTemplate} from "./templates/sectionTemplates.js";
import {saveActionMisc} from "/javascripts/private/csData/change/csDataChanges.js";

let existingSectionName;
let newSectionName;
let errors;

/**
 * Create the configuration for this popup window;
 * @return {csTemplateConfig}           the template configuration.
 */
function calculateConfig() {
    let isEditing = !!existingSectionName;
    let config = {
        "modalFocus": 'section-name',
        "html": {
            "isEditing": isEditing,
            "sectionName": existingSectionName || ''
        },
        "events": []
    };

    if (isEditing) {
        config.events.push({ "elemId": 'button-delete', "event": 'click', "function": deleteSection });
    }
    config.events.push({ "elemId": 'button-save', "event": 'click', "function": savePopup });
    config.events.push({ "elemId": 'button-cancel', "event": 'click', "function": actionClosePopup });

    if (existingSectionName) {
        config.html.infoMessage = 'Change the name of this section below';
    } else {
        config.html.infoMessage = 'Specify the name for the new section below';
    }

    return config;
}

/**
 * Report that the section adding was cancelled and then close the popup.
 */
function actionClosePopup() {
    saveActionMisc('palette:cancelSectionPopup', null, { "palette": getPalette().getName() });

    closePopup(true);
}

/**
 * Open the section popup either in edit mode (if secName is specified) or to create a new section.
 *
 * @param {string} [secName]        the optional name of the section being edited.
 */
export function openPopup(secName) {
    errors = [];
    existingSectionName = secName;

    if (secName !== 'core') {
        let config = calculateConfig();

        popupFrom(secName, mainTemplate, config);
    } else {
        warn('The <b>core</b> palette section cannot be edited', null, true);
    }
}

/**
 * Rename or create the new section if there are no errors preventing it.
 */
function savePopup() {
    newSectionName = document.getElementById('section-name').value;
    testForErrors();

    if (errors.length === 0) {
        if (existingSectionName) {
            renameSection(existingSectionName, newSectionName);
            saveActionMisc('palette:endEditSection', null, { "palette": getPalette().getName(), "name": newSectionName });
            showToast(`Palette section <b>${existingSectionName}</b> successfully renamed to <b>${newSectionName}</b>`);
        } else {
            createNewSection({ "name": newSectionName, "label": newSectionName });
            saveActionMisc('palette:endAddSection', null, { "palette": getPalette().getName(), "name": newSectionName });
            showToast(`The new palette section <b>${newSectionName}</b> has been created.`);
        }

        closePopup(true);
    }
}

/**
 * Delete the specified section if it is safe to do so.
 */
function deleteSection() {
    if (userConfirm(`Are you sure you want to delete the ${existingSectionName} section?`)) {
        let success = getPalette().deleteSection(existingSectionName);

        if (success) {
            refreshPalette();
            showToast(`Palette section <b>${existingSectionName}</b> has been successfully deleted.`);

            saveActionMisc('palette:deleteSection', null, { "palette": getPalette().getName(), "name": existingSectionName });

            closePopup(true);
        } else {
            warn(`Palette section <b>${existingSectionName}</b> cannot be deleted as it contains items.`, null, true);
        }
    }
}

/**
 * Check for errors - the section name must be valid, unique and changed if this is an edit.
 */
function testForErrors() {
    if (newSectionName) {
        if (existingSectionName !== newSectionName) {
            if (!isUniqueSectionName(newSectionName)) {
                reportError(`Another section named <b>${newSectionName}</b> already exists. Please correct before proceeding.`);
            }
        } else {
            reportError('Section name has not been changed.');
        }
    } else {
        reportError('Section name cannot be empty. Please correct before proceeding.');
    }
}

/**
 * Report the specified error to the user and record it in the list of errors so that the form cannot be saved.
 *
 * @param {string} errorMsg     the error message to be reported.
 */
function reportError(errorMsg) {
    errors.push(errorMsg);
    warn(errorMsg, null, true);

    document.getElementById('section-name').focus();
}

/**
 * Checks whether the passed section name already exists in the current palette (case insensitive test).
 *
 * @param {string} newSecName   the section name to be checked.
 * @return {boolean}            true if the specified section name does not already exist.
 */
function isUniqueSectionName(newSecName) {
    let lcNewSecName = newSecName.trim().toLowerCase();
    let isUnique = true;

    for (let thisSection of getPalette().getSections()) {
        if (thisSection.name.trim().toLowerCase() === lcNewSecName) {
            isUnique = false;
        }
    }

    return isUnique;
}
