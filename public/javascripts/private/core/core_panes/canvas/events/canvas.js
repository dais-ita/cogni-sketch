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
 * @file Functions for all canvas events.
 *
 * @author Dave Braines
 **/

import {
    getIsPanning,
    setIsPanning
} from "/javascripts/private/csData/csDataCanvas.js";
import {notYetImplemented} from "/javascripts/private/util/log.js";
import {
    getSessionRectangleSelectIsActive,
    setSessionIsDragging
} from "/javascripts/private/csData/csDataSession.js";
import {getCanvasElement} from "/javascripts/private/core/core_panes/canvas/canvas.js";
import {drop} from "/javascripts/private/core/core_panes/canvas/dragdrop/canvas.js";
import {
    deselectAll,
    doRectangleSelect,
    finishRectangleSelect
} from "/javascripts/private/core/core_panes/canvas/select.js";
import {
    computeCoordsFor,
    recenter} from "/javascripts/private/util/coords.js";
import {updateMousePos} from "/javascripts/private/core/core_panes/canvas/mouse.js";
import {
    panDown,
    panLeft,
    panRight,
    panUp,
    zoomIn,
    zoomOut
} from "/javascripts/private/core/core_panes/canvas/panzoom.js";
import {preventDefaultAndStopPropagation} from "/javascripts/private/ui/window/events.js";

/**
 * Initialise the canvas.
 */
export function initialise() {
    registerEventHandlers();
}

/**
 * Register all of the event handlers for the canvas.
 */
function registerEventHandlers() {
    let eCanvas = getCanvasElement();

    eCanvas.on('focus', function(e) {
        // When the canvas gets focus call mouseMove with the focus event
        // This does not have coordinates so will cause an error when trying to create a node
        // until the next mousemove event is fired.  This is a better solution than having the
        // node appear at whatever random position the mouse was at before the window lost focus.
        canvasMousemove(e);
    });

    eCanvas.on('mousemove', function(e) {
        canvasMousemove(e);
    });

    eCanvas.on('dragover', function(e) {
        canvasDragover(e);
    });

    eCanvas.on('drop', function(e) {
        drop(e);
    });

    eCanvas.on('dblclick', function(e) {
        canvasDblclick(e);
    });

    eCanvas.on('mousedown', function() {
        setIsPanning(true);
    });

    eCanvas.on('mouseup', function() {
        setIsPanning(false);
    });

    eCanvas.on('mouseleave', function() {
        finishRectangleSelect();
    });

    eCanvas.on('wheel', function (e) {
        canvasWheel(e);
    });

    eCanvas.on('click', function(e) {
        canvasClick(e);
    });

    eCanvas.on('touchstart', function(e) {
        canvasTouchstart(e);
    });

    eCanvas.on('touchend', function(e) {
        canvasTouchend(e);
    });

    eCanvas.on('touchmove', function(e) {
        canvasTouchmove(e);
    });

    eCanvas.on('touchcancel', function(e) {
        canvasTouchcancel(e);
    });
}

/**
 * The mouse is moved while over the canvas so record the position of the mouse.
 * If shift is held then pan the canvas.
 * If the left button is down the draw the selection rectangle.
 *
 * @param {MouseEvent} e        the mouse event.
 */
function canvasMousemove(e) {
    updateMousePos(e);

    if (e.shiftKey) {
        if (e.buttons === 1) {
            doRectangleSelect(e);
        }
    } else {
        if (getIsPanning()) {
            if (e.movementX > 0) {
                panRight();
            }  else if (e.movementX < 0) {
                panLeft();
            }
            if (e.movementY > 0) {
                panDown();
            } else if (e.movementY < 0) {
                panUp();
            }
        }
    }
}

/**
 * The canvas has been single clicked.
 * If shift is held then deselect all nodes and links, otherwise finish the rectangle select.
 *
 * @param {MouseEvent} e        the mouse event.
 */
function canvasClick(e) {
    if (getSessionRectangleSelectIsActive()) {
        finishRectangleSelect(e);
    } else {
        deselectAll();
    }
}

/**
 * The canvas wheel event is either a real wheel, or a pinch zoom event so zoom in or out accordingly.
 *
 * @param {WheelEvent} e        the wheel event.
 */
function canvasWheel(e) {
    preventDefaultAndStopPropagation(e);

    if (e.deltaY < 0 ) {
        zoomIn()
    } else if (e.deltaY > 0 ) {
        zoomOut()
    }
}

/**
 * Triggered only when dragging an icon from the palette.  Once the icon has been dropped and instantiated as a node on the graph
 * the dragged event in dragdrop.js is triggered instead.
 *
 * @param {Event} e         The UI dragover event
 */
function canvasDragover(e) {
    preventDefaultAndStopPropagation(e);

    updateMousePos(e);
    setSessionIsDragging(true);
}

/**
 * The canvas has been double clicked so recenter to that position.
 *
 * @param {MouseEvent} e        the mouse event.
 */
function canvasDblclick(e) {
    let c = computeCoordsFor(e);
    recenter(c);
}

/**
 * Canvas Touchstart - not yet implemented.
 *
 * @param {WheelEvent} e        the wheel event
 */
function canvasTouchstart(e) {
    notYetImplemented('events', 'canvasTouchstart');
    //TODO: Implement this
}

/**
 * Canvas Touchend - not yet implemented.
 *
 * @param {WheelEvent} e        the wheel event
 */
function canvasTouchend(e) {
    notYetImplemented('events', 'canvasTouchend');
    //TODO: Implement this
}

/**
 * Canvas Touchcancel - not yet implemented.
 *
 * @param {WheelEvent} e        the wheel event
 */
function canvasTouchcancel(e) {
    notYetImplemented('events', 'canvasTouchcancel');
    //TODO: Implement this
}

/**
 * Canvas Touchmove - not yet implemented.
 *
 * @param {WheelEvent} e        the wheel event
 */
function canvasTouchmove(e) {
    notYetImplemented('events', 'canvasTouchmove');
    //TODO: Implement this
}
