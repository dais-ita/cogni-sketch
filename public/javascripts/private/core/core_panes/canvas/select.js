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
 * @file Functions relating to selections of nodes and links on the canvas.
 * @author Dave Braines
**/

import {getProject} from "/javascripts/private/state.js";
import {
    deselect as doNodeDeselect,
    select as doNodeSelect
} from "/javascripts/private/csData/csDataNode.js";
import {
    deselect as doLinkDeselect,
    select as doLinkSelect
} from "/javascripts/private/csData/csDataLink.js";
import {showToast} from "/javascripts/private/util/log.js";
import {
    computeCoordsFor,
    isInside
} from "/javascripts/private/util/coords.js";
import {switchToCanvasPane} from "/javascripts/private/ui/tabs.js";
import {
    centerOnLink,
    centerOnNode
} from "/javascripts/private/core/core_panes/canvas/canvas.js";
import {
    collapseOrExpandNode,
    drawRectangle,
    hideNodeAndLinks
} from "/javascripts/private/core/graphics.js";
import {
    getSvgIconFrom,
    getSvgLinkLineFrom
} from "/javascripts/private/csData/svgstore.js";
import {
    addSessionCanvasSelectionLink,
    addSessionCanvasSelectionNode,
    clearSessionRectangleSelect,
    getSessionCanvasSelections,
    getSessionRectangleSelect,
    getSessionIsDragging,
    removeSessionCanvasSelectionLink,
    removeSessionCanvasSelectionNode,
    setSessionRectangleSelect
} from "/javascripts/private/csData/csDataSession.js";
import {saveActionMisc} from "/javascripts/private/csData/change/csDataChanges.js";
import {isLink} from "/javascripts/private/util/data.js";

/**
 * Find the specified node or link on the canvas by selecting it and centering the pane on it.  Ensure that the canvas
 * is showing, and deselect any nodes and links.
 *
 * @param {csNode|csLink} tgtNodeOrLink     the node or link to be found.
 */
export function findOnCanvas(tgtNodeOrLink) {
    if (tgtNodeOrLink) {
        deselectAll();
        switchToCanvasPane();

        if (isLink(tgtNodeOrLink)) {
            findLinkOnCanvas(/** @type {csLink} */ tgtNodeOrLink);
        } else {
            findNodeOnCanvas(/** @type {csNode} */ tgtNodeOrLink);
        }
    }
}

/**
 * Select the specified node and center the canvas on it.
 *
 * @param {csNode} tgtNode      the node to be selected.
 */
function findNodeOnCanvas(tgtNode) {
    selectNode(tgtNode);
    centerOnNode(tgtNode);
}

/**
 * Select the specified link and center the canvas on it.
 *
 * @param {csLink} tgtLink      the link to be selected.
 */
function findLinkOnCanvas(tgtLink) {
    selectLink(tgtLink);
    centerOnLink(tgtLink);
}

/**
 * Select all nodes and links that are inside the rectangle defined by the specified coordinates.  All other nodes
 * and links are deselected. Links they are deemed as 'inside' only if both the source and target nodes are inside
 * the rectangle. All positions are in the Node coordinate system.
 *
 * @param {csRectangle} rectangle   the rectangle coordinates within which to select (in the Node coordinate system).
 */
function selectInside(rectangle) {
    let allNodes = getProject().listNodes();

    for (let thisNode of allNodes) {
        if (isInside(thisNode, rectangle)) {
            selectNode(thisNode);

            for (let thisLink of thisNode.listAllLinks()) {
                let srcNode = thisLink.getSourceNode();
                let tgtNode = thisLink.getTargetNode();

                if (isInside(srcNode, rectangle) && isInside(tgtNode, rectangle)) {
                    selectLink(thisLink);
                } else {
                    deselectLink(thisLink);
                }
            }
        } else {
            deselectNode(thisNode);
        }
    }
}

/**
 * Select all of the nodes and links defined in the loaded project.
 */
export function selectAll() {
    if (getProject()) {
        saveActionMisc('canvas:selectAll');
        selectThese(getProject().listNodes(), getProject().listLinks());
    }
}

/**
 * Select all of the specified nodes and links.
 *
 * @param {csNode[]} nodeList       the list of nodes to be selected.
 * @param {csLink[]} linkList       the list of links to be selected.
 */
export function selectThese(nodeList, linkList) {
    if (nodeList) {
        for (let thisNode of nodeList) {
            selectNode(thisNode);
        }
    }

    if (linkList) {
        for (let thisLink of linkList) {
            selectLink(thisLink);
        }
    }
}

