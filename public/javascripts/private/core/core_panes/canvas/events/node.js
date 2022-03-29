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
 * @file Functions for all node events.
 *
 * @author Dave Braines
 **/

import {getProject} from "/javascripts/private/state.js";
import {warn} from "/javascripts/private/util/log.js";
import {openPopup} from "/javascripts/private/core/core_popups/nodeDetails/nodeDetailsPopup.js";
import {
    selectNode,
    deselectNode,
    deselectAll
} from "/javascripts/private/core/core_panes/canvas/select.js";
import {
    flipNode,
    getNodeUsingSvg
} from "/javascripts/private/csData/csDataNode.js";
import {
    dragStarted,
    dragged,
    dragEnded,
    drop
} from "/javascripts/private/core/core_panes/canvas/dragdrop/node.js";
import {
    mouseover,
    mouseout
} from "/javascripts/private/core/core_panes/canvas/mouse.js";
import {executeFunctionAfterDelay} from "/javascripts/private/util/timing.js";
import {getSessionCanvasDoubleClickDelay} from "/javascripts/private/csData/csDataSession.js";
import {preventDefaultAndStopPropagation} from "/javascripts/private/ui/window/events.js";
import {saveActionMisc} from "/javascripts/private/csData/change/csDataChanges.js";

const CLICK_DELAY = getSessionCanvasDoubleClickDelay();

/**
 *  preventSingle is used to differentiate between single and double clicks.
 *  the doubleClick event sets to 2, and each click event that is ignored
 *  decrements by 1.
 *  CLICK_DELAY specifies the number of milliseconds the click events are delayed by
 */
let preventSingle = 0;

/**
 * The mouse over event for a node.
 *
 * @param {MouseEvent} e            the mouse event.
 * @param {SVGElement} svgElem      the svg element.
 */
export function nodeMouseover(e, svgElem) {
    mouseover(svgElem);
}

/**
 * The mouse out event for a node.
 *
 * @param {MouseEvent} e            the mouse event.
 * @param {SVGElement} svgElem      the svg element.
 */
export function nodeMouseout(e, svgElem) {
    mouseout();
}

/**
 * The drag started event for a node.
 *
 * @param {DragEvent} e                                     the drag event.
 * @param {SVGCircleElement|SVGImageElement} svgElem        the svg element.
 */
export function nodeDragStarted(e, svgElem) {
    dragStarted(e, svgElem);
}

/**
 * The dragged event for a node.
 *
 * @param {DragEvent} e                                     the drag event.
 * @param {SVGCircleElement|SVGImageElement} svgElem        the svg element.
 */
export function nodeDragged(e, svgElem) {
    dragged(e, svgElem);
}

/**
 * The drag ended event for a node.
 *
 * @param {DragEvent} e                                     the drag event.
 * @param {SVGCircleElement|SVGImageElement} svgElem        the svg element.
 */
export function nodeDragEnded(e, svgElem) {
    dragEnded(e, svgElem);
}

/**
 * The drop event for a node.
 *
 * @param {DragEvent} e                                     the drag event.
 * @param {SVGCircleElement|SVGImageElement} svgElem        the svg element.
 */
export function nodeDrop(e, svgElem) {
    drop(e, svgElem);
}

/**
 * The (delayed) click event for a node.  This is slightly delayed to allow differentiation between single click
 * and double click events and to therefore prevent a double click action (to open a popup window) also having the
 * visual effect of two single click events (selecting and deselecting the node).
 *
 * @param {PointerEvent} e                                  the pointer event.
 * @param {SVGCircleElement|SVGImageElement} svgElem        the svg element.
 */
export function delayedNodeClick(e, svgElem) {
    preventDefaultAndStopPropagation(e);

    /* create and execute the delayed event */
    executeFunctionAfterDelay(function() {
            if (preventSingle === 0) {
                nodeClick(e, svgElem);
            } else {
                --preventSingle;
            }
        }, CLICK_DELAY);
}

/**
 * The node click event.  Select, deselect or flip the node, depending on the context.
 *
 * @param {PointerEvent} e                                  the pointer event.
 * @param {SVGCircleElement|SVGImageElement} svgElem        the svg element.
 */
function nodeClick(e, svgElem) {
    let tgtId = d3.select(svgElem).attr('id');
    let tgtNode = getProject().getNodeById(tgtId);

    if (tgtNode) {
        if (tgtNode.isSpecial()) {
            flipNode(tgtNode);
        } else {
            let wasSelected = tgtNode.isSelected();

            if (!e.shiftKey) {
                //Shift not held, so deselect everything
                deselectAll();
            }

            if (wasSelected) {
                saveActionMisc('canvas:deselectNode', tgtNode);
                deselectNode(tgtNode);
            } else {
                saveActionMisc('canvas:selectNode', tgtNode);
                selectNode(tgtNode);
            }
        }
    } else {
        warn(`Target node ${tgtId} was not set`);
    }
}

/**
 * The double click event for a node - open the node details popup window.
 *
 * Also set the number of click events to ignore (2) and because they run on a short delay this means that the
 * double click will be processed but the two single clicks will be prevented.
 *
 * @param {PointerEvent} e                                  the pointer event.
 * @param {SVGCircleElement|SVGImageElement} svgElem        the svg element.
 */
export function nodeDblClick(e, svgElem) {
    preventSingle = 2;

    let tgtNode = getNodeUsingSvg(svgElem);

    if (tgtNode) {
        openPopup(tgtNode);
    }

    preventDefaultAndStopPropagation(e);
}
