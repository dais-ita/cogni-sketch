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
 * @file Functions that define the object that instantiates a palette item type schema within the application.
 *
 * @author Dave Braines
 **/

import {sendTypeChangedEvent} from "../ui/tabs.js";

export const DEFAULT_COLOR = 'red';

/**
 * Create a new (palette) type schema and return it.
 *
 * @param {string} objId - the id of the parent csNode or csLink object.
 * @param {csRawSchema} rawSchema - the raw (serialized form) of the palette type schema to be used.
 * @return {csTypeSchema}
 */
export function create(objId, rawSchema) {
    let id = `schema_${objId}`;
    let coreSchema = rawSchema || {};

    let _export = function() {
        return coreSchema;
    }

    let getTypeName = function() {
        return coreSchema.type;
    }

    let setTypeName = function(val) {
        let oldTypeName = coreSchema.type;

        coreSchema.type = val;

        sendTypeChangedEvent({ "type": /** @type {csType} */ this, "change": 'schemaSetTypeName', "previousValue": oldTypeName });
    }

    let hasParents = function() {
        return !!coreSchema.parents;
    }

    let getParents = function() {
        return coreSchema.parents;
    }

    let setParents = function(val) {
        let oldParents = coreSchema.parents;

        coreSchema.parents = val;

        sendTypeChangedEvent({ "type": /** @type {csType} */ this, "change": 'schemaSetParents', "previousValue": oldParents });
    }

    let removeParents = function() {
        let oldParents = coreSchema.parents;

        delete coreSchema.parents;

        sendTypeChangedEvent({ "type": /** @type {csType} */ this, "change": 'schemaRemoveParents', "previousValue": oldParents });
    }

    let hasProperties = function() {
        return !!coreSchema.properties;
    }

    let getProperties = function() {
        return coreSchema.properties;
    }

    let setProperties = function(val) {
        let oldProperties = coreSchema.properties;

        coreSchema.properties = val;

        sendTypeChangedEvent({ "type": /** @type {csType} */ this, "change": 'schemaSetProperties', "previousValue": oldProperties });
    }

    let removeProperties = function() {
        let oldProperties = coreSchema.properties;

        delete coreSchema.properties;

        sendTypeChangedEvent({ "type": /** @type {csType} */ this, "change": 'schemaRemoveProperties', "previousValue": oldProperties });
    }

    /* external interface */
    return /** @type {csTypeSchema} */ Object.freeze({
        "csType": 'typeSchema',
        "id": id,
        "getTypeName": getTypeName,
        "setTypeName": setTypeName,
        "hasParents": hasParents,
        "getParents": getParents,
        "setParents": setParents,
        "removeParents": removeParents,
        "hasProperties": hasProperties,
        "getProperties": getProperties,
        "setProperties": setProperties,
        "removeProperties": removeProperties,
        "export": _export
    });
}
