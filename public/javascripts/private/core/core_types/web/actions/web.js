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
 * @file Defines the behaviour of the core 'web' palette item.
 *
 * @author Dave Braines
 **/

import {registerCanHandleCallback, registerStandardNodeCallbacks} from "/javascripts/interface/callbackType.js";
import {putLink} from "/javascripts/interface/graphics.js";
import {httpPost} from "/javascripts/interface/http.js";
import {refreshNode} from "/javascripts/interface/data.js";

const TYPE_NAME = 'web';
const KEY_PROPERTY = 'url';

registerCanHandleCallback(TYPE_NAME, cbCanHandle);
registerStandardNodeCallbacks(TYPE_NAME, cbDoWebProcessing);

/**
 * Web nodes can always handle anything that is a url, but recognise that other nodes may be a stronger
 * match.  Therefore always return the 'WEAKLY' option.
 *
 * @param {csContext} context   the standard context object for can handle callback events.
 */
function cbCanHandle(context) {
    //TODO: Simplify this by allowing weakly as the default response
    let result = context.options['CANNOT'];

    if (context.payload) {
        let lcp = context.payload.plainText.toLowerCase();

        if (context.type) {
            for (let thisPref of context.type.getSettings().getDropPrefixes()) {
                if (lcp.startsWith(thisPref)) {
                    result = context.options['WEAKLY'];
                }
            }
        }
    }

    return result;
}

/**
 * Simple function to process web nodes on the canvas.  If there is a payload, save it to the key property (url), and
 * use that property, if present, to add a link as the node details.
 *
 * @param {csContext} context   the standard context object for node callback events.
 */
function cbDoWebProcessing(context) {
    if (context.payload && context.payload.plainText) {
        context.node.setNormalPropertyNamed(KEY_PROPERTY, context.payload.plainText);
    }

    let url = context.node.getPropertyNamed(KEY_PROPERTY);

    if (url) {
        if ((context.name !== 'addExisting') && (context.name !== 'refresh')) {
            let localUrl = `/http?url=${encodeURIComponent(url)}&verb=GET`;
            httpPost(localUrl, cbUpdateLabel, '', { 'node': context.node, 'url': url });
        }

        putLink(context.node, url, 'link');
    }
}

function cbUpdateLabel(response, params) {
    let lcResp = response.toLowerCase();
    let startPos = lcResp.indexOf('<title');
    let endPos = lcResp.indexOf('</title>');

    let title;

    if ((startPos > -1) && (endPos > -1)) {
        let dirtyTitle = response.substring(startPos, endPos);
        let elemEndPos = dirtyTitle.indexOf('>');
        title = dirtyTitle.substring(elemEndPos + 1, dirtyTitle.length);
    } else {
        title = params.url;
    }

    if (!title) {
        title = params.url;
    }

    params.node.setLabel(title);
    refreshNode(params.node);
}
