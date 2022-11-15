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
 * @file Functions for processing dropped or pasted files from the operating system or the palette file list.
 *
 * @author Dave Braines
 **/

import {
    getPalette,
    getProject
} from "/javascripts/private/state.js";
import {listFiles} from "/javascripts/private/ui/palette/files.js";
import {findBestPaletteItemAndStatus} from "/javascripts/private/core/core_panes/canvas/canvas.js";
import {createNewFullNode} from "/javascripts/private/core/create.js";
import {doSwitchToPopulatedNode} from "/javascripts/private/core/hooks.js";
import {handle} from "/javascripts/private/core/core_panes/canvas/dragdrop/dragdrop.js";
import {httpPostJson} from "/javascripts/private/util/http.js";
import {getOffsetMousePos} from "/javascripts/private/util/coords.js";
import {
    convertArrayBufferToBase64,
    URL_SAVE_FILE, URL_SAVE_IMAGE
} from "/javascripts/private/util/misc.js";
import {saveActionMisc} from "/javascripts/private/csData/change/csDataChanges.js";

const PREFIX_FILE = 'file:';

/**
 * Returns true if this is a 'raw' file drop, i.e. a file from the users file system.
 *
 * @param {DragEvent} e     the drag event that is triggered on the drop.
 * @return {boolean}        whether this is a raw file drop event.
 */
export function isRawFileDrop(e) {
    return e.dataTransfer.files.length > 0;
}

/**
 * Returns true if this is an 'application' file drop, i.e. a file from the palette file list.  These cases have
 * a plain text payload with a prefix that indicates it is a file.
 *
 * @param {DragEvent} e                 the drag event that is triggered on the drop.
 * @param {string} plainTextPayload     the drag event that is triggered on the drop.
 * @return {boolean}                    whether this is an application file drop event.
 */
export function isCsFileDrop(e, plainTextPayload) {
    return (plainTextPayload && plainTextPayload.startsWith(PREFIX_FILE));
}

/**
 * Handle the drop of raw files from the users operating system onto a node.  If this was a drop event onto the canvas
 * then no node will be specified.  If it was a drop event onto a node then that node will be specified.
 *
 * For each of the files in the event, identify whether it is an image and then request upload of the image (or file)
 * in each case.
 *
 * @param {DragEvent} e         the drag event that is triggered on the drop.
 * @param {csNode} [tgtNode]    the node that the file(s) were dropped onto.
 */
export function dropRawFiles(e, tgtNode) {
    let thisNode = tgtNode;     /* set to new variable so it can be cleared after the first iteration if multiple files */

    for (let file of e.dataTransfer.files) {
        if (isImageFile(file, thisNode)) {
            saveActionMisc('drop:imageFile', null, { "fileName": file.name });
            uploadImageFile(file, thisNode);
        } else {
            saveActionMisc('drop:file', null, { "fileName": file.name });
            uploadNormalFile(file, thisNode);
        }

        thisNode = undefined;
    }
}

/**
 * Handle the drop of application files from the palette file list.
 *
 * @param {DragEvent} e         the drag event that is triggered on the drop.
 * @param {string} filename     the filename of the dropped file.
 */
export function dropCsFile(e, filename) {
    let nodeType = getPalette().getItemById('file');

    //TODO: Handle a normal file dropped onto a node

    saveActionMisc('drop:csFile', null, { "fileName": filename });
    createNewFullNode(nodeType, '', e,  { "plainText": filename });
}

/**
 * Indicates whether the specified filename corresponds to an image file as defined by this application.  Specifically
 * this is determined by whether the 'image' palette item would match to the filename.  This means that if image file
 * types are not supported by this application then they will not be processed as images, and by this function using
 * this technique it means that as new image file types are supported the behaviour will be synchronized.
 *
 * @param {File} file           the file object to be checked.
 * @param {csNode} [tgtNode]    the node to be used.  If this is already set then it can be checked directly.
 * @return {boolean}            whether the file is deemed an image file by this application.
 */
