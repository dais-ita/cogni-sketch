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
 * @file Functions that define the core data object shared by csNode and csLink.
 *
 * @author Dave Braines
 **/

import {sendNodeChangedEvent} from "/javascripts/private/ui/tabs.js";
import {
    DEFAULT_PROP_TYPE,
    PROP_TYPE_JSON,
    PROP_TYPE_NORMAL,
    PROP_TYPE_TEXT
} from "./wrapper.js";

/**
 * Create a core data instance and return it.
 *
 * @param {string} objId - the id of the parent csNode or csLink object.
 * @param {csRawData} objData - the raw data.
 * @param {csType} [wType] - the palette item type (if this is a node).
 * @return {csData}
 */
export function create(objId, objData, wType) {
    let _errors = [];
    let id = `data_${objId}`;
    let data = objData || {};

    if (!data.properties) {
        data.properties = {};
    }

    if (wType) {
        if (wType.hasSchema()) {
            let typeProps = wType.getSchema().getProperties();

            /* If the type defines schema properties and they do not already exist on the node then create them */
            if (typeProps) {
                for (let [prop, details] of Object.entries(typeProps)) {
                    if (!data.properties[prop]) {
                        data.properties[prop] = { "type": details.type || PROP_TYPE_NORMAL, "value": details.default };
                    }
                }
            }
        }
    }

    /**
     * Get the label for this node, applying an optional  maximum length truncation with ellipses when needed.
     * See also: getFullLabel()
     *
     * @param {number} [maxLength] - the optional maximum label length allowed
     * @return {string}
     */
    let getLabel = function(maxLength) {
        let result =  data.label || '';

        if (maxLength) {
            if (result.length > maxLength) {
                result = result.substring(0, maxLength) + '...';
            }
        }

        return result;
    }

    /**
     * Set the label for this node.
     * Sends a 'setLabel' nodeChanged event.
     *
     * @param {string} labelText - the label text to be stored for this node.
     */
    let setLabel = function(labelText) {
        if (labelText) {
            let oldLabel = data.label;
            data.label = labelText;
            sendNodeChangedEvent({ "node": /** @type {csNode} */ this, "change": 'setLabel', "previousValue": oldLabel });
        }
    }

    let getData = function() {
        return data;
    }

    let hasPropertyNamed = function(propName) {
        return !!data.properties[propName];
    }

    /**
     * Get the property value for the specified property name.
     *
     * @param {string} propName     the name of the property to be retrieved.
     * @returns {string}            the property value.
     */
    let getPropertyNamed = function(propName) {
        let result;
        let propData = data.properties[propName];

        if (propData) {
            result = propData.value;
        }

        return result;
    }

    let getTypeForPropertyNamed = function(propName) {
        let result;
        let propData = data.properties[propName];

        if (propData) {
            result = propData.type;
        }

        return result;
    }

    let getTypeAndValueForPropertyNamed = function(propName) {
        return data.properties[propName];
    }

    /**
     * Set the named normal property with the specified value.
     *
     * @param {string} propName     the property name
     * @param {string} propVal      the property value object
     */
    let setNormalPropertyNamed = function(propName, propVal) {
        this.setPropertyNamed(propName, propVal, PROP_TYPE_NORMAL);
    }

    /**
     * Set the named text property with the specified value.
     *
     * @param {string} propName     the property name
     * @param {string} propVal      the property value
     */
    let setTextPropertyNamed = function(propName, propVal) {
        this.setPropertyNamed(propName, propVal, PROP_TYPE_TEXT);
    }

    /**
     * Set the named json property with the specified value.
     *
     * @param {string} propName     the property name
     * @param {object} propVal      the property value
     */
    let setJsonPropertyNamed = function(propName, propVal) {
        this.setPropertyNamed(propName, propVal, PROP_TYPE_JSON);
    }

    /**
     * Set the named property with the specified value, using the specified type.
     * Note - the convenience functions of set{Text|Normal|Json}PropertyNamed may be better for general usage.
     *
     * @param {string} propName     the property name
     * @param {object} propVal      the property value
     * @param {string} propType     the property type
     */
    let setPropertyNamed = function(propName, propVal, propType) {
        let oldProp = data.properties[propName];
        let oldType;
        let oldVal;

        if (oldProp) {
            oldType = oldProp.type;
            oldVal = oldProp.value;
        }

        if ((oldType !== propType) || (oldVal !== propVal)) {
            data.properties[propName] = { "type": propType || oldType || DEFAULT_PROP_TYPE, "value": propVal };

            // Report an error if JSON property set as non-object
            if (data.properties[propName].type === PROP_TYPE_JSON) {
                if (typeof propVal !== 'object') {
                    _errors.push(`'Setting non-object value to JSON property '${propName}' on ${this.getUid()}'`);
                }
            }

            _reportAnyErrors();
            sendNodeChangedEvent({ "node": /** @type {csNode} */ this, "change": 'setProperty', "id": propName, "previousValue": oldProp });
        }
    }

    let removePropertyNamed = function(propName) {
        let oldProp = data.properties[propName];

        delete data.properties[propName];

        sendNodeChangedEvent({ "node": /** @type {csNode} */ this, "change": 'removeProperty', "id": propName, "previousValue": oldProp });
    }

    let changePropertyType = function(propName, propType) {
        let oldProp = data.properties[propName];

        if (oldProp) {
            let oldType = oldProp.type;
            oldProp.type = propType;

            data.properties[propName].type = propType;

            sendNodeChangedEvent({ "node": /** @type {csNode} */ this, "change": 'changeType', "id": propName, "previousValue": oldType });
        }
    }

    let hasProperties = function() {
        return Object.keys(data.properties).length > 0;
    }

    let listProperties = function() {
        return data.properties;
    }

    let listPropertyValues = function() {
        let result = {};

        for (let [key, val] of Object.entries(data.properties)) {
            result[key] = val.value;
        }

        return result;
    }

    let isSemantic = function() {
        return data.isSemantic;
    }

    let _reportAnyErrors = function() {
        for (let error of _errors) {
            console.error(error);
        }
    }

    _reportAnyErrors();

    return /** @type {csData} */ Object.freeze({
        "csType": 'data',
        "id": id,
        "getLabel": getLabel,
        "setLabel": setLabel,
        "getData": getData,
        "hasPropertyNamed": hasPropertyNamed,
        "getPropertyNamed": getPropertyNamed,
        "getTypeAndValueForPropertyNamed": getTypeAndValueForPropertyNamed,
        "getTypeForPropertyNamed": getTypeForPropertyNamed,
        "setNormalPropertyNamed": setNormalPropertyNamed,
        "setTextPropertyNamed": setTextPropertyNamed,
        "setJsonPropertyNamed": setJsonPropertyNamed,
        "setPropertyNamed": setPropertyNamed,
        "removePropertyNamed": removePropertyNamed,
        "changePropertyType": changePropertyType,
        "hasProperties": hasProperties,
        "listProperties": listProperties,
        "listPropertyValues": listPropertyValues,
        "isSemantic": isSemantic
    });
}
