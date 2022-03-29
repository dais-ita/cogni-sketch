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
 * @file Public interface functions for making http requests and handling some pre-defined response structures.
 * All methods are simple proxies to relevant private functions.
 *
 * @author Dave Braines
 **/

import {
    httpGet as doGet,
    httpPost as doPost,
    httpPostJson as doPostJson,
    httpPostZip as doPostZip,
    urlDecode as doUrlDecode
} from "/javascripts/private/util/http.js";
import {handleResponse as doHandleResponse} from "/javascripts/private/util/response.js";

/**
 * Make a http GET request, calling the specified callback function with the response.
 *
 * @param {string} url              the url to be used for the HTTP GET request.
 * @param {function} callback       the callback function to be executed on response.
 * @param {object} [cbParams]       an object that will be send to the callback function.
 * @param {boolean} [quiet=false]   whether errors will be reported (also passed to the callback function).
 * @param {string} [errMsg]         an optional error message to be shown to the user on failure.
 * @param {string} [contentType='application/json']    the Content-type header for the request.
 */
export function httpGet(url, callback, cbParams, quiet, errMsg, contentType) {
    doGet(url, callback, cbParams, quiet, errMsg, contentType);
}

/**
 * Make a http POST request, with the POST data being JSON.
 * See 'post' for an equivalent method that expects plain text as the data parameter.
 *
 * @param {string} url              the url to be used for the HTTP POST request.
 * @param {function} callback       the callback function to be executed on response.
 * @param {object} data             an object that will be the POST body (payload).
 * @param {object} [cbParams]       an object that will be send to the callback function.
 * @param {boolean} [quiet=false]   whether errors will be reported (also passed to the callback function).
 * @param {string} [errMsg]         an optional error message to be shown to the user on failure.
 */
export function httpPostJson(url, callback, data, cbParams, quiet, errMsg) {
    doPostJson(url, callback, data, cbParams, quiet, errMsg)
}

/**
 * Make a http POST request, with the POST data being plain text.
 * See 'postJson' for an equivalent method that expects a javascript object as the data parameter.
 *
 * @param {string} url              the url to be used for the HTTP POST request.
 * @param {function} callback       the callback function to be executed on response.
 * @param {string} [data]           the string data to be sent as the POST body (payload).
 * @param {object} [cbParams]       an object that will be send to the callback function.
 * @param {boolean} [quiet=false]   whether errors will be reported (also passed to the callback function).
 * @param {string} [errMsg]         an optional error message to be shown to the user on failure.
 */
export function httpPost(url, callback, data, cbParams, quiet, errMsg) {
    doPost(url, callback, data, cbParams, quiet, errMsg);
}

/**
 * Make a http POST request, with the response being handled as 'application/zip'.
 *
 * @param {string} url              the url to be used for the HTTP POST request.
 * @param {function} callback       the callback function to be executed on response.
 * @param {object} [data]           any data to be sent as the POST body (payload).
 * @param {object} [cbParams]       an object that will be send to the callback function.
 * @param {boolean} [quiet=false]   whether errors will be reported (also passed to the callback function).
 * @param {string} [errMsg]         an optional error message to be shown to the user on failure.
 */
export function httpPostZip(url, callback, data, cbParams, quiet, errMsg) {
    doPostZip(url, callback, data, cbParams, quiet, errMsg);
}

/**
 * Decode an encoded url. Replace space characters with %20 and run decodeUriComponent on the specified url.
 *
 * @param {string} url      the url to be decoded.
 * @returns {string}        the decoded url.
 */
export function urlDecode(url) {
    return doUrlDecode(url);
}

/**
 * Process the standard structure that is returned from the server for any functions that propose the creation of new
 * nodes or links.
 *
 * @param {csNode} originalNode             the node against which the operation was performed.
 * @param {csResponse} functionResponse     the links and nodes proposed to be created in the response.
 * @param {boolean} [noPopup=false]         whether to show the popup form for selection/confirmation.
 */
export function handleResponse(originalNode, functionResponse, noPopup) {
    doHandleResponse(originalNode, functionResponse, noPopup);
}
