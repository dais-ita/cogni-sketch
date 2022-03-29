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
 * @file The express route definition for all 'project' server requests.
 *
 * @author Dave Braines
 **/

const cs = require('../cs/cs')();
const express = require('express');
const router = express.Router();

router.get('/get/:proj', function(req, res, next) {
    cs.log.debug('messages.general.http', { "verb": 'GET', "label": 'getProject', 'extra': req.params });

    if (cs.security.isLoggedIn(req)) {
        const result = cs.project.read(req);

        cs.response.returnJson(res, result);
    } else {
        next(req, res);
    }
});

router.get('/list', function(req, res) {
    cs.log.debug('messages.general.http', { "verb": 'GET', "label": 'listProjects' });

    if (cs.security.isLoggedIn(req)) {
        const result = cs.project.listAll(req);

        cs.response.returnJson(res, result);
    } else {
        res.sendStatus(401);
    }
});

router.get('/listProposals/:proj', function(req, res) {
    cs.log.debug('messages.general.http', { "verb": 'GET', "label": 'listProposals', 'extra': req.params });

    if (cs.security.isLoggedIn(req)) {
        const result = cs.project.listProposals(req);

        cs.response.returnJson(res, result);
    } else {
        res.sendStatus(401);
    }
});

router.post('/save', function(req, res) {
    cs.log.debug('messages.general.http', { "verb": 'POST', "label": 'saveProject' });

    if (cs.security.isLoggedIn(req)) {
        const result = cs.project.save(req);

        cs.response.returnJson(res, result);
    } else {
        res.sendStatus(401);
    }
});

router.post('/delete', function(req, res) {
    cs.log.debug('messages.general.http', { "verb": 'POST', "label": 'deleteProject' });

    if (cs.security.isLoggedIn(req)) {
        const result = cs.project.delete(req);

        cs.response.returnJson(res, result);
    } else {
        res.sendStatus(401);
    }
});

router.get('/deleteProposal/:proj/:propName', function(req, res) {
    cs.log.debug('messages.general.http', { "verb": 'POST', "label": 'deleteProjectProposal', 'extra': req.params });

    if (cs.security.isLoggedIn(req)) {
        const result = cs.project.deleteProposal(req);

        cs.response.returnJson(res, result);
    } else {
        res.sendStatus(401);
    }
});

router.post('/export/:proj', function(req, res, next) {
    doExportProcessing(req, res, next, 'POST');
});

router.post('/saveAction/:proj', function(req, res) {
    cs.log.debug('messages.general.http', { "verb": 'POST', "label": 'saveAction', 'extra': req.params });

    if (cs.security.isLoggedIn(req)) {
        cs.file.saveAction(req);

        cs.response.returnJson(res, {});
    } else {
        res.sendStatus(401);
    }
});

router.get('/countActions/:proj', function(req, res) {
    cs.log.debug('messages.general.http', { "verb": 'GET', "label": 'countActions', 'extra': req.params });

    if (cs.security.isLoggedIn(req)) {
        if (cs.security.isAdmin(req)) {
            if (req.params['proj']) {
                let result = cs.file.countActions(req);

                cs.response.returnJson(res, result);
            } else {
                cs.response.returnJson(res, {});
            }
        } else {
            cs.response.addResponseError('Not authorised to count actions, must be administrator')
            res.sendStatus(401);
        }
    } else {
        res.sendStatus(401);
    }
});

router.get('/listActions/:proj', function(req, res) {
    cs.log.debug('messages.general.http', { "verb": 'GET', "label": 'listActions', 'extra': req.params });

    if (cs.security.isLoggedIn(req)) {
        if (cs.security.isAdmin(req)) {
            let result = cs.file.listActions(req);

            cs.response.returnJson(res, result);
        } else {
            cs.response.addResponseError('Not authorised to list actions, must be administrator')
        }
    } else {
        res.sendStatus(401);
    }
});

router.post('/clearActions/:proj', function(req, res) {
    cs.log.debug('messages.general.http', { "verb": 'POST', "label": 'clearActions', 'extra': req.params });

    if (cs.security.isLoggedIn(req)) {
        if (cs.security.isAdmin(req)) {
            let result = cs.file.clearActions(req);

            cs.response.returnJson(res, result);
        } else {
            cs.response.addResponseError('Not authorised to clear actions, must be administrator')
        }
    } else {
        res.sendStatus(401);
    }
});

router.post('/propose/:owner/:proj', function(req, res) {
    cs.log.debug('messages.general.http', { "verb": 'POST', "label": 'proposeProject', 'extra': req.params });

    if (cs.security.isLoggedIn(req)) {
        const result = cs.project.propose(req);

        cs.response.returnJson(res, result);
    } else {
        res.sendStatus(401);
    }
});

function doExportProcessing(req, res, next, verb) {
    cs.log.debug('messages.general.http', { "verb": verb, "label": 'export', 'extra': req.params });

    if (cs.security.isLoggedIn(req)) {
        //Due to async zip call the response is returned from inside the function call
        cs.project.export(req, res);
    } else {
        res.sendStatus(401);
    }
}

/** Module exports */
module.exports = router;
