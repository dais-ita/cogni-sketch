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
 * @file Handle drop events that occur on the canvas, rather than on specific nodes.
 *
 * @author Dave Braines
 **/

import {
    getPalette,
    getProject
} from "/javascripts/private/state.js";
import {firstCanvasExecuteCallbackFor} from "/javascripts/private/util/callback/cbFunction.js";
import {matchContentType} from "/javascripts/private/core/core_panes/canvas/canvas.js";
import {
    deselectAll,
    finishRectangleSelect
} from "/javascripts/private/core/core_panes/canvas/select.js";
import {PREFIX_FUNC} from "/javascripts/private/core/core_panes/canvas/dragdrop/dragdrop.js";
import {
    dropCsFile,
    dropRawFiles,
    isCsFileDrop,
    isRawFileDrop
} from "/javascripts/private/core/core_panes/canvas/dragdrop/files.js";
import {setSessionIsDragging} from "/javascripts/private/csData/csDataSession.js";
import {createNewEmptyNode} from "/javascripts/private/core/create.js";
import {getPosFromMousePos} from "/javascripts/private/util/coords.js";
import {
    showToast,
    error,
    warn,
    debug
} from "/javascripts/private/util/log.js";
import {preventDefaultAndStopPropagation} from "/javascripts/private/ui/window/events.js";
import {saveActionMisc} from "/javascripts/private/csData/change/csDataChanges.js";

let HANDLED_TYPES = [
    'text',
    'text/plain',
    'text/html',
    'text/uri-list',
    'application/pdf',
    'application/zip',
    'image/png'
];  //TODO: Abstract this
let PLAIN_TYPES = [ 'text', 'text/plain' ];
let RICH_TYPES = [ 'text/html' ];

/**
 * Triggered when a drop event occurs.  Matches the type of drop that has happen and calls the relevant function.
 * Specifically here this is a drop event onto the canvas rather than a specific node.
 *
 * @param {DragEvent} e     the drag event that is triggered on the drop.
 */
export function drop(e) {
    let proj = getProject();

    if (proj) {
        if (proj.isReadOnly()) {
            error('Cannot drop - project is read only', null, null, true);
        } else {
            let payload = extractPayload(e);

            /* Finish and selection rectangle and deselect all nodes and links */
            setSessionIsDragging(false);
            finishRectangleSelect();
            deselectAll();

            if (isRawFileDrop(e)) {
                /* a real file drop from outside the cs application, e.g. a file browser */
                dropRawFiles(e);
            } else if (isCsFileDrop(e, payload.plainText)) {
                /* an internal file drop, from the palette file list */
                dropCsFile(e, payload.plainText);
            } else {
                if (payload && payload.plainText && payload.plainText.startsWith(PREFIX_FUNC)) {
                    /* an internal function drop, from the palette function list */
                    dropFunction(e, payload);
                } else {
                    dropNormal(e, payload);
                }
            }

            preventDefaultAndStopPropagation(e);
        }
    } else {
        showToast('Please create or select a project before proceeding');
    }
}

/**
 * The drop event is for a function.  Identify the function that has been dropped (from the payload) and get the
 * pre-registered callback function that should be executed on canvas drop events, or report a message if the canvas
 * drop event cannot be handled by this function.
 *
 * @param {DragEvent} e         the drag event that is triggered on the drop.
 * @param {csPayload} payload   the payload object for this drop event.
 */
function dropFunction(e, payload) {
    let funcName = payload.plainText.replace(PREFIX_FUNC, '');
    let cbFunc = firstCanvasExecuteCallbackFor(funcName);

    if (cbFunc) {
        debug(`Custom canvas execute detected for ${funcName}`);

        let context = {
            'event': e,
            'payload': payload
        };

        try {
            cbFunc(context);
        } catch(e) {
            error(`An error occurred while executing the ${funcName} function`, e, context, true);
        }
    } else {
        showToast(`The ${funcName} function cannot be dropped onto the canvas`);
    }
}

/**
 * This is a normal drop event.  Determine whether the payload matches exactly to a palette item type, indicating
 * that the type was dropped from the palette.  Otherwise send the payload to match the best templates type to handle it.
 *
 * @param {DragEvent} e         the drag event that is triggered on the drop.
 * @param {csPayload} payload   the payload object for this drop event.
 */
function dropNormal(e, payload) {
    let nodeType = getPalette().getItemById(payload.plainText);
    let pos = getPosFromMousePos();

    if (nodeType) {
        saveActionMisc('drop:palette', null, { "type": nodeType.getId() });
        createNewEmptyNode(nodeType, null, pos);
    } else {
        matchContentType(pos, payload);
    }
}

/**
 * Extract any text from the drop event, starting with rich text and falling back to plain text.
 *
 * @param {DragEvent} e     the drag event that is triggered on the drop.
 * @returns {csPayload}     the plain and possibly rich text extracted from the drop event.
 */
export function extractPayload(e) {
    let multiPayload = {};
    let result = {
        'plainText': '',
        'richText': ''
    };

    for (let item of e.dataTransfer.items) {
        if (item.type.indexOf('application/vnd') === -1) {
            if (HANDLED_TYPES.indexOf(item.type) === -1) {
                warn(`Unhandled drop type: ${item.type}`);
            }
        }
    }

    for (let type of HANDLED_TYPES) {
        let content = e.dataTransfer.getData(type);

        if (content) {
            multiPayload[type] = content;
        }
    }

    for (let typeName of PLAIN_TYPES) {
        let content = multiPayload[typeName];

        if (!result.plainText && content) {
            result.plainText = content;
        }
    }

    for (let typeName of RICH_TYPES) {
        let content = multiPayload[typeName];

        if (!result.richText && content) {
            result.richText = content;
        }
    }

    return result;
}
