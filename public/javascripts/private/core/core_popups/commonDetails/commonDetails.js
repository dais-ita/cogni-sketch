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
 * @file Functions relating to the common elements shared between nodes and links (properties, relations and metadata).
 * @author Dave Braines
 **/

import {
    commonTemplate,
    jsonPropertyTemplate,
    metadataTemplate,
    normalPropertyTemplate,
    relationTemplate,
    textPropertyTemplate
} from "./templates/commonDetailsTemplates.js";
import {
    error,
    warn,
    show,
    showToast,
    userConfirm,
    userPrompt
} from "/javascripts/private/util/log.js";
import {
    expandCollapsible,
    getElement,
    hideElement,
    registerConfigEvents,
    showElement
} from "/javascripts/private/util/dom.js";
import {formatDateTime} from "/javascripts/private/util/timing.js";
import {hideNodeAndLinks} from "/javascripts/private/core/graphics.js";
import {getProject} from "/javascripts/private/state.js";
import {settings} from "/javascripts/private/core/core_settings.js";
import {openPopup as openPropTypePopup} from "/javascripts/private/core/core_popups/propertyType/propertyType.js";
import {getSessionModalObject} from "/javascripts/private/csData/csDataSession.js";
import {
    PROP_TYPE_JSON,
    PROP_TYPE_NORMAL,
    PROP_TYPE_TEXT
} from "/javascripts/private/wrapper/wrapper.js";
import {saveActionMisc} from "/javascripts/private/csData/change/csDataChanges.js";
import {
    isNode,
    isText
} from "/javascripts/private/util/data.js";

const ELEM_DEBUG_LINK = 'debug-link';
const ELEM_ADD_NORMAL_PROP = 'add-normal-property';
const ELEM_ADD_TEXT_PROP = 'add-text-property';
const ELEM_NORMAL_PROPS_BODY = 'existing-normal-properties-table-body';
const ELEM_TEXT_PROPS = 'existing-text-properties';
const ELEM_JSON_PROPS = 'json-properties';
const ELEM_REL_TABLE_BODY = 'relations-table-body';
const ELEM_JSON_PROP_SEC = 'json-properties-section';
const ELEM_JSON_PROP_MAIN = 'json-properties';
const ELEM_TEXT_PROP_MAIN = 'text-properties';
const FRAG_NAME_PROP = 'input-existing-prop-name-';
const FRAG_DEL_PROP = 'delete-existing-prop-';
const FRAG_CONV_PROP = 'convert-existing-prop-';
const FRAG_NAME_TEXT_PROP = 'input-text-prop-name-';
const FRAG_DEL_TEXT_PROP = 'delete-text-property-';
const FRAG_CONV_TEXT_PROP = 'convert-text-property-';
const FRAG_NAME_JSON_PROP = 'input-json-prop-name-';
const FRAG_DEL_JSON_PROP = 'delete-json-property-';
const FRAG_CONV_JSON_PROP = 'convert-json-property-';
const FRAG_NORMAL_PROP = 'property-';
const FRAG_TEXT_PROP = 'text-property-';
const FRAG_JSON_PROP = 'json-property-';
const FRAG_PROP_NAME = 'prop-name';
const FRAG_PROP_VAL = 'prop-val';
const FRAG_TEXT_EDITOR = 'text-editor-';
const FRAG_REL = 'link-';

const JSON_OPTIONS = {
    "collapsed": true,
    "withQuotes": true,
    "withLinks": true
};
const QUILL_OPTIONS = {
    "modules": {
        "toolbar": [
            [ 'bold', 'italic', 'underline', 'strike' ],            // toggled buttons
            [ 'blockquote', 'code-block' ],
            [ { "list": 'ordered' }, { "list": 'bullet' } ],
            [ { "script": 'sub' }, { "script": 'super' } ],         // superscript/subscript
            [ { "direction": 'rtl' } ],                             // text direction

            [ { "size": [ 'small', false, 'large', 'huge' ] } ],    // custom dropdown
            [ { "header": [ 1, 2, 3, 4, 5, 6, false ] } ],

            [ { "color": [] }, { "background": [] } ],              // dropdown with defaults from theme
            [ { "font": [] } ],
            [ { "align": [] } ],

            ['clean']                                               // remove formatting button
        ]
    },
    "placeholder": 'Enter text here',
    "theme": 'snow'
};

/**
 * Create the configuration for the meta-data section.
 *
 * @param {csNode|csLink} tgtNodeOrLink     the node or link object.
 * @return {csTemplateConfig}               the configuration object
 */
function calculateMetadataConfig(tgtNodeOrLink) {
    let config = {
        "html": {
            "nodeUid": tgtNodeOrLink.getUid(),
            "createdDate": formatDateTime(new Date(tgtNodeOrLink.getCreatedTimestamp())),
            "createdUser": tgtNodeOrLink.getCreatedUser()
        },
        "events": []

    };

    config.events.push({
        "elemId": ELEM_DEBUG_LINK,
        "event": 'click',
        "function": function() { actionShowNodeOrLinkInConsole(tgtNodeOrLink); }
    });

    return config;
}

/**
 * Create the configuration for properties section.
 *
 * @param {csNode|csLink} tgtNodeOrLink     the node or link object.
 * @param {boolean} noLinks                 whether to hide the relations section.
 * @return {csTemplateConfig}               the configuration object
 */
