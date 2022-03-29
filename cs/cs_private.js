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
 * @file A collection of server-side functions relating to private server information such as paths and filenames.
 *
 * @author Dave Braines
 **/

const path = require('path');
const fs = require('fs-extra');
const settings = require('../settings');

const EXCLUDES = [ '.DS_Store' ];
const JSON_SUCCESS = { "status": 'SUCCESS' };
const PERM_FN = path.join(getRootPath(), 'data', 'permissions', 'project_permissions.json');

/**
 * Return the root path (folder name on the filesystem) where this application is running.
 *
 * @return {string}     The fully qualified filename of the root path
 */
function getRootPath() {
    return path.join(__dirname, '..');
}

/**
 * Return the userName that is contained in the request session passport object.
 *
 * @param {e.Request} req       The http request object.
 * @return {string}             The name of the user extracted from the request session object.
 */
function userName(req) {
    let result;

    if (req.session.passport) {
        result = req.session.passport.user;
    }

    return result;
}

/**
 * The fully qualified path on the local file system for data relating to the logged in user.
 *
 * @param {e.Request} req       The http request object.
 * @return {string}             The fully qualified local filesystem path.
 */
function getUserPath(req) {
    return path.join(getRootPath(), settings.persist_folder, userName(req));
}

/**
 * The fully qualified path on the local file system for data relating to the specified user.
 *
 * @param {string} userName     The user name for the 'owner' user that is requested.
 * @return {string}             The fully qualified local file system path for this owner.
 */
function getOwnerPath(userName) {
    return path.join(getRootPath(), settings.persist_folder, userName);
}

/**
 * The fully qualified owner or user path on the local file system, depending on which is specified.
 *
 * @param {e.Request} req       The http request object.
 * @return {string}             The fully qualified local file system path for this owner or user.
 */
function getUserOrOwnerPath(req) {
    let resultPath;
    const owner = ownerName(req);

    if (owner) {
        resultPath = getOwnerPath(owner);
    } else {
        resultPath = getUserPath(req);
    }

    return resultPath;
}

/**
 * The fully qualified path on the local file system for the general data path for this application.
 *
 * @return {string}     The fully qualified local file system path.
 */
function getGeneralPath() {
    return path.join(getRootPath(), settings.general_folder);
}

/**
 * The fully qualified path on the local file system for the palette folder, either for the specified
 * 'owner' user, or by default for the logged in user.
 *
 * @param {e.Request} req       The http request object.
 * @param {string} [ownerName]  If specified, this user will be searched for the palette.
 * @return {string}             The fully qualified local file system path.
 */
function getPalettePath(req, ownerName) {
    let userPath;

    if (ownerName) {
        userPath = getOwnerPath(ownerName);
    } else {
        userPath = getUserPath(req);
    }

    return path.join(userPath, settings.palette_folder);
}

/**
 * The fully qualified path on the local file system for the specified project, either for the specified
 * 'owner' user, or by default for the logged in user.
 *
 * By default the project name in the request url parameter will be used, but a manual project name can be
 * specified as a parameter if needed.
 *
 * @param {e.Request} req           The http request object.
 * @param {string} [projName]       The optional manually specified name of the project.
 * @param {string} [ownerName]      If specified, this user will be searched for the project.
 * @return {string}                 The fully qualified local file system path.
 */
function getProjectPath(req, projName, ownerName) {
    let projPath;

    if (ownerName) {
        projPath = getOwnerPath(ownerName);
    } else {
        projPath = getUserPath(req);
    }

    return path.join(projPath, (projName || projectName(req)));
}

/**
 * Get the project name url parameter from the incoming http request.
 *
 * @param {e.Request} req       The http request object.
 * @return {string}             The project name.
 */
function projectName(req) {
    return req.params['proj'];
}

/**
 * Get the palette name url parameter from the incoming http request.
 *
 * @param {e.Request} req       The http request object.
 * @return {string}             The palette name.
 */
function paletteName(req) {
    return req.params['pal'];
}

/**
 * Get the owner name query parameter from the incoming http request.
 *
 * @param {e.Request} req       The http request object.
 * @return {string}             The owner name.
 */
function ownerName(req) {
    return req.query['owner'];
}

