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
 * @file Utility function relating to coordinates, mainly on the canvas.
 * @author Dave Braines
 *
 * See /public/javascripts/typedefs/defs_coords.js for a description of the different coordinate systems.
 *
 **/

import {getProject} from "/javascripts/private/state.js";
import {getCanvasElement} from "/javascripts/private/core/core_panes/canvas/canvas.js";
import {getCurrentDrag} from "/javascripts/private/core/core_panes/canvas/dragdrop/dragdrop.js";
import {warn} from "/javascripts/private/util/log.js";
import {
    getHeight,
    getLeft,
    getMouseX,
    getMouseY,
    getTop,
    getWidth,
    getZoomFactor,
    setHeight,
    setIsPanning,
    setLeft,
    setTop,
    setWidth,
    setZoomFactor
} from "/javascripts/private/csData/csDataCanvas.js";
import {get as getFromSs} from "/javascripts/private/csData/svgstore.js";
import {getSessionCanvasLayout} from "/javascripts/private/csData/csDataSession.js";
import {saveActionMisc} from "/javascripts/private/csData/change/csDataChanges.js";

/**
 * @type {number}   The percentage of a lines 'length' (longest of width or height) that must be travelled before a
 *                  bend is created.
 */
const BENDER_PERCENT = 0.1;

/**
 * @type {number}   The number of pixels that cannot be used at the end of each line line - two prevent the anchor
 *                  obscuring the arrowhead, or being hidden by the source or target node.
 */
const ANCHOR_BUFFER = 60;

/**
 * Returns the default viewBox with 0 offset and zoom and width/height of the container.
 *
 * @returns {csViewBox}     the default viewBox
 */
function defaultViewBox() {
    return {
        "left": 0,
        "top": 0,
        "width": getWidth(),
        "height": getHeight(),
        "zoomFactor": 1
    };
}

/**
 * Get the viewBox attribute from the canvas element. This is a space delimited set of numbers representing the
 * left and to coordinates and the width and height (in the ViewBox coordinate system).
 *
 * @returns {string}        the viewBox attribute text
 */
function getViewBoxAttribute() {
    let canvasElem = getCanvasElement(true);
    let result;

    if (canvasElem) {
        result = canvasElem.getAttribute('viewBox');
    }

    return result;
}

/**
 * Convert a csViewBox object into the simple viewBox text so that an svg element can be set with the correct viewBox
 * attributes.
 *
 * @param {csViewBox} vb    the viewBox object to be converted to text.
 * @returns {string}        the space-separated string required for setting a viewBox SVG attribute.
 */
function createViewBoxTextFrom(vb) {
    return Math.round(vb.left) + ' ' + Math.round(vb.top) + ' ' + Math.round(vb.width) + ' ' + Math.round(vb.height) + ' ';
}

/**
 * Get the current viewBox details as a simple object.  Returns a default viewBox if the canvas element
 * or the viewBox attribute are not yet set.
 *
 * @returns {csViewBox}    the current viewBox and zoom details
 */
export function getCurrentViewBox() {
    let result;
    let vbAttr = getViewBoxAttribute();
    let vbParts;

    if (vbAttr) {
        vbParts = vbAttr.split(' ');

        result = {
            "left": parseFloat(vbParts[0]),
            "top": parseFloat(vbParts[1]),
            "width": parseFloat(vbParts[2]),
            "height": parseFloat(vbParts[3]),
            "zoomFactor": getZoomFactor() || 1
        };
    } else {
        warn('canvas not ready - default viewBox used');
        result = defaultViewBox();
    }

    return result;
}

/**
 * Set the viewBox attribute for the SVG canvas to the specified coordinates.
 *
 * @param {csViewBox} vb    the viewBox object containing the coordinates to be used.
 */
export function setCurrentViewBox(vb) {
    let canvasElem = getCanvasElement(true);
    let vbText = createViewBoxTextFrom(vb);

    canvasElem.setAttribute('viewBox', vbText);

    /* Also set the viewBox on the project so that it is retained if the project is saved */
    if (getProject()) {
        getProject().setViewBox(vb);
    }

    setZoomFactor(vb.zoomFactor);
}