function calculatePropertiesConfig(tgtNodeOrLink, noLinks) {
    let normalPropClasses = 'collapse';
    let relationClasses = 'collapse';
    let textPropClasses = 'collapse';
    let jsonPropClasses = 'collapse';

    if (hasNormalProperties(tgtNodeOrLink)) {
        normalPropClasses += ' show';
    }

    if (hasRelations(tgtNodeOrLink)) {
        relationClasses += ' show';
    }

    if ((isNode(tgtNodeOrLink) && isText(/** @type {csNode} */ tgtNodeOrLink)) || hasTextProperties(tgtNodeOrLink)) {
        textPropClasses += ' show';
    }

    if (hasJsonProperties(tgtNodeOrLink)) {
        jsonPropClasses += ' show';
    }

    let config = {
        "html": {
            "insertRelations": !noLinks,
            "hasRelations": hasRelations(tgtNodeOrLink),
            "normalPropertyClasses": normalPropClasses,
            "relationClasses": relationClasses,
            "textPropertyClasses": textPropClasses,
            "jsonPropertyClasses": jsonPropClasses,
        },
        "events": []
    };

    config.events.push({
        "elemId": ELEM_ADD_NORMAL_PROP,
        "event": 'click',
        "function": function() { actionAddNormalProperty(tgtNodeOrLink); }
    });

    config.events.push({
        "elemId": ELEM_ADD_TEXT_PROP,
        "event": 'click',
        "function": function() { actionAddTextProperty(tgtNodeOrLink); }
    });

    return config;
}

/**
 * Create the configuration for a normal property.
 *
 * @param {csNode|csLink} tgtNodeOrLink     the node or link object.
 * @param {string} propName                 the property name.
 * @param {csRawPropVal} propVal            the property value+type.
 * @return {csTemplateConfig}               the configuration object.
 */
function calculateNormalPropertyConfig(tgtNodeOrLink, propName, propVal) {
    let convPropName = convertPropName(propName);
    let delElemName = `${FRAG_DEL_PROP}${convPropName}`;
    let convElemName = `${FRAG_CONV_PROP}${convPropName}`;
    let nameElemName = `${FRAG_NAME_PROP}${convPropName}`;
    let actualVal;
    let actualType;

    if (propVal) {
        actualVal = propVal.value;
        actualType = propVal.type;
    } else {
        actualVal = '';
        actualType = '';
    }

    let config = {
        "html": {
            "propName": propName,
            "convertedPropName": convPropName,
            "propVal": actualVal,
            "propType": actualType
        },
        "events": []
    };

    config.events.push({
        "elemId": nameElemName,
        "event": 'change',
        "function": checkPropertiesValid
    });

    config.events.push({
        "elemId": delElemName,
        "event": 'click',
        "function": function() { actionDeleteNormalProperty(propName); }
    });

    config.events.push({
        "elemId": convElemName,
        "event": 'click',
        "function": function() { actionConvertProperty(tgtNodeOrLink, propName); }
    });

    return config;
}

/**
 * Create the configuration for a text property.
 *
 * @param {csNode|csLink} tgtNodeOrLink     the node or link object.
 * @param {string} propName                 the property name.
 * @param {csRawPropVal} propVal            the property value+type.
 * @param {boolean} expanded                whether the section is expanded.
 * @return {csTemplateConfig}               the configuration object
 */
function calculateTextPropertyConfig(tgtNodeOrLink, propName, propVal, expanded) {
    let convPropName = convertPropName(propName);
    let delElemName = `${FRAG_DEL_TEXT_PROP}${convPropName}`;
    let convElemName = `${FRAG_CONV_TEXT_PROP}${convPropName}`;
    let nameElemName = `${FRAG_NAME_TEXT_PROP}${convPropName}`;
    let actualVal;

    if (propVal) {
        actualVal = propVal.value;
    } else {
        actualVal = '';
    }

    let textDetailClasses = 'collapse';

    if (expanded) {
        textDetailClasses += ' show';
    }

    let config = {
        "html": {
            "propName": propName,
            "convertedPropName": convPropName,
            "propVal": actualVal,
            "textDetailClasses": textDetailClasses
        },
        "events": []
    };

    config.events.push({
        "elemId": nameElemName,
        "event": 'change',
        "function": checkPropertiesValid
    });

    config.events.push({
        "elemId": delElemName,
        "event": 'click',
        "function": function() { actionDeleteTextProperty(tgtNodeOrLink, propName); }
    });

    config.events.push({
        "elemId": convElemName,
        "event": 'click',
        "function": function() { actionConvertProperty(tgtNodeOrLink, propName); }
    });

    return config;
}

/**
 * Create the configuration for a json property.
 *
 * @param {csNode|csLink} tgtNodeOrLink     the node or link object.
 * @param {string} propName                 the property name.
 * @param {csRawPropVal} propVal            the property value+type.
 * @return {csTemplateConfig}               the configuration object
 */
function calculateJsonPropertyConfig(tgtNodeOrLink, propName, propVal) {
    let convPropName = convertPropName(propName);
    let delElemName = `${FRAG_DEL_JSON_PROP}${convPropName}`;
    let convElemName = `${FRAG_CONV_JSON_PROP}${convPropName}`;
    let nameElemName = `${FRAG_NAME_JSON_PROP}${convPropName}`;
    let actualVal;

    if (propVal) {
        actualVal = propVal;
    } else {
        actualVal = '';
    }

    let config = {
        "html": {
            "propName": propName,
            "convertedPropName": convPropName,
            "propVal": actualVal
        },
        "events": []
    };

    config.events.push({
        "elemId": nameElemName,
        "event": 'change',
        "function": checkPropertiesValid
    });

    config.events.push({
        "elemId": delElemName,
        "event": 'click',
        "function": function() { actionDeleteJsonProperty(tgtNodeOrLink, propName); }
    });

    config.events.push({
        "elemId": convElemName,
        "event": 'click',
        "function": function() { actionConvertProperty(tgtNodeOrLink, propName); }
    });

    return config;
}

/**
 * Create the configuration for a relation.
 *
 * @param {csNode|csLink} tgtNodeOrLink     the node or link object.
 * @param {csLink} thisLink                 the link to be shown.
 * @param {string} directionText            an arrow that indicates the direction of the relationship.
 * @return {csTemplateConfig}               the configuration object
 */