/**
 * Deselect all of the nodes and links defined in the loaded project.
 */
export function deselectAll() {
    if (getProject()) {
        deselectThese(getProject().listNodes(), getProject().listLinks());
    }
}

/**
 * Deselect all of the specified nodes and links.
 *
 * @param {csNode[]} nodeList       the list of nodes to be deselected.
 * @param {csLink[]} linkList       the list of links to be deselected.
 */
function deselectThese(nodeList, linkList) {
    if (nodeList) {
        let copyNodeList = nodeList.slice();    //Create a copy as items will be removed

        for (let thisNode of copyNodeList) {
            if (thisNode.isSelected()) {
                deselectNode(thisNode);
            }
        }
    }

    if (linkList) {
        let copyLinkList = linkList.slice();     //Create a copy as items will be removed

        for (let thisLink of copyLinkList) {
            if (thisLink.isSelected()) {
                deselectLink(thisLink);
            }
        }
    }
}

/**
 * Depending on the state of the shift key and the drag create, continue or finish the rectangle select.
 *
 * @param {MouseEvent} e    the mouse event containing the cursor coordinates (in the Absolute coordinate system).
 */
export function doRectangleSelect(e) {
    let coords = computeCoordsFor(e);
    let ds = getSessionRectangleSelect();

    if (ds) {
        if (!getSessionIsDragging()) {
            continueRectangleSelect(coords);
        } else {
            finishRectangleSelect();
        }
    } else {
        startRectangleSelect(coords);
    }

    /* Ensure that only nodes and links are selected */
    preventTextSelection();
}

/**
 * Ensure no text on the canvas is selected as a result of the drag.
 */
function preventTextSelection() {
    if (window.getSelection) {
        window.getSelection().removeAllRanges();
    } else if (document.selection) {
        document.selection.empty();
    }
}

/**
 * Create the rectangle (with 0 width and height) at the specified coordinates.
 *
 * @param {csCoordinates} c     the starting position for the rectangle (in the Absolute coordinate system).
 */
function startRectangleSelect(c) {
    let dims = {
        'x': c.x,
        'y': c.y,
        'width': 0,
        'height': 0
    };

    deselectAll();

    setSessionRectangleSelect({
        'svg': drawRectangle('rectangle-select', dims, 'cs-rectangle-select'),
        'origX': c.x,
        'origY': c.y
    });
}

/**
 * The drag event is still happening so animate the rectangle with the new dimensions and check which nodes
 * and links need to be selected/deselected.
 *
 * @param {csCoordinates} c     the current position of the mouse/cursor (in the Absolute coordinate system).
 */
function continueRectangleSelect(c) {
    let ds = getSessionRectangleSelect();

    let rElem = ds['svg']['_groups'][0][0];
    let x = ds.origX;
    let y = ds.origY;
    let w = c.x - x;
    let h = c.y - y;

    if (w < 0) {
        w = 1 - w;
        x = x - w;
    }

    if (h < 0) {
        h = 1 - h;
        y = y - h;
    }

    // Set the width, height, x and y on the SVG rectangle to visually make the change
    rElem.setAttribute('x', x);
    rElem.setAttribute('width', w);
    rElem.setAttribute('y', y);
    rElem.setAttribute('height', h);

    let rectangle = {
        'x1': x,
        'x2': (x + w),
        'y1': y,
        'y2': (y + h)
    };

    selectInside(rectangle);
}

/**
 * The user has stopped the rectangle select.  Clear the drawn rectangle and associated data from the session but
 * retain the select/deselect status of all nodes and links.
 */
export function finishRectangleSelect() {
    clearSessionRectangleSelect();
    removeRectangleSelectBox();
}

/**
 * Flip the selected/deselected mode of the specified link.
 *
 * @param {csLink} tgtLink      the link to be selected or deselected.
 */
export function selectOrDeselectLink(tgtLink) {
    let selections = getSessionCanvasSelections();

    if (selections.links && selections.links.indexOf(tgtLink) > -1) {
        deselectLink(tgtLink);
    } else {
        selectLink(tgtLink);
    }
}

/**
 * Flip the collapsed/expanded mode of the currently selected nodes.
 */
export function collapseOrExpand() {
    let selections = getSessionCanvasSelections();

    if (selections.nodes && (selections.nodes.length > 0)) {
        let nodeIdList = [];
        selections.nodes.forEach(function(node) { nodeIdList.push(node.id);} );

        saveActionMisc('canvas:collapseOrExpand', null, { "nodeIds": nodeIdList });

        for (let thisNode of selections.nodes) {
            collapseOrExpandNode(thisNode);
        }
    } else {
        showToast('No nodes are selected so nothing was collapsed or expanded.');
    }
}

