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
 * @file Contains only typedefs, specifically those relating to any structures responses from the server.
 *
 * @author Dave Braines
 **/

/**
 * csResponse - the standard object for a response object that proposes the creation of nodes and links.
 *
 * @typedef csResponse
 * @type {object}
 */
//TODO: Complete this

/**
 * csPreviewResponse - the response structure (from client or server) which defines the list of nodes and links
 * that could be created on the canvas.
 *
 * @typedef csPreviewResponse
 * @type {object}
 * @property {string[]} [messages]
 * @property {string[]} [errors]
 */

/**
 * csPreviewItem - simple object structure for conveying preview items to the html template.
 *
 * @typedef csPreviewItem
 * @type {object}
 * @property {string} linkName      the name of the link that will be created between the original and new node.
 * @property {string} typeName      the name of the (palette item) type for the new node.
 * @property {string} [label]       the label for the new node.
 * @property {object} [data]        the data for the new node.
 */
