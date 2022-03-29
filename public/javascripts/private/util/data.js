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
 * @file General function for data/node related processing.
 *
 * @author Dave Braines
 **/

/**
 * Indicates whether the specified object is a csNode object.
 *
 * @param {csNode|csLink} csNodeOrLink - the node or link to be checked.
 * @return {boolean}
 */
export function isNode(csNodeOrLink) {
    return csNodeOrLink.csType === 'node';
}

/**
 * Indicates whether the specified object is a csLink object.
 *
 * @param {csNode|csLink} csNodeOrLink - the node or link to be checked.
 * @return {boolean}
 */
export function isLink(csNodeOrLink) {
    return csNodeOrLink.csType === 'link';
}

/**
 * Indicates whether the specified node is an file node.
 *
 * @param {csNode} csNode - the node to be checked.
 * @return {boolean}
 */
export function isFile(csNode) {
    return csNode.getTypeName() === 'file';
}

/**
 * Indicates whether the specified node is an image node.
 *
 * @param {csNode} csNode - the node to be checked.
 * @return {boolean}
 */
export function isImage(csNode) {
    return csNode.getTypeName() === 'image';
}

/**
 * Indicates whether the specified node is a text node.
 *
 * @param {csNode} csNode - the node to be checked.
 * @return {boolean}
 */
export function isText(csNode) {
    return csNode.getTypeName() === 'text';
}

/**
 * Indicates whether the specified node is a video node.
 *
 * @param {csNode} csNode - the node to be checked.
 * @return {boolean}
 */
export function isVideo(csNode) {
    return csNode.getTypeName() === 'video';
}

/**
 * Indicates whether the specified node is a web node.
 *
 * @param {csNode} csNode - the node to be checked.
 * @return {boolean}
 */
export function isWeb(csNode) {
    return csNode.getTypeName() === 'web';
}
