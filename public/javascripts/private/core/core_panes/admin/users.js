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
 * @file Functions relating to the rendering of the main users pane.
 * This pane is shown only to administrator users.
 *
 * @author Dave Braines
 **/

import {
    httpGet,
    httpPost,
    httpPostZip,
    saveZipFile
} from "../../../util/http.js";
import {
    createHtmlUsing,
    getSelectedValue,
    setValue
} from "../../../util/dom.js";
import {usersTemplate} from "./templates/adminTemplate.js";
import {
    showToast,
    userPrompt,
    userConfirm
} from "../../../../interface/log.js";
import {formatDateTime} from "../../../../interface/util.js";
import {actionChangePassword} from "/javascripts/private/ui/user.js";

const ELEM_CS_MAIN = 'cs-admin-row-users';
const ELEM_COUNT = 'cs-users-count';
const ELEM_PROJ_COUNT = 'cs-users-project-action-count-';
const ELEM_CREATE = 'cs-users-create-user';
const ELEM_REFRESH = 'cs-users-refresh-list';
const ELEM_USER_STATUS = 'cs-user-status-';
const ELEM_USER_INIT = 'cs-users-initialise-user-';
const ELEM_USER_PASSWORD = 'cs-users-change-password-';
const ELEM_USER_ENABLE = 'cs-users-enable-user-';
const ELEM_USER_DISABLE = 'cs-users-disable-user-';
const ELEM_USER_GRANT = 'cs-users-grant-admin-';
const ELEM_USER_REVOKE = 'cs-users-revoke-admin-';
const ELEM_PROJ_REFRESH = 'cs-users-project-refresh-';
const ELEM_PROJ_CLEAR = 'cs-users-project-clear-actions-';
const ELEM_PROJ_LIST = 'cs-users-project-list-';
const ELEM_PROJ_EXPORT = 'cs-users-project-export-';

const IMG_URL_ACTIVE = '/images/cs/icon-status-online.svg';
const IMG_URL_INACTIVE = '/images/cs/icon-status-offline.svg';

const URL_LIST_USERS = '/user/list?fullDetails=true';
const URL_USER_DETAILS = '/user/details';
const URL_CREATE_USER = '/user/add';
const URL_INIT_USER = '/user/initialise';
const URL_ENABLE_USER = '/user/enable';
const URL_DISABLE_USER = '/user/disable';
const URL_SET_ADMIN = '/user/setAdmin';
const URL_COUNT_ACTIONS = '/project/countActions';
const URL_CLEAR_ACTIONS = '/project/clearActions';
const URL_PROJ_EXPORT = '/project/export';

/**
 * Render the user details for this section.
 */
export function render() {
    httpGet(URL_LIST_USERS, cbListUsers);
}

function cbListUsers(response) {
    let elem = document.getElementById(ELEM_CS_MAIN);
    let users = [];

    for (let user of response) {
        user.paletteCount = user.palettes.length;
        user.projectCount = user.projects.length;

        users.push(user);

        if (user.paletteCount === 0) {
            user.notInitialised = true;
        }

        if (user.isAdmin) {
            user.status = 'admin';
        } else {
            if (user.isGhost) {
                user.status = 'ghost';
            } else {
                user.status = 'normal';
            }
        }

        if (user.disabled) {
            user.status += ' (disabled)';
        }

        if (user.currentUser) {
            user.status += ' (logged in)';
        }
    }

    if (elem) {
        createHtmlUsing(elem, usersTemplate, createConfigForUsersSection(users));
    }

    //Update the user count
    let countElem = document.getElementById(ELEM_COUNT);

    if (countElem) {
        countElem.innerHTML = response.length;
    }

    // Now send a request to count the actions for each users first project
    for (let user of response) {
        actionChangedProject(user);
    }
}

/**
 * Create the configuration for this users section.
 *
 * @return {csTemplateConfig}       the template configuration.
 */