function calculateRelationConfig(tgtNodeOrLink, thisLink, directionText) {
    let otherNode = thisLink.getOtherNode(tgtNodeOrLink);
    let checkedText = '';
    let disabledText = '';
    let linkTitle;

    if (otherNode && otherNode.isHidden()) {
        checkedText = 'checked';
    }

    if (otherNode && otherNode.listAllLinks().length > 1) {
        disabledText = 'disabled';
        linkTitle = 'Cannot hide because the node has other links';
    } else {
        linkTitle = 'Check this to hide the related node';
    }

    return {
        "html": {
            "linkUid": thisLink.getUid(),
            "linkName": thisLink.getLabel() || '(no label)',
            "direction": directionText,
            "relatedNode": (otherNode && otherNode.getLabel()) || '(no label)',
            "linkTitle": linkTitle,
            "disabled": disabledText,
            "checked": checkedText
        },
        "events": []
    };
}

/**
 * Insert the meta data section of the form.
 *
 * @param {csNode|csLink} tgtNodeOrLink     the node or link object.
 * @param {string} elemId                   the id of the dom element where this should be inserted.
 */
export function insertMetaDataSection(tgtNodeOrLink, elemId) {
    let elem = getElement(elemId);

    if (elem) {
        htmlForMetaDataSection(elem, tgtNodeOrLink);
    }
}

/**
 * Insert the common section of the form.
 *
 * @param {csNode|csLink} tgtNodeOrLink     the node or link object.
 * @param {string} elemId                   the id of the dom element where this should be inserted.
 * @param {boolean} [noLinks=false]         whether to hide the relations section.
 */
export function insertCommonSection(tgtNodeOrLink, elemId, noLinks) {
    let elem = getElement(elemId);

    if (elem) {
//        addMissingProperties(tgtNodeOrLink);

        htmlForCommonSection(elem, tgtNodeOrLink, noLinks);

        insertProperties(tgtNodeOrLink);

        if (!noLinks) {
            insertRelations(tgtNodeOrLink);
        }

        showOrHideJsonSection(tgtNodeOrLink);
    }
}

// /**
//  * Nodes may have expected properties that are missing.  This is usually because an empty node is being edited.
//  * Create default values of any missing properties.
//  *
//  * @param {csNode|csLink} tgtNodeOrLink     the node or link object.
//  */
// function addMissingProperties(tgtNodeOrLink) {
//     if (isNode(tgtNodeOrLink)) {
//         if (isText(tgtNodeOrLink) && !hasTextProperties(tgtNodeOrLink)) {
//             /* This is a text node with no text properties, so add the default text property */
//             tgtNodeOrLink.setNormalPropertyNamed('text', '');
//         }
//     }
// }

/**
 * Insert html for all of the properties for this node or link.
 *
 * @param {csNode|csLink} tgtNodeOrLink     the node or link object.
 */
function insertProperties(tgtNodeOrLink) {
    if (hasNormalProperties(tgtNodeOrLink)) {
        insertNormalProperties(tgtNodeOrLink);
    }

    if (hasTextProperties(tgtNodeOrLink)) {
        insertTextProperties(tgtNodeOrLink);
    }

    if (hasJsonProperties(tgtNodeOrLink)) {
        insertJsonProperties(tgtNodeOrLink);
    }
}

/**
 * Insert html for any normal properties for this node or link.
 *
 * @param {csNode|csLink} tgtNodeOrLink     the node or link object.
 */
function insertNormalProperties(tgtNodeOrLink) {
    let elem = /** @type {HTMLTableSectionElement} */ getElement(ELEM_NORMAL_PROPS_BODY);

    if (elem) {
        for (let [propName, val] of Object.entries(tgtNodeOrLink.listProperties())) {
            if (!isTextProperty(val) && !isJsonProperty(val)) {
                htmlForNormalProperty(elem, tgtNodeOrLink, propName, val);
            }
        }
    }
}

/**
 * Insert html for a new normal property (created when the user clicks on 'add property').
 *
 * @param {csNode|csLink} tgtNodeOrLink     the node or link object.
 * @param {string} propName                 the name of the new property.
 */
function insertNewNormalProperty(tgtNodeOrLink, propName) {
    let elem = /** @type {HTMLTableSectionElement} */ getElement(ELEM_NORMAL_PROPS_BODY);

    if (elem) {
        htmlForNormalProperty(elem, tgtNodeOrLink, propName);
    }
}

/**
 * Insert html for any text properties for this node or link.
 *
 * @param {csNode|csLink} tgtNodeOrLink     the node or link object.
 */
function insertTextProperties(tgtNodeOrLink) {
    let elem = getElement(ELEM_TEXT_PROPS);

    if (elem) {
        for (let [propName, val] of Object.entries(tgtNodeOrLink.listProperties())) {
            if (isTextProperty(val)) {
                let expanded = true;        //TODO: Make this dynamic

                htmlForTextProperty(elem, tgtNodeOrLink, propName, val, expanded);
            }
        }
    }
}

/**
 * Insert html for a new text property (created when the user clicks on 'add text property').
 *
 * @param {string} propName         the name of the new property.
 * @param {csNode|csLink} tgtNodeOrLink     the node or link object.
 */
function insertNewTextProperty(propName, tgtNodeOrLink) {
    let elem = getElement(ELEM_TEXT_PROPS);

    if (elem) {
        htmlForTextProperty(elem, tgtNodeOrLink, propName, undefined, true);
    }
}

/**
 * Insert html for any json properties for this node or link.
 *
 * @param {csNode|csLink} tgtNodeOrLink     the node or link object.
 */
