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
 * @file Implements all canvas pan/nudge/zoom events.
 * @author Dave Braines
 */

import {getProject} from "/javascripts/private/state.js";
import {moveNode} from "./dragdrop/node.js";
import {getCanvasDimensions} from "/javascripts/private/util/coords.js";
import {getCurrentViewBox} from "/javascripts/private/util/coords.js";
import {getRawMousePos} from "/javascripts/private/util/coords.js";
import {setCurrentViewBox} from "/javascripts/private/util/coords.js";
import {resetViewBox} from "/javascripts/private/util/coords.js";
import {
    getSessionCanvasLayout,
    getSessionCanvasSelections
} from "/javascripts/private/csData/csDataSession.js";
import {saveActionMisc, saveActionPan, saveActionZoom} from "/javascripts/private/csData/change/csDataChanges.js";

/**
 * Get the pan factor from the user defined settings.  There are two separate values, one of which is chosen
 * depending on whether the pan event is triggered by a key event or a mouse/wheel event.  This is to allow
 * finer-grained and smoother mouse/wheel pan and zoom.
 *
 * @param {boolean}     [isKey=false]   whether the event was triggered from a key press
 * @returns {number}                    the user defined pan factor
 */
function getPanFactor(isKey) {
    let layout = getSessionCanvasLayout();
    let pf;

    if (isKey) {
        pf = layout.keyPanFactor;
    } else {
        pf = layout.panFactor;
    }

    return pf;
}

/**
 * Get the zoom factor from the user defined settings.  There are two separate values, one of which is chosen
 * depending on whether the zoom event is triggered by a key event or a mouse/wheel event.  This is to allow
 * finer-grained and smoother mouse/wheel pan and zoom.
 *
 * @param {boolean}     [isKey=false]   whether the event was triggered from a key press
 * @returns {number}                    the user defined pan factor
 */
function getZoomFactor(isKey) {
    let layout = getSessionCanvasLayout();
    let zf;

    if (isKey) {
        zf = layout.keyZoomFactor;
    } else {
        zf = layout.zoomFactor;
    }

    return zf;
}

/**
 * Get the radius for the empty node (the largest) from the user defined settings.
 *
 * @returns {number}    the radius for an empty node.
 */
function getEmptyRadius() {
    let layout = getSessionCanvasLayout();

    return layout.empty.radius;
}

/**
 * Identifies whether there are any nodes selected on the canvas.
 *
 * @returns {boolean}       true if any nodes are selected
 */
function hasSelectedNodes() {
    let selNodes = listSelectedNodes();

    return selNodes && (selNodes.length > 0);
}

/**
 * Returns the list of all nodes defined in the project.
 *
 * @returns {csNode[]}      the list of all nodes defined in the project.
 */
function listAllNodes() {
    return getProject().listNodes();
}

/**
 * Identifies whether there are any nodes defined in the current project.
 *
 * @returns {boolean}   true if any nodes are defined
 */
function hasProjectNodes() {
    return getProject().listNodes().length > 0;
}

/**
 * Returns the list of nodes selected on the canvas or an empty list.
 *
 * @returns {csNode[]}      the list of nodes selected on the canvas
 */
function listSelectedNodes() {
    let selections = getSessionCanvasSelections();

    return selections.nodes;
}

/**
 * Get the nudge distance in the X dimension.  This is computed from the user defined nudge factor and the current
 * viewBox width, meaning that the nudge amount is consistent relative to the zoom level.
 *
 * @returns {number}    the amount to move in the X dimension
 */
function getNudgeX() {
    let layout = getSessionCanvasLayout();
    let vb = getCurrentViewBox();

    return vb.width * layout.nudgeFactor;
}

/**
 * Get the nudge distance in the Y dimension.  This is computed from the user defined nudge factor and the current
 * viewBox height, meaning that the nudge amount is consistent relative to the zoom level.
 *
 * @returns {number}    the amount to move in the Y dimension
 */
function getNudgeY() {
    let layout = getSessionCanvasLayout();
    let vb = getCurrentViewBox();

    return vb.height * layout.nudgeFactor;
}

