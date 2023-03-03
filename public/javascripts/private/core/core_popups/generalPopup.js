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
 * @file Functions relating to the core general popup window.
 *
 * @author Dave Braines
 **/

import {createButton, createFormFromHtml, registerConfigEvents, setModalFocus} from "/javascripts/private/util/dom.js";
import {
    clearSessionModalObject,
    getSessionModalObject,
    setSessionModalObject,
    clearSessionSecondModalObject,
    getSessionSecondModalObject,
    setSessionSecondModalObject
} from "/javascripts/private/csData/csDataSession.js";
import {saveActionMisc} from "/javascripts/private/csData/change/csDataChanges.js";

export let FORM_NAME = 'popup-form';
export let FORM_SECOND_NAME = 'popup-form-2';

let FIELD_BUTTON_SAVE = 'button-submit';
let FIELD_BUTTON_CANCEL = 'button-cancel';
let FIELD_INFO_MSG = 'popup-info';

let LABEL_SAVE = 'Save Changes';
let LABEL_CANCEL = 'Cancel';

export let MSG_SAVED_CHANGES = 'The changes have been saved';
export let MSG_NO_CHANGES = 'No changes were made';

/**
 * Return true if there is a popup modal window open.
 *
 * @return {boolean}    whether there is a popup modal window open.
 */
export function isPopupOpen() {
    return !!getModalObject();
}

/**
 * Return true if there is a popup modal window open.
 *
 * @return {boolean}    whether there is a popup modal window open.
 */
export function isSecondaryPopupOpen() {
    return !!getSecondModalObject();
}

/**
 * Get the modal object (on which the currently open popup window is focused).
 *
 * @return {*}      the modal object.
 */
export function getModalObject() {
    return getSessionModalObject();
}

/**
 * Get the second modal object (on which the currently open popup window is focused).
 *
 * @return {*}      the modal object.
 */
export function getSecondModalObject() {
    return getSessionSecondModalObject();
}

/**
 * Create a popup window on the specified modal object, using the html and config to generate the popup contents.
 *
 * @param {*} modalObject               the object (or string) that is the focus of the popup window.
 * @param {string} htmlTemplate         the html template sting that will be used to generate the contents.
 * @param {csTemplateConfig} config     the config object that is used to populate the html template.
 */
export function popupFrom(modalObject, htmlTemplate, config) {
    doPopupFrom(modalObject, htmlTemplate, config, FORM_NAME, false);
}

/**
 * Create a second popup window on the specified modal object, using the html and config to generate the popup contents.
 *
 * @param {*} modalObject               the object (or string) that is the focus of the popup window.
 * @param {string} htmlTemplate         the html template sting that will be used to generate the contents.
 * @param {csTemplateConfig} config     the config object that is used to populate the html template.
 */
export function popupSecondFrom(modalObject, htmlTemplate, config) {
    doPopupFrom(modalObject, htmlTemplate, config, FORM_SECOND_NAME, true);
}

/**
 * Create a popup window on the specified modal object, using the html and config to generate the popup contents.
 *
 * @param {*} modalObject               the object (or string) that is the focus of the popup window.
 * @param {string} htmlTemplate         the html template sting that will be used to generate the contents.
 * @param {csTemplateConfig} config     the config object that is used to populate the html template.
 * @param {string} formName             The form name to use (whether this is first or second popup)
 * @param {boolean} isSecond            Whether this is a secondary modal popup
 */
function doPopupFrom(modalObject, htmlTemplate, config, formName, isSecond) {
    let compiled = Handlebars.compile(htmlTemplate);
    let html = compiled(config.html);

    createFormFromHtml(formName, html);

    if (config.modalFocus) {
        setModalFocus(formName, config.modalFocus);
    }

    registerConfigEvents(config.events);

    showPopup(modalObject, formName, isSecond);
}

/**
 * Close the modal popup window.
 */
export function closePopup(suppressAction) {
    clearSessionModalObject();

    $('#' + FORM_NAME).modal('hide');

    if (!suppressAction) {
        saveActionMisc('popup:closePopup');
    }
}

/**
 * Close the second modal popup window.
 */
export function closeSecondPopup() {
    clearSessionSecondModalObject();
    let form = $('#' + FORM_NAME);

    $('#' + FORM_SECOND_NAME).modal('hide');

    //Re-show the first popup to make it active
    form.modal('hide');
    form.modal({ backdrop: 'static' });
}

export function showPopup(modalObj, formName, isSecond) {
    if (isSecond) {
        setSessionSecondModalObject(modalObj);
    } else {
        setSessionModalObject(modalObj);
    }

    //TODO: Delete this when migration complete
    $('#' + formName || FORM_NAME).modal({ backdrop: 'static' });
}

export function createSaveButton(parent, onclick, label, isDefault) {
    //TODO: Delete this function when migration is complete
    createButton(parent, FIELD_BUTTON_SAVE, (label || LABEL_SAVE), onclick, isDefault);
}

export function createCancelButton(parent, label, onclick) {
    //TODO: Delete this function when migration is complete
    createButton(parent, FIELD_BUTTON_CANCEL, (label || LABEL_CANCEL), onclick || closePopup, false, true);
}

export function createInfoArea(parent, msg, hideIfEmpty) {
    //TODO: Delete this function when migration is complete
    let e = document.createElement('div');

    e.setAttribute('id', FIELD_INFO_MSG);
    e.classList.add('alert-info');
    e.classList.add('my-3');
    e.classList.add('p-2');
    e.innerHTML = msg;

    if (hideIfEmpty) {
        if (!msg) {
            e.classList.add('d-none');
        }
    }

    parent.appendChild(e);
}
