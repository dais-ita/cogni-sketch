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
 * @file Functions that define the object that instantiates a link within the application.
 *
 * @author Dave Braines
 **/

import {create as createData} from "./wCore.js";
import {sendLinkChangedEvent} from "/javascripts/private/ui/tabs.js";

/**
 * Create a new link instance and return it.
 *
 * @param {csRawLink} rawLink - the raw (serialized form) of the link to be used.
 * @param {string} userName - the name of the user creating this link.
 * @return {csLink}
 */
export function create(rawLink, userName) {
    let _errors = [];
    let coreLink;
    let wrappedData;
    let wrappedSourceNode;
    let wrappedTargetNode;

    if (rawLink) {
        coreLink = rawLink;
        coreLink.created = new Date(coreLink.created);      //TODO: Make this better

        if (!coreLink.user) {
            coreLink.user = userName;
        }

        wrappedData = createData(rawLink.uid, rawLink.data);
    } else {
        _errors.push('Link not created as no core_types link was specified');
    }

    /* functions */

    let getUid = function() {
        return coreLink.uid;
    }

    let getCreatedTimestamp = function() {
        return coreLink.created;
    }

    let getCreatedUser = function() {
        return coreLink.user;
    }

    let getAnchorPos = function() {
        return coreLink.anchorPos;
    }

    let setAnchorPos = function(propVal) {
        let oldPos = coreLink.anchorPos;

        coreLink.anchorPos = propVal;

        sendLinkChangedEvent({ "link": /** @type {csLink} */ this, "change": 'setAnchorPos', "previousValue": oldPos } );
    }

    let getBender = function() {
        return coreLink.bender;
    }

    let setBender = function(propVal) {
        let oldBender = coreLink.bender;

        coreLink.bender = propVal;

        sendLinkChangedEvent({ "link": /** @type {csLink} */ this, "change": 'setBender', "previousValue": oldBender } );
    }

    let isBidirectional = function() {
        return coreLink.bidirectional || false;
    }

    let setBidirectional = function(val) {
        coreLink.bidirectional = val;
    }

    let isSelected = function() {
        return coreLink.selected;
    }

    let isHidden = function() {
        return coreLink.hide;
    }

    let getSourceNode = function() {
        return wrappedSourceNode;
    }

    let getTargetNode = function() {
        return wrappedTargetNode;
    }

    let getOtherNode = function(tgtNode) {
        let result;

        if (wrappedTargetNode === tgtNode) {
            result = wrappedSourceNode;
        }

        if (wrappedSourceNode === tgtNode) {
            result = wrappedTargetNode;
        }

        return result;
    }

    let deleteLink = function() {
        if (wrappedSourceNode) {
            wrappedSourceNode.deleteLink(this);
        }

        if (wrappedTargetNode) {
            wrappedTargetNode.deleteLink(this);
        }

        sendLinkChangedEvent({ "link": /** @type {csLink} */ this, "change": 'deleteLink' });
    }

    let select = function() {
        coreLink.selected = true;
    }

    let deselect = function() {
        coreLink.selected = false;
    }

    let selectOrDeselect = function() {
        coreLink.selected = !coreLink.selected;
    }

    /* private functions */
    let _reportAnyErrors = function() {
        for (let error of _errors) {
            console.error(error);
        }
    }

    /* special functions */
    let _completeLinks = function(wrappedLink, wrappedNodes, partial) {
        /* link to the source node */
        let srcNode = wrappedNodes[coreLink.sourceRef];
        if (srcNode) {
            wrappedSourceNode = srcNode;
            srcNode._addOutgoingLink(wrappedLink);
        } else {
            _errors.push(`Source node ${coreLink.sourceRef} not found when processing link ${coreLink.uid}`);
        }
        delete coreLink.sourceRef;

        /* link to the target node */
        let tgtNode = wrappedNodes[coreLink.targetRef];
        if (tgtNode) {
            wrappedTargetNode = tgtNode;
            tgtNode._addIncomingLink(wrappedLink);
        } else {
            if (!partial) {
                _errors.push(`Target node ${coreLink.targetRef} not found when processing link ${coreLink.uid}`);
            }
        }
        delete coreLink.targetRef;

        _reportAnyErrors();
    }

    let _delete = function() {
        /* nothing special is needed */
    }

    let _setTargetNode = function(tgtNode) {
        wrappedTargetNode = tgtNode;
    }

    let _export = function() {
        let sourceRef;
        let targetRef;

        if (wrappedSourceNode) {
            sourceRef = wrappedSourceNode.getUid();
        }

        if (wrappedTargetNode) {
            targetRef = wrappedTargetNode.getUid();
        }

        return {
            "uid": coreLink.uid,
            "created": coreLink.created,
            "user": coreLink.user,
            "selected": coreLink.selected,
            "hide": coreLink.hide,
            "anchorPos": coreLink.anchorPos,
            "bender": coreLink.bender,
            "bidirectional": coreLink.bidirectional,
            "sourceRef": sourceRef,
            "targetRef": targetRef,
            "data": wrappedData.getData()
        };
    }

    _reportAnyErrors();

    /* external interface */
    return /** @type {csLink} */ Object.freeze({
        "csType": 'link',
        "id": coreLink.uid,
        "getUid": getUid,
        "getCreatedTimestamp": getCreatedTimestamp,
        "getCreatedUser": getCreatedUser,
        "getLabel": wrappedData.getLabel,
        "setLabel": wrappedData.setLabel,
        "getAnchorPos": getAnchorPos,
        "setAnchorPos": setAnchorPos,
        "getBender": getBender,
        "setBender": setBender,
        "isBidirectional": isBidirectional,
        "setBidirectional": setBidirectional,
        "getData": wrappedData.getData,
        "hasPropertyNamed": wrappedData.hasPropertyNamed,
        "getPropertyNamed": wrappedData.getPropertyNamed,
        "getTypeAndValueForPropertyNamed": wrappedData.getTypeAndValueForPropertyNamed,
        "getTypeForPropertyNamed": wrappedData.getTypeForPropertyNamed,
        "setNormalPropertyNamed": wrappedData.setNormalPropertyNamed,
        "setTextPropertyNamed": wrappedData.setTextPropertyNamed,
        "setJsonPropertyNamed": wrappedData.setJsonPropertyNamed,
        "setPropertyNamed": wrappedData.setPropertyNamed,
        "removePropertyNamed": wrappedData.removePropertyNamed,
        "changePropertyType": wrappedData.changePropertyType,
        "hasProperties": wrappedData.hasProperties,
        "listProperties": wrappedData.listProperties,
        "listPropertyValues": wrappedData.listPropertyValues,
        "isSelected": isSelected,
        "isHidden": isHidden,
        "isSemantic": wrappedData.isSemantic,
        "getSourceNode": getSourceNode,
        "getTargetNode": getTargetNode,
        "getOtherNode": getOtherNode,
        "deleteLink": deleteLink,
        "select": select,
        "deselect": deselect,
        "selectOrDeselect": selectOrDeselect,
        "export": _export,
        "_completeLinks": _completeLinks,
        "_delete": _delete,
        "_setTargetNode": _setTargetNode,
        "_errors": _errors
    });
}