/**
 * Move each of the selected nodes on the canvas by a pre-defined amount, triggered by a used key press.
 * To disambiguate from general movement events, these simple keyboard moves and called 'nudges'.
 *
 * @param {number} deltaX       the amount to move in the X dimension
 * @param {number} deltaY       the amount to move in the Y dimension
 */
function nudgeNodes(deltaX, deltaY) {
    let nodeList = listSelectedNodes();

    saveActionMisc('canvas:nudgeNodes', nodeList);

    for (let thisNode of nodeList) {
        let newPos = thisNode.getPos();

        newPos.x = newPos.x + deltaX;
        newPos.y = newPos.y + deltaY;

        moveNode(thisNode, newPos);
    }
}

/**
 * Move any selected nodes to the left by the standard nudge ratio.
 */
function nudgeNodesLeft() {
    nudgeNodes((1 - getNudgeX()), 0);
}

/**
 * Move any selected nodes to the right by the standard nudge ratio.
 */
function nudgeNodesRight() {
    nudgeNodes(getNudgeX(), 0);
}

/**
 * Move any selected nodes up by the standard nudge ratio.
 */
function nudgeNodesUp() {
    nudgeNodes(0, (1 - getNudgeY()));
}

/**
 * Move any selected nodes down by the standard nudge ratio.
 */
function nudgeNodesDown() {
    nudgeNodes(0, getNudgeY());
}

/**
 * Calculate the extent that is required to enable all currently defined nodes within the project to be visible.
 *
 * @param {csNode[]} nodeList       the list of nodes from which to calculate the extent.
 * @returns {csExtent}              the extent required to include all project nodes.
 */
export function calculateExtent(nodeList) {
    let firstNode = nodeList[0];
    let extent = {
        "xMin": firstNode.getPos().x,
        "xMax": firstNode.getPos().x,
        "yMin": firstNode.getPos().y,
        "yMax": firstNode.getPos().y
    };

    /* Find the overall min/max values by comparing each of the nodes */
    for (let thisNode of nodeList) {
        let ignore = false;

        extent.xMin = Math.min(extent.xMin, thisNode.getPos().x);
        extent.xMax = Math.max(extent.xMax, thisNode.getPos().x);
        extent.yMin = Math.min(extent.yMin, thisNode.getPos().y);
        extent.yMax = Math.max(extent.yMax, thisNode.getPos().y);
    }

    /* The values so far are to node centre points.  Add padding based on node radius to ensure inclusion */
    let padding = getEmptyRadius() * 2;

    extent.xMin = extent.xMin - padding;
    extent.xMax = extent.xMax + padding;
    extent.yMin = extent.yMin - padding;
    extent.yMax = extent.yMax + padding;

    return extent;
}

/**
 * The user has pressed an arrow key so something needs to be moved.
 * If any nodes are selected then these should be nudged, otherwise the canvas should be panned.
 * The direction of move is opposite depending on pan vs nudge.
 */
export function panOrNudgeFromRightKey() {
    if (hasSelectedNodes()) {
        nudgeNodesRight();
    } else {
        panLeft(true);
    }
}

/**
 * The user has pressed an arrow key so something needs to be moved.
 * If any nodes are selected then these should be nudged, otherwise the canvas should be panned.
 * The direction of move is opposite depending on pan vs nudge.
 */
export function panOrNudgeFromLeftKey() {
    if (hasSelectedNodes()) {
        nudgeNodesLeft();
    } else {
        panRight(true);
    }
}

/**
 * The user has pressed an arrow key so something needs to be moved.
 * If any nodes are selected then these should be moved, otherwise the canvas should be panned.
 * The direction of move is opposite depending on pan vs nudge.
 */
export function panOrNudgeFromUpKey() {
    if (hasSelectedNodes()) {
        nudgeNodesDown();
    } else {
        panUp(true);
    }
}

/**
 * The user has pressed an arrow key so something needs to be moved.
 * If any nodes are selected then these should be moved, otherwise the canvas should be panned.
 * The direction of move is opposite depending on pan vs nudge.
 */
