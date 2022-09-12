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
 * @file The express route definition for all 'user' server requests.
 *
 * @author Dave Braines
 **/

const cs = require('../cs/cs')();
const csp = require('../cs/cs_private');
const proj = require('../cs/project');
const express = require('express');
const router = express.Router();

router.get('/list/', function(req, res) {
    cs.log.debug('messages.general.http', { "verb": 'GET', "label": 'listUsers' });

    if (cs.security.isLoggedIn(req)) {
        let result = [];
        let fullDetails = req.query['fullDetails'];
        let currentUserName = csp.userName(req);
        let userList = cs.security.listUsers();

        for (let [key, user] of Object.entries(userList)) {
            if (fullDetails) {
                let userObj = {
                    "name": key,
                    "disabled": user.disabled || user.isGhost,
                    "isAdmin": user.isAdmin,
                    "isGhost": user.isGhost,
                    "palettes": cs.palette.listAll(req, key, true),
                    "projects": cs.project.listAll(req, key),
                };

                if (key === currentUserName) {
                    userObj.currentUser = true;
                }

                result.push(userObj);
            } else {
                result.push(key);
            }
        }

        result.sort(function(a, b) {
            if (a.name < b.name) { return -1; }
            if (a.name > b.name) { return 1; }
            return 0;
        });

        res.send(result);
    } else {
        res.sendStatus(401);
    }
});

router.get('/details/:user', function(req, res) {
    cs.log.debug('messages.general.http', { "verb": 'GET', "label": 'userDetails' });

    if (cs.security.isLoggedIn(req)) {
        let result;

        if (cs.security.isAdmin(req)) {
            let userName = req.params['user'];
            let currentUserName = csp.userName(req);
            let userList = cs.security.listUsers();

            result = { "name": userName };

            if (userList[userName].isAdmin) {
                result.isAdmin = true;
            }

            result.palettes = cs.palette.listAll(req, userName, true);
            result.projects = cs.project.listAll(req, userName);

            if (userName === currentUserName) {
                result.currentUser = true;
            }
        }

        res.send(result);
    } else {
        res.sendStatus(401);
    }
});

router.post('/add/:user', function(req, res) {
    cs.log.debug('messages.general.http', { "verb": 'POST', "label": 'addUser' });

    if (cs.security.isLoggedIn(req)) {
        let result;

        if (cs.security.isAdmin(req)) {
            let userName = req.params['user'];
            let password = req.query['password'];

            result = cs.security.addUser(userName, password, false);
        } else {
            result = { "error": 'Not authorised' };
        }

        res.send(result);
    } else {
        res.sendStatus(401);
    }
});

router.post('/enable/:user', function(req, res) {
    cs.log.debug('messages.general.http', { "verb": 'POST', "label": 'enableUser' });

    if (cs.security.isLoggedIn(req)) {
        let result;

        if (cs.security.isAdmin(req)) {
            let userName = req.params['user'];

            result = cs.security.enableUser(userName);
        } else {
            res.sendStatus(401);
        }

        res.send(result);
    } else {
        res.sendStatus(401);
    }
});

router.post('/disable/:user', function(req, res) {
    cs.log.debug('messages.general.http', { "verb": 'POST', "label": 'disableUser' });

    if (cs.security.isLoggedIn(req)) {
        let result;

        if (cs.security.isAdmin(req)) {
            let userName = req.params['user'];
            let thisUserName = csp.userName(req);

            if (userName !== thisUserName) {
                result = cs.security.disableUser(userName);
            } else {
                result = { "error": 'Cannot disable the logged in user' };
            }

            res.send(result);
        } else {
            res.sendStatus(401);
        }
    } else {
        res.sendStatus(401);
    }
});

router.post('/setAdmin/:user', function(req, res) {
    cs.log.debug('messages.general.http', { "verb": 'POST', "label": 'setAdmin' });

    if (cs.security.isLoggedIn(req)) {
        let result;

        if (cs.security.isAdmin(req)) {
            let userName = req.params['user'];
            let state = req.query['state'];
            let thisUserName = csp.userName(req);

            if (userName !== thisUserName) {
                result = cs.security.setAdmin(userName, state);
            } else {
                result = {"error": 'Cannot change admin status for the logged in user'};
            }
        } else {
            result = {"error": 'Not authorised'};
        }

        res.send(result);
    } else {
        res.sendStatus(401);
    }
});

router.post('/initialise/:user', function(req, res) {
    cs.log.debug('messages.general.http', { "verb": 'POST', "label": 'initialise' });

    if (cs.security.isLoggedIn(req)) {
        let result;

        if (cs.security.isAdmin(req)) {
            let userName = req.params['user'];

            let initResult = proj.initialiseFor(userName);

            result = {
                "message": 'User initialisation complete',
                "userName": userName,
                "paletteCount": initResult.paletteCount,
                "projectCount": initResult.projectCount
            };
        } else {
            result = {"error": 'Not authorised'};
        }

        res.send(result);
    } else {
        res.sendStatus(401);
    }
});

router.post('/changePassword/', function(req, res) {
    cs.log.debug('messages.general.http', { "verb": 'POST', "label": 'changePassword' });

    if (cs.security.isLoggedIn(req)) {
        let userName = req.body['userName'];

        if (cs.security.isAdmin(req)) {
            //Admin can change without existing password
            let result = cs.security.changePassword(userName, req.body['newPassword']);

            res.send(result);
        } else {
            if (csp.userName(req) === userName) {
                //User can change own password but must know the existing one

                let result = cs.security.checkPassword(userName, req.body['oldPassword']);

                if (result) {
                    result = cs.security.changePassword(userName, req.body['newPassword']);
                    res.send(result);
                } else {
                    res.send({"error": 'Incorrect existing password'});
                }
            } else {
                res.sendStatus(401);
            }
        }
    } else {
        res.sendStatus(401);
    }
});

router.post('/checkPassword/', function(req, res) {
    cs.log.debug('messages.general.http', { "verb": 'POST', "label": 'checkPassword' });

    if (cs.security.isLoggedIn(req)) {
        let result = cs.security.checkPassword(req.body['userName'], req.body['password']);

        if (result) {
            res.send(result);
        } else {
            res.send({ "error": 'Invalid password'} );
        }
    } else {
        res.sendStatus(401);
    }
});

/** Module exports */
module.exports = router;
