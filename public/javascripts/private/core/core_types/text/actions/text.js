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
 * @file Defines the behaviour of the core 'text' palette item.
 *
 * @author Dave Braines
 **/

import {registerAddEmptyCallback, registerCanHandleCallback, registerStandardNodeCallbacks} from "/javascripts/interface/callbackType.js";
import {putText} from "/javascripts/interface/graphics.js";

const TYPE_NAME = 'text';
const KEY_PROPERTY = 'text';

registerCanHandleCallback(TYPE_NAME, cbCanHandle);
registerStandardNodeCallbacks(TYPE_NAME, cbDoTextProcessing);
//registerAddEmptyCallback(TYPE_NAME, cbDoAddEmpty);

/**
 * Text nodes can always handle any data, but recognise that other nodes may be a stronger match.
 * Therefore always return the 'BY_DEFAULT' option.
 *
 * @param {csContext} context   the standard context object for can handle callback events.
 */
function cbCanHandle(context) {
   return context.options['BY_DEFAULT'];
}

/**
 * Simple function to process text nodes on the canvas.  If there is a payload, save it to the key property (text), and
 * use that property, if present, to add that text as the node details.
 *
 * @param {csContext} context   the standard context object for node callback events.
 */
function cbDoTextProcessing(context) {
    if (context.payload) {
        let payloadText = context.payload.richText || context.payload.plainText;

        if (payloadText) {
            context.node.setTextPropertyNamed(KEY_PROPERTY, payloadText);
            context.node.setNormalPropertyNamed('width', '500px');
        }
    }

    putText(context.node, context.node.getPropertyNamed(KEY_PROPERTY) || '');
}

/**
 * Simple function to add an empty 'text' (long text) property whenever a new text node is created.
 *
 * @param {csContext} context   the standard context object for node callback events.
 */
// function cbDoAddEmpty(context) {
//     context.node.setTextPropertyNamed('text', '');
// }
