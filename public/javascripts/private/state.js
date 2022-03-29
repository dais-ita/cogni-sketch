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
 * @file Contains the instantiated project and palette objects, as well as the transient session object, and
 * accessor functions related to all of these.
 *
 * Session accessor functions are expected to be accessed from the csDataSession.js file which is a convenient
 * wrapper for commonly used session functions.  The user can also use the session for any name/value pairs via
 * the interface functions defined in interface.js.
 *
 * This file must be imported entirely rather than just specific functions, due to the local variables.
 *
 * @author Dave Braines
 **/

import {settings} from "/javascripts/private/core/core_settings.js";
import {error} from "/javascripts/private/util/log.js";

let session = {};
let project;
let palette;

/**
 * Get the specified settings value for the given key within the specified component (section).
 *
 * @param {string} component    the component (section) within the settings in which to save the value.
 * @param {string} key          the key against which to save the value.
 * @returns {*}                 the value found for the specified key, or null if not found.
 */
export function getSetting(component, key) {
    let result;
    /* foundResult is a specific boolean to be set when the setting is found.  This is because some settings may
       be false or other non-truthy values, so simply testing 'result' later is not adequate. */
    let foundResult = false;

    if (settings && settings[component]) {
        result = settings[component][key];
        foundResult = true;
    }

    if (!foundResult) {
        error(`Settings value was not found for '${component}' using '${key}'`);
    }

    return result;
}

/**
 * Get the session value for the specified group and key.
 *
 * @param {string} group    the group within which to seek the value.
 * @param {string} [key]    the optional key for the required value.
 * @returns {*}             the value found for the group and key (if any).
 */
export function getSessionValue(group, key) {
    let result;

    if (session && session[group]) {
        if (key) {
            result = session[group][key];
        } else {
            result = session[group];
        }
    }

    return result;
}

/**
 * Set the session value for the specified group and key.  The group will be created if it does not already exist.
 *
 * @param {string} group    the group within which to set the value.
 * @param {string} key      the key to be used to store the value.
 * @param {*} value         the value to be stored.
 */
export function setSessionValue(group, key, value) {
    if (session) {
        if (!session[group]) {
            session[group] = {};
        }

        session[group][key] = value;
    }
}

/**
 * Add the specified value as a named element within the specified group and key. The group and key objects will be
 * created if they do not already exist.
 *
 * @param {string} group    the group within which to set the value.
 * @param {string} key      the outer key to be used to store the value.
 * @param {string} id       the inner key to be used to store the value within the object returned at key.
 * @param {*} value         the value to be stored.
 */
export function addSessionValue(group, key, id, value) {
    if (!session[group]) {
        session[group] = {};
    }

    if (!session[group][key]) {
        session[group][key] = {};
    }

    session[group][key][id] = value;
}

/**
 * Remove the session value for the specified group and key.  If no key is specified then the whole group is removed.
 *
 * @param {string} group    the group within which to remove the key, or which will be removed if no key is specified.
 * @param {string} [key]    the key to remove.
 */
export function removeSessionValue(group, key) {
    if (session && session[group]) {
        if (key) {
            /* remove the key */
            delete session[group][key];
        } else {
            /* no key is specified, remove the whole group */
            delete session[group];
        }
    }
}

/**
 * Return the currently loaded project.
 *
 * @returns {csProject}     the currently loaded project.
 */
export function getProject() {
    return project;
}

/**
 * Change the currently loaded project.
 *
 * @param {csProject} thisProject       the project to be stored.
 */
export function setProject(thisProject) {
    project = thisProject;
}

/**
 * Return the currently loaded palette.
 *
 * @returns {csPalette}         the currently loaded palette.
 */
export function getPalette() {
    let result;

    if (project) {
        result = project.getPalette();
    } else {
        result = palette;
    }

    return result;
}

/**
 * Set the palette - this is only done when there is no project against which the palette can be set.
 *
 * @param {csPalette} thisPalette     the palette to be stored.
 */
export function setPalette(thisPalette) {
    palette = thisPalette;
}