function insertJsonProperties(tgtNodeOrLink) {
    for (let [propName, val] of Object.entries(tgtNodeOrLink.listProperties())) {
        if (isJsonProperty(val)) {
            let propVal;

            if (val) {
                propVal = val.value;
            }

            let failed = insertJsonProperty(tgtNodeOrLink, propName, val);

            if (failed) {
                let elem = /** @type {HTMLTableSectionElement} */ getElement(ELEM_NORMAL_PROPS_BODY);

                htmlForNormalProperty(elem, tgtNodeOrLink, propName, val);
            }
        }
    }
}

/**
 * Insert html for a specific existing json property.
 *
 * @param {csNode|csLink} tgtNodeOrLink     the node or link object.
 * @param {string} propName         the name of the json property.
 * @param {csRawPropVal} propVal    the value of the json property.
 */
function insertJsonProperty(tgtNodeOrLink, propName, propVal) {
    let elem = /** @type {HTMLTableSectionElement} */ getElement(ELEM_JSON_PROPS);
    let failed = false;

    if (elem && propVal) {
        let jsonObj;

        if (typeof propVal.value === 'string') {
            try {
                jsonObj = JSON.parse(propVal.value);
            } catch(e) {
                failed = true;
                error(`Error parsing '${propName}' JSON.  Property will be shown as a normal property.`, e, propVal, true);
            }
        } else {
            jsonObj = propVal.value;
        }

        if (jsonObj) {
            htmlForJsonProperty(elem, tgtNodeOrLink, propName, propVal);
        }
    }

    return failed;
}

/**
 * Insert html for any relations for this node or link.
 *
 * @param {csNode|csLink} tgtNodeOrLink     the node or link object.
 */
function insertRelations(tgtNodeOrLink) {
    //TODO: Upgrade this to include links when links can have relationships
    if (isNode(tgtNodeOrLink)) {
        let directionText;

        directionText = '<->';
        for (let thisLink of tgtNodeOrLink.listBidirectionalLinks()) {
            insertRelation(tgtNodeOrLink, thisLink, directionText);
        }

        directionText = '->';
        for (let thisLink of tgtNodeOrLink.listOutgoingLinks()) {
            insertRelation(tgtNodeOrLink, thisLink, directionText);
        }

        directionText = '<-';
        for (let thisLink of tgtNodeOrLink.listIncomingLinks()) {
            insertRelation(tgtNodeOrLink, thisLink, directionText);
        }
    }
}

/**
 * Insert html for a specific relation.
 *
 * @param {csNode|csLink} tgtNodeOrLink     the node or link object.
 * @param {csLink} thisLink                 the link to be shown.
 * @param {string} directionText            an arrow that indicates the direction of the relationship.
 */
function insertRelation(tgtNodeOrLink, thisLink, directionText) {
    let elem = /** @type {HTMLTableSectionElement} */ getElement(ELEM_REL_TABLE_BODY);

    if (elem) {
        htmlForRelation(elem, tgtNodeOrLink, thisLink, directionText);
    }
}

/**
 * Generate and insert html into the parent element for the meta data section.
 *
 * @param {HTMLElement} parent              the parent element to be updated.
 * @param {csNode|csLink} tgtNodeOrLink     the node or link object.
 */
function htmlForMetaDataSection(parent, tgtNodeOrLink) {
    let config = calculateMetadataConfig(tgtNodeOrLink);
    let compiled = Handlebars.compile(metadataTemplate);

    parent.innerHTML = compiled(config.html);

    registerConfigEvents(config.events);
}

/**
 * Generate and insert html into the parent element for the common section.
 *
 * @param {HTMLElement} parent              the parent element to be updated.
 * @param {csNode|csLink} tgtNodeOrLink     the node or link object.
 * @param {boolean} noLinks                 whether to hide the relations section.
 */
function htmlForCommonSection(parent, tgtNodeOrLink, noLinks) {
    let compiled = Handlebars.compile(commonTemplate);
    let config = calculatePropertiesConfig(tgtNodeOrLink, noLinks);

    parent.innerHTML = compiled(config.html);

    registerConfigEvents(config.events);
}

/**
 * Generate and insert html into the parent element for a normal property.
 *
 * @param {HTMLTableSectionElement} parent      the parent element to be updated.
 * @param {csNode|csLink} tgtNodeOrLink         the node or link object.
 * @param {string} propName                     the property name.
 * @param {csRawPropVal} [propVal]              the property value.
 */
function htmlForNormalProperty(parent, tgtNodeOrLink, propName, propVal) {
    let config = calculateNormalPropertyConfig(tgtNodeOrLink, propName, propVal);
    let compiled = Handlebars.compile(normalPropertyTemplate);
    let tr = parent.insertRow();

    tr.outerHTML = compiled(config.html);

    registerConfigEvents(config.events);
}

/**
 * Generate and insert html into the parent element for a text property.
 *
 * @param {HTMLElement} parent                  the parent element to be updated.
 * @param {csNode|csLink} tgtNodeOrLink         the node or link object.
 * @param {string} propName                     the property name.
 * @param {csRawPropVal} [propVal]              the property value+type.
 * @param {boolean} expanded                    whether the property details are expanded.
 */
function htmlForTextProperty(parent, tgtNodeOrLink, propName, propVal, expanded) {
    let config = calculateTextPropertyConfig(tgtNodeOrLink, propName, propVal, expanded);
    let compiled = Handlebars.compile(textPropertyTemplate);
    let elem = document.createElement('DIV');

    parent.appendChild(elem);
    elem.outerHTML = compiled(config.html);

    registerConfigEvents(config.events);

    initialiseEditor(`${FRAG_TEXT_EDITOR}${convertPropName(propName)}`);
}

function convertPropName(propName) {
    return propName.split(' ').join('_');
}