export function panOrNudgeFromDownKey() {
    if (hasSelectedNodes()) {
        nudgeNodesUp();
    } else {
        panDown(true);
    }
}

/**
 * Pan the canvas to the left.
 *
 * @param {boolean} [isKey=false]   whether the event is triggered from a key press
 */
export function panLeft(isKey) {
    let panFactor = getPanFactor(isKey);
    let vb = getCurrentViewBox();

    vb.left = vb.left + (vb.width * panFactor);

    saveActionPan();
    setCurrentViewBox(vb);
}

/**
 * Pan the canvas to the right.
 *
 * @param {boolean} [isKey=false]   whether the event is triggered from a key press
 */
export function panRight(isKey) {
    let vb = getCurrentViewBox();
    let panFactor = getPanFactor(isKey);

    vb.left = vb.left - (vb.width * panFactor);

    saveActionPan();
    setCurrentViewBox(vb);
}

/**
 * Pan the canvas up.
 *
 * @param {boolean} [isKey=false]   whether the event is triggered from a key press
 */
export function panUp(isKey) {
    let vb = getCurrentViewBox();
    let panFactor = getPanFactor(isKey);

    vb.top = vb.top + (vb.width * panFactor);

    saveActionPan();
    setCurrentViewBox(vb);
}

/**
 * Pan the canvas down.
 *
 * @param {boolean} [isKey=false]   whether the event is triggered from a key press
 */
export function panDown(isKey) {
    let vb = getCurrentViewBox();
    let panFactor = getPanFactor(isKey);

    vb.top = vb.top - (vb.width * panFactor);

    saveActionPan();
    setCurrentViewBox(vb);
}

/**
 * Pan to the specified location, respecting the current zoom factor.
 *
 * @param {number} x    the target x position for the pan
 * @param {number} y    the target y position for the pan
 */
export function panTo(x, y) {
    let vb = getCurrentViewBox();

    vb.left = x - (vb.width / 2);
    vb.top = y - (vb.height / 2);

    saveActionPan();
    setCurrentViewBox(vb);
}

/**
 * Zoom the viewBox in by the user defined zoom factor.
 *
 * @param {boolean} [isKey=false]   whether the zoom event was triggered from a key event
 */
export function zoomIn(isKey) {
    let vb = getCurrentViewBox();
    let zoomCoords  = computeZoomInCoords(vb, isKey);

    if (zoomCoords) {
        vb.left = vb.left + zoomCoords.leftPos;
        vb.top = vb.top + zoomCoords.topPos;
        vb.width = zoomCoords.newWidth;
        vb.height = zoomCoords.newHeight;

        saveActionZoom();
        setCurrentViewBox(vb);
    }
}

/**
 * Zoom the viewBox out by the user defined zoom factor.
 *
 * @param {boolean} [isKey=false]   whether the zoom event was triggered from a key event
 */
export function zoomOut(isKey) {
    let vb = getCurrentViewBox();
    let zoomCoords  = computeZoomOutCoords(vb, isKey);

    if (zoomCoords) {
        vb.left = vb.left - zoomCoords.leftPos;
        vb.top = vb.top - zoomCoords.topPos;
        vb.width = zoomCoords.newWidth;
        vb.height = zoomCoords.newHeight;

        saveActionZoom();
        setCurrentViewBox(vb);
    }
}

/**
 * Zoom so that all nodes currently defined are included.
 */
export function zoomToFillAll() {
    saveActionMisc('canvas:zoomToFill');

    if (hasProjectNodes()) {
        zoomToFill(listAllNodes());
    } else {
        /* No nodes are defined, so treat this as a reset zoom request */
        resetZoomPan();
    }
}

/**
 * Zoom so that any currently selected nodes are included.
 */
export function zoomToFillSelected() {
    let selection = getSessionCanvasSelections();

    if (selection.nodes && selection.nodes.length > 0) {
        saveActionMisc('canvas:zoomToSelected');

        zoomToFill(selection.nodes);
    }
}

/**
 * Reset the zoom/pan for the viewBox to the original (0,0 with zoom=1).
 */
