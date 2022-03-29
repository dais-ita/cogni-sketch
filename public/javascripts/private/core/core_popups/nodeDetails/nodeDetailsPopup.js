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
 * @file Functions relating to the node details popup window.
 * @author Dave Braines
 **/

import {
    getPalette,
    getProject
} from "/javascripts/private/state.js";
import {
    getElement,
    getSelectedValue
} from "/javascripts/private/util/dom.js";
import {
    saveActionChangedNode, saveActionMisc,
    saveActionUpdateNodeLabel,
    saveActionUpdateNodeType
} from "/javascripts/private/csData/change/csDataChanges.js";
import {
    hideNodeAndLinks,
    refreshNode
} from "/javascripts/private/core/graphics.js";
import {
    doSwitchToEmptyNode,
    doSwitchToPopulatedNode
} from "/javascripts/private/core/hooks.js";
import {getSessionSortedPalette} from "/javascripts/private/csData/csDataSession.js";
import {
    closePopup as actionClosePopup,
    popupFrom
} from "/javascripts/private/core/core_popups/generalPopup.js";
import {mainTemplate} from "./templates/nodeDetailsTemplates.js";
import {
    checkPropertiesValid,
    insertCommonSection,
    insertMetaDataSection,
    savePropertiesAndRelations
} from "../commonDetails/commonDetails.js";
import {error} from "/javascripts/private/util/log.js";

const ELEM_METADATA_SECTION = 'metadata-section';
const ELEM_COMMON_SECTION = 'common-section';
const ELEM_LABEL_VALUE = 'input-label';
const ELEM_NODE_TYPE = 'select-type';
const ELEM_SHOW_TYPE = 'show-type';
const ELEM_HIDE = 'hide-node';
const ELEM_BUTTON_SAVE = 'button-save';
const ELEM_BUTTON_CANCEL = 'button-cancel';

/**
 * Build the html for this popup window and open it.
 *
 * @param {csNode} tgtNode      the node that is the focus of this popup window.
 */
export function openPopup(tgtNode) {
    let config = calculateNodeConfig(tgtNode);

    saveActionMisc('canvas:editNode', tgtNode);

    popupFrom(tgtNode, mainTemplate, config);

    /* Now that the main popup form has been created the dynamic sections can be inserted */
    insertMetaDataSection(tgtNode, ELEM_METADATA_SECTION);
    insertCommonSection(tgtNode, ELEM_COMMON_SECTION);
}

/**
 * Create the configuration for this node details popup window.
 *
 * @return {csTemplateConfig}       the template configuration.
 */
function calculateNodeConfig(tgtNode) {
    let config;
    let typeChecked = '';
    let hideChecked = '';
    let typeDisabled = '';

    if (tgtNode.getShowType()) {
        typeChecked = 'checked';
    }

    if (tgtNode.isHidden()) {
        hideChecked = 'checked';
    }

    if (tgtNode.getType().getSettings().getCanChangeTypeAfterCreation() === false) {
        typeDisabled = 'disabled';
    }

    config = {
        "modalFocus": ELEM_LABEL_VALUE,
        "html": {
            "nodeLabel": tgtNode.getLabel(),
            "typeChecked": typeChecked,
            "hideChecked": hideChecked,
            "typeList": {
                "disabled": typeDisabled,
                "types": listTypesForConfig(tgtNode.getType())
            }
        },
        "events": []
    };

    config.events.push({ "elemId": ELEM_NODE_TYPE, "event": 'change', "function": actionChangedType });
    config.events.push({ "elemId": ELEM_BUTTON_SAVE, "event": 'click', "function": function() { actionSavePopup(tgtNode); } });
    config.events.push({ "elemId": ELEM_BUTTON_CANCEL, "event": 'click', "function": function() { actionClosePopup(); } });

    return config;
}

/**
 * List all of the defined palette item types in their sections, with each marked as selected or disabled.
 *
 * @param {csType} currentType      the type of the node bring shown in this popup.
 * @return {object}                 the type list structure for the config.
 */
function listTypesForConfig(currentType) {
    let sortedPalette = getSessionSortedPalette();
    let nodeTypes = [];

    for (let thisSection of getPalette().getSections()) {
        let sectionObj = { "sectionName": thisSection.name, "items": [] };

        for (let thisType of sortedPalette) {
            if (thisType.isInSection(thisSection.name)) {
                let item = {
                    "id": thisType.getId(),
                    "selected": '',
                    "disabled": ''
                };

                if (thisType.getId() === currentType.getId()) {
                    item.selected = 'selected';
                }

                if (!thisType.getSettings().getCanChangeTypeAfterCreation()) {
                    item.disabled = 'disabled';
                }

                sectionObj.items.push(item);
            }
        }

        nodeTypes.push(sectionObj);
    }

    return nodeTypes;
}