function createConfigForUsersSection(users) {
    let config = {
        "html": {
            "users": users
        },
        "events": []
    };

    config.events.push({ 'elemId': ELEM_CREATE, 'event': 'click', 'function': actionCreateUser });
    config.events.push({ 'elemId': ELEM_REFRESH, 'event': 'click', 'function': render });

    for (let user of users) {
        config.events.push({ 'elemId': `${ELEM_PROJ_REFRESH}${user.name}`, 'event': 'click', 'function': function() { actionRefreshUserRow(user); } });
        config.events.push({ 'elemId': `${ELEM_PROJ_CLEAR}${user.name}`, 'event': 'click', 'function': function() { actionClearActions(user); } });
        config.events.push({ 'elemId': `${ELEM_PROJ_LIST}${user.name}`, 'event': 'change', 'function': function() { actionChangedProject(user); } });
        config.events.push({ 'elemId': `${ELEM_USER_PASSWORD}${user.name}`, 'event': 'click', 'function': function() {
            actionChangePassword(user.name, { "userName": user.name, "oldPassword": 'n/a' });
        }});
        config.events.push({ 'elemId': `${ELEM_PROJ_EXPORT}${user.name}`, 'event': 'click', 'function': function() { actionExportProject(user); } });

        if (user.notInitialised) {
            config.events.push({ 'elemId': `${ELEM_USER_INIT}${user.name}`, 'event': 'click', 'function': function() { actionInitialiseUser(user); } });
        }

        if (user.disabled) {
            config.events.push({ 'elemId': `${ELEM_USER_ENABLE}${user.name}`, 'event': 'click', 'function': function() { actionEnableUser(user); } });
        } else {
            config.events.push({ 'elemId': `${ELEM_USER_DISABLE}${user.name}`, 'event': 'click', 'function': function() { actionDisableUser(user); } });
        }

        if (user.isAdmin) {
            config.events.push({ 'elemId': `${ELEM_USER_REVOKE}${user.name}`, 'event': 'click', 'function': function() { actionRevokeAdmin(user); } });
        } else {
            config.events.push({ 'elemId': `${ELEM_USER_GRANT}${user.name}`, 'event': 'click', 'function': function() { actionGrantAdmin(user); } });
        }
    }

    return config;
}

function actionExportProject(user) {
    let selProjectName = getSelectedValue(`${ELEM_PROJ_LIST}${user.name}`)
    let url = `${URL_PROJ_EXPORT}/${selProjectName}?owner=${user.name}`;

    httpPostZip(url, cbExportProject, null, { "user": user, "projName": selProjectName });
}

function cbExportProject(response, params) {
    saveZipFile(response);

    showToast(`The project '${params.projName}' for user '${params.user.name}' will be downloaded`);
}

function actionCreateUser() {
    let userName = userPrompt('Please enter the name for this user');

    if (userName === null) {
        //The user pressed cancel
    } else {
        if (userName && userName.trim()) {
            let password = userPrompt('Please enter the password for this user');

            if (password) {
                let url = `${URL_CREATE_USER}/${userName.toLowerCase()}?password=${password}`;
                httpPost(url, cbCreateUser, '');
            } else {
                showToast('You must enter a password to create a user');
            }
        } else {
            showToast('You must enter a username to create a user');
        }
    }
}

function cbCreateUser(response) {
    if (response.error) {
        showToast(`User was not created: ${response.error}`);
    } else {
        showToast(`User '${response.userName}' has been created`);
        redrawUserList();
    }
}

function redrawUserList() {
    render();
}

function actionInitialiseUser(user) {
    if (userConfirm('Are you sure you want to initialise this user (by copying the starting palettes and projects)?')) {
        let url = `${URL_INIT_USER}/${user.name}`;

        httpPost(url, cbInitialiseUser, '');
    }
}

function cbInitialiseUser(response) {
    if (response.error) {
        showToast(`User was not initialised: ${response.error}`);
    } else {
        showToast(`User '${response.userName}' has been initialised`);
        redrawUserList();
    }
}

