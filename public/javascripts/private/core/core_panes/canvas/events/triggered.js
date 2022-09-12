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

import {getProject} from "/javascripts/private/state.js";
import {showToast} from "/javascripts/private/util/log.js";
import {refreshNode} from "/javascripts/interface/data.js";

/**
 * @file Functions for all triggered canvas events, from user defined functions from nodes.
 *
 * @author Dave Braines
 **/

/**
 * Set the specified property to the specified value for the specified node.
 *
 * @param {string} nodeUid          the uid for the node to be updated.
 * @param {string} propertyName     the name of the property to be updated.
 * @param {string} propertyValue    the new value for the property.
 * @param {string} propertyType     the type of the property.
 */
export function eventSetProperty(nodeUid, propertyName, propertyValue, propertyType) {
    let tgtNode = getProject().getNodeById(nodeUid);

    if (tgtNode) {
        tgtNode.setPropertyNamed(propertyName, propertyValue, propertyType);
        refreshNode(tgtNode);
    } else {
        showToast(`Node ${nodeUid} could not be found`);
    }
}