/**
 * Generate and insert html into the parent element for a json property.
 *
 * @param {HTMLTableSectionElement} parent      the parent element to be updated.
 * @param {csNode|csLink} tgtNodeOrLink         the node or link object.
 * @param {string} propName                     the property name.
 * @param {csRawPropVal} propVal                the property type+value.
 */
function htmlForJsonProperty(parent, tgtNodeOrLink, propName, propVal) {
    let failed = false;
    let jsonObj;

    if (typeof propVal.value === 'string') {
        try {
            jsonObj = JSON.parse(propVal.value);
        } catch(e) {
            failed = true;
            error(`Error parsing '${propName}' JSON.  Property will be shown as a normal property.`, e, propVal, true);
        }
    } else {
        jsonObj = propVal.value;
    }

    if (!failed) {
        let config = calculateJsonPropertyConfig(tgtNodeOrLink, propName, jsonObj);
        let compiled = Handlebars.compile(jsonPropertyTemplate);
        let elem = document.createElement('DIV');

        parent.appendChild(elem);
        elem.outerHTML = compiled(config.html);

        registerConfigEvents(config.events);
        $(`#json-renderer-${convertPropName(propName)}`).jsonViewer(jsonObj, JSON_OPTIONS);
        storeJsonDataProperty(`json-renderer-${convertPropName(propName)}`, jsonObj);
    } else {
        let parent = /** @type {HTMLTableSectionElement} */ getElement(ELEM_NORMAL_PROPS_BODY);

        htmlForNormalProperty(parent, tgtNodeOrLink, propName, propVal);
    }
}

function storeJsonDataProperty(elemId, jsonObj) {
    let elem = document.getElementById(elemId);

    if (elem) {
        elem.dataset.json = JSON.stringify(jsonObj);
    }
}

/**
 * Generate and insert html into the parent element for a relation.
 *
 * @param {HTMLElement} parent              the parent element to be updated.
 * @param {csNode|csLink} tgtNodeOrLink     the node or link object.
 * @param {csLink} thisLink                 the link to be shown.
 * @param {string} directionText            an arrow that indicates the direction of the relationship.
 */
function htmlForRelation(parent, tgtNodeOrLink, thisLink, directionText) {
    let config = calculateRelationConfig(tgtNodeOrLink, thisLink, directionText);
    let compiled = Handlebars.compile(relationTemplate);
    let elem = document.createElement('DIV');

    parent.appendChild(elem);
    elem.outerHTML = compiled(config.html);

    registerConfigEvents(config.events);
}

/**
 * Initialise the quill text editor for the specified dom element.
 *
 * @param {string} elemId       the id of the dom element that contains the quill editor.
 */
function initialiseEditor(elemId) {
    new Quill('#' + elemId, QUILL_OPTIONS);
}

/**
 * If the node or link has json properties then the section is shown, otherwise it is hidden.
 *
 * @param {csNode|csLink} tgtNodeOrLink     the node or link to check.
 * @param {boolean} [checkForm=false]       if specified then check the form rather than the node or link.
 * @param {boolean} [expand=false]          if specified then expand the section.
 */
function showOrHideJsonSection(tgtNodeOrLink, checkForm, expand) {
    let hasJson;

    if (checkForm) {
        hasJson = hasFormJsonProperties();
    } else {
        hasJson = hasJsonProperties(tgtNodeOrLink);
    }

    if (hasJson) {
        showElement(ELEM_JSON_PROP_SEC);
        expandCollapsible(ELEM_JSON_PROP_MAIN);
    } else {
        hideElement(ELEM_JSON_PROP_SEC);
    }
}

/**
 * Log the details of the node or link to the developer console.
 *
 * @param {csNode|csLink} tgtNodeOrLink     the node or link to be shown.
 */
function actionShowNodeOrLinkInConsole(tgtNodeOrLink) {
    if (isNode(tgtNodeOrLink)) {
        saveActionMisc('canvas:debugNode', tgtNodeOrLink);
    } else {
        saveActionMisc('canvas:debugLink', null, { "linkId": tgtNodeOrLink.id });
    }

    show(tgtNodeOrLink.getTypeName());
    show(tgtNodeOrLink.export());
}

/**
 * The user has chosen to add a new normal property.  Ask for the name, check it is unique and update the form if valid.
 *
 * @param {csNode|csLink} tgtNodeOrLink      the node or link for which to show the details.
 */
function actionAddNormalProperty(tgtNodeOrLink) {
    let propName = userPrompt('What is the name of the new property?');

    if (propName) {
        if (isValidPropertyName(propName, true)) {
            insertNewNormalProperty(tgtNodeOrLink, propName);

            if (isNode(tgtNodeOrLink)) {
                saveActionMisc('node:addNormalProperty', tgtNodeOrLink, { "propName": propName });
            } else {
                saveActionMisc('link:addNormalProperty', null, { "linkId": tgtNodeOrLink.id, "propName": propName });
            }
        } else {
            showToast(`The property name '${propName}' is not valid - it is already being used.`);
        }
    }
}

/**
 * The user has chosen to add a new text property.  Ask for the name, check it is unique and update the form if valid.
 *
 * @param {csNode|csLink} tgtNodeOrLink      the node or link for which to show the details.
 */
function actionAddTextProperty(tgtNodeOrLink) {
    let propName = userPrompt('What is the name of the new text property?');

    if (propName) {
        if (isValidPropertyName(propName, true)) {
            insertNewTextProperty(propName, tgtNodeOrLink);

            if (isNode(tgtNodeOrLink)) {
                saveActionMisc('node:addTextProperty', tgtNodeOrLink, { "propName": propName });
            } else {
                saveActionMisc('link:addTextProperty', null, { "linkId": tgtNodeOrLink.id, "propName": propName });
            }
        } else {
            showToast(`The property ${propName} is not valid - it is already being used.`);
        }
    }
}

