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
 * @file Functions for drag events relating to link objects.
 *
 * @author Dave Braines
 **/

import {getProject} from "/javascripts/private/state.js";
import {get as getFromSs} from "/javascripts/private/csData/svgstore.js";
import {warn} from "/javascripts/private/util/log.js";
import {
    computeLabelAnchorCoords,
    computePathBetween
} from "/javascripts/private/util/coords.js";
import {
    getSessionCurrentLink,
    getSessionTargetObject,
    removeSessionCurrentLink,
    removeSessionTargetObject,
    setSessionCurrentLink,
    setSessionTargetObject
} from "/javascripts/private/csData/csDataSession.js";
import {saveActionMisc} from "/javascripts/private/csData/change/csDataChanges.js";

/**
 * The link anchor is being dragged.  Compute coordinates that ensure it cannot leave the line of the link and use
 * these coordinates to update the position of the link anchor and the link label.
 *
 * @param {DragEvent} e                     the drag event.
 * @param {SVGCircleElement} anchorElem     the svg circle that represents the link anchor that is being dragged.
 */
export function anchorDragged(e, anchorElem) {
    if (e.sourceEvent.shiftKey) {
        let thisLink = getProject().getLinkById(anchorElem.id);
        animateBender(e, anchorElem, thisLink);
    }
}

/**
 * The link anchor drag had ended.  Save the final value of the anchor offset onto the corresponding link object.
 *
 * @param {DragEvent} e                     the drag event.
 * @param {SVGCircleElement} anchorElem     the svg circle that represents the link anchor that is being dragged.
 */
export function anchorDragEnded(e, anchorElem) {
    if (e.sourceEvent.shiftKey) {
        let thisLink = getProject().getLinkById(anchorElem.id);

        if (thisLink) {
            animateBender(e, anchorElem, thisLink, true);
        } else {
            warn(`Anchor offset could not be saved for link: ${ anchorElem.id}`);
        }
    }
}

function animateBender(e, anchorElem, thisLink, generateAction) {
    let c = computeLabelAnchorCoords(e, anchorElem, thisLink);

    if (c.bender !== thisLink.getBender()) {
//        thisLink.setBender(c.bender);
        let linkLine = getFromSs(thisLink.id).line;
        linkLine.attr('d', computePathBetween(thisLink.getSourceNode(), c.bender, thisLink.getTargetNode()))

        c = computeLabelAnchorCoords(e, anchorElem, thisLink);

    }

    let linkAnchor = getFromSs(anchorElem.id).anchor;
    let linkLabel = getFromSs(anchorElem.id).label;

    linkAnchor.attr('cx', c.x);
    linkAnchor.attr('cy', c.y);

    linkLabel.attr('x', c.x);
    linkLabel.attr('y', c.y);

    if (generateAction) {
        if (thisLink.getAnchorPos() !== c.offset) {
            saveActionMisc('canvas:linkAnchorMoved', null, { "linkId": thisLink.id });
        }

        if (c.bender !== thisLink.getBender()) {
            if (generateAction) {
                saveActionMisc('canvas:linkBent', null, {"linkId": thisLink.id});
            }
        }

        thisLink.setAnchorPos(c.offset);
        thisLink.setBender(c.bender);
    }
}

/**
 * Get the target node from the session.  This is the node that the user is hovering over whilst drawing a new link
 * and the potential target node if the link is completed by dropping it onto this node..
 *
 * @return {csNode}             the node under the users cursor.
 */
export function getTargetNode() {
    return getSessionTargetObject();
}

/**
 * Set the target node in the session.  This is the node that the user is hovering over whilst drawing a new link.
 *
 * @param {csNode} tgtNode      the node under the users cursor.
 */
export function setTargetNode(tgtNode) {
    setSessionTargetObject(tgtNode);
}

/**
 * Clear the target node from the session.
 */
export function clearTargetNode() {
    removeSessionTargetObject();
}

/**
 * Get the current link from the session.  This is the link that is being drawn by the user and may be completed by
 * dropping onto a target node..
 *
 * @return {csLink}             the link that is currently being drawn.
 */
export function getCurrentLink() {
    return getSessionCurrentLink();
}

/**
 * Set the current link in the session.  This is the link that is being drawn by the user and may be completed by
 * dropping onto a target node..
 *
 * @return {csLink} tgtLink          the link that is currently being drawn.
 */
export function setCurrentLink(tgtLink) {
    setSessionCurrentLink(tgtLink);
}

/**
 * Clear the current link from the session.
 */
export function clearCurrentLink() {
    removeSessionCurrentLink();
}
