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
 * @file Functions for drag events relating to node objects.
 *
 * @author Dave Braines
 **/

import {getProject} from "/javascripts/private/state.js";
import {
    getSvgDetailFrom,
    getSvgIconFrom,
    getSvgIconImageFrom,
    getSvgLabelFrom,
    getSvgLinkLabelAnchorFrom,
    getSvgLinkLabelFrom,
    getSvgLinkLineFrom
} from "/javascripts/private/csData/svgstore.js";
import {saveActionMisc, saveActionMoveNodes} from "/javascripts/private/csData/change/csDataChanges.js";
import {debug,
    error,
    showToast,
    userConfirm,
    warn
} from "/javascripts/private/util/log.js";
import {
    computeAnchorpointFor,
    computeCoordsFor,
    computePathBetween,
    getPosFromMousePos
} from "/javascripts/private/util/coords.js";
import {firstNodeExecuteCallbackFor} from "/javascripts/private/util/callback/cbFunction.js";
import {
    clearCurrentDrag,
    getCurrentDrag,
    PREFIX_FUNC,
    setCurrentDrag
} from "/javascripts/private/core/core_panes/canvas/dragdrop/dragdrop.js";
import {extractPayload} from "./canvas.js";
import {
    getSessionCanvasLayout,
    getSessionCanvasSelections,
    setSessionIsDragging
} from "/javascripts/private/csData/csDataSession.js";
import {
    dropRawFiles,
    isRawFileDrop
} from "/javascripts/private/core/core_panes/canvas/dragdrop/files.js";
import {
    doCanHandle,
    doStartLink,
    doSwitchToPopulatedNode
} from "/javascripts/private/core/hooks.js";
import {delayedNodeClick} from "/javascripts/private/core/core_panes/canvas/events/node.js";
import {finishRectangleSelect} from "/javascripts/private/core/core_panes/canvas/select.js";
import {updateMousePos} from "/javascripts/private/core/core_panes/canvas/mouse.js";
import {
    getCurrentLink,
    getTargetNode
} from "/javascripts/private/core/core_panes/canvas/dragdrop/link.js";
import {preventDefaultAndStopPropagation} from "/javascripts/private/ui/window/events.js";
import {maybeCreateLink} from "/javascripts/private/core/model.js";
import {deleteNode} from "/javascripts/private/core/create.js";
import {refreshNode} from "/javascripts/interface/data.js";
import {computeIconOffset, computeLabelOffset} from "/javascripts/private/core/graphics.js";
import {getSelectedItems} from "/javascripts/private/csData/csDataCanvas.js";

//TODO: Thorough review needed across node drop, canvas drop and paste functions.

/**
 * The drag has started for a node.  If the shift key is down then start to create a link from this node.
 * The passed svgElem may be either the circle or the image since both make up the node on the canvas.
 *
 * @param {DragEvent} e                                     the drag event.
 * @param {SVGCircleElement|SVGImageElement} svgElem        the svg circle or image that represents the dragged node.
 */
export function dragStarted(e, svgElem) {
    let tgtId = d3.select(svgElem).attr('id');

    if (tgtId) {
        let svgIconElem = getSvgIconFrom(getProject().getNodeById(tgtId), true);
        storeDrag(e, svgIconElem);

        if (e.sourceEvent.shiftKey) {
            if (getProject().isReadOnly()) {
                error('Cannot create link - project is read only', null, null, true);
            } else {
                doStartLink(svgElem, e);
            }
        }
    }
}

/**
 * The node continues to be dragged.
 * If shift is held then continue to animate the partial link that is being made.
 * If shift is not held then simply animate the dragged node to the new position, also moving any other selected nodes.
 *
 * @param {DragEvent} e                                     the drag event.
 * @param {SVGCircleElement|SVGImageElement} svgElem        the svg circle or image that represents the dragged node.
 */
export function dragged(e, svgElem) {
    updateMousePos(e);

    let c = computeCoordsFor(e.sourceEvent);

    if (e.sourceEvent.shiftKey) {
        let currLink = getCurrentLink();

        if (currLink) {
            let lineElem = getSvgLinkLineFrom(currLink, true);

            if (lineElem) {
                let tgtNode = getTargetNode();

                lineElem.setAttribute('d', computePathBetween(currLink.getSourceNode(), currLink.getBender(), tgtNode))
            }
        }
    } else {
        let tgtId = d3.select(svgElem).attr('id');

        if (tgtId) {
            let tgtNode = getProject().getNodeById(tgtId);
            let origX = tgtNode.getPos().x;
            let origY = tgtNode.getPos().y;

            moveNode(tgtNode, c);

            if (tgtNode.isSelected()) {
                /* the node being dragged is selected, so also drag anything else that is selected too */
                let selections = getSessionCanvasSelections();

                for (let thisNode of selections.nodes) {
                    if (thisNode !== tgtNode) {
                        let deltaX = thisNode.getPos().x - origX;
                        let deltaY = thisNode.getPos().y - origY;

                        moveNode(thisNode, c, deltaX, deltaY);
                    }
                }
            }
        }
    }
}