/**
 * The user has chosen to delete this normal property so remove it from the popup window.
 *
 * @param {string} propName     the name of the property to be deleted
 */
function actionDeleteNormalProperty(propName) {
    if (getProject().isReadOnly()) {
        error('Cannot delete property - project is read only', null, null, true);
    } else {
        if (userConfirm('Are you sure you want to delete this property?')) {
            let elem = getElement(`${FRAG_NORMAL_PROP}${convertPropName(propName)}`);

            if (elem) {
                elem.parentElement.removeChild(elem);
            }
        }
    }
}

/**
 * The user has chosen to delete this json property so remove it from the popup window.
 *
 * @param {csNode|csLink} tgtNodeOrLink     the node or link being shown by the window
 * @param {string} propName                 the name of the property to be deleted
 */
function actionDeleteJsonProperty(tgtNodeOrLink, propName) {
    if (getProject().isReadOnly()) {
        error('Cannot delete property - project is read only', null, null, true);
    } else {
        if (userConfirm('Are you sure you want to delete this JSON property?')) {
            let elem = getElement(`${FRAG_JSON_PROP}${convertPropName(propName)}`);

            if (elem) {
                elem.parentElement.removeChild(elem);

                showOrHideJsonSection(tgtNodeOrLink, true)
            }
        }
    }
}

/**
 * The user has chosen to delete this text property so remove it from the popup window.
 *
 * @param {csNode|csLink} tgtNodeOrLink     the node or link being shown by the window
 * @param {string} propName                 the name of the property to be deleted
 */
function actionDeleteTextProperty(tgtNodeOrLink, propName) {
    if (getProject().isReadOnly()) {
        error('Cannot delete property - project is read only', null, null, true);
    } else {
        if (userConfirm('Are you sure you want to delete this text property?')) {
            let elem = getElement(`${FRAG_TEXT_PROP}${convertPropName(propName)}`);

            if (elem) {
                elem.parentElement.removeChild(elem);

                showOrHideJsonSection(tgtNodeOrLink)
            }
        }
    }
}

/**
 * The user has chosen to convert this property to a different type.
 *
 * @param {csNode|csLink} tgtNodeOrLink     the node or link object.
 * @param {string} propName                 the name of the property to be converted.
 */
function actionConvertProperty(tgtNodeOrLink, propName) {
    let propVal = getFormProperty(propName);

    openPropTypePopup(tgtNodeOrLink, propName, propVal.type, propVal.value, settings.general.propertyTypes, redrawProperty);
}

function redrawProperty(propName, oldType, newType, newValue) {
    if (oldType !== newType) {
        let fragPart;

        //TODO: Make this more dynamic
        if (oldType === PROP_TYPE_JSON) {
            fragPart = FRAG_JSON_PROP;
        } else if (oldType === PROP_TYPE_TEXT) {
            fragPart = FRAG_TEXT_PROP;
        } else {
            fragPart = FRAG_NORMAL_PROP;
        }

        let thisFormProp = getFormProperty(propName);
        thisFormProp.type = newType;

        if (newValue) {
            thisFormProp.value = newValue;
        }

        //First remove the old element
        let elem = getElement(`${fragPart}${convertPropName(propName)}`);

        if (elem) {
            elem.parentElement.removeChild(elem);
        }

        //Now add the new element
        let tgtNodeOrLink = getSessionModalObject();

        if (newType === PROP_TYPE_JSON) {
            let parent = /** @type {HTMLTableSectionElement} */ getElement(ELEM_JSON_PROPS);

            htmlForJsonProperty(parent, tgtNodeOrLink, propName, thisFormProp);
        } else if (newType === PROP_TYPE_TEXT) {
            let parent = getElement(ELEM_TEXT_PROPS);

            htmlForTextProperty(parent, tgtNodeOrLink, propName, thisFormProp, true);
            expandCollapsible(ELEM_TEXT_PROP_MAIN);
        } else {
            let parent = /** @type {HTMLTableSectionElement} */ getElement(ELEM_NORMAL_PROPS_BODY);

            htmlForNormalProperty(parent, tgtNodeOrLink, propName, thisFormProp);
        }

        showOrHideJsonSection(tgtNodeOrLink, true, true);
    } else {
        warn('Property was not changed as the handler type is the same');
    }
}

/**
 * Check each of the properties on the form to ensure the names are distinct and valid.
 *
 * @return {boolean}    whether the properties are valid.
 */
export function checkPropertiesValid() {
    let isValid = true;
    let formProps = getFormProperties();

    for (let prop of formProps) {
        if (isValid) {
            isValid = isValidPropertyName(prop.name, false, formProps);
        }
    }

    if (!isValid) {
        showToast('Duplicate or empty property name detected.  Please fix before saving');
    }

    return isValid;
}

/**
 * Return true if the node or link has any relations.
 *
 * Currently only nodes are checked, and links always return false.  Replace this with a live test when links are
 * upgraded to have relations too.
 *
 * @param {csNode|csLink} tgtNodeOrLink     the node or link to check.
 * @return {boolean}                        whether the node or link has relations.
 */
function hasRelations(tgtNodeOrLink) {
    //TODO: Upgrade when links can have relations
    let result = false;

    if (isNode(tgtNodeOrLink)) {
        result = tgtNodeOrLink.listAllLinks().length > 0;
    }

    return result;
}

/**
 * Return true if the node or link has any properties that are not the pre-defined 'normal' ones.
 *
 * @param {csNode|csLink} tgtNodeOrLink     the node or link to check.
 * @return {boolean}                        whether the node or link has normal properties.
 */
function hasNormalProperties(tgtNodeOrLink) {
    let result = false;

    for (let val of Object.values(tgtNodeOrLink.listProperties())) {
        if (!isTextProperty(val) && !isJsonProperty(val)) {
            result = true;
        }
    }

    return result;
}

