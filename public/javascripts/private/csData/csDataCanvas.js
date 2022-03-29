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
 * @file Defines the canvas part of the session state.
 *
 * @author Dave Braines
 **/

//TODO: Merge this into state.js and session.js

import {setOntoEmptyIcon as coreSetOntoEmptyIcon} from "/javascripts/private/core/core_panes/canvas/dragdrop/node.js";
import {
    createNewFullNode as coreCreateNewFullNode,
    deleteLink,
    deleteNode} from "/javascripts/private/core/create.js";
import {
    selectNode as coreSelectNode,
    deselectAll as coreDeselectAll
} from "/javascripts/private/core/core_panes/canvas/select.js";
import {
    error,
    userConfirm
} from "/javascripts/private/util/log.js";
import {getProject} from "/javascripts/private/state.js";
import {
    clearSessionCanvasSelectionLinks,
    clearSessionCanvasSelectionNodes,
    getSessionCanvasSelections
} from "/javascripts/private/csData/csDataSession.js";
import {matchContentType} from "/javascripts/private/core/core_panes/canvas/canvas.js";
import {saveActionMisc} from "/javascripts/private/csData/change/csDataChanges.js";

let canvas = {}

/**
 * Get the value for the specified key from the canvas storage instance.
 *
 * @param {string} key                  the key to be used.
 * @returns {string|number|boolean}     the value found.
 */
function getValue(key) {
    return canvas[key];
}

/**
 * Store the specified value in the canvas storage instance.
 *
 * @param {string} key                      the key to be used.
 * @param {string|number|boolean} val       the returned value.
 */
function setValue(key, val) {
    canvas[key] = val;
}

/**
 * Get the list of nodes and links currently selected on the canvas.
 *
 * @returns {csSelectionList}       the nodes and links that are currently selected.
 */
export function getSelectedItems() {
    return getSessionCanvasSelections();
}

/**
 * Set this text onto the specified node.
 *
 * @param {csPayload} textContent       the payload object containing the text to be set onto the node.
 * @param {csNode} tgtNode              the node on which to set the text.
 */
export function setOntoEmptyIcon(textContent, tgtNode) {
    coreSetOntoEmptyIcon(textContent, tgtNode);
}

/**
 * Create a new node on the canvas at the specified position, with a mode of 'full' and the label and payload provided.
 *
 * @param {csType} nodeType             the type to be used for the new node.
 * @param {string} [label]              an optional label for the new node.
 * @param {csCoordinates} canvasPos     the location on the canvas for the new node.
 * @param {object} [payload]            the optional payload for the new node.
 * @param {object} [existingProps]      any existing properties to be added to the new node.
 */
export function createNewFullNode(nodeType, label, canvasPos, payload, existingProps) {
    //TODO: Check the type for payload
    coreCreateNewFullNode(nodeType, label, canvasPos, payload, existingProps);
}

/**
 * Create the specified payload on the canvas by advertising for a suitable node type to handle it.
 *
 * @param {csCoordinates} canvasPos     the location for the new node on the canvas.
 * @param {object} payload              the payload for the new node.
 */
export function createOnCanvas(canvasPos, payload) {
    //TODO: Check the type for payload
    matchContentType(canvasPos, payload, true);
}

/**
 * Delete the selected nodes and links from the canvas.
 */
export function deleteSelectedNodesAndLinks() {
    if (document.activeElement.getAttribute('id') === 'cs-main-Canvas') {
        if (getProject().isReadOnly()) {
            error('Cannot delete items - project is read only', null, null, true);
        } else {
            let selections = getSessionCanvasSelections();

            if ((selections.nodes.length > 0) || (selections.links.length > 0)) {
                let linkText = ` and ${selections.links.length} links`;

                if (userConfirm(`Are you sure you want to delete the selected ${selections.nodes.length} nodes${linkText}?`)) {
                    let nodeIds = [];
                    let linkIds = [];

                    selections.nodes.forEach(function(value) { nodeIds.push(value.id); });
                    selections.links.forEach(function(value) { linkIds.push(value.id); });

                    saveActionMisc('canvas:deleteSelected', null, { "nodes": nodeIds, "links": linkIds } );

                    /* Delete links */
                    if (selections.links) {
                        for (let link of selections.links) {
                            deleteLink(link);
                        }
                    }
                    clearSessionCanvasSelectionLinks();

                    /* Delete nodes */
                    if (selections.nodes) {
                        for (let node of selections.nodes) {
                            deleteNode(node);
                        }
                    }
                    clearSessionCanvasSelectionNodes();
                }
            }
        }
    } else {
        // Ignore - the canvas is not the active (in focus) element
    }
}