/**
 * The drag event has ended for this node so clear the current drag selection.
 * If the shift key is held then test whether the partial link is valid, and create the link if so.
 * Otherwise simply register a move change for the selected node.
 *
 * @param {DragEvent} e                                     the drag event.
 * @param {SVGCircleElement|SVGImageElement} svgElem        the svg circle or image that represents the dragged node.
 */
export function dragEnded(e, svgElem) {
    if (e.sourceEvent.shiftKey) {
        let tgtNode = getTargetNode();

        let linkMade = maybeCreateLink(tgtNode);

        if (!linkMade) {
            /* This could be a shift+click event, i.e. a select event.
             * If the event shows no movement then fire the node click event instead.
             * It is suppressed due to the drag event and the shift key.
             */
            if ((e.dx === 0) && (e.dy === 0)) {
                /* ...but ignore if the target node is the svg canvas */
                if (e.sourceEvent.target.nodeName !== 'svg') {
                    delayedNodeClick(e.sourceEvent, e.sourceEvent.path[1]);
                }
            }
        }
    } else {
        let tgtId = d3.select(svgElem).attr('id');
        let tgtNode = getProject().getNodeById(tgtId);
        let currDrag = getCurrentDrag();

        if (hasMoved(tgtNode, currDrag)) {
            let nodes = findNodesAtMousePos(tgtNode);

            if (nodes.length === 1) {
                mergeProperties(tgtNode, nodes[0], e.sourceEvent.ctrlKey);
            } else {
                let movedNodes = [ tgtNode ];
                let selNodes = getSelectedItems().nodes;

                if (selNodes.indexOf(tgtNode) > -1) {
                    for (let node of selNodes) {
                        if (movedNodes.indexOf(node) === -1) {
                            movedNodes.push(node);
                        }
                    }
                }

                saveActionMoveNodes(movedNodes, currDrag);
            }
        }
    }

    clearCurrentDrag();
}

function mergeProperties(srcNode, tgtNode, keepNode) {
    let doMerge = userConfirm('Are you sure you want to merge these nodes?');

    if (doMerge) {
        saveActionMisc('canvas: mergeNodes', srcNode, { "srcNode": srcNode.id, "tgtNode": tgtNode.id });

        //TODO: Check for over-writing of properties
        for (let [propName, val] of Object.entries(srcNode.listProperties())) {
            if (val.type === 'long text') {
                tgtNode.setTextPropertyNamed(propName, val.value);
            } else if (val.type === 'normal') {
                tgtNode.setNormalPropertyNamed(propName, val.value);
            } else if (val.type === 'json') {
                tgtNode.setJsonPropertyNamed(propName, val.value);
            } else {
                warn(`Unhandled property type '${val.type}' ignored during merge`);
            }
        }

        if (!keepNode) {
            deleteNode(srcNode);
        }

        refreshNode(tgtNode);
    }
}

function findNodesAtMousePos(excNode) {
    //TODO: Improve this - iterating through all nodes on every drag end event is too expensive.
    //A better way would be to receive a drop event onto the actual node.
    let tgtPos = getPosFromMousePos();
    let result = [];

    for (let thisNode of getProject().listNodes()) {
        if (thisNode !== excNode) {
            let deltaX = thisNode.getPos().x - tgtPos.x;
            let deltaY = thisNode.getPos().y - tgtPos.y;

            //TODO: These should not be hardcoded
            if ((Math.abs(deltaX) < 20) && (Math.abs(deltaY) < 20)) {
                result.push(thisNode);
            }
        }
    }

    return result;
}

/**
 * Something has been dropped onto a node.  Determine whether this is a file drop, a function drop or a normal drop
 * and call the corresponding function.
 *
 * @param {DragEvent} e                                     the drag event.
 * @param {SVGCircleElement|SVGImageElement} svgElem        the svg circle or image that represents the dragged node.
 */
