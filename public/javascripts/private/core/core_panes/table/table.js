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
 * @file Defines the core table pane.
 *
 * @author Dave Braines
 **/

import {tableTemplate} from "./templates/tableTemplate.js";
import {formatDateTime} from "/javascripts/private/util/timing.js";
import {getPaneElement} from "/javascripts/private/ui/tabs.js";
import {createHtmlUsing} from "/javascripts/private/util/dom.js";
import {getProject} from "/javascripts/interface/data.js";
import {findOnCanvas} from "/javascripts/private/core/core_panes/canvas/select.js";
import {isUrl, stripHtml} from "/javascripts/private/util/misc.js";
import {saveActionMisc} from "/javascripts/private/csData/change/csDataChanges.js";

const DEFAULTS = {
    "MAXLENGTH": false,
    "MAXLENGTH_VAL": 1000,
    "PLAINTEXT": true
}

/**
 * The standard definition for this pane.
 *
 * @type {csPaneDefinition}
 */
export const config = {
    "paneName": 'Table',
    "callbacks": {
        "clear": cbClear,
        "render": cbRender
    }
};

function cbClear() {
    cbRender();
}

function cbRender(filter, plainText, maxLength) {
    let elem = getPaneElement(config.paneName);

    if (elem) {
        let thisProject = getProject();

        if (thisProject) {
            createHtmlUsing(elem, tableTemplate, createConfigForTablePane(thisProject, filter, plainText, maxLength));
        }
    }
}

/**
 * Create the configuration for this table pane.
 *
 * @return {csTemplateConfig}       the template configuration.
 */
function createConfigForTablePane(project, filter, plainText, maxLength) {
    let mlc;
    let mlv;
    let pt;
    let selFilter;

    if (maxLength !== undefined) {
        mlc = maxLength.checked;
        mlv = maxLength.length;
    } else {
        mlc = DEFAULTS.MAXLENGTH;
        mlv = DEFAULTS.MAXLENGTH_VAL;
    }

    if (plainText !== undefined) {
        pt = plainText;
    } else {
        pt = DEFAULTS.PLAINTEXT;
    }

    if (filter !== undefined) {
        selFilter = filter;
    } else {
        selFilter = 'all';
    }

    let config = {
        "html": {
            "typeCounts": configListTypeCounts(project, selFilter),
            "maxLength": mlv,
            "checkedPlainText": pt,
            "checkedMaxLength": mlc,
            "thisFilter": selFilter,
            "nodes": {}     //populated by configListNodes
        },
        "events": []        //populated by configListNodes
    };

    configListNodes(project, config);

    config.events.push({ "elemId": 'cs-table-filter-select', "event": 'change', "function": actionChangedFilter });
    config.events.push({ "elemId": 'cs-table-plain-text', "event": 'change', "function": actionChangedPlainText });

    if (config.html.checkedPlainText) {
        config.events.push({ "elemId": 'cs-table-max-length-check', "event": 'change', "function": actionChangedMaxLengthChecked });

        if (config.html.checkedMaxLength) {
            config.events.push({ "elemId": 'cs-table-max-length', "event": 'keyup', "function": actionChangedMaxLength });
        }
    }

    return config;
}

function configListTypeCounts(project, selFilter) {
    let typeCounts = {
        "all": { "count": 0 }
    };

    for (let thisNode of project.listNodes()) {
        if (!typeCounts[thisNode.getTypeName()]) {
            typeCounts[thisNode.getTypeName()] = { "count": 0 };

            if (thisNode.getTypeName() === selFilter) {
                typeCounts[thisNode.getTypeName()].selected = true;
            }
        }

        ++typeCounts[thisNode.getTypeName()].count;
        ++typeCounts.all.count;
    }

    return typeCounts;
}

