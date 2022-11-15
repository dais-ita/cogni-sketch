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
 * @file Functions relating to clipboard actions such as copy, paste etc.
 * @author Dave Braines
 **/

import {getProject} from "/javascripts/private/state.js";
import {warn} from "/javascripts/private/util/log.js";
import {isPopupOpen} from "/javascripts/private/core/core_popups/generalPopup.js";
import {activeTabName} from "/javascripts/private/ui/tabs.js";
import {getPane} from "/javascripts/private/csData/csDataComponents.js";

/**
 * Process the operating system 'cut' event.  Is ignored if a modal popup is open.
 *
 * @param {ClipboardEvent} ev      the standard ClipboardEvent with cut details
 */
export function cut(ev) {
    if (isPopupOpen()) {
        //Ignore - popup is open
    } else {
        sendCutToTab(ev);
    }
}

/**
 * If the active pane has registered a cut handler then send this event on to that handler.
 *
 * @param {ClipboardEvent} ev     the clipboard event
 */
function sendCutToTab(ev) {
    let paneName = activeTabName()

    if (paneName) {
        let pane = getPane(paneName);

        if (pane && pane.config && pane.config.callbacks && pane.config.callbacks.cut) {
            pane.config.callbacks.cut(ev);
        }
    }
}

/**
 * Process the operating system 'copy' event.  Is ignored if a modal popup is open.
 *
 * @param {ClipboardEvent} ev      the standard ClipboardEvent with copy details
 */
export function copy(ev) {
    if (isPopupOpen()) {
        //Ignore - popup is open
    } else {
        sendCopyToTab(ev);
    }
}

/**
 * If the active pane has registered a copy handler then send this event on to that handler.
 *
 * @param {ClipboardEvent} ev     the clipboard event
 */
function sendCopyToTab(ev) {
    let paneName = activeTabName()

    if (paneName) {
        let pane = getPane(paneName);

        if (pane && pane.config && pane.config.callbacks && pane.config.callbacks.copy) {
            pane.config.callbacks.copy(ev);
        }
    }
}

/**
 * Process the operating system 'paste' event.  Is ignored if a modal popup is open.  This currently handles image
 * or text clipboard context, and will create the corresponding node onto the canvas with the templates.  For images
 * the binary of the image templates is also saved as a file on the server, enabling the node to contain a url to that
 * server image file rather than the binary templates of the image.
 *
 * @param {ClipboardEvent} ev      the standard ClipboardEvent with paste details
 */
export function paste(ev) {
    if (isPopupOpen()) {
        //Ignore - popup is open
    } else {
        let types = {};

        /* Build a dictionary of type names and the corresponding items.  This is because for text paste data there
           can be multiple items of different text types (html, rtf, plain etc.  This dictionary is then used in
           subsequent processing to determine the best type to use for this paste event.
         */
        for (let thisItem of ev.clipboardData.items) {
            types[thisItem.type] = thisItem;
        }

        /* First try for image data */
        let imagePasteItem = getImagePasteItem(types);

        if (imagePasteItem) {
            handleImagePaste(imagePasteItem);
        } else {
            /* There was no image data, so try for text */
            let po = {};
            let plainTextItem = types['text/plain'];
            let richTextItem = types['text/html'] || types['text/rtf'];

            if (plainTextItem && richTextItem) {
                plainTextItem.getAsString(function(txt) { cbPastedText(txt, 'plainText', po, 2); });
                richTextItem.getAsString(function(txt) { cbPastedText(txt, 'richText', po, 2); });
            } else if (richTextItem)  {
                richTextItem.getAsString(function(txt) { cbPastedText(txt, 'richText', po, 1); });
            } else {
                plainTextItem.getAsString(function(txt) { cbPastedText(txt, 'plainText', po, 1); });
            }
        }
    }
}

/**
 * If the active pane has registered a paste text handler then send this event on to that handler.
 *
 * @param {csPayload} payloadObj    the payload object containing the pasted text.
 */
