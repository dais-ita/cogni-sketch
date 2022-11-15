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
 * @file Functions defining the 'user' drop down menu.
 *
 * @author Dave Braines
 **/

import { registerClickEvent } from "/javascripts/private/util/dom.js";
import {showToast, userConfirm, userPrompt} from "/javascripts/interface/log.js";
import {httpPostJson} from "/javascripts/private/util/http.js";
import {getSessionUserName} from "/javascripts/private/csData/csDataSession.js";

const ELEM_CHANGE_PASSWORD = 'cs-change-password';
const ELEM_LOGOUT = 'cs-logout';

const URL_CHECK_PASSWORD = '/user/checkPassword';
const URL_CHANGE_PASSWORD = '/user/changePassword';

export function initialise() {
    registerEventHandlers();
}

function registerEventHandlers() {
    registerClickEvent(ELEM_CHANGE_PASSWORD, function() {
        let un = getSessionUserName();

        actionChangePassword(un);
    });
    registerClickEvent(ELEM_LOGOUT, actionLogout);
}

function actionLogout() {
    window.location.href = './logout';
}

export function actionChangePassword(userName, params) {
    if (!params || !params.oldPassword) {
        if (userConfirm(`Are you sure you want to change the password for ${userName}?`)) {
            let oldPassword = userPrompt(`Please enter the existing password for ${userName}`);

            if (oldPassword) {
                let creds = {"userName": userName, "password": oldPassword};
                httpPostJson(URL_CHECK_PASSWORD, cbCheckPassword, creds, creds);
            } else {
                showToast('You did not enter your existing password');
            }
        }
    } else {
        params.newPassword = userPrompt(`Please enter the new password for ${userName}`);

        if (params.newPassword) {
            httpPostJson(URL_CHANGE_PASSWORD, cbChangePassword, params);
        } else {
            showToast('You did not enter a new password');
        }
    }
}

function cbCheckPassword(response, params) {
    if (response.error) {
        showToast(`You did not enter the correct existing password for ${response.userName}`);
    } else {
        let newCreds = { "userName": params.userName, "oldPassword": params.password };

        actionChangePassword(params.userName, newCreds);
    }
}

function cbChangePassword(response) {
    if (response.error) {
        showToast(`User password was not changed for ${response.userName}: ${response.error}`);
    } else {
        showToast(`Password has been changed for ${response.userName}`);
    }
}
