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
 * @file Defines the core representation for the node object.
 *
 * @author Dave Braines
 **/

//TODO: Migrate this elsewhere

import {
    getPalette,
    getProject
} from "/javascripts/private/state.js";

import {warn} from "/javascripts/private/util/log.js";
import {setOntoEmptyIcon} from "/javascripts/private/csData/csDataCanvas.js";
import {duplicateNode as coreDuplicateNode} from "/javascripts/private/core/create.js";
import {
    addSessionCanvasSelectionNode,
    getSessionUserName,
    removeSessionCanvasSelectionNode
} from "/javascripts/private/csData/csDataSession.js";
import {hideNodeAndLinks, refreshNode} from "/javascripts/private/core/graphics.js";
import {EXPANDED_CUSTOM} from "/javascripts/private/wrapper/wrapper.js";
import {doCanHandle} from "/javascripts/private/core/hooks.js";

const MODE_EMPTY = 'empty';
const MODE_FULL = 'full';
const MODE_SPECIAL = 'special';

export function coreCreateEmpty(uid, type, coords) {
    return coreCreate(uid, type, coords, MODE_EMPTY, getSessionUserName());
}

export function coreCreateFull(uid, type, coords) {
    return coreCreate(uid, type, coords, MODE_FULL, getSessionUserName());
}

export function coreCreateSpecial(uid, type, coords) {
    return coreCreate(uid, type, coords, MODE_SPECIAL, getSessionUserName());
}

function coreCreate(uid, type, coords, mode, userName) {
    let result;
    let newNode = {
        "uid": uid,
        "created": new Date(),
        "userName": userName,
        "expanded": EXPANDED_CUSTOM,
        "selected": false,
        "hide": false,
        "showType": type.getSettings().getDefaultShowType(),
        "linkRefs": [],
        "mode": mode,
        "pos": coords,
        "data": {}
    };

    if (getProject().getNodeById(uid)) {
        warn(`Creating duplicate node ${newNode.getUid()} has been ignored`);
    } else {
        result = getProject()._addRawNode(newNode, type, getSessionUserName())
    }

    return result;
}

export function coreImport(obj) {
    let result;
    let existing = getProject().getNodeById(obj.uid);

    if (existing) {
        warn(`Importing - duplicate node ${obj.uid} detected`);
        obj.uid = `${obj.uid}_duplicate`;
    }

    result = getProject()._addRawNode(obj, getPalette().getItemById(obj.type) || getPalette().getDefaultItem(), obj.userName);

    return result;
}

export function select(tgtNode) {
    tgtNode.select();
    addSessionCanvasSelectionNode(tgtNode);
}

export function deselect(tgtNode) {
    tgtNode.deselect();
    removeSessionCanvasSelectionNode(tgtNode);
}

export function flipNode(tgtNode) {
    //flip the enabled state for special nodes
    tgtNode.enabled = !tgtNode.enabled;

    tgtNode.setLabel(tgtNode.getPropertyNamed('otherLabel'));
    tgtNode.setNormalPropertyNamed('otherLabel', tgtNode.getLabel());

    refreshNode(tgtNode);
}

export function getNodeUsingSvg(svgNode) {
    let uid = svgNode.getAttribute('id');

    return getProject().getNodeById(uid);
}

export function takeContent(tgtNode, payload) {
    let chVal = doCanHandle(tgtNode.getType(), payload);

    if (chVal > 0) {
        setOntoEmptyIcon(payload, tgtNode);
    } else {
        warn(`That pasted content could not be handled by the selected node(s)`, payload);
    }
}

export function duplicateNode(tgtNode, offsetX, offsetY) {
    return coreDuplicateNode(tgtNode, offsetX, offsetY);
}