export function drop(e, svgElem) {
    preventDefaultAndStopPropagation(e);

    setSessionIsDragging(false);
    finishRectangleSelect();

    let tgtObj = getProject().getNodeById(svgElem.getAttribute('id'));

    //TODO: Create a common function between this and the equivalent for canvas drop on dragdrop/canvas.js?
    if (isRawFileDrop(e)) {
        dropRawFiles(e, tgtObj);
    } else {
        let payload = extractPayload(e);

        if (tgtObj) {
            if (payload && payload.plainText && payload.plainText.startsWith(PREFIX_FUNC)) {
                dropFunction(e, tgtObj, payload);
            } else {
                dropNormal(e, tgtObj, payload);
            }
        }
    }
}

/**
 * The drop event is for a function.  Identify the function that has been dropped (from the payload) and get the
 * pre-registered callback function that should be executed on canvas drop events, or report a message if the canvas
 * drop event cannot be handled by this function.
 *
 * @param {DragEvent} e         the drag event that is triggered on the drop.
 * @param {csNode} tgtNode      the node onto which the payload was dropped.
 * @param {csPayload} payload   the payload object for this drop event.
 */
function dropFunction(e, tgtNode, payload) {
    let funcName = payload.plainText.replace(PREFIX_FUNC, '');
    let cbFunc = firstNodeExecuteCallbackFor(funcName);

    if (cbFunc) {
        debug(`Custom node execute detected for ${funcName}`);

        let context = {
            'event': e,
            'node': tgtNode
        };

        try {
            cbFunc(context);
        } catch(e) {
            error(`An error occurred while executing the ${funcName} function on node ${tgtNode.getUid()}`, e, context, true);
        }
    } else {
        showToast(`No node function action defined for ${funcName}`);
    }
}

/**
 * This is a normal drop event.  Put the payload onto the node unless it cannot handle it.
 *
 * @param {DragEvent} e         the drag event that is triggered on the drop.
 * @param {csNode} tgtNode      the node onto which the payload was dropped.
 * @param {csPayload} payload   the payload object for this drop event.
 */
function dropNormal(e, tgtNode, payload) {
    let bestChVal = 0;

    let chVal = doCanHandle(tgtNode.getType(), payload);

    if (chVal > bestChVal) {
        setOntoEmptyIcon(payload, tgtNode, e);
        bestChVal = chVal;
    }

    if (!bestChVal) {
        warn('That dropped item could not be handled by the specified icon', payload, true);
    }
}

/**
 * Store details about this drag.  The coordinates of the node being dragged and the offset coordinates to the current
 * mouse position.
 *
 * @param {DragEvent} e                                     the drag event.
 * @param {SVGCircleElement|SVGImageElement} svgElem        the svg circle or image that represents the dragged node.
 */
function storeDrag(e, svgElem) {
    let c = computeCoordsFor(e.sourceEvent);
    let nodeX = d3.select(svgElem).attr('cx') || d3.select(svgElem).attr('x');
    let nodeY = d3.select(svgElem).attr('cy') || d3.select(svgElem).attr('y');
    let deltaX = c.x - nodeX;
    let deltaY = c.y - nodeY;

    setCurrentDrag({
        'x': deltaX, 'y': deltaY, 'nodeX': parseFloat(nodeX), 'nodeY': parseFloat(nodeY)
    });
}

/**
 * A simple function to determine if the node has moved in this drag movement.
 *
 * @param {csNode} tgtNode      the node that might have moved.
 * @param {csDrag} startPos     the current drag object, which contains the start position.
 * @return {boolean}            whether the target node has moved.
 */
function hasMoved(tgtNode, startPos) {
    let xDiff = tgtNode.getPos().x - startPos.nodeX;
    let yDiff = tgtNode.getPos().y - startPos.nodeY;

    return (xDiff !== 0) || (yDiff !== 0);
}

/**
 * Move the node by moving all of the component elements.
 *
 * @param {csNode} tgtNode      the node that is to be moved.
 * @param {csCoordinates} c     the coordinates to which the node should be moved.
 * @param {number} [deltaX]     an optional X offset which is used when dragging multiple nodes.
 * @param {number} [deltaY]     an optional Y offset which is used when dragging multiple nodes.
 */