/**
 * Compute the canvas position from the specified 'pure' node position.
 *
 * @param {csCoordinates} nodePos   the x,y coordinates for a node (in the node coordinate system).
 * @param {number} [offsetX]        an optional X offset to be applied (in the node coordinate system).
 * @param {number} [offsetY]        an optional Y offset to be applied (in the node coordinate system).
 * @returns {csCoordinates}         the calculated canvas coordinates (in the ViewBox coordinate system).
 */
export function getCanvasPosFromNodePos(nodePos, offsetX, offsetY) {
    let vb = getCurrentViewBox();
    let l = getLeft();
    let t = getTop();

    return {
        "x": l + ((nodePos.x - vb.left + (offsetX || 0)) / vb.zoomFactor),
        "y": t + ((nodePos.y - vb.top + (offsetY || 0)) / vb.zoomFactor)
    };
}

/**
 * Compute the position on the canvas based on the absolute mouse position.
 *
 * @returns {csCoordinates}    the x,y position on the canvas (in the Pure coordinate system).
 */
export function getPosFromMousePos() {
    let m = getRawMousePos();
    let l = getLeft();
    let t = getTop();

    return { "x": (l + m.x), "y": (t + m.y) };
}

/**
 * Get the current mouse position (in the Pure coordinate system).  This is retrieved from session storage as it
 * is stored separately by a mouseMove event.
 *
 * @returns {csCoordinates}     the current mouse position (in the Pure coordinate system).
 */
export function getRawMousePos() {
    let mx = getMouseX();
    let my = getMouseY();
    let result;

    if (!isNaN(mx) && !isNaN(my)) {
        result = { "x": mx, "y": my };
    }

    return result;
}

/**
 * Get the current mouse position offset from the top left of the canvas (in the Pure coordinate system).
 * This is retrieved from session storage as it is stored separately by a mouseMove event.
 *
 * @returns {csCoordinates}     the current mouse position (in the Pure coordinate system).
 */
export function getOffsetMousePos() {
    let mx = getMouseX();
    let l = getLeft();
    let my = getMouseY();
    let t = getTop();

    return { "x": mx + l, "y": my + t };
}

/**
 * Compute the zoom factor for the specified viewBox.  Used in cases when the zoom factor has not been saved.
 *
 * @param {csViewBox} vb    the viewBox coordinates to be used.
 * @returns {number}        the computed zoom factor value.
 */
function computeZoomFactor(vb) {
    let actualWidth = getWidth();
    let actualHeight = getHeight();
    let widthZf = vb.width / actualWidth;
    let heightZf = vb.height / actualHeight;

    return Math.max(heightZf, widthZf);
}

/**
 * Reset the viewBox to the default value.
 */
export function resetViewBox() {
    saveActionMisc('canvas:zoomToOriginal');

    setCurrentViewBox(defaultViewBox());
}

/**
 * Restore the viewBox to this previously saved configuration.  This must take into account that the physical
 * dimensions of the SVG canvas may be different to those when the viewBox was saved (both in terms of size and
 * ratio) so the viewBox may need to be scaled to account for the current dimensions.
 *
 * If no zoom factor is specified then the computation cannot be safely made (and it is because this viewBox comes
 * from an old project save) so simply reset the viewBox to the default.
 *
 * @param {csViewBox} vb    the viewBox to be used.
 */
export function restoreSavedViewBox(vb) {
    if (vb.zoomFactor) {
        let w = getWidth();
        let h = getHeight();
        let wRatio = parseFloat((vb.width / w).toFixed(2));
        let hRatio = parseFloat((vb.height / h).toFixed(2));
        let wDev = Math.abs(1 - (wRatio / vb.zoomFactor));
        let hDev = Math.abs(1 - (hRatio / vb.zoomFactor));

        /* Only recompute the width if it is out by more than a small factor */
        if (wDev > 0.1) {
            vb.width = (vb.width / wRatio) * hRatio;
        }

        /* Only recompute the height if it is out by more than a small factor */
        if (hDev > 0.1) {
            vb.height = (vb.height / hRatio) * wRatio;
        }

        setCurrentViewBox(vb);
    } else {
        /* a saved project without a zoom factor is old and must be reset */
        warn('ViewBox has been reset to the default as no zoom factor was saved');
        resetViewBox();
    }
}