function configListNodes(project, config) {
    let typeName;
    let pos = 1;

    if (config.html.thisFilter && (config.html.thisFilter !== 'all')) {
        typeName = config.html.thisFilter;
    }

    for (let thisNode of project.listNodes()) {
        let addNode = false;

        if (typeName) {
            if (typeName === thisNode.getTypeName()) {
                addNode = true;
            }
        } else {
            // there is no typeName, so this is for 'all' nodes
            addNode = true;
        }

        if (addNode) {
            let nodeType = thisNode.getType();
            let properties = dataFor(thisNode, config);
            let relations = relationsFor(thisNode, config);
            let hasRelProps = false;

            for (let rel of relations) {
                if (rel.propList) {
                    hasRelProps = true;
                }
            }

            config.html.nodes[pos++] = {
                "uid": thisNode.getUid(),
                "created": formatDateTime(new Date(thisNode.getCreatedTimestamp())),
                "user": thisNode.getCreatedUser(),
                "label": trimToMaxLength(thisNode.getLabel(), config),
                "typeName": nodeType.getId(),
                "nodeClass": colorClassFor(nodeType),
                "icon": nodeType.getIcon(),
                "hasProperties": (properties.data.length > 0),
                "data": properties.data,
                "hasRelations": (relations.length > 0),
                "hasRelationProperties": hasRelProps,
                "relations": relations
            };

            config.events.push({ "elemId": `node-${thisNode.getUid()}`, "event": 'click', "function": function() { actionFindOnCanvas(thisNode); } });

            for (let event of properties.events) {
                config.events.push({ "elemId": event.elemId, "event": 'click', "function": function() { actionOpenLink(event.url); } });
            }
        }
    }
}

function actionFindOnCanvas(thisNode) {
    saveActionMisc('table:findOnCanvas', null, { "node": thisNode.getUid() });

    findOnCanvas(thisNode);
}

function actionOpenLink(url) {
    saveActionMisc('table:openLink', null, { "url": url });

    window.open(url, '_blank').focus();
}

function actionChangedFilter() {
    let filter = getSelectedFilter();

    saveActionMisc('table:changeFilter', null, { "filter": filter });

    redrawPane();
}

function actionChangedPlainText() {
    let plainText = getPlainText();

    saveActionMisc('table:changePlainText', null, { "plainText": plainText });

    redrawPane();
}

function actionChangedMaxLengthChecked() {
    let maxLength = getMaxLength();

    saveActionMisc('table:changeMaxLengthFlag', null, { "maxLength": maxLength });

    redrawPane();
}

function actionChangedMaxLength() {
    let maxLength = getMaxLength();

    saveActionMisc('table:changeMaxLength', null, { "maxLength": maxLength });

    redrawPane();
}

function redrawPane() {
    let filter = getSelectedFilter();
    let plainText = getPlainText();
    let maxLength = getMaxLength();

    cbRender(filter, plainText, maxLength);
}

function getSelectedFilter() {
    let e = document.getElementById('cs-table-filter-select');
    let result;

    if (e) {
        result = e.value;
    }

    return result;
}

function getPlainText() {
    let e = document.getElementById('cs-table-plain-text');
    let result = false;

    if (e) {
        result = e.checked;
    }

    return result;
}

function getMaxLength() {
    let e1 = document.getElementById('cs-table-max-length-check');
    let e2 = document.getElementById('cs-table-max-length');
    let result = {
        "checked": false,
        "length": DEFAULTS.MAXLENGTH_VAL
    };

    if (e1) {
        result.checked = e1.checked;
    }

    if (e2) {
        result.length = parseInt(e2.value);

        if (isNaN(result.length) || result.length < 5) {
            result.length = DEFAULTS.MAXLENGTH_VAL;
        }
    }

    return result;
}

function colorClassFor(nodeType) {
    let className = '';
    let icon = nodeType.getIcon();

    if (icon.color) {
        className = `cs-node-${icon.color}`;
    }

    return className;
}

function dataFor(tgtNode, config) {
    let data = [];
    let events = [];

    for (let [propName, val] of Object.entries(tgtNode.listProperties())) {
        let thisProp = {
            "propName": propName
        };

        let propVal;

        if (val) {
            propVal = val.value;
        }

        if (config.html.checkedPlainText) {
            thisProp.propVal = trimToMaxLength(stripHtml(propVal), config);
        } else {
            thisProp.propVal = trimToMaxLength(propVal, config);
        }

        if (isUrl(propVal)) {
            thisProp.isUrl = true;
            thisProp.fullUrl = propVal;
            thisProp.elemId = `cs-table-${tgtNode.getUid()}-${propName}`;
            events.push({ "elemId": `cs-table-${tgtNode.getUid()}-${propName}`, "url": propVal });
        }
        data.push(thisProp);
    }

    return { "data": data, "events": events };
}

