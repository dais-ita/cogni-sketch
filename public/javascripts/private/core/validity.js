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
 * @file Functions that test the validity of projects, nodes and links, e.g. for errors/inconsistencies, or for
 * structures used in earlier versions of the application that need to be migrated.
 *
 * @author Dave Braines
 **/

import {getProject} from "/javascripts/private/state.js";
import {isImage} from "/javascripts/private/util/data.js";

import {
    EXPANDED_COLLAPSED as NODE_EXPANDED_COLLAPSED,
    EXPANDED_CUSTOM as NODE_EXPANDED_CUSTOM,
    PROP_TYPE_JSON,
    PROP_TYPE_NORMAL,
    PROP_TYPE_TEXT
} from "/javascripts/private/wrapper/wrapper.js";
import {getSessionProjectCleanOnLoad} from "/javascripts/private/csData/csDataSession.js";
import {renameProperty} from "/javascripts/private/util/misc.js";
import {error, warn} from "/javascripts/private/util/log.js";

const PAL_UNKNOWN = {
    "id": "unknown",
    "icon": "./images/palette/icon-error.svg",
    "icon-alt": "icon-unknown",
    "label": "unknown",
    "nodeColor": "red",
    "position": 100,
    "section": "core",
    "settings": {}
};

const EMPTY_PAL = {
    "name": 'default',
    "server_ts": Date.now(),
    "sections": [ { "name": 'core', "label": 'core' } ],
    "items": {
        "unknown": PAL_UNKNOWN
    }
};

function getCleanOnLoad() {
    return getSessionProjectCleanOnLoad();
}

export function projectValidity(tgtProject) {
    let upgraded;

    //TODO: Is this the best way?
    if (!tgtProject.palette) {
        console.warn('No palette was returned - creating a stub');
        tgtProject.palette = EMPTY_PAL;
    } else {
        if (!tgtProject.palette.items['unknown']) {
            console.warn('No \'unknown\' palette item was found - creating a copy');

            tgtProject.palette.items.unknown = PAL_UNKNOWN;
        }
    }

    if (tgtProject.objects) {
        renameProperty(tgtProject, 'objects', 'nodes');
        warn('Project was upgraded: objects->nodes');
    }

    for (let node of Object.values(tgtProject.nodes)) {
        upgraded = upgradeExpanded(node);
    }

    if (upgraded) {
        warn('Nodes were upgraded: Expanded mode');
    }

    for (let node of Object.values(tgtProject.nodes)) {
        upgraded = upgradePropertyTypes(node);
    }

    if (upgraded) {
        warn('Nodes were upgraded: Property types');
    }
}

export function nodeListValidity(nodeList) {
    let upgraded;

    for (let node of nodeList) {
        upgraded = upgradeExpanded(node);
    }

    if (upgraded) {
        warn('Nodes were upgraded: Expanded mode');
    }

    for (let node of nodeList) {
        upgraded = upgradePropertyTypes(node);
    }

    if (upgraded) {
        warn('Nodes were upgraded: Property types');
    }
}

export function nodeValidity(tgtNode) {
    /* currently warnings only - no need to return true/false as all nodes remain */
    testForNonLocalImages(tgtNode);
    // testForRawData(tgtNode);

    return true;
}

function testForNonLocalImages(tgtNode) {
    if (isImage(tgtNode)) {
        let url = tgtNode.getPropertyNamed('url');

        if (url && (url.indexOf('./image/') === 0) && (url.indexOf('./image/' + getProject().getName()) !== 0)) {
            error(`Non-local for node ${tgtNode.getUid()}, url: ${url}`);
        }

        //TODO: Remove this legacy image file path
        if (url && (url.indexOf('./images/') === 0) && (url.indexOf('./images/' + getProject().getName()) !== 0)) {
            error(`Non-local for node ${tgtNode.getUid()}, url: ${url}`);
        }
    }
}

/**
 * If the 'expanded' property is a boolean replace it with a numeric value to indicate the expanded/collapsed state.
 *
 * @param {csRawNode} tgtNode       the raw JSON object that represents this node.
 */
function upgradeExpanded(tgtNode) {
    let result = false;

    if (typeof tgtNode.expanded === 'boolean') {
        if (tgtNode.expanded) {
            tgtNode.expanded = NODE_EXPANDED_CUSTOM;
        } else {
            tgtNode.expanded = NODE_EXPANDED_COLLAPSED;
        }

        result = true;
    }

    return result;
}

/**
 * Ensure that all properties are stored with an explicit property type.
 *
 * @param {csRawNode} tgtNode       the raw JSON object that represents this node.
 */
function upgradePropertyTypes(tgtNode) {
    let result = false;

    if (tgtNode.data.properties) {
        for (let [propName, propVal] of Object.entries(tgtNode.data.properties)) {
            if (propVal && (typeof propVal !== 'object')) {
                tgtNode.data.properties[propName] = {
                    'type': computeTypeFor(propName, propVal),
                    'value': propVal
                };

                result = true;
            } else {
                if (propVal.type === 'text') {
                    propVal.type = PROP_TYPE_TEXT;
                }
            }
        }
    }

    return result;
}

function computeTypeFor(propName) {
    let typeName;

    if (propName === 'url') {
        typeName = 'url';
    } else if (propName === 'due-date') {
        typeName = 'date';
    } else if (propName.startsWith('text')) {
        typeName = PROP_TYPE_TEXT;
    } else if (propName.startsWith === 'json') {
        typeName = PROP_TYPE_JSON;
    } else {
        typeName = PROP_TYPE_NORMAL;
    }

    return typeName;
}

export function linkValidity(tgtLink, srcNode, tgtNode) {
    let result = true;

    if (getCleanOnLoad()) {
        if (!testForCircularLink(tgtLink, srcNode, tgtNode)) {
            result = false;
        }

        if (!testForIncompleteLink(tgtLink, srcNode, tgtNode)) {
            result = false;
        }
    }

    return result;
}

function testForCircularLink(tgtLink, srcNode, tgtNode) {
    let result = (srcNode !== tgtNode);

    if (!result) {
        error(`Link ${tgtLink.getUid()} is a circular reference`);
    }

    return result;
}

function testForIncompleteLink(tgtLink, srcNode, tgtNode) {
    let result = !!srcNode;

    if (!result) {
        error(`Link ${tgtLink.getUid()} is missing a source node`);
    } else {
        result = !!tgtNode;

        if (!result) {
            error(`Link ${tgtLink.getUid()} is missing a target node`);
        }
    }

    return result;
}
