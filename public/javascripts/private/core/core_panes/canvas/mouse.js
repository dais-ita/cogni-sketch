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
 * @file Functions relating to the mouse position on the canvas.
 * @author Dave Braines
 **/

import {
    getLeft,
    getTop,
    setMouseX,
    setMouseY
} from "/javascripts/private/csData/csDataCanvas.js";
import {getNodeUsingSvg} from "/javascripts/private/csData/csDataNode.js";
import {
    getCurrentLink,
    setTargetNode,
    clearTargetNode
} from "/javascripts/private/core/core_panes/canvas/dragdrop/link.js";

/**
 * The mouse is over the specified svg element so set that as the target node if a link is being drawn.
 *
 * @param {SVGElement} svgElem      the svg element.
 */
export function mouseover(svgElem) {
    let currLink = getCurrentLink();

    if (currLink) {
        setTargetNode(getNodeUsingSvg(svgElem));
    }
}

/**
 * The mouse has moved out of the specified svg element so clear that as the target node is a link is being drawn.
 */
export function mouseout() {
    let currLink = getCurrentLink();

    if (currLink) {
        clearTargetNode();
    }
}

/**
 * Record the mouse position in the session storage.
 *
 * @param {Event|MouseEvent} e            the event that will be used to capture the mouse position.
 */
export function updateMousePos(e) {
    let l = getLeft();
    let t = getTop();
    let x = Math.round(e.x - l);
    let y = Math.round(e.y - t);

    setMouseX(x);
    setMouseY(y);
}