/**
 * Compute the canvas coordinates for the specified raw position.  This takes into account the viewBox settings,
 * zoom factor and offsets.
 *
 * @param {csCoordinates} rawCoords     the raw position to use (in the Node coordinate system).
 * @returns {csCoordinates}             the corresponding canvas coordinates (in the ViewBox coordinate system).
 */
export function computeCoordsFor(rawCoords) {
    let result = {};
    let vb = getCurrentViewBox();

    resetCanvasProps(vb);

    let l = getLeft();
    let t = getTop();
    let zf = getZoomFactor();
    let realX = rawCoords.x - l;
    let realY = rawCoords.y - t;

    if ((zf === Infinity) || (isNaN(zf))) {
        zf = 1;
    }

    let calcX = vb.left + (realX * zf);
    let calcY = vb.top + (realY * zf);

    /* if there is a drag in progress then the drag offset must be applied */
    let currDrag = getCurrentDrag();

    if (currDrag) {
        calcX = calcX - currDrag.x;
        calcY = calcY - currDrag.y;
    }

    result.x = Math.round(calcX);
    result.y = Math.round(calcY);

    return result;
}

/**
 * Reset the canvas to the specified viewBox and ensure the stored values are also updated.
 *
 * @param {csViewBox} [vb]    the optional viewBox to use for the reset (in the ViewBox coordinate system).
 */
export function resetCanvasProps(vb) {
    let dims = getCanvasDimensions();

    if (dims) {
        setWidth(dims.width);
        setHeight(dims.height);
        setTop(dims.top);
        setLeft(dims.left);
        setIsPanning(false);

        if (vb) {
            setZoomFactor(computeZoomFactor(vb));
        } else {
            let layout = getSessionCanvasLayout();
            setZoomFactor(layout.initialZoom);
        }
    }
}

/**
 * Compute the dimensions of the canvas element on the page (in the Absolute coordinate system).
 *
 * @returns {csDimensions}  the dimensions of the canvas element (in the Absolute coordinate system).
 */
export function getCanvasDimensions() {
    let canvasElem = getCanvasElement(true);
    let result;

    if (canvasElem) {
        let rect = canvasElem.getBoundingClientRect();

        if (rect) {
            result = {
                "top": Math.round(rect.top),
                "left": Math.round(rect.left),
                "width": canvasElem.clientWidth,
                "height": canvasElem.clientHeight
            };
        }
    }

    return result;
}

/**
 * Recenter the viewBox to the specified coordinates (in the ViewBox coordinate system).
 *
 * @param {csCoordinates} c     the canvas coordinates to be used (in the ViewBox coordinate system).
 */
export function recenter(c) {
    let vb = getCurrentViewBox();
    let midX = vb.width / 2;
    let midY = vb.height / 2;

    vb.left = c.x - midX;
    vb.top = c.y - midY;

    setCurrentViewBox(vb);
}

/**
 * Get the center point of the canvas (in the Node coordinate system).
 *
 * @returns {csCoordinates}     the center of the canvas (in the Node coordinate system).
 */
export function getCenterPoint() {
    let vb = getCurrentViewBox();
    let result = {};

    result.x = vb.width / 2;
    result.y = vb.height / 2;

    // let l = getLeft();
    // let t = getTop();
    // let zf = getZoomFactor();

    return result;
}

/**
 * Compute the midpoint for the specified link (in the Node coordinate system).
 *
 * @param {csLink} tgtLink      the link object
 * @returns {csCoordinates}     the calculated midpoint position (in the Node coordinate system).
 */
