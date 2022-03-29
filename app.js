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
 * @file The main express definition.
 *
 * @author Dave Braines
 **/

// From local
const cs = require('./cs/cs')(null);
const csp = require('./cs/cs_private');
const sec = require('./cs/security');
const settings = require('./settings');
const plugins = require('./plugins');
const generalCredentials = require('./creds');

// From npm
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const expressSession = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const BasicStrategy = require('passport-http').BasicStrategy;
const fileUpload = require('express-fileupload');
const helmet = require('helmet');   /* security related - remove and secure http headers */
const bcrypt = require('bcrypt');

let app;

function startApp() {
    app = express();

// view engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'pug');

    app.use(bodyParser.text({ "limit": settings.request_body_size_limit }));
    app.use(bodyParser.json({ "limit": settings.request_body_size_limit }));

    app.use(helmet(
        {
            "contentSecurityPolicy": false
        }
    ));

    app.use(cors());
    app.use(expressSession({
        "secret": generalCredentials.secret,
        "resave": false,
        "saveUninitialized": false,
        "cookie": { "sameSite": 'Lax' }
    }));
    app.use(express.json({ "limit": settings.request_body_size_limit }));
    app.use(express.urlencoded({ "extended": false }));
    app.use(fileUpload({ "createParentPath": true }));
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.static('public'));

    csDefinePassport();
    csSetCookies();
    csDefineCoreRoutes();
    csDefineLocaleRoutes();
    csDefineClientLibraryRoutes();
    csDefinePluginRoutes();
    csDefineErrors();

    return app;
}

function csSetCookies() {
    // Set cookies - userName and version, plus any credentials from plugins
    app.use(function (req, res, next) {
        let un = csp.userName(req);

        for (let plugin of plugins.plugins) {
            if (plugin.client_creds) {
                for (let [key, val] of Object.entries(plugin.client_creds)) {
//                    cs.log.debug('messages.general.set_cookie', { "key": key, "pluginName": plugin.name });
                    res.cookie(key, val, { "secure": settings.live });
                }
            }
        }

        res.cookie('userName', un, { "secure": settings.live });

        next();
    });
}

function csDefineCoreRoutes() {
    const iRouter = require('./routes/index');
    const lRouter = require('./routes/login');
    const plRouter = require('./routes/plugin');
    const paRouter = require('./routes/palette');
    const prRouter = require('./routes/project');
    const fRouter = require('./routes/file');
    const imRouter = require('./routes/image');
    const fnRouter = require('./routes/function');
    const hRouter = require('./routes/http');
    const peRouter = require('./routes/permission');
    const uRouter = require('./routes/user');

    app.use('/', iRouter);
    app.use('/login', lRouter);
    app.use('/plugin', plRouter);
    app.use('/palette', paRouter);
    app.use('/project', prRouter);
    app.use('/file', fRouter);
    app.use('/image', imRouter);
    app.use('/images', imRouter);    //Kept in for legacy reasons - old projects saved prior to refactoring
    app.use('/function', fnRouter);
    app.use('/http', hRouter);
    app.use('/permission', peRouter);
    app.use('/user', uRouter);
}

function csDefineLocaleRoutes() {
    // Define routes for internationalization locales
    app.use('/locales', express.static(`${__dirname}/locales`));
}

function csDefineClientLibraryRoutes() {
    // Define routes for 3rd party libraries needed client-side
    app.use('/popper', express.static(`${__dirname}/node_modules/popper.js/dist/umd/`));
    app.use('/scripts/bootstrap', express.static(`${__dirname}/node_modules/bootstrap/dist/`));
    app.use('/jquery', express.static(`${__dirname}/node_modules/jquery/dist/`));
    app.use('/jquery-modal', express.static(`${__dirname}/node_modules/jquery-modal/`));
    app.use('/jquery-ui', express.static(`${__dirname}/node_modules/jquery-ui-dist/`));
    app.use('/d3', express.static(`${__dirname}/node_modules/d3/dist/`));
    app.use('/quill', express.static(`${__dirname}/node_modules/quill/dist/`));
    app.use('/json-viewer', express.static(`${__dirname}/node_modules/jquery.json-viewer/json-viewer/`));
    app.use('/i18next', express.static(`${__dirname}/node_modules/i18next/`));
    app.use('/i18next-http-backend', express.static(`${__dirname}/node_modules/i18next-http-backend/`));
    app.use('/handlebars', express.static(`${__dirname}/node_modules/handlebars/dist/`));
}

