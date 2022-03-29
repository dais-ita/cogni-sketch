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
 * @file Functions that define the object that instantiates a project within the application.
 *
 * @author Dave Braines
 **/

import {create as createPalette} from "./wPalette.js";
import {create as createNode} from "./wNode.js";
import {create as createLink} from "./wLink.js";
import {
    sendLinkChangedEvent,
    sendNodeChangedEvent,
    sendPaletteChangedEvent,
    sendProjectChangedEvent
} from "../ui/tabs.js";
import {error} from "../util/log.js";

/**
 * Create a new project instance and return it.
 *
 * @param {csRawProject} thisProject    The raw (serialized form) of the project to be used.
 * @param {string}      userName        The name of the user creating this node.
 * @return {csProject}
 */
export function create(thisProject, userName) {
    let _errors = [];

    let coreProject = thisProject;  /* store the core_types project */
    let wrappedPalette;
    let wrappedNodes = {};
    let wrappedLinks = {};

    if (coreProject) {
        /* store the palette */
        if (coreProject.palette) {
            wrappedPalette = createPalette(coreProject.palette);
            sendPaletteChangedEvent({ "palette": wrappedPalette, "change": 'recreate' });

            /* propagate palette errors */
            for (let thisError of wrappedPalette._errors) {
                _errors.push( `Palette ${wrappedPalette.getName()}: ${thisError}`);
            }
        // } else {
        //     _errors.push(`No palette found, palette name is ${coreProject.paletteName}`);
        }
        delete coreProject.palette;

        /* create the nodes */
        if (coreProject.nodes) {
            for (let thisNode of Object.values(coreProject.nodes)) {
                if (wrappedPalette) {
                    let nodeType = thisNode.type || 'unknown';
                    let wType = wrappedPalette.getItemById(nodeType) || wrappedPalette.getDefaultItem();
                    let wNode = createNode(thisNode, wType, userName);
                    sendNodeChangedEvent({ "node": /** @type {csNode} */ wNode, "change": 'create' } );

                    if (wNode) {
                        wrappedNodes[thisNode.uid] = wNode;

                        /* propagate node errors */
                        for (let thisError of wNode._errors) {
                            _errors.push( `Node ${wNode.getUid()}: ${thisError}`);
                        }
                    }
                }
            }
            delete coreProject.nodes;
        }

        /* create the links */
        if (coreProject.links) {
            for (let thisLink of Object.values(coreProject.links)) {
                let wLink = createLink(thisLink, userName);

                if (wLink) {
                    wLink._completeLinks(wLink, wrappedNodes);
                    wrappedLinks[thisLink.uid] = wLink;
                    sendLinkChangedEvent({ "link": /** @type {csLink} */ wLink, "change": 'create' });
                }

                /* propagate link errors */
                for (let thisError of wLink._errors) {
                    _errors.push( `Link ${wLink.getUid()}: ${thisError}`);
                }
            }
            delete coreProject.links;
        }

        /* create the extras */
        if (!coreProject.extras) {
            coreProject.extras = {};
        }
    } else {
        _errors.push('Project not created as no core_types project was specified');
    }

    /* functions */
    let getName = function() {
        return coreProject.project;
    }

    let setName = function(projName) {
        let oldName = coreProject.project;
        coreProject.project = projName;
        sendProjectChangedEvent({ "project": /** @type {csProject} */ this, "change": 'setName', "previousValue": oldName });
    }

    let getPalette = function() {
        return wrappedPalette;
    }

    let getPaletteName = function() {
        let result;

        if (wrappedPalette) {
            result = wrappedPalette.getName();
        }

        return result;
    }

    let setPalette = function(thisPalette) {
        let oldId;

        if (wrappedPalette) {
            oldId = wrappedPalette.getName();
        }

        wrappedPalette = thisPalette;

        coreProject.paletteName = thisPalette.getName();
        sendProjectChangedEvent({ "project": /** @type {csProject} */ this, "change": 'setPalette', "id": thisPalette.getName(), "previousValue": oldId });
    }

    let getOwner = function() {
        return coreProject.owner;
    }

    let isReadOnly = function() {
        return !!coreProject.readOnly;
    }

    let getNodeById = function(nodeId) {
        return wrappedNodes[nodeId];
    }

    let listNodes = function(typeName) {
        let result = [];

        if (typeName) {
            for (let thisNode of Object.values(wrappedNodes)) {
                if (thisNode.getTypeName() === typeName) {
                    result.push(thisNode);
                }
            }
        } else {
            result = Object.values(wrappedNodes);
        }

        return result;
    }

    let listNodesByType = function(tgtType) {
        let result = [];

        for (let thisObj of listNodes()) {
            if (thisObj.getType() === tgtType) {
                result.push(thisObj);
            }
        }

        return result;
    }

    let listNodesByLabel = function(tgtLabel) {
        let result = [];
        let lcLabel = tgtLabel.trim().toLowerCase();

        for (let thisNode of listNodes()) {
            let thisLabel = thisNode.getLabel();

            if (thisLabel) {
                if (lcLabel === thisLabel.trim().toLowerCase()) {
                    result.push(thisNode);
                }
            }
        }

        return result;
    }

    let addNode = function(wNode) {
        if (!wrappedNodes[wNode.getUid()]) {
            wrappedNodes[wNode.getUid()] = wNode;
            sendNodeChangedEvent({ "node": wNode, "change": 'add' });
            sendProjectChangedEvent({ "project": /** @type {csProject} */ this, "change": 'addNode', "id": wNode.getUid() });
        }
    }

    let deleteNode = function(wNode) {
        wNode._delete();
        delete wrappedNodes[wNode.getUid()];
        sendNodeChangedEvent({ "node": wNode, "change": 'delete' });
        sendProjectChangedEvent({ "project": /** @type {csProject} */ this, "change": 'deleteNode', "id": wNode.getUid() });
    }

    let getLinkById = function(linkId) {
        return wrappedLinks[linkId];
    }

    let listLinks = function() {
        return Object.values(wrappedLinks);
    }

    let addFullLink = function(wLink) {
        if (!wrappedLinks[wLink.getUid()]) {
            wrappedLinks[wLink.getUid()] = wLink;
            sendLinkChangedEvent({ "link": wLink, "change": 'add' } );
            sendProjectChangedEvent({ "project": /** @type {csProject} */ this, "change": 'addLink', "id": wLink.getUid() });
        }
    }

    let startPartialLink = function(wLink) {
        wrappedLinks[wLink.getUid()] = wLink;
    }

    let finishPartialLink = function(wLink, srcNode, tgtNode) {
        wLink._setTargetNode(tgtNode);
        srcNode.addLink(wLink);
        tgtNode.addLink(wLink);
        sendLinkChangedEvent({ "link": wLink, "change": 'finish' } );
        sendProjectChangedEvent({ "project": /** @type {csProject} */ this, "change": 'finishLink', "id": wLink.getUid() });
    }

    let deleteLink = function(wLink) {
        let srcNode = wLink.getSourceNode();
        let tgtNode = wLink.getTargetNode();

        if (srcNode) {
            srcNode.deleteLink(wLink);
        }

        if (tgtNode) {
            tgtNode.deleteLink(wLink);
        }

        wLink._delete();
        delete wrappedLinks[wLink.getUid()];
        sendLinkChangedEvent({ "link": wLink, "change": 'delete' } );
        sendProjectChangedEvent({ "project": /** @type {csProject} */ this, "change": 'deleteLink', "id": wLink.getUid() });
    }

    let getGeneral = function() {
        return coreProject.general;
    }

    // let generalGetViewBox = function() {
    //     return coreProject.general.viewBox;
    // }

    let generalSetViewBox = function(vb) {
        coreProject.general.viewBox = vb;
    }

    // let generalGetViewBoxMidpoint = function() {
    //     let vb = coreProject.general.viewBox;
    //
    //     return {
    //         "x": vb.left + (vb.width / 2),
    //         "y": vb.top + (vb.height / 2)
    //     };
    // }

    let generalTakeUid = function() {
        return coreProject.general.uid++;
    }

    let hasExtra = function(propName) {
        return !!coreProject.extras[propName];
    }

    let getExtra = function(propName) {
        return coreProject.extras[propName];
    }

    let setExtra = function(propName, propVal) {
        coreProject.extras[propName] = propVal;
    }

    let appendToExtra = function(propName, newItem) {
        if (!coreProject.extras[propName]) {
            coreProject.extras[propName] = [];
        }

        coreProject.extras[propName].push(newItem);
    }

    let clearExtra = function(propName) {
        delete coreProject.extras[propName];
    }

    /* private functions */
    let _reportAnyErrors = function() {
        for (let thisError of _errors) {
            error('Project error', thisError);
        }
    }

    /* special functions */
    let _delete = function() {
        //TODO: Implement this
        error('Project delete not yet implemented');
    }

    let _addRawNode = function(rawNode, wType, userName) {
        let newNode = createNode(rawNode, wType, userName);
        sendNodeChangedEvent({ "node": /** @type {csNode} */ newNode, "change": 'create' } );

        wrappedNodes[newNode.getUid()] = newNode;

        return newNode;
    }

    let _addRawLink = function(rawLink, userName, partial) {
        let newLink = createLink(rawLink, userName);
        sendLinkChangedEvent({ "link": /** @type {csLink} */ newLink, "change": 'create' } );

        wrappedLinks[newLink.getUid()] = newLink;

        newLink._completeLinks(newLink, wrappedNodes, partial);

        return newLink;
    }

    let _export = function() {
        let result;
        let exportedNodes = {};
        let exportedLinks = {};

        if (wrappedNodes) {
            for (let [key, thisNode] of Object.entries(wrappedNodes)) {
                exportedNodes[key] = thisNode.export();
            }
        }

        if (wrappedLinks) {
            for (let [key, thisLink] of Object.entries(wrappedLinks)) {
                exportedLinks[key] = thisLink.export();
            }
        }

        result = {
            "project": coreProject.project,
            "server_ts": coreProject.server_ts,
            "readOnly": coreProject.readOnly,
            "paletteName": coreProject.paletteName,
            "general": coreProject.general,
            "nodes": exportedNodes,
            "links": exportedLinks,
            "extras": coreProject.extras
        };

        if (coreProject.owner) {
            result.owner = coreProject.owner;
        }

        return result;
    }

    _reportAnyErrors();

    /* external interface */
    return /** @type {csProject} */ Object.freeze({
        "csType": 'project',
        "id": coreProject.project,
        "getName": getName,
        "setName": setName,
        "getPalette": getPalette,
        "getPaletteName": getPaletteName,
        "setPalette": setPalette,
        "getOwner": getOwner,
        "isReadOnly": isReadOnly,
        "getNodeById": getNodeById,
        "listNodes": listNodes,
        "listNodesByLabel": listNodesByLabel,
        "listNodesByType": listNodesByType,
        "addNode": addNode,
        "deleteNode": deleteNode,
        "getLinkById": getLinkById,
        "listLinks": listLinks,
        "startPartialLink": startPartialLink,
        "finishPartialLink": finishPartialLink,
        "addFullLink": addFullLink,
        "deleteLink": deleteLink,
        "getGeneral": getGeneral,
        "setViewBox": generalSetViewBox,
        "takeUid": generalTakeUid,
        // "getViewBox": generalGetViewBox,
        // "getViewBoxMidpoint": generalGetViewBoxMidpoint,
        "hasExtra": hasExtra,
        "getExtra": getExtra,
        "setExtra": setExtra,
        "appendToExtra": appendToExtra,
        "clearExtra": clearExtra,
        "export": _export,
        "_delete": _delete,
        "_addRawNode": _addRawNode,
        "_addRawLink": _addRawLink,
        "_errors": _errors
    });
}