/**
 * Deselect all nodes and links on the canvas.
 */
export function deselectAll() {
    coreDeselectAll();
}

/** Select the specified node on the canvas.
 *
 * @param {csNode} tgtNode  the node to be selected.
 */
export function selectNode(tgtNode) {
    coreSelectNode(tgtNode);
}

/**
 * Get the width value from the session storage.
 *
 * @returns {number}    the width value.
 */
export function getWidth() {
    //TODO: Get this from the canvas element instead of storing?
    return getValue('width');
}

/**
 * Set the width value in the session storage.
 *
 * @param {number} val      the width value to be saved.
 */
export function setWidth(val) {
    return setValue('width', val);
}

/**
 * Get the height value from the session storage.
 *
 * @returns {number}    the height value.
 */
export function getHeight() {
    //TODO: Get this from the canvas element instead of storing?
    return getValue('height');
}

/**
 * Set the height value in the session storage.
 *
 * @param {number} val      the height value to be saved.
 */
export function setHeight(val) {
    return setValue('height', val);
}

/**
 * Get the top value from the session storage.
 *
 * @returns {number}    the top value.
 */
export function getTop() {
    //TODO: Get this from the canvas element instead of storing?
    return getValue('top');
}

/**
 * Set the top value in the session storage.
 *
 * @param {number} val      the top value to be saved.
 */
export function setTop(val) {
    return setValue('top', val);
}

/**
 * Get the left value from the session storage.
 *
 * @returns {number}    the left value.
 */
export function getLeft() {
    //TODO: Get this from the canvas element instead of storing?
    return getValue('left');
}

/**
 * Set the left value in the session storage.
 *
 * @param {number} val      the left value to be saved.
 */
export function setLeft(val) {
    return setValue('left', val);
}

/**
 * Get the isPanning value from the session storage.
 *
 * @returns {boolean}    the isPanning value.
 */
export function getIsPanning() {
    return getValue('isPanning');
}

/**
 * Set the isPanning value in the session storage.
 *
 * @param {boolean} val      the isPanning value to be saved.
 */
export function setIsPanning(val) {
    return setValue('isPanning', val);
}

/**
 * Get the mouseX value from the session storage.
 *
 * @returns {number}    the mouseX value.
 */
export function getMouseX() {
    //TODO: Combine mouseX and mouseY
    return getValue('mouseX');
}

/**
 * Set the mouseX value in the session storage.
 *
 * @param {number} val      the mouseX value to be saved.
 */
export function setMouseX(val) {
    if (!isNaN(val)) {
        setValue('mouseX', val);
    }
}

/**
 * Get the mouseY value from the session storage.
 *
 * @returns {number}    the mouseY value.
 */
export function getMouseY() {
    //TODO: Combine mouseX and mouseY
    return getValue('mouseY');
}

/**
 * Set the mouseY value in the session storage.
 *
 * @param {number} val      the mouseY value to be saved.
 */
export function setMouseY(val) {
    if (!isNaN(val)) {
        setValue('mouseY', val);
    }
}

/**
 * Get the zoom factor value from the session storage.
 *
 * @returns {number}    the zoom factor value.
 */
export function getZoomFactor() {
    return getValue('zoomFactor');
}

/**
 * Set the zoom factor value in the session storage.
 *
 * @param {number} val      the zoom factor value to be saved.
 */
export function setZoomFactor(val) {
    return setValue('zoomFactor', val);
}