function isImageFile(file, tgtNode) {
    let typeId;

    if (tgtNode) {
        typeId = tgtNode.getTypeName();
    } else {
        let match = findBestPaletteItemAndStatus({ "plainText": file.name });
        let status = match.status;
        let typeItem;

        if (status === handle.DEFINITELY) {
            typeItem = match.nodeType;
        } else {
            typeItem = getPalette().getItemById('file');
        }

        typeId = typeItem.id;
    }

    return (typeId === 'image');
}

/**
 * Upload the specified image file to the server, returning a url which can be used to reference and download the
 * image file in the future.
 *
 * @param {File} file           the image file to be uploaded.
 * @param {csNode} [tgtNode]    the node to which the file url should be added.
 */
function uploadImageFile(file, tgtNode) {
    let reader = new FileReader();

    reader.onload = function(e) {
        let contents = e.target.result;
        let mousePos = getOffsetMousePos();
        let nodeUid;

        if (tgtNode) {
            nodeUid = tgtNode.getUid();
        }

        let imgUrl = `./image/${getProject().getName()}/${file.name}`;
        let params = { "existingUid": nodeUid, "uid": file.name, "mousePos": mousePos, "imgUrl": imgUrl };
        let payload = { "data": convertArrayBufferToBase64(contents), "imageName": file.name, "project": getProject().getName() };

        httpPostJson(URL_SAVE_IMAGE, callbackSaveImage, payload, params);
    };

    reader.readAsArrayBuffer(file);
}

/**
 * Upload the specified non-image file to the server, returning a url which can be used to reference and download the
 * file in the future.
 *
 * @param {File} file           the file to be uploaded.
 * @param {csNode} [tgtNode]    the node to which the file url should be added.
 */
function uploadNormalFile(file, tgtNode) {
    let reader = new FileReader();

    reader.onload = function(e) {
        let contents = e.target.result;
        let mousePos = getOffsetMousePos();
        let nodeUid;

        if (tgtNode) {
            nodeUid = tgtNode.getUid();
        }

        let params = { "existingUid": nodeUid, "filename": file.name, "mousePos": mousePos };
        let payload = { "data": convertArrayBufferToBase64(contents), "fileName": file.name, "project": getProject().getName() };

        httpPostJson(URL_SAVE_FILE, callbackSaveFile, payload, params);
    };

    reader.readAsArrayBuffer(file);
}

/**
 * Callback that is triggered upon return of the image file upload request to the server.
 * If a node id was specified then switch that node to populated using the url for the image, otherwise create a new
 * full node on the canvas and populate with the image url.
 *
 * @param {csResponse} response     the response received from the server.
 * @param {object} params           the parameters specified prior to the upload request.
 */
function callbackSaveImage(response, params) {
    if (params.existingUid) {
        let newNode = getProject().getNodeById(params.existingUid);

        doSwitchToPopulatedNode(newNode, params.imgUrl);
    } else {
        let typeItem = getPalette().getItemById('image');

        createNewFullNode(typeItem, null, params.mousePos, { "plainText": params.imgUrl });
    }
}

/**
 * Callback that is triggered upon return of the non-image file upload request to the server.
 * If a node id was specified then switch that node to populated using the url for the image, otherwise create a new
 * full node on the canvas and populate with the image url.
 *
 * @param {csResponse} response     the response received from the server.
 * @param {object} params           the parameters specified prior to the upload request.
 */
function callbackSaveFile(response, params) {
    if (params.existingUid) {
        let newNode = getProject().getNodeById(params.existingUid);

        doSwitchToPopulatedNode(newNode, params.filename);
    } else {
        let nodeType = getPalette().getItemById('file');

        createNewFullNode(nodeType, null, params.mousePos, { "plainText": params.filename });
    }

    /* refresh the palette file list so the new file is listed */
    listFiles();
}
