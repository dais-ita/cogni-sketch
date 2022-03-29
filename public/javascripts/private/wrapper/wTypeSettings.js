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
 * @file Functions that define the object that instantiates a palette item type settings within the application.
 *
 * @author Dave Braines
 **/

import {sendTypeChangedEvent} from "../ui/tabs.js";

export const DEFAULT_COLOR = 'red';

/**
 * Create a new (palette) type settings and return it.
 *
 * @param {string} objId - the id of the parent csNode or csLink object.
 * @param {csRawSettings} rawSettings - the raw (serialized form) of the palette type to be used.
 * @return {csTypeSettings}
 */
export function create(objId, rawSettings) {
    let id = `settings_${objId}`;
    let coreSettings = rawSettings || {};

    let _export = function() {
        return coreSettings;
    }

    let replaceWith = function(jSettings) {
        let oldSettings = coreSettings;

        coreSettings = jSettings;

        sendTypeChangedEvent({ "type": /** @type {csType} */ this, "change": 'schemaSetSettings', "previousValue": oldSettings });
    }

    let getDefaultWidth = function() {
        return coreSettings.defaultWidth;
    }

    let getDefaultShowType = function() {
        return coreSettings.defaultShowType;
    }

    let getDefaultImageWidth = function() {
        return coreSettings.defaultImageWidth;
    }

    let getNodeClasses = function() {
        return coreSettings.nodeClasses;
    }

    let getLabelClasses = function() {
        return coreSettings.labelClasses;
    }

    let getDefaultToHidden = function() {
        return coreSettings.defaultToHidden;
    }

    let getCanChangeTypeAfterCreation = function() {
        let result = coreSettings.canChangeTypeAfterCreation;

        if (result === undefined) {
            result = true;
        }

        return result;
    }

    let getDropExtensions = function() {
        return coreSettings.dropExtensions;
    }

    let getDropPrefixes = function() {
        return coreSettings.dropPrefixes;
    }

    let getDropPartials = function() {
        return coreSettings.dropPartials;
    }

    let getNodeSize = function() {
        return coreSettings.nodeSize;
    }

    let getCustom = function(propName) {
        return coreSettings[propName];
    }

    let setCustom = function(propName, propVal) {
        return coreSettings[propName] = propVal;
    }

    /* external interface */
    return /** @type {csTypeSettings} */ Object.freeze({
        "csType": 'typeSettings',
        "id": id,
        "replaceWith": replaceWith,
        "getDefaultWidth": getDefaultWidth,
        "getDefaultImageWidth": getDefaultImageWidth,
        "getNodeClasses": getNodeClasses,
        "getLabelClasses": getLabelClasses,
        "getDefaultToHidden": getDefaultToHidden,
        "getDefaultShowType": getDefaultShowType,
        "getCanChangeTypeAfterCreation": getCanChangeTypeAfterCreation,
        "getDropExtensions": getDropExtensions,
        "getDropPrefixes": getDropPrefixes,
        "getDropPartials": getDropPartials,
        "getNodeSize": getNodeSize,
        "getCustom": getCustom,
        "setCustom": setCustom,
        "export": _export
    });
}
