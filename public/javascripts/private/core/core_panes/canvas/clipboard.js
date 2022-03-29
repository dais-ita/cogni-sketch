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
 * @file Functions relating to clipboard actions (cut, copy, paste) on the canvas.
 * @author Dave Braines
 **/

import {
    getPalette,
    getProject
} from "/javascripts/private/state.js";
import {takeContent} from "/javascripts/private/csData/csDataNode.js";
import {
    getCenterPoint,
    getPosFromMousePos
} from "/javascripts/private/util/coords.js";
import {
    createOnCanvas,
    getSelectedItems
} from "/javascripts/private/csData/csDataCanvas.js";
import {
    error,
    warn
} from "/javascripts/private/util/log.js";
import {convertArrayBufferToBase64, URL_SAVE_IMAGE} from "/javascripts/private/util/misc.js";
import {httpPostJson} from "/javascripts/private/util/http.js";
import {createNewFullNode} from "/javascripts/private/csData/csDataCanvas.js";
import {saveActionMisc} from "/javascripts/private/csData/change/csDataChanges.js";

export function canvasCut() {
    error('canvasCut not yet implemented', null, null, true);
}

export function canvasCopy() {
    error('canvasCopy not yet implemented', null, null, true);
}

/**
 * The callback to be used when text is pasted onto the canvas.
 *
 * @param {csPayload} payloadObj    the payload object containing the pasted text.
 */
export function canvasPasteText(payloadObj) {
    if (getProject().isReadOnly()) {
        error('Cannot paste - project is read only', null, null, true);
    } else {
        let canvasPos = getPosFromMousePos();
        let selections = getSelectedItems();

        if (canvasPos.x && canvasPos.y) {
            if (selections.nodes.length === 0) {
                saveActionMisc('canvas:pasteText(canvas)');
                createOnCanvas(canvasPos, payloadObj);
            } else {
                if (selections.nodes.length === 1) {
                    saveActionMisc('canvas:pasteText(node)');
                    doPasteOnto(selections.nodes[0], payloadObj);
                } else {
                    saveActionMisc('canvas:pasteText(failed)', null, { "error": 'Too many selected nodes' });
                    warn('Cannot paste onto multiple selected nodes', null, true);
                }
            }
        } else {
            saveActionMisc('canvas:pasteText(failed)', null, { "error": 'No mouse position' });
            error('Cannot paste as mouse position is unknown.  Please move the mouse and try again', null, null, true);
        }
    }
}

/**
 * Paste the text data onto the selected node, assuming that the node can handle text data.
 *
 * @param {csNode} tgtNode          the node onto which the text data will be pasted.
 * @param {csPayload} payload       the pasted text payload.
 */
function doPasteOnto(tgtNode, payload) {
    takeContent(tgtNode, payload);
}

/**
 * The callback to be used when image data is pasted onto the canvas.
 *
 * @param {FileReader} rdr      the binary image data as a file reader.
 * @param {string} imgFilename  the name of the image file.
 * @param {string} imgUrl       the relative url for the image file.
 * @param {csCoordinates} [pos] the position of pointer.
 * @param {string} [label]      the optional label to be used for the new node.
 * @param {number} [width]      the optional width to be used for the new node.
 * @param {csType} [palItem]    the optional palette item to be used for the new node (default is 'image' type).
 * @param {object} [objDetails] the optional existing properties to be added to the new node.
 */
export function canvasPasteImage(rdr, imgFilename, imgUrl, pos, label, width, palItem, objDetails) {
    let canvasPos = pos || getPosFromMousePos() || getCenterPoint();

    saveActionMisc('canvas:pasteImage');

    if (canvasPos.x && canvasPos.y) {
        //TODO: Fix the case where image data is pasted on to an empty selected image node

        /* rdr.result contains the contents of blob as a typed array */
        let params = {
            "nodePos": canvasPos,
            "imageUrl": imgUrl,
            "label": label,
            "palItem": palItem,
            "existingProps": objDetails
        };
        let payload = {
            "data": convertArrayBufferToBase64(rdr.result),
            "imageName": imgFilename,
            "project": getProject().getName()
        };

        if (width) {
            if (!params.existingProps) {
                params.existingProps = {};
            }

            params.existingProps.width = { "type": 'normal', "value": `${width}px` };
        }

        httpPostJson(URL_SAVE_IMAGE, callbackSaveImage, payload, params);
    } else {
        error('Cannot paste as mouse position is unknown.  Please move the mouse and try again', null, null, true);
    }
}

/**
 * Called when the image data has been successfully saved to the server.  Create an image node on the canvas with the
 * url of the new image.
 *
 * @param {null} response               the response from the server is ignored
 * @param {SaveImageParams} params      the parameters to be used to create the new node on the canvas
 */
function callbackSaveImage(response, params) {
    let palItem;

    if (params.palItem) {
        palItem = params.palItem;
    } else {
        palItem = getPalette().getItemById('image');
    }

    createNewFullNode(palItem, (params.label || ''), params.nodePos, { "plainText": params.imageUrl }, params.existingProps);
}
