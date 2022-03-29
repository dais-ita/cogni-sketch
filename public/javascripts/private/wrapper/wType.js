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
 * @file Functions that define the object that instantiates a palette item type within the application.
 *
 * @author Dave Braines
 **/

import {create as doCreateSchema} from "./wTypeSchema.js";
import {create as doCreateSettings} from "./wTypeSettings.js";
import {sendTypeChangedEvent} from "../ui/tabs.js";

export const DEFAULT_COLOR = 'red';

/**
 * Create a new (palette) type and return it.
 *
 * @param {csRawType} thisType    the raw (serialized form) of the palette type to be used.
 * @return {csType}
 */
export function create(thisType) {
    let _errors = [];
    let coreType = thisType;
    let wSchema;
    let wSettings;

    if (coreType) {
        if (coreType.schema && (Object.keys(coreType.schema).length > 0)) {
            wSchema = doCreateSchema(coreType.id, coreType.schema);
        }

        wSettings = doCreateSettings(coreType.id, coreType.settings);

        if (!coreType.layout) {
            coreType.layout = '';
        }
    } else {
        _errors.push('Type item not created as no core_types type item was specified');
    }

    /* functions */
    let getId = function() {
        return coreType.id;
    }

    let getPosition = function() {
        return coreType.position;
    }

    let getSection = function() {
        return coreType.section;
    }

    let setSection = function(secName) {
        let oldSection = coreType.section;

        coreType.section = secName;

        sendTypeChangedEvent({ "type": /** @type {csType} */ this, "change": 'setSection', "previousValue": oldSection });
    }

    let isInSection = function(secName) {
        return (coreType.section === secName);
    }

    let getLabel = function() {
        return coreType.label || coreType.id;
    }

    let getIcon = function() {
        let result =  {
            "icon": coreType.icon,
            "iconAlt": coreType.iconAlt
        };

        if (coreType.customColor) {
            result.customColor = coreType.customColor;
        }

        if (coreType.nodeColor) {
            result.color = coreType.nodeColor;
        }

        return result;
    }

    let setIcon = function(newIcon) {
        let oldIcon = { "icon": coreType.icon, "iconAlt": coreType.iconAlt };

        if (newIcon.icon) {
            coreType.icon = newIcon.icon;
        }

        if (newIcon.iconAlt) {
            coreType.iconAlt = newIcon.iconAlt;
        }

        sendTypeChangedEvent({ "type": /** @type {csType} */ this, "change": 'setIcon', "previousValue": oldIcon });
    }

    let hasNormalColor = function() {
        return !!coreType.nodeColor;
    }

    let getNormalColor = function() {
        return coreType.nodeColor;
    }

    let setNormalColor = function(val) {
        let oldColor = coreType.nodeColor;

        coreType.nodeColor = val;

        sendTypeChangedEvent({ "type": /** @type {csType} */ this, "change": 'setNormalColor', "previousValue": oldColor });
    }

    let removeNormalColor = function() {
        let oldColor = coreType.nodeColor;

        delete coreType.nodeColor;

        sendTypeChangedEvent({ "type": /** @type {csType} */ this, "change": 'removeNormalColor', "previousValue": oldColor });
    }

    let hasCustomColor = function() {
        return !!coreType.customColor;
    }

    let getCustomColor = function() {
        return coreType.customColor;
    }

    let setCustomColor = function(val) {
        let oldColor = coreType.customColor;

        coreType.customColor = val;

        sendTypeChangedEvent({ "type": /** @type {csType} */ this, "change": 'setCustomColor', "previousValue": oldColor });
    }

    let removeCustomColor = function() {
        let oldColor = coreType.customColor;

        delete coreType.customColor;

        sendTypeChangedEvent({ "type": /** @type {csType} */ this, "change": 'removeCustomColor', "previousValue": oldColor });
    }

    let getLayout = function() {
        return coreType.layout;
    }

    let setLayout = function(l) {
        let oldLayout = coreType.layout;

        coreType.layout = l;

        sendTypeChangedEvent({ "type": /** @type {csType} */ this, "change": 'schemaSetLayout', "previousValue": oldLayout });
    }

    let hasSchema = function() {
        return !!wSchema;
    }

    let createSchema = function() {
        if (!wSchema) {
            wSchema = doCreateSchema(coreType.id, {});
        }
    }

    let getSchema = function() {
        return wSchema;
    }

    let removeSchema = function() {
        if (wSchema) {
            let oldSchema = wSchema.export();

            wSchema = undefined;

            sendTypeChangedEvent({ "type": /** @type {csType} */ this, "change": 'removeSchema', "previousValue": oldSchema });
        }
    }

    let hasSettings = function() {
        return !!wSettings;
    }

    let getSettings = function() {
        return wSettings;
    }

    /* private functions */
    let _delete = function() {
        _errors.push('Type delete not yet implemented');
    }

    let _reportAnyErrors = function() {
        for (let error of _errors) {
            console.error(error);
        }
    }

    /* special functions */
    let _setId = function(val) {
        coreType.id = val;
    }

    let _export = function() {
        let result = {
            "id": coreType.id,
            "icon": coreType.icon,
            "iconAlt": coreType.iconAlt,
            "label": coreType.label,
            "position": coreType.position,
            "section": coreType.section,
            "settings": wSettings.export(),
            "layout": coreType.layout
        };

        if (wSchema) {
            result.schema = wSchema.export();
        }

        if (coreType.nodeColor) {
            result.nodeColor = coreType.nodeColor;
        } else {
            result.customColor = coreType.customColor;
        }

        return result;
    }

    _reportAnyErrors();

    /* external interface */
    return /** @type {csType} */ Object.freeze({
        "csType": 'paletteType',
        "id": coreType.id,
        "getId": getId,
        "getPosition": getPosition,
        "getSection": getSection,
        "setSection": setSection,
        "isInSection": isInSection,
        "getLabel": getLabel,
        "getIcon": getIcon,
        "setIcon": setIcon,
        "hasNormalColor": hasNormalColor,
        "getNormalColor": getNormalColor,
        "setNormalColor": setNormalColor,
        "removeNormalColor": removeNormalColor,
        "hasCustomColor": hasCustomColor,
        "getCustomColor": getCustomColor,
        "setCustomColor": setCustomColor,
        "removeCustomColor": removeCustomColor,
        "hasSchema": hasSchema,
        "createSchema": createSchema,
        "getSchema": getSchema,
        "removeSchema": removeSchema,
        "hasSettings": hasSettings,
        "getSettings": getSettings,
        "getLayout": getLayout,
        "setLayout": setLayout,
        "export": _export,
        "_delete": _delete,
        "_setId": _setId,
        "_errors": _errors
    });
}