export function computeMidpointFor(tgtLink) {
    let midpoint = {};
    let xStart = tgtLink.getSourceNode().getPos().x;
    let xEnd = tgtLink.getTargetNode().getPos().x;
    let yStart = tgtLink.getSourceNode().getPos().y;
    let yEnd = tgtLink.getTargetNode().getPos().y;

    let midX = (xEnd - xStart) / 2;
    let midY = (yEnd - yStart) / 2;

    if (midX < 0) {
        midX = 1 - midX;
        midpoint.x = xEnd + midX;
    } else {
        midpoint.x = xStart + midX;
    }

    if (midY < 0) {
        midY = 1 - midY;
        midpoint.y = yEnd + midY;
    } else {
        midpoint.y = yStart + midY;
    }

    return midpoint;
}

/**
 * Compute the midpoint between two specified points (in the Node coordinate system).
 *
 * @param {csCoordinates} startPos  the start position
 * @param {csCoordinates} endPos    the end position
 * @returns {csCoordinates}         the calculated midpoint position (in the Node coordinate system).
 */
function computeMidpointBetween(startPos, endPos) {
    let midpoint = {};

    let midX = (endPos.x - startPos.x) / 2;
    let midY = (endPos.y - startPos.y) / 2;

    if (midX < 0) {
        midX = 1 - midX;
        midpoint.x = endPos.x + midX;
    } else {
        midpoint.x = startPos.x + midX;
    }

    if (midY < 0) {
        midY = 1 - midY;
        midpoint.y = endPos.y + midY;
    } else {
        midpoint.y = startPos.y + midY;
    }

    return midpoint;
}

/**
 * Compute the quadratic curve path string between the specified source and target nodes.
 *
 * @param {csNode} srcNode          the source node in the relationship
 * @param {number} bender           the amount the link line should bend
 * @param {csNode} [tgtNode]        the target node in the relationship
 * @return {string}                 the standard quadratic curve path (M x1, y1 Q, x3, y3, x2, y2)
 */
export function computePathBetween(srcNode, bender, tgtNode) {
    let startPos = srcNode.getPos();
    let endPos;

    if (tgtNode) {
        endPos = tgtNode.getPos();

        // In case the node has been saved with no position, use 0,0 as the default
        if (!endPos || (!endPos.x && endPos.x !== 0) || (!endPos.y && endPos.y !== 0)) {
            endPos = { "x": 0, "y": 0 };
        }
    } else {
        endPos = getPosFromMousePos();
    }

    let mid = computeMidpointBetween(startPos, endPos);

    if (bender) {
        mid = modifyWithBender(startPos, endPos, mid, bender);
    }

    return `
    M${startPos.x} ${startPos.y}
    Q${mid.x} ${mid.y}
    ${endPos.x} ${endPos.y}`;
}

/**
 * The link line (SVG path) between two nodes can be modified with a bender - this is created when the user drags
 * the label anchor, and is stored as a positive or negative integer 'bender' value on the link.  This function
 * computes the midpoint to be used to define the curve in the quadratic bezier that is the link line.  If the
 * bender is 0 then the line is straight.
 *
 * @param {csCoordinates} startPos      the start of the line
 * @param {csCoordinates} endPos        the end of the line
 * @param {csCoordinates} mid           the simple midpoint for the line (will be returned if bender=0)
 * @param {number} bender               the degree of bend needed on the curve
 * @return {csCoordinates}              the new 'midpoint' which is offset by the required bend
 */
function modifyWithBender(startPos, endPos, mid, bender) {
    let newMid = { "x": mid.x, "y": mid.y };
    let xDelta = Math.abs(endPos.x - startPos.x);
    let yDelta = Math.abs(endPos.y - startPos.y);

    if (xDelta > yDelta) {
        let change = xDelta * BENDER_PERCENT * bender;
        newMid.y += change;
    } else {
        let change = yDelta * BENDER_PERCENT * bender;
        newMid.x += change;
    }

    return newMid;
}

/**
 * Compute the link anchorpoint based on the specified ratio position (in the Node coordinate system).
 * This is called when a link is drawn on loading and when the link is dragged and the location of the anchor point
 * needs to be recalculated.
 *
 * @param {csLink} link         the link that the line represents.
 * @param {object} svgLine      the svg line element (jQuery selector).
 * @returns {csCoordinates}     the computed anchor point for this link.
 */
