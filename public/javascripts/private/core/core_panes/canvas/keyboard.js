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
 * @file Functions that handle all keyboard events for the canvas pane.
 * @author Dave Braines
 *
 * These key combinations are supported:
 *      Backspace or Delete         - Delete any selected nodes or links
 *      Shift                       - Used in conjunction with selection to select/deselect nodes and drawing of links
 *                                    between nodes
 *      Left/Right/Up/Down arrow    - Pan left/right/up/down
 *      Ctrl + '-'                  - Zoom in
 *      Ctrl + '='                  - Zoom out
 *      Ctrl + 'e'                  - Zoom to the extent, i.e. ensure all nodes are visible
 *      Ctrl + 'z'                  - Zoom to ensure all selected nodes are visible
 *      Ctrl + 'o'                  - Zoom to the original, i.e. set zoom to 1 and location to 0,0
 *      Ctrl + 'a'                  - Select all nodes and links on the canvas
 *      Ctrl + 's'                  - Save the project
 *      Ctrl + 'd'                  - Duplicate selected nodes and links
 *      Ctrl + 'r'                  - Reload the page
 *      Ctrl + 'f'                  - Set focus to the search field
 *      Ctrl + 'h'                  - Hide all leaf nodes linked to any selected node
 *      Ctrl + 'l'                  - Select all nodes linked to the selected nodes
 *
 * Standard behaviour for other keys (copy/paste etc) is not affected.
 */

import {debug} from "/javascripts/private/util/log.js";
import {deleteSelectedNodesAndLinks} from "/javascripts/private/csData/csDataCanvas.js";
import {save} from "/javascripts/private/ui/project/project.js";
import {setFocus} from "/javascripts/private/ui/search.js";
import {
    collapseOrExpand,
    hideLinkedNodes,
    selectAll,
    selectLinkedNodes
} from "/javascripts/private/core/core_panes/canvas/select.js";
import {doDuplicate} from "/javascripts/private/core/core_panes/canvas/duplicate.js";
import {
    panOrNudgeFromDownKey,
    panOrNudgeFromLeftKey,
    panOrNudgeFromRightKey,
    panOrNudgeFromUpKey,
    zoomIn,
    zoomOut,
    zoomToFillAll,
    zoomToFillSelected
} from "/javascripts/private/core/core_panes/canvas/panzoom.js";
import {resetViewBox} from "/javascripts/private/util/coords.js";
import {getSessionRectangleSelect} from "/javascripts/private/csData/csDataSession.js";
import {maybeCreateLink} from "/javascripts/private/core/model.js";
import {isPopupOpen} from "/javascripts/private/core/core_popups/generalPopup.js";
import {getTargetNode} from "./dragdrop/link.js";
import {saveActionMisc} from "/javascripts/private/csData/change/csDataChanges.js";

export function canvasKeyup(ev) {
    if (!isPopupOpen()) {
        if (ev.key === 'Backspace' || ev.key === 'Delete' ) {
            deleteSelectedNodesAndLinks();
        } else if (ev.key === 'Shift') {
            let rectangleSelect = getSessionRectangleSelect();

            if (!rectangleSelect) {
                let tgtNode = getTargetNode();

                maybeCreateLink(tgtNode);
            }
        } else if (ev.key === 'Meta') {
            //Can be ignored - Meta is the Cmd key on Mac-OS
        } else if (ev.key === 'Alt') {
            //Can be ignored
        } else if (ev.key === 'Control') {
            //Can be ignored - checked against other keys using ev.ctrlKey for combinations
        } else if (ev.key === 'ArrowLeft') {
            panOrNudgeFromLeftKey(true);
        } else if (ev.key === 'ArrowRight') {
            panOrNudgeFromRightKey(true);
        } else if (ev.key === 'ArrowUp') {
            panOrNudgeFromDownKey(true);
        } else if (ev.key === 'ArrowDown') {
            panOrNudgeFromUpKey(true);
        } else if (ev.key === '-') {
            if (ev.ctrlKey) {
                zoomOut(true);
            }
        } else if (ev.key === '=') {
            if (ev.ctrlKey) {
                zoomIn(true);
            }
        } else if (ev.key.toLowerCase() === 'a') {
            if (ev.ctrlKey) {
                selectAll();
            }
        } else if (ev.key.toLowerCase() === 's') {
            if (ev.ctrlKey) {
                actionSave();
            }
        } else if (ev.key.toLowerCase() === 'd') {
            if (ev.ctrlKey) {
                doDuplicate();
            }
        } else if (ev.key.toLowerCase() === 'e') {
            if (ev.ctrlKey) {
                zoomToFillAll();
            }
        } else if (ev.key.toLowerCase() === 'z') {
            if (ev.ctrlKey) {
                zoomToFillSelected();
            }
        } else if (ev.key.toLowerCase() === 'o') {
            if (ev.ctrlKey) {
                resetViewBox();
            }
        } else if (ev.key.toLowerCase() === 'r') {
            if (ev.ctrlKey) {
                saveActionMisc('canvas:reload');
                location.reload();
            }
        } else if (ev.key.toLowerCase() === 'f') {
            if (ev.ctrlKey) {
                setFocus();
            }
        } else if (ev.key.toLowerCase() === 'h') {
            if (ev.ctrlKey) {
                hideLinkedNodes();
            }
        } else if (ev.key.toLowerCase() === 'l') {
            if (ev.ctrlKey) {
                selectLinkedNodes();
            }
        } else if (ev.key === ' ') {
            collapseOrExpand();
        } else {
            debug('Unhandled canvas keyboard event', ev.key);
        }
    }
}

function actionSave() {
    saveActionMisc('project:save');

    save();
}