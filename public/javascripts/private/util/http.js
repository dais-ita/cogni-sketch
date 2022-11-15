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
 * @file Utility function relating to http requests and responses.
 * @author Dave Braines
 */

import {error} from "/javascripts/private/util/log.js";
import {executeFunctionAfterDelay} from "/javascripts/private/util/timing.js";
import {localize} from "/javascripts/private/util/internationalization.js";

const CT_JSON = 'application/json';
const CT_ZIP = 'application/zip';

const MSG_NOT_AUTHORISED = 'You are no longer authenticated to the server and must login again.  If you wish to save project changes select project->export';

/**
 * Make a http GET request, calling the specified callback function with the response.
 *
 * @param {string} url              the url to be used for the HTTP GET request
 * @param {function} callback       the callback function to be executed on response
 * @param {object} [params]         an object that will be send to the callback function
 * @param {boolean} [quiet=false]   whether errors will be reported (also passed to the callback function)
 * @param {string} [errMsg]         an optional error message to be shown to the user on failure
 * @param {string} [contentType]    the Content-type header for the request, defaults to 'application/json'
 */
export function httpGet(url, callback, params, quiet, errMsg, contentType) {
    let http = new XMLHttpRequest();
    let paramContentType = contentType || CT_JSON;

    http.open('GET', url, true);

    http.setRequestHeader('Content-type', paramContentType);

    http.onreadystatechange = function() {
        if (http.readyState === 4) {
            if (http.status === 200) {
                let resp;

                if (paramContentType === CT_JSON) {
                    try {
                        resp = JSON.parse(http.response);
                    } catch(e) {
                        console.error('JSON parse error');
                        console.error(`url=${url}`)
                        console.error(http.response)
                    }
                } else {
                    resp = http.response;
                }

                callback(resp, params, quiet);
            } else if (http.status === 401) {
                /* The user is no longer authorised - advise to use project export */
                error(MSG_NOT_AUTHORISED, null, null, !quiet);
            } else {
                let msg = errMsg || localize('messages.http.GET', { "url": url });
                error(msg, null, null, !quiet);
            }
        }
    };

    http.onerror = function(httpError) {
        let msg = errMsg || localize('messages.http.GET', { "url": url });

        error(msg, httpError, null, !quiet);
    };

    http.send();
}

/**
 * Make a http POST request, with the POST data being JSON.
 * See 'httpPost' for an equivalent method that expects plain text as the data parameter.
 *
 * @param {string} url              the url to be used for the HTTP POST request
 * @param {function} callback       the callback function to be executed on response
 * @param {object} data             an object that will be the POST body (payload)
 * @param {object} [params]         an object that will be send to the callback function
 * @param {boolean} [quiet=false]   whether errors will be reported (also passed to the callback function)
 * @param {string} [errMsg]         an optional error message to be shown to the user on failure
 */
export function httpPostJson(url, callback, data, params, quiet, errMsg) {
    httpPost(url, callback, JSON.stringify(data), params, quiet, errMsg)
}

/**
 * Make a http POST request, with the POST data being plain text.
 * See 'httpPostJson' for an equivalent method that expects an object as the data parameter.
 *
 * @param {string} url              the url to be used for the HTTP POST request
 * @param {function} callback       the callback function to be executed on response
 * @param {string} data             the string data to be sent as the POST body (payload)
 * @param {object} [params]         an object that will be send to the callback function
 * @param {boolean} [quiet=false]   whether errors will be reported (also passed to the callback function)
 * @param {string} [errMsg]         an optional error message to be shown to the user on failure
 * @param {string} [ct]             the content type to be used
 */
export function httpPost(url, callback, data, params, quiet, errMsg, ct) {
    let http = new XMLHttpRequest();

    http.open('POST', url, true);
    http.setRequestHeader('Content-type', ct || CT_JSON);

    http.onreadystatechange = function() {
        if (http.readyState === 4) {
            if (http.status === 200) {
                let result;

                if (http.response) {
                    result = JSON.parse(http.response);
                }

                callback(result, params, quiet);
            } else if (http.status === 401) {
                /* The user is no longer authorised - advise to use project export */
                error(MSG_NOT_AUTHORISED, null, null, !quiet);
            } else {
                let msg = errMsg || `An error occurred POSTing to ${url}`;

                error(msg, null, null, !quiet);
            }
        }
    };

    http.onerror = function(httpError) {
        let msg = errMsg || `An error occurred POSTing to ${url}`;

        error(msg, httpError, null, !quiet);
    };

    http.send(data);
}

/**
 * Make a http POST request, with the response being handled as 'application/zip'.
 *
 * @param {string} url              the url to be used for the HTTP POST request
 * @param {function} callback       the callback function to be executed on response
 * @param {object} [data]           any data to be sent as the POST body (payload)
 * @param {object} [params]         an object that will be send to the callback function
 * @param {boolean} [quiet=false]   whether errors will be reported (also passed to the callback function)
 * @param {string} [errMsg]         an optional error message to be shown to the user on failure
 */
export function httpPostZip(url, callback, data, params, quiet, errMsg) {
    let http = new XMLHttpRequest();

    http.open('POST', url, true);
    http.setRequestHeader('Content-type', CT_ZIP);
    http.responseType = 'arraybuffer';

    http.onreadystatechange = function() {
        if (http.readyState === 4) {
            if (http.status === 200) {
                callback(http, params, quiet);
            } else if (http.status === 401) {
                /* The user is no longer authorised - advise to use project export */
                error(MSG_NOT_AUTHORISED, null, null, !quiet);
            } else {
                let msg = errMsg || 'An error occurred POSTing zip to ' + url;

                error(msg, null, null, !quiet);
            }
        }
    };

    http.onerror = function(httpError) {
        let msg = errMsg || 'An error occurred POSTing to ' + url;

        error(msg, httpError, null, !quiet);
    };

    http.send(data);
}

/**
 * Replace space characters with %20 and run decodeUriComponent on the specified url.

 * @param {string} url      the url to be decoded
 * @returns {string}        the decoded url
 */
export function urlDecode(url) {
    let result =  url.replace(/\+/g, '%20');

    return decodeURIComponent(result);
}

/**
 * Save the zip file to the users download directory.
 *
 * @param {XMLHttpRequest} xhr      the response from the server, containing the binary zip file data.
 */
export function saveZipFile(xhr) {
    let disposition = xhr.getResponseHeader('Content-Disposition');

    if (disposition && (disposition.indexOf('attachment') !== -1)) {
        let filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        let matches = filenameRegex.exec(disposition);

        if ((matches !== null) && matches[1]) {
            let filename = matches[1].replace(/['"]/g, '');
            let type = xhr.getResponseHeader('Content-Type');

            let blob = new File([xhr.response], filename, {type: type});
            let URL = window.URL || window.webkitURL;
            let downloadUrl = URL.createObjectURL(blob);

            let a = document.createElement('a');
            a.setAttribute('id', 'export-a');

            a.href = downloadUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();

            executeFunctionAfterDelay(function() {
                URL.revokeObjectURL(downloadUrl);

                let e = document.getElementById('export-a');
                e.parentNode.removeChild(e);
            }, 100);
        }
    }
}