export function computeAnchorpointFor(link, svgLine) {
    let anchorPos = link.getAnchorPos() || 0.5;

    return svgLine.node().getPointAtLength(svgLine.node().getTotalLength() * anchorPos);
}

/**
 * Called when the anchor point for a link is dragged.
 * Compute the link anchorpoint based on the specified ratio position (in the ViewBox coordinate system).
 *
 * @param {DragEvent} e             the event that is making the request (a mouse move/drag on the canvas).
 * @param {Element} d3Obj           the element that is being moved/dragged.
 * @param {csLink} tgtLink          the link that is being created.
 * @returns {csLineCoordinates}     the computed anchor point for this link (in the ViewBox coordinate system).
 */
export function computeLabelAnchorCoords(e, d3Obj, tgtLink) {
    let a = {}; // Use this object to store all variables relating to this computation.
    let lineElem = getFromSs(d3Obj.id).line;
    let lineBox = lineElem.node().getBBox();

    // c = the 'raw' coordinates (current coordinates of the mouse on the canvas).
    a.c = computeCoordsFor(e.sourceEvent);

    // this = the constrained coordinates , which cannot exceed the rectangle boundary for this link.
    // Initially they are set to the raw coordinates.
    a.this = {
        "x": a.c.x,
        "y": a.c.y
    };

    // Record the bounding rectangle coordinates and dimensions.
    a.rectangle = {
        "left": lineBox.x,
        "top": lineBox.y,
        "right": lineBox.x + lineBox.width,
        "bottom": lineBox.y + lineBox.height,
        "width": lineBox.width,
        "height": lineBox.height
    };

    a.mid = computeMidpointBetween(tgtLink.getSourceNode().getPos(), tgtLink.getTargetNode().getPos());

    // Compute ratios of the dimensions, so we can determine whether to track the move in the x of y dimension.
    a.ratios = {
        "x": a.rectangle.width / a.rectangle.height,
        "y": a.rectangle.height / a.rectangle.width
    };

    // Check the bounds of the rectangle are not exceeded, and if they are limit to those bounds.
    if (a.this.x > a.rectangle.right) { a.this.x = a.rectangle.right; }
    if (a.this.x < a.rectangle.left) { a.this.x = a.rectangle.left; }
    if (a.this.y > a.rectangle.bottom) { a.this.y = a.rectangle.bottom; }
    if (a.this.y < a.rectangle.top) { a.this.y = a.rectangle.top; }

    // The smallest relative ratio determines the delta that is chosen.
    // i.e. if the rectangle is wider than it is tall, then movement in the x-axis will determine the anchor position,
    // and vice-versa.
    // offset = the relative position of the anchor (from 0 to 1) along the length of the line.
    // inverted = whether the rectangle is inverted, i.e. the link line flows from right to left, or bottom to top.
    // endBuffer = a relative value beyond which the anchor cannot be located.  This is to prevent it obscuring the
    //             arrowhead, or being hidden by the source or target node.
    if (Math.abs(a.ratios.x) > Math.abs(a.ratios.y)) {
        a.offset = (a.rectangle.right - a.this.x) / a.rectangle.width;
        a.inverted = (tgtLink.getSourceNode().getPos().x > tgtLink.getTargetNode().getPos().x);
        a.endBuffer = (a.rectangle.width / (a.rectangle.width - ANCHOR_BUFFER)) * 0.1;
        a.bender = Math.floor((a.c.y - a.mid.y) * BENDER_PERCENT);
    } else {
        a.offset = (a.rectangle.bottom - a.this.y) / a.rectangle.height;
        a.inverted = (tgtLink.getSourceNode().getPos().y > tgtLink.getTargetNode().getPos().y);
        a.endBuffer = (a.rectangle.height / (a.rectangle.height - ANCHOR_BUFFER)) * 0.1;
        a.bender = Math.floor((a.c.x - a.mid.x) * BENDER_PERCENT);
    }

    // If the rectangle is inverted the the offset must also be inverted.
    if (!a.inverted) {
        a.offset = 1 - a.offset;
    }

    // If the offset is greater than the allowed buffer then reduce it accordingly.
    if (a.offset > (1 - a.endBuffer)) {
        a.offset = (1 - a.endBuffer);
    }

    // If the offset is less than the allowed buffer then cap it accordingly.
    if (a.offset < a.endBuffer) {
        a.offset = a.endBuffer;
    }

    // Compute the distance along the line (in pixels) using the offset.
    let offsetPos = lineElem.node().getTotalLength() * a.offset;

    // Finally, use the SVG function to get the point on the line at the specified length.
    a.newPos = lineElem.node().getPointAtLength(offsetPos);

    // Return the new position:
    // x - the x position of the centre of the anchor.
    // y - the y position of the centre of the anchor.
    // offset - the relative position on the line as a percentage (from 0 to 1).
    // bender - the integer amount the line should be bent.
    return { "x": a.newPos.x, "y": a.newPos.y, "offset": a.offset, "bender": a.bender };
}