function trimToMaxLength(textVal, config) {
    let result = textVal;

    if (config.html.checkedMaxLength) {
        //If applying maxLength then the content must be converted to plain text
        let plainVal = stripHtml(textVal);

        if (plainVal.length > config.html.maxLength) {
            result = plainVal.substring(0, config.html.maxLength) + '...';
        }
    }

    return result;
}

function relationsFor(tgtNode, config) {
    let relations = [];

    for (let thisRel of tgtNode.listOutgoingLinks()) {
        let otherUid;
        let otherLabel;

        if (thisRel.getTargetNode()) {
            otherUid = thisRel.getTargetNode().getUid();
            otherLabel = thisRel.getTargetNode().getLabel();
        } else {
            otherUid = '';
            otherLabel = '???';
        }

        relations.push({
            "uid": thisRel.getUid(),
            "outward": true,
            "label": trimToMaxLength(thisRel.getLabel() || '(no label)', config),
            "otherUid": otherUid,
            "thisNode": trimToMaxLength(thisRel.getSourceNode().getLabel(), config) || thisRel.getSourceNode().getUid(),
            "otherNode": trimToMaxLength(otherLabel, config) || thisRel.getTargetNode().getUid(),
            "propList": listPropertiesFor(thisRel)
        });

        config.events.push({ "elemId": `link-${thisRel.getUid()}`, "event": 'click', "function": function() { actionFindOnCanvas(thisRel); } });

        if (otherUid) {
            config.events.push({ "elemId": `link-${thisRel.getUid()}-${otherUid}`, "event": 'click', "function": function() { actionFindOnCanvas(thisRel.getTargetNode()); } });
        }
    }

    for (let thisRel of tgtNode.listIncomingLinks()) {
        relations.push({
            "uid": thisRel.getUid(),
            "inward": true,
            "label": trimToMaxLength(thisRel.getLabel() || '(no label)', config),
            "otherUid": thisRel.getSourceNode().getUid(),
            "thisNode": trimToMaxLength(thisRel.getTargetNode().getLabel(), config) || thisRel.getTargetNode().getUid(),
            "otherNode": trimToMaxLength(thisRel.getSourceNode().getLabel(), config) || thisRel.getSourceNode().getUid(),
            "propList": listPropertiesFor(thisRel)
        });

        config.events.push({ "elemId": `link-${thisRel.getUid()}`, "event": 'click', "function": function() { actionFindOnCanvas(thisRel); } });
        config.events.push({ "elemId": `link-${thisRel.getUid()}-${thisRel.getSourceNode().getUid()}`, "event": 'click', "function": function() { actionFindOnCanvas(thisRel.getSourceNode()); } });
    }

    for (let thisRel of tgtNode.listBidirectionalLinks()) {
        let firstNode = thisRel.getSourceNode();
        let secondNode = thisRel.getTargetNode();

        if (firstNode !== tgtNode) {
            secondNode = firstNode;
            firstNode = tgtNode;
        }

        relations.push({
            "uid": thisRel.getUid(),
            "inward": true,
            "label": trimToMaxLength(thisRel.getLabel() || '(no label)', config),
            "otherUid": thisRel.getSourceNode().getUid(),
            "thisNode": trimToMaxLength(secondNode.getLabel(), config) || secondNode.getUid(),
            "otherNode": trimToMaxLength(firstNode.getLabel(), config) || firstNode.getUid(),
            "propList": listPropertiesFor(thisRel),
            "bidirectional": true
        });

        config.events.push({ "elemId": `link-${thisRel.getUid()}`, "event": 'click', "function": function() { actionFindOnCanvas(thisRel); } });
        config.events.push({ "elemId": `link-${thisRel.getUid()}-${thisRel.getSourceNode().getUid()}`, "event": 'click', "function": function() { actionFindOnCanvas(thisRel.getSourceNode()); } });
    }

    return relations;
}

function listPropertiesFor(rel) {
    let result;

    //TODO: Improve this code

    if (Object.keys(rel.listProperties()).length > 0) {
        result = rel.listProperties();
    }

    return result;
}
