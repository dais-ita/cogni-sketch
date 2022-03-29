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
 * @file Defines the behaviour of the core 'image' palette item.
 *
 * @author Dave Braines
 **/

import {registerStandardNodeCallbacks} from "/javascripts/interface/callbackType.js";
import {warn} from "/javascripts/interface/log.js";
import {putImage} from "/javascripts/interface/graphics.js";

const TYPE_NAME = 'image';

registerStandardNodeCallbacks(TYPE_NAME, cbImageProcessing);

/**
 * Simple function to process image nodes on the canvas.  If there is a payload, determine whether the url is local
 * or remote and set the filename or url property accordingly, and use this property to add the image as the node
 * details.
 *
 * Images with binary data in the payload are no longer supported.
 *
 * @param {csContext} context   the standard context object for node callback events.
 */
function cbImageProcessing(context) {
    if (context.payload && context.payload.plainText) {
        if (context.payload.plainText.indexOf('data:') === 1) {
            warn('Images with binary data (data:) are no longer supported');
        } else {
            if (context.payload.plainText.startsWith('.')) {
                context.node.setNormalPropertyNamed('filename', context.payload.plainText);
            } else {
                context.node.setNormalPropertyNamed('url', context.payload.plainText);
            }

            let imgWidth = context.node.getPropertyNamed('width');

            if (!imgWidth) {
                if (context.node.getType()) {
                    imgWidth = context.node.getType().getSettings().getDefaultImageWidth();

                    if (imgWidth) {
                        context.node.setNormalPropertyNamed('width', imgWidth);
                    }
                }
            }
        }
    }

    let imgUrl = context.node.getPropertyNamed('url');

    if (!imgUrl) {
        imgUrl = context.node.getPropertyNamed('filename');
    }

    putImage(context.node, imgUrl);
}
