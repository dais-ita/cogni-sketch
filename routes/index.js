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
 * @file The express route definition for the main (index) request.
 *
 * @author Dave Braines
 **/

const cs = require('../cs/cs')();
const csp = require('../cs/cs_private');
const pv = require('../package').version;
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
const express = require('express');
const router = express.Router();

/**
 * Serve the main index page after checking that the user is logged in.
 */
router.get('/', ensureLoggedIn('/login'), function(req, res) {
    // This is only called if the user is logged in, otherwise the ensureLoggedIn() call will redirect to login
    res.render('index', { "title": cs.pageTitle(), "user": csp.userName(req), "version": pv });
});

/** Module exports */
module.exports = router;
