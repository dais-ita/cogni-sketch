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
 * @file Functions for handling typical responses from the server side of user defined functions, for example
 * processing and summarising nodes and links that are proposed to be created in the current project.
 *
 * @author Dave Braines
 **/

import {getPalette} from "/javascripts/private/state.js";
import {computeNewNodePosFrom} from "/javascripts/private/util/coords.js";
import {openPopup as openPreviewPopup} from "/javascripts/private/core/core_popups/preview/previewPopup.js";
import {
    createNewFullNode,
    createNewLink
} from "/javascripts/private/core/create.js";
import {selectNode} from "/javascripts/private/core/core_panes/canvas/select.js";
import {error} from "/javascripts/private/util/log.js";

/**
 * Process the standard structure that is returned from the server for any functions that may end up proposing the
 * creation of new nodes or links.
 *
 * @param {csNode} originalNode             the node against which the operation was performed
 * @param {csResponse} functionResponse     the links and nodes proposed to be created in the response
 * @param {boolean} [noPopup=false]         whether to show the popup window for confirmation
 */
export function handleResponse(originalNode, functionResponse, noPopup) {
    let config = {
        'defaultSliceCount': 20,
        'layout': 'RADIAL',
        'radius': 300
    };

    if (functionResponse.errors.length > 0) {
        for (let thisError of functionResponse.errors) {
            error(thisError, null, null, true);
        }
    } else {
        if (noPopup) {
            if (functionResponse.nodes.length > 0) {
                createNodesAndLinksFrom(originalNode, functionResponse.nodes, config);
            }
        } else {
            openPreviewPopup(originalNode, functionResponse, config, cbAfterPopup);
        }
    }
}

function cbAfterPopup(originalNode, chosenNodes, config) {
    createNodesAndLinksFrom(originalNode, chosenNodes, config);
}

function createNodesAndLinksFrom(srcNode, newItems, config) {
    let pos = 0;
    let numSlices = sliceCount(newItems.length, config);

    for (let thisItem of newItems) {
        let type;
        let label;
        let props;

        type = getPalette().getItemById(thisItem.type);
        label = thisItem.nodeData.data.label;
        props = thisItem.nodeData.data.properties;

        let newE = computeNewNodePosFrom(config, srcNode, pos++, numSlices, config.radius);
        let newObj = createNewFullNode(type, label, newE, null, props);
        selectNode(newObj);

        createNewLink(srcNode, newObj, thisItem.link);
    }
}

function sliceCount(numPairs, config) {
    let result = config.defaultSliceCount;

    if (numPairs > result) {
        result = numPairs;
    }

    return result;
}
