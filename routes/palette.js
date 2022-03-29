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
 * @file The express route definition for all 'palette' server requests.
 *
 * @author Dave Braines
 **/

const cs = require('../cs/cs')();
const express = require('express');
const router = express.Router();

router.get('/get/:pal', function(req, res) {
    cs.log.debug('messages.general.http', { "verb": 'GET', "label": 'getPalette', 'extra': req.params });

    if (cs.security.isLoggedIn(req)) {
        const result = cs.palette.read(req);

        cs.response.returnJson(res, result);
    } else {
        res.sendStatus(401);
    }
});

router.get('/list', function(req, res) {
    cs.log.debug('messages.general.http', { "verb": 'GET', "label": 'listPalettes' });

    if (cs.security.isLoggedIn(req)) {
        const result = cs.palette.listAll(req);

        cs.response.returnJson(res, result);
    } else {
        res.sendStatus(401);
    }
});

router.post('/save', function(req, res) {
    cs.log.debug('messages.general.http', { "verb": 'POST', "label": 'savePalette' });

    if (cs.security.isLoggedIn(req)) {
        const result = cs.palette.save(req);

        cs.response.returnJson(res, result);
    } else {
        res.sendStatus(401);
    }
});

router.post('/delete', function(req, res) {
    cs.log.debug('messages.general.http', { "verb": 'POST', "label": 'deletePalette' });

    if (cs.security.isLoggedIn(req)) {
        const result = cs.palette.delete(req);

        cs.response.returnJson(res, result);
    } else {
        res.sendStatus(401);
    }
});

/** Module exports */
module.exports = router;