/**
 * Return true if the node or link has any properties that are text properties.
 *
 * @param {csNode|csLink} tgtNodeOrLink     the node or link to check.
 * @return {boolean}                        whether the node or link has text properties.
 */
function hasTextProperties(tgtNodeOrLink) {
    let result = false;

    for (let val of Object.values(tgtNodeOrLink.listProperties())) {
        if (isTextProperty(val)) {
            result = true;
        }
    }

    return result;
}

/**
 * Return true if the node or link has any properties that are json properties.
 *
 * @param {csNode|csLink} tgtNodeOrLink     the node or link to check.
 * @return {boolean}                        whether the node or link has json properties.
 */
function hasJsonProperties(tgtNodeOrLink) {
    let result = false;

    for (let val of Object.values(tgtNodeOrLink.listProperties())) {
        if (isJsonProperty(val)) {
            result = true;
        }
    }

    return result;
}

/**
 * Return true if there are any json properties defined on the form.
 *
 * @return {boolean}    whether there are any json properties defined on the form.
 */
function hasFormJsonProperties() {
    let result = false;
    let elem = getElement(ELEM_JSON_PROPS);

    if (elem) {
        result = elem.children.length > 0;
    }

    return result;
}

/**
 * Returns true is the specified property is a text property.
 *
 * @param {csRawPropVal} propVal    the property type+value to be checked.
 * @return {boolean}                whether the property is a text property.
 */
function isTextProperty(propVal) {
    let propType = settings.general.propertyTypes[propVal.type];

    return propType && propType.handler === PROP_TYPE_TEXT;
}

/**
 * Returns true is the specified property is a json property.
 *
 * @param {csRawPropVal} propVal    the property type+value to be checked.
 * @return {boolean}                whether the property is a json property.
 */
function isJsonProperty(propVal) {
    let propType = settings.general.propertyTypes[propVal.type];

    return propType && propType.handler === PROP_TYPE_JSON;
}

/**
 * Check whether the specified property name is valid.  If specified then the current form will be checked to see
 * if a property with that name already exists.
 *
 * @param {string} propName             the property name to be checked.
 * @param {boolean} isNew               whether the property name is being added (true) or edited (false).
 * @param {object[]} [formProps]        the list of form properties.
 * @returns {boolean}                   whether the property name is valid.
 */
function isValidPropertyName(propName, isNew, formProps) {
    let isValid;
    let matches = 0;
    let lcPropName = propName.trim().toLowerCase();
    let existingProps = formProps || getFormProperties();

    for (let prop of existingProps) {
        if (prop.name.trim().toLowerCase() === lcPropName) {
            ++matches;
        }
    }

    if (isNew) {
        /* A new property must have no matches to property names on the form */
        isValid = (matches === 0);
    } else {
        /* An existing property must have only one property names on the form (itself) */
        isValid = (matches === 1);
    }

    return isValid;
}

function getFormProperty(propName) {
    let formProps = getFormProperties();
    let result;

    for (let prop of formProps) {
        if (prop.name === propName) {
            result = prop;
        }
    }

    return result;
}

/**
 * List all of the properties from the form.
 *
 * @return {[]}     an array of [property name, property value] for each property on the form.
 */
function getFormProperties() {
    let normal = getNormalFormProperties();
    let json = getJsonFormProperties();
    let text = getTextFormProperties();

    return normal.concat(json).concat(text);
}

/**
 * List all of the normal properties from the form.
 *
 * @return {[]}     an array of [property name, property value] for each normal property on the form.
 */
function getNormalFormProperties() {
    let parent = getElement(ELEM_NORMAL_PROPS_BODY);
    let formProps = [];

    if (parent) {
        for (let propRow of parent.children) {
            let thisProp = { "name": '', "type": PROP_TYPE_NORMAL, "value": '' };

            /* iterate through the cells and their children, extracting the values from the property input nodes */
            for (let propCell of propRow.children) {
                for (let propPart of propCell.children) {
                    if (propPart.nodeName === 'INPUT') {
                        if (propPart.getAttribute('id').indexOf(FRAG_PROP_NAME) > -1) {
                            thisProp.name = propPart.value;
                        } else if (propPart.getAttribute('id').indexOf(FRAG_PROP_VAL) > -1) {
                            thisProp.value = propPart.value;
                        }
                    }
                }
            }

            /* add the property if it is valid, i.e. has a name */
            if (thisProp.name) {
                formProps.push(thisProp);
            }
        }
    }

    return formProps;
}

/**
 * List all of the json properties from the form.
 *
 * @return {[]}     an array of [property name, property value] for each json property on the form.
 */
function getJsonFormProperties() {
    let parent = getElement(ELEM_JSON_PROPS);
    let formProps = [];

    if (parent) {
        for (let propOuter of parent.children) {
            let thisProp = { "name": '', "type": PROP_TYPE_JSON, "value": '' };

            /* iterate through the cells and their children, extracting the values from the property input nodes */
            for (let propInner of propOuter.children) {
                if (propInner.nodeName === 'INPUT') {
                    if (propInner.getAttribute('id').indexOf(FRAG_PROP_NAME) > -1) {
                        thisProp.name = propInner.value;
                    }
                } else if (propInner.nodeName === 'PRE') {
                    thisProp.value = propInner.dataset.json;
                }
            }

            /* add the property if it is valid, i.e. has a name */
            if (thisProp.name) {
                formProps.push(thisProp);
            }
        }
    }

    return formProps;
}

/**
 * List all of the text properties from the form.
 *
 * @return {[]}     an array of [property name, property value] for each text property on the form.
 */
