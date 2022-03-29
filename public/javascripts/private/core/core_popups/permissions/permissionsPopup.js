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
 * @file Functions relating to the permissions popup window.
 * @author Dave Braines
 **/

import {getProject} from "/javascripts/private/state.js";
import {showToast} from "/javascripts/interface/log.js";
import {
    closePopup,
    popupFrom
} from "/javascripts/private/core/core_popups/generalPopup.js";
import {
    mainTemplate,
    permissionTemplate
} from "./templates/permissionTemplates.js";
import {
    httpGet,
    httpPost
} from "/javascripts/private/util/http.js";
import {getSessionUserName} from "/javascripts/private/csData/csDataSession.js";
import {registerConfigEvents} from "/javascripts/private/util/dom.js";

const URL_LIST_PERMS = '/permission/list/';
const URL_LIST_USERS = '/user/list/';
const URL_SAVE = '/permission/save/';

let users = [];
let permissions = [];

/**
 * Create the configuration for this popup window;
 * @return {csTemplateConfig}           the template configuration.
 */
function calculateConfig() {
    let config = {
        "html": {
            "project": getProject().getName(),
            "users": users
        },
        "events": []
    };

    config.html.infoMessage = 'The current permissions for this project are listed.<br>You can delete any of these, or click \'add\' to create a new permission.';

    config.events.push({ "elemId": 'button-save', "event": 'click', "function": savePopup });
    config.events.push({ "elemId": 'button-cancel', "event": 'click', "function": closePopup });
    config.events.push({ "elemId": 'button-add', "event": 'click', "function": addPermission });

    return config;
}

function calculatePermissionConfig(userName, perms) {
    let config = {
        "html": {
            "project": getProject().getName(),
            "user": userName,
            "perms": perms
        },
        "events": []
    };

    config.events.push({ "elemId": `del-${userName}`, "event": 'click', "function": function() { deletePermission(userName); } });

    return config;
}

function addPermission() {
    let eUser = document.getElementById('add-user');
    let ePerm = document.getElementById('add-permission');
    let valid = true;
    let selUser;
    let selPerm;

    if (eUser && ePerm) {
        selUser = eUser.value;
        selPerm = ePerm.value;
    }

    if (selUser && selPerm) {
        for (let perm of permissions) {
            if (perm.granted === selUser) {
                valid = false;
            }
        }

        if (valid) {
            permissions.push({
                "owner": getSessionUserName(),
                "project": getProject().getName(),
                "granted": selUser,
                "permissions": [
                    selPerm
                ]
            });

            updatePermissionsTable(selUser, selPerm);
            clearUser();
        } else {
            showToast('That permission cannot be added as the user already has been granted access.');
        }
    } else {
        showToast('You must select a user first.');
    }
}

function htmlForPermission(parent, userName, permissions) {
    let config = calculatePermissionConfig(userName, permissions);
    let compiled = Handlebars.compile(permissionTemplate);
    let tr = parent.insertRow();

    tr.outerHTML = compiled(config.html);

    registerConfigEvents(config.events);
}

function updatePermissionsTable(userName, permissions) {
    let e = document.getElementById('permissions');

    if (e) {
        htmlForPermission(e, userName, permissions);
    }
}

function clearUser() {
    let eUser = document.getElementById('add-user');

    if (eUser) {
        eUser.value = '';
    }
}

function deletePermission(grantedUser) {
    let elem = document.getElementById(`row-${grantedUser}`);

    if (elem) {
        elem.parentElement.removeChild(elem);
    }

    let newPerms = [];

    for (let perm of permissions) {
        if (perm.granted !== grantedUser) {
            newPerms.push(perm);
        }
    }

    permissions = newPerms;
}

/**
 * Open the permissions popup.
 */
export function openPopup() {
    listPermissions();
}

function listPermissions() {
    let url = URL_LIST_PERMS + getProject().getName();
    httpGet(url, listUsers);
}

function listUsers(response) {
    let url = URL_LIST_USERS;

    permissions = response;

    httpGet(url, doPopup);
}

function doPopup(response) {
    users = [];

    for (let user of response) {
        if (user !== getSessionUserName()) {
            users.push(user);
        }
    }

    popupFrom(`permissions-${getProject().getName()}`, mainTemplate, calculateConfig());

    for (let perm of permissions) {
        updatePermissionsTable(perm.granted, perm.permissions);
    }
}

/**
 * Rename or create the new section if there are no errors preventing it.
 */
function savePopup() {
    httpPost(URL_SAVE + getProject().getName(), callbackSave, JSON.stringify(permissions));

    closePopup();
}

function callbackSave(response) {
    showToast('Permissions have been saved');
    console.log(response);
}
