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
 * @file The express route definition for all 'file' server requests.
 *
 * These requests are supported:
 *      GET     /get/:proj/:file
 *      GET     /list/:proj
 *      POST    /upload
 *      POST    /save
 *      POST    /saveText/:proj
 *      GET     /listIcons
 *
 * @author Dave Braines
 **/

const cs = require('../cs/cs')();
const express = require('express');
const router = express.Router();

/**
 * Get the specified file for the specified project.
 */
router.get('/get/:proj/:file', function(req, res, next) {
    cs.log.debug('messages.general.http', { "verb": 'GET', "label": 'getImage', 'extra': req.params });

    if (cs.security.isLoggedIn(req)) {
        const fName = cs.file.getFileFilename(req);

        //TODO: Set response headers?
        res.sendFile(fName);
    } else {
        res.sendStatus(401);
    }
});

/**
 * List all projects for the logged in user.
 */
router.get('/list/:proj', function(req, res) {
    cs.log.debug('messages.general.http', { "verb": 'GET', "label": 'listFiles', 'extra': req.params });

    if (cs.security.isLoggedIn(req)) {
        const result = cs.file.listAllFiles(req);

        cs.response.returnJson(res, result);
    } else {
        res.sendStatus(401);
    }
});

/**
 * Upload the binary contents of this POST request, returning the file name that was used in the response.
 */
router.post('/upload', function(req, res) {
    cs.log.debug('messages.general.http', { "verb": 'POST', "label": 'uploadFile' });

    if (cs.security.isLoggedIn(req)) {
        const result = cs.file.upload(req);

        cs.response.returnJson(res, result);
    } else {
        res.sendStatus(401);
    }
});

/**
 * Upload the binary contents of this POST request, returning the file name that was used in the response.
 */
router.post('/upload-icon', function(req, res) {
    cs.log.debug('messages.general.http', { "verb": 'POST', "label": 'uploadFile' });

    if (cs.security.isLoggedIn(req)) {
        const result = cs.file.uploadIcon(req);

        cs.response.returnJson(res, result);
    } else {
        res.sendStatus(401);
    }
});

/**
 * Save the binary data in the POST request to the specified file name.
 */
router.post('/save', function(req, res) {
    cs.log.debug('messages.general.http', { "verb": 'POST', "label": 'saveFile' });

    if (cs.security.isLoggedIn(req)) {
        cs.file.saveDirectFile(req);

        cs.response.returnJson(res, {});    //TODO: Return something useful here
    } else {
        res.sendStatus(401);
    }
});

/**
 * tbc
 */
router.post('/saveText/:proj', function(req, res) {
    cs.log.debug('messages.general.http', { "verb": 'POST', "label": 'saveTextFile', 'extra': req.params });

    if (cs.security.isLoggedIn(req)) {
        cs.file.saveTextFile(req);

        cs.response.returnJson(res, {});
    } else {
        res.sendStatus(401);
    }
});

/**
 * List all of the (shared) icons available on this server.
 */
router.get('/listIcons', function(req, res) {
    cs.log.debug('messages.general.http', { "verb": 'GET', "label": 'listIcons' });

    if (cs.security.isLoggedIn(req)) {
        const result = cs.icon.listIcons();

        cs.response.returnJson(res, result);
    } else {
        res.sendStatus(401);
    }
});

/** Module exports */
module.exports = router;
