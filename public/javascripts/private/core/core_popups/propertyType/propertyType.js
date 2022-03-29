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
 * @file Functions relating to the property type window.
 * @author Dave Braines
 **/

import {error, showToast} from "/javascripts/interface/log.js";
import {closeSecondPopup, popupSecondFrom} from "/javascripts/private/core/core_popups/generalPopup.js";
import {mainTemplate} from "./templates/propertyTypeTemplates.js";
import {settings} from "/javascripts/private/core/core_settings.js";
import {stripHtml} from "/javascripts/private/util/misc.js";

const ELEM_PROP_LIST = 'cs-property-type';
const ELEM_PROP_DESC = 'cs-property-type-description';

let tgtNode;
let tgtPropName;
let existingValue;
let existingTypeName;
let allTypes;
let newTypeName;
let cb;
let hasError = false;

/**
 * Create the configuration for this popup window;
 * @return {csTemplateConfig}           the template configuration.
 */
function calculateConfig() {
    let typeList = [];

    for (let [typeName, type] of Object.entries(allTypes)) {
        //TODO: Improve this - allow all types rather than just the root types (no parents)
        if (!type.parent) {
            typeList.push( { "name": typeName, "selected": (typeName === existingTypeName) } );
        }
    }

    let desc;

    if (settings.general.propertyTypes[existingTypeName]) {
        desc = settings.general.propertyTypes[existingTypeName].description;
    } else {
        error(`Could not find description for property type '${existingTypeName}'`);
    }

    let config = {
        "modalFocus": 'cs-property-type',
        "html": {
            "typeName": existingTypeName,
            "allTypes": typeList,
            "description": desc
        },
        "events": []
    };

    config.events.push({ "elemId": 'cs-button-save', "event": 'click', "function": savePopup });
    config.events.push({ "elemId": 'cs-button-cancel', "event": 'click', "function": closeSecondPopup });
    config.events.push({ "elemId": ELEM_PROP_LIST, "event": 'change', "function": updateDescription });

    return config;
}

/**
 * Open the property type popup.
 *
 * @param {csNode|csLink} thisNode  The node or link to which this property applies.
 * @param {string} thisPropName     The name of the property.
 * @param {string} typeName         The name of the current property type.
 * @param {string} propVal          The value of the property.
 * @param {object} types            The dictionary of all possible property types.
 * @param {function} callback       The function to be called when the window is saved.
 */
export function openPopup(thisNode, thisPropName, typeName, propVal, types, callback) {
    tgtNode = thisNode;
    tgtPropName = thisPropName;
    existingTypeName = typeName;
    existingValue = propVal;
    allTypes = types;
    cb = callback;

    let config = calculateConfig();

    popupSecondFrom(typeName, mainTemplate, config);
}

/**
 * Update the property type if it has changed.
 */
function savePopup() {
    if (hasError) {
        showToast('You cannot save this property until the error is fixed');
    } else {
        newTypeName = document.getElementById(ELEM_PROP_LIST).value;

        if (newTypeName !== existingTypeName) {
            showToast(`The property type has been changed to ${newTypeName}`);
        } else {
            showToast(`The property type was not changed`);
        }

        closeSecondPopup();

        /* call the callback */
        cb(tgtPropName, existingTypeName, newTypeName, existingValue);
    }
}

function updateDescription() {
    let propName = document.getElementById(ELEM_PROP_LIST).value;
    let propDesc = document.getElementById(ELEM_PROP_DESC);

    if (propName === 'json') {
        let pureValue = stripHtml(existingValue);

        try {
            JSON.parse(pureValue);
            existingValue = pureValue;
        } catch(e) {
            error(`Error processing JSON for: ${pureValue}`, e);
            hasError = true;
        }
    } else {
        hasError = false;
    }

    if (hasError) {
        propDesc.innerHTML = 'The property value is not valid JSON so it cannot be set to JSON';
    } else {
        propDesc.innerHTML = settings.general.propertyTypes[propName].description;
    }
}