/**
 * Remove the rectangle select box from the canvas.
 */
function removeRectangleSelectBox() {
    d3.select('#rectangle-select').remove();
}

/**
 * Select the specified link.  Specifically do the following actions:
 *   1. Register the link as selected with the session.
 *   2. Notify the link that it is selected.
 *   3. Update the CSS classes for the link to show that it is selected.
 *
 * @param {csLink} tgtLink      the link to be selected.
 */
export function selectLink(tgtLink) {
    //TODO: Stop tracking the link as selected on the link AND in the session...
    let svgLink = getSvgLinkLineFrom(tgtLink, true);

    doLinkSelect(tgtLink);

    //TODO: Need to account for semantic links here
    svgLink.classList.add('cs-link-selected');
    svgLink.classList.remove('cs-link-normal');

    addSessionCanvasSelectionLink(tgtLink);
}

/**
 * Deselect the specified link.  Specifically do the following actions:
 *   1. Remove the link from the list of selected links in the session.
 *   2. Notify the link that it is deselected.
 *   3. Update the CSS classes for the link to show that it is not selected.
 *
 * @param {csLink} tgtLink      the link to be deselected.
 */
export function deselectLink(tgtLink) {
    let svgLink = getSvgLinkLineFrom(tgtLink, true);

    doLinkDeselect(tgtLink);

    //TODO: Need to account for semantic links here
    svgLink.classList.add('cs-link-normal');
    svgLink.classList.remove('cs-link-selected');

    removeSessionCanvasSelectionLink(tgtLink);
}

/**
 * Select the specified node.  Specifically do the following actions:
 *   1. Register the node as selected with the session.
 *   2. Notify the node that it is selected.
 *   3. Update the CSS classes for the node to show that it is selected.
 *
 * @param {csNode} tgtNode      the node to be selected.
 */
export function selectNode(tgtNode) {
    let svgIcon = getSvgIconFrom(tgtNode, true);

    doNodeSelect(tgtNode);
    svgIcon.classList.add('cs-node-selected');
    svgIcon.classList.remove('cs-node-normal');

    addSessionCanvasSelectionNode(tgtNode);
}

/**
 * Deselect the specified node.  Specifically do the following actions:
 *   1. Remove the node from the list of selected node in the session.
 *   2. Notify the node that it is deselected.
 *   3. Update the CSS classes for the node to show that it is not selected.
 *
 * @param {csNode} tgtNode      the node to be deselected.
 */
export function deselectNode(tgtNode) {
    let svgIcon = getSvgIconFrom(tgtNode, true);

    doNodeDeselect(tgtNode);
    svgIcon.classList.add('cs-node-normal');
    svgIcon.classList.remove('cs-node-selected');

    removeSessionCanvasSelectionNode(tgtNode);
}

/**
 * For every selected node; find all linked nodes and hid any that are 'leaf nodes', i.e. linked to no other nodes.
 */
export function hideLinkedNodes() {
    let selections = getSessionCanvasSelections();
    let nodeIdList = [];

    for (let thisNode of selections.nodes) {
        for (let link of thisNode.listAllLinks()) {
            let otherNode = link.getOtherNode(thisNode);

            if (otherNode.listAllLinks().length === 1) {
                if (otherNode.isHidden()) {
                    otherNode.show()
                } else {
                    otherNode.hide()
                }

                hideNodeAndLinks(otherNode);
            }
        }

        nodeIdList.push(thisNode.id);
    }

    if (nodeIdList.length > 0) {
        saveActionMisc('canvas:hideOrShowLinkedNodes', null, { "nodeIds": nodeIdList });
    }
}

/**
 * For every selected node; find all linked nodes and select them too.
 */
export function selectLinkedNodes() {
    let selections = getSessionCanvasSelections();
    let selectionsCopy = [...selections.nodes];    /* Create a copy as the code will potentially modify this list */
    let nodeIdList = [];

    for (let thisNode of selectionsCopy) {
        nodeIdList.push(thisNode.id);
        for (let link of thisNode.listAllLinks()) {
            let otherNode = link.getOtherNode(thisNode);

            selectNode(otherNode);
        }
    }

    if (nodeIdList.length > 0) {
        saveActionMisc('canvas:selectLinkedNodes', null, { "nodeIds": nodeIdList });
    }
}
