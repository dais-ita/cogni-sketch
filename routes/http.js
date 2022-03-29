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
 * @file The express route definition for all 'http' server requests.
 *
 * @author Dave Braines
 **/

const cs = require('../cs/cs')();
const csp = require('../cs/cs_private');
const got = require('got');
const express = require('express');
const router = express.Router();

router.post('/', function(req, res) {
    cs.log.debug('messages.general.http', { "verb": 'POST', "label": 'http' });

    doHttpProcessing(req, res);
});

function doHttpProcessing(req, res) {
    if (cs.security.isLoggedIn(req)) {
        let verb = csp.getQueryParameter(req, 'verb');
        let url = csp.getQueryParameter(req, 'url');

        (async () => {
            let response;

            try {
                res.setHeader('content-type', 'application/json');

                if (verb === 'POST') {
                    response = await got.post(url, {
                        'json': req.body,
                        'responseType': 'json'
                    });
                    res.json(response.body);
                } else {
                    response = await got(url);
                    res.json(response.body);
                }
            } catch (error) {
                res.setHeader('content-type', 'application/json');
                res.json(error);
            }
        })();
    } else {
        res.sendStatus(401);
    }
}

/** Module exports */
module.exports = router;
