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
 * @file Defines the behaviour of the core 'video' palette item.
 *
 * @author Dave Braines
 **/

import {registerStandardNodeCallbacks} from "/javascripts/interface/callbackType.js";
import {putHtml} from "/javascripts/interface/graphics.js";

const TYPE_NAME = 'video';
const KEY_PROPERTY = 'url';

registerStandardNodeCallbacks(TYPE_NAME, cbDoVideoProcessing);

/**
 * Simple function to process video nodes on the canvas.  If there is a payload, save it to the key property (url), and
 * use that property, if present, to generate html templates.
 *
 * @param {csContext} context   the standard context object for node callback events.
 */
function cbDoVideoProcessing(context) {
    if (context.payload && context.payload.plainText) {
        context.node.setNormalPropertyNamed(KEY_PROPERTY, context.payload.plainText);
    }

    doVideoPart(context.node, context.node.getPropertyNamed(KEY_PROPERTY));
}

/**
 * Currently only handles YouTube urls.
 * Split the url into parts so that the html for the embedded video player can be created and us that html
 * as the node details on the canvas.
 *
 * @param {csNode} tgtNode      the node that is being processed.
 * @param {string} url          the url to be used.
 */
function doVideoPart(tgtNode, url) {
    if (url) {
        let urlParts = url.split('&');
        let vidUrl = urlParts[0].replace('/watch?v=', '/embed/');
        let ratio = 315 / 560;  // Taken from default youtube embed code example
        let width;
        let height;

        if (!tgtNode.getPropertyNamed('width')) {
            width = tgtNode.getType().getSettings().getDefaultWidth();
            tgtNode.setNormalPropertyNamed('width', `${width}px`);
        } else {
            width = tgtNode.getPropertyNamed('width').replace('px', '');
        }

        height = width * ratio;

        let iFrameId = `cs-video-frame-${tgtNode.getUid()}`;
        let html = `
<iframe
    id = "${iFrameId}"
    xmlns="http://www.w3.org/1999/xhtml"
    class="cs-video-frame"
    width="${width}"
    height="${height}"
    src="${vidUrl}">
    frameBorder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;">
</iframe>`;

        putHtml(tgtNode, html);
    }
}