/**
 * Get the named http url parameter value from the incoming http request.
 *
 * @param {e.Request} req       The http request object.
 * @param {string} paramName    The url parameter name to be used.
 * @return {string}             The url parameter value.
 */
function getParameter(req, paramName) {
    return req.params[paramName];
}

/**
 * Get the named http query parameter value from the incoming http request.
 *
 * @param {e.Request} req       The http request object.
 * @param {string} paramName    The query parameter name to be used.
 * @return {string}             The query parameter value.
 */
function getQueryParameter(req, paramName) {
    return req.query[paramName];
}

/**
 * Compute the full cache file name based on the specified cache type.
 *
 * @param {string} cacheType        The type of data being cached.
 * @return {string}                 The fully qualified local filename.
 */
function cacheName(cacheType) {
    return path.join(getRootPath(), 'data', 'cache', `${cacheType}.json`);
}

/**
 * Read the cache file (if present) for the specified cache type.  If the file is not present no error is reported.
 *
 * @param {string} cacheType        The type of data being cached.
 * @return {object}                 The data retrieved from the cache, or an empty object if no cache file was found.
 */
function readCache(cacheType) {
    const fn = cacheName(cacheType);
    let result;

    try {
        const fc = fs.readFileSync(fn, settings.codepage);
        result = JSON.parse(fc);
    } catch(e) {
        // File does not exist - no error needs to be reported as this is common
        result = {};
    }

    return result;
}

/**
 * Write the specified object to the cache file, based on the cache type which is used in the file name.
 * The object is simply appended to the cache file without any extra checking.
 *
 * @param {string} cacheType        The type of data being cached.
 * @param {object} cacheContents    The object to be written to the cache file.
 */
function writeCache(cacheType, cacheContents) {
    const fn = cacheName(cacheType);

    fs.writeFileSync(fn, JSON.stringify(cacheContents, null, 2));
}

/**
 * Indicate whether the logged in user has permission to access the specified project.  The type of access that is
 * required is also specified.
 *
 * @param {e.Request} req           The http request object.
 * @param {string} targetPerm       The permission that is requested.
 * @return {boolean}                Whether the permission is granted.
 */
function isSharedAccessAuthorised(req, targetPerm) {
    let authorised = false;
    let owner = ownerName(req);
    let project = projectName(req);
    let user = userName(req);

    const fc = fs.readFileSync(PERM_FN, settings.codepage);
    let perms = JSON.parse(fc);

    // Iterate through each of the permissions, checking for access
    for (let projPerm of perms) {
        // Not already authorised
        if (!authorised) {
            // Owner, user and project match
            if ((projPerm.owner === owner) && (projPerm.granted === user) && (projPerm.project === project)) {
                // The type of permission requested also matches
                if (projPerm.permissions.indexOf(targetPerm) > -1) {
                    authorised = true;
                }
            }
        }
    }

    return authorised;
}

/**
 * Check whether the specified file name is excluded (by comparing against a pre-defined list).
 *
 * @param {string} fileName     The file name to be checked.
 * @return {boolean}            Whether the file name is excluded.
 */
function isExcluded(fileName) {
    return EXCLUDES.indexOf(fileName) !== -1;
}

/**
 * Indicates whether this request is for a local project (no owner is specified).
 *
 * @param {e.Request} req       The http request object.
 * @return {boolean}            Whether the request is local.
 */
function isLocalProject(req) {
    let oName = ownerName(req);
    let uName = userName(req);

    return !oName || (oName === uName);
}

/** Module exports */
module.exports = Object.freeze({
    "JSON_SUCCESS": JSON_SUCCESS,
    "getRootPath": getRootPath,
    "getGeneralPath": getGeneralPath,
    "userName": userName,
    "getUserPath": getUserPath,
    "getOwnerPath": getOwnerPath,
    "getUserOrOwnerPath": getUserOrOwnerPath,
    "getPalettePath": getPalettePath,
    "getProjectPath": getProjectPath,
    "paletteName": paletteName,
    "projectName": projectName,
    "ownerName": ownerName,
    "getParameter": getParameter,
    "getQueryParameter": getQueryParameter,
    "readCache": readCache,
    "writeCache": writeCache,
    "isSharedAccessAuthorised": isSharedAccessAuthorised,
    "isExcluded": isExcluded,
    "isLocalProject": isLocalProject
});