/**
 * A wrapper for the computing of radial position for nodes.  Will be upgraded to handle other layout types
 * and therefore allow a single entry point to multiple layouts.
 *
 * @param {object} config           the layout configuration object.
 * @param {csNode} tgtNode          the existing node that is the source from which the new position will be calculated.
 * @param {number} pos              the specific position for this one node within a set of possible positions.
 * @param {number} slices           the total number of positions that should be accounted for.
 * @param {number} [radius=200]     for a radial layout this is the optional radius in pixels that will be used.
 * @returns {csCoordinates}         the computed position for the new node.
 */
export function computeNewNodePosFrom(config, tgtNode, pos, slices, radius) {
    //TODO: Implement additional layouts beyond just radial
    return computeRadialPosFrom(tgtNode, pos, slices, radius)
}

/**
 * Compute the position for a new node based on a radial layout originating from a specified existing node.  The 'pos'
 * and 'slices' parameters determine which position will be computed (pos) within a maximum number of possible
 * positions (slices).
 *
 * @param {csNode} tgtNode          the existing node that is the source from which the new position will be calculated.
 * @param {number} pos              the specific position for this one node within a set of possible positions.
 * @param {number} slices           the total number of positions that should be accounted for.
 * @param {number} [radius=200]     for a radial layout this is the optional radius in pixels that will be used.
 * @returns {csCoordinates}         the computed position for the new node.
 */
export function computeRadialPosFrom(tgtNode, pos, slices, radius=200) {
    let finalPos = {};
    let sliceDegrees = 360 / slices;
    let sliceRadians = degreesToRadians(sliceDegrees);
    let radPos = sliceRadians * pos;
    let actualRadius = radius;
    let e = getCanvasPosFromNodePos(tgtNode.getPos());

    if (slices > 20) {
        actualRadius = (slices / 20) * radius;
    }

    let zf = getZoomFactor();

    finalPos.x = e.x + (Math.cos(radPos) * (actualRadius / zf));
    finalPos.y = e.y + (Math.sin(radPos) * (actualRadius / zf));

    return finalPos;
}

/**
 * Simple function to convert degrees to radians.
 *
 * @param {number} degrees      the degrees to be converted.
 * @returns {number}            the answer in radians.
 */
function degreesToRadians(degrees) {
    return degrees * (Math.PI/180);
}

/**
 * Return true if the specified node is within the specified rectangle.
 *
 * @param {csNode} tgtNode      the node to be checked.
 * @param {csRectangle} r       the rectangle to be used (in the Node coordinate system).
 * @returns {boolean}           whether the node is within the rectangle.
 */
export function isInside(tgtNode, r) {
    let result = false;

    if ((tgtNode.getPos().x > r.x1) && (tgtNode.getPos().x < r.x2)) {
        if ((tgtNode.getPos().y > r.y1) && (tgtNode.getPos().y < r.y2)) {
            result = true;
        }
    }

    return result;
}