function getTextFormProperties() {
    let parent = getElement(ELEM_TEXT_PROPS);
    let formProps = [];

    if (parent) {
        for (let propOuter of parent.children) {
            let thisProp = { "name": '', "type": PROP_TYPE_TEXT, "value": '' };

            /* iterate through the cells and their children, extracting the values from the property input nodes */
            for (let propInner of propOuter.children) {
                if (propInner.nodeName === 'INPUT') {
                    if (propInner.getAttribute('id').indexOf(FRAG_PROP_NAME) > -1) {
                        thisProp.name = propInner.value;
                    }
                } else if (propInner.nodeName === 'DIV') {
                    thisProp.value = seekRichTextContent(propInner);
                }
            }

            /* add the property if it is valid, i.e. has a name */
            if (thisProp.name) {
                formProps.push(thisProp);
            }
        }
    }

    return formProps;
}

/**
 * Recursively seek the child element that contains the quill editor and get the text contents.
 *
 * @param {Element} elem        the dom element within which the templates will be sought.
 * @return {string}             the text templates of the editor.
 */
function seekRichTextContent(elem) {
    let result;

    if (elem.classList.contains('ql-editor')) {
        result = elem.innerHTML;
    } else {
        if (!elem.classList.contains('ql-toolbar') && !elem.classList.contains('ql-clipboard') && !elem.classList.contains('ql-tooltip')) {
            for (let childElem of elem.children) {
                if (!result) {
                    result = seekRichTextContent(childElem);
                }
            }
        }
    }

    return result;
}

/**
 * Save the properties and relations (checkboxes showing if nodes are hidden) for this popup window.
 *
 * @param {csNode|csLink} tgtNodeOrLink     the node or link to be modified.
 */
export function savePropertiesAndRelations(tgtNodeOrLink) {
    saveProperties(tgtNodeOrLink);
    saveRelations(tgtNodeOrLink);
}

/**
 * Iterate through each of the form properties and persist onto the node or link.  Delete any properties that remain
 * on the node or link but were not on the form since they have been deleted by the user.
 *
 * @param {csNode|csLink} tgtNodeOrLink     the node or link to be modified.
 */
function saveProperties(tgtNodeOrLink) {
    let donePropertyNames = [];
    let formProps = getFormProperties();

    for (let prop of formProps) {
        // JSON properties cannot be edited so don't save them
        // if (prop.type !== 'json') {
            let currentProp = tgtNodeOrLink.getTypeAndValueForPropertyNamed(prop.name);

            if (currentProp) {
                if (currentProp.type !== prop.type) {
                    if (isNode(tgtNodeOrLink)) {
                        saveActionMisc('node:changedPropertyType', tgtNodeOrLink, { "property": prop });
                    } else {
                        saveActionMisc('link:changedPropertyType', null, { "linkId": tgtNodeOrLink.id, "property": prop });
                    }
                }

                if (currentProp.value !== prop.value) {
                    if (isNode(tgtNodeOrLink)) {
                        saveActionMisc('node:changedPropertyValue', tgtNodeOrLink, { "property": prop });
                    } else {
                        saveActionMisc('link:changedPropertyValue', null, { "linkId": tgtNodeOrLink.id, "property": prop });
                    }
                }
            }

            tgtNodeOrLink.setPropertyNamed(prop.name, prop.value, prop.type);
        // }

        donePropertyNames.push(prop.name);
    }

    for (let propName of Object.keys(tgtNodeOrLink.listProperties())) {
        if (donePropertyNames.indexOf(propName) === -1) {
            if (isNode(tgtNodeOrLink)) {
                saveActionMisc('node:removeProperty', tgtNodeOrLink, { "propName": propName });
            } else {
                saveActionMisc('link:removeProperty', null, { "linkId": tgtNodeOrLink.id, "propName": propName });
            }

            tgtNodeOrLink.removePropertyNamed(propName);
        }
    }
}

/**
 * Iterate through each of the form relation checkboxes and show or hide the related nodes based on whether each is
 * checked.
 *
 * @param {csNode|csLink} tgtNodeOrLink     the node or link to be modified.
 */
function saveRelations(tgtNodeOrLink) {
    //TODO: Upgrade this when links can have relations
    if (isNode(tgtNodeOrLink)) {
        if (tgtNodeOrLink.listAllLinks().length > 0) {
            let elem = getElement(ELEM_REL_TABLE_BODY);

            if (elem) {
                let relStatus = {};

                seekHideCheckboxes(elem, relStatus);

                for (let thisLink of tgtNodeOrLink.listAllLinks()) {
                    let isHidden = relStatus[thisLink.getUid()];
                    let otherNode = thisLink.getOtherNode(tgtNodeOrLink);

                    if (isHidden) {
                        if (!otherNode.isHidden()) {
                            saveActionMisc('node:hidden(from linked node)', otherNode);
                        }

                        otherNode.hide()
                    } else {
                        if (otherNode.isHidden()) {
                            saveActionMisc('node:hidden(from linked node)', otherNode);
                        }

                        otherNode.show()
                    }

                    hideNodeAndLinks(otherNode);
                }
            }
        }
    }
}

/**
 * Recursively seek the child element that contains the quill editor and get the text contents.
 *
 * @param {Element} elem        the dom element within which the templates will be sought.
 * @param {object} relStatus    an object that will contain the hidden status for each link.
 * @return {string}             the text templates of the editor.
 */
function seekHideCheckboxes(elem, relStatus) {
    if (elem.nodeName === 'INPUT') {
        if (elem.getAttribute('type') === 'checkbox') {
            let linkUid = elem.getAttribute('id').replace(FRAG_REL, '');

            relStatus[linkUid] = (/** @type {HTMLInputElement} */ elem).checked;
        }
    } else {
        for (let childElem of elem.children) {
            seekHideCheckboxes(childElem, relStatus);
        }
    }
}
