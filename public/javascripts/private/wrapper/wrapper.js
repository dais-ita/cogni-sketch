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
 * @file Functions that define general wrapper capabilities, enabling the wrapped objects for the different types
 * of application object to be created.
 *
 * @author Dave Braines
 **/

import {create as createProject} from './wProject.js';
import {create as createType} from './wType.js';
import {getSessionUserName} from "/javascripts/private/csData/csDataSession.js";
import {sendProjectChangedEvent, sendTypeChangedEvent} from "../ui/tabs.js";

export const EXPANDED_COLLAPSED = 0;
export const EXPANDED_CUSTOM = 1;
export const EXPANDED_TABLE = 2;

export const PROP_TYPE_JSON = 'json';
export const PROP_TYPE_NORMAL = 'normal';
export const PROP_TYPE_TEXT = 'long text';

export const DEFAULT_PROP_TYPE = PROP_TYPE_NORMAL;

/**
 * Create a new project instance with the specified values.
 *
 * @param {string} projectName      The name of the project.
 * @param {string} paletteName      The name of the palette.
 * @param {csViewBox} vb            The starting viewBox for the project.
 * @return {csProject}
 */
export function createNewProject(projectName, paletteName, vb) {
    let rawProject = /** @type {csRawProject} */ {
        "project": projectName,
        "paletteName": paletteName,
        "general": {
            "uid": 1,
            "viewBox": vb
        }
    };

    let project = createProject(rawProject, getSessionUserName());

    sendProjectChangedEvent({ "project": /** @type {csProject} */ project, "change": 'create' });

    return project;
}

/**
 * Create a wrapped project instance from the raw (serialized) form of the project.
 *
 * @param {csRawProject} rawProject     the raw (serialized) form of the project to be created.
 * @return {csProject}
 */
export function recreateProject(rawProject) {
    let project =  createProject(rawProject, getSessionUserName());

    sendProjectChangedEvent({ "project": /** @type {csProject} */ project, "change": 'recreate' });

    return project;
}

/**
 * Create a new palette item with the specified name.
 *
 * @param typeName          The name of this new palette item.
 * @return {csType}
 */
export function createNewType(typeName) {
    let rawType = /** @type {csRawType} */ {
        "id": typeName
    };

    let newType = createType(rawType);

    sendTypeChangedEvent({ "type": /** @type {csType} */ newType, "change": 'create' });

    return newType;
}