function sendPasteTextToTab(payloadObj) {
    let paneName = activeTabName()

    if (paneName) {
        let pane = getPane(paneName);

        if (pane && pane.config && pane.config.callbacks && pane.config.callbacks.pasteText) {
            pane.config.callbacks.pasteText(payloadObj);
        }
    }
}

/**
 * Iterate through the dictionary of paste items and locate any that are image types, reporting a warning if multiple
 * possible image types are available.
 *
 * @type {csPasteItemDictionary} pasteItemsByType       the dictionary of paste items
 * @returns {DataTransferItem}                          the matching image item, or null if there is no match
 */
function getImagePasteItem(pasteItemsByType) {
    /**
     * @type {DataTransferItem}
     */
    let result;

    for (let [key, pasteItem] of Object.entries(pasteItemsByType)) {
        if (key.indexOf('image') > -1) {
            if (result) {
                warn(`Overwriting image pasted data ${result.type}) with other image pasted data (${pasteItem.type})`, true);
            }

            result = pasteItem;
        }
    }

    return result;
}

/**
 * Process the pasteItem containing the image data.  Overall this save the image binary data to the server
 * (via a callback) and creates a node on the canvas with a url to that server copy of the image (in the callback).
 * This function computes all the required parameters an invokes the callback
 *
 * @param {DataTransferItem} pasteItem
 */
function handleImagePaste(pasteItem) {
    let blob = pasteItem.getAsFile();
    let imgFilename = newImageFilename();
    let imgUrl = calculateImageUrl(imgFilename);
    let rdr = new FileReader();
    rdr.addEventListener('loadend', function() { sendPasteImageToTab(rdr, imgFilename, imgUrl); });

    rdr.readAsArrayBuffer(blob);
}

/**
 * If the active pane has registered a paste image handler then send this event on to that handler.
 *
 * @param {FileReader} rdr      the binary image data as a file reader.
 * @param {string} imgFilename  the name of the image file.
 * @param {string} imgUrl       the relative url for the image file
 */
function sendPasteImageToTab(rdr, imgFilename, imgUrl) {
    let paneName = activeTabName();

    if (paneName) {
        let pane = getPane(paneName);

        if (pane && pane.config && pane.config.callbacks && pane.config.callbacks.pasteImage) {
            pane.config.callbacks.pasteImage(rdr, imgFilename, imgUrl);
        }
    }
}

/**
 * Calculate the image url to be used when saving a new image.  This includes the name of the current project as each
 * image is saved within a project.
 *
 * @param {string} uid      the filename for the image that will be saved.
 * @returns {string}        the image url for the image, including the project name.
 */
export function calculateImageUrl(uid) {
    let pn = getProject().getName();

    return `./image/${pn}/${uid}`;
}

/**
 * Compute a new unique filename for an image, always a PNG filename.
 *
 * @returns {string}    the new filename
 */
export function newImageFilename() {
    //TODO: Come up with a better UID generation approach.  Timestamps will do for now
    return Date.now() + '.png';
}

/**
 * Called when the pasted text is extracted from the clipboard.  Either create a new node with the text templates or
 * paste the text directly on to the selected node.  If more than one node is selected then the request is rejected.
 *
 * The pasted text must be extracted from the clipboard via callbacks, and sometimes there are multiple versions to
 * extract (e.g. plain and rich text).  The 'numNeeded' parameter specifies how many properties are needed so this
 * function can avoid processing until all properties are successfully obtained.
 *
 * @param {string} pastedText       the pasted text.
 * @param {string} [textFormat]     the format of the text (e.g. 'text/html').
 * @param {csPayload} payloadObj    the payload object containing the pasted text.
 * @param {number} numNeeded        the number of properties that are required for the paste to be complete.
 */
function cbPastedText(pastedText, textFormat, payloadObj, numNeeded) {
    if (!payloadObj[textFormat]) {
        payloadObj[textFormat] = pastedText;
    }

    if (Object.keys(payloadObj).length === numNeeded) {
        sendPasteTextToTab(payloadObj);
    } else {
        /* Nothing needed - still waiting on another callback */
    }
}
