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
 * @file Functions that define the object that instantiates a palette within the application.
 *
 * @author Dave Braines
 **/

import {create as createType} from "./wType.js";
import {
    sendPaletteChangedEvent,
    sendTypeChangedEvent
} from "../ui/tabs.js";

/**
 * Create a new palette instance and return it.
 *
 * @param {csRawPalette} thisPalette    the raw (serialized form) of the palette to be used.
 * @return {csPalette}
 */
export function create(thisPalette) {
    let _errors = [];

    const DEFAULT_PAL_NAME = 'default';
    const DEFAULT_ITEM_ID = 'unknown';

    let corePalette = thisPalette;      /* store the core_types palette */
    let wrappedItems = {};

    if (corePalette) {
        /* create the type items */
        for (let thisItem of Object.values(corePalette.items)) {
            let newItem = createType(thisItem);
            wrappedItems[thisItem.id] = newItem;
            sendTypeChangedEvent({ "type": /** @type {csType} */ newItem, "change": 'create' });
        }

        delete corePalette.items;
    } else {
        _errors.push('Palette not created as no core_types palette was specified');
    }

    /* functions */
    let getName = function() {
        return corePalette.name;
    }

    let setName = function(paletteName) {
        let oldName = corePalette.name;
        corePalette.name = paletteName;
        sendPaletteChangedEvent({ "palette": /** @type {csPalette} */ this, "change": 'setName', "previousValue": oldName });
    }

    let getOwner = function() {
        return corePalette.owner;
    }

    let isReadOnly = function() {
        return !!corePalette.readOnly;
    }

    let getSections = function() {
        return corePalette.sections;
    }

    let addSection = function(thisSection) {
        corePalette.sections.push(thisSection);
        sendPaletteChangedEvent({ "palette": /** @type {csPalette} */ this, "change": 'addSection', "id": thisSection.name });
    }

    let deleteSection = function(sectionName) {
        let success = false;

        if (!sectionHasItems(sectionName)) {
            let keptSections = [];

            for (let thisSection of corePalette.sections) {
                if (thisSection.name !== sectionName) {
                    keptSections.push(thisSection);
                }
            }

            corePalette.sections = keptSections;
            sendPaletteChangedEvent({ "palette": /** @type {csPalette} */ this, "change": 'deleteSection', "id": sectionName });
            success = true;
        }

        return success;
    }

    let getItemById = function(id) {
        if (id) {
            return wrappedItems[id.trim()];
        } else {
            return null;
        }
    }

    let getDefaultItem = function() {
        return wrappedItems[DEFAULT_ITEM_ID];
    }

    let isDefault = function() {
        return corePalette.name === DEFAULT_PAL_NAME;
    }

    let listItems = function() {
        return Object.values(wrappedItems);
    }

    let addItem = function(thisItem) {
        if (wrappedItems[thisItem.getId()]) {
            _errors.push(`Item ${thisItem.getId()} already exists, so this was not added`);
        } else {
            wrappedItems[thisItem.getId().trim()] = thisItem;
            sendPaletteChangedEvent({ "palette": /** @type {csPalette} */ this, "change": 'addItem', "id": thisItem.getId() });
            sendTypeChangedEvent({ "type": /** @type {csType} */ this, "change": 'addToPalette', "id": getName() });
        }
    }

    let renameItem = function(tgtItem, newName) {
        if (wrappedItems[newName]) {
            _errors.push(`Cannot rename item to existing name "($newName)"`);
        } else {
            let oldName = tgtItem.getId();
            tgtItem._setId(newName);
            wrappedItems[newName] = tgtItem;
            delete wrappedItems[oldName];
            sendPaletteChangedEvent({ "palette": /** @type {csPalette} */ this, "change": 'renameItem', "previousValue": oldName, "id": newName });
            sendTypeChangedEvent({ "type": /** @type {csType} */ this, "change": 'rename', "previousValue": oldName, "id": newName });
        }

        _reportAnyErrors();
    }

    let deleteItem = function(tgtItem) {
        delete wrappedItems[tgtItem.getId()];
        sendPaletteChangedEvent({ "palette": /** @type {csPalette} */ this, "change": 'deleteItem', "id": tgtItem.getId() });
        sendTypeChangedEvent({ "type": /** @type {csType} */ this, "change": 'delete' });
    }

    let getExtras = function getExtras() {
        return corePalette.extras;
    }

    let getSectionIndexFor = function(tgtNode) {
        let result =  -1;

        if (tgtNode) {
            let pos = 0;

            for (let section of getSections()) {
                if (section.name === tgtNode.getSection()) {
                    result = pos;
                }

                ++pos;
            }
        }

        return result;
    }

    /* private functions */
    function sectionHasItems(sectionName) {
        let answer = false;

        for (let wItem of Object.values(wrappedItems)) {
            if (wItem.isInSection(sectionName)) {
                answer = true;
            }
        }

        return answer;
    }

    let _reportAnyErrors = function() {
        for (let error of _errors) {
            console.error(error);
        }
    }

    /* special functions */
    let _delete = function() {
        _errors.push('Palette delete not yet implemented');
    }

    let _export = function() {
        let result;
        let exportedItems = {};

        if (wrappedItems) {
            for (let [key, thisItem] of Object.entries(wrappedItems)) {
                exportedItems[key] = thisItem.export();
            }
        }

        result = {
            "name": corePalette.name,
            "server_ts": corePalette.server_ts,
            "readOnly": corePalette.readOnly,
            "sections": corePalette.sections,
            "items": exportedItems
        };

        if (corePalette.owner) {
            result.owner = corePalette.owner;
        }

        if (corePalette.extras) {
            result.extras = corePalette.extras;
        }

        return result;
    }

    /* external interface */
    return /** @type {csPalette} */ Object.freeze({
        "csType": 'palette',
        "id": corePalette.name,
        "getName": getName,
        "setName": setName,
        "getOwner": getOwner,
        "isReadOnly": isReadOnly,
        "getSections": getSections,
        "addSection": addSection,
        "deleteSection": deleteSection,
        "getItemById": getItemById,
        "getDefaultItem": getDefaultItem,
        "isDefault": isDefault,
        "listItems": listItems,
        "addItem": addItem,
        "renameItem": renameItem,
        "deleteItem": deleteItem,
        "getExtras": getExtras,
        "getSectionIndexFor": getSectionIndexFor,
        "export": _export,
        "_delete": _delete,
        "_errors": _errors
    });
}