function csDefinePluginRoutes() {
    // Dynamically define routes from plugins
    for (let plugin of plugins.plugins) {
        let pluginRoute = `/plugins/${plugin.name}`;
        let pluginLocation = `${__dirname}/plugins/${plugin.name}`;

        cs.log.debug('messages.general.plugin_loaded', {
            "pluginRoute": pluginRoute,
            "pluginLocation": pluginLocation
        });

        app.use(pluginRoute, express.static(pluginLocation));

        if (plugin.imports) {
            for (let imp of plugin.imports) {
                let importRoute = imp.root;
                let importLocation = `${pluginLocation}${imp.path}`;

                cs.log.debug('messages.general.plugin_import', {
                    "importRoute": importRoute,
                    "importLocation": importLocation
                });

                app.use(importRoute, express.static(importLocation));
            }
        }

        if (plugin.routes) {
            for (let route of plugin.routes) {
                let routeRoot = route.root;
                let routePath = `${pluginLocation}/routes/${route.path}`;

                app.use(routeRoot, require(routePath));
            }
        }
    }
}

function csDefinePassport() {
    // Passport initialisation
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(function(req, res, next) {
        csPassportBasic(req, res, next);
    });

    // Create passport local strategy
    passport.use('local', new LocalStrategy(
        function(username, password, done) {
            passportCredentials('local', username, password, done);
        })
    );

    // Create passport basic strategy
    passport.use('basic', new BasicStrategy(
        function(username, password, done) {
            passportCredentials('basic', username, password, done);
        })
    );

    passport.serializeUser(function(user, done) { csSerializeUser(user, done); });
    passport.deserializeUser(function(id, done) { csDeserializeUser(id, done); });

    app.get('/logout', function(req, res){
        let un = csp.userName(req);

        req.logout();
        cs.log.debug('messages.security.logged_off', { "userId":  un });

        res.redirect('/');
    });
}

function csSerializeUser(user, done) {
    cs.log.debug('messages.security.logged_on', { "userId": user.id });

    done(null, user.id);
}

function csDeserializeUser(id, done) {
    done(null, { "id": id });
}

function csPassportBasic(req, res, next) {
    passport.authenticate('basic', {}, function(err, user) {
        if (err) { return next(err) }

        if (user) {
            req.session.passport = {};
            req.session.passport.user = user.id;
        }

        next();
    })(req, res, next);
}

function passportCredentials(strategyName, username, password, done) {
    let lcu = username.trim().toLowerCase();
    let result;
    let users = sec.listUsers();
    let user = users[lcu];

    if (username) {
        if (user) {
            if (!user.disabled) {
                let res = bcrypt.compareSync(password, users[lcu].password);

                if (res) {
                    //success - return user
                    result = done(null, { "name": username, "id": username});
                } else {
                    //failure - invalid password
                    let msgText = cs.log.warn('messages.security.invalid_password', { "userId": username });
                    result = done(null, false, { "message": msgText });
                }
            } else {
                //failure - disabled user
                let msgText = cs.log.warn('messages.security.account_disabled', { "userId": username });
                result = done(null, false, { "message": msgText });
            }
        } else {
            //failure - invalid user
            let msgText = cs.log.debug('messages.security.user_invalid', { "userId": username });
            result = done(null, false, { "message":  msgText });
        }
    }

    return result;
}

function csDefineErrors() {
    // Catch 404 and forward to error handler
    app.use(function(req, res, next) {
        console.error(`404 url: ${req.originalUrl}`); //TODO: Report this properly
        next(createError(404));
    });
}

/** Module exports */
module.exports = {
    "startApp": startApp
};
