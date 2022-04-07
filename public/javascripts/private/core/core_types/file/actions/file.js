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
 * @file Defines the behaviour of the core 'file' palette item.
 *
 * @author Dave Braines
 **/

import {
    registerLabelTextCallback,
    registerNodeIconCallback,
    registerStandardNodeCallbacks
} from "/javascripts/interface/callbackType.js";
import {putLink} from "/javascripts/interface/graphics.js";

import {getIconDetailsFor} from "/javascripts/private/ui/palette/files.js";
import {fileDownloadUrlFor} from "/javascripts/private/util/misc.js";

const TYPE_NAME = 'file';

registerLabelTextCallback(TYPE_NAME, cbLabelText);
registerNodeIconCallback(TYPE_NAME, cbNodeIcon);
registerStandardNodeCallbacks(TYPE_NAME, cbFileProcessing);

/**
 * Simple function to return the filename property as the label text.
 *
 * @param {csContext} context   the standard context object for label text callback events.
 * @return {string}             the label for this node.
 */
function cbLabelText(context) {
    return context.node.getLabel() || context.node.getPropertyNamed('filename');
}

/**
 * Simple function to call a standard function to determine the appropriate file icon based on the filename property.
 *
 * @param {csContext} context   the standard context object for node icon callback events.
 * @return {string}             the icon url for this node.
 */
function cbNodeIcon(context) {
    let filename = context.node.getPropertyNamed('filename');
    let result;

    if (filename) {
        let iconDetails = getIconDetailsFor(filename);

        if (iconDetails) {
            result = { 'icon': iconDetails.url, 'iconAlt': iconDetails.alt }
        }
    }

    return result;
}

/**
 * Simple function to process file nodes on the canvas.  If there is a payload, determine whether it is a url or a
 * filename and compute the url to use.  Save the filename and url properties.
 * Use the url property, if present, to add a link as the node details.
 *
 * @param {csContext} context   the standard context object for node callback events.
 */
function cbFileProcessing(context) {
    let fn;
    let url;

    if (context.payload && context.payload.plainText) {
        fn = context.payload.plainText.replace('file:', '');
        url = fileDownloadUrlFor(fn);

        context.node.setNormalPropertyNamed('filename', fn);
        context.node.setNormalPropertyNamed('url', url);
    } else {
        url = context.node.getPropertyNamed('url');
    }

    putLink(context.node, url, 'download');
}
