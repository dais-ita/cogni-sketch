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
 * @file Functions for all link events.
 *
 * @author Dave Braines
 **/

import {getLinkUsingSvg} from "/javascripts/private/csData/csDataLink.js";
import {openPopup} from "/javascripts/private/core/core_popups/linkDetails/linkPopup.js";
import {anchorDragged, anchorDragEnded} from "/javascripts/private/core/core_panes/canvas/dragdrop/link.js";
import {selectOrDeselectLink} from "/javascripts/private/core/core_panes/canvas/select.js";
import {preventDefaultAndStopPropagation} from "/javascripts/private/ui/window/events.js";
import {executeFunctionAfterDelay} from "/javascripts/private/util/timing.js";
import {getSessionCanvasDoubleClickDelay} from "/javascripts/private/csData/csDataSession.js";

const CLICK_DELAY = getSessionCanvasDoubleClickDelay();

/**
 *  preventSingle is used to differentiate between single and double clicks.
 *  the doubleClick event sets to 2, and each click event that is ignored
 *  decrements by 1.
 *  CLICK_DELAY specifies the number of milliseconds the click events are delayed by
 */
let preventSingle = 0;

/**
 * The link anchor is being dragged.
 *
 * @param {DragEvent} e                     the drag event.
 * @param {SVGCircleElement} svgElem        the svg circle element being dragged.
 */
export function linkAnchorDragged(e, svgElem) {
    anchorDragged(e, svgElem);
}

/**
 * The link anchor has stopped being dragged.
 *
 * @param {DragEvent} e                     the drag event.
 * @param {SVGCircleElement} svgElem        the svg circle element being dragged.
 */
export function linkAnchorDragEnded(e, svgElem) {
    anchorDragEnded(e, svgElem);
}

/**
 * The (delayed) click event for a node.  This is slightly delayed to allow differentiation between single click
 * and double click events and to therefore prevent a double click action (to open a popup window) also having the
 * visual effect of two single click events (selecting and deselecting the node).
 *
 * @param {PointerEvent} e                                  the pointer event.
 * @param {SVGCircleElement|SVGImageElement} svgElem        the svg element.
 */
export function delayedLinkClick(e, svgElem) {
    preventDefaultAndStopPropagation(e);

    /* create and execute the delayed event */
    executeFunctionAfterDelay(function() {
        if (preventSingle === 0) {
            linkClick(e, svgElem);
        } else {
            --preventSingle;
        }
    }, CLICK_DELAY);
}

/**
 * The link anchor has been clicked.
 *
 * @param {PointerEvent} e                  the pointer event.
 * @param {SVGCircleElement} svgElem        the svg circle element being clicked.
 */
export function linkClick(e, svgElem) {
    let tgtLink = getLinkUsingSvg(svgElem);

    selectOrDeselectLink(tgtLink);
    preventDefaultAndStopPropagation(e);
}

/**
 * The link anchor has been double clicked.
 *
 * @param {DragEvent} e                     the drag event.
 * @param {SVGCircleElement} svgElem        the svg circle element being double clicked.
 */
export function linkDblClick(e, svgElem) {
    let thisLink = getLinkUsingSvg(svgElem);

    if (thisLink) {
        openPopup(thisLink);
    }

    preventDefaultAndStopPropagation(e);
}
