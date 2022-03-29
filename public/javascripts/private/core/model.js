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
 * @file Functions relating to the creation of core objects for nodes and links.
 * @author Dave Braines
 **/

import {getProject} from "/javascripts/private/state.js";
import {
    coreCreateEmpty,
    coreCreateFull,
    coreCreateSpecial
} from "/javascripts/private/csData/csDataNode.js";
import {
    coreCreate,
    coreCreatePartial
} from "/javascripts/private/csData/csDataLink.js";
import {getSessionUserName} from "/javascripts/private/csData/csDataSession.js";
import {getCurrentLink} from "/javascripts/private/core/core_panes/canvas/dragdrop/link.js";
import {finishLink} from "/javascripts/private/core/create.js";
import {doDeleteLink} from "/javascripts/private/core/hooks.js";
import {saveActionMisc} from "/javascripts/private/csData/change/csDataChanges.js";

const TYPE_NODE = 'node';
const TYPE_LINK = 'link';

/**
 * Create a new empty node core object.
 *
 * @param {csType} type             the palette item type to use.
 * @param {csCoordinates} coords    the location of the canvas for this node.
 * @return {csNode}              the populated core node definition.
 */
export function createEmptyNode(type, coords) {
    return coreCreateEmpty(getNextNodeUid(), type, coords);
}

/**
 * Create a new empty node core object.
 *
 * @param {csType} type             the palette item type to use.
 * @param {csCoordinates} coords    the location of the canvas for this node.
 * @return {csNode}                 the populated core node definition.
 */
export function createFullNode(type, coords) {
    return coreCreateFull(getNextNodeUid(), type, coords);
}

/**
 * Create a new empty node core object.
 *
 * @param {csType} type             the palette item type to use.
 * @param {csCoordinates} coords    the location of the canvas from this node.
 * @return {csNode}                 the populated core node definition.
 */
export function createSpecialNode(type, coords) {
    return coreCreateSpecial(getNextNodeUid(), type, coords);
}

/**
 * Create a new empty link core object.
 *
 * @param {csNode} srcNode          the source node for the link.
 * @param {csNode} tgtNode          the target node for the link.
 * @param {object} [linkData]       any data to be put in the core definition.
 * @return {csLink}                 the populated core link definition.
 */
export function createLink(srcNode, tgtNode, linkData) {
    return coreCreate(getNextLinkUid(), srcNode, tgtNode, linkData, getSessionUserName());
}

/**
 * Create a new partial link core object.
 *
 * @param {csNode} srcNode          the source node for the link.
 * @return {csRawLink}              the populated core partial link definition.
 */
export function createPartialLink(srcNode) {
    let newLink = coreCreatePartial(getNextLinkUid(), srcNode, getSessionUserName())

    getProject().startPartialLink(newLink, srcNode);

    return newLink;
}

/**
 * Get the next unique id for a node.
 *
 * @return {string}     the next node unique id.
 */
export function getNextNodeUid() {
    return getNextUid(TYPE_NODE);
}

/**
 * Get the next unique id for a link.
 *
 * @return {string}     the next link unique id.
 */
export function getNextLinkUid() {
    return getNextUid(TYPE_LINK);
}

/**
 * Get the next generic unique id and apply the specified type to create a node or link unique id.
 *
 * @param {string} type     the type of unique id that needs to be created.
 * @return {string}         the next generic unique id.
 */
export function getNextUid(type) {
    let prefix;

    if (type === TYPE_NODE) {
        prefix = 'obj_';
    } else if (type === TYPE_LINK) {
        prefix = 'link_';
    } else {
        prefix = `${type}_`;
    }

    return prefix + getProject().takeUid();
}

/**
 * The user has finished drawing the link so create it if it is complete and if it is not circular (i.e. the source
 * and target nodes for the link are the same.
 *
 * @param {csNode} tgtNode      the user specified target node for the new link.
 * @return {boolean}            whether the link was created or not.
 */
export function maybeCreateLink(tgtNode) {
    let currLink = getCurrentLink();
    let linkMade = false;

    if (currLink) {
        let srcNode = currLink.getSourceNode();

        if ((srcNode && tgtNode) && (srcNode !== tgtNode)) {
            //TODO: Cleanup this whole partial/finished link area
            saveActionMisc('canvas:finishPartialLink', null,{
                "linkId": currLink.id,
                "srcNodeId": srcNode.id,
                "tgtNodeId": tgtNode.id
            });

            finishLink(currLink, srcNode, tgtNode);
            linkMade = true;
        }

        if (!linkMade) {
            /* Not dropped on target, so delete the link */
            saveActionMisc('canvas:abandonPartialLink', null,{ "linkId": currLink.id });
            doDeleteLink(currLink);
        }
    }

    return linkMade;
}