export function resetZoomPan() {
    resetViewBox();
}

/**
 * Compute a zoom level that will include all of the nodes in the specified list.
 *
 * @param {csNode[]} nodeList       the list of nodes to be included in the zoom.
 */
function zoomToFill(nodeList) {
    let vb = getCurrentViewBox();
    let e = calculateExtent(nodeList);
    let newWidth = Math.round(e.xMax - e.xMin);
    let newHeight = Math.round(e.yMax - e.yMin);
    let wRatio = newWidth / vb.width;
    let hRatio = newHeight / vb.height;

    /* The dimension that has the highest ratio drives the viewBox - the other will be ignored */
    if (hRatio > wRatio) {
        newWidth = (newWidth / wRatio) * hRatio;
    } else {
        newHeight = (newHeight / hRatio) * wRatio;
    }

    vb.left = e.xMin;
    vb.top = e.yMin;
    vb.width = newWidth;
    vb.height = newHeight;

    setCurrentViewBox(vb);
}

/**
 * Compute the zoom in coordinates based on the zoom factor and the mouse position within the canvas.
 *
 * @param {csViewBox} vb      the current viewBox for the canvas.
 * @param {boolean} isKey   whether the zoom originate from a key press (ctrl +/-).
 * @returns {csZoomCoords}  the compute coordinates for the new zoom level.
 */
function computeZoomInCoords(vb, isKey) {
    let zoomFactor = getZoomFactor(isKey);
    let newWidth = vb.width * zoomFactor;
    let newHeight = vb.height * zoomFactor;
    let widthDelta = vb.width - newWidth;
    let heightDelta = vb.height - newHeight;

    return computeZoomCoords(vb, newWidth, widthDelta, newHeight, heightDelta);
}

/**
 * Compute the zoom out coordinates based on the zoom factor and the mouse position within the canvas.
 *
 * @param {csViewBox} vb      the current viewBox for the canvas.
 * @param {boolean} isKey   whether the zoom originate from a key press (ctrl +/-).
 * @returns {csZoomCoords}  the compute coordinates for the new zoom level.
 */
function computeZoomOutCoords(vb, isKey) {
    let zoomFactor = getZoomFactor(isKey);
    let newWidth = vb.width / zoomFactor;
    let newHeight = vb.height / zoomFactor;
    let widthDelta = newWidth - vb.width;
    let heightDelta = newHeight - vb.height;


    return computeZoomCoords(vb, newWidth, widthDelta, newHeight, heightDelta);
}

/**
 * Based on the position of the mouse pointer, compute the relative position for the zoom.  This allows zoom in/out
 * based on the position of the cursor rather than forcing the user to combine panning with zooming.
 * All calculations are done in viewBox dimensions rather than absolute.
 *
 * @param {csViewBox} vb            the current viewBox for the canvas.
 * @param {number} newWidth         the new width for the viewBox (simply passed through).
 * @param {number} widthDelta       the change in width for this zoom (simply passed through).
 * @param {number} newHeight        the new width for the viewBox (simply passed through).
 * @param {number} heightDelta      the change in width for this zoom (simply passed through).
 * @returns {csZoomCoords}          the computed new viewBox coordinates based on the zoom.
 */
function computeZoomCoords(vb, newWidth, widthDelta, newHeight, heightDelta) {
    let rawMp = getRawMousePos();   /* the x,y position of the mouse relative to the origin of the canvas */
    let result;

    // If the zoom request is very early the canvas may not have been drawn.
    // In that case rawMp will be null and can be safely ignored.
    if (rawMp) {
        let dims = getCanvasDimensions();
        let relativeXPos = rawMp.x / dims.width;
        let relativeYPos = rawMp.y / dims.height;
        let leftPos = widthDelta * relativeXPos;
        let topPos = heightDelta * relativeYPos;

        result = {
            "newWidth": Math.round(newWidth),
            "newHeight": Math.round(newHeight),
            "leftPos": Math.round(leftPos),
            "topPos": Math.round(topPos)
        }
    }

    return result;
}
