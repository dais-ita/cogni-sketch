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
 * @file The express route definition for all 'permission' server requests.
 *
 * @author Dave Braines
 **/

const cs = require('../cs/cs')();
const csp = require('../cs/cs_private');
const log = require('../cs/log');
const settings = require('../settings');
const fs = require('fs-extra');
const express = require('express');
const router = express.Router();

const PERM_FN = '/data/permissions/project_permissions.json';

router.get('/list/:proj/', function(req, res) {
    cs.log.debug('messages.general.http', { "verb": 'GET', "label": 'listPermissions', 'extra': req.params });

    if (cs.security.isLoggedIn(req)) {
        let result = [];
        let proj = req.params['proj'];
        let perms = readPermissions();

        if (perms) {
            for (let perm of perms) {
                if (perm.project === proj) {
                    result.push(perm);
                }
            }
        }

        //TODO: Complete this
        res.send(result);
    } else {
        res.sendStatus(401);
    }
});

router.post('/save/:proj', function(req, res) {
    cs.log.debug('messages.general.http', { "verb": 'POST', "label": 'savePermissions', 'extra': req.params });

    if (cs.security.isLoggedIn(req)) {
        let newPerms = req.body;
        let proj = req.params['proj'];
        let result = {};

        if (proj) {
            let masterPerms = readPermissions();
            let finalPerms = [];

            //First remove all existing permissions for this project
            for (let perm of masterPerms) {
                if (perm['project'] !== proj) {
                    finalPerms.push(perm);
                }
            }

            //Now insert all submitted permissions
            let uidList = [];

            for (let perm of newPerms) {
                let uid = perm.project + ':' + perm.granted;

                if (uidList.indexOf(uid) === -1) {
                    finalPerms.push(perm);
                    uidList.push(uid);
                }
            }

            result.message = 'permissions updated';

            //Now save the permissions file
            const fn = csp.getRootPath() + PERM_FN;

            try {
                fs.writeFileSync(fn, JSON.stringify(finalPerms, null, 1));
            } catch(e) {
                log.error('messages.routes.permissions', { "fileName": fn }, e);
                result.message = 'permissions update failed';
            }
        }

        cs.response.returnJson(res, result);
    } else {
        res.sendStatus(401);
    }
});

function readPermissions() {
    const fn = csp.getRootPath() + PERM_FN;
    const fc = fs.readFileSync(fn, settings.codepage);

    return JSON.parse(fc);
}

/** Module exports */
module.exports = router;
