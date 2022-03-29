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
 * @file Public interface functions relating to the accessing of projects, palettes, nodes, links, session data and
 * cookies.  Also function for the creation of new node and link items.
 * All methods are simple proxies to relevant private functions.
 *
 * @author Dave Braines
 **/

import {
    getSessionValue as doGetSessionValue,
    getPalette as doGetPalette,
    getProject as doGetProject,
    removeSessionValue as doRemoveSessionValue,
    setSessionValue as doSetSessionValue
} from "/javascripts/private/state.js";
import {
    createNewEmptyNode,
    createNewLink,
    createNewSpecialNode
} from "/javascripts/private/core/create.js";
import {refreshNode as doRefreshNode} from "/javascripts/private/core/graphics.js";
import {
    deselectLink as doDeselectLink,
    deselectNode as doDeselectNode,
    selectLink as doSelectLink,
    selectNode as doSelectNode
} from "/javascripts/private/core/core_panes/canvas/select.js";
import {flipNode as doFlipNode} from "/javascripts/private/csData/csDataNode.js";
import {getFromCookie as doGetFromCookie} from "/javascripts/private/csData/csDataCookie.js";

/**
 * Return the currently loaded project.
 *
 * @returns {csProject}     the currently loaded project.
 */
export function getProject() {
    return doGetProject();
}

/**
 * Return the currently loaded palette.
 *
 * @returns {csPalette}         the currently loaded palette.
 */
export function getPalette() {
    return doGetPalette();
}

/**
 * Get the specified value that has been temporarily stored in the session.
 *
 * @param {string} key          the key used to store the data.
 * @returns {*} value           the retrieved data.
 */
export function getSessionValue(key) {
    return doGetSessionValue('public', key);
}

/**
 * Store the specified value temporarily in the session.
 *
 * @param {string} key     the key to be used to store this data.
 * @param {*} value         the value to be stored.
 */
export function setSessionValue(key, value) {
    doSetSessionValue('public', key, value);
}

/**
 * Remove the specified session value.
 *
 * @param {string} key          the key to be removed.
 */
export function removeSessionValue(key) {
    return doRemoveSessionValue('public', key);
}

/**
 * Get the value stored in the cookie for the specified key name.
 *
 * @param {string} keyName      the key for the value to be obtained from the cookie
 * @returns {string}            the value retrieved from the cookie
 */
export function getFromCookie(keyName) {
    return doGetFromCookie(keyName);
}

/**
 * Create a new empty node on the canvas.
 *
 * @param {csType} nodeType             the node type for the new node.
 * @param {string} [label]              the optional label for the new node.
 * @param {csCoordinates} pos           the position on the canvas for the new node.
 * @returns {csNode}                    the new node instance.
 */
export function createEmptyNode(nodeType, label, pos) {
    return createNewEmptyNode(nodeType, label || '', pos);
}

/**
 * Create a new special node on the canvas.
 *
 * @param {csType} nodeType             the node type for the new node
 * @param {string} [label]              the optional label for the new node
 * @param {csCoordinates} pos           the position on the canvas for the new node
 * @returns {csNode}                    the new node instance
 */
export function createSpecialNode(nodeType, label, pos) {
    return createNewSpecialNode(nodeType, label || '', pos);
}

/**
 * Refresh this node by redrawing on the canvas.  This will fire the relevant events for nodes, labels and templates.
 *
 * @param {csNode} tgtNode      the node that is to be refreshed.
 */
export function refreshNode(tgtNode) {
    doRefreshNode(tgtNode);
}

/**
 * Select the specified node on the canvas.
 *
 * @param {csNode} tgtNode      the node to be selected.
 */
export function selectNode(tgtNode) {
    doSelectNode(tgtNode);
}

/**
 * Deselect the specified node on the canvas.
 *
 * @param {csNode} tgtNode      the node to be deselected.
 */
export function deselectNode(tgtNode) {
    doDeselectNode(tgtNode);
}

/**
 * Only applies to special nodes.  Flip the node from on to off or vice-versa.
 *
 * @param {csNode} tgtNode      the node that is to be flipped.
 */
export function flipSpecialNode(tgtNode) {
    doFlipNode(tgtNode);
}

/**
 * Create a new link between the specified nodes.
 *
 * @param {csNode} srcNode      the source node for the new link.
 * @param {csNode} tgtNode      the target node for the new link.
 * @param {string} [linkLabel]  the optional label text for the new link.
 * @returns {csLink}            the new link instance.
 */
export function createLink(srcNode, tgtNode, linkLabel) {
    return createNewLink(srcNode, tgtNode, linkLabel);
}

/**
 * Select the specified link on the canvas.
 *
 * @param {csLink} tgtLink      the link to be selected.
 */
export function selectLink(tgtLink) {
    doSelectLink(tgtLink);
}

/**
 * Deselect the specified link on the canvas.
 *
 * @param {csLink} tgtLink      the link to be deselected.
 */
export function deselectLink(tgtLink) {
    doDeselectLink(tgtLink);
}
