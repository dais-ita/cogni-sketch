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
 * @file Functions relating to the creation of core items within the application and on the canvas.
 *
 * @author Dave Braines
 **/

import {reportStats} from "/javascripts/private/ui/ui.js";
import {
    doAddEmptyNode,
    doAddExistingLink,
    doAddExistingNode,
    doAddFullNode,
    doAddSpecialNode,
    doCreateLink,
    doDeleteLink,
    doDeleteNode
} from "/javascripts/private/core/hooks.js";
import {collapseNode} from "/javascripts/private/core/graphics.js";
import {linkValidity, nodeValidity} from "./validity.js";
import {error} from "/javascripts/private/util/log.js";
import {getPosFromNode} from "/javascripts/interface/graphics.js";
import {getProject} from "/javascripts/private/state.js";

export const MODE_EMPTY = 'empty';
export const MODE_FULL = 'full';
export const MODE_SPECIAL = 'special';

export function createNewEmptyNode(nodeType, label, pos) {
    return createNewNode(MODE_EMPTY, nodeType, label, pos);
}

export function createNewFullNode(nodeType, label, pos, payload, existingProperties) {
    return createNewNode(MODE_FULL, nodeType, label, pos, payload, existingProperties);
}

export function createNewSpecialNode(nodeType, label, pos) {
    return createNewNode(MODE_SPECIAL, nodeType, label, pos);
}

function createNewNode(mode, nodeType, label, pos, payload, existingProperties) {
    let newNode;

    if (nodeType) {
        if (mode === MODE_FULL) {
            newNode = doAddFullNode(pos, nodeType, label, payload, existingProperties);
        } else if (mode === MODE_EMPTY) {
            newNode = doAddEmptyNode(pos, nodeType, label);
        } else {
            newNode = doAddSpecialNode(pos, nodeType, label);
        }

        newNode.setLabel(label);
    } else {
        error(`Cannot create new node as node type ${nodeType} was not found`);
    }

    reportStats();

    return newNode;
}

export function recreateNode(origNode) {
    let isValid = nodeValidity(origNode);

    if (isValid) {
        doAddExistingNode(origNode);

        if (!origNode.isExpanded()) {
            collapseNode(origNode);
        }
    } else {
        error(`Ignoring node ${origNode.getUid()} as it failed validity tests`);
    }
}

export function duplicateNode(existingNode, offsetX, offsetY) {
    let newNode;
    let pos = getPosFromNode(existingNode.getPos(), offsetX, offsetY);

    if (existingNode.isFull()) {
        newNode = doAddFullNode(pos, existingNode.getType(), existingNode.getLabel(), null, existingNode.listProperties());
    } else if (existingNode.isEmpty()) {
        newNode = doAddEmptyNode(pos, existingNode.getType(), existingNode.getLabel());
    } else {
        newNode = doAddSpecialNode(pos, existingNode.getType(), existingNode.getLabel());
    }

    reportStats();

    return newNode;
}

export function deleteNode(thisNode, quiet) {
    doDeleteNode(thisNode);

    if (!quiet) {
        reportStats();
    }
}

export function createNewLink(srcNode, tgtNode, linkLabel, linkProps) {
    let newLink = doCreateLink(srcNode, tgtNode, { "label": linkLabel, "properties": linkProps });

    reportStats();

    return newLink;
}

export function finishLink(origLink, srcNode, tgtNode) {
    recreateLink(origLink, srcNode, tgtNode);

    reportStats();
}

export function recreateLink(origLink, srcNode, tgtNode) {
    let isValid = linkValidity(origLink, srcNode, tgtNode);

    if (isValid) {
        doAddExistingLink(origLink, srcNode, tgtNode);
    } else {
        error(`Ignoring link ${origLink.getUid()} as it failed validity tests`);

        if (srcNode) {
            srcNode.deleteLink(origLink);
        }

        if (tgtNode) {
            tgtNode.deleteLink(origLink);
        }

        getProject().deleteLink(origLink);
    }
}

export function deleteLink(thisLink) {
    doDeleteLink(thisLink);

    reportStats();
}
