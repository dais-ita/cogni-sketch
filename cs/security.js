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
 * @file A collection of server-side functions relating to the processing of security related requests and users.
 *
 * @author Dave Braines
 **/

const path = require('path');
const fs = require('fs-extra');
const settings = require('../settings');
const csp = require('./cs_private');
const log = require('./log');
const bcrypt = require('bcrypt');

const USERS_FN = path.join(csp.getRootPath(), 'data', 'users', 'users.json');
const SAVES_FN = path.join(csp.getRootPath(), 'data', 'saves');

/**
 * Indicates whether any user is currently logged in.
 *
 * @param {e.Request} req       The http request object.
 * @return {boolean}            Whether any user is logged in.
 */
function isLoggedIn(req) {
    return !!csp.userName(req);
}

/**
 * Indicates whether the currently logged in user is an administrator.
 *
 * @param {e.Request} req       The http request object.
 * @return {boolean}            Whether any user is an administrator.
 */
function isAdmin(req) {
    let result = false;
    let un = csp.userName(req);

    let users = listUsers();

    if (un && users[un]) {
        result = users[un].isAdmin;
    }

    return result;
}

/**
 * Read the global users file and return all users contained in this file.  Also check the file system for any user
 * folders that exist which do not correspond to users in the global file, and add these as 'ghost' users.
 *
 * @return {object[]}       The list of all users.
 */
function listUsers() {
    let users = JSON.parse(fs.readFileSync(USERS_FN, settings.codepage));

    findGhostUsers(users);

    return users;
}

/**
 * Check the data folder for any sub-folders that do not correspond to any known users in the master user file.
 * These are 'ghost' users and are added to the user list that is passed in.
 *
 * @param {object[]} users      The list of all existing non-ghost users.
 */
function findGhostUsers(users) {
    let existingUserNames = Object.keys(users);

    try {
        let fList = fs.readdirSync(SAVES_FN);

        for (let userName of fList) {
          if (!csp.isExcluded(userName)) {
               if (existingUserNames.indexOf(userName) === -1) {
                   users[userName] = createUser(userName, undefined, undefined, true);
               }
          }
        }
    } catch (e) {
        log.error('messages.security.no_folder', { "folder": SAVES_FN });
    }
}

/**
 * Save the list of users to the master user file.
 *
 * @param {object[]} users      The list of all users to be saved.
 */
function saveUsers(users) {
    fs.writeFileSync(USERS_FN, JSON.stringify(users, null, 2));
}

/**
 * Create a new user in the application.  Using the specified userName and password, create a new folder and
 * sub-folders to contain projects and palettes, and add the new user to the users file.
 *
 * @param {string} userName     The name of the user (which is used to login).
 * @param {string} password     The plaintext password, which is encrypted and stored as a bcrypt hash.
 * @param {boolean} isAdmin     Whether this user is an administrator.
 * @return {object}             The newly created user object.
 */
function addUser(userName, password, isAdmin) {
    let users = listUsers();
    let result = {};

    if (userName) {
        if (password && password.length >= settings.security.min_password_length) {
            let lcUserName = userName.toLowerCase();

            if (!users[lcUserName]) {
                const hash = bcrypt.hashSync(password, settings.security.salt_rounds);

                users[lcUserName] = createUser(lcUserName, hash, isAdmin)

                saveUsers(users);   // Save all the users to the file, rather than just adding the new one

                result.userName = userName;
            } else {
                result.error = log.error('messages.security.user_exists', { "userName": lcUserName, "type": 'addUser' });
            }
        } else {
            result.error = log.error('messages.security.insecure_password', { "type": 'addUser', "length": settings.security.min_password_length });
        }
    } else {
        result.error = log.error('messages.security.no_username', { "type": 'addUser' });
    }

    return result;
}

/**
 * Create a new user object.
 *
 * @param {string} userName     The name of the user (which is used to login).
 * @param {string} [hash]       The optional bcrypt hash for the password.
 * @param {boolean} isAdmin     Whether this user is an administrator.
 * @param isGhost               Whether this user is a ghost user.
 * @return {object}             The newly created user object.
 */
