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
 * @file Functions relating to the core upload popup window.
 *
 * @author Dave Braines
 **/

import {getProject} from "/javascripts/private/state.js";
import {requestAndPopulateIcons} from "/javascripts/private/core/core_popups/typePopup.js";
import {mainTemplate} from "./templates/uploadTemplates.js";
import {
    closePopup as actionClosePopup,
    closeSecondPopup as actionCloseSecondPopup,
    popupFrom,
    popupSecondFrom
} from "/javascripts/private/core/core_popups/generalPopup.js";
import {saveActionMisc} from "/javascripts/private/csData/change/csDataChanges.js";

const ELEM_CHOOSER = 'input-chooser';
const ELEM_INFO = 'popup-info-upload';
const ELEM_BUTTON_UPLOAD = 'button-upload-submit';
const ELEM_BUTTON_CANCEL = 'button-upload-cancel';

let iconMode = false;

/**
 * Open the file upload window.
 */
export function openUpload(isSecond) {
    let config = calculateImportConfig(isSecond);
    legacyEvents();

    if (isSecond) {
        popupSecondFrom('upload', mainTemplate, config);
        iconMode = true;
    } else {
        popupFrom('upload', mainTemplate, config);
    }
}

/**
 * Create the configuration for this upload popup window.
 *
 * @return {csTemplateConfig}       the template configuration.
 */
function calculateImportConfig(isSecond) {
    let config;
    let formName;

    if (isSecond) {
        formName = 'popup-form-2';
    } else {
        formName = 'popup-form';
    }

    config = {
        'modalFocus': ELEM_BUTTON_UPLOAD,
        'html': {
            'formName': formName
        },
        'events': []
    };

    config.events.push({ 'elemId': ELEM_BUTTON_UPLOAD, 'event': 'click', 'function': actionDoUpload });

    if (isSecond) {
        config.events.push({ 'elemId': ELEM_BUTTON_CANCEL, 'event': 'click', 'function': function() { actionCloseSecondPopup(); } });
    } else {
        config.events.push({ 'elemId': ELEM_BUTTON_CANCEL, 'event': 'click', 'function': function() { actionClosePopup(); } });
    }

    config.events.push({ 'elemId': 'input-chooser', 'event': 'change', 'function': function() { actionFilesChanged(); } });

    return config;
}

/**
 * Do the file upload, and report the results into the status area.
 */
function actionDoUpload() {
    const chosenFiles = document.getElementById(ELEM_CHOOSER).files;
    const formData = new FormData();
    let fileNames = [];
    let uploadUrl;

    if (iconMode) {
        uploadUrl = '/file/upload-icon';
    } else {
        uploadUrl = '/file/upload';
    }

    for (let thisFile of chosenFiles) {
        formData.append('files[]', thisFile);
        fileNames.push(thisFile.name);
    }

    formData.append('project', getProject().getName());

    saveActionMisc('files:upload', null, { "fileNames": fileNames });

    $.ajax({
        url: uploadUrl,
        data: formData,
        type: 'POST',
        processData: false,
        contentType: false,
        success: function(data) {
            writeInfoMessage(`${data.message}<br>(${data.filenames})`);
            requestAndPopulateIcons();
        }
    });
}

function actionFilesChanged() {
    let jElem = $('.custom-file-input');

    if (jElem && jElem[0]) {
        let labelText;
        let count = 0;

        for (let file of jElem[0].files) {
            if (labelText) {
                labelText += `, ${file.name}`;
            } else {
                labelText = file.name;
            }

            ++count;
        }

        if (labelText) {
            writeInfoMessage(`${count} files to be uploaded (${labelText})`);
        }
    }
}

export function writeInfoMessage(msg) {
    //TODO: Update this to the standard format
    $('#' + ELEM_INFO)
        .removeClass('d-none')
        .addClass('d-flex')
        .html(msg);
}

function legacyEvents() {
    //TODO: Update this to the standard format
    //Update the label whenever the selection changes
    $('.custom-file-input').on('change', function() {
        let labelText;

        for (let thisFile of this.files) {
            if (labelText) {
                labelText += `, ${thisFile.name}`;
            } else {
                labelText = thisFile.name;
            }
        }

        $('.custom-file-label').addClass('selected').html(labelText);
    });
}
