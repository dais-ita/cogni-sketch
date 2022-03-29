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
 * @file Functions relating to duplication of nodes and links on the canvas.
 * @author Dave Braines
 **/

import {showToast, warn} from "/javascripts/private/util/log.js";
import {duplicateNode} from "/javascripts/private/csData/csDataNode.js";
import {createNewLink} from "/javascripts/private/csData/csDataLink.js";
import {selectNode} from "/javascripts/private/core/core_panes/canvas/select.js";
import {getSessionCanvasDuplicateOffset} from "/javascripts/private/csData/csDataSession.js";
import {getSelectedItems, deselectAll} from "/javascripts/private/csData/csDataCanvas.js";
import {saveActionMisc} from "/javascripts/private/csData/change/csDataChanges.js";

/**
 * Perform the duplicate action, reporting a warning if no nodes or links were selected.
 */
export function doDuplicate() {
    let selections = getSelectedItems();

    if ((selections.nodes.length > 0) || (selections.links.length > 0)) {
        let nodeIds = [];
        let linkIds = [];

        selections.nodes.forEach(function(node) { nodeIds.push(node.id); });
        selections.links.forEach(function(link) { linkIds.push(link.id); });

        saveActionMisc('canvas:duplicate', null, { "nodeIds": nodeIds, "linkIds": linkIds });
        duplicateNodesAndLinks(selections.nodes, selections.links);
    } else {
        warn('Nothing selected, so nothing is duplicated', selections, true);
    }
}

/**
 * Create copies of the nodes, recording the new unique ids for each of the nodes.  Then create the links, using
 * the new unique ids to correctly link the nodes.  Finally clear the old selected nodes and links and select the newly
 * created ones.
 *
 * @param {csNode[]} nodeList       the list of nodes to be duplicated.
 * @param {csLink[]} linkList       the list of links to be duplicated.
 */
function duplicateNodesAndLinks(nodeList, linkList) {
    let oldToNew = duplicateNodes(nodeList);
    let newLinks = duplicateLinks(nodeList, linkList, oldToNew);

    deselectAll();

    for (let newNode of Object.values(oldToNew)) {
        selectNode(newNode);
    }

    showToast(`${nodeList.length} nodes and ${newLinks.length} links successfully duplicated`);
}

/**
 * Duplicate the specified nodes.
 *
 * @param {csNode[]} nodeList       the list of nodes to be duplicated.
 * @return {object}                 this object mapping the old unique id to the new node in each case.
 */
function duplicateNodes(nodeList) {
    let oldToNew = {};
    let offset = getSessionCanvasDuplicateOffset();

    for (let thisNode of nodeList) {
        oldToNew[thisNode.getUid()] = duplicateNode(thisNode, offset.x, offset.y);
    }

    return oldToNew;
}

/**
 * Duplicate the specified links.  Use the mapping of old node unique ids to new nodes to ensure the
 * copied links are set up with links to the correct new nodes.
 *
 * @param {csNode[]} nodeList       the original list of nodes that have already been copied.
 * @param {csLink[]} linkList       the original list of links that need to be copied.
 * @param {object} oldToNew         the mapping of old node unique ids to new nodes.
 * @return {csLink[]}               the list of duplicated links.
 */
function duplicateLinks(nodeList, linkList, oldToNew) {
    let newLinks = [];

    for (let thisLink of linkList) {
        let srcNode = thisLink.getSourceNode();
        let tgtNode = thisLink.getTargetNode();

        if ((nodeList.indexOf(srcNode) > -1) && (nodeList.indexOf(tgtNode) > -1)) {
            let newSrc = oldToNew[srcNode.getUid()];
            let newTgt = oldToNew[tgtNode.getUid()];

            newLinks.push(createNewLink(newSrc, newTgt, thisLink.getLabel()));
        }
    }

    return newLinks;
}
