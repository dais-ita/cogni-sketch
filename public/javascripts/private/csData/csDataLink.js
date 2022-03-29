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
 * @file Defines the core representation for the link object.
 *
 * @author Dave Braines
 **/

//TODO: Migrate this elsewhere

import {getProject} from "/javascripts/private/state.js";
import {createNewLink as coreCreateNewLink} from "../core/create.js";
import {
    addSessionCanvasSelectionLink,
    getSessionUserName,
    removeSessionCanvasSelectionLink
} from "/javascripts/private/csData/csDataSession.js";
import {warn} from "/javascripts/private/util/log.js";

export function coreCreate(uid, srcNode, tgtNode, linkData, userName) {
    let result;
    let newLink = {
        "uid": uid,
        "created": new Date(),
        "userName": userName,
        "selected": false,
        "sourceRef": srcNode.getUid(),
        "targetRef": tgtNode.getUid(),
        "data": linkData
    };

    if (getProject().getLinkById(uid)) {
        warn(`Creating duplicate link ${newLink.getUid()} has been ignored`);
    } else {
        result = getProject()._addRawLink(newLink, getSessionUserName());
    }

    return result;
}

export function coreCreatePartial(uid, srcNode, userName) {
    let result;
    let newLink = {
        "uid": uid,
        "created": new Date(),
        "userName": userName,
        "selected": false,
        "sourceRef": srcNode.getUid(),
        "targetRef": null,
        "data": {}
    };

    if (getProject().getLinkById(uid)) {
        warn(`Duplicate partial link ${newLink.getUid()} has been ignored`);
    } else {
        result = getProject()._addRawLink(newLink, getSessionUserName(), true);
    }

    return result;
}

export function coreImport(link) {
    let result;

    if (getProject().getLinkById(link.uid)) {
        warn(`Importing - duplicate link ${link.uid} detected`);
    } else {
        result = getProject()._addRawLink(link, link.userName);
    }

    return result;
}

export function select(tgtLink) {
    tgtLink.select();
    addSessionCanvasSelectionLink(tgtLink);
}

export function deselect(tgtLink) {
    tgtLink.deselect();
    removeSessionCanvasSelectionLink(tgtLink);
}

export function getLinkUsingSvg(svgNode) {
    let uid = svgNode.getAttribute('id');

    return getProject().getLinkById(uid);
}

export function createNewLink(srcNode, tgtNode, linkLabel) {
    return coreCreateNewLink(srcNode, tgtNode, linkLabel);
}
