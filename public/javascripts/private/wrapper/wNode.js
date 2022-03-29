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
 * @file Functions that define the object that instantiates a node within the application.
 *
 * @author Dave Braines
 **/

import {create as createData} from "./wCore.js";
import {getPalette} from "/javascripts/private/state.js";
import {
    sendNodeChangedEvent,
    sendTypeChangedEvent
} from "/javascripts/private/ui/tabs.js";
import {
    EXPANDED_COLLAPSED,
    EXPANDED_CUSTOM,
    EXPANDED_TABLE,
} from "./wrapper.js";
import {settings} from "../core/core_settings.js";

const MODE_EMPTY = 'empty';
const MODE_FULL = 'full';
const MODE_SPECIAL = 'special';

const PROP_NODE_SIZE = 'nodeSize';

/**
 * Create a new node instance and return it.
 *
 * @param {csRawNode} rawNode - the raw (serialized form) of the node to be used.
 * @param {csType} wType - the palette item type to be used for this node.
 * @param {string} userName - the name of the user creating this node.
 * @return {csNode}
 */
export function create(rawNode, wType, userName) {
    let _errors = [];
    let coreNode;
    let wrappedData;
    let wrappedType = wType;
    let wrappedIncomingLinks = {};
    let wrappedOutgoingLinks = {};

    if (!wrappedType) {
        _errors.push('No node type was specified');
    }

    if (rawNode) {
        coreNode = rawNode;
        coreNode.typeName = wrappedType.getId();
        coreNode.created = new Date(coreNode.created);      //TODO: Make this better

        if (!coreNode.user) {
            coreNode.user = userName;
        }

        wrappedData = createData(coreNode.uid, rawNode.data, wrappedType);
    } else {
        _errors.push('Node not created as no core_types node was specified');
    }

    /**
     * Get the unique id of this node object.
     *
     * @return {string}
     */
    let getUid = function() {
        return coreNode.uid;
    }

    /**
     * Get the unix timestamp number for when this object was first created.
     *
     * @return {number}
     */
    let getCreatedTimestamp = function() {
        return coreNode.created;
    }

    /**
     * Get the name of the user who created this object.
     *
     * @return {string}
     */
    let getCreatedUser = function() {
        return coreNode.user;
    }

    /**
     * Get the palette item type object for this node.
     *
     * @returns {csType}
     */
    let getType = function() {
        return wrappedType;
    }

    /**
     * Get the palette item type name for this node.
     *
     * This is almost always identical to using getType().getId() but with one important exception: If the palette
     * has been reloaded and the node cannot find the correct type in the new palette then this type name property
     * retains the old name, whilst the linked type instance becomes the default 'thing' type.  This allows the
     * user to correct back to the previous palette without needing to manually reselect the types for such nodes.
     * However, if the user saves the project then the typeName property will be overwritten.
     *
     * Therefore, this typeName property is considered to be 'the name of the type that this node should be'
     *
     * @return {string}
     */
    let getTypeName = function() {
        return coreNode.typeName;
    }

    /**
     * Indicates whether this node is empty, i.e. has no properties.
     *
     * @return {boolean}
     */
    let isEmpty = function() {
        return (coreNode.mode === MODE_EMPTY);
    }

    /**
     * Indicates whether this node is full, i.e. has at least one property.
     *
     * @return {boolean}
     */
    let isFull = function() {
        return (coreNode.mode === MODE_FULL);
    }

    /**
     * Indicates whether this node is special, i.e. has is used for decoration of control purposes only..
     *
     * @return {boolean}
     */
    let isSpecial = function() {
        return (coreNode.mode === MODE_SPECIAL);
    }

    /**
     * Indicates whether this node is expanded, i.e. is showing content on the canvas.
     * There are multiple expansion modes, and if any are active this returns true.
     *
     * @return {boolean}
     */
    let isExpanded = function() {
        return isExpandedAsTable() || isExpandedAsCustom();
    }

    /**
     * Indicates whether this node is expanded with the table view.
     *
     * @return {boolean}
     */
    let isExpandedAsTable = function() {
        return coreNode.expanded === EXPANDED_TABLE;
    }

    /**
     * Indicates whether this node is expanded with the custom view.
     *
     * @return {boolean}
     */
    let isExpandedAsCustom = function() {
        return coreNode.expanded === EXPANDED_CUSTOM;
    }

    /**
     * Indicates whether this node is currently selected.
     *
     * @return {boolean}
     */
    let isSelected = function() {
        return coreNode.selected;
    }

    /**
     * Indicates whether this node is currently hidden.
     *
     * @return {boolean}
     */
    let isHidden = function() {
        return coreNode.hide;
    }

    /**
     * Indicates whether this node has an unknown type, i.e. it has a node name that does not correspond to any
     * palette item type in the current palette.
     *
     * @return {boolean}
     */
    let isUnknownType = function() {
        return !wrappedType;
    }

    /**
     * Returns the current coordinates of this node on the canvas (in the node coordinate system).
     *
     * @return {csCoordinates}
     */
    let getPos = function() {
        return coreNode.pos;
    }

    /**
     * Set the current coordinates of this node on the canvas (in the node coordinate system).
     *
     * @param {csCoordinates} newPos - the coordinates to be stored.
     */
    let setPos = function(newPos) {
        coreNode.pos = newPos;
    }

    /**
     * Compute the label for this node, including the palette item type name if needed.
     * See also: getLabel()
     *
     * @param {string} [labelText] - an optional label to be used instead of any label stored on this node.
     * @return {*|string}
     */
    let getFullLabel = function(labelText) {
        let labText = labelText || wrappedData.getLabel() || '';

        if (coreNode.showType || isUnknownType()) {
            labText += ` (${coreNode.typeName})`;
        }

        return labText;
    }

    /**
     * Return the value of the showType flag for this node, which indicates whether the node label should include the
     * palette item type name.
     *
     * @return {boolean}
     */
    let getShowType = function() {
        return coreNode.showType;
    }

    /**
     * Set the showType flag for this node.
     * Sends a 'setShowType' nodeChanged event.
     *
     * @param {boolean} stVal - the value to be used.
     */
    let setShowType = function(stVal) {
        let oldVal = coreNode.showType;

        coreNode.showType = stVal;

        sendNodeChangedEvent({ "node": /** @type {csNode} */ this, "change": 'setShowType', "previousValue": oldVal });
    }

    /**
     * Get the icon information for this node, but requesting it from the palette item type.
     *
     * @return {csIcon}
     */
    let getIcon = function() {
        let result;

        if (wrappedType) {
            result = wrappedType.getIcon();
        }

        return result;
    }

    /**
     * Get the node size (as a ratio) for this node.  This can be sourced from these places, in this order:
     *  1. A 'nodeSize' property on this node
     *  2. From the palette item type
     *  3. The application-wide default node size.
     *
     *  @return {number}
     */
    let getNodeSize = function() {
        let result = parseInt(wrappedData.getPropertyNamed(PROP_NODE_SIZE));

        if (isNaN(result)) {
            if (wrappedType) {
                result = parseInt(wrappedType.getSettings().getNodeSize());
            }
        }

        if (isNaN(result)) {
            result = settings.canvas.defaultNodeSize;
        }

        return result;
    }

    let addLink = function(wLink) {
        wrappedOutgoingLinks[wLink.getUid()] = wLink;
        sendNodeChangedEvent({ "node": /** @type {csNode} */ this, "change": 'addLink', "id": wLink.getUid() });
    }

    let deleteLink = function(tgtLink) {
        //Delete for both incoming and outgoing lists since the action will be ignored if the link is not present
        delete wrappedIncomingLinks[tgtLink.getUid()];
        delete wrappedOutgoingLinks[tgtLink.getUid()];
        sendNodeChangedEvent({ "node": /** @type {csNode} */ this, "change": 'deleteLink', "id": tgtLink.getUid()});
    }

    let listOutgoingLinks = function() {
        return unidirectionalOnly(Object.values(wrappedOutgoingLinks));
    }

    let listIncomingLinks = function() {
        return unidirectionalOnly(Object.values(wrappedIncomingLinks));
    }

    let listAllLinks = function() {
        return Object.values(wrappedOutgoingLinks).concat(Object.values(wrappedIncomingLinks));
    }

    let listBiDirectionalLinks = function() {
        let result = [];

        for (let thisLink of listAllLinks()) {
            if (thisLink.isBidirectional()) {
                result.push(thisLink);
            }
        }

        return result;
    }

    let isLinkedTo = function(tgtNode) {
        let result = false;

        for (let thisLink of Object.values(wrappedOutgoingLinks)) {
            if (thisLink.getTargetNode() === tgtNode) {
                result = true;
            }
        }

        return result;
    }

    let switchType = function(wType) {
        let oldTypeId;

        if (wrappedType) {
            oldTypeId = wrappedType.getId();
        }

        wrappedType = wType;
        coreNode.typeName = wType.getId();

        sendNodeChangedEvent({ "node": /** @type {csNode} */ this, "change": 'switchType', "previousValue": oldTypeId });
    }

    let removeType = function() {
        wrappedType = getPalette().getDefaultItem();
        this.setShowType(wrappedType.getSettings().getDefaultShowType());
    }

    let expandAsTable = function() {
        coreNode.expanded = EXPANDED_TABLE;
    }

    let expandAsCustom = function() {
        coreNode.expanded = EXPANDED_CUSTOM;
    }

    let collapse = function() {
        coreNode.expanded = EXPANDED_COLLAPSED;
    }

    /**
     * Cycle through the three expand/collapse forms of: collapsed, expanded as table, expanded as custom
     */
    let expandOrCollapse = function() {
        if (isExpandedAsCustom()) {
            coreNode.expanded = EXPANDED_COLLAPSED;
        } else if (isExpandedAsTable()) {
            coreNode.expanded = EXPANDED_CUSTOM;
        } else {
            coreNode.expanded = EXPANDED_TABLE;
        }
    }

    let switchToEmpty = function() {
        let oldMode = coreNode.mode;

        coreNode.mode = MODE_EMPTY;

        sendNodeChangedEvent({ "node": /** @type {csNode} */ this, "change": 'switchToEmpty', "previousValue": oldMode });
    }

    let switchToFull = function() {
        let oldMode = coreNode.mode;

        coreNode.mode = MODE_FULL;

        sendNodeChangedEvent({ "node": /** @type {csNode} */ this, "change": 'switchToFull', "previousValue": oldMode });
    }

    let select = function() {
        coreNode.selected = true;
    }

    let deselect = function() {
        coreNode.selected = false;
    }

    let selectOrDeselect = function() {
        coreNode.selected = !coreNode.selected;
    }

    let show = function() {
        coreNode.hide = false;
    }

    let hide = function() {
        coreNode.hide = true;
    }

    let showOrHide = function() {
        coreNode.hide = !coreNode.hide;
    }

    /* special functions */
    let _delete = function() {
        /* delete all links */
        for (let thisLink of Object.values(wrappedOutgoingLinks)) {
            thisLink.deleteLink();
        }
        wrappedOutgoingLinks = {};
    }

    // let _getRawData = function() {
    //     return coreNode.rawData;
    // }

    let _reportAnyErrors = function() {
        for (let error of _errors) {
            console.error(error);
        }
    }

    let _addOutgoingLink = function(tgtLink) {
        if (wrappedOutgoingLinks[tgtLink.getUid]) {
            _errors.push(`Overwriting outgoing link ${tgtLink.getUid()} on ${getUid()}`);
        }
        wrappedOutgoingLinks[tgtLink.getUid()] = tgtLink;

        _reportAnyErrors();
    }

    let _addIncomingLink = function(tgtLink) {
        if (wrappedIncomingLinks[tgtLink.getUid]) {
            _errors.push(`Overwriting incoming link ${tgtLink.getUid()} on ${getUid()}`);
        }
        wrappedIncomingLinks[tgtLink.getUid()] = tgtLink;

        _reportAnyErrors();
    }

    let _relinkType = function(tgtType) {
        let newType = tgtType;

        if (!newType) {
            newType = getPalette().getDefaultItem();
            this.setShowType(wrappedType.getSettings().getDefaultShowType());
            sendTypeChangedEvent({ "type": newType, "change": 'create' });
        }

        wrappedType = newType;
    }

    let _export = function() {
        let typeId;
        let linkRefs = [];

        if (wrappedType) {
            typeId = wrappedType.getId();
        }

        if (wrappedOutgoingLinks) {
            linkRefs = Object.keys(wrappedOutgoingLinks);
        }

        if (wrappedIncomingLinks) {
            linkRefs = linkRefs.concat(Object.keys(wrappedIncomingLinks));
        }

        return {
            "uid": coreNode.uid,
            "created": coreNode.created,
            "user": coreNode.user,
            "type": typeId,
            "mode": coreNode.mode,
            "expanded": coreNode.expanded,
            "selected": coreNode.selected,
            "showType": coreNode.showType,
            "hide": coreNode.hide,
            "pos": coreNode.pos,
            "linkRefs": linkRefs,
            "data": wrappedData.getData()
        };
    }

    function unidirectionalOnly(linkList) {
        let result = [];

        for (let thisLink of linkList) {
            if (!thisLink.isBidirectional()) {
                result.push(thisLink);
            }
        }

        return result;
    }

    _reportAnyErrors();

    return /** @type {csNode} */ Object.freeze({
        "csType": 'node',
        "id": coreNode.uid,
        "getUid": getUid,
        "getCreatedTimestamp": getCreatedTimestamp,
        "getCreatedUser": getCreatedUser,
        "getType": getType,
        "getTypeName": getTypeName,
        "isEmpty": isEmpty,
        "isFull": isFull,
        "isSpecial": isSpecial,
        "isExpanded": isExpanded,
        "isExpandedAsTable": isExpandedAsTable,
        "isExpandedAsCustom": isExpandedAsCustom,
        "isSelected": isSelected,
        "isHidden": isHidden,
        "isUnknownType": isUnknownType,
        "getPos": getPos,
        "setPos": setPos,
        "getLabel": wrappedData.getLabel,
        "getFullLabel": getFullLabel,
        "setLabel": wrappedData.setLabel,
        "getIcon": getIcon,
        "getNodeSize": getNodeSize,
        "getShowType": getShowType,
        "setShowType": setShowType,
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
        "addLink": addLink,
        "deleteLink": deleteLink,
        "listAllLinks": listAllLinks,
        "listOutgoingLinks": listOutgoingLinks,
        "listIncomingLinks": listIncomingLinks,
        "listBidirectionalLinks": listBiDirectionalLinks,
        "isLinkedTo": isLinkedTo,
        "switchType": switchType,
        "removeType": removeType,
        "expandAsTable": expandAsTable,
        "expandAsCustom": expandAsCustom,
        "collapse": collapse,
        "expandOrCollapse": expandOrCollapse,
        "switchToEmpty": switchToEmpty,
        "switchToFull": switchToFull,
        "select": select,
        "deselect": deselect,
        "selectOrDeselect": selectOrDeselect,
        "show": show,
        "hide": hide,
        "showOrHide": showOrHide,
        "export": _export,
        "_delete": _delete,
        "_addOutgoingLink": _addOutgoingLink,
        "_addIncomingLink": _addIncomingLink,
        "_relinkType": _relinkType,
        "_errors": _errors
    });
}