function actionEnableUser(user) {
    if (userConfirm('Are you sure you want to enable this user?')) {
        let url = `${URL_ENABLE_USER}/${user.name}`;

        httpPost(url, cbEnableUser, '');
    }
}

function cbEnableUser(response) {
    if (response.error) {
        showToast(`User was not enabled: ${response.error}`);
    } else {
        showToast(`User '${response.userName}' has been enabled`);
        redrawUserList();
    }
}

function actionDisableUser(user) {
    if (userConfirm('Are you sure you want to disable this user?')) {
        let url = `${URL_DISABLE_USER}/${user.name}`;

        httpPost(url, cbDisableUser, '');
    }
}

function actionGrantAdmin(user) {
    if (userConfirm('Are you sure you grant admin privileges to this user?')) {
        let url = `${URL_SET_ADMIN}/${user.name}?state=true`;

        httpPost(url, cbGrantAdmin, '');
    }
}

function cbGrantAdmin(response) {
    if (response.error) {
        showToast(`User was not granted admin privileges: ${response.error}`);
    } else {
        showToast(`User '${response.userName}' has been granted admin privileges`);
        redrawUserList();
    }
}

function actionRevokeAdmin(user) {
    if (userConfirm('Are you sure you revoke admin privileges for this user?')) {
        let url = `${URL_SET_ADMIN}/${user.name}?state=true`;

        httpPost(url, cbRevokeAdmin, '');
    }
}

function cbRevokeAdmin(response) {
    if (response.error) {
        showToast(`User was not revoked admin privileges: ${response.error}`);
    } else {
        showToast(`User '${response.userName}' has had admin privileges revoked`);
        redrawUserList();
    }
}

function cbDisableUser(response) {
    if (response.error) {
        showToast(`User was not disabled: ${response.error}`);
    } else {
        showToast(`User '${response.userName}' has been disabled`);
        redrawUserList();
    }
}

function actionRefreshUserRow(user) {
    let url = `${URL_USER_DETAILS}/${user.name}`;

    httpGet(url, render, { "user": user });
}

function actionClearActions(user) {
    let selProjectName = getSelectedValue(`${ELEM_PROJ_LIST}${user.name}`)

    if (userConfirm(`Are you sure you want to clear the actions for ${user.name} project named '${selProjectName}'?`)) {
        let url = `${URL_CLEAR_ACTIONS}/${selProjectName}?owner=${user.name}`;
        httpPost(url, cbClearActions, '', { "user": user, "projName": selProjectName });
    }
}

function actionChangedProject(user) {
    let selProjectName = getSelectedValue(`${ELEM_PROJ_LIST}${user.name}`);

    if (selProjectName) {
        let url = `${URL_COUNT_ACTIONS}/${selProjectName}?owner=${user.name}`;

        httpGet(url, cbCountActions, { "user": user });
    }
}

function cbCountActions(response, params) {
    updateUserStatusIcon(response, params);

    setValue(`${ELEM_PROJ_COUNT}${params.user.name}`, response.count);
}

function updateUserStatusIcon(response, params) {
    let elem = document.getElementById(`${ELEM_USER_STATUS}${params.user.name}`);
    let altText;
    let imgUrl;

    if (response.delta) {
        if (response.delta < 300) {
            if (response.delta < 5) {
                altText = 'active now';
            } else if (response.delta < 60) {
                altText = 'active in the last minute';
            } else if (response.delta < 180) {
                altText = 'active in the last few minutes';
            } else {
                altText = 'active in the last five minutes';
            }

            imgUrl = IMG_URL_ACTIVE;
        } else {
            let lastDate = new Date(response.lastAction);

            altText = `Last active on ${formatDateTime(lastDate)}`;
            imgUrl = IMG_URL_INACTIVE;
        }
    } else {
        altText = 'No activity detected';
        imgUrl = IMG_URL_INACTIVE;
    }

    elem.setAttribute('src', imgUrl);
    elem.setAttribute('title', altText);
}

function cbClearActions(response, params) {
    setValue(`${ELEM_PROJ_COUNT}${params.user.name}`, 0);
}
