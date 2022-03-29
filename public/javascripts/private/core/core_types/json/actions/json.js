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
 * @file Defines the behaviour of the core 'json' palette item.
 *
 * @author Dave Braines
 **/

import {registerStandardNodeCallbacks} from "/javascripts/interface/callbackType.js";

const TYPE_NAME = 'json';
const KEY_PROPERTY = 'json';

registerStandardNodeCallbacks(TYPE_NAME, cbDoJsonProcessing);

/**
 * Simple function to process json nodes on the canvas.  If there is a payload, save it to the key property (json).
 * Currently json nodes do not display their templates on the canvas.
 *
 * @param {csContext} context   the standard context object for node callback events.
 */
function cbDoJsonProcessing(context) {
    if (context.payload && context.payload.plainText) {
        context.node.setJsonPropertyNamed(KEY_PROPERTY, context.payload.plainText);
    }
}
