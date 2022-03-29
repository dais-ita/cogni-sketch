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
 * @file Functions relating to the rendering of the main canvas pane.
 * @author Dave Braines
 **/

import {
    getPalette,
    getProject
} from "/javascripts/private/state.js";
import {getSvgLinkLineFrom} from "/javascripts/private/csData/svgstore.js";
import {paneContainerTemplate} from "./templates/canvasTemplate.js";
import {initialise as eventsInitialise} from "/javascripts/private/core/core_panes/canvas/events/canvas.js";
import {
    resetCanvasProps,
    computeMidpointFor,
    restoreSavedViewBox
} from "/javascripts/private/util/coords.js";
import {
    drawInitialBoundingBox,
    hideNodeAndLinks,
    redrawExistingNodes,
    refreshLink,
    removeNodeAndLinksFromCanvas
} from "/javascripts/private/core/graphics.js";
import {
    createNewFullNode,
    deleteNode,
    recreateNode,
    recreateLink
} from "/javascripts/private/core/create.js";
import {listFiles} from "/javascripts/private/ui/palette/files.js";
import {doCanHandle} from "/javascripts/private/core/hooks.js";
import {deselectAll} from "/javascripts/private/core/core_panes/canvas/select.js";
import {panTo} from "/javascripts/private/core/core_panes/canvas/panzoom.js";
import {
    getSessionCanvasLayout,
    ignoreChangesFor
} from "/javascripts/private/csData/csDataSession.js";
import {warn} from "/javascripts/interface/log.js";
import {canvasKeyup} from "./keyboard.js";
import {
    canvasCut,
    canvasCopy,
    canvasPasteText,
    canvasPasteImage
} from "./clipboard.js";
import {saveActionMisc} from "/javascripts/private/csData/change/csDataChanges.js";

/**
 * The standard definition for this pane.
 *
 * @type {csPaneDefinition}
 */
export const config = {
    "paneName": 'Canvas',
    "paneContainerTemplate": paneContainerTemplate,
    "callbacks": {
        "initialise": initialise,
        "clear": clear,
        "render": render,
        "refresh": refresh,
        "projectLoaded": cbProjectLoaded,
        "nodeChanged": cbNodeChanged,
        "linkChanged": cbLinkChanged,
        "typeChanged": cbTypeChanged,
        "projectChanged": cbProjectChanged,
        "paletteChanged": cbPaletteChanged,
        "keyup": canvasKeyup,
        "cut": canvasCut,
        "copy": canvasCopy,
        "pasteText": canvasPasteText,
        "pasteImage": canvasPasteImage
    }
};

function cbProjectLoaded(project) {
    //Nothing currently needed
}

function cbNodeChanged(ev) {
    // If this is a deletion event then ensure the node is deleted from the canvas
    if (ev.change === 'delete') {
        removeNodeAndLinksFromCanvas(ev.node);
    }
}

function cbLinkChanged(ev) {
    //Nothing currently needed
}

function cbTypeChanged(ev) {
    //Nothing currently needed
}

function cbProjectChanged(ev) {
    //Nothing currently needed
}

function cbPaletteChanged(ev) {
    //Nothing currently needed
}

function initialise() {
    /* initialise members */
    eventsInitialise();

    render();
    resetCanvasProps();
}

/**
 * Get the jQuery or SVG element for the canvas.
 *
 * @param {boolean} [inner=false]       whether to remove the jQuery (outer) element, or the DOM element (inner).
 * @returns {HTMLElement|jQuery}    the canvas element.
 */
export function getCanvasElement(inner) {
    let result = d3.select('#cs-main-Canvas');

    if (result && inner) {
        result = result._groups[0][0];
    }

    return result;
}

/**
 * Render this pane.  In this case simply draw a bounding box if one is defined as required in the layout.
 */
function render() {
    let layout = getSessionCanvasLayout();

    if (layout.boundingBox) {
        drawInitialBoundingBox();
    }
}

/**
 * Clear this pane.  Iterate though all nodes within the project, deleting each.
 */
function clear() {
    if (getProject()) {
        ignoreChangesFor(function () {
            for (let thisNode of getProject().listNodes()) {
                //Delete the object - links will be cascade deleted automatically
                deleteNode(thisNode, true);
            }
        });
    }
}

/**
 * Refresh this pane.  Redraw all this existing nodes and refresh the links.
 */
export function refresh() {
    //TODO: Replace callers of this function with a more precise solution
    redrawExistingNodes();

    for (let link of getProject().listLinks()) {
        refreshLink(link);
    }
}

/**
 * Center the canvas at the specified node.
 *
 * @param {csNode} tgtNode      the node on which to center the canvas.
 */
export function centerOnNode(tgtNode) {
    panTo(tgtNode.getPos().x, tgtNode.getPos().y);
}

/**
 * Center the canvas at the specified link.
 *
 * @param {csLink} tgtLink      the link on which to center the canvas.
 */
export function centerOnLink(tgtLink) {
    let pos = computeMidpointFor(tgtLink);

    panTo(pos.x, pos.y);
}

/**
 * Draw the specified project on the canvas.
 *
 * @param {csProject} project       the project to be drawn.
 */
export function drawProjectOnCanvas(project) {
    let eCanvas = getCanvasElement();

    // Only draw the nodes if there is a canvas tab
    if (!eCanvas.empty()) {
        let projectGeneral = project.getGeneral();

        if (projectGeneral.viewBox) {
            restoreSavedViewBox(projectGeneral.viewBox);
        }

        for (let thisNode of project.listNodes()) {
            recreateNode(thisNode);
        }

        for (let thisLink of project.listLinks()) {
            let srcObj = thisLink.getSourceNode();
            let tgtObj = thisLink.getTargetNode();

            recreateLink(thisLink, srcObj, tgtObj);
        }

        /* now that the links are created, ensure any hidden nodes are suppressed */
        for (let thisNode of project.listNodes()) {
            if (thisNode.isHidden()) {
                hideNodeAndLinks(thisNode);
            }
        }

        listFiles();
        deselectAll();
    }
}

/**
 * Look for a palette item that best handles this payload and if such a palette type is found, create a new
 * full node populated with the payload.
 *
 * @param {csCoordinates} pos           the coordinates at which to create any new node.
 * @param {csPayload} payload           the payload to populate the templates.
 * @param {boolean} [suppressAction]    whether to report the action.
 */
export function matchContentType(pos, payload, suppressAction) {
    let possItem = findBestPaletteItemAndStatus(payload).nodeType;

    if (possItem) {
        if (!suppressAction) {
            saveActionMisc('drop:browser', null, { "type": possItem.getId() });
        }

        createNewFullNode(possItem, '', pos, payload);
    } else {
        if (!suppressAction) {
            saveActionMisc('drop:browser(failed)', null, { "payload": payload });
        }

        warn(`Nothing found to handle that item: ${payload}`);
    }
}

/**
 * For the specified payload, find the palette item that can best handle it, and the status with which it can
 * be handled.
 *
 * @param {csPayload} payload               the payload to be processes.
 * @return {csMatchedType}                  the best matched type and status
 */
export function findBestPaletteItemAndStatus(payload) {
    let palArray = getPalette().listItems();
    let bestChStatus = 0;
    let chStatus;
    let possItem;

    for (let thisNodeType of palArray) {
        chStatus = doCanHandle(thisNodeType, payload);

        if (chStatus > bestChStatus) {
            possItem = thisNodeType;
            bestChStatus = chStatus;
        }
    }

    return { 'nodeType': possItem, 'status': bestChStatus };
}