export function moveNode(tgtNode, c, deltaX, deltaY) {
    //TODO: Can I just move the group and use relative transforms instead?
    let tgtIcon = getSvgIconFrom(tgtNode, true);
    let tgtIconImage = getSvgIconImageFrom(tgtNode, true);
    let tgtDetail = getSvgDetailFrom(tgtNode, true);
    let tgtLabel = getSvgLabelFrom(tgtNode, true);
    let modC = { "x": c.x, "y": c.y };  //Create a copy of c as it gets reused if multiple nodes are selected
    let layout = getSessionCanvasLayout();

    if (deltaX) {
        modC.x = modC.x + deltaX;
    }

    if (deltaY) {
        modC.y = modC.y + deltaY;
    }

    //Update the coordinates
    tgtNode.setPos(modC);

    //Move the icon
    if (tgtIcon) {
        tgtIcon.setAttribute('cx', modC.x.toString());
        tgtIcon.setAttribute('cy', modC.y.toString());
    }

    //Move the label
    if (tgtLabel) {
        tgtLabel.setAttribute('x', (modC.x + 25).toString());
        tgtLabel.setAttribute('y', (modC.y - computeLabelOffset(tgtNode, layout.mini)).toString());
    }

    //Move the image
    if (tgtIconImage) {
        if (tgtNode.isEmpty()) {
            tgtIconImage.setAttribute('x', (modC.x - computeIconOffset(tgtNode, layout.empty)).toString());
            tgtIconImage.setAttribute('y', (modC.y - computeIconOffset(tgtNode, layout.empty)).toString());
        } else if (tgtNode.isFull()) {
            tgtIconImage.setAttribute('x', (modC.x - computeIconOffset(tgtNode, layout.mini)).toString());
            tgtIconImage.setAttribute('y', (modC.y - computeIconOffset(tgtNode, layout.mini)).toString());
        } else {
            error(`Unexpected node mode during drag for ${tgtNode.getUid()}`);
        }
    }

    //Move the detail
    if (tgtDetail) {
        tgtDetail.setAttribute('x', modC.x.toString());
        tgtDetail.setAttribute('y', modC.y.toString());
    }

    dragLinks(tgtNode, modC.x, modC.y);
}

/**
 * The specified node has been moved so propagate the move to each of the related links that are affected.
 *
 * @param {csNode} tgtNode      the node that has been moved.
 * @param {number} startX       the x position to move the links to.
 * @param {number} startY       the y position to move the links to.
 */
function dragLinks(tgtNode, startX, startY) {
    for (let thisLink of tgtNode.listAllLinks()) {
        let linkSvg = getSvgLinkLineFrom(thisLink, true);

        if (linkSvg) {
            linkSvg.setAttribute('d', computePathBetween(thisLink.getSourceNode(), thisLink.getBender(), thisLink.getTargetNode()))

            if (thisLink.getSourceNode() === tgtNode) {
                linkSvg.setAttribute('x1', startX.toString());
                linkSvg.setAttribute('y1', startY.toString());
            } else {
                linkSvg.setAttribute('x2', startX.toString());
                linkSvg.setAttribute('y2', startY.toString());
            }

            let linkLabel = getSvgLinkLabelFrom(thisLink, true);
            let labelAnchor = getSvgLinkLabelAnchorFrom(thisLink, true);
            let linkOuterSvg = getSvgLinkLineFrom(thisLink, false);
            let anchorPos = computeAnchorpointFor(thisLink, linkOuterSvg);

            if (linkLabel) {
                linkLabel.setAttribute('x', anchorPos.x.toString());
                linkLabel.setAttribute('y', anchorPos.y.toString());
            }

            if (labelAnchor) {
                labelAnchor.setAttribute('cx', anchorPos.x.toString());
                labelAnchor.setAttribute('cy', anchorPos.y.toString());
            }
        }
    }
}

/**
 * The payload has been dropped onto an empty icon, so attempt to set that payload onto the node, moving it from
 * empty to full.
 *
 * @param {csPayload} payload       the payload that has been dropped onto this node.
 * @param {csNode} tgtNode          the node onto which the payload was dropped.
 * @param {DragEvent} [e]           the drag event (if triggered by a drag/drop action).
 * @param {boolean} [force=false]   whether to force the templates onto the node.
 *                                  (otherwise it is rejected if the node is already full).
 */
export function setOntoEmptyIcon(payload, tgtNode, e, force) {
    let proceed = true;

    if (tgtNode.isFull()) {
        if (!force) {
            if ((tgtNode.getTypeName() === 'text') && (!tgtNode.hasPropertyNamed('text'))) {
                //Special case for text nodes - if no text property then allow the drop.
                //TODO: Abstract this and make it more generic
            } else {
                showToast(`This ${tgtNode.getTypeName()} is already populated`);
                proceed = false;
            }
        }
    }

    if (proceed) {
        doSwitchToPopulatedNode(tgtNode, payload);
    }

    preventDefaultAndStopPropagation(e);
}