/**
 * Save the node by transferring the form field contents onto the node instance in the project, and ensure the
 * canvas is refreshed to show the latest templates.
 */
function actionSavePopup(tgtNode) {
    if (getProject().isReadOnly()) {
        error('Cannot save node - project is read only', null, null, true);
    } else {
        if (checkPropertiesValid()) {
            /* save the specific elements */
            saveLabel(tgtNode);
            saveType(tgtNode);
            saveShowType(tgtNode);
            saveHidden(tgtNode);
            savePropertiesAndRelations(tgtNode);    /* save the common properties and relations */

            /* if the node was previously empty but now has properties, switch to populated (full) */
            if ((tgtNode.isEmpty() && tgtNode.hasProperties())) {
                doSwitchToPopulatedNode(tgtNode);
            }

            /* if the node was previously populated but now has no properties, switch to empty */
            if ((tgtNode.isFull() && !tgtNode.hasProperties())) {
                doSwitchToEmptyNode(tgtNode);
            }

            refreshNodeOnCanvas(tgtNode);

            actionClosePopup();
        }
    }
}

/**
 * The save is complete so ensure the node is rendered correctly on the canvas.
 *
 * @param {csNode} tgtNode      the node to be refreshed.
 */
function refreshNodeOnCanvas(tgtNode) {
    if (tgtNode.isHidden()) {
        hideNodeAndLinks(tgtNode);
    }

    refreshNode(tgtNode);
}

/**
 * Save the label for the specified node (if it has changed), and record the change action.
 *
 * @param {csNode} tgtNode      the node to be saved.
 */
function saveLabel(tgtNode) {
    let elem = /** @type {HTMLInputElement} */ getElement(ELEM_LABEL_VALUE);

    if (elem) {
        let oldLabel = tgtNode.getLabel();

        if (oldLabel !== elem.value) {
            tgtNode.setLabel(elem.value);

            saveActionUpdateNodeLabel(tgtNode, oldLabel);
        }
    }
}

/**
 * Save the type for the specified node (if it has changed), and record the change action.
 *
 * @param {csNode} tgtNode      the node to be saved.
 */
function saveType(tgtNode) {
    let elem = /** @type {HTMLInputElement} */ getElement(ELEM_NODE_TYPE);

    if (elem) {
        let oldType = tgtNode.getType().getId();

        if (oldType !== elem.value) {
            tgtNode.switchType(getPalette().getItemById(elem.value));
            saveActionUpdateNodeType(tgtNode, oldType);
        }
    }
}

/**
 * Save the 'show type' flag for the specified node (if it has changed), and record the change action.
 *
 * @param {csNode} tgtNode      the node to be saved.
 */
function saveShowType(tgtNode) {
    let elem = /** @type {HTMLInputElement} */ getElement(ELEM_SHOW_TYPE);

    if (elem) {
        if (tgtNode.getShowType() !== elem.checked) {
            tgtNode.setShowType(elem.checked);
            saveActionChangedNode(tgtNode,'showType', !elem.checked);
            saveActionMisc('node:showType', tgtNode);
        }
    }
}

/**
 * Save the 'is hidden' flag for the specified node (if it has changed), and record the change action.
 *
 * @param {csNode} tgtNode      the node to be saved.
 */
function saveHidden(tgtNode) {
    let elem = /** @type {HTMLInputElement} */ getElement(ELEM_HIDE);

    if (elem) {
        if (elem.checked !== tgtNode.isHidden()) {
            if (elem.checked) {
                tgtNode.hide();
            } else {
                tgtNode.show();
            }

            saveActionChangedNode(tgtNode, 'hidden', !elem.checked);
            saveActionMisc('node:hidden', tgtNode);
        }
    }
}

/**
 * The user has changed the type.  Set any other fields based on default values for the chosen type.
 */
function actionChangedType() {
    updateHideCheckbox();
}

/**
 * Check the node type that is selected in the drop down to see whether the 'default to hidden' setting is
 * specified, and if so set the 'hide' checkbox accordingly.
 */
function updateHideCheckbox() {
    let elem = getElement(ELEM_HIDE);

    if (elem) {
        let nodeType = getSelectedNodeType();
        let isChecked = false;

        if (nodeType) {
            isChecked = !!nodeType.getSettings().getDefaultToHidden();
        }

        elem.checked = isChecked;
    }
}

/**
 * Get the node type instance that corresponds to the currently selected node type id in the dropdown list.
 *
 * @return {csType}     the node type instance that is selected.
 */
function getSelectedNodeType() {
    let typeId = getSelectedValue(ELEM_NODE_TYPE);
    let nodeType;

    if (typeId) {
        nodeType = getPalette().getItemById(typeId);
    }

    return nodeType;
}
