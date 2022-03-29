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
 * @file A collection of server-side functions relating to generic server response processing.
 *
 * @author Dave Braines
 **/

//TODO: Define typedefs for the standard responses
//TODO: Share the typedefs for standard csLink, csNode etc from the client

/**
 * Create a simple response object containing the original node id and arrays for messages, errors and nodes that
 * can all be populated later.
 *
 * @param {string} originalNodeId   A node id to be stored in the response.
 * @return {object}                 The standard response object.
 */
function createResponseContainer(originalNodeId) {
    return {
        "originalNodeId": originalNodeId,
        "messages": [],
        "errors": [],
        "nodes": []
    };
}

/**
 * Add a node object to the standard response object.
 *
 * @param {object} resp         The existing standard response object.
 * @param {object} link         The link object to be added.
 * @param {object} type         The palette type object to be added.
 * @param {object} [nodeData]   Any node data (properties and values) to be added.
 */
function addResponseObject(resp, link, type, nodeData) {
    resp.nodes.push( { "link": link, "type": type, "nodeData": nodeData } );
}

/**
 * A simple function to add the specified object as a 'custom' property in the existing response.
 *
 * @param {object} resp         The existing standard response object.
 * @param {object} obj          Any object which will be added to the response.
 */
function addResponseCustom(resp, obj) {
    resp.custom = obj;
}

/**
 * Add the specified message text to the response object message array.
 *
 * @param {object} resp         The existing standard response object.
 * @param {string} msgText          The message text to be added.
 */
function addResponseMessage(resp, msgText) {
    resp.messages.push(msgText);
}

/**
 * Add the specified error message text to the response object message array.
 *
 * @param {object} resp         The existing standard response object.
 * @param {string} msgText      The error message text to be added.
 */
function addResponseError(resp, msgText) {
    resp.errors.push(msgText);
}

/**
 * Return the specified response object in the http response.
 *
 * @param {e.Response} res      The http request object.
 * @param {object} j            The response object to be returned.
 */
function returnJson(res, j) {
    res.setHeader('content-type', 'application/json');
    res.json(j);
}

/** Module exports */
module.exports = Object.freeze({
    "createResponseContainer": createResponseContainer,
    "addResponseObject": addResponseObject,
    "addResponseCustom": addResponseCustom,
    "addResponseMessage": addResponseMessage,
    "addResponseError": addResponseError,
    "returnJson": returnJson
});
