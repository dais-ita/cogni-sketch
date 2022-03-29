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
 * @file The express route definition for all 'plugin' server requests.
 *
 * @author Dave Braines
 **/

const cs = require('../cs/cs')();
const csp = require('../cs/cs_private');
const sec= require('../cs/security');
const settings = require('../settings');
const plugins = require('../plugins');
const pv = require('../package').version;
const fs = require('fs-extra');
const express = require('express');
const router = express.Router();

router.get('/list', function(req, res) {
    cs.log.debug('messages.general.http', { "verb": 'GET', "label": 'listPlugins' });

    if (cs.security.isLoggedIn(req)) {
        let result = {
            "version": pv,
            "isAdmin": sec.isAdmin(req),
            "debug": settings.debug,
            "core": plugins.core,
            "paneOrder": plugins.paneOrder,
            "plugins": []
        };

        for (let plugin of plugins.plugins) {
            let copyPlugin = JSON.parse(JSON.stringify(plugin));    //TODO: Abstract to generic copy function
            const fn = csp.getRootPath() + `/plugins/${plugin.name}/package.json`;
            const fc = fs.readFileSync(fn, settings.codepage);

            copyPlugin.package = JSON.parse(fc);
            //TODO: Wrap all of above in try/catch

            //Ensure that any plugin credentials are removed
            delete copyPlugin.creds;
            delete copyPlugin.client_creds;

            result.plugins.push(copyPlugin);
        }

        cs.response.returnJson(res, result);
    } else {
        res.sendStatus(401);
    }
});

/** Module exports */
module.exports = router;
