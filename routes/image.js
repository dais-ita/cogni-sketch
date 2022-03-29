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
 * @file The express route definition for all 'image' server requests.
 *
 * These requests are supported:
 *      GET     /:proj/:image   {binary}    Return the binary data for the specified image.
 *
 * @author Dave Braines
 **/

const cs = require('../cs/cs')();
const csp = require('../cs/cs_private');
const express = require('express');
const router = express.Router();

// router.get('/get/:proj/:image', function(req, res, next) {
//     cs.log.debug('messages.general.http', { "verb": 'GET', "label": 'getImage [legacy]', 'extra': req.params });
//
//     //TODO: Remove this when old sketch projects migrated
//     doGetImageProcessing(req, res, next);
// });

/**
 * Identify the filename for the image that is required and, if the image is owned by someone else, check permissions
 * and return the image file contents if authorised.
 */
router.get('/:proj/:image', function(req, res) {
    cs.log.debug('messages.general.http', { "verb": 'GET', "label": 'getImage', 'extra': req.params });

    if (cs.security.isLoggedIn(req)) {
        const fName = cs.file.getImageFilename(req);
        let allowed = true;

        if (csp.ownerName(req)) {
            allowed = csp.isSharedAccessAuthorised(req, 'read');
        }

        if (allowed) {
            res.sendFile(fName);
        } else {
            res.sendStatus(401);
        }
    } else {
        res.sendStatus(401);
    }
});

router.post('/save', function(req, res) {
    cs.log.debug('messages.general.http', { "verb": 'POST', "label": 'saveImage' });

    if (cs.security.isLoggedIn(req)) {
        cs.file.saveImage(req);

        cs.response.returnJson(res, {});
    } else {
        res.sendStatus(401);
    }
});

/** Module exports */
module.exports = router;