function createUser(userName, hash, isAdmin, isGhost) {
    let user = { "name": userName };

    if (hash) {
        user.password = hash;
    }

    if (isAdmin) {
        user.isAdmin = true;
    }

    if (isGhost) {
        user.isGhost = true;
    }

    return user;
}

/**
 * Change the password for the specified user, saving the bcrypt hash of the new password to the master user file.
 *
 * @param {string} userName     The name of the user (which is used to login).
 * @param {string} password     The plaintext password, which is encrypted and stored as a bcrypt hash.
 * @return {object}             The user object which had the password changed.
 */
function changePassword(userName, password) {
    let users = listUsers();
    let result = {};

    if (userName) {
        if (password && password.length >= settings.security.min_password_length) {
            let lcUserName = userName.toLowerCase();
            let user = users[lcUserName];

            if (user) {
                user.password = bcrypt.hashSync(password, settings.security.salt_rounds);

                saveUsers(users);

                result.userName = userName;
            } else {
                result.error = log.error('messages.security.invalid_user', { "userName": lcUserName, "type": 'changePassword' });
            }
        } else {
            result.error = log.error('messages.security.insecure_password', { "type": 'changePassword', "length": settings.security.min_password_length });
        }
    } else {
        result.error = log.error('messages.security.no_username', { "type": 'changePassword' });
    }

    return result;
}

/**
 * Check the password for the specified user.
 *
 * @param {string} userName     The name of the user (which is used to login).
 * @param {string} password     The plaintext password, which is encrypted and stored as a bcrypt hash.
 * @return {boolean}            Whether the specific password matched.
 */
function checkPassword(userName, password) {
    let users = listUsers();
    let user = users[userName];
    let result = bcrypt.compareSync(password, user.password);

    return result;
}

/**
 * Set the disabled user with the specified user name to be enabled.
 *
 * @param {string} userName     The name of the user.
 * @return {object}             The user object for this user name.
 */
function enableUser(userName) {
    return switchDisabledState(userName, false);
}

/**
 * Set the enabled user with the specified user name to be disabled.
 *
 * @param {string} userName     The name of the user.
 * @return {object}             The user object for this user name.
 */
function disableUser(userName) {
    return switchDisabledState(userName, true);
}

/**
 * Flip the enabled/disabled state of the user with the specified user name and save the master user file.
 *
 * @param {string} userName     The name of the user.
 * @param {boolean} state       Whether the user is to be disabled (true) or enabled (false).
 * @return {object}             The user object for this user name.
 */
function switchDisabledState(userName, state) {
    let users = listUsers();
    let result = {};

    if (userName) {
        let lcUserName = userName.toLowerCase();
        let user = users[lcUserName];

        if (user) {
            if (state) {
                user.disabled = true;
            } else {
                delete user.disabled;
            }

            saveUsers(users);
            result.userName = userName;
        } else {
            result.error = log.error('messages.security.invalid_user', { "userName": lcUserName, "type": 'switchDisabled' });
        }
    } else {
        result.error = log.error('messages.security.no_username', { "type": 'switchDisabled' });
    }

    return result;
}

/**
 * Set the administrator status of the user with the specified user name and save the master user file.
 *
 * @param {string} userName     The name of the user.
 * @param {boolean} state       Whether the user is an administrator (true) or not (false).
 * @return {object}             The user object for this user name.
 */
function setAdmin(userName, state) {
    let users = listUsers();
    let result = {};

    if (userName) {
        let lcUserName = userName.toLowerCase();
        let user = users[lcUserName];

        if (user) {
            user.isAdmin = state;

            saveUsers(users);
            result.userName = userName;
        } else {
            result.error = log.error('messages.security.invalid_user', { "userName": lcUserName, "type": 'setAdmin' });
        }
    } else {
        result.error = log.error('messages.security.no_username', { "type": 'setAdmin' });
    }

    return result;
}

/** Module exports */
module.exports = Object.freeze({
    "isLoggedIn": isLoggedIn,
    "listUsers": listUsers,
    "addUser": addUser,
    "checkPassword": checkPassword,
    "changePassword": changePassword,
    "enableUser": enableUser,
    "disableUser": disableUser,
    "setAdmin": setAdmin,
    "isAdmin": isAdmin
});
